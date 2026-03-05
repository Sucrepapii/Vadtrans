require("dotenv").config();
const { sequelize } = require("./src/config/database");
const Booking = require("./src/models/Booking");

async function testSum() {
  try {
    await sequelize.authenticate();
    console.log("Connected.");

    // 1. Get plain sum
    const sumResult = await Booking.sum("totalAmount", {
      where: { paymentStatus: "paid" },
    });
    console.log("Direct Booking.sum():", sumResult);

    // 2. See what findAll returns
    const revenueData = await Booking.findAll({
      where: { paymentStatus: "paid" },
      attributes: [
        [sequelize.fn("SUM", sequelize.col("totalAmount")), "total"],
      ],
      raw: true,
    });
    console.log("findAll aggregate raw:", revenueData);

    // 3. See what findAll returns WITHOUT raw
    const revenueDataInstances = await Booking.findAll({
      where: { paymentStatus: "paid" },
      attributes: [
        [sequelize.fn("SUM", sequelize.col("totalAmount")), "total"],
      ],
    });
    console.log(
      "findAll aggregate instances:",
      revenueDataInstances.map((r) => r.dataValues),
    );

    // 4. Sample bookings
    const bookings = await Booking.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      attributes: ["id", "totalAmount", "paymentStatus"],
    });
    console.log(
      "Recent bookings:",
      bookings.map((b) => b.toJSON()),
    );
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

testSum();
