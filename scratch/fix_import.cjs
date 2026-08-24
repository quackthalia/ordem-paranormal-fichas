const fs = require('fs');
let c = fs.readFileSync('src/screens/Ficha/AbasPanel.tsx', 'utf8');
if (!c.includes('CustomSelect')) {
  c = c.replace(`import React from 'react';`, `import { CustomSelect } from '../../components/CustomSelect';\nimport React from 'react';`);
  fs.writeFileSync('src/screens/Ficha/AbasPanel.tsx', c);
}
console.log('done');
