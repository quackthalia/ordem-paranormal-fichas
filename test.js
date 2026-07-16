const fs = require('fs');
const lines = fs.readFileSync('Bases - Rituais.csv', 'utf8').split('\n');
lines.forEach((l, i) => {
  if(i === 0) return;
  // simple csv split ignoring quotes for now, wait we can just do naive split by comma
  // Actually, if we just want to know if SOME rituals have empty Requisito_Discente, 
  // Let's use regex to find TRUE followed by empty or just commas.
  const p = l.split(',');
  // Because of quotes, this is inaccurate. But wait!
  // I will just use AbasPanel logic to see what happens.
  // Requisito_Discente is the 17th column? No. 17.
});
