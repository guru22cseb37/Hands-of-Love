import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Guard against missing vars in case user hasn't updated them yet
const isConfigured = supabaseUrl && supabaseUrl !== 'YOUR_SUPABASE_PROJECT_URL' && 
                    supabaseAnonKey && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!isConfigured) {
  console.warn('Supabase client is not initialized. Please update the .env file with your actual project URL and anon key.');
}
