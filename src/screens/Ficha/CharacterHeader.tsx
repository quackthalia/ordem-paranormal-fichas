import React from 'react';
import { useRPG } from '../../context/RPGContext';

export const CharacterHeader: React.FC = () => {
  const { classe, origensHook } = useRPG();
  const origemNome = origensHook.origemSelecionada?.Nome || '';

  return (
    <div className="flex w-full items-end gap-5 mb-4">
      {/* Avatar Placeholder */}
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded bg-zinc-800 border border-zinc-700 shadow-md flex items-center justify-center relative group cursor-pointer">
        <img src="https://drive.google.com/uc?export=view&id=1PcyQ99Z2n8wY3R67E7aN_cW4fJ3Vj5F3" alt="Avatar" className="object-cover w-full h-full opacity-50 group-hover:opacity-30 transition" />
      </div>

      {/* Info Grid */}
      <div className="flex flex-1 gap-10">
        
        {/* Left Column: Personagem & Origem */}
        <div className="flex flex-1 flex-col gap-2">
          {/* Personagem */}
          <div className="flex items-end">
            <span className="w-24 text-[0.6rem] font-bold uppercase tracking-widest text-zinc-400 shrink-0 pb-1">Personagem</span>
            <input
              type="text"
              placeholder="Nome"
              className="flex-1 border-b border-zinc-200 bg-transparent py-0.5 text-sm font-bold text-zinc-100 outline-none transition focus:border-red-500"
            />
          </div>
          {/* Origem */}
          <div className="flex items-end">
            <span className="w-24 text-[0.6rem] font-bold uppercase tracking-widest text-zinc-400 shrink-0 pb-1">Origem</span>
            <input
              key={`origem-${origemNome}`}
              type="text"
              defaultValue={origemNome}
              placeholder="Sua Origem"
              className="flex-1 border-b border-zinc-200 bg-transparent py-0.5 text-sm font-bold text-zinc-100 outline-none transition focus:border-red-500"
            />
          </div>
        </div>

        {/* Right Column: Jogador & Classe */}
        <div className="flex flex-1 flex-col gap-2">
          {/* Jogador */}
          <div className="flex items-end">
            <span className="w-20 text-[0.6rem] font-bold uppercase tracking-widest text-zinc-400 shrink-0 pb-1">Jogador</span>
            <input
              type="text"
              placeholder="Seu Nome"
              className="flex-1 border-b border-zinc-200 bg-transparent py-0.5 text-sm font-bold text-zinc-100 outline-none transition focus:border-red-500"
            />
          </div>
          {/* Classe */}
          <div className="flex items-end">
            <span className="w-20 text-[0.6rem] font-bold uppercase tracking-widest text-zinc-400 shrink-0 pb-1">Classe</span>
            <input
              key={`classe-${classe || ''}`}
              type="text"
              defaultValue={classe || ''}
              placeholder="Sua Classe"
              className="flex-1 border-b border-zinc-200 bg-transparent py-0.5 text-sm font-bold text-zinc-100 outline-none transition focus:border-red-500"
            />
          </div>
        </div>

      </div>
    </div>
  );
};
