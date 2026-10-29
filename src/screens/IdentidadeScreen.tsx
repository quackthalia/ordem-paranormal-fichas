import React, { useState, useRef } from 'react';
import { useRPG } from '../context/RPGContext';
import { comprimirImagemParaAvatar } from '../utils/saveLoad';

export const IdentidadeScreen: React.FC = () => {
  const {
    nomePersonagem,
    setNomePersonagem,
    nomeJogador,
    setNomeJogador,
    fotoPersonagem,
    setFotoPersonagem,
    classe,
    nex,
    origensHook,
    setTelaAtual,
    finalizarCriacaoAgente,
  } = useRPG();

  const [salvando, setSalvando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadImagem = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await comprimirImagemParaAvatar(file);
      setFotoPersonagem(dataUrl);
    } catch {
      // ignora erro
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFinalizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (salvando) return;
    setSalvando(true);
    try {
      await finalizarCriacaoAgente({
        nomePersonagem,
        nomeJogador,
        fotoPersonagem,
      });
    } finally {
      setSalvando(false);
    }
  };

  const origemNome = origensHook.origemSelecionada?.Nome || 'Não selecionada';
  const temFoto = Boolean(fotoPersonagem && fotoPersonagem.trim() !== '');

  return (
    <div className="mx-auto w-full max-w-3xl">
      <header className="mb-10 flex flex-col items-center text-center">
        <h1 className="font-display mb-2 text-3xl uppercase tracking-wide text-zinc-100">
          Identificação do Agente
        </h1>
        <p className="mb-6 text-sm font-bold uppercase tracking-widest text-green-500">
          Passo 4 — Toques Finais
        </p>
        <div className="w-full max-w-xl text-sm leading-relaxed text-zinc-400">
          <p>
            Defina o nome e a foto do seu investigador para registrar sua ficha na Ordem.
          </p>
        </div>
        <div className="mt-8 h-px w-full bg-zinc-800/80"></div>
      </header>

      <form
        onSubmit={handleFinalizar}
        className="mx-auto flex flex-col gap-8 rounded-xl border border-green-900/60 bg-zinc-900/60 p-6 md:p-8 shadow-2xl"
      >
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          {/* CANTO EXCLUSIVO DA FOTO DO PERSONAGEM */}
          <div className="flex w-56 shrink-0 flex-col gap-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`group relative flex h-64 w-56 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 transition ${
                temFoto
                  ? 'border-green-800/80 bg-zinc-950 shadow-lg hover:border-green-500'
                  : 'border-dashed border-zinc-700 bg-zinc-950/70 hover:border-green-600 hover:bg-zinc-950'
              }`}
            >
              {temFoto ? (
                <>
                  <img
                    src={fotoPersonagem}
                    alt="Foto do Personagem"
                    className="h-full w-full object-cover transition duration-200 group-hover:scale-105 group-hover:opacity-40"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 transition group-hover:opacity-100">
                    <span className="rounded-md bg-zinc-900/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-100 border border-zinc-700">
                      Trocar Foto
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 px-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-500 transition group-hover:border-green-800 group-hover:text-green-400">
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 group-hover:text-green-400 transition">
                    Adicionar Foto
                  </span>
                  <span className="text-[11px] text-zinc-500 leading-tight">
                    Clique para escolher do computador
                  </span>
                </div>
              )}
            </div>

            <input
              type="text"
              placeholder="Ou cole a URL da imagem"
              value={fotoPersonagem.startsWith('data:') ? '' : fotoPersonagem}
              onChange={e => setFotoPersonagem(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-green-600"
            />

            {temFoto && (
              <button
                type="button"
                onClick={() => setFotoPersonagem('')}
                className="w-full rounded-lg border border-red-900/50 bg-red-950/30 py-1.5 text-xs font-bold uppercase tracking-wider text-red-400 transition hover:bg-red-900/50 cursor-pointer"
              >
                Remover Foto
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUploadImagem}
              className="hidden"
            />
          </div>

          {/* CAMPOS DE IDENTIFICAÇÃO E RESUMO */}
          <div className="flex w-full flex-1 flex-col justify-between gap-6">
            {/* TOPO: NEX SEPARADO + ORIGEM & CLASSE */}
            <div className="flex items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    Origem
                  </span>
                  <span className="mt-0.5 text-base font-bold text-zinc-100">
                    {origemNome}
                  </span>
                </div>

                <div className="h-8 w-px bg-zinc-800 hidden sm:block"></div>

                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    Classe
                  </span>
                  <span className="mt-0.5 text-base font-bold text-green-400">
                    {classe || 'Não selecionada'}
                  </span>
                </div>
              </div>

              {/* NEX SEPARADO EM DESTAQUE */}
              <div className="flex flex-col items-end shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Exposição
                </span>
                <div className="mt-1 rounded-md border border-green-800/70 bg-green-950/40 px-3 py-1 font-mono text-sm font-bold text-green-400">
                  NEX {nex}%
                </div>
              </div>
            </div>

            {/* INPUT: PERSONAGEM */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="nome-personagem"
                className="text-xs font-bold uppercase tracking-wider text-zinc-200"
              >
                Personagem
              </label>
              <input
                id="nome-personagem"
                type="text"
                placeholder="Nome do personagem"
                value={nomePersonagem}
                onChange={e => setNomePersonagem(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-green-500"
                autoFocus
              />
            </div>

            {/* INPUT: JOGADOR */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="nome-jogador"
                className="text-xs font-bold uppercase tracking-wider text-zinc-200"
              >
                Jogador
              </label>
              <input
                id="nome-jogador"
                type="text"
                placeholder="Nome do jogador"
                value={nomeJogador}
                onChange={e => setNomeJogador(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* BOTÕES DE NAVEGAÇÃO */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 border-t border-zinc-800/80 pt-6">
          <button
            type="button"
            onClick={() => setTelaAtual('classe')}
            className="w-full sm:w-auto rounded-md border border-zinc-700 bg-zinc-800 px-6 py-3 text-sm font-bold uppercase tracking-wider text-zinc-300 transition hover:bg-zinc-700 cursor-pointer"
          >
            Voltar
          </button>

          <button
            type="submit"
            disabled={salvando}
            className="w-full sm:w-auto rounded-md bg-green-700 px-8 py-3 text-sm font-bold uppercase tracking-wider text-zinc-100 shadow-lg transition hover:bg-green-600 disabled:opacity-50 cursor-pointer"
          >
            {salvando ? 'Salvando...' : 'Finalizar e Abrir Ficha'}
          </button>
        </div>
      </form>
    </div>
  );
};
