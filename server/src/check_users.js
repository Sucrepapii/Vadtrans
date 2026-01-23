const { sequelize } = require("./config/database");
const User = require("./models/User");

const checkUsers = async () => {
  try {
    await sequelize.authenticate();

    const users = await User.findAll({
      attributes: ["id", "email", "name", "isVerified"],
    });

    console.log("USERS_LIST_START");
    users.forEach((u) => {
      console.log(`${u.id}: ${u.email} (Verified: ${u.isVerified})`);
    });
    console.log("USERS_LIST_END");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // await sequelize.close(); // process.exit will handle it
  }
};

checkUsers();
