// AtributosScreen.tsx — CORRIGIDO
import React from 'react';
import { useRPG } from '../context/RPGContext';
import { capMaximoAtributo, NEX_OPTIONS } from '../utils/rpgRules';
import type { AtributoKey } from '../types';
import { CustomSelect } from '../components/CustomSelect';

const ATRIBUTOS_ORDER: AtributoKey[] = ['FOR', 'AGI', 'INT', 'PRE', 'VIG'];

const NOMES_ATRIBUTOS: Record<AtributoKey, string> = {
  FOR: 'Força',
  AGI: 'Agilidade',
  INT: 'Intelecto',
  PRE: 'Presença',
  VIG: 'Vigor',
};

export const AtributosScreen: React.FC = () => {
  const {
    nex, setNex,
    nivel,
    atributos,
    pontosRestantes,
    alterarAtributo,
    setTelaAtual,
  } = useRPG();

  const handleNexChange = (novoNex: string) => {
    setNex(Number(novoNex));
    // ❌ REMOVIDO: setAtributos({ FOR: 1, AGI: 1, INT: 1, PRE: 1, VIG: 1 });
    // ✅ Agora só muda o NEX, os atributos distribuídos permanecem intactos
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="mb-10 flex flex-col items-center text-center">
        <h1 className="font-display mb-2 text-3xl uppercase tracking-wide text-zinc-100">
          Criação de Personagem
        </h1>
        <p className="mb-6 text-sm uppercase tracking-widest text-green-500 font-bold">
          Passo 1 — Atributos
        </p>
        <div className="w-full max-w-3xl text-sm leading-relaxed text-zinc-400 space-y-4">
          <p>
            Quando você cria um personagem, todos os seus atributos começam em 1 e você recebe 4 pontos para distribuir entre eles como quiser. Você também pode reduzir um atributo para 0 para receber 1 ponto adicional. O valor máximo inicial que você pode ter em cada atributo é 3.
          </p>
        </div>
        <div className="mt-8 h-px w-full max-w-5xl bg-zinc-800/80"></div>
      </header>

      {/* CAIXA DE CONFIGURAÇÃO (NEX & PONTOS) */}
      <div className="mx-auto mb-10 flex w-fit flex-col sm:flex-row items-center justify-center gap-8 rounded-lg border border-zinc-800 bg-zinc-900/60 px-8 py-5 relative z-50 shadow-lg">
        
        <div className="flex items-center gap-4">
          <label htmlFor="nex-select" className="text-sm font-bold uppercase tracking-wider text-zinc-300">
            NEX Inicial
          </label>
          <CustomSelect 
            value={(NEX_OPTIONS.includes(nex) ? nex : Math.max(5, Math.ceil(nex / 5) * 5)).toString()} 
            onChange={handleNexChange} 
            options={NEX_OPTIONS.map(n => ({ value: n.toString(), label: n + "%" }))} 
            wrapperClassName="w-24" 
          />
        </div>

        <div className="hidden h-8 w-px bg-zinc-700/50 sm:block"></div>

        <div className={`flex items-center gap-4 text-sm font-bold uppercase tracking-wider ${pontosRestantes < 0 ? 'text-red-500' : 'text-zinc-300'}`}>
          <span>Pontos Restantes</span>
          <span className={`text-2xl ${pontosRestantes > 0 ? 'text-green-500' : (pontosRestantes < 0 ? 'text-red-500' : 'text-zinc-500')}`}>
            {pontosRestantes}
          </span>
        </div>

      </div>

      {/* PENTAGRAMA DE ATRIBUTOS */}
      <div className="flex flex-col items-center justify-center w-full max-w-[460px] mx-auto">
        <div className="relative w-full aspect-square">
          <img src="/images/atributos-bg.png" alt="Atributos" className="w-full h-full object-contain pointer-events-none drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]" />
          
          {(() => {
            const renderAtributo = (nome, posClasses) => {
              const temAtributoZerado = Object.values(atributos).some(v => v === 0);
              const naoPodeDiminuir = atributos[nome] === 0 || (atributos[nome] === 1 && temAtributoZerado);
              const naoPodeAumentar = pontosRestantes <= 0 || atributos[nome] >= capMaximoAtributo(nivel);

              return (
                <div key={nome} className={`absolute flex items-center justify-center gap-1.5 ${posClasses}`}>
                  <button
                    onClick={() => alterarAtributo(nome, 'diminuir')}
                    disabled={naoPodeDiminuir}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-lg font-bold text-zinc-300 transition hover:border-red-700 hover:text-red-500 hover:bg-red-900/20 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-zinc-700 disabled:hover:text-zinc-300 disabled:hover:bg-zinc-900 pointer-events-auto"
                  >
                    −
                  </button>
                  <span className="min-w-5 text-center text-3xl font-black text-zinc-100 drop-shadow-md pointer-events-none">{atributos[nome]}</span>
                  <button
                    onClick={() => alterarAtributo(nome, 'aumentar')}
                    disabled={naoPodeAumentar}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-lg font-bold text-zinc-300 transition hover:border-green-700 hover:text-green-500 hover:bg-green-900/20 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-zinc-700 disabled:hover:text-zinc-300 disabled:hover:bg-zinc-900 pointer-events-auto"
                  >
                    +
                  </button>
                </div>
              );
            };

            return (
              <>
                {renderAtributo('AGI', 'top-[16%] left-[50%] -translate-x-1/2 -translate-y-1/2')}
                {renderAtributo('INT', 'top-[36%] right-[19%] translate-x-1/2 -translate-y-1/2')}
                {renderAtributo('VIG', 'top-[74%] right-[28%] translate-x-1/2 -translate-y-1/2')}
                {renderAtributo('PRE', 'top-[74%] left-[27%] -translate-x-1/2 -translate-y-1/2')}
                {renderAtributo('FOR', 'top-[36%] left-[19%] -translate-x-1/2 -translate-y-1/2')}
              </>
            );
          })()}
        </div>
        </div>

      <button
        onClick={() => setTelaAtual('origens')}
        className="mt-12 rounded-md bg-green-700 px-8 py-3 text-lg font-bold uppercase tracking-wider text-zinc-100 transition hover:bg-green-600"
      >
        Avançar para Origens ➔
      </button>
    </div>
  );
};