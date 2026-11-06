import React, { useState } from 'react';
import type { Modificacao, Maldição } from '../types';
import { CustomSelect } from './CustomSelect';

interface AprimoramentosSelectorProps {
  // Modificações
  modificacoesAplicadas: number[];
  opcoesModificacoes: Modificacao[];
  todasModificacoes: Modificacao[];
  onAddMod: (id: number) => void;
  onRemoveMod: (index: number) => void;
  podeAdicionarMod: boolean;

  // Maldicoes
  maldicoesAplicadas: number[];
  opcoesMaldicoes: Maldição[];
  todasMaldicoes: Maldição[];
  maldicoesElementos?: Record<number, string>;
  onAddMald: (id: number, elemento?: string) => void;
  onRemoveMald: (index: number) => void;
  podeAdicionarMald: boolean;
  esconderMaldicoes?: boolean;
}

const getCorElemento = (elemento?: string) => {
  if (!elemento) return 'text-zinc-400';
  const elStr = elemento.toLowerCase();
  if (elStr.includes('medo')) return 'bg-zinc-200/80 text-zinc-950 px-1';
  if (elStr.includes('sangue')) return 'text-red-500';
  if (elStr.includes('morte')) return 'bg-black/50 text-white px-1';
  if (elStr.includes('conhecimento')) return 'text-yellow-500';
  if (elStr.includes('energia')) return 'text-purple-500';
  if (elStr.includes('varia') || elStr.includes('lista')) return 'text-blue-500';
  return 'text-zinc-400';
};

export function AprimoramentosSelector({
  modificacoesAplicadas = [],
  opcoesModificacoes = [],
  todasModificacoes = [],
  onAddMod,
  onRemoveMod,
  podeAdicionarMod,

  maldicoesAplicadas = [],
  opcoesMaldicoes = [],
  todasMaldicoes = [],
  maldicoesElementos = {},
  onAddMald,
  onRemoveMald,
  podeAdicionarMald,
    esconderMaldicoes = false
  }: AprimoramentosSelectorProps) {
  const [modalAberto, setModalAberto] = useState(false);
  const [abaModal, setAbaModal] = useState<'modificacoes' | 'maldicoes'>('modificacoes');
  
  // Estado local para o seletor de elemento da maldição
  const [subAbaElemento, setSubAbaElemento] = useState<string>('Todos');
  const [elementosVaria, setElementosVaria] = useState<Record<number, string>>({});
  
  const modsSafe = Array.isArray(modificacoesAplicadas) ? modificacoesAplicadas : [];
  const maldsSafe = Array.isArray(maldicoesAplicadas) ? maldicoesAplicadas : [];

  // Arrays de aplicadas completas
  const modsAplicadasFull = modsSafe
    .map(id => todasModificacoes.find(m => m.Codigo_Modif === id))
    .filter(Boolean) as Modificacao[];

  const maldsAplicadasFull = maldsSafe
    .map(id => todasMaldicoes.find(m => m.Codigo_Mald === id))
    .filter(Boolean) as Maldição[];

  const temAprimoramentos = modsAplicadasFull.length > 0 || maldsAplicadasFull.length > 0;

  // Filtros
  const modsDisponiveis = opcoesModificacoes.filter(op => !modsSafe.includes(op.Codigo_Modif));
  let maldsDisponiveis = opcoesMaldicoes.filter(op => !maldsSafe.includes(op.Codigo_Mald));
  
  if (subAbaElemento !== 'Todos') {
    maldsDisponiveis = maldsDisponiveis.filter(m => {
      if (subAbaElemento === 'varia') {
        return m.Elemento_Mald?.toLowerCase() === 'varia' || m.Elemento_Mald?.toLowerCase() === 'lista';
      }
      return m.Elemento_Mald?.toLowerCase() === subAbaElemento.toLowerCase();
    });
  }

  

  return (
    <div className="flex flex-col gap-3">
      
      {/* Lista de Aprimoramentos Aplicados */}
      {temAprimoramentos && (
        <div className="flex flex-col gap-3 mb-2">
          {modsAplicadasFull.map((mod, index) => (
            <div 
              key={`mod-${mod.Codigo_Modif}-${index}`}
              className="group flex items-start justify-between p-3.5 bg-zinc-900/40 border border-zinc-800/80 rounded-lg transition-all hover:bg-zinc-900/60 hover:border-zinc-700/80"
            >
              <div className="flex flex-col gap-1.5 pr-4">
                <span className="font-bold text-zinc-200 text-sm">{mod.Nome_Modif}</span>
                <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">{mod.Descricao_Modif}</p>
              </div>
              <button
                type="button"
                onClick={() => onRemoveMod(index)}
                title="Remover Modificação"
                className="text-zinc-600 hover:text-red-400 p-2 opacity-60 group-hover:opacity-100 hover:bg-red-950/30 rounded transition-all flex-shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                </svg>
              </button>
            </div>
          ))}

          {maldsAplicadasFull.map((mod, index) => {
            const isVaria = mod.Elemento_Mald?.toLowerCase() === 'varia' || mod.Elemento_Mald?.toLowerCase() === 'lista';
            const elementoReal = (isVaria && maldicoesElementos[mod.Codigo_Mald]) 
              ? maldicoesElementos[mod.Codigo_Mald] 
              : mod.Elemento_Mald;
            const cores = getCorElemento(elementoReal);
            
            return (
              <div 
                key={`mald-${mod.Codigo_Mald}-${index}`}
                className="group flex items-start justify-between p-3.5 bg-zinc-900/40 border border-zinc-800/80 rounded-lg transition-all hover:bg-zinc-900/60 hover:border-zinc-700/80 relative overflow-hidden"
              >
                <div className="flex flex-col gap-1.5 pr-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-200 text-sm">
                      {mod.Nome_Mald}{!isVaria && maldicoesElementos[mod.Codigo_Mald] ? ` (${maldicoesElementos[mod.Codigo_Mald]})` : ''}
                    </span>
                    <span className={`text-[10px] font-bold rounded-sm truncate uppercase tracking-wider w-fit mt-0.5 ${cores}`}>
                      {elementoReal}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">{mod.Descricao_Mald}</p>
                  {mod.Efeito && (
                    <p className="text-[11px] text-green-500/90 italic mt-1 font-semibold">{mod.Efeito}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveMald(index)}
                  title="Remover Maldição"
                  className="text-zinc-600 hover:text-red-400 p-2 opacity-60 group-hover:opacity-100 hover:bg-red-950/30 rounded transition-all flex-shrink-0 relative z-10"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Botao de Adicionar (Dashed) */}
      <button
        type="button"
        onClick={() => setModalAberto(true)}
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-lg border-2 border-dashed transition-all ${
          (podeAdicionarMod || podeAdicionarMald)
            ? 'border-zinc-700/60 hover:border-green-500/50 text-zinc-400 hover:text-green-400 hover:bg-green-950/10' 
            : 'border-zinc-800/50 text-zinc-700 cursor-not-allowed bg-zinc-900/10'
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        <span className="text-[11px] font-bold uppercase tracking-widest">
          Adicionar Aprimoramento
        </span>
      </button>

      {/* Modal de Selecao (Unificado) */}
      {modalAberto && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6" onClick={() => setModalAberto(false)}>
          <div 
            className="relative flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-[#0a0a0a] shadow-[0_0_40px_rgba(0,0,0,0.8)] ring-1 ring-white/5"
            onClick={e => e.stopPropagation()}
          >
            {/* Glow de borda no topo */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

            {/* Header */}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-white/5 bg-zinc-900/40 px-6 py-5">
              <div className="flex flex-col">
                <span className="font-display text-lg uppercase tracking-wider text-zinc-100 drop-shadow-md">Adicionar Aprimoramento</span>
                <span className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-semibold">Selecione modificações e maldições para o item</span>
              </div>
              <button 
                type="button" 
                onClick={() => setModalAberto(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Abas */}
            <div className="flex border-b border-white/5 bg-zinc-900/20 px-6 pt-2">
              <button
                type="button"
                onClick={() => setAbaModal('modificacoes')}
                className={`px-4 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors border-b-2 ${abaModal === 'modificacoes' ? 'text-green-400 border-green-500 bg-green-500/5' : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-zinc-800/30'}`}
              >
                Modificações
              </button>
              {!esconderMaldicoes && <button
                type="button"
                onClick={() => setAbaModal('maldicoes')}
                className={`px-4 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors border-b-2 ${abaModal === 'maldicoes' ? 'text-green-400 border-green-500 bg-green-500/5' : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-zinc-800/30'}`}
              >
                Maldições
              </button>}
            </div>
            
            {/* Filtros Extras para Maldicoes */}
              {abaModal === 'maldicoes' && (
                <div className="flex flex-wrap items-center gap-3 border-b border-white/5 bg-zinc-900/40 px-6 py-4 shadow-inner">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Filtrar por Elemento:</span>
                  <div className="flex flex-wrap gap-2">
                    {['Todos', 'Sangue', 'Morte', 'Conhecimento', 'Energia'].map(elem => {
                      const ativo = subAbaElemento === elem;
                      return (
                        <button
                          key={elem}
                          onClick={() => setSubAbaElemento(elem)}
                          className={`rounded px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all border ${
                            ativo
                              ? (() => {
                                  const elStr = elem.toLowerCase();
                                  if (elStr.includes('medo')) return 'border-zinc-400 bg-zinc-200/90 text-zinc-950 shadow-[0_0_10px_rgba(255,255,255,0.2)]';
                                  if (elStr.includes('sangue')) return 'border-red-900/80 bg-red-950/40 text-red-400 shadow-[0_0_10px_rgba(220,38,38,0.2)]';
                                  if (elStr.includes('morte')) return 'border-zinc-600 bg-black/60 text-white shadow-[0_0_10px_rgba(100,100,100,0.2)]';
                                  if (elStr.includes('conhecimento')) return 'border-yellow-900/80 bg-yellow-950/40 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]';
                                  if (elStr.includes('energia')) return 'border-purple-900/80 bg-purple-950/40 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
                                  if (elStr.includes('varia')) return 'border-blue-900/80 bg-blue-950/40 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
                                  return 'border-zinc-500 bg-zinc-800 text-zinc-100 shadow-[0_0_10px_rgba(255,255,255,0.1)]';
                                })()
                              : 'border-zinc-800/60 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 bg-zinc-900/30'
                          }`}
                        >
                          {elem}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Lista de Opoes */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {abaModal === 'modificacoes' && (
                <>
                  {modsDisponiveis.length === 0 ? (
                    <p className="text-xs text-zinc-500 font-semibold tracking-wide p-8 text-center uppercase">Nenhuma modificação disponível.</p>
                  ) : (
                    <div className="flex flex-col gap-4 w-full pb-4">
                        {modsDisponiveis.map(opcao => (
                          <div 
                            key={"mod-" + opcao.Codigo_Modif}
                            onClick={() => {
                              if (!podeAdicionarMod) return;
                              onAddMod(opcao.Codigo_Modif);
                              setModalAberto(false);
                            }}
                            className={`flex flex-col p-5 rounded-lg bg-zinc-900/30 border border-zinc-800/60 transition-all group ${podeAdicionarMod ? 'hover:border-green-500/50 hover:bg-zinc-900/80 cursor-pointer shadow hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden' : 'opacity-40 cursor-not-allowed'}`}
                          >
                            {podeAdicionarMod && (
                              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            )}
                            <span className="font-bold text-zinc-200 text-sm group-hover:text-green-400 transition-colors">{opcao.Nome_Modif}</span>
                            <span className="text-xs text-zinc-400 mt-2 leading-relaxed">{opcao.Descricao_Modif}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}

              {abaModal === 'maldicoes' && (
                <>
                  {maldsDisponiveis.length === 0 ? (
                    <p className="text-xs text-zinc-500 font-semibold tracking-wide p-8 text-center uppercase">Nenhuma maldição disponível para este filtro.</p>
                  ) : (
                    <div className="flex flex-col gap-4 w-full pb-36">
                        {maldsDisponiveis.map(opcao => {
                          const isVaria = opcao.Elemento_Mald?.toLowerCase() === 'varia' || opcao.Elemento_Mald?.toLowerCase() === 'lista';
                          const cores = getCorElemento(opcao.Elemento_Mald);
                          
                          let borderL = 'group-hover:bg-zinc-600';
                          if (opcao.Elemento_Mald) {
                            const elStr = opcao.Elemento_Mald.toLowerCase();
                            if (elStr.includes('medo')) borderL = 'group-hover:bg-zinc-300';
                            else if (elStr.includes('sangue')) borderL = 'group-hover:bg-red-500';
                            else if (elStr.includes('morte')) borderL = 'group-hover:bg-zinc-500';
                            else if (elStr.includes('conhecimento')) borderL = 'group-hover:bg-yellow-500';
                            else if (elStr.includes('energia')) borderL = 'group-hover:bg-purple-500';
                            else if (elStr.includes('varia')) borderL = 'group-hover:bg-blue-500';
                          }

                          return (
                            <div 
                              key={"mald-" + opcao.Codigo_Mald}
                              onClick={() => {
                                if (!podeAdicionarMald) return;
                                onAddMald(opcao.Codigo_Mald, isVaria ? (elementosVaria[opcao.Codigo_Mald] || 'Sangue') : undefined);
                                setModalAberto(false);
                              }}
                              className={`flex flex-col p-5 rounded-lg bg-zinc-900/30 border border-zinc-800/60 transition-all group ${podeAdicionarMald ? 'hover:border-zinc-700/80 hover:bg-zinc-900/80 cursor-pointer shadow hover:shadow-lg hover:-translate-y-0.5 relative focus-within:z-30' : 'opacity-40 cursor-not-allowed'}`}
                            >
                              {podeAdicionarMald && (
                                <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity ${borderL}`}></div>
                              )}
                              <div className="flex justify-between items-start gap-4">
                                <span className="font-bold text-zinc-200 text-sm group-hover:text-zinc-100 transition-colors pt-0.5">{opcao.Nome_Mald}</span>
                                
                                {isVaria ? (
                                  <div className="flex items-center gap-2 min-w-0 bg-zinc-950/50 p-1.5 rounded border border-zinc-800/80" onClick={e => e.stopPropagation()}>
                                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold px-1.5 hidden sm:inline">Elemento:</span>
                                    <CustomSelect 
                                      value={elementosVaria[opcao.Codigo_Mald] || 'Sangue'}
                                      onChange={val => setElementosVaria(prev => ({ ...prev, [opcao.Codigo_Mald]: val }))}
                                      options={[
                                        { value: 'Sangue', label: 'Sangue' },
                                        { value: 'Morte', label: 'Morte' },
                                        { value: 'Conhecimento', label: 'Conhecimento' },
                                        { value: 'Energia', label: 'Energia' }
                                      ]}
                                      wrapperClassName="w-auto"
                                      className="w-36 py-1 !text-[10px] !bg-zinc-900 uppercase font-bold tracking-widest border-zinc-700 hover:border-zinc-500"
                                      hideIcon={true}
                                    />
                                  </div>
                                ) : (
                                  <span className={`text-[10px] font-bold rounded-sm truncate uppercase tracking-wider w-fit mt-0.5 ${cores}`}>
                                    {opcao.Elemento_Mald}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-zinc-400 mt-3 leading-relaxed block">{opcao.Descricao_Mald}</span>
                              {opcao.Efeito && (
                                <span className="inline-block mt-3 px-3 py-1.5 rounded bg-green-950/20 border border-green-900/30 text-[11px] text-green-500/90 italic">
                                  {opcao.Efeito}
                                </span>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
