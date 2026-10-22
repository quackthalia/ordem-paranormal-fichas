import React from 'react';
import { useRPG } from '../../context/RPGContext';

export const BonusCondicionaisPanel: React.FC = () => {
  const { 
    regrasAutomaticasAtivas,
    bonusDadosCondicionais, setBonusDadosCondicionais,
    bonusDadosAtivos, setBonusDadosAtivos,
    poderesHook,
    periciasHook,
    jaTinhaPericiaTrilha,
    jaTinhaPericiaVersatilidade,
    jaTinhaProfissaoTrilha,
    trilhasHook,
    regras,
    nivel,
    nex,
    poderesExtras,
    temMataLeao10,
    temMonstruoso10,
    temMonstruoso40,
    isMonstruosoAtivo10,
    isMonstruosoAtivo40,
    monstruosoElemento,
    atributosFinais,
    queimarVigCount,
  } = useRPG();

  const temPerseverante40 = trilhasHook.trilhaSelecionada?.Codigo_Trilha === 20 && (regras['nex_experiencia'] ? nivel >= 8 : nex >= 40);
  const temExorcista40 = trilhasHook.trilhaSelecionada?.Codigo_Trilha === 22 && (regras['nex_experiencia'] ? nivel >= 8 : nex >= 40);

  return (
    <div className="flex flex-col rounded-md border border-zinc-700 bg-zinc-900 shadow-xl overflow-hidden ">
      <h4 className="bg-zinc-950 px-4 py-2 text-center font-display tracking-widest text-zinc-300 uppercase border-b border-zinc-800">
        Modificadores de Dados
      </h4>
      <div className="flex flex-col p-3 gap-3">
        {/* CONDICIONAIS */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1 mb-1">Condicionais</label>
          <div className="flex flex-col gap-1">
            {regrasAutomaticasAtivas.has(30) && (
              <div className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                <span className="text-green-500 font-bold mt-[-1px]">•</span>
                <span>+2d20 em Diplomacia, Enganação e Intuição no primeiro teste social que fizer num ambiente</span>
              </div>
            )}
            {regrasAutomaticasAtivas.has(65) && (
              <>
                <div className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                  <span className="text-green-500 font-bold mt-[-1px]">•</span>
                  <span>+1d20 em testes para resistir a doenças</span>
                </div>
                <div className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                  <span className="text-green-500 font-bold mt-[-1px]">•</span>
                  <span>-1d20 em testes de Percepção para ouvir</span>
                </div>
              </>
            )}
            {temPerseverante40 && (
              <div className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                <span className="text-green-500 font-bold mt-[-1px]">•</span>
                <span>+1d20 em teste para fugir de um inimigo (Perseverante)</span>
              </div>
            )}
            {temMataLeao10 && (
              <>
                <div className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                  <span className="text-green-500 font-bold mt-[-1px]">•</span>
                  <span>+2d20 em testes de manobra para Agarrar (Mata Leão)</span>
                </div>
                <div className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                  <span className="text-green-500 font-bold mt-[-1px]">•</span>
                  <span>+1d20 em testes para manter um ser Agarrado (Mata Leão)</span>
                </div>
              </>
            )}
            {temMonstruoso40 && isMonstruosoAtivo40 && monstruosoElemento === 'Sangue' && (
              <div className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                <span className="text-green-500 font-bold mt-[-1px]">•</span>
                <span>Gastar ação de movimento e 1 a {atributosFinais.FOR} PE para recuperar 1d8 PV por PE gasto (Ser Macabro - Sangue)</span>
              </div>
            )}
            {temMonstruoso40 && isMonstruosoAtivo40 && monstruosoElemento === 'Energia' && (
              <div className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                <span className="text-green-500 font-bold mt-[-1px]">•</span>
                <span>Gastar 1 a {atributosFinais.AGI} PE ao acertar ataque corpo a corpo para causar +1d6 Energia por PE gasto (Ser Macabro - Energia)</span>
              </div>
            )}
            
            {bonusDadosCondicionais.split('\n').filter(s => s.trim() !== '').map((bonus, idx) => (
              <div key={idx} className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex justify-between items-start group leading-snug">
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
            className="w-full bg-transparent text-zinc-300 text-xs p-2 outline-none border border-zinc-800/50 focus:border-green-900 rounded placeholder-zinc-600 mt-1"
            placeholder="Anotar bônus condicional e apertar Enter..."
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
        
        {/* SEMPRE ATIVOS */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1 mb-1">Sempre Ativos</label>
          <div className="flex flex-col gap-1">
            {regrasAutomaticasAtivas.has(33) && periciasHook.jaTinhaProfissao33 && (
              <div className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                <span className="text-green-500 font-bold mt-[-1px]">•</span>
                <span>+1d20 em testes de Profissão (Faz-Tudo)</span>
              </div>
            )}
            {trilhasHook.trilhaSelecionada && jaTinhaPericiaTrilha && (
              <div className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                <span className="text-green-500 font-bold mt-[-1px]">•</span>
                <span>+1d20 em testes de {trilhasHook.trilhaSelecionada.nome_pericia} ({trilhasHook.trilhaSelecionada.Nome_Trilha})</span>
              </div>
            )}
            {trilhasHook.versatilidadeSelecionada && jaTinhaPericiaVersatilidade && (
              <div className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                <span className="text-green-500 font-bold mt-[-1px]">•</span>
                <span>+1d20 em testes de {trilhasHook.versatilidadeSelecionada.nome_pericia} ({trilhasHook.versatilidadeSelecionada.Nome_Trilha})</span>
              </div>
            )}
            {trilhasHook.trilhaSelecionada && trilhasHook.trilhaSelecionada.Codigo_Trilha !== 21 && jaTinhaProfissaoTrilha && trilhasHook.trilhaSelecionada.Profissao_Pericia && (
              <div className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                <span className="text-green-500 font-bold mt-[-1px]">•</span>
                <span>+1d20 em testes de Profissão ({trilhasHook.trilhaSelecionada.Profissao_Pericia}) ({trilhasHook.trilhaSelecionada.Nome_Trilha})</span>
              </div>
            )}
            {temExorcista40 && poderesExtras['exorcista_opcao_40'] === 'dados' && (
              <div className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                <span className="text-green-500 font-bold mt-[-1px]">•</span>
                <span>+1d20 em testes de Religião (Exorcista 40%)</span>
              </div>
            )}
            {regrasAutomaticasAtivas.has(9) && (
              <div className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                <span className="text-green-500 font-bold mt-[-1px]">•</span>
                <span>-1d20 em testes de Diplomacia (Mutação)</span>
              </div>
            )}
            {temMonstruoso10 && isMonstruosoAtivo10 && monstruosoElemento === 'Sangue' && (
              <>
                <div className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                  <span className="text-red-400 font-bold mt-[-1px]">•</span>
                  <span>{(temMonstruoso40 && isMonstruosoAtivo40) ? '-2d20' : '-1d20'} em testes de Ciências (Monstruoso)</span>
                </div>
                <div className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                  <span className="text-red-400 font-bold mt-[-1px]">•</span>
                  <span>{(temMonstruoso40 && isMonstruosoAtivo40) ? '-2d20' : '-1d20'} em testes de Intuição (Monstruoso)</span>
                </div>
              </>
            )}
            {temMonstruoso10 && isMonstruosoAtivo10 && monstruosoElemento === 'Morte' && (
              <>
                <div className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                  <span className="text-red-400 font-bold mt-[-1px]">•</span>
                  <span>{(temMonstruoso40 && isMonstruosoAtivo40) ? '-2d20' : '-1d20'} em testes de Diplomacia (Monstruoso)</span>
                </div>
                <div className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                  <span className="text-red-400 font-bold mt-[-1px]">•</span>
                  <span>{(temMonstruoso40 && isMonstruosoAtivo40) ? '-2d20' : '-1d20'} em testes de Enganação (Monstruoso)</span>
                </div>
              </>
            )}
            {temMonstruoso10 && isMonstruosoAtivo10 && monstruosoElemento === 'Conhecimento' && (
              <>
                <div className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                  <span className="text-red-400 font-bold mt-[-1px]">•</span>
                  <span>{(temMonstruoso40 && isMonstruosoAtivo40) ? '-2d20' : '-1d20'} em testes de Atletismo (Monstruoso)</span>
                </div>
                <div className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                  <span className="text-red-400 font-bold mt-[-1px]">•</span>
                  <span>{(temMonstruoso40 && isMonstruosoAtivo40) ? '-2d20' : '-1d20'} em testes de Acrobacia (Monstruoso)</span>
                </div>
              </>
            )}
            {temMonstruoso10 && isMonstruosoAtivo10 && monstruosoElemento === 'Energia' && (
              <>
                <div className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                  <span className="text-red-400 font-bold mt-[-1px]">•</span>
                  <span>{(temMonstruoso40 && isMonstruosoAtivo40) ? '-2d20' : '-1d20'} em testes de Investigação (Monstruoso)</span>
                </div>
                <div className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                  <span className="text-red-400 font-bold mt-[-1px]">•</span>
                  <span>{(temMonstruoso40 && isMonstruosoAtivo40) ? '-2d20' : '-1d20'} em testes de Percepção (Monstruoso)</span>
                </div>
              </>
            )}
            {regrasAutomaticasAtivas.has(74) && (
              <div className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                <span className="text-green-500 font-bold mt-[-1px]">•</span>
                <span>+1d20 em testes de Intimidação (Monstruoso 40%)</span>
              </div>
            )}
            {regrasAutomaticasAtivas.has(106) && (
              <div className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                <span className="text-green-500 font-bold mt-[-1px]">•</span>
                <span>+1d6 em testes baseados em Intelecto (Ser Testado - Conhecimento)</span>
              </div>
            )}
            {regrasAutomaticasAtivas.has(107) && (
              <div className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                <span className="text-green-500 font-bold mt-[-1px]">•</span>
                <span>+1d6{queimarVigCount > 0 ? ` + ${queimarVigCount}d4` : ''} em testes de ataque (Ser Testado - Energia)</span>
              </div>
            )}
            {regrasAutomaticasAtivas.has(108) && (
              <div className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                <span className="text-green-500 font-bold mt-[-1px]">•</span>
                <span>+1d8 em testes de ataques corpo a corpo (Ser Expurgado - Sangue)</span>
              </div>
            )}
            {Object.values(poderesHook.poderesEscolhidos).map((poder, idx) => {
              if (poder.codigoRegra === 42 && poder.periciaEscolhidaNome) {
                return (
                  <div key={`regra42-${idx}`} className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                    <span className="text-green-500 font-bold mt-[-1px]">•</span>
                    <span>+1d20 em testes de {poder.periciaEscolhidaNome}</span>
                  </div>
                );
              }
              return null;
            })}
            {regrasAutomaticasAtivas.has(65) && (
              <>
                <div className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                  <span className="text-green-500 font-bold mt-[-1px]">•</span>
                  <span>+1d20 em testes para resistir a venenos</span>
                </div>
                <div className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex gap-1.5 items-start leading-snug">
                  <span className="text-green-500 font-bold mt-[-1px]">•</span>
                  <span>+1d20 em testes de Sobrevivência</span>
                </div>
              </>
            )}
            
            {bonusDadosAtivos.split('\n').filter(s => s.trim() !== '').map((bonus, idx) => (
              <div key={idx} className="text-xs text-zinc-300 px-2 py-1.5 rounded border border-zinc-800/50 bg-zinc-950/30 flex justify-between items-start group leading-snug">
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
            className="w-full bg-transparent text-zinc-300 text-xs p-2 outline-none border border-zinc-800/50 focus:border-green-900 rounded placeholder-zinc-600 mt-1"
            placeholder="Anotar bônus ativo e apertar Enter..."
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
  );
};
