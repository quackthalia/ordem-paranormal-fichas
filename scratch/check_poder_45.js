import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('Poderes')
    .select('*')
    .ilike('PreRequisitos', '%Conhecimento 1%45%%Ocultismo%');
    
  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));

  // let's also search just by name "Especialista em Elemento"
  const { data: d2, error: e2 } = await supabase
    .from('Poderes')
    .select('*')
    .ilike('Nome', '%Especialista em Elemento%');
  
  if (e2) console.error(e2);
  else console.log("Especialista em Elemento:", JSON.stringify(d2, null, 2));
}

run();
