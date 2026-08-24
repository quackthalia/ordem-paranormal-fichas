const fs = require('fs');

const file = 'src/screens/Ficha/ModalArmas.tsx';
let c = fs.readFileSync(file, 'utf8');

if (!c.includes('import { Collapse }')) {
  c = c.replace("import React,", "import React,\nimport { Collapse } from '../../components/Collapse';");
  // wait, maybe import React is not there.
  c = c.replace(/import \{[^\}]+\} from 'react';/, match => match + "\nimport { Collapse } from '../../components/Collapse';");
}

// In ModalArmas, the block is:
/*
                    {arma.Descricao_Item && (
                      <div className="flex flex-col gap-1 mt-1 mb-3">
                        <p className={`text-zinc-400 text-[11px] leading-relaxed whitespace-pre-wrap select-none ${!isExpanded ? 'line-clamp-3' : ''}`}>{formatarTexto(arma.Descricao_Item)}</p>
                      </div>
                    )}
*/

const target = /\{arma\.Descricao_Item && \(\s*<div className="flex flex-col gap-1 mt-1 mb-3">\s*<p className=\{`text-zinc-400 text-\[11px\] leading-relaxed whitespace-pre-wrap select-none \$\{!isExpanded \? 'line-clamp-3' : ''\}`\}>\{formatarTexto\(arma\.Descricao_Item\)\}<\/p>\s*<\/div>\s*\)\}/g;

const replacement = `{arma.Descricao_Item && (
                      <div className="flex flex-col gap-1 mt-1 mb-3">
                        {!isExpanded && (
                          <p className="text-zinc-400 text-[11px] leading-relaxed whitespace-pre-wrap select-none line-clamp-3">
                            {formatarTexto(arma.Descricao_Item)}
                          </p>
                        )}
                        <Collapse isOpen={isExpanded}>
                          <p className="text-zinc-400 text-[11px] leading-relaxed whitespace-pre-wrap select-none">
                            {formatarTexto(arma.Descricao_Item)}
                          </p>
                        </Collapse>
                      </div>
                    )}`;

c = c.replace(target, replacement);

fs.writeFileSync(file, c);
console.log('done');
