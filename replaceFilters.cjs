
const fs = require('fs');

const files = [
  'src/screens/Ficha/ModalArmas.tsx',
  'src/screens/Ficha/ModalItens.tsx',
  'src/screens/Ficha/ModalItensAmaldicoados.tsx',
  'src/screens/Ficha/ModalMunicoes.tsx',
  'src/screens/Ficha/ModalProtecoes.tsx',
  'src/screens/Ficha/InventarioPanel.tsx'
];

for (const file of files) {
  let c = fs.readFileSync(file, 'utf8');
  
  if (!c.includes('CustomSelect')) {
    c = c.replace(/import React/, 'import { CustomSelect } from \'../../components/CustomSelect\';\nimport React');
  }

  // Replace <select ...> ... </select> logic
  // This requires a bit of regex mastery to convert options logic to options array.
  
  // Since it's too complex to safely regex the dynamic options of the selects in all those files,
  // I will just use sed/awk or write a more specific script?
  // Let me just not run this script and use replace_file_content instead.

