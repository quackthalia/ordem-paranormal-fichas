import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
// Desabilitar rejeição de certificado local (só pra testes locais via node)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('PoderesParanormais').select('*').limit(2);
  if (error) {
    console.error(error);
  } else {
    console.log(data);
  }
}
run();
