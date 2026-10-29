import React, { useState, useRef } from 'react';
import { useRPG } from '../context/RPGContext';
import { comprimirImagemParaAvatar, formatarDataRegistro } from '../utils/saveLoad';

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
    <div className="mx-auto w-full max-w-4xl">
      <header className="mb-10 flex flex-col items-center text-center">
        <h1 className="font-display mb-2 text-3xl uppercase tracking-wide text-zinc-100">
          Identificação do Agente
        </h1>
        <p className="mb-6 text-sm font-bold uppercase tracking-widest text-green-500">
          Passo 4 — Toques Finais
        </p>
        <div className="w-full max-w-2xl space-y-4 text-sm leading-relaxed text-zinc-400">
          <p>
            Preencha os dados de identificação do seu investigador para concluir o registro na Ordem. Ao avançar para a ficha, seu personagem será salvo automaticamente e ficará disponível no Hub Principal.
          </p>
        </div>
        <div className="mt-8 h-px w-full max-w-4xl bg-zinc-800/80"></div>
      </header>

      <form
        onSubmit={handleFinalizar}
        className="mx-auto flex flex-col gap-8 rounded-xl border border-green-900/60 bg-zinc-900/60 p-6 md:p-8 shadow-xl"
      >
        {/* RESUMO RÁPIDO DAS ESCOLHAS ANTERIORES */}
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-bold uppercase tracking-wider text-zinc-500">NEX:</span>
            <span className="font-mono font-bold text-green-400">{nex}%</span>
          </div>
          <span className="text-zinc-700">•</span>
          <div className="flex items-center gap-1.5">
            <span className="font-bold uppercase tracking-wider text-zinc-500">Origem:</span>
            <span className="font-semibold text-zinc-200">{origemNome}</span>
          </div>
          <span className="text-zinc-700">•</span>
          <div className="flex items-center gap-1.5">
            <span className="font-bold uppercase tracking-wider text-zinc-500">Classe:</span>
            <span className="font-semibold text-green-400">{classe || 'Não selecionada'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 items-start">
          {/* COLUNA ESQUERDA: CAMPOS DE TEXTO E UPLOAD */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="nome-personagem"
                className="text-xs font-bold uppercase tracking-wider text-zinc-300"
              >
                Nome do Personagem
              </label>
              <input
                id="nome-personagem"
                type="text"
                placeholder="Ex: Arthur Cervero, Amélia..."
                value={nomePersonagem}
                onChange={e => setNomePersonagem(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-green-500"
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="nome-jogador"
                className="text-xs font-bold uppercase tracking-wider text-zinc-300"
              >
                Nome do Jogador
              </label>
              <input
                id="nome-jogador"
                type="text"
                placeholder="Seu nome..."
                value={nomeJogador}
                onChange={e => setNomeJogador(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-green-500"
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Foto do Personagem (Opcional)
              </label>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-200 transition hover:border-green-600 hover:bg-zinc-700 cursor-pointer"
                >
                  📁 Enviar do Computador
                </button>
                {temFoto && (
                  <button
                    type="button"
                    onClick={() => setFotoPersonagem('')}
                    className="rounded-lg border border-red-900/60 bg-red-950/40 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-red-400 transition hover:bg-red-900/50 cursor-pointer"
                  >
                    Remover Foto
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="Ou cole o link (URL) de uma imagem..."
                value={fotoPersonagem.startsWith('data:') ? '' : fotoPersonagem}
                onChange={e => setFotoPersonagem(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-green-500"
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

          {/* COLUNA DIREITA: PRÉ-VISUALIZAÇÃO DO CARD NO HUB */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Pré-visualização no Hub de Agentes
            </span>
            <div className="flex min-h-[168px] overflow-hidden rounded-md border border-zinc-800 bg-zinc-950/90 shadow-lg">
              {temFoto && (
                <div className="w-36 sm:w-40 shrink-0 overflow-hidden bg-zinc-950">
                  <img
                    src={fotoPersonagem}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="relative flex min-w-0 flex-1 flex-col justify-between p-5">
                <div>
                  <h3 className="truncate text-xl font-semibold text-zinc-100">
                    {nomePersonagem.trim() || 'Agente Sem Nome'}
                  </h3>
                  <p className="mt-0.5 text-sm font-medium text-zinc-200">
                    {classe || 'Sem Classe'}
                  </p>
                  <p className="mt-2.5 text-xs text-zinc-400">
                    Registrado em {formatarDataRegistro()}
                  </p>
                </div>
                <div className="mt-4 flex justify-end">
                  <span className="rounded bg-green-700/80 px-3.5 py-1.5 text-xs font-bold text-zinc-100 opacity-90">
                    Acessar Ficha
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTÕES DE NAVEGAÇÃO */}
        <div className="mt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 border-t border-zinc-800/80 pt-6">
          <button
            type="button"
            onClick={() => setTelaAtual('classe')}
            className="w-full sm:w-auto rounded-md border border-zinc-700 bg-zinc-800 px-6 py-3 font-bold text-zinc-300 transition hover:bg-zinc-700 cursor-pointer"
          >
            ◀ Voltar para Classe
          </button>

          <button
            type="submit"
            disabled={salvando}
            className="w-full sm:w-auto rounded-md bg-green-700 px-8 py-3.5 font-bold uppercase tracking-wider text-zinc-100 shadow-lg transition hover:bg-green-600 disabled:opacity-50 cursor-pointer"
          >
            {salvando ? 'Salvando Agente...' : 'Finalizar e Abrir Ficha ➔'}
          </button>
        </div>
      </form>
    </div>
  );
};
