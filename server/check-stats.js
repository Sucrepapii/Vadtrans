const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
  logging: false
});

async function main() {
  try {
    const [tables] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table';");
    console.log("Tables:", tables.map(t => t.name));

    for (const table of tables) {
      const name = table.name;
      if (name.startsWith('sqlite_')) continue;
      const [[{ count }]] = await sequelize.query(`SELECT COUNT(*) as count FROM "${name}"`);
      console.log(`Table: ${name} -> Count: ${count}`);
      if (count > 0) {
        const [rows] = await sequelize.query(`SELECT * FROM "${name}" LIMIT 2`);
        console.log(`Sample from ${name}:`, rows);
      }
    }
  } catch (error) {
    console.error("Error checking database:", error);
  } finally {
    process.exit(0);
  }
}

main();
