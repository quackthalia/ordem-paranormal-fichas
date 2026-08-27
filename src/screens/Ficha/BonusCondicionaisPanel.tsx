import React from 'react';
import { useRPG } from '../../context/RPGContext';

export const BonusCondicionaisPanel: React.FC = () => {
  const { 
    regrasAutomaticasAtivas,
    bonusDadosCondicionais, setBonusDadosCondicionais,
    bonusDadosAtivos, setBonusDadosAtivos,
    poderesHook,
    periciasHook
  } = useRPG();

  return (
    <div className="flex flex-col rounded-md border border-zinc-700 bg-zinc-900 shadow-xl overflow-hidden ">
      <h4 className="bg-zinc-950 px-4 py-2 text-center font-display tracking-widest text-zinc-300 uppercase border-b border-zinc-800">
        Modificadores de Dados
      </h4>
      <div className="flex flex-col p-4 gap-4">
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
