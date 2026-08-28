import React from 'react';
import { useState , useRef, useEffect} from 'react';
import { useRPG } from '../../context/RPGContext';
import type { Protecao } from '../../types';

import { formatarTexto } from '../../utils/formatters';
import { CustomSelect } from '../../components/CustomSelect';
import { Collapse } from '../../components/Collapse';
interface ModalProtecoesProps {
  aberto: boolean;
  onFechar: () => void;
}

export function ModalProtecoes({ aberto, onFechar }: ModalProtecoesProps) {

  React.useEffect(() => {
    if (aberto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    setExpandidos([]);
    setBusca('');
    setFiltro('Todas');
    setFiltroCategoria('Todas');
    setMostrarFiltrosAvançados(false);
    return () => { document.body.style.overflow = 'unset'; };
  }, [aberto]);

  const { protecoesHook, proficienciasTotais, regrasAutomaticasAtivas } = useRPG();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<string>('Todas');
  
  const [mostrarFiltrosAvançados, setMostrarFiltrosAvançados] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('Todas');
  
  const [expandidos, setExpandidos] = useState<number[]>([]);

  const toggleExpandir = (id: number) => {
    setExpandidos(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filtros = [
    { label: 'Todas', valor: 'Todas' },
    { label: 'Leves', valor: 'Proteções Leves' },
    { label: 'Pesadas', valor: 'Proteções Pesadas' },
  ];

  const protecoesFiltradas = (protecoesHook?.protecoes || []).filter((protecao: Protecao) => {
    if (filtro !== 'Todas' && protecao.Proficiencia !== filtro) return false;
    if (busca && !protecao.Nome_Protecao.toLowerCase().includes(busca.toLowerCase())) return false;
    
    if (filtroCategoria !== 'Todas') {
      const cat = String(protecao.Categoria_Protecao).trim().toUpperCase();
      if (filtroCategoria === '0' && (cat !== '0' && cat !== 'O')) return false;
      if (filtroCategoria !== '0' && cat !== filtroCategoria) return false;
    }
    
    return true;
  }).sort((a: Protecao, b: Protecao) => a.Nome_Protecao.localeCompare(b.Nome_Protecao));
  
  const uniqueCategorias = Array.from(new Set((protecoesHook?.protecoes || []).map(p => {
    const c = String(p.Categoria_Protecao).trim().toUpperCase();
    if (c === 'O') return '0';
    return c;
  }))).filter(Boolean).sort();
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [busca, filtro, filtroCategoria]);

  if (!aberto) return null;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans" onClick={onFechar}>
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ease-in-out flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex flex-col border-b border-zinc-800 p-5 pb-4 bg-zinc-900/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg uppercase tracking-wide text-zinc-100">
                ADICIONAR PROTEÇÃO
              </h3>
              <p className="mt-1 text-xs text-zinc-400">Selecione uma proteção para adicionar ao inventário.</p>
            </div>
            <button onClick={onFechar} className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100">&times;</button>
          </div>
          <div className="flex items-stretch gap-2">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar proteção pelo nome..."
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

          <div className="flex flex-col gap-3 border-b border-zinc-800 bg-zinc-900/90 px-4 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col gap-1 w-full sm:w-auto flex-1 min-w-[120px] ">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Categoria</label>
                <CustomSelect
                  value={filtroCategoria}
                  onChange={setFiltroCategoria}
                  options={[
                    { value: 'Todas', label: 'Todas as Categorias' },
                    ...uniqueCategorias.map(t => ({ value: t, label: t }))
                  ]}
                  wrapperClassName="w-full"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Proficiência</label>
              <div className="flex flex-wrap gap-2">
                {filtros.map(f => {
                  const ativo = filtro === f.valor;
                  return (
                    <button
                      key={f.valor}
                      onClick={() => setFiltro(f.valor)}
                      className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition border ${
                        ativo
                          ? 'bg-green-900/40 text-green-300 border-green-800'
                          : 'bg-zinc-800/60 text-zinc-500 border-zinc-700 hover:text-zinc-300'
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        
        </Collapse>

        {/* Lista de proteções */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="flex flex-col md:flex-row gap-3 items-start">
            <div className="flex flex-col gap-3 w-full flex-1 min-w-[200px]">
              {protecoesFiltradas.filter((_, i) => i % 2 === 0).map((protecao: Protecao) => {
                const isExpanded = expandidos.includes(protecao.Codigo_Protecao);
                const hasProficiencia = proficienciasTotais.includes(protecao.Proficiencia);
                return (
                  <div key={protecao.Codigo_Protecao} onClick={() => toggleExpandir(protecao.Codigo_Protecao)} className={`bg-zinc-900/40 border border-zinc-800/80 rounded p-3 hover:border-green-500/50 hover:bg-zinc-900/80 group flex flex-col  overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'min-h-[190px] max-h-[3000px]' : 'min-h-[190px] max-h-[190px]'} cursor-pointer`}
                  >
                    {/* Bloco fechado */}
                    <div
                      className="flex items-start justify-between gap-2 mb-2  "
                      
                    >
                      <h3 className="font-bold text-zinc-200 group-hover:text-green-400 transition select-none flex-1 mt-0.5 truncate">
                        {protecao.Nome_Protecao}
                      </h3>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!hasProficiencia && (
                          <span className="relative group/prof cursor-help">
                            <span className="text-sm text-red-500">⚠️</span>
                            <span className="absolute right-0 top-full mt-1 opacity-0 invisible group-hover/prof:opacity-100 group-hover/prof:visible transition-all duration-300 group-hover/prof:delay-500 delay-0 w-48 p-2 bg-zinc-800 border border-green-700/50 text-xs text-green-200 rounded z-50 text-center shadow-lg pointer-events-none">
                              Se você usar uma proteção com a qual não seja proficiente, sofre -2d20 em testes baseados em Força ou Agilidade.
                            </span>
                          </span>
                        )}
                        <span className="w-5 text-center text-zinc-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    <div className="flex-1  flex flex-col" >
                      <div className="flex items-center flex-nowrap gap-3 text-xs overflow-hidden transition-all duration-300 ease-in-out text-zinc-300 mb-2">
                        <span>
                          <span className="font-bold text-green-400">Defesa:</span> {String(protecao.Defesa_Protecao).startsWith('+') ? protecao.Defesa_Protecao : `+${protecao.Defesa_Protecao}`}
                        </span>
                      </div>

                      <div className="text-[11px] mb-3 block text-zinc-400">
                        <span className="font-bold text-zinc-200">{protecao.Proficiencia}</span>
                      </div>
                      
                      {protecao.Descricao_Protecao && (
                        <div className="flex flex-col gap-1 mt-1 mb-3">
                          <Collapse isOpen={isExpanded} previewHeight="54px">
                            <p className="text-zinc-400 text-[11px] leading-relaxed whitespace-pre-wrap select-none ">{formatarTexto(protecao.Descricao_Protecao)}</p>
                          </Collapse>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-nowrap items-center gap-x-3 mt-auto overflow-hidden transition-all duration-300 ease-in-out text-[11px] border-t border-zinc-800/50 pt-2 ">
                      <span className="truncate"><span className="text-zinc-500 font-semibold">Espaços:</span> {(regrasAutomaticasAtivas.has(43) && (protecao.Espacos_Protecao === 0.5 || String(protecao.Espacos_Protecao) === '0,5' || String(protecao.Espacos_Protecao) === '0.5')) ? 0.25 : protecao.Espacos_Protecao}</span>
                      <span className="truncate"><span className="text-zinc-500 font-semibold">Categoria:</span> {protecao.Categoria_Protecao}</span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          protecoesHook?.adicionarProtecao(protecao);
                          onFechar();
                        }}
                        className="ml-auto shrink-0 px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors active:scale-95"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col gap-3 w-full flex-1 min-w-[200px]">
              {protecoesFiltradas.filter((_, i) => i % 2 !== 0).map((protecao: Protecao) => {
                const isExpanded = expandidos.includes(protecao.Codigo_Protecao);
                const hasProficiencia = proficienciasTotais.includes(protecao.Proficiencia);
                return (
                  <div key={protecao.Codigo_Protecao} onClick={() => toggleExpandir(protecao.Codigo_Protecao)} className={`bg-zinc-900/40 border border-zinc-800/80 rounded p-3 hover:border-green-500/50 hover:bg-zinc-900/80 group flex flex-col  overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'min-h-[190px] max-h-[3000px]' : 'min-h-[190px] max-h-[190px]'} cursor-pointer`}
                  >
                    {/* Bloco fechado */}
                    <div
                      className="flex items-start justify-between gap-2 mb-2  "
                      
                    >
                      <h3 className="font-bold text-zinc-200 group-hover:text-green-400 transition select-none flex-1 mt-0.5 truncate">
                        {protecao.Nome_Protecao}
                      </h3>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!hasProficiencia && (
                          <span className="relative group/prof cursor-help">
                            <span className="text-sm text-red-500">⚠️</span>
                            <span className="absolute right-0 top-full mt-1 opacity-0 invisible group-hover/prof:opacity-100 group-hover/prof:visible transition-all duration-300 group-hover/prof:delay-500 delay-0 w-48 p-2 bg-zinc-800 border border-green-700/50 text-xs text-green-200 rounded z-50 text-center shadow-lg pointer-events-none">
                              Se você usar uma proteção com a qual não seja proficiente, sofre -2d20 em testes baseados em Força ou Agilidade.
                            </span>
                          </span>
                        )}
                        <span className="w-5 text-center text-zinc-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    <div className="flex-1  flex flex-col" >
                      <div className="flex items-center flex-nowrap gap-3 text-xs overflow-hidden transition-all duration-300 ease-in-out text-zinc-300 mb-2">
                        <span>
                          <span className="font-bold text-green-400">Defesa:</span> {String(protecao.Defesa_Protecao).startsWith('+') ? protecao.Defesa_Protecao : `+${protecao.Defesa_Protecao}`}
                        </span>
                      </div>

                      <div className="text-[11px] mb-3 block text-zinc-400">
                        <span className="font-bold text-zinc-200">{protecao.Proficiencia}</span>
                      </div>
                      
                      {protecao.Descricao_Protecao && (
                        <div className="flex flex-col gap-1 mt-1 mb-3">
                          <Collapse isOpen={isExpanded} previewHeight="54px">
                            <p className="text-zinc-400 text-[11px] leading-relaxed whitespace-pre-wrap select-none ">{formatarTexto(protecao.Descricao_Protecao)}</p>
                          </Collapse>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-nowrap items-center gap-x-3 mt-auto overflow-hidden transition-all duration-300 ease-in-out text-[11px] border-t border-zinc-800/50 pt-2 ">
                      <span className="truncate"><span className="text-zinc-500 font-semibold">Espaços:</span> {(regrasAutomaticasAtivas.has(43) && (protecao.Espacos_Protecao === 0.5 || String(protecao.Espacos_Protecao) === '0,5' || String(protecao.Espacos_Protecao) === '0.5')) ? 0.25 : protecao.Espacos_Protecao}</span>
                      <span className="truncate"><span className="text-zinc-500 font-semibold">Categoria:</span> {protecao.Categoria_Protecao}</span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          protecoesHook?.adicionarProtecao(protecao);
                          onFechar();
                        }}
                        className="ml-auto shrink-0 px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors active:scale-95"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {protecoesFiltradas.length === 0 && (
            <p className="text-center text-zinc-600 text-sm py-8 mt-4 border border-dashed border-zinc-800 rounded">
              Nenhuma proteção encontrada.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
