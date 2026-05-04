const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
  logging: false
});

sequelize.query(`UPDATE "Users" SET "isVerified" = 1 WHERE email = 'test1@test.com'`)
  .then(() => {
    console.log('Verified');
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
