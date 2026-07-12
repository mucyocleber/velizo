import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env variables
dotenv.config({ path: '../.env' });

async function updateDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL is not defined.');
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

    // Path to update_schema.sql
    const schemaPath = path.join(__dirname, '../../../database/update_schema.sql');
    console.log(`📖 Reading schema updates file from: ${schemaPath}`);
    const sqlSchema = fs.readFileSync(schemaPath, 'utf8');

    console.log('⚙️ Executing schema updates...');
    await client.query(sqlSchema);
    console.log('🚀 Database updates applied successfully! Admin profiles and triggers updated.');

  } catch (error) {
    console.error('❌ Database migration update failed:', error);
  } finally {
    await client.end();
    console.log('🔌 Connection closed.');
  }
}

updateDatabase();
