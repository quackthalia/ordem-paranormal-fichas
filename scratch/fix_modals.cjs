
const fs = require('fs');

const files = [
  'src/screens/Ficha/ModalArmas.tsx',
  'src/screens/Ficha/ModalItens.tsx',
  'src/screens/Ficha/ModalMunicoes.tsx',
  'src/screens/Ficha/ModalProtecoes.tsx'
];

for (const file of files) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/<div className=\"flex flex-wrap items-center gap-3 border-b border-zinc-800 bg-zinc-900\/90 px-4 py-3\">/g, '<div className=\"flex flex-wrap items-center gap-3 border-b border-zinc-800 bg-zinc-900/90 px-4 py-3 relative z-50\">');
  fs.writeFileSync(file, c);
}

