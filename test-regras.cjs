const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data } = await supabase
    .from('Poderes')
    .select('Nome, Pericia_Poder')
    .eq('Nome', 'Acrobático')
    .limit(1);
    
  console.log(data);
}

test();
