
const fs = require('fs');
let c = fs.readFileSync('src/screens/Ficha/ModalArmas.tsx', 'utf8');
if (!c.includes('import { CustomSelect }')) {
  c = c.replace('import React', 'import { CustomSelect } from \'../../components/CustomSelect\';\nimport React');
  fs.writeFileSync('src/screens/Ficha/ModalArmas.tsx', c);
}

