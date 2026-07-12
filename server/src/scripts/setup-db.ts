import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env variables
dotenv.config({ path: '../.env' });

async function setupDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL is not defined in the environment variables.');
    process.exit(1);
  }

  // Create PG Client
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false // Required for Supabase SSL connection
    }
  });

  try {
    console.log('⏳ Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('✅ Connected successfully.');

    // Path to schema.sql
    const schemaPath = path.join(__dirname, '../../../database/schema.sql');
    console.log(`📖 Reading schema file from: ${schemaPath}`);
    const sqlSchema = fs.readFileSync(schemaPath, 'utf8');

    console.log('⚙️ Executing schema migration...');
    await client.query(sqlSchema);
    console.log('🚀 Database schema applied successfully! Tables, triggers, and policies created.');

  } catch (error) {
    console.error('❌ Database migration failed:', error);
  } finally {
    await client.end();
    console.log('🔌 Connection closed.');
  }
}

setupDatabase();
