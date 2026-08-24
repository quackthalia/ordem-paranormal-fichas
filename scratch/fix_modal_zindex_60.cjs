const fs = require('fs');
let c = fs.readFileSync('src/components/ModalRituais.tsx', 'utf8');
c = c.replace(/className="fixed inset-0 z-\[60\]/g, 'className="fixed inset-0 z-[9999]');
fs.writeFileSync('src/components/ModalRituais.tsx', c);
console.log('done');
