process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const tableNames = ['Itens Amaldiçoados', 'Itens_Amaldicoados', 'Itens Amaldicoados', 'Bases - Itens Amaldicoados'];
  for (const name of tableNames) {
    const { data, error } = await supabase.from(name).select('*').limit(1);
    if (error) {
      console.log(`Table '${name}' error:`, error.message);
    } else {
      console.log(`Table '${name}' success! Rows fetched:`, data.length);
      if (data.length > 0) {
        console.log(`First item:`, data[0].Nome_Ama);
      }
    }
  }
}

check();
