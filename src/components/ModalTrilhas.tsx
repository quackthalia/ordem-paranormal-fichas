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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        ref={ref}
        className="flex h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded border border-zinc-700 bg-zinc-900 shadow-2xl"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 p-4">
          <h2 className="text-xl font-bold uppercase tracking-wider text-red-500">
            Selecionar Trilha
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-red-500"
          >
            ✕
          </button>
        </div>

        {/* Abas */}
        <div className="flex gap-2 border-b border-zinc-800 bg-zinc-950/50 p-2">
          <button
            onClick={() => setAbaAtual('classe')}
            className={`flex-1 rounded py-2 text-sm font-bold uppercase transition ${
              abaAtual === 'classe'
                ? 'bg-red-800 text-zinc-100 shadow'
                : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            Trilhas da Classe ({classe})
          </button>
          <button
            onClick={() => setAbaAtual('gerais')}
            className={`flex-1 rounded py-2 text-sm font-bold uppercase transition ${
              abaAtual === 'gerais'
                ? 'bg-red-800 text-zinc-100 shadow'
                : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            Trilhas Gerais
          </button>
        </div>

        {/* Lista de Trilhas */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading && <div className="text-center text-zinc-500 mt-10">Carregando trilhas...</div>}
          {error && <div className="text-center text-red-500 mt-10">Erro: {error}</div>}

          {!loading && !error && trilhasFiltradas.length === 0 && (
            <div className="text-center text-zinc-500 mt-10">Nenhuma trilha encontrada.</div>
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
                    <span className="text-[10px] uppercase text-zinc-500">
                      ({nomePericia(trilha.Perícia_Trilha)})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEscolher(trilha); }}
                      className="rounded bg-indigo-700 px-3.5 py-1.5 text-xs font-bold uppercase text-zinc-100 transition hover:bg-indigo-600"
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
