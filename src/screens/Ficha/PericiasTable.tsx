import React from 'react';
import { useRPG } from '../../context/RPGContext';
import type { AtributoKey } from '../../types';

// Cores por grau de treino: destreinado → treinado → veterano → expert
const COR_TREINO: Record<number, string> = {
  0: 'text-zinc-400',
  5: 'text-emerald-400',
  10: 'text-amber-400',
  15: 'text-red-400',
};

const BORDA_TREINO: Record<number, string> = {
  0: 'border-zinc-600',
  5: 'border-emerald-400',
  10: 'border-amber-400',
  15: 'border-red-400',
};

export const PericiasTable: React.FC = () => {
  const { periciasHook, regrasAtivas, setRegrasAtivas, origensHook } = useRPG();
  const { pericias, handleMudarPericia, limites, totais } = periciasHook;

  const [periciaAberta, setPericiaAberta] = React.useState<{ nome: string; descricao: string } | null>(null);

  const { maxTreinadas, maxUpgrades } = limites;
  const { totalTreinadasUsadas, totalUpgradesGastos } = totais;

  const formatarTexto = (texto: string) => {
    let resultado = texto;
    // Formata *texto* como negrito
    resultado = resultado.replace(/\*(.*?)\*/g, '<strong class="text-zinc-100">$1</strong>');
    // Troca quebra de linha por tag <br/>
    resultado = resultado.replace(/\n/g, '<br/>');
    return resultado;
  };

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-6">
      <h3 className="font-display mb-2 border-b border-zinc-800 pb-1 text-center text-lg uppercase tracking-[0.2em] text-zinc-300">
        Perícias
      </h3>

      {/* PAINEL DE REGRAS */}
      <div className="mb-2 flex items-center justify-between rounded border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 text-xs">
        <label className="flex cursor-pointer items-center gap-2 text-zinc-400">
          <input
            type="checkbox"
            className="cursor-pointer accent-red-600"
            checked={regrasAtivas}
            onChange={(e) => setRegrasAtivas(e.target.checked)}
          />
          {regrasAtivas ? 'Regras Ativas' : 'Modo Livre'}
        </label>

        {regrasAtivas && (
          <div className="flex gap-4 font-bold">
            <span className={maxTreinadas - totalTreinadasUsadas < 0 ? 'text-red-500' : 'text-emerald-400'}>
              Treinar: {maxTreinadas - totalTreinadasUsadas}
            </span>
            <span className={maxUpgrades - totalUpgradesGastos < 0 ? 'text-red-500' : 'text-amber-400'}>
              Aumentar Grau: {maxUpgrades - totalUpgradesGastos}
            </span>
          </div>
        )}
      </div>

      {/* TABELA */}
      <div className="w-full">
        <table className="w-full border-collapse text-zinc-100">
          <thead>
            <tr className="border-b border-zinc-700 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-2 py-1.5 text-left">Perícia</th>
              <th className="px-2 py-1.5">Dados</th>
              <th className="px-2 py-1.5">Bônus</th>
              <th className="px-2 py-1.5">Treino</th>
              <th className="px-2 py-1.5">Outros</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(pericias)
              .sort((a, b) => a[1].id - b[1].id)
              .map(([nome, dadosPericia]) => {
              const bonusRegra8 = (nome === 'Diplomacia' && origensHook.origemSelecionada?.Codigo_Regra === 8) ? 2 : 0;
              const bonusRegra13 = (nome === 'Vontade' && origensHook.origemSelecionada?.Codigo_Regra === 13) ? 2 : 0;
              const totalBonus = dadosPericia.treino + dadosPericia.outros + bonusRegra8 + bonusRegra13;
              const corTexto = COR_TREINO[dadosPericia.treino] ?? 'text-zinc-400';
              const corBorda = BORDA_TREINO[dadosPericia.treino] ?? 'border-zinc-600';

              return (
                <tr key={nome} className="border-b border-zinc-800/70 transition hover:bg-zinc-800/30">
                  <td className={`px-2 py-1.5 font-bold text-sm ${corTexto}`}>
                    <div className="flex items-center gap-1">
                      <span 
                        className="cursor-pointer hover:underline hover:text-red-400 transition"
                        onClick={() => setPericiaAberta({ nome, descricao: dadosPericia.descricao || 'Sem descrição.' })}
                      >
                        {nome}
                      </span>
                      {dadosPericia.kit && (
                        <div className="group relative flex items-center">
                          <img 
                            src="/kit-icon.png" 
                            alt="Requer Kit" 
                            className="h-6 w-auto cursor-help opacity-75 transition group-hover:opacity-100 object-contain"
                          />
                          <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 w-56 -translate-y-1/2 opacity-0 transition-all duration-200 group-hover:opacity-100">
                            <div className="rounded-md border border-zinc-700 bg-zinc-900/95 p-3 text-xs leading-relaxed text-zinc-400 shadow-2xl backdrop-blur-md">
                              <p className="mb-1 font-bold uppercase tracking-wider text-zinc-200 text-[0.65rem]">
                                Requer Kit
                              </p>
                              <p>
                                Algumas perícias ou usos de perícias exigem ferramentas, chamadas “kits de perícias”. Se você não possui o kit apropriado, ainda pode usar a perícia, mas sofre –5 no teste.
                              </p>
                            </div>
                            <div className="absolute top-1/2 -left-1.5 h-3 w-3 -translate-y-1/2 rotate-45 border-b border-l border-zinc-700 bg-zinc-900"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className={`px-2 py-1.5 text-center text-sm ${corTexto}`}>
                    <span>(</span>
                    <select
                      value={dadosPericia.atributo}
                      onChange={(e) =>
                        handleMudarPericia(nome, 'atributo', e.target.value as AtributoKey)
                      }
                      className={`cursor-pointer appearance-none border-none bg-transparent text-center font-bold outline-none ${corTexto}`}
                    >
                      <option value="FOR">FOR</option>
                      <option value="AGI">AGI</option>
                      <option value="INT">INT</option>
                      <option value="PRE">PRE</option>
                      <option value="VIG">VIG</option>
                    </select>
                    <span>)</span>
                  </td>

                  <td className={`px-2 py-1.5 text-center font-bold ${corTexto}`}>
                    ( {totalBonus} )
                  </td>

                  <td className="px-2 py-1.5 text-center">
                    <select
                      value={dadosPericia.treino}
                      onChange={(e) =>
                        handleMudarPericia(nome, 'treino', Number(e.target.value))
                      }
                      className={`w-12 cursor-pointer appearance-none border-b bg-transparent text-center font-bold outline-none ${corTexto} ${corBorda}`}
                    >
                      <option value={0}>0</option>
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                    </select>
                  </td>

                  <td className="px-2 py-1.5 text-center">
                    <input
                      type="number"
                      onKeyDown={(e) => {
                        if (['e', 'E', '+', '-', '.', ','].includes(e.key)) e.preventDefault();
                      }}
                      value={(dadosPericia.outros + bonusRegra8 + bonusRegra13) === 0 ? '' : (dadosPericia.outros + bonusRegra8 + bonusRegra13)}
                      placeholder="0"
                      onChange={(e) =>
                        handleMudarPericia(nome, 'outros', Math.max(0, Number(e.target.value) - bonusRegra8 - bonusRegra13))
                      }
                      className={`w-11 border-b bg-transparent text-center font-bold outline-none ${corTexto} ${corBorda}`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL DE DESCRIÇÃO DA PERÍCIA */}
      {periciaAberta && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setPericiaAberta(null)}
        >
          <div 
            className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setPericiaAberta(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition"
            >
              ✕
            </button>
            <h4 className="mb-4 text-xl font-display uppercase tracking-widest text-red-500">{periciaAberta.nome}</h4>
            <div 
              className="max-h-[60vh] overflow-y-auto custom-scrollbar text-sm text-zinc-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatarTexto(periciaAberta.descricao) }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
