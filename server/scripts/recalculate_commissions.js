const { sequelize } = require('../src/config/database');
const Booking = require('../src/models/Booking');
const Trip = require('../src/models/Trip');
const PrivateRideRequest = require('../src/models/PrivateRideRequest');
const Payment = require('../src/models/Payment');
const ProviderPayable = require('../src/models/ProviderPayable');
const TransactionLedger = require('../src/models/TransactionLedger');
const { calculateMarketplaceSplit } = require('../src/utils/payoutService');
const { syncUnrecordedPayables } = require('../src/controllers/financeController');

const User = require('../src/models/User');
const Payout = require('../src/models/Payout');
const RideBid = require('../src/models/RideBid');
const Notification = require('../src/models/Notification');

// Ensure associations are loaded
const models = {
  User, Booking, Trip, PrivateRideRequest, Payment, ProviderPayable, TransactionLedger, Payout, RideBid, Notification
};
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

async function recalculate() {
  await sequelize.authenticate();
  console.log('DB connected. Syncing unrecorded first...');
  
  await syncUnrecordedPayables();

  console.log('Recalculating existing payments...');
  const payments = await Payment.findAll();
  for (let p of payments) {
    const isPrivate = !!p.privateRideId;
    const rate = isPrivate ? 0.20 : 0.05;
    
    // Recalculate split
    const split = calculateMarketplaceSplit(p.grossAmount, rate, p.gatewayFee);
    
    // Update Payment
    p.netAmount = split.netPayableAmount;
    await p.save();
    
    // Update ProviderPayable
    const payableCondition = p.privateRideId ? { privateRideId: p.privateRideId } : { bookingId: p.bookingId };
    const payable = await ProviderPayable.findOne({ where: payableCondition });
    if (payable) {
      payable.commissionRate = split.commissionRate;
      payable.commissionAmount = split.commissionAmount;
      payable.netPayableAmount = split.netPayableAmount;
      await payable.save();
    }
    
    // Update TransactionLedger (COMMISSION_REVENUE)
    const commLedger = await TransactionLedger.findOne({ where: { paymentId: p.id, entryType: 'COMMISSION_REVENUE' } });
    if (commLedger) {
      commLedger.amount = split.commissionAmount;
      commLedger.metadata = { commissionRate: split.commissionRate, commissionAmount: split.commissionAmount };
      commLedger.description = `Vadtrans ${rate * 100}% marketplace commission`;
      await commLedger.save();
    }
    
    // Update TransactionLedger (PAYABLE_ESCROW)
    const escrowLedger = await TransactionLedger.findOne({ where: { paymentId: p.id, entryType: 'PAYABLE_ESCROW' } });
    if (escrowLedger) {
      escrowLedger.amount = split.netPayableAmount;
      await escrowLedger.save();
    }
    
    if (isPrivate) {
      const ride = await PrivateRideRequest.findByPk(p.privateRideId);
      if (ride) {
        ride.commissionAmount = split.commissionAmount;
        await ride.save();
      }
    }
  }
  
  console.log(`Successfully recalculated ${payments.length} payments.`);
  process.exit(0);
}

recalculate().catch(e => {
  console.error(e);
  process.exit(1);
});
