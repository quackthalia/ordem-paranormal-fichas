import { createClient } from '@supabase/supabase-js';

// Cole aqui o link que você pegou na aba Data API:
const SUPABASE_URL = 'https://duoesappjstgejlwxkyp.supabase.co'; 

// Cole aqui aquela Publishable key enorme do seu print:
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1b2VzYXBwanN0Z2VqbHd4a3lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNTkwMzcsImV4cCI6MjA5ODYzNTAzN30.6r1GAxv420BfB1YgBmDzyyh4sBXYYIkVTSDhkqLuQ2w'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)