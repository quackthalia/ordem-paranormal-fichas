import React from 'react';
import { useRPG } from '../context/RPGContext';
import { proficienciasIniciais } from '../utils/rpgRules';
import type { ClasseRPG } from '../types';

export const ClasseScreen: React.FC = () => {
  const {
    setClasse,
    setTelaAtual,
    skillCombatente1,
    setSkillCombatente1,
    setSkillCombatente2,
    skillCombatente2,
    setProficiencias,
  } = useRPG();

  const combatentePronto = skillCombatente1 !== '' && skillCombatente2 !== '';

  const escolherClasse = (novaClasse: ClasseRPG) => {
    if (!novaClasse) return;

    setClasse(novaClasse);
    setProficiencias(proficienciasIniciais(novaClasse));
    setTelaAtual('ficha');
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="font-display mb-2 text-center text-3xl uppercase tracking-wide text-zinc-100">
        Escolha sua Classe
      </h1>
      <p className="mb-10 text-center text-sm uppercase tracking-widest text-red-600">
        Passo 3 — Seu papel na Ordem
      </p>

      <div className="flex flex-col items-stretch gap-5 lg:flex-row">
        {/* COMBATENTE — Sangue */}
        <div className="flex flex-1 flex-col rounded-xl border border-red-900/60 bg-zinc-900/60 p-6 transition hover:border-red-700">
          <h2 className="font-display mb-3 text-center text-xl uppercase tracking-wide text-red-500">
            Combatente
          </h2>
          <p className="flex-grow text-sm leading-relaxed text-zinc-400">
            Treinado para lutar com todo tipo de armas, e com a força e a coragem
            para encarar os perigos de frente.
          </p>

          <div className="my-5 flex min-h-[102px] flex-col justify-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 text-sm">
            <div className="flex items-center justify-center gap-3">
              <label className="flex cursor-pointer items-center gap-1.5">
                <input type="radio" name="c1" className="accent-red-600" checked={skillCombatente1 === 'Luta'} onChange={() => setSkillCombatente1('Luta')} /> Luta
              </label>
              <span className="text-zinc-600">ou</span>
              <label className="flex cursor-pointer items-center gap-1.5">
                <input type="radio" name="c1" className="accent-red-600" checked={skillCombatente1 === 'Pontaria'} onChange={() => setSkillCombatente1('Pontaria')} /> Pontaria
              </label>
            </div>
            <div className="flex items-center justify-center gap-3">
              <label className="flex cursor-pointer items-center gap-1.5">
                <input type="radio" name="c2" className="accent-red-600" checked={skillCombatente2 === 'Fortitude'} onChange={() => setSkillCombatente2('Fortitude')} /> Fortitude
              </label>
              <span className="text-zinc-600">ou</span>
              <label className="flex cursor-pointer items-center gap-1.5">
                <input type="radio" name="c2" className="accent-red-600" checked={skillCombatente2 === 'Reflexos'} onChange={() => setSkillCombatente2('Reflexos')} /> Reflexos
              </label>
            </div>
          </div>

          <button
            onClick={() => escolherClasse('Combatente')}
            disabled={!combatentePronto}
            className="w-full rounded-lg bg-red-800 p-3.5 font-bold uppercase tracking-wider text-zinc-100 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600"
          >
            {combatentePronto ? 'Selecionar Combatente' : 'Escolha as perícias'}
          </button>
        </div>

        {/* ESPECIALISTA — Conhecimento */}
        <div className="flex flex-1 flex-col rounded-xl border border-amber-900/60 bg-zinc-900/60 p-6 transition hover:border-amber-600">
          <h2 className="font-display mb-3 text-center text-xl uppercase tracking-wide text-amber-400">
            Especialista
          </h2>
          <p className="flex-grow text-sm leading-relaxed text-zinc-400">
            Um agente que confia mais em esperteza do que em força bruta.
          </p>
          <div className="my-5 flex min-h-[102px] items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/80 p-4">
            <p className="text-sm font-bold text-amber-300/90">Perícias em dobro</p>
          </div>
          <button
            onClick={() => escolherClasse('Especialista')}
            className="w-full rounded-lg bg-amber-700 p-3.5 font-bold uppercase tracking-wider text-zinc-100 transition hover:bg-amber-600"
          >
            Selecionar Especialista
          </button>
        </div>

        {/* OCULTISTA — Medo */}
        <div className="flex flex-1 flex-col rounded-xl border border-zinc-600/60 bg-zinc-900/60 p-6 transition hover:border-zinc-300">
          <h2 className="font-display mb-3 text-center text-xl uppercase tracking-wide text-zinc-200">
            Ocultista
          </h2>
          <p className="flex-grow text-sm leading-relaxed text-zinc-400">
            Muitos estudiosos das entidades se perdem em busca de poder...
          </p>
          <div className="my-5 flex min-h-[102px] items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/80 p-4">
            <p className="text-sm font-bold text-zinc-300">Vontade & Ocultismo</p>
          </div>
          <button
            onClick={() => escolherClasse('Ocultista')}
            className="w-full rounded-lg bg-zinc-200 p-3.5 font-bold uppercase tracking-wider text-zinc-900 transition hover:bg-white"
          >
            Selecionar Ocultista
          </button>
        </div>
      </div>
    </div>
  );
};
