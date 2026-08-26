import React from 'react';
import { useState } from 'react';
import { useRPG } from '../../context/RPGContext';
import type { Municao } from '../../types';

import { formatarTexto } from '../../utils/formatters';
import { CustomSelect } from '../../components/CustomSelect';
import { Collapse } from '../../components/Collapse';

interface ModalMunicoesProps {
  onFechar: () => void;
  // Se for passado armaFiltro, exibe apenas as compatíveis
  armaFiltroNome?: string;
  armaFiltroCategoria?: string;
  onSelect?: (municao: Municao) => void;
}

export function ModalMunicoes({ onFechar, armaFiltroNome, armaFiltroCategoria, onSelect }: ModalMunicoesProps) {
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const { municoesHook, regrasAutomaticasAtivas } = useRPG();
  const [busca, setBusca] = useState('');
  
  const [mostrarFiltrosAvançados, setMostrarFiltrosAvançados] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('Todas');
  const [filtroTipo, setFiltroTipo] = useState<string>('Todos');

  // Filtra de acordo com o contexto (todas, ou apenas compatíveis com uma arma específica)
  const municoesDisponiveis = (armaFiltroNome && armaFiltroCategoria)
    ? municoesHook.getMunicoesCompativeis(armaFiltroNome, armaFiltroCategoria)
    : (municoesHook.municoes || []);

  const municoesFiltradas = municoesDisponiveis.filter(m => {
    if (busca && !m.Nome_Item.toLowerCase().includes(busca.toLowerCase())) return false;
    
    if (filtroCategoria !== 'Todas') {
      const cat = String(m.Categoria_Item).trim().toUpperCase();
      if (filtroCategoria === '0' && (cat !== '0' && cat !== 'O')) return false;
      if (filtroCategoria !== '0' && cat !== filtroCategoria) return false;
    }
    
    if (filtroTipo !== 'Todos' && m.Tipo_Arma !== filtroTipo) return false;
    
    return true;
  }).sort((a: Municao, b: Municao) => a.Nome_Item.localeCompare(b.Nome_Item));
  
  const uniqueCategorias = Array.from(new Set(municoesDisponiveis.map(m => {
    const c = String(m.Categoria_Item).trim().toUpperCase();
    if (c === 'O') return '0';
    return c;
  }))).filter(Boolean).sort();
  
  const uniqueTipos = Array.from(new Set(municoesDisponiveis.map(m => m.Tipo_Arma))).filter(Boolean).sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans" onClick={onFechar}>
      <div 
        className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col border-b border-zinc-800 p-5 pb-4 bg-zinc-900/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg uppercase tracking-wide text-zinc-100">
                {armaFiltroNome ? `MUNIÇÕES PARA ${armaFiltroNome.toUpperCase()}` : 'ADICIONAR MUNIÇÃO'}
              </h3>
              <p className="mt-1 text-xs text-zinc-400">Selecione uma munição para adicionar ao inventário.</p>
            </div>
            <button onClick={onFechar} className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100">&times;</button>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar munição..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="flex-1 rounded border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-green-700"
            />
            <button 
              onClick={() => setMostrarFiltrosAvançados(!mostrarFiltrosAvançados)}
              className={`rounded border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                mostrarFiltrosAvançados || filtroCategoria !== 'Todas' || filtroTipo !== 'Todos'
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
            <div className="flex flex-col gap-1 w-full sm:w-auto flex-1 min-w-[120px] relative z-50">
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
            
            <div className="flex flex-col gap-1 w-full sm:w-auto flex-1 min-w-[120px] relative z-50">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Tipo de Arma</label>
              <CustomSelect
                value={filtroTipo}
                onChange={setFiltroTipo}
                options={[
                  { value: 'Todos', label: 'Todos os Tipos' },
                  ...uniqueTipos.map(t => ({ value: t, label: t }))
                ]}
                wrapperClassName="w-full"
              />
            </div>
          </div>
        
        </Collapse>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {municoesFiltradas.length === 0 ? (
            <div className="text-center text-zinc-500 italic p-4">Nenhuma munição encontrada.</div>
          ) : (
            <div className="flex flex-col md:flex-row gap-3 items-start">
              <div className="flex flex-col gap-3 w-full md:w-1/2 flex-1 min-w-0">
                {municoesFiltradas.filter((_, i) => i % 2 === 0).map((municao) => (
                  <div 
                    key={municao.Codigo_Municao} 
                    className={`bg-zinc-900/40 border border-zinc-800/80 rounded p-3 hover:border-green-500/50 hover:bg-zinc-900/80 transition group flex flex-col min-h-[190px]`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2 cursor-pointer min-h-[2.5rem]">
                      <h3 className="font-bold text-zinc-200 group-hover:text-green-400 transition select-none flex-1 mt-0.5 line-clamp-2">
                        {municao.Nome_Item}
                      </h3>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-4 text-xs text-zinc-300 mb-2">
                        <span className="italic text-zinc-400">{municao.Tipo_Arma}</span>
                      </div>
                      
                      <p className="text-xs text-zinc-400 mb-4 leading-relaxed whitespace-pre-wrap select-none min-h-[4.5em]">
                        {formatarTexto(municao.Descricao_Item)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-auto text-[11px] border-t border-zinc-800/50 pt-2">
                      <span className="text-zinc-500">
                        <span className="text-green-400 font-semibold">Espaços:</span> {(regrasAutomaticasAtivas.has(43) && (municao['Espaços_Item'] === 0.5 || String(municao['Espaços_Item']) === '0,5' || String(municao['Espaços_Item']) === '0.5')) ? 0.25 : municao['Espaços_Item']}
                      </span>
                      <span className="text-zinc-500 flex items-center gap-1">
                        • <span className="text-green-400 font-semibold">Categoria:</span> <span className="uppercase tracking-wider text-zinc-400">{municao.Categoria_Item}</span>
                      </span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelect) {
                            onSelect(municao);
                          } else {
                            municoesHook.adicionarMunicao(municao);
                            onFechar();
                          }
                        }}
                        className="ml-auto px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors active:scale-95"
                      >
                        Selecionar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 w-full md:w-1/2 flex-1 min-w-0">
                {municoesFiltradas.filter((_, i) => i % 2 !== 0).map((municao) => (
                  <div 
                    key={municao.Codigo_Municao} 
                    className={`bg-zinc-900/40 border border-zinc-800/80 rounded p-3 hover:border-green-500/50 hover:bg-zinc-900/80 transition group flex flex-col min-h-[190px]`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2 cursor-pointer min-h-[2.5rem]">
                      <h3 className="font-bold text-zinc-200 group-hover:text-green-400 transition select-none flex-1 mt-0.5 line-clamp-2">
                        {municao.Nome_Item}
                      </h3>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-4 text-xs text-zinc-300 mb-2">
                        <span className="italic text-zinc-400">{municao.Tipo_Arma}</span>
                      </div>
                      
                      <p className="text-xs text-zinc-400 mb-4 leading-relaxed whitespace-pre-wrap select-none min-h-[4.5em]">
                        {formatarTexto(municao.Descricao_Item)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-auto text-[11px] border-t border-zinc-800/50 pt-2">
                      <span className="text-zinc-500">
                        <span className="text-green-400 font-semibold">Espaços:</span> {(regrasAutomaticasAtivas.has(43) && (municao['Espaços_Item'] === 0.5 || String(municao['Espaços_Item']) === '0,5' || String(municao['Espaços_Item']) === '0.5')) ? 0.25 : municao['Espaços_Item']}
                      </span>
                      <span className="text-zinc-500 flex items-center gap-1">
                        • <span className="text-green-400 font-semibold">Categoria:</span> <span className="uppercase tracking-wider text-zinc-400">{municao.Categoria_Item}</span>
                      </span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelect) {
                            onSelect(municao);
                          } else {
                            municoesHook.adicionarMunicao(municao);
                            onFechar();
                          }
                        }}
                        className="ml-auto px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors active:scale-95"
                      >
                        Selecionar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
