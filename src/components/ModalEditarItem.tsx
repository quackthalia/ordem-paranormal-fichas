import React, { useState, useRef } from 'react';
import type { ItemGeralInventario, ItemGeral } from '../types';
import { InputOtimizado } from './InputOtimizado';
import { ToolbarFormato } from './ToolbarFormato';

import { ModificacoesSelector } from './ModificacoesSelector';
import { useRPG } from '../context/RPGContext';
import { categoriaRomanParaNum, categoriaNumParaRoman } from '../utils/rpgRules';

export function ModalEditarItem({
  itemInventario,
  onSave,
  onClose,
}: {
  itemInventario: ItemGeralInventario;
  onSave: (novosDados: Partial<ItemGeral>, modificacoes?: number[]) => void;
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

  const { modificacoesHook, periciasHook } = useRPG();
  const [modificacoes, setModificacoes] = useState<number[]>(itemInventario.modificacoes || []);
  const [escolhendoFuncaoAdicional, setEscolhendoFuncaoAdicional] = useState<number | null>(null);
  const [escolhendoAprimorado, setEscolhendoAprimorado] = useState<number | null>(null);
  
  const TODAS_PERICIAS = Object.keys(periciasHook?.pericias || {}).sort();

  const getPericiasDoItem = () => {
    let p: string[] = [];
    if (nome.toLowerCase().includes('amuleto sagrado')) {
      p.push('Religião', 'Vontade');
    }
    const match = nome.match(/\((.*?)\)/);
    if (match) {
       p.push(...match[1].split(',').map(s => s.trim().replace('*', '')));
    }
    return Array.from(new Set(p)); // remove duplicatas caso Amuleto ganhe (Religião)
  };

  const aplicarAprimoradoNaPericia = (target: string, modId: number) => {
    setModificacoes(prev => [...prev, modId]);
    setNome(prev => {
       const match = prev.match(/\((.*?)\)/);
       if (match) {
         const inner = match[1];
         const parts = inner.split(',').map(s => s.trim());
         const idx = parts.findIndex(p => p.toLowerCase() === target.toLowerCase());
         if (idx !== -1) {
           parts[idx] = parts[idx] + '*';
           return prev.replace(/\((.*?)\)/, `(${parts.join(', ')})`);
         }
       }
       if (prev.toLowerCase().includes('amuleto sagrado')) {
          if (match) {
             return prev.replace(/\((.*?)\)/, `($1, ${target}*)`);
          } else {
             return `${prev} (${target}*)`;
          }
       }
       return prev;
    });
  };

  const temDiscreto = modificacoes.some(id => {
    const nome = modificacoesHook.modificacoes.find(m => m.Codigo_Modif === id)?.Nome_Modif.trim().toLowerCase();
    return nome === 'discreto' || nome === 'discreta';
  });
  
  const getEspacoNumber = (val: string | number) => {
    const num = Number(String(val).replace(',', '.').replace(/[^0-9.-]+/g, ''));
    return isNaN(num) ? 0 : num;
  };
  const baseEspacos = getEspacoNumber(espacos);
  const espacosFinais = temDiscreto ? Math.max(0, baseEspacos - 1) : baseEspacos;

  const catNum = categoriaRomanParaNum(categoria);
  const catFinal = catNum + modificacoes.length;
  const podeAdicionarMod = catFinal < 4;

  const handleAddMod = (id: number) => {
    if (podeAdicionarMod) {
      const mod = modificacoesHook.modificacoes.find(m => m.Codigo_Modif === id);
      if (mod && mod.Nome_Modif.trim().toLowerCase() === 'função adicional') {
        setEscolhendoFuncaoAdicional(id);
      } else if (mod && mod.Nome_Modif.trim().toLowerCase() === 'aprimorado') {
        const periciasDisponiveis = getPericiasDoItem().filter(p => {
          const match = nome.match(/\((.*?)\)/);
          if (match) {
             const parts = match[1].split(',').map(s => s.trim());
             const jaAprimorada = parts.find(part => part.toLowerCase().startsWith(p.toLowerCase()) && part.includes('*'));
             if (jaAprimorada) return false;
          }
          return true;
        });
        
        if (periciasDisponiveis.length === 1) {
          aplicarAprimoradoNaPericia(periciasDisponiveis[0], id);
        } else {
          setEscolhendoAprimorado(id);
        }
      } else {
        setModificacoes(prev => [...prev, id]);
      }
    }
  };

  const handleRemoveMod = (index: number) => {
    const id = modificacoes[index];
    const mod = modificacoesHook.modificacoes.find(m => m.Codigo_Modif === id);
    if (mod) {
      const nomeMod = mod.Nome_Modif.trim().toLowerCase();
      if (nomeMod === 'função adicional') {
        setNome(prev => {
          const match = prev.match(/\((.*?)\)/);
          if (match) {
            const inner = match[1];
            if (inner.includes(',')) {
              const parts = inner.split(',');
              parts.pop();
              return prev.replace(/\((.*?)\)/, `(${parts.join(',')})`);
            } else {
              return prev.replace(/\s*\(.*?\)/, '');
            }
          }
          return prev;
        });
      } else if (nomeMod === 'aprimorado') {
        setNome(prev => {
          const lastStarIndex = prev.lastIndexOf('*');
          if (lastStarIndex !== -1) {
            return prev.substring(0, lastStarIndex) + prev.substring(lastStarIndex + 1);
          }
          return prev;
        });
      }
    }
    setModificacoes(prev => prev.filter((_, i) => i !== index));
  };

  const getOpcoesModificacoes = () => {
    return modificacoesHook.modificacoes.filter(m => {
      const nomeMod = m.Nome_Modif.trim().toLowerCase();
      
      // Regra específica: Bateria Potente
      if (nomeMod === 'bateria potente') {
        const codigo = Number(item.Codigo_Item);
        return [5, 10, 33, 42].includes(codigo);
      }
      
      // Regra específica: Aprimorado
      if (nomeMod === 'aprimorado') {
        const isVestimenta = nome.toLowerCase().includes('vestimenta');
        const isUtensilio = nome.toLowerCase().includes('utensílio') || nome.toLowerCase().includes('utensilio');
        const isAmuleto = nome.toLowerCase().includes('amuleto sagrado');
        const temBonusPericia = /\((.*?)\)/.test(nome);
        return isVestimenta || isUtensilio || isAmuleto || temBonusPericia;
      }
      
      // Regra específica: Rodinhas de Skate
      if (nomeMod === 'rodinhas de skate para todo terreno') {
        const codigo = Number(item.Codigo_Item);
        return codigo === 12;
      }

      const cat = m.Categoria_Modif.toLowerCase().trim();
      
      // Regra específica: Soqueira
      if (nome.toLowerCase().includes('soqueira')) {
        if (cat.includes('corpo a corpo') || cat.includes('disparo')) return true;
      }

      const grupoLower = grupo.toLowerCase().trim();
      
      // Se a categoria da mod bater com o grupo do item (ex: Medicamentos, Acessórios)
      if (cat === grupoLower) return true;
      
      // Ajustes para singular/plural e acentuação comum
      if ((cat.includes('explosivo') || cat.includes('granada')) && grupoLower.includes('explosivo')) return true;
      if (cat.includes('operacional') && grupoLower.includes('operacional')) return true;
      if (cat.includes('paranormal') && grupoLower.includes('paranormal')) return true;
      if (cat.includes('acessório') && grupoLower.includes('acessório')) return true;
      if (cat.includes('medicamento') && grupoLower.includes('medicamento')) return true;
      
      return false;
    });
  };

  const editorDesc = useRef<HTMLDivElement | null>(null);

  const handleSalvar = () => {
    onSave({
      Nome_Item: nome,
      Desc_Item: editorDesc.current?.innerHTML || descricao,
      Categoria_Item: categoria,
      Espacos_Itens: getEspacoNumber(espacos),
      Dt_Item: dt,
      Grupo_Item: grupo,
    }, modificacoes);
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
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-4">
          <h2 className="text-xl font-bold tracking-wider text-zinc-100 uppercase">Editar Item</h2>
          <button onClick={onClose} className="text-zinc-500 transition hover:text-zinc-100 p-2 text-2xl border-none bg-transparent">
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col gap-4">
          
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
                value={categoriaNumParaRoman(catFinal)}
                onChange={val => setCategoria(categoriaNumParaRoman(Math.max(0, categoriaRomanParaNum(val) - modificacoes.length)))}
                className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-red-800"
              />
            </div>

            {/* Espaços */}
            <div>
              <InputLabel label="Espaços" />
              <InputOtimizado
                value={espacosFinais.toString()}
                onChange={val => {
                  const num = getEspacoNumber(val);
                  setEspacos(temDiscreto ? String(num + 1) : String(num));
                }}
                type="number"
                step="0.5"
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
          <div className="mt-2">
            <InputLabel label="Descrição" />
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
                className="w-full p-3 text-sm text-zinc-100 outline-none overflow-y-auto min-h-[100px] max-h-[250px]"
              />
            </div>
          </div>

          <ModificacoesSelector
            modificacoesAplicadas={modificacoes}
            opcoesModificacoes={getOpcoesModificacoes()}
            todasModificacoes={modificacoesHook.modificacoes}
            onAdd={handleAddMod}
            onRemove={handleRemoveMod}
            podeAdicionar={podeAdicionarMod}
            permiteDuplicadas={(codigo) => {
               const mod = modificacoesHook.modificacoes.find(m => m.Codigo_Modif === codigo);
               if (mod?.Nome_Modif.trim().toLowerCase() === 'aprimorado') {
                 const aprimorados = modificacoes.filter(mId => modificacoesHook.modificacoes.find(m => m.Codigo_Modif === mId)?.Nome_Modif.trim().toLowerCase() === 'aprimorado');
                 return aprimorados.length < getPericiasDoItem().length;
               }
               return false;
            }}
          />
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
            className="rounded bg-red-800 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition hover:bg-red-700"
          >
            Salvar Alterações
          </button>
        </div>
      </div>

      {escolhendoFuncaoAdicional !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-5" onClick={(e) => e.stopPropagation()}>
          <div className="flex w-full max-w-sm flex-col overflow-hidden rounded border border-zinc-700 bg-zinc-900 p-5 shadow-2xl">
            <h3 className="mb-4 font-bold text-sm uppercase tracking-wider text-zinc-100">Escolha a Perícia (Função Adicional)</h3>
            <select
              className="w-full bg-zinc-950 border border-zinc-700 text-sm text-zinc-100 rounded px-3 py-2 outline-none focus:border-red-700 mb-4"
              onChange={e => {
                if (e.target.value) {
                  setModificacoes(prev => [...prev, escolhendoFuncaoAdicional]);
                  const match = nome.match(/\((.*?)\)/);
                  if (match) {
                    setNome(prev => prev.replace(/\((.*?)\)/, `($1, ${e.target.value})`));
                  } else {
                    setNome(prev => `${prev} (${e.target.value})`);
                  }
                  setEscolhendoFuncaoAdicional(null);
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>Selecione a perícia...</option>
              {TODAS_PERICIAS.filter(p => {
                const match = nome.match(/\((.*?)\)/);
                if (match && match[1]) {
                  return match[1].toLowerCase().trim() !== p.toLowerCase().trim();
                }
                return true;
              }).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <button
              onClick={() => setEscolhendoFuncaoAdicional(null)}
              className="rounded bg-zinc-800 px-4 py-2 text-xs uppercase font-bold text-zinc-300 hover:bg-zinc-700 hover:text-white w-full transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {escolhendoAprimorado !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-5" onClick={(e) => e.stopPropagation()}>
          <div className="flex w-full max-w-sm flex-col overflow-hidden rounded border border-zinc-700 bg-zinc-900 p-5 shadow-2xl">
            <h3 className="mb-4 font-bold text-sm uppercase tracking-wider text-zinc-100">Qual perícia Aprimorar? (+5)</h3>
            <select
              className="w-full bg-zinc-950 border border-zinc-700 text-sm text-zinc-100 rounded px-3 py-2 outline-none focus:border-red-700 mb-4"
              onChange={e => {
                if (e.target.value) {
                  aplicarAprimoradoNaPericia(e.target.value, escolhendoAprimorado);
                  setEscolhendoAprimorado(null);
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>Selecione a perícia...</option>
              {getPericiasDoItem().filter(p => {
                  const match = nome.match(/\((.*?)\)/);
                  if (match) {
                     const parts = match[1].split(',').map(s => s.trim());
                     const jaAprimorada = parts.find(part => part.toLowerCase().startsWith(p.toLowerCase()) && part.includes('*'));
                     if (jaAprimorada) return false;
                  }
                  return true;
               }).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <button
              onClick={() => setEscolhendoAprimorado(null)}
              className="rounded bg-zinc-800 px-4 py-2 text-xs uppercase font-bold text-zinc-300 hover:bg-zinc-700 hover:text-white w-full transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
