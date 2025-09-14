import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey ||
    supabaseUrl.trim() === '' || supabaseAnonKey.trim() === '') {
  console.error('Missing or invalid Supabase environment variables');
  module.exports = { supabase: null };
} else {
  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  module.exports = { supabase };
}