import React, { useState, useRef, useEffect } from 'react';
import { useRPG } from '../context/RPGContext';
import { ToolbarFormato } from './ToolbarFormato';
import { InputOtimizado } from './InputOtimizado';

import { AprimoramentosSelector } from './AprimoramentosSelector';
import type { MunicaoInventario, Municao } from '../types';
import { categoriaRomanParaNum, categoriaNumParaRoman } from '../utils/rpgRules';

interface ModalEditarMunicaoProps {
  itemInventario: MunicaoInventario;
  onSave: (municaoBase: Partial<Municao>, modificacoes: number[]) => void;
  onClose: () => void;
}

export function ModalEditarMunicao({ itemInventario, onSave, onClose }: ModalEditarMunicaoProps) {
  const { municao } = itemInventario;
  const { modificacoesHook, maldicoesHook } = useRPG();
  
  const [nome, setNome] = useState(municao.Nome_Item || '');
  const [descricao, setDescricao] = useState(municao.Descricao_Item || '');
  const [categoria, setCategoria] = useState(municao.Categoria_Item || '0');
  const [espacos, setEspacos] = useState(municao['Espaços_Item'] || 0);

  const [modificacoes, setModificacoes] = useState<number[]>(itemInventario.modificacoes || []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const temDiscreto = modificacoes.some(id => modificacoesHook.modificacoes.find(m => m.Codigo_Modif === id)?.Nome_Modif.trim().toLowerCase() === 'discreto');
  
  const getEspacoNumber = (val: string | number) => {
    const num = Number(String(val).replace(',', '.').replace(/[^0-9.-]+/g, ''));
    return isNaN(num) ? 0 : num;
  };
  const baseEspacos = getEspacoNumber(espacos);
  const espacosFinais = temDiscreto ? Math.max(0, baseEspacos - 1) : baseEspacos;

  const catNum = categoriaRomanParaNum(categoria);
  const catFinal = catNum + modificacoes.length;
  const podeAdicionarMod = catFinal < 4;

  
    const handleAddMald = (id: number, elementoVaria?: string) => {
      if (podeAdicionarMald) {
        setMaldicoes(prev => [...prev, id]);
        if (elementoVaria) {
          setMaldicoesElementos(prev => ({ ...prev, [id]: elementoVaria }));
        }
      }
    };
  
    const handleRemoveMald = (index: number) => {
      setMaldicoes(prev => {
        const removedId = prev[index];
        if (removedId !== undefined) {
          setMaldicoesElementos(elemPrev => {
            const copy = { ...elemPrev };
            delete copy[removedId];
            return copy;
          });
        }
        return prev.filter((_, i) => i !== index);
      });
    };

    const getOpcoesMaldicoes = () => {
      return maldicoesHook.maldicoes.filter(m => ['munição'].includes(m.Categoria_Mald.trim().toLowerCase()));
    };

    const handleAddMod = (id: number) => {
    if (podeAdicionarMod) {
      setModificacoes(prev => [...prev, id]);
    }
  };

  const handleRemoveMod = (index: number) => {
    setModificacoes(prev => prev.filter((_, i) => i !== index));
  };

  const getOpcoesModificacoes = () => {
    return modificacoesHook.modificacoes.filter(m => {
      if (!m.Categoria_Modif) return false;
      const cat = m.Categoria_Modif.toLowerCase();
      if (cat.includes('muniç') || cat.includes('munic')) return true;
      return false;
    });
  };

  const editorDesc = useRef<HTMLDivElement | null>(null);

  const handleSalvar = () => {
    onSave({
      Nome_Item: nome,
      Descricao_Item: editorDesc.current?.innerHTML || descricao,
      Categoria_Item: categoria,
      'Espaços_Item': getEspacoNumber(espacos),
    }, modificacoes, maldicoes, maldicoesElementos);
  };

  const InputLabel = ({ label }: { label: string }) => (
    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1 block">
      {label}
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-5">
      <div 
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-4">
          <h2 className="text-xl font-bold tracking-wider text-zinc-100 uppercase">
            Editar Munição
          </h2>
          <button 
            onClick={onClose}
            className="text-zinc-500 transition hover:text-zinc-100 p-2 text-2xl border-none bg-transparent"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col gap-4">
          
          <div className="rounded border border-zinc-800 bg-zinc-950 p-4">
              <h3 className="font-bold text-yellow-500 mb-2 border-b border-zinc-800 pb-2">Atributos Básicos</h3>
              <div className="flex flex-col gap-4">
                
                <div>
                  <InputLabel label="Nome da Munição" />
                  <InputOtimizado
                    value={nome}
                    onChange={setNome}
                    className="w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-100 outline-none focus:border-yellow-700 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <InputLabel label="Categoria" />
                    <InputOtimizado
                      value={categoriaNumParaRoman(catFinal)}
                      onChange={val => setCategoria(categoriaNumParaRoman(Math.max(0, categoriaRomanParaNum(val) - modificacoes.length)))}
                      className="w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-100 outline-none focus:border-yellow-700 transition"
                    />
                  </div>

                  <div>
                    <InputLabel label="Espaços" />
                    <InputOtimizado
                      value={espacosFinais.toString()}
                      onChange={val => {
                        const num = getEspacoNumber(val);
                        setEspacos(temDiscreto ? num + 1 : num);
                      }}
                      type="number"
                      step="0.5"
                      className="w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-100 outline-none focus:border-yellow-700 transition"
                    />
                  </div>
                </div>

                <div className="mt-2 flex-1">
                  <InputLabel label="Descrição" />
                  <div className="rounded border border-zinc-800 bg-zinc-950 flex flex-col h-full">
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
                      className="w-full p-3 text-sm text-zinc-100 outline-none overflow-y-auto custom-scrollbar max-h-[250px]"
                    />
                  </div>
                </div>

              </div>
            </div>

          <div className="mt-6 border-t border-zinc-800 pt-4">
            <div className="flex gap-2 mb-4 border-b border-zinc-800 pb-2">
              <button
                type="button"
                onClick={() => setAbaAprimoramento('modificacoes')}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition ${abaAprimoramento === 'modificacoes' ? 'bg-green-900/40 text-green-400 border border-green-800/50' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border border-transparent'}`}
              >
                Modificações
              </button>
              <button
                type="button"
                onClick={() => setAbaAprimoramento('maldicoes')}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition ${abaAprimoramento === 'maldicoes' ? 'bg-indigo-900/40 text-indigo-400 border border-indigo-800/50' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border border-transparent'}`}
              >
                Maldições
              </button>
            </div>
            {abaAprimoramento === 'modificacoes' && (
              <ModificacoesSelector 
              modificacoesAplicadas={modificacoes}
              onAdd={handleAddMod}
              onRemove={handleRemoveMod}
              opcoesModificacoes={getOpcoesModificacoes()}
              todasModificacoes={modificacoesHook.modificacoes}
              podeAdicionar={podeAdicionarMod}
            />
            )}
            {abaAprimoramento === 'maldicoes' && (
              <MaldicoesSelector
              maldicoesAplicadas={maldicoes}
              opcoesMaldicoes={getOpcoesMaldicoes()}
              todasMaldicoes={maldicoesHook.maldicoes}
              maldicoesElementos={maldicoesElementos}
              onAdd={handleAddMald}
              onRemove={handleRemoveMald}
              podeAdicionar={podeAdicionarMald}
            />
            )}
          </div>

        </div>

        <div className="border-t border-zinc-800 bg-zinc-950 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded px-5 py-2 text-xs font-bold uppercase tracking-wider text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            className="rounded bg-yellow-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-yellow-950 shadow-lg transition hover:bg-yellow-500"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
