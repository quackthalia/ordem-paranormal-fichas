import React, { useState } from 'react';
import type { ItemAmaldicoado, ItemAmaldicoadoInventario } from '../types';
import { InputOtimizado } from './InputOtimizado';

export function ModalEditarItemAmaldicoado({
  itemInventario,
  onSave,
  onClose,
}: {
  itemInventario: ItemAmaldicoadoInventario;
  onSave: (novosDados: Partial<ItemAmaldicoado>) => void;
  onClose: () => void;
}) {
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const { item } = itemInventario;

  const [nome, setNome] = useState(item.Nome_Ama || '');
  const [descricao, setDescricao] = useState(item.Desc_Ama || '');
  const [categoria, setCategoria] = useState(item.Categoria_Ama || '');
  const [espacos, setEspacos] = useState(item.Espacos_Ama?.toString() || '');
  const [elemento, setElemento] = useState(item.Elemento_Ama || '');
  const [dt, setDt] = useState(item.DT_Ama || '');

  const handleSave = () => {
    onSave({
      Nome_Ama: nome,
      Desc_Ama: descricao,
      Categoria_Ama: categoria,
      Espacos_Ama: espacos,
      Elemento_Ama: elemento,
      DT_Ama: dt,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-md flex flex-col max-h-[90vh] shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 shrink-0">
          <h2 className="text-xl font-bold text-zinc-100 uppercase tracking-wider">
            Editar Item Amaldiçoado
          </h2>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 bg-zinc-900/50 hover:bg-zinc-800 p-2 rounded transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Nome</label>
            <input 
              type="text" 
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200 outline-none focus:border-green-500/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Elemento</label>
              <select 
                value={elemento}
                onChange={e => setElemento(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200 outline-none focus:border-green-500/50 transition-colors"
              >
                <option value="">Nenhum</option>
                <option value="Sangue">Sangue</option>
                <option value="Morte">Morte</option>
                <option value="Conhecimento">Conhecimento</option>
                <option value="Energia">Energia</option>
                <option value="Medo">Medo</option>
                <option value="Varia">Varia</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Categoria</label>
              <select 
                value={categoria}
                onChange={e => setCategoria(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200 outline-none focus:border-green-500/50 transition-colors"
              >
                <option value="0">0</option>
                <option value="I">I</option>
                <option value="II">II</option>
                <option value="III">III</option>
                <option value="IV">IV</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Espaços</label>
              <input 
                type="text" 
                value={espacos}
                onChange={e => setEspacos(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200 outline-none focus:border-green-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">DT</label>
              <input 
                type="text" 
                value={dt}
                onChange={e => setDt(e.target.value)}
                placeholder="Ex: 15"
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200 outline-none focus:border-green-500/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Descrição</label>
            <InputOtimizado 
              value={descricao}
              onChange={setDescricao}
              className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200 outline-none focus:border-green-500/50 transition-colors min-h-[120px]"
              multiline
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 shrink-0 flex justify-end">
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-green-700 hover:bg-green-600 text-white font-bold rounded uppercase tracking-wider text-sm transition-colors"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
