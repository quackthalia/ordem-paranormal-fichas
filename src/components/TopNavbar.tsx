import React from 'react';
import { useRPG } from '../context/RPGContext';

export const TopNavbar: React.FC = () => {
  const { telaAtual, voltarParaHub, fotoPersonagem, nomePersonagem } = useRPG();

  const handleIrParaAgentes = () => {
    voltarParaHub();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 md:px-6">
        {/* LOGO / IDENTIDADE DA ORDEM */}
        <div
          onClick={handleIrParaAgentes}
          className="flex items-center gap-2.5 cursor-pointer transition opacity-90 hover:opacity-100 select-none"
          title="Ir para Agentes"
        >
          {/* Símbolo estilizado da Ordem */}
          <div className="flex h-7 w-7 items-center justify-center rounded border border-green-800/60 bg-green-950/30 text-green-400">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3v18M3 12h18" opacity="0.6" />
              <circle cx="12" cy="12" r="3.5" fill="currentColor" />
            </svg>
          </div>
          <span className="font-display text-lg font-bold tracking-widest text-zinc-100">
            O.R.D.E.M.
          </span>
        </div>

        {/* ABAS CENTRAIS — ESTILO CRIS */}
        <nav className="flex h-full items-center gap-8">
          <button
            type="button"
            onClick={handleIrParaAgentes}
            className="group relative flex h-full items-center px-1 text-sm font-medium tracking-wide text-zinc-100 transition-colors hover:text-green-400 cursor-pointer"
            title="Meus Agentes"
          >
            <span>Agentes</span>
            {/* Indicador de aba ativa (verde) */}
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] transition-all duration-200" />
          </button>
        </nav>

        {/* LADO DIREITO — AVATAR / PERFIL DO AGENTE */}
        <div className="flex items-center gap-3">
          {fotoPersonagem ? (
            <div
              onClick={() => {
                if (telaAtual !== 'ficha') {
                  voltarParaHub();
                }
              }}
              className="h-8 w-8 overflow-hidden rounded-full border border-zinc-700 bg-zinc-900 shadow transition hover:border-green-500 cursor-pointer"
              title={nomePersonagem || 'Agente'}
            >
              <img src={fotoPersonagem} alt="Avatar" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Linha de borda com brilho sutil */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-green-600/30 to-transparent" />
    </header>
  );
};
