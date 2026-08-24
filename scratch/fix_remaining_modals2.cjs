const fs = require('fs');

function addCollapseAndMasonry(file, config) {
  let c = fs.readFileSync(file, 'utf8');
  
  // 1. Add Collapse import if missing
  if (!c.includes("import { Collapse }")) {
    // Try to add after a react import
    if (c.includes("from 'react';")) {
      c = c.replace(/(from 'react';)/, "$1\nimport { Collapse } from '../../components/Collapse';");
    }
  }
  
  // 2. Replace grid with flex masonry opening
  c = c.replace(
    /<div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">/,
    '<div className="flex flex-col md:flex-row gap-3 items-start">\n            <div className="flex flex-col gap-3 w-full md:w-1/2">'
  );
  
  // 3. Change .map to .filter(even).map
  c = c.replace(
    new RegExp(`\\{${config.arrayName}\\.map\\(\\(${config.itemVar}: ${config.itemType}\\) => \\{`),
    `{${config.arrayName}.filter((_, i) => i % 2 === 0).map((${config.itemVar}: ${config.itemType}) => {`
  );
  
  // 4. Remove h-full from cards  
  c = c.replace(/flex flex-col h-full"/g, 'flex flex-col"');
  
  // 5. Replace description line-clamp toggle with Collapse
  if (config.descField) {
    const descRegex = new RegExp(
      `\\{${config.itemVar}\\.${config.descField} && \\(\\s*<div className="flex flex-col gap-1 mt-1 mb-3">\\s*<p className=\\{\`text-zinc-400 text-\\[11px\\] leading-relaxed whitespace-pre-wrap select-none \\$\\{!isExpanded \\? 'line-clamp-3' : ''\\}\\`\\}>\\{formatarTexto\\(${config.itemVar}\\.${config.descField}\\)\\}<\\/p>\\s*<\\/div>\\s*\\)\\}`,
      'g'
    );
    c = c.replace(descRegex,
      `{${config.itemVar}.${config.descField} && (
                      <div className="flex flex-col gap-1 mt-1 mb-3">
                        {!isExpanded && (<p className="text-zinc-400 text-[11px] leading-relaxed whitespace-pre-wrap select-none line-clamp-3">{formatarTexto(${config.itemVar}.${config.descField})}</p>)}
                        <Collapse isOpen={isExpanded}><p className="text-zinc-400 text-[11px] leading-relaxed whitespace-pre-wrap select-none">{formatarTexto(${config.itemVar}.${config.descField})}</p></Collapse>
                      </div>
                    )}`
    );
  }
  
  // 6. Now find the closing of the even-column map and inject odd column
  // The pattern is: })}  </div>  {arrayName.length === 0
  // We need to find everything between the .filter((_, i) => i % 2 === 0).map and the })}, then duplicate it
  
  // Extract the card JSX from the map body
  const mapStart = c.indexOf(`.filter((_, i) => i % 2 === 0).map`);
  if (mapStart === -1) {
    console.log(`WARNING: Could not find even filter in ${file}`);
    fs.writeFileSync(file, c);
    return;
  }
  
  // Find the end of this map's callback: look for the pattern })} followed by </div> and {arrayName.length === 0
  const afterMap = c.indexOf(mapStart);
  
  // Find })}  and  {config.emptyCheck
  const emptyCheckStr = `{${config.arrayName}.length === 0`;
  const emptyCheckIdx = c.indexOf(emptyCheckStr);
  if (emptyCheckIdx === -1) {
    console.log(`WARNING: Could not find empty check in ${file}`);
    fs.writeFileSync(file, c);
    return;
  }
  
  // Everything between the opening of the map and the empty check is our card block + closing divs
  // We need to find the })} that closes our map, right before the </div> that closes our column, right before the </div> that closes the flex container
  
  // Find the last })} before emptyCheckIdx
  let searchArea = c.substring(0, emptyCheckIdx);
  let lastMapClose = searchArea.lastIndexOf('})}\r\n');
  if (lastMapClose === -1) lastMapClose = searchArea.lastIndexOf('})}');
  
  if (lastMapClose === -1) {
    console.log(`WARNING: Could not find map close in ${file}`);
    fs.writeFileSync(file, c);
    return;
  }
  
  // Now extract the map body: from the line after .filter((_, i) => i % 2 === 0).map(... to })}
  const mapLineStart = c.lastIndexOf('\n', mapStart) + 1;
  const mapLine = c.substring(mapLineStart, c.indexOf('\n', mapStart));
  
  // Get the full map block including its body
  const evenMapStart = c.indexOf('{' + config.arrayName + '.filter((_, i) => i % 2 === 0)');
  const evenMapEnd = lastMapClose + '})}'.length;
  const evenMapBlock = c.substring(evenMapStart, evenMapEnd);
  
  // Create odd map block by replacing even with odd
  const oddMapBlock = evenMapBlock.replace('.filter((_, i) => i % 2 === 0)', '.filter((_, i) => i % 2 !== 0)');
  
  // Insert odd column after the even column's })} and before the </div> that closes the flex container
  // The structure should be: })} </div> <div odd column> {oddMap} </div> </div>
  const insertPoint = evenMapEnd;
  
  // Check what's between insertPoint and emptyCheckIdx
  const between = c.substring(insertPoint, emptyCheckIdx).trim();
  
  // Replace the section between end of even map and the empty check
  c = c.substring(0, insertPoint) + '\n            </div>\n            <div className="flex flex-col gap-3 w-full md:w-1/2">\n            ' + oddMapBlock + '\n            </div>\n          </div>\n          ' + c.substring(emptyCheckIdx);
  
  // Fix z-50
  c = c.replace('className="fixed inset-0 z-50', 'className="fixed inset-0 z-[9999]');
  
  fs.writeFileSync(file, c);
  console.log(`${file} done`);
}

// Fix ModalProtecoes
addCollapseAndMasonry('src/screens/Ficha/ModalProtecoes.tsx', {
  arrayName: 'protecoesFiltradas',
  itemVar: 'protecao',
  itemType: 'Protecao',
  descField: 'Descricao_Protecao'
});

// Fix ModalItensAmaldicoados  
addCollapseAndMasonry('src/screens/Ficha/ModalItensAmaldicoados.tsx', {
  arrayName: 'itensFiltrados',
  itemVar: 'item',
  itemType: 'ItemAmaldicoado',
  descField: 'Descricao_Item_Ama'
});

console.log('All done');
