import React, { useState } from 'react';
import type { Modificacao } from '../types';
import { Collapse } from './Collapse';

interface ModificacoesSelectorProps {
  modificacoesAplicadas: number[];
  opcoesModificacoes: Modificacao[];
  todasModificacoes: Modificacao[];
  onAdd: (id: number) => void;
  onRemove: (index: number) => void;
  podeAdicionar: boolean;
}

export function ModificacoesSelector({
  modificacoesAplicadas = [],
  opcoesModificacoes = [],
  todasModificacoes = [],
  onAdd,
  onRemove,
  podeAdicionar
}: ModificacoesSelectorProps) {
  const [selecionando, setSelecionando] = useState(false);

  const aplicadas = modificacoesAplicadas
    .map(id => todasModificacoes.find(m => m.Codigo_Modif === id))
    .filter(Boolean) as Modificacao[];

  const opcoesDisponiveis = opcoesModificacoes.filter(
    op => !modificacoesAplicadas.includes(op.Codigo_Modif)
  );

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
              ? 'border-zinc-700 hover:border-zinc-500 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30' 
              : 'border-zinc-800 text-zinc-700 cursor-not-allowed bg-zinc-900/20'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          <span className="text-xs font-bold uppercase tracking-wider">
            {podeAdicionar ? 'Adicionar Modificação' : 'Limite Atingido'}
          </span>
        </button>
      )}

      {/* Painel de Seleção */}
      <Collapse isOpen={selecionando}>
        <div className="flex flex-col border border-zinc-700/60 bg-zinc-900/80 rounded-lg overflow-hidden shadow-xl mb-1">
          <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-950/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Selecionar Modificação</span>
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
          
          <div className="flex flex-col max-h-[220px] overflow-y-auto custom-scrollbar p-1">
            {opcoesDisponiveis.length === 0 ? (
              <p className="text-xs text-zinc-500 italic p-3 text-center">Nenhuma modificação disponível.</p>
            ) : (
              opcoesDisponiveis.map(opcao => (
                <div 
                  key={opcao.Codigo_Modif}
                  onClick={() => {
                    onAdd(opcao.Codigo_Modif);
                    setSelecionando(false);
                  }}
                  className="flex flex-col px-3 py-2.5 rounded-md hover:bg-zinc-800/80 cursor-pointer transition-colors group"
                >
                  <span className="font-bold text-zinc-200 text-sm group-hover:text-white transition-colors">{opcao.Nome_Modif}</span>
                  <span className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{opcao.Descricao_Modif}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </Collapse>

      {/* Lista de Modificações Aplicadas */}
      <div className="flex flex-col gap-2 mt-1">
        {aplicadas.map((mod, index) => (
          <div 
            key={`${mod.Codigo_Modif}-${index}`}
            className="group flex items-start justify-between p-3 bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all"
          >
            <div className="flex flex-col gap-1 pr-4">
              <span className="font-bold text-zinc-200 text-[13px]">{mod.Nome_Modif}</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {mod.Descricao_Modif}
              </p>
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
        ))}
      </div>
    </div>
  );
}
