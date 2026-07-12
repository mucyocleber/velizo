import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('\n❌ ERROR: Supabase configuration keys are missing in your .env file!');
  console.error('Please open the root .env file and make sure these are filled:');
  console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY\n');
  process.exit(1);
}

// Admin client — full access, used server-side only
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Public client — respects Row Level Security (RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabaseUrl, supabaseAnonKey };
