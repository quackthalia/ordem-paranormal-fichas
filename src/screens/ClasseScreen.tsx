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
      {/* Header Compacto com Botão Voltar integrado */}
      <header className="mb-4">
        <div className="relative flex items-center justify-center">
          <button
            type="button"
            onClick={() => setTelaAtual('origens')}
            className="absolute left-0 inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800/80 px-3.5 py-1.5 text-xs font-bold text-zinc-300 transition hover:bg-zinc-700 cursor-pointer"
          >
            ← Voltar
          </button>
          <div className="text-center">
            <h1 className="font-display text-2xl uppercase tracking-wide text-zinc-100">
              Escolha sua Classe
            </h1>
            <p className="text-xs uppercase tracking-widest text-green-500 font-bold">
              Passo 3 — Seu papel na Ordem
            </p>
          </div>
        </div>
        <p className="mt-1 text-center text-xs text-zinc-400">
          Sua classe define seu treinamento na Ordem, seus atributos vitais e seu papel na equipe de investigadores.
        </p>
      </header>

      {/* Grid das 3 Classes */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-4 items-stretch">
        {/* COMBATENTE */}
        <div className="flex flex-col justify-between rounded-xl border border-green-900/60 bg-zinc-900/60 p-4 transition hover:border-green-700">
          <div>
            <h2 className="font-display mb-1 text-center text-lg uppercase tracking-wide text-green-500">
              Combatente
            </h2>
            <p className="text-xs leading-snug text-zinc-400 text-center mb-3 h-9 flex items-center justify-center">
              Treinado para combater diretamente com todo tipo de armas, força e bravura para encarar os perigos de frente.
            </p>

            {/* Características */}
            <div className="mb-3 flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-xs">
              <h3 className="font-display text-[11px] font-bold uppercase tracking-wider text-green-400 border-b border-zinc-800/80 pb-1 text-center">
                Características
              </h3>

              <div className="flex items-center justify-between border-b border-zinc-800/50 pb-1.5 text-zinc-200">
                <span className="font-semibold text-[11px]">PONTOS DE VIDA</span>
                <span className="text-right">
                  <span className="font-mono font-bold text-green-400">20 + VIG</span>
                  <span className="text-[10px] text-zinc-400 ml-1.5 font-mono">(+4/NEX)</span>
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-zinc-800/50 pb-1.5 text-zinc-200">
                <span className="font-semibold text-[11px]">PONTOS DE ESFORÇO</span>
                <span className="text-right">
                  <span className="font-mono font-bold text-green-400">2 + PRE</span>
                  <span className="text-[10px] text-zinc-400 ml-1.5 font-mono">(+2/NEX)</span>
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-zinc-800/50 pb-1.5 text-zinc-200">
                <span className="font-semibold text-[11px]">SANIDADE</span>
                <span className="text-right">
                  <span className="font-mono font-bold text-green-400">12</span>
                  <span className="text-[10px] text-zinc-400 ml-1.5 font-mono">(+3/NEX)</span>
                </span>
              </div>

              <div className="border-b border-zinc-800/50 pb-1.5">
                <span className="block font-semibold text-zinc-300 text-[11px]">PERÍCIAS TREINADAS</span>
                <p className="text-[11px] leading-tight text-zinc-400 mt-0.5">
                  Luta ou Pontaria, Fortitude ou Reflexos, mais 1 + Int à escolha.
                </p>
              </div>

              <div>
                <span className="block font-semibold text-zinc-300 text-[11px]">PROFICIÊNCIAS</span>
                <p className="text-[11px] leading-tight text-zinc-400 mt-0.5">
                  Armas simples, táticas e proteções leves.
                </p>
              </div>
            </div>
          </div>

          <div>
            {/* Escolhas do Combatente */}
            <div className="flex flex-col gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/80 p-2 text-xs mb-3">
              <div className="flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSkillCombatente1('Luta')}
                  className={`flex-1 py-1 rounded text-xs font-semibold border transition cursor-pointer ${
                    skillCombatente1 === 'Luta'
                      ? 'border-green-600 bg-green-950/50 text-green-300'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Luta
                </button>
                <span className="text-zinc-600 text-[10px]">ou</span>
                <button
                  type="button"
                  onClick={() => setSkillCombatente1('Pontaria')}
                  className={`flex-1 py-1 rounded text-xs font-semibold border transition cursor-pointer ${
                    skillCombatente1 === 'Pontaria'
                      ? 'border-green-600 bg-green-950/50 text-green-300'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Pontaria
                </button>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSkillCombatente2('Fortitude')}
                  className={`flex-1 py-1 rounded text-xs font-semibold border transition cursor-pointer ${
                    skillCombatente2 === 'Fortitude'
                      ? 'border-green-600 bg-green-950/50 text-green-300'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Fortitude
                </button>
                <span className="text-zinc-600 text-[10px]">ou</span>
                <button
                  type="button"
                  onClick={() => setSkillCombatente2('Reflexos')}
                  className={`flex-1 py-1 rounded text-xs font-semibold border transition cursor-pointer ${
                    skillCombatente2 === 'Reflexos'
                      ? 'border-green-600 bg-green-950/50 text-green-300'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Reflexos
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => escolherClasse('Combatente')}
              disabled={!combatentePronto}
              className="w-full rounded-lg bg-green-800 py-2.5 px-3 font-bold uppercase tracking-wider text-xs text-zinc-100 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600 cursor-pointer"
            >
              {combatentePronto ? 'Selecionar Combatente' : 'Escolha as perícias'}
            </button>
          </div>
        </div>

        {/* ESPECIALISTA */}
        <div className="flex flex-col justify-between rounded-xl border border-green-900/60 bg-zinc-900/60 p-4 transition hover:border-green-700">
          <div>
            <h2 className="font-display mb-1 text-center text-lg uppercase tracking-wide text-green-500">
              Especialista
            </h2>
            <p className="text-xs leading-snug text-zinc-400 text-center mb-3 h-9 flex items-center justify-center">
              Confia na esperteza, raciocínio rápido, conhecimento técnico e lábia para investigar e enfrentar o paranormal.
            </p>

            {/* Características */}
            <div className="mb-3 flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-xs">
              <h3 className="font-display text-[11px] font-bold uppercase tracking-wider text-green-400 border-b border-zinc-800/80 pb-1 text-center">
                Características
              </h3>

              <div className="flex items-center justify-between border-b border-zinc-800/50 pb-1.5 text-zinc-200">
                <span className="font-semibold text-[11px]">PONTOS DE VIDA</span>
                <span className="text-right">
                  <span className="font-mono font-bold text-green-400">16 + VIG</span>
                  <span className="text-[10px] text-zinc-400 ml-1.5 font-mono">(+3/NEX)</span>
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-zinc-800/50 pb-1.5 text-zinc-200">
                <span className="font-semibold text-[11px]">PONTOS DE ESFORÇO</span>
                <span className="text-right">
                  <span className="font-mono font-bold text-green-400">3 + PRE</span>
                  <span className="text-[10px] text-zinc-400 ml-1.5 font-mono">(+3/NEX)</span>
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-zinc-800/50 pb-1.5 text-zinc-200">
                <span className="font-semibold text-[11px]">SANIDADE</span>
                <span className="text-right">
                  <span className="font-mono font-bold text-green-400">16</span>
                  <span className="text-[10px] text-zinc-400 ml-1.5 font-mono">(+4/NEX)</span>
                </span>
              </div>

              <div className="border-b border-zinc-800/50 pb-1.5">
                <span className="block font-semibold text-zinc-300 text-[11px]">PERÍCIAS TREINADAS</span>
                <p className="text-[11px] leading-tight text-zinc-400 mt-0.5">
                  7 + Intelecto à sua escolha.
                </p>
              </div>

              <div>
                <span className="block font-semibold text-zinc-300 text-[11px]">PROFICIÊNCIAS</span>
                <p className="text-[11px] leading-tight text-zinc-400 mt-0.5">
                  Armas simples e proteções leves.
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex flex-col justify-center rounded-lg border border-zinc-800/60 bg-zinc-950/40 p-2 text-xs mb-3 text-center min-h-[58px]">
              <span className="text-zinc-300 font-semibold text-[11px]">Versatilidade Técnica</span>
              <span className="text-[10px] text-zinc-400 mt-0.5">
                Maior número de perícias treinadas do jogo, adaptável a qualquer situação.
              </span>
            </div>

            <button
              type="button"
              onClick={() => escolherClasse('Especialista')}
              className="w-full rounded-lg bg-green-800 py-2.5 px-3 font-bold uppercase tracking-wider text-xs text-zinc-100 transition hover:bg-green-700 cursor-pointer"
            >
              Selecionar Especialista
            </button>
          </div>
        </div>

        {/* OCULTISTA */}
        <div className="flex flex-col justify-between rounded-xl border border-green-900/60 bg-zinc-900/60 p-4 transition hover:border-green-700">
          <div>
            <h2 className="font-display mb-1 text-center text-lg uppercase tracking-wide text-green-500">
              Ocultista
            </h2>
            <p className="text-xs leading-snug text-zinc-400 text-center mb-3 h-9 flex items-center justify-center">
              Estuda e domina os mistérios do Outro Lado para combater o paranormal usando rituais e poder mental.
            </p>

            {/* Características */}
            <div className="mb-3 flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-xs">
              <h3 className="font-display text-[11px] font-bold uppercase tracking-wider text-green-400 border-b border-zinc-800/80 pb-1 text-center">
                Características
              </h3>

              <div className="flex items-center justify-between border-b border-zinc-800/50 pb-1.5 text-zinc-200">
                <span className="font-semibold text-[11px]">PONTOS DE VIDA</span>
                <span className="text-right">
                  <span className="font-mono font-bold text-green-400">12 + VIG</span>
                  <span className="text-[10px] text-zinc-400 ml-1.5 font-mono">(+2/NEX)</span>
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-zinc-800/50 pb-1.5 text-zinc-200">
                <span className="font-semibold text-[11px]">PONTOS DE ESFORÇO</span>
                <span className="text-right">
                  <span className="font-mono font-bold text-green-400">4 + PRE</span>
                  <span className="text-[10px] text-zinc-400 ml-1.5 font-mono">(+4/NEX)</span>
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-zinc-800/50 pb-1.5 text-zinc-200">
                <span className="font-semibold text-[11px]">SANIDADE</span>
                <span className="text-right">
                  <span className="font-mono font-bold text-green-400">20</span>
                  <span className="text-[10px] text-zinc-400 ml-1.5 font-mono">(+5/NEX)</span>
                </span>
              </div>

              <div className="border-b border-zinc-800/50 pb-1.5">
                <span className="block font-semibold text-zinc-300 text-[11px]">PERÍCIAS TREINADAS</span>
                <p className="text-[11px] leading-tight text-zinc-400 mt-0.5">
                  Ocultismo e Vontade, mais 3 + Int à escolha.
                </p>
              </div>

              <div>
                <span className="block font-semibold text-zinc-300 text-[11px]">PROFICIÊNCIAS</span>
                <p className="text-[11px] leading-tight text-zinc-400 mt-0.5">
                  Armas simples.
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex flex-col justify-center rounded-lg border border-zinc-800/60 bg-zinc-950/40 p-2 text-xs mb-3 text-center min-h-[58px]">
              <span className="text-zinc-300 font-semibold text-[11px]">Canalizador de Rituais</span>
              <span className="text-[10px] text-zinc-400 mt-0.5">
                Maior Sanidade e PE iniciais para aprender e conjurar rituais paranormais.
              </span>
            </div>

            <button
              type="button"
              onClick={() => escolherClasse('Ocultista')}
              className="w-full rounded-lg bg-green-800 py-2.5 px-3 font-bold uppercase tracking-wider text-xs text-zinc-100 transition hover:bg-green-700 cursor-pointer"
            >
              Selecionar Ocultista
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
