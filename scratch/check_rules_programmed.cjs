const fs = require('fs');
const path = require('path');

const regrasCsvPath = path.join(__dirname, '../Bases - Regras Automáticas.csv');
const srcDir = path.join(__dirname, '../src');

const regrasCsv = fs.readFileSync(regrasCsvPath, 'utf8');
const regrasLines = regrasCsv.split('\n').slice(1).filter(l => l.trim().length > 0);

const regrasObj = {};
regrasLines.forEach(line => {
  const [codigo, ...desc] = line.split(',');
  if (codigo && desc) {
    regrasObj[codigo.trim()] = desc.join(',').trim();
  }
});

const todasRegras = new Set(Object.keys(regrasObj).map(Number));

const regrasEncontradas = new Set();

function buscar(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      buscar(filePath);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const matches = content.matchAll(/regrasAutomaticasAtivas(?:\[|(?:\?\.)?has\()(\d+)[\)\]]/g);
      for (const match of matches) {
        regrasEncontradas.add(Number(match[1]));
      }
    }
  }
}

buscar(srcDir);

const regrasFaltando = [];
for (const regra of todasRegras) {
  if (!regrasEncontradas.has(regra)) {
    regrasFaltando.push(regra);
  }
}

console.log('Regras Encontradas: ', Array.from(regrasEncontradas).sort((a,b) => a - b));
console.log('Regras Faltando: ', regrasFaltando.sort((a,b) => a - b));

console.log('\n--- LISTA DE REGRAS FALTANDO ---');
for (const r of regrasFaltando) {
  console.log(`${r}: ${regrasObj[String(r)]}`);
}
