const fs = require('fs');

// =============================================
// FIX ModalProtecoes.tsx
// =============================================
{
  const file = 'src/screens/Ficha/ModalProtecoes.tsx';
  let c = fs.readFileSync(file, 'utf8');

  // Add Collapse import
  if (!c.includes("import { Collapse }")) {
    c = c.replace(/import \{ useState(.*?)\} from 'react';/, (m) => m + "\nimport { Collapse } from '../../components/Collapse';");
  }

  // Replace description pattern
  c = c.replace(
    /{protecao\.Descricao_Protecao && \(\s*<div className="flex flex-col gap-1 mt-1 mb-3">\s*<p className=\{`text-zinc-400 text-\[11px\] leading-relaxed whitespace-pre-wrap select-none \$\{!isExpanded \? 'line-clamp-3' : ''\}`\}>\{formatarTexto\(protecao\.Descricao_Protecao\)\}<\/p>\s*<\/div>\s*\)\}/g,
    `{protecao.Descricao_Protecao && (
                      <div className="flex flex-col gap-1 mt-1 mb-3">
                        {!isExpanded && (
                          <p className="text-zinc-400 text-[11px] leading-relaxed whitespace-pre-wrap select-none line-clamp-3">{formatarTexto(protecao.Descricao_Protecao)}</p>
                        )}
                        <Collapse isOpen={isExpanded}>
                          <p className="text-zinc-400 text-[11px] leading-relaxed whitespace-pre-wrap select-none">{formatarTexto(protecao.Descricao_Protecao)}</p>
                        </Collapse>
                      </div>
                    )}`
  );

  // Replace grid with masonry + even filter
  c = c.replace(
    '<div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">',
    '<div className="flex flex-col md:flex-row gap-3 items-start">\n            <div className="flex flex-col gap-3 w-full md:w-1/2">'
  );
  c = c.replace('{protecoesFiltradas.map((protecao: Protecao) => {', '{protecoesFiltradas.filter((_, i) => i % 2 === 0).map((protecao: Protecao) => {');
  c = c.replace(/flex flex-col h-full/g, 'flex flex-col');

  // Find the closing of the map and add odd column
  // Pattern: })}  </div>  {protecoesFiltradas.length === 0 &&
  const cardBlock = c.match(/(return \(\s*<div\s*key=\{protecao\.Codigo_Protecao\}[\s\S]*?<\/div>\s*\);\s*\}\))/);
  if (cardBlock) {
    const oddBlock = cardBlock[0].replace('protecoesFiltradas.filter((_, i) => i % 2 === 0)', 'protecoesFiltradas.filter((_, i) => i % 2 !== 0)');
    c = c.replace(
      /(\}\)\}\s*)<\/div>\s*\{protecoesFiltradas\.length === 0/,
      `$1</div>\n            <div className="flex flex-col gap-3 w-full md:w-1/2">\n            {protecoesFiltradas.filter((_, i) => i % 2 !== 0).map((protecao: Protecao) => {\n              const isExpanded = expandidos.includes(protecao.Codigo_Protecao);\n              const hasProficiencia = proficienciasTotais.includes(protecao.Proficiencia);\n` + cardBlock[0].substring(cardBlock[0].indexOf('return (')) + `}\n            </div>\n          </div>\n          {protecoesFiltradas.length === 0`
    );
  }

  // Fix z-50
  c = c.replace('className="fixed inset-0 z-50', 'className="fixed inset-0 z-[9999]');

  fs.writeFileSync(file, c);
  console.log('ModalProtecoes done');
}

// =============================================
// FIX ModalItensAmaldicoados.tsx
// =============================================
{
  const file = 'src/screens/Ficha/ModalItensAmaldicoados.tsx';
  let c = fs.readFileSync(file, 'utf8');

  // Add Collapse import
  if (!c.includes("import { Collapse }")) {
    c = c.replace(/import \{ useState(.*?)\} from 'react';/, (m) => m + "\nimport { Collapse } from '../../components/Collapse';");
  }

  // Fix z-50
  c = c.replace('className="fixed inset-0 z-50', 'className="fixed inset-0 z-[9999]');

  fs.writeFileSync(file, c);
  console.log('ModalItensAmaldicoados done');
}

console.log('All done');
