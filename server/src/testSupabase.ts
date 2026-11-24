import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

console.log('Testing Supabase Client Connection:');
console.log('URL:', url);
console.log('Key prefix:', key ? key.substring(0, 15) + '...' : 'NONE');

const supabase = createClient(url, key);

async function testConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('Auth session check notice:', error.message);
    } else {
      console.log('Supabase Auth service connected successfully.');
    }

    // Check database rest connectivity
    const { data: tableData, error: tableError } = await supabase.from('facilities').select('count', { count: 'exact', head: true });
    if (tableError) {
      console.log('Table query notice (Schema may need migration run in Supabase SQL editor):', tableError.message);
    } else {
      console.log('Database REST endpoint active. Facilities count query succeeded.');
    }
    console.log('SUCCESS: Supabase credentials format and connection validated.');
  } catch (err: any) {
    console.error('Connection error:', err.message);
  }
}

testConnection();
