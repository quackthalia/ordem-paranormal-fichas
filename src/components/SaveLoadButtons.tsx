import React, { useRef } from 'react';
import { useRPG } from '../context/RPGContext';
import { exportarFicha, importarFicha } from '../utils/saveLoad';

export const SaveLoadButtons: React.FC = () => {
  const rpg = useRPG();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportarFicha(rpg);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    importarFicha(e, rpg);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleExport}
        className="flex items-center gap-2 rounded bg-green-700/80 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-green-100 transition hover:bg-green-600"
        title="Baixar Ficha como Arquivo JSON"
      >
        <span>⬇️ Salvar</span>
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 rounded bg-zinc-800 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-300 transition hover:bg-zinc-700"
        title="Importar Ficha de um Arquivo JSON"
      >
        <span>⬆️ Carregar</span>
      </button>

      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={handleImport}
        className="hidden"
      />
    </div>
  );
};
