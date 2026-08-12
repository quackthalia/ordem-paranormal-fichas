import React from 'react';
import { useRPG } from '../../context/RPGContext';
import type { AtributoKey } from '../../types';

// Cores por grau de treino: destreinado → treinado → veterano → expert
const COR_TREINO: Record<number, string> = {
  0: 'text-zinc-400',
  5: 'text-emerald-400',
  10: 'text-amber-400',
  15: 'text-green-400',
};

const BORDA_TREINO: Record<number, string> = {
  0: 'border-zinc-600',
  5: 'border-emerald-400',
  10: 'border-amber-400',
  15: 'border-green-400',
};

export const PericiasTable: React.FC = () => {
  const { 
    periciasHook, regrasAtivas, setRegrasAtivas, regrasAutomaticasAtivas, protecoesHook,
    bonusDadosCondicionais, setBonusDadosCondicionais, bonusDadosAtivos, setBonusDadosAtivos,
    poderesHook, trilhasHook, itensHook
  } = useRPG();
  const { pericias, handleMudarPericia, limites, totais } = periciasHook;

  const [periciaAberta, setPericiaAberta] = React.useState<{ nome: string; descricao: string } | null>(null);
  const [mostrarBonus, setMostrarBonus] = React.useState(false);

  const bloquearLetras = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
      e.preventDefault();
    }
  };

  const temProtecaoLeve = protecoesHook?.protecoesInventario.some(p => p.equipado && p.protecao.Proficiencia?.toLowerCase().includes('leve')) || false;

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
                className="cursor-pointer accent-green-600"
                checked={regrasAtivas}
                onChange={(e) => setRegrasAtivas(e.target.checked)}
              />
              {regrasAtivas ? 'Regras Ativas' : 'Modo Livre'}
            </label>
            <button
              onClick={() => setMostrarBonus(!mostrarBonus)}
              className={`rounded px-2 py-1 transition ${mostrarBonus ? 'bg-green-900/50 text-green-100 border-green-800/50' : 'bg-zinc-800/50 text-zinc-400 hover:text-zinc-200'} border border-zinc-700/50 flex items-center gap-2`}
            >
              Bônus de Dados {mostrarBonus ? '▲' : '▼'}
            </button>
          </div>

          {regrasAtivas && (
            <div className="flex gap-4 font-bold">
              <span className={limites.maxTreinadas - totais.totalTreinadasUsadas < 0 ? 'text-green-500' : 'text-emerald-400'}>
                Treinar: {limites.maxTreinadas - totais.totalTreinadasUsadas}
              </span>
              <span className={limites.maxUpgrades - totais.totalUpgradesGastos < 0 ? 'text-green-500' : 'text-amber-400'}>
                Upgrades: {limites.maxUpgrades - totais.totalUpgradesGastos}
              </span>
            </div>
          )}
        </div>
        
        {/* REGRAS AUTOMÁTICAS INLINE */}
        {(regrasAutomaticasAtivas.has(8) || regrasAutomaticasAtivas.has(13) || regrasAutomaticasAtivas.has(25)) && (
          <div className="flex gap-2 flex-wrap mt-2 pt-2 border-t border-zinc-800/50">
            {regrasAutomaticasAtivas.has(8) && <span className="rounded bg-green-900/30 px-2 py-0.5 text-xs text-green-400 border border-green-900/50 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>+2 Diplomacia (Automático)</span>}
            {regrasAutomaticasAtivas.has(13) && <span className="rounded bg-green-900/30 px-2 py-0.5 text-xs text-green-400 border border-green-900/50 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>+2 Vontade (Automático)</span>}
            {regrasAutomaticasAtivas.has(25) && temProtecaoLeve && <span className="rounded bg-green-900/30 px-2 py-0.5 text-xs text-green-400 border border-green-900/50 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>+2 Reflexos (Automático)</span>}
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
              <div className="flex flex-col gap-0.5">
                {regrasAutomaticasAtivas.has(30) && (
                  <div className="text-xs text-zinc-300 px-2 py-1 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start">
                    <span className="text-green-500 font-bold mt-[-1px]">•</span>
                    <span>+2d20 em Diplomacia, Enganação e Intuição no primeiro teste social que fizer num ambiente</span>
                  </div>
                )}
                {regrasAutomaticasAtivas.has(65) && (
                  <>
                    <div className="text-xs text-zinc-300 px-2 py-1 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start">
                      <span className="text-green-500 font-bold mt-[-1px]">•</span>
                      <span>+1d20 em testes para resistir a doenças</span>
                    </div>
                    <div className="text-xs text-zinc-300 px-2 py-1 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start">
                      <span className="text-green-500 font-bold mt-[-1px]">•</span>
                      <span>-1d20 em testes de Percepção para ouvir</span>
                    </div>
                  </>
                )}
                
                {bonusDadosCondicionais.split('\n').filter(s => s.trim() !== '').map((bonus, idx) => (
                  <div key={idx} className="text-xs text-zinc-300 px-2 py-1 rounded border border-zinc-800/50 bg-zinc-950/30 flex justify-between items-start group">
                    <div className="flex gap-1.5 items-start">
                      <span className="text-zinc-500 font-bold mt-[-1px]">•</span>
                      <span>{bonus}</span>
                    </div>
                    <button onClick={() => {
                      const lines = bonusDadosCondicionais.split('\n').filter(s => s.trim() !== '');
                      lines.splice(idx, 1);
                      setBonusDadosCondicionais(lines.join('\n'));
                    }} className="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition px-1">✕</button>
                  </div>
                ))}
              </div>
              <input
                className="w-full bg-transparent text-zinc-300 text-sm p-2 outline-none border border-zinc-800/50 focus:border-green-900 rounded placeholder-zinc-600"
                placeholder="Escreva um bônus e aperte Enter..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = e.currentTarget.value.trim();
                    if (val) {
                      setBonusDadosCondicionais(bonusDadosCondicionais ? `${bonusDadosCondicionais}\n${val}` : val);
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
            </div>
            
            <hr className="border-zinc-800" />
            
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase text-zinc-500 font-bold ml-1">Sempre Ativos</label>
              <div className="flex flex-col gap-0.5">
                {regrasAutomaticasAtivas.has(33) && periciasHook.jaTinhaProfissao33 && (
                  <div className="text-xs text-zinc-300 px-2 py-1 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start">
                    <span className="text-green-500 font-bold mt-[-1px]">•</span>
                    <span>+1d20 em testes de Profissão (Faz-Tudo)</span>
                  </div>
                )}
                {Object.values(poderesHook.poderesEscolhidos).map((poder, idx) => {
                  if (poder.codigoRegra === 42 && poder.periciaEscolhidaNome) {
                    return (
                      <div key={`regra42-${idx}`} className="text-xs text-zinc-300 px-2 py-1 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start">
                        <span className="text-green-500 font-bold mt-[-1px]">•</span>
                        <span>+1d20 em testes de {poder.periciaEscolhidaNome}</span>
                      </div>
                    );
                  }
                  return null;
                })}
                {regrasAutomaticasAtivas.has(65) && (
                  <>
                    <div className="text-xs text-zinc-300 px-2 py-1 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start">
                      <span className="text-green-500 font-bold mt-[-1px]">•</span>
                      <span>+2d20 em testes de Intimidação</span>
                    </div>
                    <div className="text-xs text-zinc-300 px-2 py-1 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start">
                      <span className="text-green-500 font-bold mt-[-1px]">•</span>
                      <span>-1d20 em testes de Diplomacia</span>
                    </div>
                  </>
                )}
                {trilhasHook.trilhaSelecionada?.nome_pericia && (
                  <div className="text-xs text-zinc-300 px-2 py-1 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start">
                    <span className="text-green-500 font-bold mt-[-1px]">•</span>
                    <span>+1d20 em testes de {trilhasHook.trilhaSelecionada.nome_pericia} (Trilha {trilhasHook.trilhaSelecionada.Nome_Trilha})</span>
                  </div>
                )}
                
                {bonusDadosAtivos.split('\n').filter(s => s.trim() !== '').map((bonus, idx) => (
                  <div key={idx} className="text-xs text-zinc-300 px-2 py-1 rounded border border-zinc-800/50 bg-zinc-950/30 flex justify-between items-start group">
                    <div className="flex gap-1.5 items-start">
                      <span className="text-zinc-500 font-bold mt-[-1px]">•</span>
                      <span>{bonus}</span>
                    </div>
                    <button onClick={() => {
                      const lines = bonusDadosAtivos.split('\n').filter(s => s.trim() !== '');
                      lines.splice(idx, 1);
                      setBonusDadosAtivos(lines.join('\n'));
                    }} className="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition px-1">✕</button>
                  </div>
                ))}
              </div>
              <input
                className="w-full bg-transparent text-zinc-300 text-sm p-2 outline-none border border-zinc-800/50 focus:border-green-900 rounded placeholder-zinc-600"
                placeholder="Escreva um bônus e aperte Enter..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = e.currentTarget.value.trim();
                    if (val) {
                      setBonusDadosAtivos(bonusDadosAtivos ? `${bonusDadosAtivos}\n${val}` : val);
                      e.currentTarget.value = '';
                    }
                  }
                }}
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
              
              // Bônus de Itens (Vestimentas, Utensílios, Amuletos e Função Adicional)
              const bonusInventario = itensHook?.itensInventario.reduce((acc, obj) => {
                const nomeItem = obj.item.Nome_Item.toLowerCase();
                const isVestimenta = nomeItem.includes('vestimenta');
                const isAmuleto = nomeItem.includes('amuleto sagrado');
                
                // Amuleto Sagrado especial (dá Religião ou Vontade nativamente, sem precisar estar escrito no nome)
                // Se o Amuleto tiver (Religião*) no nome (porque recebeu Aprimorado), ele vai ser pego pelo bloco match abaixo e ganhar +5
                // Então o bônus nativo (+2) só entra se ele estiver equipado E a perícia não tiver sido pega pelo Aprimorado.
                // Mas para simplificar, a gente checa os parenteses primeiro.
                
                let bonusDesteItem = 0;

                // Checa perícias entre parênteses, ex: Vestimenta (Ocultismo, Crime) ou Celular (Crime)
                const match = obj.item.Nome_Item.match(/\((.*?)\)/);
                if (match) {
                  const periciasNoItem = match[1].split(',').map(s => s.trim().toLowerCase());
                  
                  // Procura a perícia atual na lista (com ou sem *)
                  const periciaEncontrada = periciasNoItem.find(p => p.replace('*', '') === nome.toLowerCase());
                  
                  if (periciaEncontrada) {
                    // Vestimentas e Amuletos precisam estar equipados para dar o bônus
                    if ((isVestimenta || isAmuleto) && !obj.equipado) {
                      // não ganha nada
                    } else {
                      if (periciaEncontrada.includes('*')) {
                        bonusDesteItem = 5;
                      } else {
                        bonusDesteItem = 2;
                      }
                    }
                  }
                }
                
                // Se for Amuleto e ainda não ganhou bônus nessa perícia (ex: não pegou Aprimorado nela), 
                // dá os +2 nativos de Religião/Vontade se estiver equipado.
                if (isAmuleto && obj.equipado && bonusDesteItem === 0) {
                  if (nome === 'Religião' || nome === 'Vontade') {
                    bonusDesteItem = 2;
                  }
                }
                
                return acc + bonusDesteItem;
              }, 0) || 0;

              const totalBonus = dadosPericia.treino + dadosPericia.outros + bonusRegra8 + bonusRegra13 + bonusRegra25 + bonusInventario;
              const corTexto = COR_TREINO[dadosPericia.treino] ?? 'text-zinc-400';
              const corBorda = BORDA_TREINO[dadosPericia.treino] ?? 'border-zinc-600';

              return (
                <tr key={nome} className="border-b border-zinc-800/70 transition hover:bg-zinc-800/30">
                  <td className={`px-2 py-1.5 font-bold text-sm ${corTexto}`}>
                    <div className="flex items-center gap-1">
                      <span 
                        className="cursor-pointer hover:underline hover:text-green-400 transition"
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
                      value={(dadosPericia.outros + bonusRegra8 + bonusRegra13 + bonusRegra25 + bonusInventario) === 0 ? '' : (dadosPericia.outros + bonusRegra8 + bonusRegra13 + bonusRegra25 + bonusInventario)}
                      placeholder="0"
                      onChange={(e) =>
                        handleMudarPericia(nome, 'outros', Math.max(0, Number(e.target.value) - bonusRegra8 - bonusRegra13 - bonusRegra25 - bonusInventario))
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
            <h4 className="mb-4 text-xl font-display uppercase tracking-widest text-green-500">{periciaAberta.nome}</h4>
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
