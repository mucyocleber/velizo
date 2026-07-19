import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env variables from root directory .env
dotenv.config({ path: path.join(__dirname, '../../../.env') });

async function applyStorageMigration() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL is not defined in .env');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('⏳ Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('✅ Connected successfully.');

    // Path to storage.sql
    const sqlPath = path.join(__dirname, '../../../database/storage.sql');
    console.log(`📖 Reading storage migration file from: ${sqlPath}`);
    let sqlContent = fs.readFileSync(sqlPath, 'utf8');
    // Strip BOM if present
    if (sqlContent.startsWith('\uFEFF')) {
      sqlContent = sqlContent.substring(1);
    }

    console.log('⚙️ Executing storage schema and policies migration...');
    await client.query(sqlContent);
    console.log('🚀 Storage buckets, columns, and security policies applied successfully!');

  } catch (error) {
    console.error('❌ Storage migration failed:', error);
  } finally {
    await client.end();
    console.log('🔌 Connection closed.');
  }
}

applyStorageMigration();
