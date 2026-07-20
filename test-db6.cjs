const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  for (let i = 6; i <= 15; i++) {
    const { data } = await supabase.from('Poderes').select('Nome, Classe, "Pre-Requisitos"').eq('Pre_Codigo', i).limit(1);
    if (data && data.length > 0) console.log("Regra " + i + ": " + data[0].Nome + " (" + data[0].Classe + ") - " + data[0]['Pre-Requisitos']);
    else console.log("Regra " + i + ": NENHUM");
  }
}
run();
