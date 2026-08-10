import React, { useState } from 'react';
import { InputOtimizado } from './InputOtimizado';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (ritualNome: string) => void;
  rituaisNomes: string[];
}

export const ModalEscolherRitualAprendido: React.FC<Props> = ({ isOpen, onClose, onSelect, rituaisNomes }) => {
  const [busca, setBusca] = useState('');

  if (!isOpen) return null;

  const rituaisFiltrados = rituaisNomes.filter(nome => 
    nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-5">
      <div className="flex w-full max-w-lg flex-col gap-4 rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-4">
          <h2 className="font-display text-lg uppercase tracking-widest text-zinc-100">
            Escolher <span className="text-red-500">Ritual</span>
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition text-2xl">✕</button>
        </div>

        {/* Busca */}
        <div className="px-6">
          <InputOtimizado
            value={busca}
            onChange={setBusca}
            placeholder="Buscar ritual aprendido..."
            className="w-full bg-zinc-950 border border-zinc-700 p-3 text-sm text-zinc-200 rounded outline-none focus:border-red-800 transition"
          />
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-scroll max-h-[60vh] px-6 pb-6 custom-scrollbar">
          <div className="flex flex-col gap-2">
            {rituaisFiltrados.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-4 italic">Nenhum ritual encontrado.</p>
            ) : (
              rituaisFiltrados.map((nome, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelect(nome)}
                  className="flex justify-between items-center bg-zinc-900 border border-zinc-800 rounded p-4 text-left hover:bg-zinc-800 transition group"
                >
                  <span className="font-bold text-zinc-200 group-hover:text-zinc-100 transition">{nome}</span>
                  <span className="rounded bg-red-700 px-4 py-1.5 text-xs font-bold uppercase text-zinc-100 transition hover:bg-red-600">Selecionar</span>
                </button>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
