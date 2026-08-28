import React from 'react';
import { useState , useRef, useEffect} from 'react';
import { useRPG } from '../../context/RPGContext';
import type { ItemGeral } from '../../types';

import { formatarTexto } from '../../utils/formatters';
import { CORES_ELEMENTOS } from '../../utils/rpgRules';
import { CustomSelect } from '../../components/CustomSelect';
import { Collapse } from '../../components/Collapse';

interface ModalItensProps {
  aberto: boolean;
  onFechar: () => void;
  grupoAba: string;
}

export function ModalItens({ aberto, onFechar, grupoAba }: ModalItensProps) {

  React.useEffect(() => {
    if (aberto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    setExpandidos([]);
    setBusca('');
    setFiltroCategoria('Todas');
    setMostrarFiltrosAvançados(false);
    setEscolhendoPericia(null);
    setEscolhendoElemento(null);
    return () => { document.body.style.overflow = 'unset'; };
  }, [aberto]);

  const { itensHook, status, atributosFinais, periciasHook, regrasAutomaticasAtivas } = useRPG();
  const [busca, setBusca] = useState('');
  const [expandidos, setExpandidos] = useState<number[]>([]);
  const [escolhendoPericia, setEscolhendoPericia] = useState<number | null>(null);
  const [escolhendoElemento, setEscolhendoElemento] = useState<number | null>(null);
  
  const [mostrarFiltrosAvançados, setMostrarFiltrosAvançados] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('Todas');

  const TODAS_PERICIAS = Object.keys(periciasHook?.pericias || {}).sort();
  const ELEMENTOS = ['Sangue', 'Conhecimento', 'Energia', 'Morte'];

  const calcularDT = (dtItem: string | null): string | null => {
    if (!dtItem) return null;
    
    if (dtItem.includes('/')) {
      return dtItem.split('/').map(part => calcularDT(part.trim())).join(' / ');
    }

    let pericia = '';
    let val = dtItem.trim();
    
    if (val.includes(',')) {
      const parts = val.split(',');
      val = parts.pop()!.trim();
      pericia = parts.join(',').trim();
    }

    let calculado: string | number = 0;
    const isAtributo = ['FOR', 'AGI', 'INT', 'PRE', 'VIG'].includes(val.toUpperCase());
    
    if (isAtributo) {
      calculado = 10 + status.peTurno + (atributosFinais[val.toUpperCase() as keyof typeof atributosFinais] || 0);
    } else {
      const numVal = Number(val);
      calculado = isNaN(numVal) ? val : numVal;
    }
    
    if (pericia) {
      return `${pericia} ${calculado}`;
    }
    return `${calculado}`;
  };

  const toggleExpandir = (id: number) => {
    setExpandidos(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const itensFiltrados = itensHook.itens.filter((item: ItemGeral) => {
    if (item.Grupo_Item.trim() !== grupoAba) return false;
    if (busca && !item.Nome_Item.toLowerCase().includes(busca.toLowerCase())) return false;
    
    if (filtroCategoria !== 'Todas') {
      const cat = String(item.Categoria_Item).trim().toUpperCase();
      if (filtroCategoria === '0' && (cat !== '0' && cat !== 'O')) return false;
      if (filtroCategoria !== '0' && cat !== filtroCategoria) return false;
    }
    
    return true;
  }).sort((a: ItemGeral, b: ItemGeral) => a.Nome_Item.localeCompare(b.Nome_Item));
  
  const uniqueCategorias = Array.from(new Set(itensHook.itens.filter(i => i.Grupo_Item.trim() === grupoAba).map(i => {
    const c = String(i.Categoria_Item).trim().toUpperCase();
    if (c === 'O') return '0';
    return c;
  }))).filter(Boolean).sort();
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [itensFiltrados]);

  if (!aberto) return null;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans" onClick={onFechar}>
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex flex-col border-b border-zinc-800 p-5 pb-4 bg-zinc-900/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg uppercase tracking-wide text-zinc-100">
                ADICIONAR ITEM — {grupoAba.toUpperCase()}
              </h3>
              <p className="mt-1 text-xs text-zinc-400">Selecione um item para adicionar ao inventário.</p>
            </div>
            <button onClick={onFechar} className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100">&times;</button>
          </div>
          <div className="flex items-stretch gap-2">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar item pelo nome..."
              className="flex-1 rounded border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-green-700"
            />
            <button 
              onClick={() => setMostrarFiltrosAvançados(!mostrarFiltrosAvançados)}
              className={`rounded border px-3 py-1.5 text-sm font-bold uppercase tracking-wider transition ${
                mostrarFiltrosAvançados || filtroCategoria !== 'Todas'
                  ? 'border-green-800 bg-green-900/40 text-green-300'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              Filtros
            </button>
          </div>
        </div>

        {/* Filtros Avançados */}
        <Collapse isOpen={mostrarFiltrosAvançados} className="z-50">

          <div className="flex flex-wrap items-center gap-3 border-b border-zinc-800 bg-zinc-900/90 px-4 py-3">
            <div className="flex flex-col gap-1 w-full sm:w-auto flex-1 min-w-[120px]">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Categoria</label>
              <CustomSelect 
                value={filtroCategoria} 
                onChange={(val) => setFiltroCategoria(val)}
                wrapperClassName="w-full"
                className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-300 outline-none"
                options={[
                  { value: 'Todas', label: 'Todas as Categorias' },
                  ...uniqueCategorias.map(t => ({ value: t, label: t }))
                ]}
              />
            </div>
          </div>
        
        </Collapse>

        {/* List */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {(() => {
            const renderItem = (item: ItemGeral) => {
              const isExpanded = expandidos.includes(item.Codigo_Item);
              
              return (
                <div 
                  key={item.Codigo_Item} 
                  className={`bg-zinc-900/40 border border-zinc-800/80 rounded p-3 hover:border-green-500/50 hover:bg-zinc-900/80 transition group flex flex-col  min-h-[160px]`}
                >
                  {/* Cabeçalho do item */}
                  <div 
                    className="flex items-start justify-between gap-2 mb-2 cursor-pointer "
                    onClick={() => toggleExpandir(item.Codigo_Item)}
                  >
                    <h3 className="font-bold text-zinc-200 group-hover:text-green-400 transition select-none flex-1 mt-0.5 truncate">
                      {item.Nome_Item}
                    </h3>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="w-5 text-center text-zinc-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  
                <Collapse isOpen={isExpanded}>
                  <div className="mt-2 text-xs flex flex-col gap-2 mb-4">
                    {item.Dt_Item && <div><span className="font-bold text-green-400">DT:</span> {calcularDT(item.Dt_Item)}</div>}
                  </div>
                </Collapse>

                  <div className="flex-1 cursor-pointer" onClick={() => toggleExpandir(item.Codigo_Item)}>
                    <Collapse isOpen={isExpanded} previewHeight="54px">
                      <p className="text-xs text-zinc-400 mb-4 leading-relaxed whitespace-pre-wrap select-none ">
                        {formatarTexto(item.Desc_Item)}
                      </p>
                    </Collapse>
                    <Collapse isOpen={isExpanded}>
                      {item.Fonte_Item && (
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-800/50">
                          <span className="text-[10px] uppercase tracking-wider text-zinc-600">Fonte: {item.Fonte_Item}</span>
                        </div>
                      )}
                    </Collapse>
                  </div>



                <div className="flex flex-nowrap items-center gap-2 mt-auto overflow-hidden text-[11px] border-t border-zinc-800/50 pt-2 ">
                  <span className="text-zinc-500">
                    <span className="text-green-400 font-semibold">Espaços:</span> {(regrasAutomaticasAtivas.has(43) && (item.Espacos_Itens === 0.5 || String(item.Espacos_Itens) === '0,5' || String(item.Espacos_Itens) === '0.5')) ? 0.25 : item.Espacos_Itens}
                  </span>
                  <span className="text-zinc-500 flex items-center gap-1">
                    • <span className="text-green-400 font-semibold">Categoria:</span> <span className={`uppercase tracking-wider text-zinc-400`}>{item.Categoria_Item}</span>
                  </span>
                  
                  <div className="ml-auto">
                    {escolhendoPericia === item.Codigo_Item ? (
                      <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded border border-zinc-800" onClick={e => e.stopPropagation()}>
                        <div >
                          <CustomSelect
                            value=""
                            onChange={(val) => {
                              if (val) {
                                const itemModificado = { ...item, Nome_Item: `${item.Nome_Item} (${val})` };
                                itensHook.adicionarItem(itemModificado);
                                setEscolhendoPericia(null);
                                onFechar();
                              }
                            }}
                            className="bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 rounded px-1 py-1 outline-none"
                            options={[
                              { value: '', label: 'Escolha a perícia...' },
                              ...TODAS_PERICIAS.map(p => ({ value: p, label: p }))
                            ]}
                          />
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEscolhendoPericia(null); }}
                          className="text-zinc-500 hover:text-zinc-100 p-1 font-bold text-xs"
                        >✕</button>
                      </div>
                    ) : escolhendoElemento === item.Codigo_Item ? (
                      <div className="flex gap-1 items-center bg-zinc-950 p-1 rounded border border-zinc-800" onClick={e => e.stopPropagation()}>
                        <span className="text-[0.55rem] text-zinc-500 uppercase font-bold px-1 hidden sm:inline">Elemento:</span>
                        {ELEMENTOS.map(elem => {
                          const corB = CORES_ELEMENTOS[elem.toLowerCase()] || '#666';
                          const corT = elem.toLowerCase() === 'medo' ? '#000000' : '#ffffff';
                          return (
                            <button
                              key={elem}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  let novoNome = item.Nome_Item;
                                  novoNome = novoNome.replace(/<Elemento>/gi, elem).replace(/\(Elemento\)/gi, elem);
                                  
                                  let novaDesc = item.Desc_Item;
                                  if (item.Nome_Item.toLowerCase().includes('componentes ritualísticos') && novaDesc) {
                                    const linhas = novaDesc.split('\n');
                                    const baseLines: string[] = [];
                                    const blocoElemento: string[] = [];
                                    let currentElementBlock = '';

                                    for (const linha of linhas) {
                                      const matchElemento = linha.match(/^\*([A-Za-z]+):\*/);
                                      if (matchElemento) {
                                        currentElementBlock = matchElemento[1].toLowerCase();
                                      }
                                      
                                      if (currentElementBlock === '') {
                                        baseLines.push(linha);
                                      } else if (currentElementBlock === elem.toLowerCase()) {
                                        blocoElemento.push(linha);
                                      }
                                    }

                                    if (blocoElemento.length > 0) {
                                      novaDesc = baseLines.join('\n').trim() + '\n\n' + blocoElemento.join('\n').trim();
                                    }
                                  }

                                  const itemModificado = { ...item, Nome_Item: novoNome, Desc_Item: novaDesc };
                                  itensHook.adicionarItem(itemModificado);
                                  setEscolhendoElemento(null);
                                  onFechar();
                                }}
                              style={{ backgroundColor: corB, color: corT }}
                              className="rounded px-1.5 py-0.5 text-[0.55rem] font-bold uppercase transition border border-zinc-700 hover:scale-105"
                            >
                              {elem}
                            </button>
                          );
                        })}
                        <button
                          onClick={(e) => { e.stopPropagation(); setEscolhendoElemento(null); }}
                          className="ml-1 rounded px-1 py-0.5 text-[0.6rem] font-bold text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition"
                        >✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          
                          const precisaElemento = item.Nome_Item.toLowerCase().includes('<elemento>') || item.Nome_Item.toLowerCase().includes('(elemento)');
                          
                          if (precisaElemento) {
                            setEscolhendoElemento(item.Codigo_Item);
                          } else {
                            const isUtensilioVestimenta = item.Nome_Item.toLowerCase().includes('vestimenta') || 
                                                          item.Nome_Item.toLowerCase().includes('utensílio') || 
                                                          item.Nome_Item.toLowerCase().includes('utensilio');
                            if (isUtensilioVestimenta || Number(item.Codigo_Item) === 1 || Number(item.Codigo_Item) === 2) {
                              setEscolhendoPericia(item.Codigo_Item);
                            } else {
                              itensHook.adicionarItem(item);
                              onFechar();
                            }
                          }
                        }}
                        className="px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors active:scale-95"
                      >
                        Adicionar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          };
            return (
              <div className="flex flex-col md:flex-row gap-3 items-start">
                <div className="flex flex-col gap-3 w-full flex-1 min-w-[200px]">
                  {itensFiltrados.filter((_, i) => i % 2 === 0).map(renderItem)}
                </div>
                <div className="flex flex-col gap-3 w-full flex-1 min-w-[200px]">
                  {itensFiltrados.filter((_, i) => i % 2 !== 0).map(renderItem)}
                </div>
              </div>
            );
          })()}
          {itensFiltrados.length === 0 && (
            <p className="text-center text-zinc-600 text-sm py-8 mt-4 border border-dashed border-zinc-800 rounded">
              Nenhum item encontrado nesta categoria.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
