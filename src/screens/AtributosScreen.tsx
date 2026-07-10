// AtributosScreen.tsx — CORRIGIDO
import React from 'react';
import { useRPG } from '../context/RPGContext';
import { capMaximoAtributo, NEX_OPTIONS } from '../utils/rpgRules';
import type { AtributoKey } from '../types';

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
    atributos,
    pontosRestantes,
    alterarAtributo,
    setTelaAtual,
  } = useRPG();

  const handleNexChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const novoNex = Number(e.target.value);
    setNex(novoNex);
    // ❌ REMOVIDO: setAtributos({ FOR: 1, AGI: 1, INT: 1, PRE: 1, VIG: 1 });
    // ✅ Agora só muda o NEX, os atributos distribuídos permanecem intactos
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="font-display mb-2 text-3xl uppercase tracking-wide text-zinc-100">
        Criação de Personagem
      </h1>
      <p className="mb-8 border-b border-zinc-800 pb-4 text-sm uppercase tracking-widest text-red-600">
        Passo 1 — Atributos
      </p>

      {/* SELETOR DE NEX */}
      <div className="mb-6 flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
        <label htmlFor="nex-select" className="text-sm font-bold uppercase tracking-wider text-zinc-400">
          NEX Inicial
        </label>
        <select
          id="nex-select"
          value={nex}
          onChange={handleNexChange}
          className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 font-bold text-zinc-100"
        >
          {NEX_OPTIONS.map(n => (
            <option key={n} value={n}>{n}%</option>
          ))}
        </select>
      </div>

      {/* PONTOS RESTANTES — recalcula automaticamente */}
      <div className={`mb-6 text-lg font-bold ${pontosRestantes < 0 ? 'text-red-500' : 'text-zinc-100'}`}>
        Pontos restantes:{' '}
        <span className={pontosRestantes > 0 ? 'text-red-500' : 'text-zinc-500'}>{pontosRestantes}</span>
      </div>

      {/* LISTA DE ATRIBUTOS */}
      <div className="mb-8 flex max-w-md flex-col gap-3">
        {ATRIBUTOS_ORDER.map(nome => {
          const temAtributoZerado = Object.values(atributos).some(v => v === 0);
          const naoPodeDiminuir = atributos[nome] === 0 || (atributos[nome] === 1 && temAtributoZerado);
          const naoPodeAumentar = pontosRestantes <= 0 || atributos[nome] >= capMaximoAtributo(nex);

          return (
            <div
              key={nome}
              className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3"
            >
              <div>
                <span className="font-bold text-zinc-100">{nome}</span>
                <span className="ml-2 hidden text-sm text-zinc-500 sm:inline">{NOMES_ATRIBUTOS[nome]}</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => alterarAtributo(nome, 'diminuir')}
                  disabled={naoPodeDiminuir}
                  className="h-9 w-9 rounded-md border border-zinc-700 bg-zinc-800 text-lg font-bold text-zinc-100 transition hover:border-red-700 hover:bg-red-900/40 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-zinc-700 disabled:hover:bg-zinc-800"
                >
                  −
                </button>
                <span className="min-w-6 text-center text-2xl font-bold">{atributos[nome]}</span>
                <button
                  onClick={() => alterarAtributo(nome, 'aumentar')}
                  disabled={naoPodeAumentar}
                  className="h-9 w-9 rounded-md border border-zinc-700 bg-zinc-800 text-lg font-bold text-zinc-100 transition hover:border-red-700 hover:bg-red-900/40 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-zinc-700 disabled:hover:bg-zinc-800"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setTelaAtual('origens')}
        className="rounded-md bg-red-700 px-8 py-3 text-lg font-bold uppercase tracking-wider text-zinc-100 transition hover:bg-red-600"
      >
        Avançar para Origens ➔
      </button>
    </div>
  );
};