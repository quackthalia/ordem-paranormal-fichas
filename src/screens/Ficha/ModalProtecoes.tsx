import React from 'react';
import { useState } from 'react';
import { useRPG } from '../../context/RPGContext';
import type { Protecao } from '../../types';

import { formatarTexto } from '../../utils/formatters';
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
    return () => { document.body.style.overflow = 'unset'; };
  }, [aberto]);

  const { protecoesHook, proficiencias } = useRPG();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<string>('Todas');
  
  const [mostrarFiltrosAvançados, setMostrarFiltrosAvançados] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('Todas');
  
  const [expandidos, setExpandidos] = useState<number[]>([]);

  if (!aberto) return null;

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
  });
  
  const uniqueCategorias = Array.from(new Set((protecoesHook?.protecoes || []).map(p => {
    const c = String(p.Categoria_Protecao).trim().toUpperCase();
    if (c === 'O') return '0';
    return c;
  }))).filter(Boolean).sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onFechar}>
      <div className="flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex flex-col border-b border-zinc-800 p-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg uppercase tracking-wide text-zinc-100">
                ADICIONAR PROTEÇÃO
              </h3>
              <p className="mt-1 text-xs text-zinc-400">Selecione uma proteção para adicionar ao inventário.</p>
            </div>
            <button onClick={onFechar} className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100">&times;</button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar proteção pelo nome..."
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

        {/* Filtros de proficiência originais */}
        <div className="flex flex-wrap gap-1 border-b border-zinc-800 bg-zinc-950/80 px-3 py-2">
          {filtros.map(f => {
            const ativo = filtro === f.valor;
            return (
              <button
                key={f.valor}
                onClick={() => setFiltro(f.valor)}
                className={`rounded px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-wider transition border ${
                  ativo
                    ? 'bg-red-900/40 text-red-300 border-red-800'
                    : 'bg-zinc-800/60 text-zinc-500 border-zinc-700 hover:text-zinc-300'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Lista de proteções */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-2">
            {protecoesFiltradas.map((protecao: Protecao) => {
              const isExpanded = expandidos.includes(protecao.Codigo_Protecao);
              const hasProficiencia = proficiencias.includes(protecao.Proficiencia);
              return (
                <div key={protecao.Codigo_Protecao} className="rounded border border-zinc-800 border-l-4 border-l-blue-700 bg-zinc-950/60 transition hover:bg-zinc-900/60">
                  {/* Bloco fechado */}
                  <div
                    className="flex cursor-pointer items-center justify-between gap-3 p-3"
                    onClick={() => toggleExpandir(protecao.Codigo_Protecao)}
                  >
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <span className="font-bold text-sm text-zinc-100 truncate">{protecao.Nome_Protecao}</span>
                      <div className="flex items-center gap-4 text-xs text-zinc-300">
                        <span>
                          <span className="font-bold text-blue-400">Defesa</span> {String(protecao.Defesa_Protecao).startsWith('+') ? protecao.Defesa_Protecao : `+${protecao.Defesa_Protecao}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {!hasProficiencia && (
                        <span className="relative group cursor-help">
                          <span className="text-sm text-red-500">⚠️</span>
                          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block w-52 p-2 bg-zinc-800 border border-red-700/50 text-xs text-red-200 rounded z-50 text-center shadow-lg pointer-events-none">
                            Se você usar uma proteção com a qual não seja proficiente, sofre -2d20 em testes baseados em Força ou Agilidade.
                          </span>
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          protecoesHook?.adicionarProtecao(protecao);
                          onFechar();
                        }}
                        className="rounded bg-red-700 px-3 py-1.5 text-xs font-bold uppercase text-zinc-100 transition hover:bg-red-600"
                      >
                        Adicionar
                      </button>
                      <span className="w-5 text-center text-zinc-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Bloco expandido */}
                  {isExpanded && (
                    <div className="border-t border-zinc-800 px-3 py-3 text-xs flex flex-col gap-2 bg-zinc-950/80">
                      <div>
                        <span className="font-bold text-zinc-200">{protecao.Proficiencia}</span>
                        <span className="text-zinc-600"> — </span>
                        <span className="italic text-zinc-400">Categoria {protecao.Categoria_Protecao}</span>
                      </div>
                      <div className="flex flex-col gap-1 text-xs text-zinc-300">
                        <span><span className="text-blue-400 font-bold">Defesa:</span> {protecao.Defesa_Protecao}</span>
                        <span><span className="text-blue-400 font-bold">Espaços:</span> {protecao.Espacos_Protecao}</span>
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        <p className="text-zinc-400 text-xs leading-relaxed">{protecao.Descricao_Protecao}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {protecoesFiltradas.length === 0 && (
            <p className="text-center text-zinc-600 text-sm py-8">Nenhuma proteção encontrada.</p>
          )}
        </div>
      </div>
    </div>
  );
}
