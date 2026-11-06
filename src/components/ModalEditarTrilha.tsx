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
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm bg-black/60 transition-opacity" onClick={onClose} />
      <div
        ref={ref}
        className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-zinc-800 bg-[#0a0a0a] shadow-[0_0_40px_rgba(0,0,0,0.8)] ring-1 ring-white/5 flex flex-col max-h-[90vh]"
      >
        {/* Glow */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

        <div className="flex flex-shrink-0 items-center justify-between border-b border-white/5 bg-zinc-900/40 px-6 py-5 relative z-10">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="font-display text-xl uppercase tracking-wider text-zinc-100 drop-shadow-md">
                {isVersatilidade ? 'EDITAR VERSATILIDADE' : 'EDITAR TRILHA'}
              </h2>
              <p className="text-[11px] text-zinc-500 mt-1 uppercase tracking-widest font-semibold">
                PERSONALIZAR HABILIDADES
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

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar flex flex-col gap-5 relative z-10">
          
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-green-400/90">Geral</h3>
              <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent"></div>
            </div>
            <div className="flex flex-col gap-1.5 text-left">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Nome da Trilha</h4>
              <InputOtimizado
                value={nomeTrilha}
                onChange={setNomeTrilha}
                className="w-full rounded bg-zinc-900/50 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-green-500 focus:bg-zinc-900 focus:ring-1 focus:ring-green-500/50 hover:border-zinc-700"
              />
              
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-2">Fonte</h4>
              <InputOtimizado
                value={fonte}
                onChange={setFonte}
                className="w-full rounded bg-zinc-900/50 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-green-500 focus:bg-zinc-900 focus:ring-1 focus:ring-green-500/50 hover:border-zinc-700"
              />

              {!isVersatilidade && (
                <>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-2">Descrição</h4>
                  <div className="overflow-hidden rounded border border-zinc-800/80 bg-zinc-900/30 focus-within:border-green-500/50 focus-within:ring-1 focus-within:ring-green-500/50 transition-all">
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
                      suppressContentEditableWarning
                      onBlur={(e) => setDescTrilha(e.currentTarget.innerHTML)}
                      className="w-full p-4 text-sm text-zinc-300 outline-none overflow-y-auto custom-scrollbar max-h-[250px] leading-relaxed"
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          {[
            { nex: 10, nome: nome10, setNome: setNome10, desc: desc10, setDesc: setDesc10, refEdit: editorDesc10 },
            { nex: 40, nome: nome40, setNome: setNome40, desc: desc40, setDesc: setDesc40, refEdit: editorDesc40 },
            { nex: 65, nome: nome65, setNome: setNome65, desc: desc65, setDesc: setDesc65, refEdit: editorDesc65 },
            { nex: 99, nome: nome99, setNome: setNome99, desc: desc99, setDesc: setDesc99, refEdit: editorDesc99 },
          ].filter(hab => nex >= hab.nex && (!isVersatilidade || hab.nex === 10)).map((hab) => (
            <section key={hab.nex} className="flex flex-col gap-3">
              <div className="flex items-center gap-3 mb-2 mt-2">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-green-400/90">
                  Habilidade {regras['nex_experiencia'] ? `Nível ${calcularNivel(hab.nex)}` : `NEX ${hab.nex}%`}
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent"></div>
              </div>
              <div className="flex flex-col gap-1.5 text-left">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Nome da Habilidade</h4>
                <InputOtimizado
                  value={hab.nome}
                  onChange={hab.setNome}
                  className="w-full rounded bg-zinc-900/50 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-green-500 focus:bg-zinc-900 focus:ring-1 focus:ring-green-500/50 hover:border-zinc-700"
                />

                <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-2">Descrição</h4>
                <div className="overflow-hidden rounded border border-zinc-800/80 bg-zinc-900/30 focus-within:border-green-500/50 focus-within:ring-1 focus-within:ring-green-500/50 transition-all">
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
                    suppressContentEditableWarning
                    onBlur={(e) => hab.setDesc(e.currentTarget.innerHTML)}
                    className="w-full p-4 text-sm text-zinc-300 outline-none overflow-y-auto custom-scrollbar max-h-[250px] leading-relaxed"
                  />
                </div>
              </div>
            </section>
          ))}

        </div>

        <div className="flex flex-shrink-0 items-center justify-end gap-3 border-t border-white/5 bg-zinc-900/40 px-6 py-5 relative z-10">
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
