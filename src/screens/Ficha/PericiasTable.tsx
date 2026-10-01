import React from 'react';
import { useRPG } from '../../context/RPGContext';
import type { AtributoKey } from '../../types';
import { CustomSelect } from '../../components/CustomSelect';
import { Collapse } from '../../components/Collapse';
import { BonusCondicionaisPanel } from './BonusCondicionaisPanel';

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
  const { pericias, handleMudarPericia, limites, totais, profissoes, setProfissoes } = periciasHook;

  const [periciaAberta, setPericiaAberta] = React.useState<{ nome: string; descricao: string } | null>(null);
  const [mostrarBonus, setMostrarBonus] = React.useState(false);
  const [mostrarOpcoes, setMostrarOpcoes] = React.useState(false);
  const [profissaoExpandida, setProfissaoExpandida] = React.useState(false);
  const [editingProfIndex, setEditingProfIndex] = React.useState<number | null>(null);
  

  

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
      <div className="flex items-center justify-between mb-2 border-b border-zinc-800 pb-1">
        <h3 className="font-display text-lg uppercase tracking-[0.2em] text-zinc-300 ml-4 flex-1 text-center">
          Perícias
        </h3>
        <button
          onClick={() => setMostrarBonus(!mostrarBonus)}
          className={`rounded transition text-lg ${mostrarBonus ? 'bg-green-900/50 text-green-400 border-green-800/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 'bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'} border border-zinc-700/50 flex items-center justify-center w-9 h-9 overflow-hidden`}
          title="Modificadores de Dados"
        >
          <img 
            src="/dice-icon.png" 
            alt="Modificadores" 
            className={`w-full h-full object-contain scale-[1.15] mix-blend-screen transition-opacity duration-200 ${mostrarBonus ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`}
          />
        </button>
      </div>
      <div className="flex justify-start mb-2">
        <button 
          onClick={() => setMostrarOpcoes(!mostrarOpcoes)}
          className={`text-zinc-500 hover:text-zinc-300 transition-all flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-lg shadow-lg shadow-black/20 ${mostrarOpcoes ? 'text-green-500' : ''}`}
          title="Opções de Regras"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${mostrarOpcoes ? 'rotate-90' : ''}`}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg> 
          <span className="text-[10px] font-bold uppercase tracking-wider">Regras</span>
        </button>
      </div>

      <Collapse isOpen={mostrarOpcoes}>
        <div className="mb-2 flex flex-col rounded border border-zinc-700/50 bg-zinc-900/95 px-3 py-2 text-xs shadow-lg shadow-black/80 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors">
              <input
                type="checkbox"
                className="cursor-pointer accent-green-600"
                checked={regrasAtivas}
                onChange={(e) => setRegrasAtivas(e.target.checked)}
              />
              {regrasAtivas ? 'Regras Ativas' : 'Modo Livre'}
            </label>
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
        </div>
      </Collapse>

      <Collapse isOpen={mostrarBonus}>
        <div className="mb-4">
          <BonusCondicionaisPanel />
        </div>
      </Collapse>

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
              const bonusRegra8 = (nome === 'Diplomacia' && regrasAutomaticasAtivas.has(8)) ? 2 : 0;
              const bonusRegra13 = (nome === 'Vontade' && regrasAutomaticasAtivas.has(13)) ? 2 : 0;
              const bonusRegra25 = (nome === 'Reflexos' && regrasAutomaticasAtivas.has(25) && temProtecaoLeve) ? 2 : 0;
              
              // Bônus de Itens (Vestimentas, Utensílios, Amuletos e Função Adicional)
              const bonusInventario = itensHook?.itensInventario.reduce((acc, obj) => {
                const nomeItem = obj.item.Nome_Item.toLowerCase();
                const isVestimenta = nomeItem.includes('vestimenta');
                const isAmuleto = nomeItem.includes('amuleto sagrado');
                const isUtensilio = nomeItem.includes('utensílio') || nomeItem.includes('utensilio');
                
                let bonusDesteItem = 0;

                // Checa perícias entre parênteses, ex: Vestimenta (Ocultismo, Crime) ou Celular (Crime)
                const match = obj.item.Nome_Item.match(/\((.*?)\)/);
                if (match) {
                  const periciasNoItem = match[1].split(',').map(s => s.trim().toLowerCase());
                  
                  // Procura a perícia atual na lista (com ou sem *)
                  const periciaEncontrada = periciasNoItem.find(p => p.replace('*', '') === nome.toLowerCase());
                  
                  if (periciaEncontrada) {
                    // Vestimentas, Amuletos e Utensílios precisam estar equipados para dar o bônus
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
                
                // Se for Amuleto e ainda não ganhou bônus nessa perícia, dá os +2 nativos de Religião/Vontade se equipado
                if (isAmuleto && obj.equipado && bonusDesteItem === 0) {
                  if (nome === 'Religião' || nome === 'Vontade') {
                    bonusDesteItem = 2;
                  }
                }
                
                // Bônus de itens (equipamentos mundanos) não se acumulam, pega-se o maior.
                return acc + bonusDesteItem;
              }, 0) || 0;

              // Adiciona também bônus de itens amaldiçoados (ex: Tênis Lépidos)
              const bonusAmaldicoados = periciasHook.bonusVestimentas?.[nome] || 0;
              const bonusItemFinal = bonusInventario + bonusAmaldicoados;

              const totalBonus = dadosPericia.treino + dadosPericia.outros + bonusRegra8 + bonusRegra13 + bonusRegra25 + bonusItemFinal;
              const corTexto = COR_TREINO[dadosPericia.treino] ?? 'text-zinc-400';
              const corBorda = BORDA_TREINO[dadosPericia.treino] ?? 'border-zinc-600';

              return (
                <React.Fragment key={nome}>
                <tr className="border-b border-zinc-800/70 transition hover:bg-zinc-800/30">
                  <td className={`px-2 py-1.5 font-bold text-sm ${corTexto}`}>
                    <div className="flex items-center gap-1">
                      {nome === 'Profissão' && dadosPericia.treino >= 5 && (
                        <button
                          onClick={() => setProfissaoExpandida(!profissaoExpandida)}
                          className="text-zinc-500 hover:text-green-400 transition transform"
                          title="Expandir profissões"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={profissaoExpandida ? "rotate-180" : ""}>
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </button>
                      )}
                      <span 
                        className="cursor-pointer hover:underline hover:text-green-400 transition"
                        onClick={() => setPericiaAberta({ nome, descricao: dadosPericia.descricao || 'Sem descrição..' })}
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
                      }                      className={`w-11 border-b bg-transparent text-center font-bold outline-none ${corTexto} ${corBorda}`}
                    />
                  </td>
                </tr>
                                    {nome === 'Profissão' && (
                    <tr key="profissao-sub">
                      <td colSpan={5} className="p-0 border-0">
                        <div className={`grid transition-all duration-300 ease-in-out ${profissaoExpandida ? 'grid-rows-[1fr] opacity-100 border-b border-zinc-800/70' : 'grid-rows-[0fr] opacity-0'}`}>
                          <div className={profissaoExpandida ? "overflow-visible" : "overflow-hidden"}>
                            <div className="px-4 py-3 bg-zinc-900/50 flex flex-col gap-2">
                              {profissoes.map((prof, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  {editingProfIndex === idx || prof.nome === '' ? (
                                  <input
                                    autoFocus
                                    value={prof.nome}
                                    onChange={e => setProfissoes(prev => prev.map((p, i) => i === idx ? { ...p, nome: e.target.value } : p))}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        setEditingProfIndex(null);
                                      }
                                    }}
                                    onBlur={() => setEditingProfIndex(null)}
                                    placeholder="Nome da profissão..."
                                    className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100 outline-none focus:border-green-500"
                                  />
                                ) : (
                                  <span 
                                    className={`flex-1 px-2 py-1 text-sm font-normal cursor-pointer hover:opacity-75 transition-opacity truncate ${COR_TREINO[prof.treino] ?? 'text-zinc-300'}`}
                                    onClick={() => setEditingProfIndex(idx)}
                                  >
                                    {prof.nome}
                                  </span>
                                )}
                                  <CustomSelect
                                    value={String(prof.treino)}
                                    onChange={val => setProfissoes(prev => prev.map((p, i) => i === idx ? { ...p, treino: Number(val) } : p))}
                                    options={[{value:'0',label:'0'},{value:'5',label:'5'},{value:'10',label:'10'},{value:'15',label:'15'}]}
                                    wrapperClassName="w-14"
                                    className={`cursor-pointer border-b bg-transparent text-center font-bold outline-none !px-0 py-0.5 ${COR_TREINO[prof.treino] ?? 'text-zinc-400'} ${BORDA_TREINO[prof.treino] ?? 'border-zinc-600'}`}
                                    hideIcon={true}
                                  />
                                  <input
                                    type="number"
                                    value={prof.outros === 0 ? '' : prof.outros}
                                    placeholder="0"
                                    onChange={e => setProfissoes(prev => prev.map((p, i) => i === idx ? { ...p, outros: Number(e.target.value) || 0 } : p))}
                                    className={`w-11 border-b bg-transparent text-center font-bold outline-none ${COR_TREINO[prof.treino] ?? 'text-zinc-400'} ${BORDA_TREINO[prof.treino] ?? 'border-zinc-600'}`}
                                  />
                                  <button
                                    onClick={() => setProfissoes(prev => prev.filter((_, i) => i !== idx))}
                                    className="text-zinc-600 hover:text-red-400 transition text-lg leading-none"
                                  >×</button>
                                </div>
                              ))}
                              <button
                                onClick={() => { setProfissoes(prev => [...prev, { nome: '', treino: 5, outros: 0 }]); setEditingProfIndex(profissoes.length); }}
                                className="self-start text-xs text-green-500 hover:text-green-300 transition flex items-center gap-1 mt-1"
                              >
                                <svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3'><line x1='12' y1='5' x2='12' y2='19'/><line x1='5' y1='12' x2='19' y2='12'/></svg>
                                Adicionar Profissão
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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
