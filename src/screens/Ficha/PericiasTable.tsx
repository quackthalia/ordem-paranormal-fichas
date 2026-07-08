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
  const { periciasHook, regrasAtivas, setRegrasAtivas } = useRPG();
  const { pericias, handleMudarPericia, limites, totais } = periciasHook;

  const { maxTreinadas, maxUpgrades } = limites;
  const { totalTreinadasUsadas, totalUpgradesGastos } = totais;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-6">
      <h3 className="font-display mb-5 border-b border-zinc-800 pb-3 text-center text-lg uppercase tracking-[0.2em] text-zinc-300">
        Perícias
      </h3>

      {/* PAINEL DE REGRAS */}
      <div className="mb-4 flex items-center justify-between rounded border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 text-xs">
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
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-zinc-100">
          <thead>
            <tr className="border-b border-zinc-700 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-2 py-2.5 text-left">Perícia</th>
              <th className="px-2 py-2.5">Dados</th>
              <th className="px-2 py-2.5">Bônus</th>
              <th className="px-2 py-2.5">Treino</th>
              <th className="px-2 py-2.5">Outros</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(pericias).map(([nome, dadosPericia]) => {
              const totalBonus = dadosPericia.treino + dadosPericia.outros;
              const corTexto = COR_TREINO[dadosPericia.treino] ?? 'text-zinc-400';
              const corBorda = BORDA_TREINO[dadosPericia.treino] ?? 'border-zinc-600';

              return (
                <tr key={nome} className="border-b border-zinc-800/70 transition hover:bg-zinc-800/30">
                  <td className={`px-2 py-2 font-bold ${corTexto}`}>{nome}</td>

                  <td className={`px-2 py-2 text-center ${corTexto}`}>
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

                  <td className={`px-2 py-2 text-center text-[1.05rem] font-bold ${corTexto}`}>
                    ( {totalBonus} )
                  </td>

                  <td className="px-2 py-2 text-center">
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

                  <td className="px-2 py-2 text-center">
                    <input
                      type="number"
                      onKeyDown={(e) => {
                        if (['e', 'E', '+', '-', '.', ','].includes(e.key)) e.preventDefault();
                      }}
                      value={dadosPericia.outros === 0 ? '' : dadosPericia.outros}
                      placeholder="0"
                      onChange={(e) =>
                        handleMudarPericia(nome, 'outros', Math.max(0, Number(e.target.value)))
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
    </div>
  );
};
