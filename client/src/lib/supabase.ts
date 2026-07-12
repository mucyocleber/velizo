import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ukwrryamwqaevgqnchfq.supabase.co';
// Fallback to a dummy key during Next.js static build/prerender to prevent build crashes
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn(
    '⚠️ Warning: NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined in your environment variables. Using a fallback key for build compilation.'
  );
}

// Client-side Supabase instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
