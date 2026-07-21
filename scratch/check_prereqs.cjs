const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  // Buscar poderes com Pre_Regra preenchido
  const { data, error } = await supabase.from('PoderesParanormais').select('Nome_Poder_Paranormal, Pre_Regra, Pre_Requisitos_Poder_Paranormal, Elemento_Poder_Paranormal').not('Pre_Regra', 'is', null);
  if (error) console.error('Erro:', error);
  if (data) {
    console.log('Poderes com Pre_Regra:', data.length);
    data.forEach(d => console.log(d.Nome_Poder_Paranormal, '| Pre_Regra:', d.Pre_Regra, '| Prereqs:', d.Pre_Requisitos_Poder_Paranormal));
  }
  
  // Buscar TODOS os poderes com Pre_Requisitos_Poder_Paranormal preenchido
  const { data: data2 } = await supabase.from('PoderesParanormais').select('Nome_Poder_Paranormal, Pre_Regra, Pre_Requisitos_Poder_Paranormal').not('Pre_Requisitos_Poder_Paranormal', 'is', null);
  console.log('\n--- Poderes com texto de Pre_Requisitos ---');
  if (data2) {
    console.log('Total:', data2.length);
    data2.forEach(d => console.log(d.Nome_Poder_Paranormal, '| Pre_Regra:', d.Pre_Regra, '| Prereqs:', d.Pre_Requisitos_Poder_Paranormal));
  }
}
run();
