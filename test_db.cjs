require('dotenv').config();
fetch(process.env.VITE_SUPABASE_URL + '/rest/v1/Rituais?Nome_Ritual=eq.Amaldi%C3%A7oar%20Arma&select=Nome_Ritual,Requisito_Discente,Requisito_Verdadeiro', {
  headers: {
    'apikey': process.env.VITE_SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + process.env.VITE_SUPABASE_ANON_KEY
  }
}).then(r => r.json()).then(console.log).catch(console.error);
