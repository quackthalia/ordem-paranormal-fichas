import { createClient } from '@supabase/supabase-js';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('Poderes')
    .select('*')
    .ilike('Pre-Requisitos', '%Conhecimento 1%45%%');
    
  if (error) console.error(error);
  else console.log('Poderes:', JSON.stringify(data, null, 2));

  const { data: d2, error: e2 } = await supabase
    .from('PoderesParanormais')
    .select('*')
    .ilike('Pre_Requisitos_Poder_Paranormal', '%Conhecimento 1%45%%');
    
  if (e2) console.error(e2);
  else console.log('PoderesParanormais:', JSON.stringify(d2, null, 2));
}

run();
