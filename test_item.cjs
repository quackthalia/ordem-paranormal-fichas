const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase
    .from('Itens')
    .select('*')
    .ilike('Nome_Item', '%Componentes%');
  console.log('Itens:', JSON.stringify(data, null, 2), error);
}
run();
