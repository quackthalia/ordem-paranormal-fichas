
const fs = require('fs');
let c = fs.readFileSync('src/screens/Ficha/InventarioPanel.tsx', 'utf8');
c = c.replace('<div className=\"flex gap-2 mb-4\">', '<div className=\"flex gap-2 mb-4 relative z-50\">');
fs.writeFileSync('src/screens/Ficha/InventarioPanel.tsx', c);

