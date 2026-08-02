const { Client } = require("pg");
const dotenv = require("dotenv");

// Load environments
dotenv.config();

const SOURCE_URL = process.env.SOURCE_DATABASE_URL || process.argv[2];
const DEST_URL = process.env.DESTINATION_DATABASE_URL || process.argv[3];

if (!SOURCE_URL || !DEST_URL) {
  console.error("❌ Error: Both SOURCE_DATABASE_URL and DESTINATION_DATABASE_URL must be provided.");
  console.log("\nUsage:");
  console.log("  node migrate-db.js \"<source_postgres_url>\" \"<destination_postgres_url>\"");
  console.log("\nAlternatively, set them as environment variables:");
  console.log("  SOURCE_DATABASE_URL");
  console.log("  DESTINATION_DATABASE_URL");
  process.exit(1);
}

const runMigration = async () => {
  console.log("🔌 Connecting to databases...");
  const sourceClient = new Client({
    connectionString: SOURCE_URL,
    ssl: { rejectUnauthorized: false }
  });
  const destClient = new Client({
    connectionString: DEST_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await sourceClient.connect();
    console.log("✅ Connected to SOURCE database");
    await destClient.connect();
    console.log("✅ Connected to DESTINATION database");

    // Get all user tables in public schema
    const tablesRes = await sourceClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const tables = tablesRes.rows.map(r => r.table_name);
    console.log(`📋 Found ${tables.length} tables to migrate: ${tables.join(", ")}`);

    // Temporarily bypass trigger checking to prevent foreign key errors during chunked inserts
    console.log("⚙️ Temporarily disabling foreign key triggers on destination...");
    await destClient.query("SET session_replication_role = replica;");

    for (const table of tables) {
      console.log(`\n⏳ Migrating table: "${table}"...`);

      // 1. Fetch data from source
      const dataRes = await sourceClient.query(`SELECT * FROM "${table}"`);
      const rows = dataRes.rows;
      console.log(`   Fetched ${rows.length} rows from source.`);

      // 2. Truncate destination table
      console.log(`   Clearing destination table "${table}"...`);
      await destClient.query(`TRUNCATE TABLE "${table}" CASCADE`);

      if (rows.length === 0) {
        console.log(`   Table is empty, skipping insert.`);
        continue;
      }

      // 3. Prepare bulk insert
      const columns = Object.keys(rows[0]);
      const columnsStr = columns.map(c => `"${c}"`).join(", ");
      
      // Insert in chunks to avoid Postgres query parameter limits (max 65535 parameters)
      const chunkSize = 100;
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        const valuePlaceholders = [];
        const flatValues = [];

        chunk.forEach((row) => {
          const rowPlaceholders = columns.map((col) => {
            flatValues.push(row[col]);
            return `$${flatValues.length}`;
          });
          valuePlaceholders.push(`(${rowPlaceholders.join(", ")})`);
        });

        const insertQuery = `INSERT INTO "${table}" (${columnsStr}) VALUES ${valuePlaceholders.join(", ")}`;
        await destClient.query(insertQuery, flatValues);
      }
      console.log(`   Successfully imported ${rows.length} rows.`);

      // 4. Reset auto-increment primary key sequences to prevent duplicate ID errors on new entries
      if (columns.includes("id")) {
        try {
          const seqCheck = await destClient.query(`
            SELECT pg_get_serial_sequence('"${table}"', 'id') as seq
          `);
          if (seqCheck.rows[0] && seqCheck.rows[0].seq) {
            console.log(`   Resetting auto-increment sequence...`);
            await destClient.query(`
              SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE(max(id), 1), true) FROM "${table}"
            `);
          }
        } catch (seqErr) {
          console.log(`   ⚠️ Sequence Reset Note: ${seqErr.message}`);
        }
      }
    }

    console.log("\n⚙️ Re-enabling triggers on destination...");
    await destClient.query("SET session_replication_role = default;");
    console.log("🎉 Database migration completed successfully!");

  } catch (err) {
    console.error("❌ Migration failed:", err);
    try {
      await destClient.query("SET session_replication_role = default;");
    } catch (_) {}
  } finally {
    await sourceClient.end();
    await destClient.end();
  }
};

runMigration();
