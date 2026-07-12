import dotenv from 'dotenv';
import path from 'path';

// Resolve path to the root .env file relative to this config file
// This file is in server/src/config/env.ts, so root is '../../../.env'
const envPath = path.resolve(__dirname, '../../../.env');

dotenv.config({ path: envPath });

console.log('✅ Environment variables initialized.');
