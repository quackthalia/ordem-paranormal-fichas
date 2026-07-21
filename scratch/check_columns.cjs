const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('PoderesParanormais').select('*').limit(3);
  if (error) console.error('Erro:', error);
  if (data && data.length > 0) {
    console.log('Colunas:', Object.keys(data[0]));
    data.forEach(d => console.log(JSON.stringify(d, null, 2)));
  }
}
run();
