const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('Poderes').select('Nome, Pre_Codigo, \"Pre-Requisitos\"').in('Pre_Codigo', [6, 7, 8, 9, 10]);
  if (error) console.error(error);
  console.log(data);
}
run();
