const fs = require('fs');

let c = fs.readFileSync('src/screens/Ficha/AbasPanel.tsx', 'utf8');

const fields = [
  'execucao', 'alcance', 'area', 'alvo', 'duracao', 'efeito', 'resistencia'
];

fields.forEach(f => {
  const regex = new RegExp(`\\{\\s*${f}\\s*&&\\s*\\(`, 'g');
  c = c.replace(regex, `{${f} && ${f}.trim() !== '-' && (`);
});

fs.writeFileSync('src/screens/Ficha/AbasPanel.tsx', c);
console.log('done');
