import React, { useRef, useEffect, useState } from 'react';
import { useRPG } from '../context/RPGContext';
import { InputOtimizado } from './InputOtimizado';
import { ToolbarFormato } from './ToolbarFormato';
import type { TrilhaSelecionada } from '../types';
import { calcularNivel } from '../utils/rpgRules';

export function ModalEditarTrilha({
  onClose,
  isVersatilidade,
}: {
  onClose: () => void;
  isVersatilidade?: boolean;
}) {
  const { trilhasHook, nex, regras } = useRPG();
  const trilhaOriginal = isVersatilidade ? trilhasHook.versatilidadeSelecionada : trilhasHook.trilhaSelecionada;

  const [nomeTrilha, setNomeTrilha] = useState(trilhaOriginal?.Nome_Trilha || '');
  const [descTrilha, setDescTrilha] = useState(trilhaOriginal?.Descricao_Trilha || '');
  
  const [nome10, setNome10] = useState(trilhaOriginal?.Nome_Habilidade_10 || '');
  const [desc10, setDesc10] = useState(trilhaOriginal?.Descricao_Habilidade_10 || '');
  
  const [nome40, setNome40] = useState(trilhaOriginal?.Nome_Habilidade_40 || '');
  const [desc40, setDesc40] = useState(trilhaOriginal?.Descricao_Habilidade_40 || '');
  
  const [nome65, setNome65] = useState(trilhaOriginal?.Nome_Habilidade_65 || '');
  const [desc65, setDesc65] = useState(trilhaOriginal?.Descricao_Habilidade_65 || '');
  
  const [nome99, setNome99] = useState(trilhaOriginal?.Nome_Habilidade_99 || '');
  const [desc99, setDesc99] = useState(trilhaOriginal?.Descricao_Habilidade_99 || '');

  const [fonte, setFonte] = useState(trilhaOriginal?.Fonte_Trilha || '');

  const ref = useRef<HTMLDivElement>(null);
  
  // Refs for content editable
  const editorDescTrilha = useRef<HTMLDivElement>(null);
  const editorDesc10 = useRef<HTMLDivElement>(null);
  const editorDesc40 = useRef<HTMLDivElement>(null);
  const editorDesc65 = useRef<HTMLDivElement>(null);
  const editorDesc99 = useRef<HTMLDivElement>(null);



  if (!trilhaOriginal) return null;

  const handleSalvar = () => {
    const editado: TrilhaSelecionada = {
      ...trilhaOriginal,
      Nome_Trilha: nomeTrilha,
      Descricao_Trilha: editorDescTrilha.current?.innerHTML || descTrilha,
      Nome_Habilidade_10: nome10,
      Descricao_Habilidade_10: editorDesc10.current?.innerHTML || desc10,
      Nome_Habilidade_40: nome40,
      Descricao_Habilidade_40: editorDesc40.current?.innerHTML || desc40,
      Nome_Habilidade_65: nome65,
      Descricao_Habilidade_65: editorDesc65.current?.innerHTML || desc65,
      Nome_Habilidade_99: nome99,
      Descricao_Habilidade_99: editorDesc99.current?.innerHTML || desc99,
      Fonte_Trilha: fonte,
    };
    if (isVersatilidade) {
      trilhasHook.setVersatilidadeSelecionada(editado);
    } else {
      trilhasHook.setTrilhaSelecionada(editado);
    }
    onClose();
  };

  const InputLabel = ({ label }: { label: string }) => (
    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mt-3 mb-1 block">
      {label}
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-5">
      <div
        ref={ref}
        className="flex h-full max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-5 py-4">
          <h2 className="font-display text-lg uppercase tracking-wide text-zinc-100">
            Personalizar Trilha
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-red-500 transition"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar flex flex-col gap-4">
          
          <div className="rounded border border-zinc-800 bg-zinc-950 p-4">
            <h3 className="font-bold text-red-500 mb-2 border-b border-zinc-800 pb-2">Geral</h3>
            <div className="flex flex-col gap-1.5 text-left">
              <InputLabel label="Nome da Trilha" />
              <InputOtimizado
                value={nomeTrilha}
                onChange={setNomeTrilha}
                className="rounded border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-100 outline-none focus:border-red-700"
              />
              
              <InputLabel label="Fonte" />
              <InputOtimizado
                value={fonte}
                onChange={setFonte}
                className="rounded border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-100 outline-none focus:border-red-700"
              />

              {!isVersatilidade && (
                <>
                  <InputLabel label="Descrição Principal" />
                  <div>
                    <ToolbarFormato editorRef={editorDescTrilha as any} />
                    <div
                      ref={(el) => {
                        editorDescTrilha.current = el;
                        if (el && !el.dataset.initialized) {
                          el.innerHTML = descTrilha;
                          el.dataset.initialized = 'true';
                        }
                      }}
                      contentEditable
                      onBlur={(e) => setDescTrilha(e.currentTarget.innerHTML)}
                      className="min-h-[60px] rounded-b border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-zinc-300 outline-none focus:border-red-700"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {[
            { nex: 10, nome: nome10, setNome: setNome10, desc: desc10, setDesc: setDesc10, refEdit: editorDesc10 },
            { nex: 40, nome: nome40, setNome: setNome40, desc: desc40, setDesc: setDesc40, refEdit: editorDesc40 },
            { nex: 65, nome: nome65, setNome: setNome65, desc: desc65, setDesc: setDesc65, refEdit: editorDesc65 },
            { nex: 99, nome: nome99, setNome: setNome99, desc: desc99, setDesc: setDesc99, refEdit: editorDesc99 },
          ].filter(hab => nex >= hab.nex && (!isVersatilidade || hab.nex === 10)).map((hab) => (
            <div key={hab.nex} className="rounded border border-zinc-800 bg-zinc-950 p-4">
              <h3 className="font-bold text-red-500 mb-2 border-b border-zinc-800 pb-2">Habilidade {regras['nex_experiencia'] ? `Nível ${calcularNivel(hab.nex)}` : `NEX ${hab.nex}%`}</h3>
              <div className="flex flex-col gap-1.5 text-left">
                <InputLabel label="Nome da Habilidade" />
                <InputOtimizado
                  value={hab.nome}
                  onChange={hab.setNome}
                  className="rounded border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-100 outline-none focus:border-red-700"
                />

                <InputLabel label="Descrição da Habilidade" />
                <div>
                  <ToolbarFormato editorRef={hab.refEdit as any} />
                  <div
                    ref={(el) => {
                      hab.refEdit.current = el;
                      if (el && !el.dataset.initialized) {
                        el.innerHTML = hab.desc;
                        el.dataset.initialized = 'true';
                      }
                    }}
                    contentEditable
                    onBlur={(e) => hab.setDesc(e.currentTarget.innerHTML)}
                    className="min-h-[60px] rounded-b border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-zinc-300 outline-none focus:border-red-700"
                  />
                </div>
              </div>
            </div>
          ))}

        </div>

        <div className="flex justify-end gap-3 border-t border-zinc-800 bg-zinc-900/50 p-4">
          <button
            onClick={onClose}
            className="rounded border border-zinc-700 px-5 py-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            className="rounded bg-red-700 px-5 py-2 text-xs font-bold uppercase tracking-wider text-zinc-100 shadow hover:bg-red-600"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
