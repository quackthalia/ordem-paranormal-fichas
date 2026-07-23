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
  const { 
    periciasHook, regrasAtivas, setRegrasAtivas, regrasAutomaticasAtivas, protecoes,
    bonusDadosCondicionais, setBonusDadosCondicionais, bonusDadosAtivos, setBonusDadosAtivos
  } = useRPG();
  const { pericias, handleMudarPericia, limites, totais } = periciasHook;

  const [periciaAberta, setPericiaAberta] = React.useState<{ nome: string; descricao: string } | null>(null);
  const [mostrarBonus, setMostrarBonus] = React.useState(false);

  const bloquearLetras = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
      e.preventDefault();
    }
  };

  const temProtecaoLeve = protecoes.some(p => p.toLowerCase().includes('leve'));

  const formatarDescricaoHTML = (texto: string) => {
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

      {/* PAINEL DE REGRAS E BÔNUS */}
      <div className="mb-2 flex flex-col rounded border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-zinc-400">
              <input
                type="checkbox"
                className="cursor-pointer accent-red-600"
                checked={regrasAtivas}
                onChange={(e) => setRegrasAtivas(e.target.checked)}
              />
              {regrasAtivas ? 'Regras Ativas' : 'Modo Livre'}
            </label>
            <button
              onClick={() => setMostrarBonus(!mostrarBonus)}
              className={`rounded px-2 py-1 transition ${mostrarBonus ? 'bg-red-900/50 text-red-100 border-red-800/50' : 'bg-zinc-800/50 text-zinc-400 hover:text-zinc-200'} border border-zinc-700/50 flex items-center gap-2`}
            >
              Bônus de Dados {mostrarBonus ? '▲' : '▼'}
            </button>
          </div>

          {regrasAtivas && (
            <div className="flex gap-4 font-bold">
              <span className={limites.maxTreinadas - totais.totalTreinadasUsadas < 0 ? 'text-red-500' : 'text-emerald-400'}>
                Treinar: {limites.maxTreinadas - totais.totalTreinadasUsadas}
              </span>
              <span className={limites.maxUpgrades - totais.totalUpgradesGastos < 0 ? 'text-red-500' : 'text-amber-400'}>
                Upgrades: {limites.maxUpgrades - totais.totalUpgradesGastos}
              </span>
            </div>
          )}
        </div>
        
        {/* REGRAS AUTOMÁTICAS INLINE */}
        {(regrasAutomaticasAtivas.has(8) || regrasAutomaticasAtivas.has(13) || regrasAutomaticasAtivas.has(25)) && (
          <div className="flex gap-2 flex-wrap mt-2 pt-2 border-t border-zinc-800/50">
            {regrasAutomaticasAtivas.has(8) && <span className="rounded bg-red-900/30 px-2 py-0.5 text-xs text-red-400 border border-red-900/50 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>+2 Diplomacia (Automático)</span>}
            {regrasAutomaticasAtivas.has(13) && <span className="rounded bg-red-900/30 px-2 py-0.5 text-xs text-red-400 border border-red-900/50 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>+2 Vontade (Automático)</span>}
            {regrasAutomaticasAtivas.has(25) && temProtecaoLeve && <span className="rounded bg-red-900/30 px-2 py-0.5 text-xs text-red-400 border border-red-900/50 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>+2 Reflexos (Automático)</span>}
          </div>
        )}
      </div>

      {/* PAINEL EXPANSÍVEL DE BÔNUS DE DADOS */}
      {mostrarBonus && (
        <div className="mb-4 rounded-md border border-zinc-700 bg-zinc-900 shadow-xl overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
          <h4 className="bg-zinc-950 px-4 py-2 text-center font-display tracking-widest text-zinc-300 uppercase border-b border-zinc-800">
            Bônus de Dados
          </h4>
          <div className="flex flex-col p-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase text-zinc-500 font-bold ml-1 mb-1">Condicionais</label>
              {regrasAutomaticasAtivas.has(30) && (
                <div className="mb-1 text-xs text-zinc-300 px-2 py-1 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start">
                  <span className="text-red-500 font-bold mt-[-1px]">•</span>
                  <span>+2d20 em Diplomacia, Enganação e Intuição no primeiro teste social que fizer num ambiente</span>
                </div>
              )}
              <textarea
                className="w-full bg-transparent text-zinc-300 text-sm p-2 outline-none border border-transparent hover:border-zinc-800 focus:border-red-900 rounded resize-none min-h-[32px]"
                placeholder={regrasAutomaticasAtivas.has(30) ? "" : "Você não possui nenhum bônus condicional registrado..."}
                value={bonusDadosCondicionais}
                onChange={(e) => setBonusDadosCondicionais(e.target.value)}
              />
            </div>
            
            <hr className="border-zinc-800" />
            
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase text-zinc-500 font-bold ml-1">Sempre Ativos</label>
              {regrasAutomaticasAtivas.has(33) && periciasHook.jaTinhaProfissao33 && (
                <div className="mb-1 text-xs text-zinc-300 px-2 py-1 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start">
                  <span className="text-red-500 font-bold mt-[-1px]">•</span>
                  <span>+1d20 em testes de Profissão (Faz-Tudo)</span>
                </div>
              )}
              <textarea
                className="w-full bg-transparent text-zinc-300 text-sm p-2 outline-none border border-transparent hover:border-zinc-800 focus:border-red-900 rounded resize-none min-h-[32px]"
                placeholder={(regrasAutomaticasAtivas.has(33)) ? "" : "Você não possui nenhum bônus sempre ativo registrado..."}
                value={bonusDadosAtivos}
                onChange={(e) => setBonusDadosAtivos(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* TABELA */}
      <div className="overflow-x-auto">
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
              const bonusRegra8 = (nome === 'Diplomacia' && regrasAutomaticasAtivas.has(8)) ? 2 : 0;
              const bonusRegra13 = (nome === 'Vontade' && regrasAutomaticasAtivas.has(13)) ? 2 : 0;
              const bonusRegra25 = (nome === 'Reflexos' && regrasAutomaticasAtivas.has(25) && temProtecaoLeve) ? 2 : 0;
              const totalBonus = dadosPericia.treino + dadosPericia.outros + bonusRegra8 + bonusRegra13 + bonusRegra25;
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
                      onKeyDown={bloquearLetras}
                      value={(dadosPericia.outros + bonusRegra8 + bonusRegra13 + bonusRegra25) === 0 ? '' : (dadosPericia.outros + bonusRegra8 + bonusRegra13 + bonusRegra25)}
                      placeholder="0"
                      onChange={(e) =>
                        handleMudarPericia(nome, 'outros', Math.max(0, Number(e.target.value) - bonusRegra8 - bonusRegra13 - bonusRegra25))
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
              dangerouslySetInnerHTML={{ __html: formatarDescricaoHTML(periciaAberta.descricao) }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
