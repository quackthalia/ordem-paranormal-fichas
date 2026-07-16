const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('Poderes').select('Nome, Pre_Codigo, \"Pre-Requisitos\"').ilike('Nome', '%Armamento Pesado%');
  if (error) console.error(error);
  console.log(data);
}
run();
