import React, { useState, useMemo , useRef, useEffect} from 'react';
import { useRPG } from '../../context/RPGContext';
import { formatarTexto } from '../../utils/formatters';
import { CustomSelect } from '../../components/CustomSelect';
import { Collapse } from '../../components/Collapse';

interface ModalItensAmaldicoadosProps {
  isEmbedded?: boolean;
  aberto: boolean;
  fechar: () => void;
}

export function ModalItensAmaldicoados({ isEmbedded, aberto, fechar }: ModalItensAmaldicoadosProps) {

  const { itensAmaldicoadosHook, armasHook } = useRPG();
  const { itens, armasAmaldicoadas, adicionarItem, loading } = itensAmaldicoadosHook;
  const { setNexModalAberto } = useRPG();
  

  React.useEffect(() => {
    if (aberto) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = 'unset'; };
    } else {
      setBusca('');
      setAbaElemento(null);
      setExpandidos({});
      setMostrarFiltrosAvancados(false);
      setFiltroCategoria('Todas');
      setFiltroEspacos('Todos');
      setFiltroFonte('Todas');
    }
  }, [aberto]);
  
  const [busca, setBusca] = useState('');
  const [abaElemento, setAbaElemento] = useState<string | null>(null);
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('Todas');
  const [filtroEspacos, setFiltroEspacos] = useState<string>('Todos');
  const [filtroFonte, setFiltroFonte] = useState<string>('Todas');

  const itensFiltrados = useMemo(() => {
    let baseItens = [
      ...(itens || []).map(i => ({ ...i, _tipo: 'item' })),
      ...(armasAmaldicoadas || [])
        .filter(a => !a.Nome_Item.includes('Dupla Obsessiva (Florete)'))
        .map(a => ({ 
        ...a, 
        _tipo: 'arma',
        Codigo_Item_Ama: 'arma_' + a.Codigo_Arma,
        Dano_Secundario: a['Dano-Arma_Sec'],
        Nome_Ama: a.Nome_Item.includes('Dupla Obsessiva (Ma') ? 'Dupla Obsessiva' : a.Nome_Item,
        Desc_Ama: a.Nome_Item.includes('Dupla Obsessiva (Ma') ? 'Maça e florete. Essa dupla de armas enferrujadas parecem não conseguir ficar longe uma da outra, obcecadas por si mesmas e seu único propósito: proteger aqueles que amam com fervor.\nSe estiver empunhando as duas armas, pode gastar uma ação padrão para realizar dois ataques, um com cada arma. Além disso, se um aliado em alcance curto de você for alvo de um ataque, você pode gastar 2 PE como reação para se tornar o alvo do ataque. Se fizer isso e a fonte do ataque estiver em alcance corpo a corpo, você pode gastar 2 PE para atacar a fonte com a maça.' : a.Descricao_Item,
        Elemento_Ama: a.Elemento_Arma,
        Espacos_Ama: a['Espaços_Item'],
        Categoria_Ama: a.Categoria_Item,
        Fonte_Ama: a.Fonte_Arma || ''
      }))
    ];
    let result = baseItens.filter(item => {
      if (abaElemento) {
        if (!item.Elemento_Ama || !item.Elemento_Ama.toLowerCase().includes(abaElemento.toLowerCase())) return false;
      }
      if (busca) {
        if (!item.Nome_Ama.toLowerCase().includes(busca.toLowerCase())) return false;
      }
      if (filtroCategoria !== 'Todas') {
        if (String(item.Categoria_Ama || '').trim().toUpperCase() !== filtroCategoria) return false;
      }
      if (filtroEspacos !== 'Todos') {
        if (String(item.Espacos_Ama || '').trim() !== filtroEspacos) return false;
      }
      if (filtroFonte !== 'Todas') {
        const fonte = (item.Fonte_Ama || '').trim().toLowerCase();
        if (filtroFonte === 'Homebrew') {
          if (fonte !== 'homebrew' && fonte !== 'hb') return false;
        } else if (filtroFonte === 'AS') {
          if (fonte !== 'as' && fonte !== 'a.s.' && fonte !== 'a.s' && !fonte.includes('sobreviv') && !fonte.includes('arquivo') && !fonte.includes('aurora') && !fonte.includes('aniquila')) return false;
        } else {
          if (fonte !== filtroFonte.toLowerCase()) return false;
        }
      }
      return true;
    });
    const elementOrder: Record<string, number> = {
        'sangue': 1,
        'morte': 2,
        'conhecimento': 3,
        'energia': 4,
        'medo': 5,
        'varia': 6,
        'variável': 6
      };
      
      result.sort((a, b) => {
        const elemA = (a.Elemento_Ama || '').trim().toLowerCase();
        const elemB = (b.Elemento_Ama || '').trim().toLowerCase();
        
        const orderA = elementOrder[elemA] || 99;
        const orderB = elementOrder[elemB] || 99;
        
        if (orderA !== orderB) return orderA - orderB;
        return (a.Nome_Ama || '').localeCompare(b.Nome_Ama || '', 'pt-BR');
      });
    return result;
  }, [itens, armasAmaldicoadas, busca, abaElemento, filtroCategoria, filtroEspacos, filtroFonte]);

  const toggleExpandir = (id: string) => {
    setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [busca, abaElemento]);

  if (!aberto) return null;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans" onClick={fechar}>
      <div 
        className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ease-in-out flex flex-col h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col border-b border-zinc-800 p-5 pb-4 bg-zinc-900/50">
          {!isEmbedded && (<div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg uppercase tracking-wide text-zinc-100 flex items-center gap-2">
                <span>💀</span> ADICIONAR ITEM AMALDIÇOADO
              </h3>
              <p className="mt-1 text-xs text-zinc-400">Selecione um item amaldiçoado para adicionar ao inventário.</p>
            </div>
            <button onClick={fechar} className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100">&times;</button>
          </div>)}
          <div className="flex items-stretch gap-2">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar item amaldiçoado..."
              className="flex-1 rounded border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-green-700"
              />
              <button 
                onClick={() => setMostrarFiltrosAvancados(!mostrarFiltrosAvancados)}
                className={`rounded border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition ${
                  mostrarFiltrosAvancados || filtroCategoria !== 'Todas' || filtroEspacos !== 'Todos' || filtroFonte !== 'Todas'
                    ? 'border-green-800 bg-green-900/40 text-green-300'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                Filtros
              </button>
            </div>
          </div>

          {/* Filtros Avançados */}
          <Collapse isOpen={mostrarFiltrosAvancados} className="z-50">
            <div className="flex flex-wrap items-center gap-3 border-b border-zinc-800 bg-zinc-950 px-4 py-3">
              <div className="flex flex-col gap-1 w-full sm:w-auto flex-1 min-w-[120px]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Categoria</label>
                  <CustomSelect
                    value={filtroCategoria}
                    onChange={setFiltroCategoria}
                    options={[
                      { value: 'Todas', label: 'Todas' },
                      { value: 'I', label: 'I' },
                      { value: 'II', label: 'II' },
                      { value: 'III', label: 'III' },
                      { value: 'IV', label: 'IV' }
                    ]}
                  wrapperClassName="w-full"
                />
              </div>
              <div className="flex flex-col gap-1 w-full sm:w-auto flex-1 min-w-[120px]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Espaços</label>
                <CustomSelect
                  value={filtroEspacos}
                  onChange={setFiltroEspacos}
                  options={[
                    { value: 'Todos', label: 'Todos' },
                    { value: '0', label: '0' },
                    { value: '1', label: '1' },
                    { value: '2', label: '2' },
                    { value: '3', label: '3' },
                    { value: '4', label: '4' }
                  ]}
                  wrapperClassName="w-full"
                />
              </div>
              <div className="flex flex-col gap-1 w-full sm:w-auto flex-1 min-w-[120px]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Fonte</label>
                  <CustomSelect
                    value={filtroFonte}
                    onChange={setFiltroFonte}
                    options={[
                      { value: 'Todas', label: 'Todas' },
                      { value: 'OPRPG', label: 'OPRPG' },
                      { value: 'SaH', label: 'SaH' },
                      { value: 'AS', label: 'AS' },
                      { value: 'Homebrew', label: 'Homebrew' }
                    ]}
                  wrapperClassName="w-full"
                />
              </div>
            </div>
          </Collapse>

          {/* Sub Aba Elementos */}
          <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 bg-zinc-950 px-4 py-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Elementos:</span>
            <button
              onClick={() => setAbaElemento(null)}
              className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
                abaElemento === null
                  ? 'bg-green-900/40 text-green-300 border border-green-800'
                  : 'bg-zinc-800/60 text-zinc-500 border border-zinc-700 hover:text-zinc-300'
              }`}
            >
              Todos
            </button>
            {['Sangue', 'Morte', 'Conhecimento', 'Energia', 'Medo', 'Varia'].map(elem => {
              const ativo = abaElemento === elem;
              return (
                <button
                  key={elem}
                  onClick={() => setAbaElemento(elem)}
                  className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition border ${
                    ativo
                      ? (() => {
                          const elStr = elem.toLowerCase();
                          if (elStr.includes('medo')) return 'border-zinc-500 bg-zinc-200/80 text-zinc-950 px-3';
                          if (elStr.includes('sangue')) return 'border-red-900 bg-red-950/20 text-red-500';
                          if (elStr.includes('morte')) return 'border-zinc-700 bg-black/50 text-white px-3';
                          if (elStr.includes('conhecimento')) return 'border-yellow-900 bg-yellow-950/20 text-yellow-500';
                          if (elStr.includes('energia')) return 'border-purple-900 bg-purple-950/20 text-purple-500';
                          return 'border-zinc-600 text-zinc-100';
                        })()
                      : 'border-zinc-700 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {elem}
                </button>
              );
            })}
          </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 custom-scrollbar">
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
              <div className="flex flex-col gap-3 w-full flex-1 min-w-0">
                {itensFiltrados.filter((_, i) => i % 2 === 0).map(item => {
                  const isExpanded = !!expandidos[item.Codigo_Item_Ama];
                  return (
                    <div 
                      key={item.Codigo_Item_Ama}
                      className={`bg-zinc-900/40 border border-zinc-800/80 rounded p-2 hover:border-green-500/50 hover:bg-zinc-900/80 group flex flex-col  overflow-hidden transition-all duration-300 ease-in-out cursor-pointer`} onClick={() => toggleExpandir(item.Codigo_Item_Ama)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2  " >
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
                      
                      <div className="flex-1 " >
                        <Collapse isOpen={isExpanded} previewHeight="36px">
                          <p className="text-xs text-zinc-400 mb-2 leading-relaxed whitespace-pre-wrap select-none ">
                            {formatarTexto(item.Desc_Ama)}
                          </p>
                        </Collapse>
                      </div>

                      <div className="flex flex-nowrap items-center gap-2 mt-auto overflow-hidden transition-all duration-300 ease-in-out text-[11px] border-t border-zinc-800/50 pt-2">
                        <span className="text-zinc-500">
                          <span className="text-zinc-400 font-semibold">Espaços:</span> {item.Espacos_Ama}
                        </span>
                        <span className="text-zinc-500 flex items-center gap-1">
                          • <span className="text-zinc-400 font-semibold">Categoria:</span> <span className={`uppercase tracking-wider text-zinc-400`}>{item.Categoria_Ama}</span>
                        </span>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item._tipo === 'arma') {
    armasHook?.adicionarArma({ ...item, isAmaldicoada: true, isDuplaObsessivaLinked: item.Nome_Item?.includes('Dupla Obsessiva') ? true : undefined });
    if (item.Nome_Item === 'Dupla Obsessiva (Maça)') {
      const florete = armasAmaldicoadas?.find(a => a.Nome_Item === 'Dupla Obsessiva (Florete)');
      if (florete) armasHook?.adicionarArma({ ...florete, Dano_Secundario: florete['Dano-Arma_Sec'], _tipo: 'arma', isAmaldicoada: true, isDuplaObsessivaLinked: true, isDuplaObsessivaCompanion: true });
    }
    if (item.Nome_Item === 'Dupla Obsessiva (Florete)') {
      const maca = armasAmaldicoadas?.find(a => a.Nome_Item === 'Dupla Obsessiva (Maça)');
      if (maca) armasHook?.adicionarArma({ ...maca, Dano_Secundario: maca['Dano-Arma_Sec'], _tipo: 'arma', isAmaldicoada: true, isDuplaObsessivaLinked: true, isDuplaObsessivaCompanion: true });
    }
    // TEMP DEBUG: Use alert to visually confirm action to user
    console.log('Adicionou arma amaldicoada', item.Nome_Item);
  } else {
    if (item.Nome_Ama === 'Dedo Decepado') {
        window.localStorage.setItem('dedoDecepadoAguardando', JSON.stringify(item));
        setNexModalAberto(`extra_dedo_decepado_${Date.now()}`);
      } else {
        adicionarItem(item);
      }
  }
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
              <div className="flex flex-col gap-3 w-full flex-1 min-w-0">
                {itensFiltrados.filter((_, i) => i % 2 !== 0).map(item => {
                  const isExpanded = !!expandidos[item.Codigo_Item_Ama];
                  return (
                    <div 
                      key={item.Codigo_Item_Ama}
                      className={`bg-zinc-900/40 border border-zinc-800/80 rounded p-2 hover:border-green-500/50 hover:bg-zinc-900/80 group flex flex-col  overflow-hidden transition-all duration-300 ease-in-out cursor-pointer`} onClick={() => toggleExpandir(item.Codigo_Item_Ama)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2  " >
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
                      
                      <div className="flex-1 " >
                        <Collapse isOpen={isExpanded} previewHeight="36px">
                          <p className="text-xs text-zinc-400 mb-2 leading-relaxed whitespace-pre-wrap select-none ">
                            {formatarTexto(item.Desc_Ama)}
                          </p>
                        </Collapse>
                      </div>

                      <div className="flex flex-nowrap items-center gap-2 mt-auto overflow-hidden transition-all duration-300 ease-in-out text-[11px] border-t border-zinc-800/50 pt-2">
                        <span className="text-zinc-500">
                          <span className="text-zinc-400 font-semibold">Espaços:</span> {item.Espacos_Ama}
                        </span>
                        <span className="text-zinc-500 flex items-center gap-1">
                          • <span className="text-zinc-400 font-semibold">Categoria:</span> <span className={`uppercase tracking-wider text-zinc-400`}>{item.Categoria_Ama}</span>
                        </span>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item._tipo === 'arma') {
    armasHook?.adicionarArma({ ...item, isAmaldicoada: true, isDuplaObsessivaLinked: item.Nome_Item?.includes('Dupla Obsessiva') ? true : undefined }); alert('Arma Amaldiçoada enviada para o inventário com sucesso: ' + item.Nome_Item);
    if (item.Nome_Item === 'Dupla Obsessiva (Maça)') {
      const florete = armasAmaldicoadas?.find(a => a.Nome_Item === 'Dupla Obsessiva (Florete)');
      if (florete) armasHook?.adicionarArma({ ...florete, Dano_Secundario: florete['Dano-Arma_Sec'], _tipo: 'arma', isAmaldicoada: true, isDuplaObsessivaLinked: true, isDuplaObsessivaCompanion: true });
    }
    if (item.Nome_Item === 'Dupla Obsessiva (Florete)') {
      const maca = armasAmaldicoadas?.find(a => a.Nome_Item === 'Dupla Obsessiva (Maça)');
      if (maca) armasHook?.adicionarArma({ ...maca, Dano_Secundario: maca['Dano-Arma_Sec'], _tipo: 'arma', isAmaldicoada: true, isDuplaObsessivaLinked: true, isDuplaObsessivaCompanion: true });
    }
    // TEMP DEBUG: Use alert to visually confirm action to user
    console.log('Adicionou arma amaldicoada', item.Nome_Item);
  } else {
    if (item.Nome_Ama === 'Dedo Decepado') {
        window.localStorage.setItem('dedoDecepadoAguardando', JSON.stringify(item));
        setNexModalAberto(`extra_dedo_decepado_${Date.now()}`);
      } else {
        adicionarItem(item);
      }
  }
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