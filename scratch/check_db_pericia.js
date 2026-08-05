import { createClient } from '@supabase/supabase-js';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('Perícias')
    .select('*')
    .eq('Codigo_Pericia', 18);
    
  if (error) console.error(error);
  else console.log('Pericias 18:', JSON.stringify(data, null, 2));
}

run();
