
const fs = require('fs');

let c = fs.readFileSync('src/screens/Ficha/AbasPanel.tsx', 'utf8');

const fields = [
  { varName: 'execucao', label: 'Execução' },
  { varName: 'alcance', label: 'Alcance' },
  { varName: 'area', label: 'Área' },
  { varName: 'alvo', label: 'Alvo' },
  { varName: 'duracao', label: 'Duração' },
  { varName: 'efeito', label: 'Efeito' },
  { varName: 'resistencia', label: 'Resistência' }
];

fields.forEach(f => {
  // We look for: {varName && (
  // and replace with: {varName && varName !== '-' && varName.trim() !== '' && (
  // Actually, wait, let's just make it robust.
  const regex = new RegExp(\\\\\{\\s*\\\s*&&\\s*\\\\(\, 'g');
  c = c.replace(regex, \{\ && \.trim() !== '-' && (\);
});

fs.writeFileSync('src/screens/Ficha/AbasPanel.tsx', c);
console.log('done');

