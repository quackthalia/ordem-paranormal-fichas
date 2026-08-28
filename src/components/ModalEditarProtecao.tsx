import React, { useState, useEffect, useRef } from 'react';
import type { ProtecaoInventario } from '../types';
import { ToolbarFormato } from './ToolbarFormato';
import { CustomSelect } from './CustomSelect';

import { AprimoramentosSelector } from './AprimoramentosSelector';
import { useRPG } from '../context/RPGContext';
import { categoriaRomanParaNum, categoriaNumParaRoman } from '../utils/rpgRules';

interface ModalEditarProtecaoProps {
  protecao: ProtecaoInventario | null;
  onClose: () => void;
  onSave: (id: string, novosDados: any, modificacoes?: number[], maldicoes?: number[], maldicoesElementos?: Record<number, string>) => void;
}

export function ModalEditarProtecao({ protecao, onClose, onSave }: ModalEditarProtecaoProps) {
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const safeP = protecao?.protecao;
  const [nome, setNome] = useState(safeP?.Nome_Protecao || '');
  const [descricao, setDescricao] = useState(safeP?.Descricao_Protecao || '');
  const [proficiencia, setProficiencia] = useState(safeP?.Proficiencia || 'Proteções Leves');
  const [defesa, setDefesa] = useState(String(safeP?.Defesa_Protecao || ''));
  const [espacos, setEspacos] = useState(Number(safeP?.Espacos_Protecao || 0));
  const [categoria, setCategoria] = useState(safeP?.Categoria_Protecao || 'I');
  
  const editorDesc = useRef<HTMLElement | null>(null);

  const { modificacoesHook, maldicoesHook } = useRPG();
  const [modificacoes, setModificacoes] = useState<number[]>(protecao?.modificacoes || []);
  const [maldicoes, setMaldicoes] = useState<number[]>(protecao?.maldicoes || []);
  const [maldicoesElementos, setMaldicoesElementos] = useState<Record<number, string>>(protecao?.maldicoesElementos || {});

  const catNum = categoriaRomanParaNum(categoria);
  const catFinal = catNum + modificacoes.length;
  const podeAdicionarMod = catFinal < 4;
  const podeAdicionarMald = true;

  const temDiscreto = modificacoes.some(id => modificacoesHook.modificacoes.find(m => m.Codigo_Modif === id)?.Nome_Modif.trim().toLowerCase() === 'discreto');
  
  const getEspacoNumber = (val: string | number) => {
    const num = Number(String(val).replace(',', '.').replace(/[^0-9.-]+/g, ''));
    return isNaN(num) ? 0 : num;
  };
  const baseEspacos = getEspacoNumber(espacos);
  const espacosFinais = temDiscreto ? Math.max(0, baseEspacos - 1) : baseEspacos;

  
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
      return maldicoesHook.maldicoes.filter(m => ['proteções', 'escudos'].includes(m.Categoria_Mald.trim().toLowerCase()));
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
      const cat = m.Categoria_Modif.toLowerCase();
      const prof = proficiencia.toLowerCase();
      const nomeMod = m.Nome_Modif.trim().toLowerCase();
      
      if (!cat.includes('proteç')) return false;

      if (cat.includes('leve') && !prof.includes('leve')) return false;
      if (cat.includes('pesada') && !prof.includes('pesada')) return false;
      if (cat.includes('escudo') && !prof.includes('escudo')) return false;

      // Mutuamente exclusivas: Discreta vs Reforçada
      const temDiscretaList = modificacoes.some(id => modificacoesHook.modificacoes.find(mod => mod.Codigo_Modif === id)?.Nome_Modif.trim().toLowerCase() === 'discreta' || modificacoesHook.modificacoes.find(mod => mod.Codigo_Modif === id)?.Nome_Modif.trim().toLowerCase() === 'discreto');
      const temReforcadaList = modificacoes.some(id => modificacoesHook.modificacoes.find(mod => mod.Codigo_Modif === id)?.Nome_Modif.trim().toLowerCase() === 'reforçada');

      if ((nomeMod === 'discreta' || nomeMod === 'discreto') && temReforcadaList) return false;
      if (nomeMod === 'reforçada' && temDiscretaList) return false;

      return true;
    });
  };



  if (!protecao) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-5" onClick={onClose}>
      <div 
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-4">
          <h2 className="text-xl font-bold tracking-wider text-zinc-100 uppercase">
            Editar Proteção
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 transition hover:text-zinc-100 p-2 text-2xl border-none bg-transparent"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
          {/* Nome */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-zinc-300">Nome da Proteção</label>
            <input
              type="text"
              className="w-full rounded bg-zinc-950 border border-zinc-700 p-2 text-zinc-100 focus:border-green-500 focus:outline-none"
              value={nome}
              onChange={e => setNome(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div >
              <label className="mb-1 block text-sm font-semibold text-zinc-300">Proficiência</label>
              <CustomSelect
                value={proficiencia}
                onChange={val => setProficiencia(val)}
                options={[
                  { value: "Proteções Leves", label: "Proteções Leves" },
                  { value: "Proteções Pesadas", label: "Proteções Pesadas" }
                ]}
                wrapperClassName="w-full"
              />
            </div>
            <div >
              <label className="mb-1 block text-sm font-semibold text-zinc-300">Categoria</label>
              <CustomSelect
                value={categoriaNumParaRoman(catFinal)}
                onChange={val => setCategoria(categoriaNumParaRoman(Math.max(0, categoriaRomanParaNum(val) - modificacoes.length)))}
                options={[
                  { value: "0", label: "0" },
                  { value: "I", label: "I" },
                  { value: "II", label: "II" },
                  { value: "III", label: "III" },
                  { value: "IV", label: "IV" }
                ]}
                wrapperClassName="w-full"
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-semibold text-zinc-300">Defesa</label>
              <input
                type="text"
                className="w-full rounded bg-zinc-950 border border-zinc-700 p-2 text-zinc-100 focus:border-green-500 focus:outline-none"
                value={defesa}
                onChange={e => setDefesa(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-zinc-300">Espaço</label>
              <input
                type="number"
                min="0"
                step="0.5"
                className="w-full rounded bg-zinc-950 border border-zinc-700 p-2 text-zinc-100 focus:border-green-500 focus:outline-none"
                value={espacosFinais.toString()}
                onChange={e => {
                  const num = getEspacoNumber(e.target.value);
                  setEspacos(temDiscreto ? num + 1 : num);
                }}
              />
            </div>
          </div>

          <div className="mt-2">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Descrição</label>
            <div className="rounded border border-zinc-800 bg-zinc-950">
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

          <div className="mt-6 border-t border-zinc-800 pt-4">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 block">Aprimoramentos</label>
            <AprimoramentosSelector 
              modificacoesAplicadas={modificacoes}
              opcoesModificacoes={getOpcoesModificacoes()}
              todasModificacoes={modificacoesHook.modificacoes}
              onAddMod={handleAddMod}
              onRemoveMod={handleRemoveMod}
              podeAdicionarMod={podeAdicionarMod}
              
              maldicoesAplicadas={maldicoes}
              opcoesMaldicoes={getOpcoesMaldicoes()}
              todasMaldicoes={maldicoesHook.maldicoes}
              maldicoesElementos={maldicoesElementos}
              onAddMald={handleAddMald}
              onRemoveMald={handleRemoveMald}
              podeAdicionarMald={podeAdicionarMald}
            />
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
            onClick={() => {
              onSave(protecao.id, {
                Nome_Protecao: nome,
                Descricao_Protecao: editorDesc.current?.innerHTML || descricao,
                Proficiencia: proficiencia,
                Defesa_Protecao: defesa,
                Espacos_Protecao: getEspacoNumber(espacos),
                Categoria_Protecao: categoria
              }, modificacoes, maldicoes, maldicoesElementos);
              onClose();
            }}
            className="rounded bg-green-800 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition hover:bg-green-700"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
