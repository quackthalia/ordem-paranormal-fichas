
const fs = require('fs');
let c = fs.readFileSync('src/screens/OrigensScreen.tsx', 'utf8');
if (!c.includes('import { Collapse }')) {
  c = c.replace('import React', 'import { Collapse } from \'../components/Collapse\';\nimport React');
  fs.writeFileSync('src/screens/OrigensScreen.tsx', c);
}

