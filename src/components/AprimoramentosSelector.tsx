import React, { useState } from 'react';
import type { Modificacao, Maldicao } from '../types';
import { CustomSelect } from './CustomSelect';

interface AprimoramentosSelectorProps {
  // Modificações
  modificacoesAplicadas: number[];
  opcoesModificacoes: Modificacao[];
  todasModificacoes: Modificacao[];
  onAddMod: (id: number) => void;
  onRemoveMod: (index: number) => void;
  podeAdicionarMod: boolean;

  // Maldições
  maldicoesAplicadas: number[];
  opcoesMaldicoes: Maldicao[];
  todasMaldicoes: Maldicao[];
  maldicoesElementos?: Record<number, string>;
  onAddMald: (id: number, elemento?: string) => void;
  onRemoveMald: (index: number) => void;
  podeAdicionarMald: boolean;
}


const getCorElemento = (elemento?: string) => {
  if (!elemento) return 'bg-zinc-800/50 text-zinc-400';
  const elStr = elemento.toLowerCase();
  if (elStr.includes('medo')) return 'bg-zinc-200/80 text-zinc-950';
  if (elStr.includes('sangue')) return 'bg-red-950/20 text-red-500';
  if (elStr.includes('morte')) return 'bg-black/50 text-zinc-200';
  if (elStr.includes('conhecimento')) return 'bg-yellow-950/20 text-yellow-500';
  if (elStr.includes('energia')) return 'bg-purple-950/20 text-purple-500';
  if (elStr.includes('varia') || elStr.includes('lista')) return 'bg-blue-950/20 text-blue-400';
  return 'bg-zinc-800/50 text-zinc-400';
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
  podeAdicionarMald
}: AprimoramentosSelectorProps) {
  const [modalAberto, setModalAberto] = useState(false);
  const [abaModal, setAbaModal] = useState<'modificacoes' | 'maldicoes'>('modificacoes');
  
  // Estado local para o seletor de elemento da maldição
  const [subAbaElemento, setSubAbaElemento] = useState<string>('Todos');
  const [elementosVaria, setElementosVaria] = useState<Record<number, string>>({});

  // Arrays de aplicadas completas
  const modsAplicadasFull = modificacoesAplicadas
    .map(id => todasModificacoes.find(m => m.Codigo_Modif === id))
    .filter(Boolean) as Modificacao[];

  const maldsAplicadasFull = maldicoesAplicadas
    .map(id => todasMaldicoes.find(m => m.Codigo_Mald === id))
    .filter(Boolean) as Maldicao[];

  const temAprimoramentos = modsAplicadasFull.length > 0 || maldsAplicadasFull.length > 0;

  // Filtros
  const modsDisponiveis = opcoesModificacoes.filter(op => !modificacoesAplicadas.includes(op.Codigo_Modif));
  let maldsDisponiveis = opcoesMaldicoes.filter(op => !maldicoesAplicadas.includes(op.Codigo_Mald));
  
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
        <div className="flex flex-col gap-2 mb-2">
          {modsAplicadasFull.map((mod, index) => (
            <div 
              key={`mod-${mod.Codigo_Modif}-${index}`}
              className="group flex items-start justify-between p-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded transition-all"
            >
              <div className="flex flex-col gap-1.5 pr-4">
                <span className="font-bold text-zinc-200 text-[15px]">{mod.Nome_Modif}</span>
                <p className="text-sm text-zinc-400 leading-relaxed mt-1">{mod.Descricao_Modif}</p>
              </div>
              <button
                type="button"
                onClick={() => onRemoveMod(index)}
                title="Remover Modificação"
                className="text-zinc-600 hover:text-red-400 p-1.5 opacity-60 group-hover:opacity-100 hover:bg-red-950/30 rounded transition-all flex-shrink-0"
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
                className="group flex items-start justify-between p-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded transition-all"
              >
                <div className="flex flex-col gap-1.5 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-200 text-[15px]">{mod.Nome_Mald}</span>
                    <span className={`inline-block rounded px-1.5 py-px text-[10px] font-bold uppercase tracking-wider leading-tight flex-shrink-0 mt-0.5 ${cores}`}>
                      {elementoReal}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed mt-1">{mod.Descricao_Mald}</p>
                  {mod.Efeito && (
                    <p className="text-xs text-green-500 italic mt-1">Efeito: {mod.Efeito}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveMald(index)}
                  title="Remover Maldição"
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
      )}

      {/* Botão de Adicionar (Dashed) */}
      <button
        type="button"
        onClick={() => {
          
          setModalAberto(true);
        }}
        
        className={`w-full flex items-center justify-center gap-2 py-3 rounded border-2 border-dashed transition-all ${
          (podeAdicionarMod || podeAdicionarMald)
            ? 'border-zinc-700 hover:border-zinc-500 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30' 
            : 'border-zinc-800 text-zinc-700 cursor-not-allowed bg-zinc-900/20'
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        <span className="text-xs font-bold uppercase tracking-wider">
          'Adicionar Aprimoramento'
        </span>
      </button>

      {/* Modal de Seleção (Unificado) */}
      {modalAberto && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-5" onClick={() => setModalAberto(false)}>
          <div 
            className="flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950 shadow-2xl shadow-black/50"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-5 py-4">
              <span className="font-bold text-zinc-100 uppercase tracking-wider text-sm">Adicionar Aprimoramento</span>
              <button 
                type="button" 
                onClick={() => setModalAberto(false)}
                className="text-zinc-500 hover:text-zinc-300 p-1 rounded hover:bg-zinc-800 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Abas */}
            <div className="flex border-b border-zinc-800 bg-zinc-950">
              <button
                type="button"
                onClick={() => setAbaModal('modificacoes')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${abaModal === 'modificacoes' ? 'text-green-500 border-b-2 border-green-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
              >
                Modificações
              </button>
              <button
                type="button"
                onClick={() => setAbaModal('maldicoes')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${abaModal === 'maldicoes' ? 'text-green-500 border-b-2 border-green-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
              >
                Maldições
              </button>
            </div>
            
            {/* Filtros Extras para Maldicoes */}
              {abaModal === 'maldicoes' && (
                <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 bg-zinc-900/90 px-4 py-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Elementos:</span>
                  <button
                    onClick={() => setSubAbaElemento('Todos')}
                    className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
                      subAbaElemento === 'Todos'
                        ? 'bg-green-900/40 text-green-300 border border-green-800'
                        : 'bg-zinc-800/60 text-zinc-500 border border-zinc-700 hover:text-zinc-300'
                    }`}
                  >
                    Todos
                  </button>
                  {['Sangue', 'Morte', 'Conhecimento', 'Energia', 'Varia'].map(elem => {
                    const ativo = subAbaElemento === elem;
                    return (
                      <button
                        key={elem}
                        onClick={() => setSubAbaElemento(elem)}
                        className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition border ${
                          ativo
                            ? (() => {
                                const elStr = elem.toLowerCase();
                                if (elStr.includes('medo')) return 'border-zinc-500 bg-zinc-200/80 text-zinc-950 px-3';
                                if (elStr.includes('sangue')) return 'border-red-900 bg-red-950/20 text-red-500';
                                if (elStr.includes('morte')) return 'border-zinc-700 bg-black/50 text-white px-3';
                                if (elStr.includes('conhecimento')) return 'border-yellow-900 bg-yellow-950/20 text-yellow-500';
                                if (elStr.includes('energia')) return 'border-purple-900 bg-purple-950/20 text-purple-500';
                                if (elStr.includes('varia')) return 'border-blue-900 bg-blue-950/20 text-blue-400';
                                return 'border-zinc-600 text-zinc-100';
                              })()
                            : 'border-transparent text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
                        }`}
                      >
                        {elem}
                      </button>
                    );
                  })}
                </div>
              )}
  
            {/* Lista de Opções */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
              {abaModal === 'modificacoes' && (
                <>
                  {modsDisponiveis.length === 0 ? (
                    <p className="text-sm text-zinc-500 italic p-6 text-center">Nenhuma modificação disponível.</p>
                  ) : (
                    <div className="flex flex-col gap-3 w-full pb-4">
                        {modsDisponiveis.map(opcao => (
                          <div 
                            key={"mod-" + opcao.Codigo_Modif}
                            onClick={() => {
                              if (!podeAdicionarMod) return;
                              onAddMod(opcao.Codigo_Modif);
                              setModalAberto(false);
                            }}
                            className={`flex flex-col p-4 rounded bg-zinc-900/40 border-l-[3px] border-l-zinc-500 border border-zinc-800 transition group ${podeAdicionarMod ? 'hover:border-green-500/50 hover:border-l-green-500 hover:bg-zinc-900/80 cursor-pointer shadow-sm hover:shadow' : 'opacity-50 cursor-not-allowed'}`}
                          >
                            <span className="font-bold text-zinc-200 text-sm group-hover:text-green-400 transition-colors">{opcao.Nome_Modif}</span>
                            <span className="text-[12px] text-zinc-400 mt-1.5 leading-relaxed">{opcao.Descricao_Modif}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}

              {abaModal === 'maldicoes' && (
                <>
                  {maldsDisponiveis.length === 0 ? (
                    <p className="text-sm text-zinc-500 italic p-6 text-center">Nenhuma maldição disponível para este filtro.</p>
                  ) : (
                    <div className="flex flex-col gap-3 w-full pb-4">
                        {maldsDisponiveis.map(opcao => {
                          const isVaria = opcao.Elemento_Mald?.toLowerCase() === 'varia' || opcao.Elemento_Mald?.toLowerCase() === 'lista';
                          const cores = getCorElemento(opcao.Elemento_Mald);
                          
                          let borderL = 'border-l-zinc-600';
                          if (opcao.Elemento_Mald) {
                            const elStr = opcao.Elemento_Mald.toLowerCase();
                            if (elStr.includes('medo')) borderL = 'border-l-zinc-500';
                            else if (elStr.includes('sangue')) borderL = 'border-l-red-900';
                            else if (elStr.includes('morte')) borderL = 'border-l-zinc-700';
                            else if (elStr.includes('conhecimento')) borderL = 'border-l-yellow-900';
                            else if (elStr.includes('energia')) borderL = 'border-l-purple-900';
                            else if (elStr.includes('varia')) borderL = 'border-l-blue-900';
                          }

                          return (
                            <div 
                              key={"mald-" + opcao.Codigo_Mald}
                              onClick={() => {
                                if (!podeAdicionarMald) return;
                                onAddMald(opcao.Codigo_Mald, isVaria ? (elementosVaria[opcao.Codigo_Mald] || 'Sangue') : undefined);
                                setModalAberto(false);
                              }}
                              className={`flex flex-col p-4 rounded bg-zinc-900/40 border-l-[3px] ${borderL} border border-zinc-800 transition group ${podeAdicionarMald ? 'hover:border-green-500/50 hover:bg-zinc-900/80 hover:border-l-green-500 cursor-pointer shadow-sm hover:shadow' : 'opacity-50 cursor-not-allowed'}`}
                            >
                              <div className="flex justify-between items-center gap-2">
                                <span className="font-bold text-zinc-200 text-sm group-hover:text-green-400 transition-colors">{opcao.Nome_Mald}</span>
                                
                                {isVaria ? (
                                  <div className="flex gap-2 min-w-0 bg-zinc-950 p-1 rounded border border-zinc-800" onClick={e => e.stopPropagation()}>
                                    <span className="text-[0.55rem] text-zinc-500 uppercase font-bold px-1 hidden sm:inline self-center">Elemento:</span>
                                    <CustomSelect 
                                      value={elementosVaria[opcao.Codigo_Mald] || 'Sangue'}
                                      onChange={val => setElementosVaria(prev => ({ ...prev, [opcao.Codigo_Mald]: val }))}
                                      options={[
                                        { value: 'Sangue', label: 'Sangue' },
                                        { value: 'Morte', label: 'Morte' },
                                        { value: 'Conhecimento', label: 'Conhecimento' },
                                        { value: 'Energia', label: 'Energia' }
                                      ]}
                                      className="w-28 py-0.5 !text-[10px] !bg-zinc-950 uppercase font-bold tracking-wider"
                                      hideIcon={true}
                                    />
                                  </div>
                                ) : (
                                  <span className={`inline-block rounded px-1.5 py-px text-[9px] font-bold uppercase tracking-wider leading-tight flex-shrink-0 ${cores}`}>
                                    {opcao.Elemento_Mald}
                                  </span>
                                )}
                              </div>
                              <span className="text-[12px] text-zinc-400 mt-2 leading-relaxed">{opcao.Descricao_Mald}</span>
                              {opcao.Efeito && (
                                <span className="text-[11px] text-green-500 mt-2 italic">
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
