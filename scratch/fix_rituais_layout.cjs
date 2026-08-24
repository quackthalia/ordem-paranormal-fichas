const fs = require('fs');

function fixFile(file) {
  let c = fs.readFileSync(file, 'utf8');

  // Replace the entire block:
  const regex = /\{\!expandido && \(\s*<div className="px-3 pb-3">\s*<div className="text-xs text-zinc-400 leading-relaxed line-clamp-3">\s*\{ritual\.Descricao_Ritual\.replace\(\/\\n\/g, ' '\)\}\s*<\/div>\s*<\/div>\s*\)\}\s*<Collapse isOpen=\{expandido\}>\s*<div className="px-3 pb-3 border-t border-zinc-800\/50 pt-2 mt-1">\s*<div className="mb-4 flex flex-col gap-1">([\s\S]*?)<\/div>\s*<div className="text-xs leading-relaxed text-zinc-400">\s*\{ritual\.Descricao_Ritual\.split\('\\n'\)\.map\(\(linha, i\) => \(\s*<span key=\{i\} className="block mb-1" dangerouslySetInnerHTML=\{\{ __html: formatarDescricao\(linha\) \}\} \/>\s*\)\)\}\s*<\/div>\s*<\/div>\s*<\/Collapse>/g;
  
  c = c.replace(regex, (match, stats) => {
    return `
                    <Collapse isOpen={expandido}>
                      <div className="px-3 border-t border-zinc-800/50 pt-2 mt-1">
                        <div className="mb-2 flex flex-col gap-1">
                          ${stats}
                        </div>
                      </div>
                    </Collapse>
                    <div className="px-3 pb-3 pt-2">
                      <div className={\`text-xs text-zinc-400 leading-relaxed \${expandido ? 'whitespace-pre-wrap' : 'line-clamp-3'}\`}>
                        {expandido 
                          ? ritual.Descricao_Ritual.split('\\n').map((linha: string, i: number) => (
                              <span key={i} className="block mb-1" dangerouslySetInnerHTML={{ __html: formatarDescricao(linha) }} />
                            ))
                          : ritual.Descricao_Ritual.replace(/\\n/g, ' ')}
                      </div>
                    </div>
`;
  });

  fs.writeFileSync(file, c);
}

fixFile('src/components/ModalRituais.tsx');
fixFile('src/components/ModalRituaisExtra.tsx');
console.log('done');
