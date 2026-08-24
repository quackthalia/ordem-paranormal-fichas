const fs = require('fs');

function addCollapseAndMasonry(file, config) {
  let c = fs.readFileSync(file, 'utf8');
  
  // 1. Add Collapse import if missing
  if (!c.includes("import { Collapse }")) {
    const reactImportEnd = c.indexOf("from 'react';");
    if (reactImportEnd !== -1) {
      const insertPos = reactImportEnd + "from 'react';".length;
      c = c.substring(0, insertPos) + "\nimport { Collapse } from '../../components/Collapse';" + c.substring(insertPos);
    }
  }
  
  // 2. Replace grid with flex masonry opening
  c = c.replace(
    '<div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">',
    '<div className="flex flex-col md:flex-row gap-3 items-start">\n            <div className="flex flex-col gap-3 w-full md:w-1/2">'
  );
  
  // 3. Change .map to .filter(even).map  
  c = c.replace(
    `{${config.arrayName}.map((${config.itemVar}: ${config.itemType}) => {`,
    `{${config.arrayName}.filter((_, i) => i % 2 === 0).map((${config.itemVar}: ${config.itemType}) => {`
  );
  
  // 4. Remove h-full from cards  
  c = c.replace(/flex flex-col h-full"/g, 'flex flex-col"');
  
  // 5. Fix z-50
  c = c.replace('className="fixed inset-0 z-50', 'className="fixed inset-0 z-[9999]');
  
  // 6. Now find the even map block and duplicate it for odd
  const evenFilterStr = `${config.arrayName}.filter((_, i) => i % 2 === 0)`;
  const evenStart = c.indexOf('{' + evenFilterStr);
  
  if (evenStart === -1) {
    console.log('WARNING: Could not find even filter in ' + file);
    fs.writeFileSync(file, c);
    return;
  }
  
  // Find the empty check pattern
  const emptyCheckStr = `{${config.arrayName}.length === 0`;
  const emptyCheckIdx = c.indexOf(emptyCheckStr);
  
  if (emptyCheckIdx === -1) {
    console.log('WARNING: Could not find empty check in ' + file);
    fs.writeFileSync(file, c);
    return;
  }
  
  // Find the })} that closes the even map - it's the last one before the empty check
  const beforeEmpty = c.substring(0, emptyCheckIdx);
  // Look backwards for the last })} 
  const lastCloseParen = beforeEmpty.lastIndexOf('})}');
  
  if (lastCloseParen === -1) {
    console.log('WARNING: Could not find closing })} in ' + file);
    fs.writeFileSync(file, c);
    return;
  }
  
  const evenMapEnd = lastCloseParen + '})}'.length;
  
  // Extract the even map block
  const evenMapBlock = c.substring(evenStart, evenMapEnd);
  
  // Create odd map block
  const oddMapBlock = evenMapBlock.replace(
    '.filter((_, i) => i % 2 === 0)',
    '.filter((_, i) => i % 2 !== 0)'
  );
  
  // Now replace everything from evenMapEnd to emptyCheckIdx with:
  //   </div>  <div odd col>  {oddMap}  </div>  </div>  {emptyCheck...
  const newMiddle = '\n            </div>\n            <div className="flex flex-col gap-3 w-full md:w-1/2">\n            ' + oddMapBlock + '\n            </div>\n          </div>\n          ';
  
  c = c.substring(0, evenMapEnd) + newMiddle + c.substring(emptyCheckIdx);
  
  fs.writeFileSync(file, c);
  console.log(file + ' done');
}

// Fix ModalProtecoes
addCollapseAndMasonry('src/screens/Ficha/ModalProtecoes.tsx', {
  arrayName: 'protecoesFiltradas',
  itemVar: 'protecao',
  itemType: 'Protecao'
});

// Fix ModalItensAmaldicoados  
addCollapseAndMasonry('src/screens/Ficha/ModalItensAmaldicoados.tsx', {
  arrayName: 'itensFiltrados',
  itemVar: 'item',
  itemType: 'ItemAmaldicoado'
});

console.log('All done');
