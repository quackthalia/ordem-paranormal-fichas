const fs = require('fs');
let t = fs.readFileSync('src/components/ModalHabilidadeTrilhaExtra.tsx', 'utf8');

// Add import
if (!t.includes('import { Collapse } from')) {
  t = t.replace("import { supabase } from '../services/supabase';", "import { supabase } from '../services/supabase';\nimport { Collapse } from './Collapse';");
}

const masonryReplacement = `<div className="p-3 flex flex-col md:flex-row gap-3 items-start">
                    <div className="flex flex-col gap-3 w-full md:w-1/2">
                      {nexLevels.filter((_, i) => i % 2 === 0).map((nivel) => {
                        const nome = trilha[\`Nome_Habilidade_\${nivel}\`];
                        const descricao = trilha[\`Descricao_Habilidade_\${nivel}\`];
                        if (!nome || !descricao) return null;

                        const id = \`\${trilha.Codigo_Trilha}_\${nivel}\`;
                        const meetsNex = nexAtual >= nivel;
                        const isExpanded = expandidos.includes(id);

                        return (
                          <div key={id} className={\`bg-zinc-900/40 border border-zinc-800/80 rounded p-3 hover:border-green-500/50 hover:bg-zinc-900/80 transition group flex flex-col h-full \${!meetsNex ? 'opacity-70' : ''}\`}>
                            <div 
                              className="flex justify-between items-start cursor-pointer mb-2"
                              onClick={() => setExpandidos(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                            >
                              <div>
                                <span className="inline-block rounded bg-green-900/40 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider leading-tight text-green-300 mb-1">NEX {nivel}%</span>
                                <h4 className="font-bold text-zinc-200 group-hover:text-green-400 transition">{nome}</h4>
                              </div>
                              <span className="text-zinc-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
                            </div>
                            
                            <Collapse isOpen={isExpanded} previewHeight="4.5em">
                              <div 
                                className="text-xs text-zinc-400 mb-4 leading-relaxed whitespace-pre-wrap" 
                                dangerouslySetInnerHTML={{ __html: formatarDescricao(descricao) }} 
                              />
                            </Collapse>
                            
                            <div className="flex flex-wrap items-center gap-2 mt-auto text-[11px] border-t border-zinc-800/50 pt-2">
                              {meetsNex ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect({
                                      nome,
                                      descricao,
                                      preRequisitos: \`NEX \${nivel}% (\${trilha.Nome_Trilha})\`,
                                      fonte: trilha.Fonte_Trilha || 'OPRPG',
                                      tipo: 'Trilha'
                                    });
                                  }}
                                  className="ml-auto px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors active:scale-95"
                                >
                                  Escolher
                                </button>
                              ) : (
                                <span className="ml-auto text-[0.65rem] uppercase font-bold text-zinc-600 tracking-wider">NEX Insuficiente</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex flex-col gap-3 w-full md:w-1/2">
                      {nexLevels.filter((_, i) => i % 2 !== 0).map((nivel) => {
                        const nome = trilha[\`Nome_Habilidade_\${nivel}\`];
                        const descricao = trilha[\`Descricao_Habilidade_\${nivel}\`];
                        if (!nome || !descricao) return null;

                        const id = \`\${trilha.Codigo_Trilha}_\${nivel}\`;
                        const meetsNex = nexAtual >= nivel;
                        const isExpanded = expandidos.includes(id);

                        return (
                          <div key={id} className={\`bg-zinc-900/40 border border-zinc-800/80 rounded p-3 hover:border-green-500/50 hover:bg-zinc-900/80 transition group flex flex-col h-full \${!meetsNex ? 'opacity-70' : ''}\`}>
                            <div 
                              className="flex justify-between items-start cursor-pointer mb-2"
                              onClick={() => setExpandidos(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                            >
                              <div>
                                <span className="inline-block rounded bg-green-900/40 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider leading-tight text-green-300 mb-1">NEX {nivel}%</span>
                                <h4 className="font-bold text-zinc-200 group-hover:text-green-400 transition">{nome}</h4>
                              </div>
                              <span className="text-zinc-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
                            </div>
                            
                            <Collapse isOpen={isExpanded} previewHeight="4.5em">
                              <div 
                                className="text-xs text-zinc-400 mb-4 leading-relaxed whitespace-pre-wrap" 
                                dangerouslySetInnerHTML={{ __html: formatarDescricao(descricao) }} 
                              />
                            </Collapse>
                            
                            <div className="flex flex-wrap items-center gap-2 mt-auto text-[11px] border-t border-zinc-800/50 pt-2">
                              {meetsNex ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect({
                                      nome,
                                      descricao,
                                      preRequisitos: \`NEX \${nivel}% (\${trilha.Nome_Trilha})\`,
                                      fonte: trilha.Fonte_Trilha || 'OPRPG',
                                      tipo: 'Trilha'
                                    });
                                  }}
                                  className="ml-auto px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors active:scale-95"
                                >
                                  Escolher
                                </button>
                              ) : (
                                <span className="ml-auto text-[0.65rem] uppercase font-bold text-zinc-600 tracking-wider">NEX Insuficiente</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>`;

// Replace the old grid block
// Note: Using precise regex to avoid swallowing trailing divs
const regex = /<div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3 items-start">[\s\S]*?(?=<\/div>\s*<\/div>\s*\)\)}\s*<\/div>\s*\)}\s*<\/div>)/;
t = t.replace(regex, masonryReplacement);

fs.writeFileSync('src/components/ModalHabilidadeTrilhaExtra.tsx', t);
