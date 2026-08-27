import React, { useState } from 'react';
import type { Maldicao } from '../types';
import { Collapse } from './Collapse';

interface MaldicoesSelectorProps {
  maldicoesAplicadas: number[];
  opcoesMaldicoes: Maldicao[];
  todasMaldicoes: Maldicao[];
  onAdd: (id: number) => void;
  onRemove: (index: number) => void;
  podeAdicionar: boolean;
}

export function MaldicoesSelector({
  maldicoesAplicadas = [],
  opcoesMaldicoes = [],
  todasMaldicoes = [],
  onAdd,
  onRemove,
  podeAdicionar
}: MaldicoesSelectorProps) {
  const [selecionando, setSelecionando] = useState(false);

  // Mapeia os IDs aplicados de volta para os objetos Maldicao
  const aplicadas = maldicoesAplicadas
    .map(id => todasMaldicoes.find(m => m.Codigo_Mald === id))
    .filter((m): m is Maldicao => m !== undefined);

  // Filtra opções que já foram aplicadas (uma maldição não pode ser repetida nela mesma)
  // E também filtra os elementos opressores
  const opcoesDisponiveis = opcoesMaldicoes.filter((opcao) => {
    if (maldicoesAplicadas.includes(opcao.Codigo_Mald)) return false;

    // Regra de opressores: (Morte <> Sangue) e (Energia <> Conhecimento)
    const elementoOpcao = opcao.Elemento_Mald.trim().toLowerCase();
    const temMorte = aplicadas.some(m => m.Elemento_Mald.trim().toLowerCase() === 'morte');
    const temSangue = aplicadas.some(m => m.Elemento_Mald.trim().toLowerCase() === 'sangue');
    const temEnergia = aplicadas.some(m => m.Elemento_Mald.trim().toLowerCase() === 'energia');
    const temConhecimento = aplicadas.some(m => m.Elemento_Mald.trim().toLowerCase().includes('conhec'));

    if (elementoOpcao === 'morte' && temSangue) return false;
    if (elementoOpcao === 'sangue' && temMorte) return false;
    if (elementoOpcao === 'energia' && temConhecimento) return false;
    if (elementoOpcao.includes('conhec') && temEnergia) return false;

    return true;
  });

  
  const getCorElemento = (elemento: string) => {
    const elStr = elemento.trim().toLowerCase();
    if (elStr.includes('medo')) return 'bg-zinc-200/80 text-zinc-950 px-2';
    if (elStr.includes('sangue')) return 'text-red-500';
    if (elStr.includes('morte')) return 'bg-black/50 text-white px-2 border border-zinc-700';
    if (elStr.includes('conhecimento')) return 'text-yellow-500';
    if (elStr.includes('energia')) return 'text-purple-500';
    return 'text-zinc-400';
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setSelecionando(!selecionando)}
          disabled={!podeAdicionar && !selecionando}
          className={`px-4 py-1.5 text-xs font-bold text-white rounded transition ${
            !podeAdicionar && !selecionando 
              ? 'bg-zinc-800 cursor-not-allowed text-zinc-500' 
              : 'bg-indigo-700 hover:bg-indigo-600'
          }`}
        >
          {selecionando ? 'Cancelar' : 'Adicionar'}
        </button>
      </div>

      <Collapse isOpen={selecionando}>
        <div className="rounded border border-indigo-900 bg-zinc-950 p-2 shadow-lg mb-2">
          <div className="text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-wider px-2">
            Selecione uma maldição
          </div>
          <div className="flex flex-col gap-1">
            {opcoesDisponiveis.length === 0 ? (
              <p className="text-xs text-zinc-500 italic px-2 pb-2">Nenhuma maldição disponível para este item.</p>
            ) : (
              opcoesDisponiveis.map(opcao => {
                const cores = getCorElemento(opcao.Elemento_Mald);
                return (
                  <div 
                    key={opcao.Codigo_Mald}
                    onClick={() => {
                      onAdd(opcao.Codigo_Mald);
                      setSelecionando(false);
                    }}
                    className="flex flex-col px-3 py-2 rounded bg-transparent hover:bg-zinc-900 border border-transparent hover:border-indigo-800 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-zinc-200 text-sm">{opcao.Nome_Mald}</span>
                      <span className={`inline-block rounded px-1.5 py-px text-[9px] font-bold uppercase tracking-wider leading-tight ${cores}`}>{opcao.Elemento_Mald}</span>
                    </div>
                    <span className="text-xs text-zinc-400 mt-1">{opcao.Descricao_Mald}</span>
                    {opcao.Efeito && (
                      <span className="text-[11px] text-zinc-500 mt-1 italic border-t border-zinc-800/50 pt-1">
                        Efeito: {opcao.Efeito}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Collapse>

      <div className="flex flex-col gap-2 rounded bg-zinc-950 border border-zinc-900 min-h-[56px]">
        {aplicadas.length === 0 ? (
          <div className="h-full min-h-[56px] w-full" />
        ) : (
          aplicadas.map((mod, index) => {
            const cores = getCorElemento(mod.Elemento_Mald);
            return (
              <div 
                key={`${mod.Codigo_Mald}-${index}`}
                className="flex items-center justify-between p-4 bg-zinc-900/50 border-l-[3px] border-l-indigo-600"
              >
                <div className="flex flex-col gap-1 flex-1 pr-6">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-100 text-[15px]">{mod.Nome_Mald}</span>
                    <span className={`inline-block rounded px-1.5 py-px text-[9px] font-bold uppercase tracking-wider leading-tight ${cores}`}>{mod.Elemento_Mald}</span>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {mod.Descricao_Mald}
                  </p>
                  {mod.Efeito && (
                    <p className="text-xs text-zinc-500 italic mt-1">Efeito: {mod.Efeito}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="px-4 py-1.5 text-xs font-bold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-red-900 rounded transition-colors flex-shrink-0"
                >
                  Remover
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
