import React, { useState, useMemo , useRef, useEffect} from 'react';
import type { Ritual, ClasseRPG } from '../types';
import { sortPorElementoENome } from '../utils/rpgRules';
import { Collapse } from './Collapse';

interface ModalRituaisProps {
  rituais: Ritual[];
  onClose: () => void;
  onSelect: (ritual: Ritual, elemento?: string) => void;
  limiteCirculo: number;
  rituaisAprendidosIds?: number[];
}

const ELEMENTOS = ['Sangue', 'Conhecimento', 'Energia', 'Morte', 'Medo', 'Varia'];
const BANNED_RITUAIS = [10, 17, 49, 53, 64, 116];

const CORES_ELEMENTOS: Record<string, string> = {
  sangue: '#b31717',
  conhecimento: '#b07902',
  energia: '#af27d9',
  morte: '#000000',
  medo: '#ffffff',
  varia: '#888888',
  lista: '#888888',
};

function obterCorBadge(elemento: string): string {
  if (!elemento) return '#666';
  const elementoStr = elemento.toLowerCase();
  if (elementoStr.includes(' e ')) {
    const partes = elementoStr.split(' e ');
    const cor1 = CORES_ELEMENTOS[partes[0].trim()] || '#666';
    const cor2 = CORES_ELEMENTOS[partes[1].trim()] || '#666';
    return `linear-gradient(135deg, ${cor1} 50%, ${cor2} 50%)`;
  }
  return CORES_ELEMENTOS[elementoStr] || '#666';
}

function obterCorTexto(elemento: string): string {
  if (!elemento) return '#ffffff';
  const e = elemento.toLowerCase();
  if (e.includes(' e ')) return '#ffffff';
  if (e === 'medo') return '#000000';
  return '#ffffff';
}

function formatarDescricao(texto: string): string {
  if (!texto) return '';
  let resultado = texto;
  if (!resultado.includes('<') && !resultado.includes('&')) {
    resultado = resultado
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    resultado = resultado.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    resultado = resultado.replace(/_(.*?)_/g, '<em>$1</em>');
  }
  resultado = resultado.replace(/\n/g, '<br />');
  return resultado;
}

export const ModalRituais: React.FC<ModalRituaisProps> = ({
  rituais,
  onClose,
  onSelect,
  limiteCirculo,
  rituaisAprendidosIds = [],
}) => {

  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const [abaElemento, setAbaElemento] = useState<string | null>(null);
  const [abaCirculo, setAbaCirculo] = useState<number | null>(null);
  
  const [escolhendoElementoId, setEscolhendoElementoId] = useState<number | null>(null);
  const [expandidos, setExpandidos] = useState<number[]>([]);
  const [busca, setBusca] = useState('');

  // Filtragem
  const listaFiltrada = useMemo(() => {
    return rituais.filter(r => {
      // Regra 1: Banidos ou já aprendidos
      if (BANNED_RITUAIS.includes(r.Codigo_Ritual)) return false;
      if (rituaisAprendidosIds.includes(r.Codigo_Ritual)) return false;
      
      // Regra 2: Limite de Círculo (ou inferior)
      if (r.Circulo_Ritual > limiteCirculo) return false;
      
      // Regra 3: Elemento Selecionado
      if (abaElemento) {
        const isVaria = r.Elemento_Ritual.toLowerCase() === 'lista' || r.Elemento_Ritual.toLowerCase() === 'varia';
        if (abaElemento === 'Varia') {
          if (!isVaria) return false;
        } else {
          // Se for filtro ex: Sangue. Um ritual de Lista NÃO aparece em Sangue, ele só aparece em Varia.
          if (isVaria || !r.Elemento_Ritual.toLowerCase().includes(abaElemento.toLowerCase())) return false;
        }
      }
      
      // Regra 4: Círculo Selecionado
      if (abaCirculo !== null) {
        if (r.Circulo_Ritual !== abaCirculo) return false;
      }
      
      // Regra 5: Busca por nome
      if (busca.trim()) {
        const lower = busca.toLowerCase();
        if (!r.Nome_Ritual.toLowerCase().includes(lower)) return false;
      }

      return true;
    }).sort((a, b) => sortPorElementoENome(a, b, r => r?.Elemento_Ritual, r => r?.Nome_Ritual));
  }, [rituais, abaElemento, abaCirculo, limiteCirculo, rituaisAprendidosIds, busca]);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [listaFiltrada]);


  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans" onClick={onClose}>
      <div 
        className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* CABEÇALHO */}
        <div className="flex flex-col border-b border-zinc-800 p-5 pb-4 bg-zinc-900/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <h3 className="font-display m-0 text-lg uppercase tracking-wide text-zinc-100">
                APRENDER RITUAL
              </h3>
              <span className="text-xs text-zinc-400 mt-1">Selecione um ritual de até {limiteCirculo}º Círculo</span>
            </div>
            <button
              onClick={onClose}
              className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100"
            >
              &times;
            </button>
          </div>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar ritual..."
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-green-700"
          />
        </div>

        {/* FILTROS (Abas Principais - Elementos) */}
        <div className="flex flex-wrap border-b border-zinc-800 bg-zinc-950">
          <button
            onClick={() => setAbaElemento(null)}
            className={`min-w-[70px] flex-1 px-1 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
              abaElemento === null
                ? 'border-b-2 border-green-900 bg-zinc-900 text-zinc-100'
                : 'border-b-2 border-transparent text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'
            }`}
          >
            Todos
          </button>
          {ELEMENTOS.map(elem => {
            const ativo = abaElemento === elem;
            return (
              <button
                key={elem}
                onClick={() => setAbaElemento(elem)}
                className={`min-w-[70px] flex-1 px-1 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                  ativo
                    ? 'border-b-2 bg-zinc-900 text-zinc-100'
                    : 'border-b-2 border-transparent text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'
                }`}
                style={{
                  borderBottomColor: ativo ? (CORES_ELEMENTOS[elem.toLowerCase()] || '#888') : 'transparent',
                }}
              >
                {elem}
              </button>
            );
          })}
        </div>

        {/* FILTROS (Abas Secundárias - Círculos) */}
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 bg-zinc-900/90 px-4 py-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Círculos:</span>
          <button
            onClick={() => setAbaCirculo(null)}
            className={`rounded px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider transition border ${
              abaCirculo === null
                ? 'bg-green-900/40 text-green-300 border-green-800'
                : 'bg-zinc-800/60 text-zinc-500 border-zinc-700 hover:text-zinc-300'
            }`}
          >
            Todos
          </button>
          {[1, 2, 3, 4].map(c => {
            if (c > limiteCirculo) return null; // Não mostra filtros de círculos acima do permitido
            const ativo = abaCirculo === c;
            return (
              <button
                key={c}
                onClick={() => setAbaCirculo(c)}
                className={`rounded px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider transition border ${
                  ativo
                    ? 'bg-green-900/40 text-green-300 border-green-800'
                    : 'bg-zinc-800/60 text-zinc-500 border-zinc-700 hover:text-zinc-300'
                }`}
              >
                {c}º Círculo
              </button>
            );
          })}
        </div>

        {/* LISTA DE RITUAIS */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="flex flex-col md:flex-row gap-3 items-start">
            <div className="flex flex-col gap-3 w-full flex-1 min-w-[200px]">
              {listaFiltrada.filter((_, i) => i % 2 === 0).map(ritual => {
                const codigo = ritual.Codigo_Ritual;
                const expandido = expandidos.includes(codigo);
                const isVaria = ritual.Elemento_Ritual.toLowerCase() === 'lista' || ritual.Elemento_Ritual.toLowerCase() === 'varia';
                const isEscolhendo = escolhendoElementoId === codigo;
                const elementoSendoEscolhido = isVaria ? 'Varia' : ritual.Elemento_Ritual;
                const corElemento = obterCorBadge(elementoSendoEscolhido);

                return (
                  <div key={codigo} className={`bg-zinc-900/40 border border-zinc-800/80 rounded hover:border-green-500/50 hover:bg-zinc-900/80 transition group flex flex-col border-l-4  ${expandido ? '' : 'h-[200px]'}`} style={{ borderLeftColor: corElemento }}>
                    <div
                      onClick={() => setExpandidos(prev => prev.includes(codigo) ? prev.filter(id => id !== codigo) : [...prev, codigo])}
                      className="flex cursor-pointer items-start justify-between gap-3 p-3"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2.5">
                          <span className="inline-flex items-center gap-1.5 rounded uppercase tracking-wider leading-tight">
                              {(() => {
                                const elStr = elementoSendoEscolhido;
                                if (elStr.includes(' e ')) {
                                  const partes = elStr.split(' e ');
                                  const p1 = partes[0].trim();
                                  const p2 = partes[1].trim();
                                  
                                  const c1 = (() => {
                                    const l1 = p1.toLowerCase();
                                    if(l1.includes('sangue')) return 'text-red-500';
                                    if(l1.includes('conhecimento')) return 'text-yellow-500';
                                    if(l1.includes('energia')) return 'text-purple-500';
                                    if(l1.includes('morte')) return 'text-white bg-black/50 px-1 rounded';
                                    if(l1.includes('medo')) return 'text-zinc-950 bg-zinc-200/80 px-1 rounded';
                                    return 'text-zinc-400';
                                  })();
                                  
                                  const c2 = (() => {
                                    const l2 = p2.toLowerCase();
                                    if(l2.includes('sangue')) return 'text-red-500';
                                    if(l2.includes('conhecimento')) return 'text-yellow-500';
                                    if(l2.includes('energia')) return 'text-purple-500';
                                    if(l2.includes('morte')) return 'text-white bg-black/50 px-1 rounded';
                                    if(l2.includes('medo')) return 'text-zinc-950 bg-zinc-200/80 px-1 rounded';
                                    return 'text-zinc-400';
                                  })();
                                  
                                  return (
                                    <>
                                      <span className={`text-[9px] font-bold ${c1}`}>{p1} <span className="text-zinc-400 font-normal lowercase">e</span></span>
                                      <span className={`text-[9px] font-bold ${c2}`}>{p2}</span>
                                      <span className={`text-[11px] font-black ${c2}`}>{ritual.Circulo_Ritual}</span>
                                    </>
                                  );
                                }
                                
                                const c1 = (() => {
                                  const l1 = elStr.toLowerCase();
                                  if(l1.includes('sangue')) return 'text-red-500';
                                  if(l1.includes('conhecimento')) return 'text-yellow-500';
                                  if(l1.includes('energia')) return 'text-purple-500';
                                  if(l1.includes('morte')) return 'text-white bg-black/50 px-1 rounded';
                                  if(l1.includes('medo')) return 'text-zinc-950 bg-zinc-200/80 px-1 rounded';
                                  return 'text-zinc-400';
                                })();
                                
                                return (
                                  <>
                                    <span className={`text-[9px] font-bold ${c1}`}>{elStr}</span>
                                    <span className={`text-[11px] font-black ${c1}`}>{ritual.Circulo_Ritual}</span>
                                  </>
                                );
                              })()}
                            </span>
                          <span className="font-bold text-zinc-200 group-hover:text-green-400 transition text-sm">{ritual.Nome_Ritual}</span>
                        </div>
                      </div>
                      <span className="text-zinc-500 text-xs mt-1">{expandido ? '▲' : '▼'}</span>
                    </div>

                    <div className="px-3 pb-3 cursor-pointer" onClick={() => setExpandidos(prev => prev.includes(codigo) ? prev.filter(id => id !== codigo) : [...prev, codigo])}>
                      <Collapse isOpen={expandido}>
                        <div className="mb-3 flex flex-col gap-1 border-b border-zinc-800/50 pb-3">
                          {ritual.Execucao_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Execução: </span><span className="text-zinc-300">{ritual.Execucao_Ritual?.split('/')[0].trim()}</span></div>}
                          {ritual.Alcance_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Alcance: </span><span className="text-zinc-300">{ritual.Alcance_Ritual?.split('/')[0].trim()}</span></div>}
                          {ritual.Area_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Área: </span><span className="text-zinc-300">{ritual.Area_Ritual?.split('/')[0].trim()}</span></div>}
                          {ritual.Alvo_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Alvo: </span><span className="text-zinc-300">{ritual.Alvo_Ritual?.split('/')[0].trim()}</span></div>}
                          {ritual.Duracao_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Duração: </span><span className="text-zinc-300">{ritual.Duracao_Ritual?.split('/')[0].trim()}</span></div>}
                          {ritual.Efeito_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Efeito: </span><span className="text-zinc-300">{ritual.Efeito_Ritual.split('/')[0].trim()}</span></div>}
                          {ritual.Resistencia_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Resistência: </span><span className="text-zinc-300">{ritual.Resistencia_Ritual?.split('/')[0].trim()}</span></div>}
                        </div>
                      </Collapse>
                      <Collapse isOpen={expandido} previewHeight="90px">
                        <div className="text-xs leading-relaxed text-zinc-400 min-h-[90px]">
                          {ritual.Descricao_Ritual.split('\n').map((linha, idx) => (
                            <span key={idx} className="block mb-1" dangerouslySetInnerHTML={{ __html: formatarDescricao(linha) }} />
                          ))}
                        </div>
                      </Collapse>
                    </div>
                    
                    <div className="flex flex-nowrap overflow-hidden items-center justify-end gap-2 mt-auto text-[11px] border-t border-zinc-800/50 p-3 pt-2 ">
                      {isEscolhendo ? (
                        <div className="flex flex-wrap gap-1 items-center bg-zinc-950 p-1.5 rounded border border-zinc-800" onClick={e => e.stopPropagation()}>
                          <span className="text-[0.55rem] text-zinc-500 uppercase font-bold px-1">Elemento:</span>
                          {['Sangue', 'Morte', 'Conhecimento', 'Energia'].map(elem => (
                            <button
                              key={elem}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEscolhendoElementoId(null);
                                onSelect(ritual, elem);
                              }}
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-zinc-600 hover:border-zinc-400"
                            >
                              {elem}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            isVaria ? setEscolhendoElementoId(codigo) : onSelect(ritual, undefined);
                          }}
                          className="px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-[10px] uppercase tracking-wider ml-auto"
                        >
                          Adicionar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col gap-3 w-full flex-1 min-w-[200px]">
              {listaFiltrada.filter((_, i) => i % 2 !== 0).map(ritual => {
                const codigo = ritual.Codigo_Ritual;
                const expandido = expandidos.includes(codigo);
                const isVaria = ritual.Elemento_Ritual.toLowerCase() === 'lista' || ritual.Elemento_Ritual.toLowerCase() === 'varia';
                const isEscolhendo = escolhendoElementoId === codigo;
                const elementoSendoEscolhido = isVaria ? 'Varia' : ritual.Elemento_Ritual;
                const corElemento = obterCorBadge(elementoSendoEscolhido);

                return (
                  <div key={codigo} className={`bg-zinc-900/40 border border-zinc-800/80 rounded hover:border-green-500/50 hover:bg-zinc-900/80 transition group flex flex-col border-l-4  ${expandido ? '' : 'h-[200px]'}`} style={{ borderLeftColor: corElemento }}>
                    <div
                      onClick={() => setExpandidos(prev => prev.includes(codigo) ? prev.filter(id => id !== codigo) : [...prev, codigo])}
                      className="flex cursor-pointer items-start justify-between gap-3 p-3"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2.5">
                          <span className="inline-flex items-center gap-1.5 rounded uppercase tracking-wider leading-tight">
                              {(() => {
                                const elStr = elementoSendoEscolhido;
                                if (elStr.includes(' e ')) {
                                  const partes = elStr.split(' e ');
                                  const p1 = partes[0].trim();
                                  const p2 = partes[1].trim();
                                  
                                  const c1 = (() => {
                                    const l1 = p1.toLowerCase();
                                    if(l1.includes('sangue')) return 'text-red-500';
                                    if(l1.includes('conhecimento')) return 'text-yellow-500';
                                    if(l1.includes('energia')) return 'text-purple-500';
                                    if(l1.includes('morte')) return 'text-white bg-black/50 px-1 rounded';
                                    if(l1.includes('medo')) return 'text-zinc-950 bg-zinc-200/80 px-1 rounded';
                                    return 'text-zinc-400';
                                  })();
                                  
                                  const c2 = (() => {
                                    const l2 = p2.toLowerCase();
                                    if(l2.includes('sangue')) return 'text-red-500';
                                    if(l2.includes('conhecimento')) return 'text-yellow-500';
                                    if(l2.includes('energia')) return 'text-purple-500';
                                    if(l2.includes('morte')) return 'text-white bg-black/50 px-1 rounded';
                                    if(l2.includes('medo')) return 'text-zinc-950 bg-zinc-200/80 px-1 rounded';
                                    return 'text-zinc-400';
                                  })();
                                  
                                  return (
                                    <>
                                      <span className={`text-[9px] font-bold ${c1}`}>{p1} <span className="text-zinc-400 font-normal lowercase">e</span></span>
                                      <span className={`text-[9px] font-bold ${c2}`}>{p2}</span>
                                      <span className={`text-[11px] font-black ${c2}`}>{ritual.Circulo_Ritual}</span>
                                    </>
                                  );
                                }
                                
                                const c1 = (() => {
                                  const l1 = elStr.toLowerCase();
                                  if(l1.includes('sangue')) return 'text-red-500';
                                  if(l1.includes('conhecimento')) return 'text-yellow-500';
                                  if(l1.includes('energia')) return 'text-purple-500';
                                  if(l1.includes('morte')) return 'text-white bg-black/50 px-1 rounded';
                                  if(l1.includes('medo')) return 'text-zinc-950 bg-zinc-200/80 px-1 rounded';
                                  return 'text-zinc-400';
                                })();
                                
                                return (
                                  <>
                                    <span className={`text-[9px] font-bold ${c1}`}>{elStr}</span>
                                    <span className={`text-[11px] font-black ${c1}`}>{ritual.Circulo_Ritual}</span>
                                  </>
                                );
                              })()}
                            </span>
                          <span className="font-bold text-zinc-200 group-hover:text-green-400 transition text-sm">{ritual.Nome_Ritual}</span>
                        </div>
                      </div>
                      <span className="text-zinc-500 text-xs mt-1">{expandido ? '▲' : '▼'}</span>
                    </div>

                    <div className="px-3 pb-3 cursor-pointer" onClick={() => setExpandidos(prev => prev.includes(codigo) ? prev.filter(id => id !== codigo) : [...prev, codigo])}>
                      <Collapse isOpen={expandido}>
                        <div className="mb-3 flex flex-col gap-1 border-b border-zinc-800/50 pb-3">
                          {ritual.Execucao_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Execução: </span><span className="text-zinc-300">{ritual.Execucao_Ritual?.split('/')[0].trim()}</span></div>}
                          {ritual.Alcance_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Alcance: </span><span className="text-zinc-300">{ritual.Alcance_Ritual?.split('/')[0].trim()}</span></div>}
                          {ritual.Area_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Área: </span><span className="text-zinc-300">{ritual.Area_Ritual?.split('/')[0].trim()}</span></div>}
                          {ritual.Alvo_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Alvo: </span><span className="text-zinc-300">{ritual.Alvo_Ritual?.split('/')[0].trim()}</span></div>}
                          {ritual.Duracao_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Duração: </span><span className="text-zinc-300">{ritual.Duracao_Ritual?.split('/')[0].trim()}</span></div>}
                          {ritual.Efeito_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Efeito: </span><span className="text-zinc-300">{ritual.Efeito_Ritual.split('/')[0].trim()}</span></div>}
                          {ritual.Resistencia_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Resistência: </span><span className="text-zinc-300">{ritual.Resistencia_Ritual?.split('/')[0].trim()}</span></div>}
                        </div>
                      </Collapse>
                      <Collapse isOpen={expandido} previewHeight="90px">
                        <div className="text-xs leading-relaxed text-zinc-400 min-h-[90px]">
                          {ritual.Descricao_Ritual.split('\n').map((linha, idx) => (
                            <span key={idx} className="block mb-1" dangerouslySetInnerHTML={{ __html: formatarDescricao(linha) }} />
                          ))}
                        </div>
                      </Collapse>
                    </div>
                    
                    <div className="flex flex-nowrap overflow-hidden items-center justify-end gap-2 mt-auto text-[11px] border-t border-zinc-800/50 p-3 pt-2 ">
                      {isEscolhendo ? (
                        <div className="flex flex-wrap gap-1 items-center bg-zinc-950 p-1.5 rounded border border-zinc-800" onClick={e => e.stopPropagation()}>
                          <span className="text-[0.55rem] text-zinc-500 uppercase font-bold px-1">Elemento:</span>
                          {['Sangue', 'Morte', 'Conhecimento', 'Energia'].map(elem => (
                            <button
                              key={elem}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEscolhendoElementoId(null);
                                onSelect(ritual, elem);
                              }}
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-zinc-600 hover:border-zinc-400"
                            >
                              {elem}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            isVaria ? setEscolhendoElementoId(codigo) : onSelect(ritual, undefined);
                          }}
                          className="px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-[10px] uppercase tracking-wider ml-auto"
                        >
                          Adicionar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {listaFiltrada.length === 0 && (
            <div className="mt-10 text-center italic text-zinc-600">Nenhum ritual atende aos filtros.</div>
          )}
        </div>

      </div>
    </div>
  );
};
