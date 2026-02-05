
import { createClient } from '@supabase/supabase-js';

// Credentials provided for the Fabrino project
const SUPABASE_URL = 'https://qqynhpkybzwzqdcufrza.supabase.co';
// Using the provided JWT anon public key
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxeW5ocGt5Ynp3enFkY3VmcnphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMDQ3ODQsImV4cCI6MjA4NTg4MDc4NH0.k-2Lq9dgmGytEHTXy4GqSwNJOzzfIVUGURhx5N-ppMU';

// Export a function to check if Supabase is configured
export const isSupabaseConfigured = () => !!SUPABASE_URL && !!SUPABASE_ANON_KEY;

// Initialize the client with the provided credentials
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
