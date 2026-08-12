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

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = 'unset'; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const rituaisFiltrados = rituaisNomes.filter(nome => 
    nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans" onClick={onClose}>
      <div 
        className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex flex-col border-b border-zinc-800 p-5 pb-4 bg-zinc-900/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg uppercase tracking-wide text-zinc-100">
                ESCOLHER RITUAL
              </h2>
              <p className="mt-1 text-xs text-zinc-400">Selecione um ritual aprendido.</p>
            </div>
            <button onClick={onClose} className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100">&times;</button>
          </div>

          <InputOtimizado
            value={busca}
            onChange={setBusca}
            placeholder="Buscar ritual aprendido..."
            className="flex-1 rounded border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-green-700 w-full"
          />
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {rituaisFiltrados.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-4 italic">Nenhum ritual encontrado.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
              {rituaisFiltrados.map((nome, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-900/40 border border-zinc-800/80 rounded p-3 hover:border-green-500/50 hover:bg-zinc-900/80 transition group flex flex-col h-full"
                >
                  <span className="font-bold text-zinc-200 group-hover:text-green-400 transition">{nome}</span>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-4 text-[11px] border-t border-zinc-800/50 pt-2">
                    <button
                      onClick={() => onSelect(nome)}
                      className="ml-auto px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors active:scale-95"
                    >
                      Selecionar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
