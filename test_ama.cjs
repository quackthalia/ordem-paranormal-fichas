const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

// We need to use the actual URL from the `.env` which might be plain text
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('Itens Amaldiçoados').select('*');
  if (error) {
    console.error("ERRO SUPABASE:", error);
  } else {
    console.log("SUCESSO, itens encontrados:", data.length);
  }
}
run();
