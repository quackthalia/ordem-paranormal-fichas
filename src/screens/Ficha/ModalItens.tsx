import React from 'react';
import { useState } from 'react';
import { useRPG } from '../../context/RPGContext';
import type { ItemGeral } from '../../types';

import { formatarTexto } from '../../utils/formatters';
import { CORES_ELEMENTOS } from '../../utils/rpgRules';
interface ModalItensProps {
  aberto: boolean;
  onFechar: () => void;
  grupoAba: string;
}

export function ModalItens({ aberto, onFechar, grupoAba }: ModalItensProps) {
  React.useEffect(() => {
    if (aberto) {
      document.body.style.overflow = 'hidden';
      setExpandidos([]);
    } else {
      document.body.style.overflow = 'unset';
      setExpandidos([]);
    }
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

  if (!aberto) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onFechar}>
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex flex-col border-b border-zinc-800 p-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg uppercase tracking-wide text-zinc-100">
                ADICIONAR ITEM — {grupoAba.toUpperCase()}
              </h3>
              <p className="mt-1 text-xs text-zinc-400">Selecione um item para adicionar ao inventário.</p>
            </div>
            <button onClick={onFechar} className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100">&times;</button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar item pelo nome..."
              className="flex-1 rounded border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-red-700"
            />
            <button 
              onClick={() => setMostrarFiltrosAvançados(!mostrarFiltrosAvançados)}
              className={`rounded border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                mostrarFiltrosAvançados || filtroCategoria !== 'Todas'
                  ? 'border-red-800 bg-red-900/40 text-red-300'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              Filtros
            </button>
          </div>
        </div>

        {/* Filtros Avançados */}
        {mostrarFiltrosAvançados && (
          <div className="flex flex-wrap items-center gap-3 border-b border-zinc-800 bg-zinc-900/90 px-4 py-3">
            <div className="flex flex-col gap-1 w-full sm:w-auto flex-1 min-w-[120px]">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Categoria</label>
              <select 
                value={filtroCategoria} 
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-300 outline-none"
              >
                <option value="Todas">Todas as Categorias</option>
                {uniqueCategorias.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-scroll p-3">
          <div className="flex flex-col gap-2">
          {itensFiltrados.map((item: ItemGeral) => {
            const isExpanded = expandidos.includes(item.Codigo_Item);
            
            return (
              <div 
                key={item.Codigo_Item} 
                className="flex flex-col rounded border border-zinc-800 bg-zinc-900/50 shadow-sm transition hover:border-zinc-700"
              >
                {/* Cabeçalho do item */}
                <div 
                  className="flex cursor-pointer items-center justify-between p-3"
                  onClick={() => toggleExpandir(item.Codigo_Item)}
                >
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <span className="font-bold text-sm text-zinc-100 truncate">{item.Nome_Item}</span>
                    
                    <div className="flex items-center gap-4 text-xs text-zinc-300">
                      {item.Dt_Item && <span><span className="font-bold text-red-400">DT:</span> {calcularDT(item.Dt_Item)}</span>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    {escolhendoPericia === item.Codigo_Item ? (
                      <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded border border-zinc-800" onClick={e => e.stopPropagation()}>
                        <select
                          className="bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 rounded px-1 py-1 outline-none"
                          onChange={e => {
                            if (e.target.value) {
                              const itemModificado = { ...item, Nome_Item: `${item.Nome_Item} (${e.target.value})` };
                              itensHook.adicionarItem(itemModificado);
                              setEscolhendoPericia(null);
                              onFechar();
                            }
                          }}
                          defaultValue=""
                        >
                          <option value="" disabled>Escolha a perícia...</option>
                          {TODAS_PERICIAS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
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
                        className="rounded bg-red-700 px-3 py-1.5 text-xs font-bold uppercase text-zinc-100 transition hover:bg-red-600"
                      >
                        Adicionar
                      </button>
                    )}
                    <span className="w-5 text-center text-zinc-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>
                
                {/* Bloco expandido */}
                {isExpanded && (
                  <div className="border-t border-zinc-800 px-3 py-3 text-xs flex flex-col gap-2 bg-zinc-950/80">
                    <div className="flex flex-col gap-1 mt-1">
                      <span><span className="text-red-400 font-bold">Categoria:</span> {item.Categoria_Item}</span>
                      <span><span className="text-red-400 font-bold">Espaços:</span> {(regrasAutomaticasAtivas.has(43) && (item.Espacos_Itens === 0.5 || String(item.Espacos_Itens) === '0,5' || String(item.Espacos_Itens) === '0.5')) ? 0.25 : item.Espacos_Itens}</span>
                    </div>
                    <div className="flex flex-col gap-1 mt-1">
                      <p className="text-zinc-400 text-xs leading-relaxed whitespace-pre-wrap">{formatarTexto(item.Desc_Item)}</p>
                    </div>
                    {item.Fonte_Item && (
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-800/50">
                        <span className="text-[10px] uppercase tracking-wider text-zinc-600">Fonte: {item.Fonte_Item}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          </div>
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
