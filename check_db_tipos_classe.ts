import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
dotenv.config({ path: path.resolve('./.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from('Poderes')
    .select('Classe, Tipo');

  if (error) {
    console.error(error);
  } else {
    const tiposPorClasse = {
      'Combatente': new Set(),
      'Especialista': new Set(),
      'Ocultista': new Set(),
    };
    
    data.forEach(p => {
      if (tiposPorClasse[p.Classe]) {
        tiposPorClasse[p.Classe].add(p.Tipo);
      }
    });
    
    console.log('Combatente:', Array.from(tiposPorClasse['Combatente']));
    console.log('Especialista:', Array.from(tiposPorClasse['Especialista']));
    console.log('Ocultista:', Array.from(tiposPorClasse['Ocultista']));
  }
}

check();
