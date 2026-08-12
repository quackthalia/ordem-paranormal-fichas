import React, { useState } from 'react';
import type { Modificacao } from '../types';

interface ModificacoesSelectorProps {
  modificacoesAplicadas: number[];
  opcoesModificacoes: Modificacao[];
  todasModificacoes: Modificacao[];
  onAdd: (id: number) => void;
  onRemove: (index: number) => void;
  podeAdicionar: boolean;
  permiteDuplicadas?: (codigo: number) => boolean;
}

export function ModificacoesSelector({
  modificacoesAplicadas = [],
  opcoesModificacoes = [],
  todasModificacoes = [],
  onAdd,
  onRemove,
  podeAdicionar,
  permiteDuplicadas
}: ModificacoesSelectorProps) {
  const [selecionando, setSelecionando] = useState(false);

  // Mapeia os IDs aplicados de volta para os objetos Modificacao
  const aplicadas = modificacoesAplicadas
    .map(id => todasModificacoes.find(m => m.Codigo_Modif === id))
    .filter((m): m is Modificacao => m !== undefined);

  // Filtra opções que já foram aplicadas (se a modificação não permitir duplicatas)
  const opcoesDisponiveis = opcoesModificacoes.filter((opcao) => {
    if (permiteDuplicadas?.(opcao.Codigo_Modif)) return true;
    return !modificacoesAplicadas.includes(opcao.Codigo_Modif);
  });

  return (
    <div className="flex flex-col gap-3 mt-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-zinc-100">Melhorias</h4>
        <button
          type="button"
          onClick={() => setSelecionando(!selecionando)}
          disabled={!podeAdicionar && !selecionando}
          className={`px-4 py-1.5 text-xs font-bold text-white rounded transition ${
            !podeAdicionar && !selecionando 
              ? 'bg-zinc-800 cursor-not-allowed text-zinc-500' 
              : 'bg-green-700 hover:bg-green-600'
          }`}
        >
          {selecionando ? 'Cancelar' : 'Adicionar'}
        </button>
      </div>

      {selecionando && (
        <div className="rounded border border-green-900 bg-zinc-950 p-2 shadow-lg mb-2 animate-in slide-in-from-top-1 fade-in duration-200">
          <div className="text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-wider px-2">
            Selecione uma modificação
          </div>
          <div className="flex flex-col gap-1">
            {opcoesDisponiveis.length === 0 ? (
              <p className="text-xs text-zinc-500 italic px-2 pb-2">Nenhuma modificação disponível.</p>
            ) : (
              opcoesDisponiveis.map(opcao => (
                <div 
                  key={opcao.Codigo_Modif}
                  onClick={() => {
                    onAdd(opcao.Codigo_Modif);
                    setSelecionando(false);
                  }}
                  className="flex flex-col px-3 py-2 rounded bg-transparent hover:bg-zinc-900 border border-transparent hover:border-green-800 cursor-pointer transition-colors"
                >
                  <span className="font-bold text-zinc-200 text-sm">{opcao.Nome_Modif}</span>
                  <span className="text-xs text-zinc-500 mt-1">{opcao.Descricao_Modif}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 rounded bg-zinc-950 border border-zinc-900 min-h-[56px]">
        {aplicadas.length === 0 ? (
          <div className="h-full min-h-[56px] w-full" />
        ) : (
          aplicadas.map((mod, index) => (
            <div 
              key={`${mod.Codigo_Modif}-${index}`}
              className="flex items-center justify-between p-4 bg-zinc-900/50 border-l-[3px] border-l-green-600"
            >
              <div className="flex flex-col gap-1 flex-1 pr-6">
                <span className="font-bold text-zinc-100 text-[15px]">{mod.Nome_Modif}</span>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {mod.Descricao_Modif}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="px-4 py-1.5 text-xs font-bold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-green-700 rounded transition-colors flex-shrink-0"
              >
                Remover
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
