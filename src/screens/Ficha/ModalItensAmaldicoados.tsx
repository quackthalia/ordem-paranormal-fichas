import React, { useState, useMemo } from 'react';
import { useRPG } from '../../context/RPGContext';
import { formatarTexto } from '../../utils/formatters';
import { CustomSelect } from '../../components/CustomSelect';
import { Collapse } from '../../components/Collapse';

interface ModalItensAmaldicoadosProps {
  aberto: boolean;
  fechar: () => void;
}

export function ModalItensAmaldicoados({ aberto, fechar }: ModalItensAmaldicoadosProps) {
  const { itensAmaldicoadosHook } = useRPG();
  const { itens, adicionarItem, loading } = itensAmaldicoadosHook;

  React.useEffect(() => {
    if (aberto) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = 'unset'; };
    } else {
      setBusca('');
      setCategoriaSelecionada('Todos');
      setElementoSelecionado('Todos');
      setExpandidos({});
      setMostrarFiltrosAvançados(false);
    }
  }, [aberto]);
  
  const [busca, setBusca] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('Todos');
  const [elementoSelecionado, setElementoSelecionado] = useState<string>('Todos');
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});
  const [mostrarFiltrosAvançados, setMostrarFiltrosAvançados] = useState(false);

  const itensFiltrados = useMemo(() => {
    return itens.filter(item => {
      const matchBusca = item.Nome_Ama.toLowerCase().includes(busca.toLowerCase());
      const matchCat = categoriaSelecionada === 'Todos' || item.Categoria_Ama === categoriaSelecionada;
      
      let matchElemento = true;
      if (elementoSelecionado !== 'Todos') {
        const itemEl = item.Elemento_Ama?.toLowerCase() || '';
        matchElemento = itemEl.includes(elementoSelecionado.toLowerCase());
      }

      return matchBusca && matchCat && matchElemento;
    }).sort((a, b) => {
      const elementOrder: Record<string, number> = {
        'sangue': 1,
        'morte': 2,
        'conhecimento': 3,
        'energia': 4,
        'medo': 5,
        'varia': 6,
        'vária': 6,
        'variável': 6,
        'variavel': 6
      };
      
      const getRank = (el: string | null | undefined) => {
        if (!el) return 99;
        const lower = el.toLowerCase();
        for (const key in elementOrder) {
          if (lower.includes(key)) return elementOrder[key];
        }
        return 99;
      };

      const rankA = getRank(a.Elemento_Ama);
      const rankB = getRank(b.Elemento_Ama);
      
      if (rankA !== rankB) return rankA - rankB;
      return a.Nome_Ama.localeCompare(b.Nome_Ama);
    });
  }, [itens, busca, categoriaSelecionada, elementoSelecionado]);

  const toggleExpandir = (id: string) => {
    setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans" onClick={fechar}>
      <div 
        className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col border-b border-zinc-800 p-5 pb-4 bg-zinc-900/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg uppercase tracking-wide text-zinc-100 flex items-center gap-2">
                <span>💀</span> ADICIONAR ITEM AMALDIÇOADO
              </h3>
              <p className="mt-1 text-xs text-zinc-400">Selecione um item amaldiçoado para adicionar ao inventário.</p>
            </div>
            <button onClick={fechar} className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100">&times;</button>
          </div>
          <div className="flex items-stretch gap-2">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar item amaldiçoado..."
              className="flex-1 rounded border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-green-700"
            />
            <button 
              onClick={() => setMostrarFiltrosAvançados(!mostrarFiltrosAvançados)}
              className={`rounded border px-3 py-1.5 text-sm font-bold uppercase tracking-wider transition ${
                mostrarFiltrosAvançados || categoriaSelecionada !== 'Todos' || elementoSelecionado !== 'Todos'
                  ? 'border-green-800 bg-green-900/40 text-green-300'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              Filtros
            </button>
          </div>
        </div>

        <Collapse isOpen={mostrarFiltrosAvançados} className="z-50">

          <div className="flex flex-wrap items-center gap-3 border-b border-zinc-800 bg-zinc-900/90 px-4 py-3">
            <div className="flex flex-col gap-1 w-full sm:w-auto flex-1 min-w-[120px] ">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Categoria</label>
              <CustomSelect
                value={categoriaSelecionada}
                onChange={setCategoriaSelecionada}
                options={[
                  { value: 'Todos', label: 'Todas Categorias' },
                  { value: 'I', label: 'I' },
                  { value: 'II', label: 'II' },
                  { value: 'III', label: 'III' },
                  { value: 'IV', label: 'IV' }
                ]}
                wrapperClassName="w-full"
              />
            </div>
            <div className="flex flex-col gap-1 w-full sm:w-auto flex-1 min-w-[120px] ">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Elemento</label>
              <CustomSelect
                value={elementoSelecionado}
                onChange={setElementoSelecionado}
                options={[
                  { value: 'Todos', label: 'Todos Elementos' },
                  { value: 'Conhecimento', label: 'Conhecimento' },
                  { value: 'Energia', label: 'Energia' },
                  { value: 'Medo', label: 'Medo' },
                  { value: 'Morte', label: 'Morte' },
                  { value: 'Sangue', label: 'Sangue' },
                  { value: 'Varia', label: 'Varia' }
                ]}
                wrapperClassName="w-full"
              />
            </div>
          </div>
        
        </Collapse>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <span className="text-zinc-500">Carregando itens amaldiçoados...</span>
            </div>
          ) : itensAmaldicoadosHook.error ? (
            <div className="flex justify-center items-center h-40 flex-col gap-2">
              <span className="text-red-500 font-bold">Erro ao buscar:</span>
              <span className="text-red-400">{itensAmaldicoadosHook.error}</span>
            </div>
          ) : itensFiltrados.length === 0 ? (
            <div className="flex justify-center items-center h-40 flex-col gap-2">
              <span className="text-zinc-500 italic">Nenhum item amaldiçoado encontrado.</span>
              <span className="text-zinc-700 text-xs">Total na base: {itens.length}</span>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-3 items-start">
              <div className="flex flex-col gap-3 w-full md:w-1/2 flex-1 min-w-0">
                {itensFiltrados.filter((_, i) => i % 2 === 0).map(item => {
                  const isExpanded = !!expandidos[item.Codigo_Item_Ama];
                  return (
                    <div 
                      key={item.Codigo_Item_Ama}
                      className={`bg-zinc-900/40 border border-zinc-800/80 rounded p-3 hover:border-green-500/50 hover:bg-zinc-900/80 transition group flex flex-col `}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2 cursor-pointer " onClick={() => toggleExpandir(String(item.Codigo_Item_Ama))}>
                        <h3 className="font-bold text-zinc-200 group-hover:text-green-400 transition select-none flex-1 mt-0.5 truncate">
                          {item.Nome_Ama}
                        </h3>
                        <div className="flex items-center gap-2">
                          {item.Elemento_Ama ? (() => {
                              const elStr = item.Elemento_Ama.toLowerCase();
                              const corText = elStr.includes('medo') ? 'bg-zinc-200/80 text-zinc-950 px-1' :
                                              elStr.includes('sangue') ? 'text-red-500' :
                                              elStr.includes('morte') ? 'bg-black/50 text-white px-1' :
                                              elStr.includes('conhecimento') ? 'text-yellow-500' :
                                              elStr.includes('energia') ? 'text-purple-500' : 
                                              'text-zinc-400';
                              return (
                                <span className={`text-[10px] font-bold rounded-sm truncate uppercase tracking-wider w-fit ${corText}`}>
                                  {item.Elemento_Ama}
                                </span>
                              );
                          })() : <span className="text-[10px] font-bold text-zinc-500 truncate uppercase tracking-wider">Sem Elemento</span>}
                          <div className="w-5 text-center text-zinc-500 text-xs flex-shrink-0">{isExpanded ? '▲' : '▼'}</div>
                        </div>
                      </div>
                      
                      <div className="flex-1 cursor-pointer" onClick={() => toggleExpandir(String(item.Codigo_Item_Ama))}>
                        <Collapse isOpen={isExpanded} previewHeight="54px">
                          <p className="text-xs text-zinc-400 mb-4 leading-relaxed whitespace-pre-wrap select-none min-h-[54px]">
                            {formatarTexto(item.Desc_Ama)}
                          </p>
                        </Collapse>
                      </div>

                      <div className="flex flex-nowrap items-center gap-2 mt-auto overflow-hidden text-[11px] border-t border-zinc-800/50 pt-2">
                        <span className="text-zinc-500">
                          <span className="text-zinc-400 font-semibold">Espaços:</span> {item.Espacos_Ama}
                        </span>
                        <span className="text-zinc-500 flex items-center gap-1">
                          • <span className="text-zinc-400 font-semibold">Categoria:</span> <span className={`uppercase tracking-wider text-zinc-400`}>{item.Categoria_Ama}</span>
                        </span>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            adicionarItem(item);
                            fechar();
                          }}
                          className="ml-auto shrink-0 px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors active:scale-95"
                        >
                          + Adicionar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col gap-3 w-full md:w-1/2 flex-1 min-w-0">
                {itensFiltrados.filter((_, i) => i % 2 !== 0).map(item => {
                  const isExpanded = !!expandidos[item.Codigo_Item_Ama];
                  return (
                    <div 
                      key={item.Codigo_Item_Ama}
                      className={`bg-zinc-900/40 border border-zinc-800/80 rounded p-3 hover:border-green-500/50 hover:bg-zinc-900/80 transition group flex flex-col `}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2 cursor-pointer " onClick={() => toggleExpandir(String(item.Codigo_Item_Ama))}>
                        <h3 className="font-bold text-zinc-200 group-hover:text-green-400 transition select-none flex-1 mt-0.5 truncate">
                          {item.Nome_Ama}
                        </h3>
                        <div className="flex items-center gap-2">
                          {item.Elemento_Ama ? (() => {
                              const elStr = item.Elemento_Ama.toLowerCase();
                              const corText = elStr.includes('medo') ? 'bg-zinc-200/80 text-zinc-950 px-1' :
                                              elStr.includes('sangue') ? 'text-red-500' :
                                              elStr.includes('morte') ? 'bg-black/50 text-white px-1' :
                                              elStr.includes('conhecimento') ? 'text-yellow-500' :
                                              elStr.includes('energia') ? 'text-purple-500' : 
                                              'text-zinc-400';
                              return (
                                <span className={`text-[10px] font-bold rounded-sm truncate uppercase tracking-wider w-fit ${corText}`}>
                                  {item.Elemento_Ama}
                                </span>
                              );
                          })() : <span className="text-[10px] font-bold text-zinc-500 truncate uppercase tracking-wider">Sem Elemento</span>}
                          <div className="w-5 text-center text-zinc-500 text-xs flex-shrink-0">{isExpanded ? '▲' : '▼'}</div>
                        </div>
                      </div>
                      
                      <div className="flex-1 cursor-pointer" onClick={() => toggleExpandir(String(item.Codigo_Item_Ama))}>
                        <Collapse isOpen={isExpanded} previewHeight="54px">
                          <p className="text-xs text-zinc-400 mb-4 leading-relaxed whitespace-pre-wrap select-none min-h-[54px]">
                            {formatarTexto(item.Desc_Ama)}
                          </p>
                        </Collapse>
                      </div>

                      <div className="flex flex-nowrap items-center gap-2 mt-auto overflow-hidden text-[11px] border-t border-zinc-800/50 pt-2">
                        <span className="text-zinc-500">
                          <span className="text-zinc-400 font-semibold">Espaços:</span> {item.Espacos_Ama}
                        </span>
                        <span className="text-zinc-500 flex items-center gap-1">
                          • <span className="text-zinc-400 font-semibold">Categoria:</span> <span className={`uppercase tracking-wider text-zinc-400`}>{item.Categoria_Ama}</span>
                        </span>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            adicionarItem(item);
                            fechar();
                          }}
                          className="ml-auto shrink-0 px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors active:scale-95"
                        >
                          + Adicionar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
