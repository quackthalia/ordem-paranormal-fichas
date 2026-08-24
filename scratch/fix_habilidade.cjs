const fs = require('fs');

const file = 'src/components/ModalHabilidadeTrilhaExtra.tsx';
let c = fs.readFileSync(file, 'utf8');

const regex = /\{\!isExpanded && \(\s*<div\s*className="text-xs text-zinc-400 mb-4 leading-relaxed whitespace-pre-wrap line-clamp-3"\s*dangerouslySetInnerHTML=\{\{ __html: formatarDescricao\(descricao\) \}\}\s*\/>\s*\)\}\s*<Collapse isOpen=\{isExpanded\}>\s*<div\s*className="text-xs text-zinc-400 mb-4 leading-relaxed whitespace-pre-wrap"\s*dangerouslySetInnerHTML=\{\{ __html: formatarDescricao\(descricao\) \}\}\s*\/>/g;

c = c.replace(regex, `
                              <div 
                                className={\`text-xs text-zinc-400 mb-4 leading-relaxed whitespace-pre-wrap \${isExpanded ? '' : 'line-clamp-3'}\`} 
                                dangerouslySetInnerHTML={{ __html: formatarDescricao(descricao) }} 
                              />
                              <Collapse isOpen={isExpanded}>
`);

fs.writeFileSync(file, c);
console.log('done');
