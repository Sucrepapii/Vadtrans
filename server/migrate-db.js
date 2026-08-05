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
  process.exit(1);
}

const runMigration = async () => {
  let sourceClient, destClient;

  try {
    console.log("🔌 Connecting to SOURCE database (Railway)...");
    
    // Attempt SOURCE connection with SSL
    try {
      sourceClient = new Client({
        connectionString: SOURCE_URL,
        connectionTimeoutMillis: 5000, // 5 seconds timeout to prevent hanging
        ssl: { rejectUnauthorized: false }
      });
      await sourceClient.connect();
      console.log("✅ Connected to SOURCE database (with SSL)");
    } catch (sslErr) {
      console.log(`⚠️ SOURCE SSL connection failed: ${sslErr.message}. Retrying without SSL...`);
      if (sourceClient) {
        try { await sourceClient.end(); } catch (_) {}
      }
      sourceClient = new Client({
        connectionString: SOURCE_URL,
        connectionTimeoutMillis: 5000 // 5 seconds timeout
      });
      await sourceClient.connect();
      console.log("✅ Connected to SOURCE database (without SSL)");
    }

    console.log("🔌 Connecting to DESTINATION database (Render)...");
    
    // Attempt DESTINATION connection with SSL
    try {
      destClient = new Client({
        connectionString: DEST_URL,
        connectionTimeoutMillis: 5000, // 5 seconds timeout
        ssl: { rejectUnauthorized: false }
      });
      await destClient.connect();
      console.log("✅ Connected to DESTINATION database (with SSL)");
    } catch (sslErr) {
      console.log(`⚠️ DESTINATION SSL connection failed: ${sslErr.message}. Retrying without SSL...`);
      if (destClient) {
        try { await destClient.end(); } catch (_) {}
      }
      destClient = new Client({
        connectionString: DEST_URL,
        connectionTimeoutMillis: 5000 // 5 seconds timeout
      });
      await destClient.connect();
      console.log("✅ Connected to DESTINATION database (without SSL)");
    }

    // Get all user tables in public schema
    const tablesRes = await sourceClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const tables = tablesRes.rows.map(r => r.table_name);
    
    // Sort tables by dependency order to avoid foreign key constraint violations
    const preferredOrder = [
      "Users",
      "fares",
      "FAQs",
      "Trips",
      "Bookings",
      "PrivateRideRequests",
      "Shipments",
      "Notifications",
      "Reviews",
      "RideBids"
    ];
    tables.sort((a, b) => {
      let indexA = preferredOrder.indexOf(a);
      let indexB = preferredOrder.indexOf(b);
      if (indexA === -1) indexA = 999;
      if (indexB === -1) indexB = 999;
      return indexA - indexB;
    });

    console.log(`📋 Found ${tables.length} tables to migrate (sorted by dependency): ${tables.join(", ")}`);

    // Temporarily bypass trigger checking if permission is granted
    try {
      console.log("⚙️ Temporarily disabling foreign key triggers on destination...");
      await destClient.query("SET session_replication_role = replica;");
      console.log("✅ Triggers disabled successfully.");
    } catch (err) {
      console.log(`⚠️ Note: session_replication_role replica could not be set (${err.message}). Proceeding using dependency order.`);
    }

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

      // 3. Prepare bulk insert by mapping only columns that exist in BOTH databases
      const destColumnsRes = await destClient.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
      `, [table]);
      const destColumns = destColumnsRes.rows.map(r => r.column_name);

      const sourceColumns = Object.keys(rows[0]);
      const columns = sourceColumns.filter(c => destColumns.includes(c));
      const ignoredColumns = sourceColumns.filter(c => !destColumns.includes(c));
      
      if (ignoredColumns.length > 0) {
        console.log(`   ⚠️ Ignoring source columns not present in destination: ${ignoredColumns.join(", ")}`);
      }
      
      const columnsStr = columns.map(c => `"${c}"`).join(", ");
      
      // Insert in chunks to avoid Postgres query parameter limits (max 65535 parameters)
      const chunkSize = 100;
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        const valuePlaceholders = [];
        const flatValues = [];

        chunk.forEach((row) => {
          const rowPlaceholders = columns.map((col) => {
            let val = row[col];
            if (val !== null && typeof val === 'object' && !(val instanceof Date) && !Buffer.isBuffer(val)) {
              val = JSON.stringify(val);
            }
            flatValues.push(val);
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

    try {
      console.log("\n⚙️ Re-enabling triggers on destination...");
      await destClient.query("SET session_replication_role = default;");
    } catch (_) {}
    console.log("🎉 Database migration completed successfully!");

  } catch (err) {
    console.error("❌ Migration failed:", err);
    try {
      if (destClient) {
        await destClient.query("SET session_replication_role = default;");
      }
    } catch (_) {}
  } finally {
    if (sourceClient) await sourceClient.end();
    if (destClient) await destClient.end();
  }
};

runMigration();
