const { createClient } = require('@supabase/supabase-js');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_API_KEY) {
  console.error('Supabase not configured: set SUPABASE_URL and SUPABASE_API_KEY.');
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);

module.exports = supabase;
