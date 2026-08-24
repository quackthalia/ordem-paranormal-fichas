const fs = require('fs');

const file = 'src/screens/Ficha/ModalItensAmaldicoados.tsx';
let c = fs.readFileSync(file, 'utf8');

// 1. Add Collapse import
if (!c.includes("import { Collapse }")) {
  const reactImportEnd = c.indexOf("from 'react';");
  if (reactImportEnd !== -1) {
    const insertPos = reactImportEnd + "from 'react';".length;
    c = c.substring(0, insertPos) + "\nimport { Collapse } from '../../components/Collapse';" + c.substring(insertPos);
  }
}

// 2. Replace grid
c = c.replace(
  '<div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">',
  '<div className="flex flex-col md:flex-row gap-3 items-start">\n            <div className="flex flex-col gap-3 w-full md:w-1/2">'
);

// 3. Change .map to .filter(even).map - without type annotation
c = c.replace(
  '{itensFiltrados.map(item => {',
  '{itensFiltrados.filter((_, i) => i % 2 === 0).map(item => {'
);

// 4. Remove h-full
c = c.replace(/flex flex-col h-full"/g, 'flex flex-col"');

// 5. Fix z-50
c = c.replace('className="fixed inset-0 z-50', 'className="fixed inset-0 z-[9999]');

// 6. Now duplicate for odd column
const evenFilterStr = 'itensFiltrados.filter((_, i) => i % 2 === 0)';
const evenStart = c.indexOf('{' + evenFilterStr);

const emptyCheckStr = '{itensFiltrados.length === 0';
const emptyCheckIdx = c.indexOf(emptyCheckStr);

if (evenStart !== -1 && emptyCheckIdx !== -1) {
  const beforeEmpty = c.substring(0, emptyCheckIdx);
  const lastCloseParen = beforeEmpty.lastIndexOf('})}');
  
  if (lastCloseParen !== -1) {
    const evenMapEnd = lastCloseParen + '})}'.length;
    const evenMapBlock = c.substring(evenStart, evenMapEnd);
    const oddMapBlock = evenMapBlock.replace(
      '.filter((_, i) => i % 2 === 0)',
      '.filter((_, i) => i % 2 !== 0)'
    );
    
    const newMiddle = '\n            </div>\n            <div className="flex flex-col gap-3 w-full md:w-1/2">\n            ' + oddMapBlock + '\n            </div>\n          </div>\n          ';
    c = c.substring(0, evenMapEnd) + newMiddle + c.substring(emptyCheckIdx);
  }
}

fs.writeFileSync(file, c);
console.log('ModalItensAmaldicoados done');
