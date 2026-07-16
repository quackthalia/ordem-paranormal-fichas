import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load env vars
dotenv.config({ path: resolve(__dirname, '../.env.local') });
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  console.log('Fetching Pre Requisitos...');
  const { data, error } = await supabase.from('Pre Requisitos').select('*').limit(10);
  
  if (error) {
    console.error('Error fetching table:', error);
    
    // Maybe the table name is different? Let's try without space
    const { data: d2, error: e2 } = await supabase.from('Pre_Requisitos').select('*').limit(10);
    if (!e2) {
      console.log('Found as Pre_Requisitos:', d2);
    }
    return;
  }
  
  console.log('Data from Pre Requisitos:');
  console.log(JSON.stringify(data, null, 2));
}

checkTable();
