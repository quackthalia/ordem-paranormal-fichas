import React from 'react';

interface ToolbarFormatoProps {
  editorRef: React.RefObject<HTMLElement | null>;
}

export const ToolbarFormato: React.FC<ToolbarFormatoProps> = ({ editorRef }) => {
  const format = (cmd: string) => {
    document.execCommand(cmd, false);
    editorRef.current?.focus();
  };

  return (
    <div className="flex gap-1.5 mb-1.5 rounded-t bg-zinc-900/50 p-1.5 border border-zinc-700 border-b-0">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); format('bold'); }}
        className="flex h-7 w-7 items-center justify-center rounded bg-zinc-800 text-sm font-bold text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
        title="Negrito"
      >
        B
      </button>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); format('italic'); }}
        className="flex h-7 w-7 items-center justify-center rounded bg-zinc-800 text-sm italic text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
        title="Itálico"
      >
        I
      </button>
    </div>
  );
};
