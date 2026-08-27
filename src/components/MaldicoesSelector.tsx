import React, { useState, useRef, useEffect } from 'react';
import type { Maldicao } from '../types';
import { Collapse } from './Collapse';
import { CustomSelect } from './CustomSelect';

interface MaldicoesSelectorProps {
  maldicoesAplicadas: number[];
  maldicoesElementos?: Record<number, string>;
  opcoesMaldicoes: Maldicao[];
  todasMaldicoes: Maldicao[];
  onAdd: (id: number, elementoVaria?: string) => void;
  onRemove: (index: number) => void;
  podeAdicionar: boolean;
}

export function MaldicoesSelector({
  maldicoesAplicadas = [],
  maldicoesElementos = {},
  opcoesMaldicoes = [],
  todasMaldicoes = [],
  onAdd,
  onRemove,
  podeAdicionar
}: MaldicoesSelectorProps) {
  const [selecionando, setSelecionando] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selecionando && dropdownRef.current) {
      setTimeout(() => {
        dropdownRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [selecionando]);
  const [subAbaElemento, setSubAbaElemento] = useState('Todos');
  const [elementosVaria, setElementosVaria] = useState<Record<number, string>>({});

  const aplicadas = maldicoesAplicadas
    .map(id => todasMaldicoes.find(m => m.Codigo_Mald === id))
    .filter(Boolean) as Maldicao[];

  let opcoesDisponiveis = opcoesMaldicoes.filter(
    op => !maldicoesAplicadas.includes(op.Codigo_Mald)
  );

  if (subAbaElemento !== 'Todos') {
    opcoesDisponiveis = opcoesDisponiveis.filter(op => op.Elemento_Mald === subAbaElemento || op.Elemento_Mald?.toLowerCase() === 'varia' || op.Elemento_Mald?.toLowerCase() === 'lista');
  }

  const getCorElemento = (el?: string) => {
    switch(el?.toLowerCase()) {
      case 'sangue': return 'bg-red-950/40 text-red-400 border-red-900/40';
      case 'morte': return 'bg-zinc-900/50 text-zinc-400 border-zinc-700/50';
      case 'conhecimento': return 'bg-yellow-950/40 text-yellow-400 border-yellow-900/40';
      case 'energia': return 'bg-purple-950/40 text-purple-400 border-purple-900/40';
      case 'medo': return 'bg-white/5 text-white border-white/10';
      case 'varia':
      case 'lista': return 'bg-blue-950/40 text-blue-400 border-blue-900/40';
      default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Botão de Adicionar (Dashed) */}
      {!selecionando && (
        <button
          type="button"
          onClick={() => setSelecionando(true)}
          disabled={!podeAdicionar}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed transition-all ${
            podeAdicionar 
              ? 'border-indigo-900/60 hover:border-indigo-600 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/20' 
              : 'border-zinc-800 text-zinc-700 cursor-not-allowed bg-zinc-900/20'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          <span className="text-xs font-bold uppercase tracking-wider">
            {podeAdicionar ? 'Adicionar Maldição' : 'Limite Atingido'}
          </span>
        </button>
      )}

      {/* Painel de Seleção */}
      <Collapse isOpen={selecionando}>
        <div ref={dropdownRef} className="flex flex-col border border-indigo-900/40 bg-zinc-900/80 rounded-lg overflow-hidden shadow-xl mb-1">
          <div className="flex flex-col border-b border-zinc-800 bg-zinc-950/50">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Selecionar Maldição</span>
              <button 
                type="button" 
                onClick={() => setSelecionando(false)}
                className="text-zinc-500 hover:text-zinc-300 p-1 rounded hover:bg-zinc-800 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            {/* Filtros de Elemento */}
            <div className="flex flex-wrap items-center gap-1.5 px-3 pb-2">
              {['Todos', 'Sangue', 'Morte', 'Conhecimento', 'Energia', 'Medo'].map(elem => {
                const ativo = subAbaElemento === elem;
                return (
                  <button
                    key={elem}
                    onClick={() => setSubAbaElemento(elem)}
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider transition border ${
                      ativo
                        ? getCorElemento(elem === 'Todos' ? 'varia' : elem)
                        : 'bg-zinc-800/40 text-zinc-500 border-zinc-700/50 hover:bg-zinc-800 hover:text-zinc-300'
                    }`}
                  >
                    {elem}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex flex-col max-h-[220px] overflow-y-auto custom-scrollbar p-1">
            {opcoesDisponiveis.length === 0 ? (
              <p className="text-xs text-zinc-500 italic p-3 text-center">Nenhuma maldição disponível.</p>
            ) : (
              opcoesDisponiveis.map(opcao => {
                const isVaria = opcao.Elemento_Mald?.toLowerCase() === 'varia' || opcao.Elemento_Mald?.toLowerCase() === 'lista';
                const cores = getCorElemento(opcao.Elemento_Mald);
                
                return (
                  <div 
                    key={opcao.Codigo_Mald}
                    onClick={() => {
                      onAdd(opcao.Codigo_Mald, isVaria ? (elementosVaria[opcao.Codigo_Mald] || 'Sangue') : undefined);
                      setSelecionando(false);
                    }}
                    className="flex flex-col px-3 py-2.5 rounded-md hover:bg-zinc-800/80 cursor-pointer transition-colors group"
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-bold text-zinc-200 text-sm group-hover:text-white transition-colors">{opcao.Nome_Mald}</span>
                      
                      {isVaria ? (
                        <div className="flex gap-2 min-w-0" onClick={e => e.stopPropagation()}>
                          <CustomSelect 
                            value={elementosVaria[opcao.Codigo_Mald] || 'Sangue'}
                            onChange={val => setElementosVaria(prev => ({ ...prev, [opcao.Codigo_Mald]: val }))}
                            options={[
                              { value: 'Sangue', label: 'Sangue' },
                              { value: 'Morte', label: 'Morte' },
                              { value: 'Conhecimento', label: 'Conhecimento' },
                              { value: 'Energia', label: 'Energia' },
                              { value: 'Medo', label: 'Medo' }
                            ]}
                            className="w-28 py-0.5 !text-[10px] !bg-zinc-950 uppercase font-bold tracking-wider"
                          />
                        </div>
                      ) : (
                        <span className={`inline-block border rounded px-1.5 py-px text-[9px] font-bold uppercase tracking-wider leading-tight flex-shrink-0 ${cores}`}>
                          {opcao.Elemento_Mald}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-500 mt-1 leading-relaxed">{opcao.Descricao_Mald}</span>
                    {opcao.Efeito && (
                      <span className="text-[10px] text-indigo-400 mt-1.5 italic">
                        {opcao.Efeito}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Collapse>

      {/* Lista de Maldições Aplicadas */}
      <div className="flex flex-col gap-2 mt-1">
        {aplicadas.map((mod, index) => {
          const isVaria = mod.Elemento_Mald?.toLowerCase() === 'varia' || mod.Elemento_Mald?.toLowerCase() === 'lista';
          const elementoReal = (isVaria && maldicoesElementos && maldicoesElementos[mod.Codigo_Mald]) 
            ? maldicoesElementos[mod.Codigo_Mald] 
            : mod.Elemento_Mald;
          const cores = getCorElemento(elementoReal);
          
          return (
            <div 
              key={`${mod.Codigo_Mald}-${index}`}
              className="group flex items-start justify-between p-3 bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-800 hover:border-indigo-900/50 rounded-lg transition-all"
            >
              <div className="flex flex-col gap-1.5 pr-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-200 text-[13px]">{mod.Nome_Mald}</span>
                  <span className={`inline-block border rounded px-1.5 py-px text-[9px] font-bold uppercase tracking-wider leading-tight flex-shrink-0 ${cores}`}>
                    {elementoReal}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  {mod.Descricao_Mald}
                </p>
                {mod.Efeito && (
                  <p className="text-[10px] text-indigo-400 italic">Efeito: {mod.Efeito}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onRemove(index)}
                title="Remover"
                className="text-zinc-600 hover:text-red-400 p-1.5 opacity-60 group-hover:opacity-100 hover:bg-red-950/30 rounded transition-all flex-shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
