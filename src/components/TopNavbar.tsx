import React from 'react';
import { useRPG } from '../context/RPGContext';

export const TopNavbar: React.FC = () => {
  const { voltarParaHub } = useRPG();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-[1600px] items-center justify-center px-4 md:px-6">
        {/* ABA AGENTES */}
        <nav className="flex h-full items-center">
          <button
            type="button"
            onClick={() => voltarParaHub()}
            className="group relative flex h-full items-center px-3 text-sm font-medium tracking-wide text-zinc-100 transition-colors hover:text-green-400 cursor-pointer"
            title="Agentes"
          >
            <span>Agentes</span>
            {/* Indicador de aba ativa */}
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] transition-all duration-200" />
          </button>
        </nav>
      </div>

      {/* Linha de borda sutil */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-green-600/30 to-transparent" />
    </header>
  );
};
