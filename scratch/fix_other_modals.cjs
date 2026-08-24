const fs = require('fs');

function fixFile(file) {
  if (!fs.existsSync(file)) return;
  let c = fs.readFileSync(file, 'utf8');

  const regex = /\{\!isExpanded && \(\s*<div className="border-t border-zinc-800 px-5 py-4 text-left">\s*<div className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap line-clamp-2" dangerouslySetInnerHTML=\{\{ __html: formatarDescricao\(poder\.Descricao\) \}\} \/>\s*<\/div>\s*\)\}\s*<Collapse isOpen=\{isExpanded\}>\s*<div className="border-t border-zinc-800 px-5 py-4 text-left">\s*<div className="text-xs text-zinc-400 mb-4 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML=\{\{ __html: formatarDescricao\(poder\.Descricao\) \}\} \/>([\s\S]*?)<\/div>\s*<\/Collapse>/g;

  c = c.replace(regex, (match, extras) => {
    return `
                      <div className="border-t border-zinc-800 px-5 py-4 text-left">
                        <div className={\`text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap \${isExpanded ? 'mb-4' : 'line-clamp-2'}\`} dangerouslySetInnerHTML={{ __html: formatarDescricao(poder.Descricao) }} />
                        <Collapse isOpen={isExpanded}>
                          ${extras.trim()}
                        </Collapse>
                      </div>
`;
  });

  fs.writeFileSync(file, c);
}

fixFile('src/components/ModalPoderOutraClasse.tsx');
fixFile('src/components/ModalPoderOutraOrigem.tsx');

function fixHabilidadeFile(file) {
  if (!fs.existsSync(file)) return;
  let c = fs.readFileSync(file, 'utf8');

  // Let's see how ModalHabilidadeTrilhaExtra.tsx looks.
  // It probably has !isExpanded &&
  const regex = /\{\!isExpanded && \(\s*<div className="border-t border-zinc-800 px-5 py-4 text-left">\s*<div className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap line-clamp-2">\s*\{habilidade\.Descricao\}\s*<\/div>\s*<\/div>\s*\)\}\s*<Collapse isOpen=\{isExpanded\}>\s*<div className="border-t border-zinc-800 px-5 py-4 text-left">\s*<div className="text-xs text-zinc-400 mb-4 leading-relaxed whitespace-pre-wrap">\s*\{habilidade\.Descricao\}\s*<\/div>([\s\S]*?)<\/div>\s*<\/Collapse>/g;

  c = c.replace(regex, (match, extras) => {
    return `
                      <div className="border-t border-zinc-800 px-5 py-4 text-left">
                        <div className={\`text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap \${isExpanded ? 'mb-4' : 'line-clamp-2'}\`}>
                          {habilidade.Descricao}
                        </div>
                        <Collapse isOpen={isExpanded}>
                          ${extras.trim()}
                        </Collapse>
                      </div>
`;
  });

  fs.writeFileSync(file, c);
}

fixHabilidadeFile('src/components/ModalHabilidadeTrilhaExtra.tsx');
console.log('done 2');
