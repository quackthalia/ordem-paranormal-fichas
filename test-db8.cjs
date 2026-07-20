const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data: pData } = await supabase.from('Poderes_Paranormais').select('*').ilike('Nome', '%Casca Grossa%');
  console.log("Paranormais:", pData);
  
  const { data: t10 } = await supabase.from('Trilhas').select('Nome_Trilha, Nome_Habilidade_10').ilike('Nome_Habilidade_10', '%Casca Grossa%');
  const { data: t40 } = await supabase.from('Trilhas').select('Nome_Trilha, Nome_Habilidade_40').ilike('Nome_Habilidade_40', '%Casca Grossa%');
  const { data: t65 } = await supabase.from('Trilhas').select('Nome_Trilha, Nome_Habilidade_65').ilike('Nome_Habilidade_65', '%Casca Grossa%');
  const { data: t99 } = await supabase.from('Trilhas').select('Nome_Trilha, Nome_Habilidade_99').ilike('Nome_Habilidade_99', '%Casca Grossa%');
  
  console.log("Trilhas:", t10, t40, t65, t99);
}
run();
