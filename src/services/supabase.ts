import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('=== DIAGNÓSTICO SUPABASE ===');
console.log('URL:', supabaseUrl);
console.log('KEY:', supabaseKey ? 'EXISTE (' + supabaseKey.substring(0, 20) + '...)' : 'NÃO EXISTE');
console.log('============================');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);