import React, { useState, useRef } from 'react';
import type { ItemGeralInventario, ItemGeral } from '../types';
import { InputOtimizado } from './InputOtimizado';
import { ToolbarFormato } from './ToolbarFormato';

export function ModalEditarItem({
  itemInventario,
  onSave,
  onClose,
}: {
  itemInventario: ItemGeralInventario;
  onSave: (novosDados: Partial<ItemGeral>) => void;
  onClose: () => void;
}) {
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const { item } = itemInventario;

  const [nome, setNome] = useState(item.Nome_Item || '');
  const [descricao, setDescricao] = useState(item.Desc_Item || '');
  const [categoria, setCategoria] = useState(item.Categoria_Item || '');
  const [espacos, setEspacos] = useState(item.Espacos_Itens?.toString() || '');
  const [dt, setDt] = useState(item.Dt_Item || '');
  const [grupo, setGrupo] = useState(item.Grupo_Item || '');

  const editorDesc = useRef<HTMLDivElement | null>(null);

  const handleSalvar = () => {
    onSave({
      Nome_Item: nome,
      Desc_Item: editorDesc.current?.innerHTML || descricao,
      Categoria_Item: categoria,
      Espacos_Itens: Number(espacos) || 0,
      Dt_Item: dt,
      Grupo_Item: grupo,
    });
    onClose();
  };

  const InputLabel = ({ label }: { label: string }) => (
    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1 block">
      {label}
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-5" onClick={onClose}>
      <div 
        className="flex w-full max-w-lg flex-col gap-6 rounded bg-zinc-950 p-6 shadow-2xl border border-zinc-800" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-xl font-bold tracking-wider text-zinc-100 uppercase">Editar Item</h2>
          <button onClick={onClose} className="text-zinc-500 transition hover:text-zinc-100 p-2">
            X
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
          {/* Nome */}
          <div>
            <InputLabel label="Nome do Item" />
            <InputOtimizado
              value={nome}
              onChange={setNome}
              className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-red-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Categoria */}
            <div>
              <InputLabel label="Categoria" />
              <InputOtimizado
                value={categoria}
                onChange={setCategoria}
                className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-red-800"
              />
            </div>

            {/* Espaços */}
            <div>
              <InputLabel label="Espaços" />
              <InputOtimizado
                value={espacos}
                onChange={setEspacos}
                type="number"
                className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-red-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* DT */}
            <div>
              <InputLabel label="DT" />
              <InputOtimizado
                value={dt}
                onChange={setDt}
                placeholder="Ex: Fortitude, 15 ou 20"
                className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-red-800"
              />
            </div>

            {/* Grupo */}
            <div>
              <InputLabel label="Grupo" />
              <InputOtimizado
                value={grupo}
                onChange={setGrupo}
                placeholder="Ex: Acessórios"
                className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-red-800"
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="flex flex-col flex-1 min-h-[150px]">
            <InputLabel label="Descrição (Aceita *negrito* e _itálico_)" />
            <div className="rounded border border-zinc-800 bg-zinc-900 flex flex-col flex-1">
              <ToolbarFormato targetRef={editorDesc} />
              <div
                ref={editorDesc}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setDescricao(e.currentTarget.innerHTML)}
                className="w-full flex-1 p-3 text-sm text-zinc-100 outline-none overflow-y-auto min-h-[100px]"
                dangerouslySetInnerHTML={{ __html: descricao }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-zinc-800">
          <button
            onClick={handleSalvar}
            className="rounded bg-red-700 px-6 py-2 text-sm font-bold uppercase tracking-wider text-zinc-100 shadow transition hover:bg-red-600"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
