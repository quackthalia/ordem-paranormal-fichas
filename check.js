import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://duoesappjstgejlwxkyp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1b2VzYXBwanN0Z2VqbHd4a3lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNTkwMzcsImV4cCI6MjA5ODYzNTAzN30.6r1GAxv420BfB1YgBmDzyyh4sBXYYIkVTSDhkqLuQ2w');
async function run() {
  // Try getting one power to see the raw keys
  const { data } = await supabase.from('PoderesParanormais').select('*').ilike('Nome', '%aprender ritual%');
  console.log(JSON.stringify(data, null, 2));
}
run();
