import React, { useEffect } from 'react';
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

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const combatentePronto = skillCombatente1 !== '' && skillCombatente2 !== '';

  const escolherClasse = (novaClasse: ClasseRPG) => {
    if (!novaClasse) return;

    setClasse(novaClasse);
    setProficiencias(proficienciasIniciais(novaClasse));
    setTelaAtual('identidade');
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <header className="mb-10 flex flex-col items-center text-center">
        <h1 className="font-display mb-2 text-3xl uppercase tracking-wide text-zinc-100">
          Escolha sua Classe
        </h1>
        <p className="mb-6 text-sm uppercase tracking-widest text-green-500 font-bold">
          Passo 3 — Seu papel na Ordem
        </p>
        <div className="w-full max-w-3xl text-sm leading-relaxed text-zinc-400 space-y-4">
          <p>Sua classe indica o treinamento que você recebeu na Ordem para enfrentar os perigos do Outro Lado. Em termos de jogo, é a sua característica mais importante, pois define o que você faz e qual é o seu papel no grupo de investigadores.</p><p>Ordem Paranormal RPG contém três classes, que representam os principais arquétipos de heróis em histórias de terror e suspense:</p>
        </div>
        <div className="mt-8 h-px w-full max-w-5xl bg-zinc-800/80"></div>
      </header>

      <div className="flex flex-col items-stretch gap-5 lg:grid lg:grid-cols-3 lg:gap-5">
        {/* COMBATENTE — Sangue */}
        <div className="flex flex-1 flex-col rounded-xl border border-green-900/60 bg-zinc-900/60 p-6 transition hover:border-green-700 lg:grid lg:grid-rows-[auto_1fr_auto_auto]">
          <h2 className="font-display mb-3 text-center text-xl uppercase tracking-wide text-green-500">
            Combatente
          </h2>
          <div className="mb-5 flex flex-col justify-start">
            <p className="text-sm leading-relaxed text-zinc-400 text-center">
              Treinado para lutar com todo tipo de armas, e com a força e a coragem para encarar os perigos de frente, É o tipo de agente que prefere abordagens mais diretas e costuma atirar primeiro e perguntar depois.
            </p>
          </div>

          {/* CARACTERÍSTICAS TÉCNICAS */}
          <div className="mb-5 flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-950/70 p-4 text-xs">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-green-400 border-b border-zinc-800/80 pb-1.5 text-center">
              Características
            </h3>

            {/* PV */}
            <div className="border-b border-zinc-800/50 pb-2">
              <div className="flex items-center justify-between font-bold text-zinc-200">
                <span>PONTOS DE VIDA INICIAIS</span>
                <span className="text-green-400 font-mono">20 + VIGOR</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-0.5">
                <span>A cada novo nível de exposição</span>
                <span className="font-mono text-zinc-300">4 PV (+Vig)</span>
              </div>
            </div>

            {/* PE */}
            <div className="border-b border-zinc-800/50 pb-2">
              <div className="flex items-center justify-between font-bold text-zinc-200">
                <span>PONTOS DE ESFORÇO INICIAIS</span>
                <span className="text-green-400 font-mono">2 + PRESENÇA</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-0.5">
                <span>A cada novo nível de exposição</span>
                <span className="font-mono text-zinc-300">2 PE (+Pre)</span>
              </div>
            </div>

            {/* SAN */}
            <div className="border-b border-zinc-800/50 pb-2">
              <div className="flex items-center justify-between font-bold text-zinc-200">
                <span>SANIDADE INICIAL</span>
                <span className="text-green-400 font-mono">12</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-0.5">
                <span>A cada novo nível de exposição</span>
                <span className="font-mono text-zinc-300">3 SAN</span>
              </div>
            </div>

            {/* PERÍCIAS */}
            <div className="border-b border-zinc-800/50 pb-2">
              <span className="block font-bold text-zinc-200 mb-1">PERÍCIAS TREINADAS</span>
              <p className="text-[11px] leading-relaxed text-zinc-400">
                Luta ou Pontaria (uma das duas) e Fortitude ou Reflexos (uma das duas), mais uma quantidade de perícias à sua escolha igual a 1 + Intelecto.
              </p>
            </div>

            {/* PROFICIÊNCIAS */}
            <div>
              <span className="block font-bold text-zinc-200 mb-1">PROFICIÊNCIAS</span>
              <p className="text-[11px] leading-relaxed text-zinc-400">
                Armas simples, táticas e proteções leves.
              </p>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <div className="flex flex-col justify-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 text-sm">
              <div className="flex items-center justify-center gap-3">
                <label className="flex cursor-pointer items-center gap-1.5">
                  <input type="radio" name="c1" className="accent-green-600" checked={skillCombatente1 === 'Luta'} onChange={() => setSkillCombatente1('Luta')} /> Luta
                </label>
                <span className="text-zinc-600">ou</span>
                <label className="flex cursor-pointer items-center gap-1.5">
                  <input type="radio" name="c1" className="accent-green-600" checked={skillCombatente1 === 'Pontaria'} onChange={() => setSkillCombatente1('Pontaria')} /> Pontaria
                </label>
              </div>
              <div className="flex items-center justify-center gap-3">
                <label className="flex cursor-pointer items-center gap-1.5">
                  <input type="radio" name="c2" className="accent-green-600" checked={skillCombatente2 === 'Fortitude'} onChange={() => setSkillCombatente2('Fortitude')} /> Fortitude
                </label>
                <span className="text-zinc-600">ou</span>
                <label className="flex cursor-pointer items-center gap-1.5">
                  <input type="radio" name="c2" className="accent-green-600" checked={skillCombatente2 === 'Reflexos'} onChange={() => setSkillCombatente2('Reflexos')} /> Reflexos
                </label>
              </div>
            </div>

            <button
              onClick={() => escolherClasse('Combatente')}
              disabled={!combatentePronto}
              className="w-full rounded-lg bg-green-800 p-3.5 font-bold uppercase tracking-wider text-zinc-100 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600"
            >
              {combatentePronto ? 'Selecionar Combatente' : 'Escolha as perícias'}
            </button>
          </div>
        </div>

        {/* ESPECIALISTA — Conhecimento */}
        <div className="flex flex-1 flex-col rounded-xl border border-green-900/60 bg-zinc-900/60 p-6 transition hover:border-green-700 lg:grid lg:grid-rows-[auto_1fr_auto_auto]">
          <h2 className="font-display mb-3 text-center text-xl uppercase tracking-wide text-green-500">
            Especialista
          </h2>
          <div className="mb-5 flex flex-col justify-start">
            <p className="text-sm leading-relaxed text-zinc-400 text-center">
              Um agente que confia mais em esperteza do que em força bruta. Um especialista se vale de conhecimento técnico, raciocínio rápido ou mesmo lábia para resolver mistérios e enfrentar o paranormal.
            </p>
          </div>

          {/* CARACTERÍSTICAS TÉCNICAS */}
          <div className="mb-5 flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-950/70 p-4 text-xs">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-green-400 border-b border-zinc-800/80 pb-1.5 text-center">
              Características
            </h3>

            {/* PV */}
            <div className="border-b border-zinc-800/50 pb-2">
              <div className="flex items-center justify-between font-bold text-zinc-200">
                <span>PONTOS DE VIDA INICIAIS</span>
                <span className="text-green-400 font-mono">16 + VIGOR</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-0.5">
                <span>A cada novo nível de exposição</span>
                <span className="font-mono text-zinc-300">3 PV (+Vig)</span>
              </div>
            </div>

            {/* PE */}
            <div className="border-b border-zinc-800/50 pb-2">
              <div className="flex items-center justify-between font-bold text-zinc-200">
                <span>PONTOS DE ESFORÇO INICIAIS</span>
                <span className="text-green-400 font-mono">3 + PRESENÇA</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-0.5">
                <span>A cada novo nível de exposição</span>
                <span className="font-mono text-zinc-300">3 PE (+Pre)</span>
              </div>
            </div>

            {/* SAN */}
            <div className="border-b border-zinc-800/50 pb-2">
              <div className="flex items-center justify-between font-bold text-zinc-200">
                <span>SANIDADE INICIAL</span>
                <span className="text-green-400 font-mono">16</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-0.5">
                <span>A cada novo nível de exposição</span>
                <span className="font-mono text-zinc-300">4 SAN</span>
              </div>
            </div>

            {/* PERÍCIAS */}
            <div className="border-b border-zinc-800/50 pb-2">
              <span className="block font-bold text-zinc-200 mb-1">PERÍCIAS TREINADAS</span>
              <p className="text-[11px] leading-relaxed text-zinc-400">
                Uma quantidade de perícias à sua escolha igual a 7 + Intelecto.
              </p>
            </div>

            {/* PROFICIÊNCIAS */}
            <div>
              <span className="block font-bold text-zinc-200 mb-1">PROFICIÊNCIAS</span>
              <p className="text-[11px] leading-relaxed text-zinc-400">
                Armas simples e proteções leves.
              </p>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <button
              onClick={() => escolherClasse('Especialista')}
              className="w-full rounded-lg bg-green-800 p-3.5 font-bold uppercase tracking-wider text-zinc-100 transition hover:bg-green-700"
            >
              Selecionar Especialista
            </button>
          </div>
        </div>

        {/* OCULTISTA — Medo */}
        <div className="flex flex-1 flex-col rounded-xl border border-green-900/60 bg-zinc-900/60 p-6 transition hover:border-green-700 lg:grid lg:grid-rows-[auto_1fr_auto_auto]">
          <h2 className="font-display mb-3 text-center text-xl uppercase tracking-wide text-green-500">
            Ocultista
          </h2>
          <div className="mb-5 flex flex-col justify-start">
            <p className="text-sm leading-relaxed text-zinc-400 text-center">
              O Outro Lado é misterioso, perigoso e, de certa forma, cativante. Muitos estudiosos das entidades se perdem em seus reinos obscuros em busca de poder, mas existem aqueles que visam compreender e dominar os mistérios paranormais para combater o próprio Outro Lado.
            </p>
          </div>

          {/* CARACTERÍSTICAS TÉCNICAS */}
          <div className="mb-5 flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-950/70 p-4 text-xs">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-green-400 border-b border-zinc-800/80 pb-1.5 text-center">
              Características
            </h3>

            {/* PV */}
            <div className="border-b border-zinc-800/50 pb-2">
              <div className="flex items-center justify-between font-bold text-zinc-200">
                <span>PONTOS DE VIDA INICIAIS</span>
                <span className="text-green-400 font-mono">12 + VIGOR</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-0.5">
                <span>A cada novo nível de exposição</span>
                <span className="font-mono text-zinc-300">2 PV (+Vig)</span>
              </div>
            </div>

            {/* PE */}
            <div className="border-b border-zinc-800/50 pb-2">
              <div className="flex items-center justify-between font-bold text-zinc-200">
                <span>PONTOS DE ESFORÇO INICIAIS</span>
                <span className="text-green-400 font-mono">4 + PRESENÇA</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-0.5">
                <span>A cada novo nível de exposição</span>
                <span className="font-mono text-zinc-300">4 PE (+Pre)</span>
              </div>
            </div>

            {/* SAN */}
            <div className="border-b border-zinc-800/50 pb-2">
              <div className="flex items-center justify-between font-bold text-zinc-200">
                <span>SANIDADE INICIAL</span>
                <span className="text-green-400 font-mono">20</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-0.5">
                <span>A cada novo nível de exposição</span>
                <span className="font-mono text-zinc-300">5 SAN</span>
              </div>
            </div>

            {/* PERÍCIAS */}
            <div className="border-b border-zinc-800/50 pb-2">
              <span className="block font-bold text-zinc-200 mb-1">PERÍCIAS TREINADAS</span>
              <p className="text-[11px] leading-relaxed text-zinc-400">
                Ocultismo e Vontade, mais uma quantidade de perícias à sua escolha igual a 3 + Intelecto.
              </p>
            </div>

            {/* PROFICIÊNCIAS */}
            <div>
              <span className="block font-bold text-zinc-200 mb-1">PROFICIÊNCIAS</span>
              <p className="text-[11px] leading-relaxed text-zinc-400">
                Armas simples.
              </p>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <button
              onClick={() => escolherClasse('Ocultista')}
              className="w-full rounded-lg bg-green-800 p-3.5 font-bold uppercase tracking-wider text-zinc-100 transition hover:bg-green-700"
            >
              Selecionar Ocultista
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={() => setTelaAtual('origens')}
          className="rounded-md border border-zinc-700 bg-zinc-800 px-6 py-3 font-bold text-zinc-300 transition hover:bg-zinc-700 cursor-pointer"
        >
          Voltar
        </button>
      </div>
    </div>
  );
};
