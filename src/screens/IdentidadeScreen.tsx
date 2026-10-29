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
    <div className="mx-auto w-full max-w-5xl">
      <header className="mb-12 flex flex-col items-center text-center">
        <h1 className="font-display mb-2 text-3xl uppercase tracking-wide text-zinc-100">
          Identificação do Agente
        </h1>
        <p className="mb-6 text-sm font-bold uppercase tracking-widest text-green-500">
          Passo 4 — Toques Finais
        </p>
        <div className="w-full max-w-3xl text-sm leading-relaxed text-zinc-400">
          <p>
            Defina o nome e a foto do seu investigador para registrar sua ficha na Ordem.
          </p>
        </div>
        <div className="mt-8 h-px w-full max-w-5xl bg-zinc-800/80"></div>
      </header>

      <form onSubmit={handleFinalizar} className="w-full">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
          {/* COLUNA DA ESQUERDA: CAMPOS DO PERSONAGEM E JOGADOR */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div className="flex flex-col gap-2.5">
              <label
                htmlFor="nome-personagem"
                className="text-sm font-bold uppercase tracking-wider text-zinc-200"
              >
                Personagem
              </label>
              <input
                id="nome-personagem"
                type="text"
                placeholder="Nome do personagem"
                value={nomePersonagem}
                onChange={e => setNomePersonagem(e.target.value)}
                className="w-full border-b-2 border-zinc-700 bg-transparent py-3 text-xl font-semibold text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-green-500"
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <label
                htmlFor="nome-jogador"
                className="text-sm font-bold uppercase tracking-wider text-zinc-200"
              >
                Jogador
              </label>
              <input
                id="nome-jogador"
                type="text"
                placeholder="Nome do jogador"
                value={nomeJogador}
                onChange={e => setNomeJogador(e.target.value)}
                className="w-full border-b-2 border-zinc-700 bg-transparent py-3 text-xl font-semibold text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-green-500"
              />
            </div>

            {/* INFORMAÇÕES ESCOLHIDAS NOS PASSOS ANTERIORES (SOLTAS NA PÁGINA) */}
            <div className="mt-4 grid grid-cols-3 gap-8 pt-6 border-t border-zinc-800/60">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  NEX Inicial
                </span>
                <span className="font-display text-2xl font-bold text-green-500">
                  {nex}%
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Origem
                </span>
                <span className="text-xl font-bold text-zinc-100">
                  {origemNome}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Classe
                </span>
                <span className="text-xl font-bold text-zinc-100">
                  {classe || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* COLUNA DA DIREITA: CANTO DA FOTO DO PERSONAGEM */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end gap-4">
            <div className="w-full max-w-[280px] flex flex-col gap-3">
              <span className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                Foto do Personagem
              </span>

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`group relative flex h-72 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border transition ${
                  temFoto
                    ? 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-600'
                    : 'border-dashed border-zinc-700 bg-zinc-900/30 hover:border-zinc-500 hover:bg-zinc-900/60'
                }`}
              >
                {temFoto ? (
                  <>
                    <img
                      src={fotoPersonagem}
                      alt="Foto do Personagem"
                      className="h-full w-full object-cover transition duration-200 group-hover:scale-105 group-hover:opacity-40"
                    />
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setFotoPersonagem('');
                      }}
                      title="Remover foto"
                      className="absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/75 text-xs font-bold text-zinc-300 transition hover:bg-black hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center opacity-0 transition group-hover:opacity-100">
                      <span className="rounded-md bg-zinc-900/90 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-100 border border-zinc-700">
                        Trocar Foto
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 px-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-500 transition group-hover:border-zinc-600 group-hover:text-zinc-300">
                      <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 group-hover:text-zinc-100 transition">
                      Selecionar Imagem
                    </span>
                    <span className="text-xs text-zinc-500">
                      Clique para enviar do computador
                    </span>
                  </div>
                )}
              </div>

              <input
                type="text"
                placeholder="Ou cole o link (URL) da imagem"
                value={fotoPersonagem.startsWith('data:') ? '' : fotoPersonagem}
                onChange={e => setFotoPersonagem(e.target.value)}
                className="w-full border-b border-zinc-700 bg-transparent py-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-green-500"
              />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUploadImagem}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* BOTÕES SOLTOS NO RODAPÉ DA PÁGINA */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setTelaAtual('classe')}
            className="rounded-md border border-zinc-700 bg-zinc-800 px-6 py-3 font-bold text-zinc-300 transition hover:bg-zinc-700 cursor-pointer"
          >
            Voltar
          </button>

          <button
            type="submit"
            disabled={salvando}
            className="rounded-md bg-green-700 px-8 py-3 text-lg font-bold uppercase tracking-wider text-zinc-100 transition hover:bg-green-600 disabled:opacity-50 cursor-pointer"
          >
            {salvando ? 'Salvando...' : 'Finalizar e Abrir Ficha'}
          </button>
        </div>
      </form>
    </div>
  );
};
