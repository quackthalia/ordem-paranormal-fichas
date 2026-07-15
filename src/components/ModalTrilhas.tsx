import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useRPG } from '../context/RPGContext';
import type { Trilha } from '../types';

function formatarDescricao(texto: string): string {
  if (!texto) return '';
  let resultado = texto;
  if (!resultado.includes('<') && !resultado.includes('&')) {
    resultado = resultado
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    resultado = resultado.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    resultado = resultado.replace(/_(.*?)_/g, '<em>$1</em>');
  }
  resultado = resultado.replace(/\n/g, '<br />');
  return resultado;
}

export function ModalTrilhas({
  onClose,
}: {
  onClose: () => void;
}) {
  const { classe, trilhasHook } = useRPG();
  const {
    trilhas,
    loading,
    error,
    trilhasExpandidas,
    toggleTrilhaExpandida,
    selecionarTrilha,
    nomePericia,
  } = trilhasHook;

  const [abaAtual, setAbaAtual] = useState<'classe' | 'gerais'>('classe');
  const [habilidadesExpandidas, setHabilidadesExpandidas] = useState<number[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, [onClose]);

  const trilhasFiltradas = useMemo(() => {
    return trilhas.filter((t) => {
      if (abaAtual === 'classe') {
        return t.Classe_Trilha === classe;
      }
      return t.Classe_Trilha === 'Geral';
    });
  }, [trilhas, abaAtual, classe]);

  const toggleHabilidade = (codigo: number) => {
    setHabilidadesExpandidas((prev) =>
      prev.includes(codigo) ? prev.filter((i) => i !== codigo) : [...prev, codigo]
    );
  };

  const handleEscolher = (trilha: Trilha) => {
    selecionarTrilha(trilha);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-5">
      <div
        ref={ref}
        className="flex h-full max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950 shadow-2xl shadow-black/50"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-5 py-4">
          <h2 className="font-display text-lg uppercase tracking-wide text-zinc-100">
            Selecionar Trilha <span className="text-red-500">(NEX 10%)</span>
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-red-500 transition"
          >
            ✕
          </button>
        </div>

        {/* Abas */}
        <div className="flex flex-wrap gap-1 border-b-2 border-red-900/30 bg-zinc-900/50 px-3 pt-3">
          <button
            onClick={() => setAbaAtual('classe')}
            className={`min-w-[70px] flex-1 rounded-t px-1 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
              abaAtual === 'classe'
                ? 'border border-b-0 border-red-900 bg-zinc-900 text-zinc-100'
                : 'border border-transparent text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
            }`}
          >
            Trilhas da Classe ({classe})
          </button>
          <button
            onClick={() => setAbaAtual('gerais')}
            className={`min-w-[70px] flex-1 rounded-t px-1 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
              abaAtual === 'gerais'
                ? 'border border-b-0 border-red-900 bg-zinc-900 text-zinc-100'
                : 'border border-transparent text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
            }`}
          >
            Trilhas Gerais
          </button>
        </div>

        {/* Lista de Trilhas */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {loading && <div className="text-center italic text-zinc-500 mt-5">Carregando trilhas...</div>}
          {error && <div className="text-center italic text-red-500 mt-5">Erro: {error}</div>}

          {!loading && !error && trilhasFiltradas.length === 0 && (
            <div className="text-center italic text-zinc-500 mt-5">Nenhuma trilha encontrada.</div>
          )}

          {trilhasFiltradas.map((trilha) => {
            const estaExpandida = trilhasExpandidas.includes(trilha.Codigo_Trilha);
            const nexLevels = [10, 40, 65, 99];

            return (
              <div key={trilha.Codigo_Trilha} className="mb-3 overflow-hidden rounded-r border-l-4 border-indigo-700 bg-zinc-950/60">
                <div
                  onClick={() => toggleTrilhaExpandida(trilha.Codigo_Trilha)}
                  className="flex cursor-pointer items-center justify-between gap-3 bg-zinc-900/80 px-4 py-3 transition hover:bg-zinc-800/80"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-100">{trilha.Nome_Trilha}</span>
                    <span className="inline-block rounded bg-indigo-900/40 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider leading-tight text-indigo-300 border border-indigo-800">
                      {nomePericia(trilha.Perícia_Trilha)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEscolher(trilha); }}
                      className="rounded bg-red-700 px-3.5 py-1.5 text-xs font-bold uppercase text-zinc-100 transition hover:bg-red-600"
                    >
                      Escolher
                    </button>
                    <span className="w-5 text-center text-zinc-600">
                      {estaExpandida ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {estaExpandida && (
                  <div className="p-4 text-sm text-zinc-400">
                    <div
                      className="mb-4 text-zinc-300"
                      dangerouslySetInnerHTML={{ __html: formatarDescricao(trilha.Descricao_Trilha) }}
                    />

                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-400 border-b border-zinc-800 pb-1">
                      Habilidades da Trilha
                    </h4>

                    {nexLevels.map((nexLvl) => {
                      const habNameKey = `Nome_Habilidade_${nexLvl}` as keyof Trilha;
                      const habDescKey = `Descricao_Habilidade_${nexLvl}` as keyof Trilha;
                      const nomeHab = trilha[habNameKey] as string;
                      const descHab = trilha[habDescKey] as string;

                      if (!nomeHab) return null;

                      // Usamos um ID único para cada habilidade dentro da trilha para expandir
                      const uniqueHabId = trilha.Codigo_Trilha * 1000 + nexLvl;
                      const isHabExpanded = habilidadesExpandidas.includes(uniqueHabId);

                      return (
                        <div key={nexLvl} className="mb-2 overflow-hidden rounded border border-zinc-800 bg-zinc-900/50">
                          <div
                            onClick={() => toggleHabilidade(uniqueHabId)}
                            className="flex cursor-pointer items-center justify-between px-3 py-2 transition hover:bg-zinc-800"
                          >
                            <span className="font-bold text-zinc-200 text-xs">
                              Nex {nexLvl}% - <span className="text-zinc-400">{nomeHab}</span>
                            </span>
                            <span className="text-xs text-zinc-600">
                              {isHabExpanded ? '▲' : '▼'}
                            </span>
                          </div>
                          {isHabExpanded && (
                            <div
                              className="px-3 pb-3 pt-1 text-xs text-zinc-400"
                              dangerouslySetInnerHTML={{ __html: formatarDescricao(descHab) }}
                            />
                          )}
                        </div>
                      );
                    })}
                    {trilha.Fonte_Trilha && (
                       <div className="mt-3 flex justify-end">
                         <span className="text-[10px] text-zinc-600">Fonte: {trilha.Fonte_Trilha}</span>
                       </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
