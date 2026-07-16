const url = 'https://duoesappjstgejlwxkyp.supabase.co/rest/v1/Pre%20Requisitos?select=*&limit=10';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1b2VzYXBwanN0Z2VqbHd4a3lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNTkwMzcsImV4cCI6MjA5ODYzNTAzN30.6r1GAxv420BfB1YgBmDzyyh4sBXYYIkVTSDhkqLuQ2w';

async function check() {
  const res = await fetch(url, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

check();
