import { createClient } from '@supabase/supabase-js'

// Mock environment variables for testing
const supabaseUrl = 'https://test.supabase.co'
const supabaseAnonKey = 'test-anon-key'

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)