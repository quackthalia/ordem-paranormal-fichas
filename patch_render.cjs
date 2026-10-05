const fs = require('fs');
const file = 'src/components/ModalTrilhas.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `
                          const isEscolhendoLamina = escolhendoElementoLamina === trilha.Codigo_Trilha;
                          const isEscolhendoAgente = escolhendoPericiaAgenteSecreto === trilha.Codigo_Trilha;
                          
                          if (isEscolhendoAgente) {
                            return (
                              <div className="flex flex-wrap gap-1 items-center bg-zinc-950 p-1.5 rounded border border-zinc-800 ml-auto" onClick={e => e.stopPropagation()}>
                                <span className="text-[10px] text-zinc-500 font-bold uppercase">Perícia:</span>
                                {['Diplomacia', 'Enganação'].map(el => (
                                  <button
                                    key={el}
                                    onClick={() => prosseguirEscolhaAgenteSecreto(trilha, el)}
                                    className="px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                                  >
                                    {el}
                                  </button>
                                ))}
                              </div>
                            );
                          }
                          
                          if (isEscolhendoLamina) {
`;

content = content.replace(/const isEscolhendo = escolhendoElementoLamina === trilha\.Codigo_Trilha;\s*if \(isEscolhendo\) \{/g, replacement);

fs.writeFileSync(file, content);
