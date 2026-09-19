import React, { useState, useEffect } from "react";
import { FaMoneyBillWave, FaSpinner, FaHistory } from "react-icons/fa";
import { toast } from "react-toastify";
import Card from "../Card";
import api from "../../services/api";

const EarningsTab = () => {
  const [earnings, setEarnings] = useState({
    pendingBalance: 0,
    totalEarnings: 0,
    pendingBookingsCount: 0,
    totalBookingsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/earnings/my-earnings");
      if (response.data.success) {
        setEarnings(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching earnings:", error);
      toast.error("Failed to load earnings data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="flex flex-col items-center justify-center py-12">
        <FaSpinner className="animate-spin text-3xl text-primary mb-4" />
        <p className="text-neutral-500">Loading your earnings...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Balance */}
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/20 border-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <FaMoneyBillWave size={80} />
          </div>
          <div className="relative z-10">
            <h3 className="text-green-50 font-medium mb-1 flex items-center gap-2">
              <FaMoneyBillWave /> Pending Balance
            </h3>
            <p className="text-4xl font-bold mb-2">
              ₦{earnings.pendingBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-green-100 text-sm">
              From {earnings.pendingBookingsCount} unpaid bookings
            </p>
            <p className="text-green-50 text-xs mt-4 italic opacity-80">
              * This amount will be paid out by Vadtrans admin.
            </p>
          </div>
        </Card>

        {/* Total Earnings */}
        <Card className="bg-white border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-primary">
            <FaHistory size={80} />
          </div>
          <div className="relative z-10">
            <h3 className="text-gray-500 font-medium mb-1 flex items-center gap-2">
              <FaHistory /> Total All-time Earnings
            </h3>
            <p className="text-4xl font-bold text-gray-900 mb-2">
              ₦{earnings.totalEarnings?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-gray-400 text-sm">
              Across {earnings.totalBookingsCount} total paid bookings
            </p>
          </div>
        </Card>
      </div>
      
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <FaMoneyBillWave className="text-emerald-600 text-lg" />
          <h3 className="font-bold text-gray-800 text-lg">Automated Marketplace Payouts</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">1. Instant Booking Escrow</span>
            <p className="text-xs text-blue-900 mt-1 leading-relaxed">
              When a passenger pays, funds are securely held in platform escrow. Gross amount, Paystack processing fees, and 10% platform commission are recorded.
            </p>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">2. Trip Completion</span>
            <p className="text-xs text-amber-900 mt-1 leading-relaxed">
              Once you complete the trip or private ride, your net payable balance becomes eligible for immediate automated disbursement.
            </p>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">3. Direct NUBAN Transfer</span>
            <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
              Vadtrans automated transfer engine sends your money directly to your verified bank account without manual delays.
            </p>
          </div>
        </div>
        <p className="text-gray-500 text-xs leading-relaxed">
          * Please ensure your bank account details under the <strong>Profile</strong> tab are verified with Paystack to avoid transfer delays.
        </p>
      </Card>
    </div>
  );
};

export default EarningsTab;
