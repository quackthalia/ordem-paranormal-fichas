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
  if (!elemento) return 'bg-zinc-800 text-zinc-300 border-zinc-700';
  switch (elemento.toLowerCase()) {
    case 'sangue': return 'bg-red-950/40 text-red-400 border-red-900/50';
    case 'morte': return 'bg-zinc-950/40 text-zinc-400 border-zinc-800/50';
    case 'conhecimento': return 'bg-yellow-950/40 text-yellow-400 border-yellow-900/50';
    case 'energia': return 'bg-purple-950/40 text-purple-400 border-purple-900/50';
    case 'medo': return 'bg-white/5 text-white border-white/10';
    case 'varia':
    case 'lista': return 'bg-indigo-950/40 text-indigo-400 border-indigo-900/50';
    default: return 'bg-zinc-800 text-zinc-300 border-zinc-700';
  }
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
              className="group flex items-start justify-between p-3 bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all"
            >
              <div className="flex flex-col gap-1.5 pr-4">
                <span className="font-bold text-zinc-200 text-[13px]">{mod.Nome_Modif}</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{mod.Descricao_Modif}</p>
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
                className="group flex items-start justify-between p-3 bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all"
              >
                <div className="flex flex-col gap-1.5 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-200 text-[13px]">{mod.Nome_Mald}</span>
                    <span className={`inline-block border rounded px-1.5 py-px text-[9px] font-bold uppercase tracking-wider leading-tight flex-shrink-0 ${cores}`}>
                      {elementoReal}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">{mod.Descricao_Mald}</p>
                  {mod.Efeito && (
                    <p className="text-[10px] text-green-500 italic">Efeito: {mod.Efeito}</p>
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
          if (!podeAdicionarMod && podeAdicionarMald) setAbaModal('maldicoes');
          else if (podeAdicionarMod && !podeAdicionarMald) setAbaModal('modificacoes');
          setModalAberto(true);
        }}
        disabled={!podeAdicionarMod && !podeAdicionarMald}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed transition-all ${
          (podeAdicionarMod || podeAdicionarMald)
            ? 'border-zinc-700 hover:border-zinc-500 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30' 
            : 'border-zinc-800 text-zinc-700 cursor-not-allowed bg-zinc-900/20'
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        <span className="text-xs font-bold uppercase tracking-wider">
          {(podeAdicionarMod || podeAdicionarMald) ? 'Adicionar Aprimoramento' : 'Limite Atingido'}
        </span>
      </button>

      {/* Modal de Seleção (Unificado) */}
      {modalAberto && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-5" onClick={() => setModalAberto(false)}>
          <div 
            className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50" 
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
            <div className="flex border-b border-zinc-800 bg-zinc-950/50">
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
            
            {/* Filtros Extras para Maldições */}
            {abaModal === 'maldicoes' && (
              <div className="flex flex-wrap items-center gap-1.5 px-5 py-3 border-b border-zinc-800 bg-zinc-900/30">
                {['Todos', 'Sangue', 'Morte', 'Conhecimento', 'Energia'].map(elem => {
                  const ativo = subAbaElemento === elem;
                  return (
                    <button
                      key={elem}
                      onClick={() => setSubAbaElemento(elem)}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition border ${
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
            )}

            {/* Lista de Opções */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              {abaModal === 'modificacoes' && (
                <>
                  {!podeAdicionarMod && (
                    <p className="text-sm text-red-400/80 italic p-4 text-center font-bold">Limite de modificações atingido para a categoria deste item.</p>
                  )}
                  {podeAdicionarMod && modsDisponiveis.length === 0 ? (
                    <p className="text-sm text-zinc-500 italic p-6 text-center">Nenhuma modificação disponível.</p>
                  ) : podeAdicionarMod && (
                    modsDisponiveis.map(opcao => (
                      <div 
                        key={opcao.Codigo_Modif}
                        onClick={() => {
                          onAddMod(opcao.Codigo_Modif);
                          setModalAberto(false);
                        }}
                        className="flex flex-col p-4 rounded hover:bg-zinc-800/80 cursor-pointer transition-colors group border-b border-zinc-800/50 last:border-0"
                      >
                        <span className="font-bold text-zinc-200 text-sm group-hover:text-white transition-colors">{opcao.Nome_Modif}</span>
                        <span className="text-[12px] text-zinc-500 mt-1 leading-relaxed">{opcao.Descricao_Modif}</span>
                      </div>
                    ))
                  )}
                </>
              )}

              {abaModal === 'maldicoes' && (
                <>
                  {!podeAdicionarMald && (
                    <p className="text-sm text-red-400/80 italic p-4 text-center font-bold">As maldições do item já ocupam todo o espaço permitido pela categoria atual.</p>
                  )}
                  {podeAdicionarMald && maldsDisponiveis.length === 0 ? (
                    <p className="text-sm text-zinc-500 italic p-6 text-center">Nenhuma maldição disponível para este filtro.</p>
                  ) : podeAdicionarMald && (
                    maldsDisponiveis.map(opcao => {
                      const isVaria = opcao.Elemento_Mald?.toLowerCase() === 'varia' || opcao.Elemento_Mald?.toLowerCase() === 'lista';
                      const cores = getCorElemento(opcao.Elemento_Mald);
                      
                      return (
                        <div 
                          key={opcao.Codigo_Mald}
                          onClick={() => {
                            onAddMald(opcao.Codigo_Mald, isVaria ? (elementosVaria[opcao.Codigo_Mald] || 'Sangue') : undefined);
                            setModalAberto(false);
                          }}
                          className="flex flex-col p-4 rounded hover:bg-zinc-800/80 cursor-pointer transition-colors group border-b border-zinc-800/50 last:border-0"
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
                                    { value: 'Energia', label: 'Energia' }
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
                          <span className="text-[12px] text-zinc-500 mt-1 leading-relaxed">{opcao.Descricao_Mald}</span>
                          {opcao.Efeito && (
                            <span className="text-[11px] text-green-500 mt-1.5 italic">
                              {opcao.Efeito}
                            </span>
                          )}
                        </div>
                      );
                    })
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
