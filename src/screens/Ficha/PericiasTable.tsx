import React from 'react';
import { useRPG } from '../../context/RPGContext';
import type { AtributoKey } from '../../types';
import { CustomSelect } from '../../components/CustomSelect';

// Cores por grau de treino: destreinado → treinado → veterano → expert
const COR_TREINO: Record<number, string> = {
  0: '!text-zinc-400',
  5: '!text-emerald-400',
  10: '!text-amber-400',
  15: '!text-green-400',
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
    
    itensHook
  } = useRPG();
  const { pericias, handleMudarPericia, limites, totais } = periciasHook;

  const [periciaAberta, setPericiaAberta] = React.useState<{ nome: string; descricao: string } | null>(null);
  

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
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-6 h-full flex flex-col">
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

      {/* TABELA */}
      <div className="overflow-x-auto flex-1">
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
                    <div className="flex items-center justify-center gap-0.5">
                      <span>(</span>
                      <CustomSelect
                        value={dadosPericia.atributo}
                        onChange={(val) =>
                          handleMudarPericia(nome, 'atributo', val as AtributoKey)
                        }
                        wrapperClassName="w-[4.5rem]"
                        className={`cursor-pointer appearance-none border-none bg-transparent text-center font-bold outline-none !px-0 ${corTexto}`}
                        hideIcon={true}
                        options={[
                          { value: 'FOR', label: 'FOR' },
                          { value: 'AGI', label: 'AGI' },
                          { value: 'INT', label: 'INT' },
                          { value: 'PRE', label: 'PRE' },
                          { value: 'VIG', label: 'VIG' }
                        ]}
                      />
                      <span>)</span>
                    </div>
                  </td>

                  <td className={`px-2 py-1.5 text-center font-bold ${corTexto}`}>
                    ( {totalBonus} )
                  </td>

                  <td className="px-2 py-1.5 text-center">
                    <div className="flex justify-center">
                      <CustomSelect
                        value={String(dadosPericia.treino)}
                        onChange={(val) =>
                          handleMudarPericia(nome, 'treino', Number(val))
                        }
                        wrapperClassName="w-14"
                        className={`cursor-pointer appearance-none border-b bg-transparent text-center font-bold outline-none !px-0 py-0.5 ${corTexto} ${corBorda}`}
                        hideIcon={true}
                        options={[
                          { value: '0', label: '0' },
                          { value: '5', label: '5' },
                          { value: '10', label: '10' },
                          { value: '15', label: '15' }
                        ]}
                      />
                    </div>
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
