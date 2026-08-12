const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const tableNames = ['Itens Amaldiçoados', 'Itens_Amaldicoados', 'Itens Amaldicoados', 'ItensAmaldicoados'];
  for (const name of tableNames) {
    const { data, error } = await supabase.from(name).select('*').limit(1);
    if (error) {
      console.log(`Table ${name} error: ${error.message}`);
    } else {
      console.log(`Table ${name} success! Rows: ${data.length}`);
    }
  }
}

check();
