import React, { useState, useRef } from 'react';
import type { ItemAmaldicoado, ItemAmaldicoadoInventario } from '../types';
import { InputOtimizado } from './InputOtimizado';
import { CustomSelect } from './CustomSelect';
import { ToolbarFormato } from './ToolbarFormato';

const InputLabel = ({ label }: { label: string }) => (
  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block">
    {label}
  </label>
);

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

  if (!itemInventario || !itemInventario.item) {
    return null;
  }

  const { item } = itemInventario;

  const [nome, setNome] = useState(item.Nome_Ama || '');
  const [descricao, setDescricao] = useState(item.Desc_Ama || '');
  const [categoria, setCategoria] = useState(item.Categoria_Ama || '');
  const [espacos, setEspacos] = useState(item.Espacos_Ama?.toString() || '');
  const [elemento, setElemento] = useState(item.Elemento_Ama || '');
  const [dt, setDt] = useState(item.DT_Ama || '');

  const editorDesc = useRef<HTMLDivElement | null>(null);

  const handleSalvar = () => {
    if (editorDesc.current) {
      setDescricao(editorDesc.current.innerHTML);
    }

    onSave({
      Nome_Ama: nome,
      Desc_Ama: editorDesc.current?.innerHTML || descricao,
      Categoria_Ama: categoria,
      Espacos_Ama: espacos,
      Elemento_Ama: elemento,
      DT_Ama: dt,
    });
    onClose();
  };

  const inputClass = "w-full rounded bg-zinc-900/50 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-green-500 focus:bg-zinc-900 focus:ring-1 focus:ring-green-500/50 hover:border-zinc-700";
  const selectClass = "w-full rounded border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300 outline-none transition-all hover:border-zinc-700 focus:border-green-500 focus:bg-zinc-900";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6" onClick={onClose}>
      <div 
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-[#0a0a0a] shadow-[0_0_40px_rgba(0,0,0,0.8)] ring-1 ring-white/5" 
        onClick={e => e.stopPropagation()}
      >
        {/* Glow de borda no topo do Modal */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

        <div className="flex flex-shrink-0 items-center justify-between border-b border-white/5 bg-zinc-900/40 px-6 py-5">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="font-display text-xl uppercase tracking-wider text-zinc-100 drop-shadow-md">
                {itemInventario.id === 'NEW' ? 'Criar Item Amaldiçoado' : 'Editar Item Amaldiçoado'}
              </h2>
              <p className="text-[11px] text-zinc-500 mt-1 uppercase tracking-widest font-semibold">
                Configure as propriedades do item amaldiçoado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col gap-8">
          
          {/* SECTION: Informações Principais */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-green-400/90">Informações Principais</h3>
              <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="col-span-1 md:col-span-2">
                <InputLabel label="Nome do Item" />
                <InputOtimizado value={nome} onChange={setNome} className={inputClass} />
              </div>

              <div>
                <InputLabel label="Elemento" />
                <CustomSelect 
                  value={elemento}
                  onChange={val => setElemento(val)}
                  options={[
                    { value: "", label: "Nenhum" },
                    { value: "Sangue", label: "Sangue" },
                    { value: "Morte", label: "Morte" },
                    { value: "Conhecimento", label: "Conhecimento" },
                    { value: "Energia", label: "Energia" },
                    { value: "Medo", label: "Medo" },
                    { value: "Varia", label: "Varia" }
                  ]}
                  wrapperClassName="w-full"
                  className={selectClass}
                />
              </div>

              <div>
                <InputLabel label="Categoria" />
                <CustomSelect 
                  value={categoria}
                  onChange={val => setCategoria(val)}
                  options={[
                    { value: "0", label: "0" },
                    { value: "I", label: "I" },
                    { value: "II", label: "II" },
                    { value: "III", label: "III" },
                    { value: "IV", label: "IV" }
                  ]}
                  wrapperClassName="w-full"
                  className={selectClass}
                />
              </div>

              <div>
                <InputLabel label="Espaços" />
                <InputOtimizado 
                  value={espacos}
                  onChange={setEspacos}
                  className={inputClass}
                />
              </div>

              <div>
                <InputLabel label="DT" />
                <InputOtimizado 
                  value={dt}
                  onChange={setDt}
                  placeholder="Ex: 15"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* SECTION: Descrição */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-green-400/90">Descrição</h3>
              <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent"></div>
            </div>
            
            <div className="rounded border border-zinc-800/80 bg-zinc-900/30 overflow-hidden focus-within:border-green-500/50 focus-within:ring-1 focus-within:ring-green-500/50 transition-all">
              <ToolbarFormato editorRef={editorDesc as any} />
              <div
                ref={(el) => {
                  editorDesc.current = el;
                  if (el && !el.dataset.initialized) {
                    el.innerHTML = descricao;
                    el.dataset.initialized = 'true';
                  }
                }}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setDescricao(e.currentTarget.innerHTML)}
                className="w-full p-4 text-sm text-zinc-300 outline-none overflow-y-auto custom-scrollbar max-h-[250px] leading-relaxed"
              />
            </div>
          </section>

        </div>

        <div className="flex flex-shrink-0 items-center justify-end gap-3 border-t border-white/5 bg-zinc-900/40 px-6 py-5">
          <button
            onClick={onClose}
            className="rounded border border-zinc-700 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            className="rounded bg-green-600 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_15px_rgba(22,163,74,0.4)] hover:bg-green-500 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(22,163,74,0.6)] transition-all"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
