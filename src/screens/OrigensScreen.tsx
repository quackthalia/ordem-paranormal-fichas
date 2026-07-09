import React from 'react';
import { useRPG } from '../context/RPGContext';

export const OrigensScreen: React.FC = () => {
  const { setTelaAtual, origensHook } = useRPG();
  const {
    origens,
    origensExpandidas,
    toggleOrigemExpandida,
    loading,
    error,
    selecionarOrigem,
    nomePericia,
  } = origensHook;

  if (loading) {
    return <div className="mx-auto max-w-3xl text-zinc-400">Carregando origens...</div>;
  }
  if (error) {
    return <div className="mx-auto max-w-3xl text-red-500">Erro: {error}</div>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="font-display mb-2 text-3xl uppercase tracking-wide text-zinc-100">
        Escolha sua Origem
      </h1>
      <p className="mb-8 border-b border-zinc-800 pb-4 text-sm uppercase tracking-widest text-red-600">
        Passo 2 — Quem você era antes do Paranormal
      </p>

      <div className="mb-8 flex flex-col gap-3">
        {origens.map(origem => {
          const estaExpandida = origensExpandidas.includes(origem.Codigo_Origem);

          return (
            <div
              key={origem.Codigo_Origem}
              className="overflow-hidden rounded-r-lg border-l-4 border-red-800 bg-zinc-900/60 transition hover:bg-zinc-900"
            >
              {/* CABEÇALHO */}
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <button
                  onClick={() => toggleOrigemExpandida(origem.Codigo_Origem)}
                  className="flex flex-1 items-center gap-3 bg-transparent text-left"
                >
                  <span className={`text-xs text-zinc-600 transition-transform ${estaExpandida ? 'rotate-180' : ''}`}>▼</span>
                  <span className="text-lg font-bold text-zinc-100">{origem.Nome}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    selecionarOrigem(origem);
                    setTelaAtual('classe');
                  }}
                  className="rounded-md bg-red-700 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-100 transition hover:bg-red-600"
                >
                  Escolher
                </button>
              </div>

              {/* CONTEÚDO EXPANSÍVEL */}
              {estaExpandida && (
                <div className="border-t border-zinc-800 px-5 pb-5 pt-4 text-left leading-relaxed text-zinc-400">
                  <p className="mb-3">{origem.Descricao}</p>
                  <p className="mb-3">
                    <strong className="text-zinc-200">Perícias treinadas. </strong>
                    {nomePericia(origem.Pericia_Treinada_1)} e {nomePericia(origem.Pericia_Treinada_2)}
                    {origem.Pericia_Treinada_Especial ? ` e ${nomePericia(origem.Pericia_Treinada_Especial)}` : ''}.
                  </p>
                  <p>
                    <strong className="text-red-500">{origem.Nome_Poder}. </strong>
                    {origem.Descricao_Poder}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setTelaAtual('atributos')}
        className="rounded-md border border-zinc-700 bg-zinc-800 px-6 py-3 font-bold text-zinc-300 transition hover:bg-zinc-700"
      >
        ◀ Voltar
      </button>
    </div>
  );
};
