import React, { useMemo, useState } from 'react';
import { useRPG } from '../context/RPGContext';
import type { Trilha } from '../types';
import { calcularNivel } from '../utils/rpgRules';
import { Collapse } from './Collapse';

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
  modoVersatilidade,
}: {
  onClose: () => void;
  modoVersatilidade?: boolean;
}) {
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const { classe, trilhasHook, regras } = useRPG();
  const {
    trilhas,
    loading,
    error,
    trilhasExpandidas,
    toggleTrilhaExpandida,
    selecionarTrilha,
    selecionarVersatilidade,
    nomePericia,
    trilhaSelecionada,
  } = trilhasHook;

  const [abaAtual, setAbaAtual] = useState<'classe' | 'gerais'>('classe');
  const [habilidadesExpandidas, setHabilidadesExpandidas] = useState<number[]>([]);
  const [busca, setBusca] = useState('');

  const trilhasFiltradas = useMemo(() => {
    return trilhas.filter((t) => {
      // No modo versatilidade, não pode escolher a própria trilha atual
      if (modoVersatilidade && trilhaSelecionada && Number(t.Codigo_Trilha) === Number(trilhaSelecionada.Codigo_Trilha)) {
        return false;
      }
      if (abaAtual === 'classe') {
        if (t.Classe_Trilha !== classe) return false;
      } else {
        if (t.Classe_Trilha !== 'Geral') return false;
      }
      
      if (busca.trim()) {
        const lower = busca.toLowerCase();
        if (!t.Nome_Trilha.toLowerCase().includes(lower)) return false;
      }

      return true;
    });
  }, [trilhas, abaAtual, classe, modoVersatilidade, trilhaSelecionada, busca]);

  const toggleHabilidade = (codigo: number) => {
    setHabilidadesExpandidas((prev) =>
      prev.includes(codigo) ? prev.filter((i) => i !== codigo) : [...prev, codigo]
    );
  };

  const handleEscolher = (trilha: Trilha) => {
    if (modoVersatilidade) {
      selecionarVersatilidade(trilha);
    } else {
      selecionarTrilha(trilha);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans" onClick={onClose}>
      <div
        className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col border-b border-zinc-800 p-5 pb-4 bg-zinc-900/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg uppercase tracking-wide text-zinc-100">
                {modoVersatilidade ? 'SELECIONAR VERSATILIDADE' : 'SELECIONAR TRILHA'} 
                <span className="text-green-500 ml-2">({modoVersatilidade ? 'NEX 50%' : 'NEX 10%'})</span>
              </h2>
              <p className="mt-1 text-xs text-zinc-400">Selecione uma opção da lista abaixo.</p>
            </div>
            <button
              onClick={onClose}
              className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100"
            >
              &times;
            </button>
          </div>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar trilha..."
            className="flex-1 rounded border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-green-700"
          />
        </div>

        {/* Abas */}
        <div className="flex flex-wrap gap-1 border-b border-zinc-800 bg-zinc-900/50 px-4 pt-3">
          <button
            onClick={() => setAbaAtual('classe')}
            className={`min-w-[70px] flex-1 rounded-t px-1 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
              abaAtual === 'classe'
                ? 'border border-b-0 border-green-900 bg-zinc-900 text-zinc-100'
                : 'border border-transparent text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
            }`}
          >
            Trilhas da Classe ({classe})
          </button>
          <button
            onClick={() => setAbaAtual('gerais')}
            className={`min-w-[70px] flex-1 rounded-t px-1 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
              abaAtual === 'gerais'
                ? 'border border-b-0 border-green-900 bg-zinc-900 text-zinc-100'
                : 'border border-transparent text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
            }`}
          >
            Trilhas Gerais
          </button>
        </div>

        {/* Lista de Trilhas */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading && <div className="text-center italic text-zinc-500 mt-5">Carregando trilhas...</div>}
          {error && <div className="text-center italic text-red-500 mt-5">Erro: {error}</div>}

          {!loading && !error && trilhasFiltradas.length === 0 && (
            <div className="text-center italic text-zinc-500 mt-5">Nenhuma trilha encontrada.</div>
          )}

          <div className="flex flex-col md:flex-row gap-3 items-start">
            <div className="flex flex-col gap-3 w-full md:w-1/2 flex-1 min-w-0">
              {trilhasFiltradas.filter((_, i) => i % 2 === 0).map((trilha) => {
                const estaExpandida = trilhasExpandidas.includes(trilha.Codigo_Trilha);
                const nexLevels = [10, 40, 65, 99];

                return (
                  <div key={trilha.Codigo_Trilha} className="bg-zinc-900/40 border border-zinc-800/80 rounded p-3 hover:border-green-500/50 hover:bg-zinc-900/80 transition group flex flex-col">
                    <div
                      onClick={() => toggleTrilhaExpandida(trilha.Codigo_Trilha)}
                      className="flex cursor-pointer justify-between items-start mb-2"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-zinc-200 group-hover:text-green-400 transition uppercase tracking-wider text-sm">{trilha.Nome_Trilha}</span>
                        <span className="text-[10px] uppercase text-zinc-500 tracking-wider">
                          ({nomePericia(trilha.Perícia_Trilha)})
                        </span>
                      </div>
                      <span className="text-zinc-500 text-xs mt-1">
                        {estaExpandida ? '▲' : '▼'}
                      </span>
                    </div>

                    <Collapse isOpen={estaExpandida} previewHeight="4.5em">
                      <div className="text-xs text-zinc-400 mb-4 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatarDescricao(trilha.Descricao_Trilha) }} />
                    </Collapse>

                    <Collapse isOpen={estaExpandida}>
                      <div className="flex flex-col gap-2 mb-4">
                        <h4 className="mb-1 mt-2 text-[10px] font-bold uppercase tracking-wider text-green-500 border-b border-zinc-800/50 pb-1">
                          Habilidades da Trilha
                        </h4>

                        {(modoVersatilidade ? [10] : nexLevels).map((nexLvl) => {
                          const habNameKey = `Nome_Habilidade_${nexLvl}` as keyof Trilha;
                          const habDescKey = `Descricao_Habilidade_${nexLvl}` as keyof Trilha;
                          const nomeHab = trilha[habNameKey] as string;
                          const descHab = trilha[habDescKey] as string;

                          if (!nomeHab) return null;

                          const uniqueHabId = trilha.Codigo_Trilha * 1000 + nexLvl;
                          const isHabExpanded = habilidadesExpandidas.includes(uniqueHabId);

                          return (
                            <div key={nexLvl} className="rounded border border-zinc-800 bg-zinc-950/50 overflow-hidden transition">
                              <div
                                onClick={() => toggleHabilidade(uniqueHabId)}
                                className="flex cursor-pointer justify-between items-center p-2 hover:bg-zinc-800/50 transition"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="inline-block rounded bg-zinc-800 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider leading-tight text-green-400">
                                    {regras['nex_experiencia'] ? `NV ${calcularNivel(nexLvl)}` : `${nexLvl}%`}
                                  </span>
                                  <span className="font-bold text-zinc-200 text-xs">{nomeHab}</span>
                                </div>
                                <span className="text-[10px] text-zinc-500">
                                  {isHabExpanded ? '▲' : '▼'}
                                </span>
                              </div>
                              <Collapse isOpen={isHabExpanded}>
                                <div className="px-3 py-2 border-t border-zinc-800/50 bg-zinc-950/80">
                                  <div
                                    className="text-[11px] leading-relaxed text-zinc-400"
                                    dangerouslySetInnerHTML={{ __html: formatarDescricao(descHab) }}
                                  />
                                </div>
                              </Collapse>
                            </div>
                          );
                        })}
                        {trilha.Fonte_Trilha && (
                           <div className="mt-2 flex justify-end">
                             <span className="text-[10px] text-zinc-600">Fonte: {trilha.Fonte_Trilha}</span>
                           </div>
                        )}
                      </div>
                    </Collapse>

                    <div className="flex flex-wrap items-center gap-2 mt-auto text-[11px] border-t border-zinc-800/50 pt-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEscolher(trilha); }}
                        className="ml-auto px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors active:scale-95"
                      >
                        Escolher
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 w-full md:w-1/2 flex-1 min-w-0">
              {trilhasFiltradas.filter((_, i) => i % 2 !== 0).map((trilha) => {
                const estaExpandida = trilhasExpandidas.includes(trilha.Codigo_Trilha);
                const nexLevels = [10, 40, 65, 99];

                return (
                  <div key={trilha.Codigo_Trilha} className="bg-zinc-900/40 border border-zinc-800/80 rounded p-3 hover:border-green-500/50 hover:bg-zinc-900/80 transition group flex flex-col">
                    <div
                      onClick={() => toggleTrilhaExpandida(trilha.Codigo_Trilha)}
                      className="flex cursor-pointer justify-between items-start mb-2"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-zinc-200 group-hover:text-green-400 transition uppercase tracking-wider text-sm">{trilha.Nome_Trilha}</span>
                        <span className="text-[10px] uppercase text-zinc-500 tracking-wider">
                          ({nomePericia(trilha.Perícia_Trilha)})
                        </span>
                      </div>
                      <span className="text-zinc-500 text-xs mt-1">
                        {estaExpandida ? '▲' : '▼'}
                      </span>
                    </div>

                    <Collapse isOpen={estaExpandida} previewHeight="4.5em">
                      <div className="text-xs text-zinc-400 mb-4 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatarDescricao(trilha.Descricao_Trilha) }} />
                    </Collapse>

                    <Collapse isOpen={estaExpandida}>
                      <div className="flex flex-col gap-2 mb-4">
                        <h4 className="mb-1 mt-2 text-[10px] font-bold uppercase tracking-wider text-green-500 border-b border-zinc-800/50 pb-1">
                          Habilidades da Trilha
                        </h4>

                        {(modoVersatilidade ? [10] : nexLevels).map((nexLvl) => {
                          const habNameKey = `Nome_Habilidade_${nexLvl}` as keyof Trilha;
                          const habDescKey = `Descricao_Habilidade_${nexLvl}` as keyof Trilha;
                          const nomeHab = trilha[habNameKey] as string;
                          const descHab = trilha[habDescKey] as string;

                          if (!nomeHab) return null;

                          const uniqueHabId = trilha.Codigo_Trilha * 1000 + nexLvl;
                          const isHabExpanded = habilidadesExpandidas.includes(uniqueHabId);

                          return (
                            <div key={nexLvl} className="rounded border border-zinc-800 bg-zinc-950/50 overflow-hidden transition">
                              <div
                                onClick={() => toggleHabilidade(uniqueHabId)}
                                className="flex cursor-pointer justify-between items-center p-2 hover:bg-zinc-800/50 transition"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="inline-block rounded bg-zinc-800 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider leading-tight text-green-400">
                                    {regras['nex_experiencia'] ? `NV ${calcularNivel(nexLvl)}` : `${nexLvl}%`}
                                  </span>
                                  <span className="font-bold text-zinc-200 text-xs">{nomeHab}</span>
                                </div>
                                <span className="text-[10px] text-zinc-500">
                                  {isHabExpanded ? '▲' : '▼'}
                                </span>
                              </div>
                              <Collapse isOpen={isHabExpanded}>
                                <div className="px-3 py-2 border-t border-zinc-800/50 bg-zinc-950/80">
                                  <div
                                    className="text-[11px] leading-relaxed text-zinc-400"
                                    dangerouslySetInnerHTML={{ __html: formatarDescricao(descHab) }}
                                  />
                                </div>
                              </Collapse>
                            </div>
                          );
                        })}
                        {trilha.Fonte_Trilha && (
                           <div className="mt-2 flex justify-end">
                             <span className="text-[10px] text-zinc-600">Fonte: {trilha.Fonte_Trilha}</span>
                           </div>
                        )}
                      </div>
                    </Collapse>

                    <div className="flex flex-wrap items-center gap-2 mt-auto text-[11px] border-t border-zinc-800/50 pt-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEscolher(trilha); }}
                        className="ml-auto px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors active:scale-95"
                      >
                        Escolher
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
