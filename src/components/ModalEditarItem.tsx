import React, { useState, useRef } from 'react';
import type { ItemGeralInventario, ItemGeral } from '../types';
import { InputOtimizado } from './InputOtimizado';
import { ToolbarFormato } from './ToolbarFormato';
import { CustomSelect } from './CustomSelect';

import { AprimoramentosSelector } from './AprimoramentosSelector';
import { useRPG } from '../context/RPGContext';
import { categoriaRomanParaNum, categoriaNumParaRoman } from '../utils/rpgRules';

const InputLabel = ({ label }: { label: string }) => (
    <div className="flex items-center mb-1.5 min-h-[22px]">
      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
        {label}
      </label>
    </div>
  );

export function ModalEditarItem({
  itemInventario,
  onSave,
  onClose,
}: {
  itemInventario: ItemGeralInventario;
  onSave: (novosDados: Partial<ItemGeral>, modificacoes?: number[], maldicoes?: number[], maldicoesElementos?: Record<number, string>) => void;
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

  const { modificacoesHook, periciasHook, maldicoesHook } = useRPG();
  const [modificacoes, setModificacoes] = useState<number[]>(itemInventario.modificacoes || []);
  const [maldicoes, setMaldicoes] = useState<number[]>(itemInventario.maldicoes || []);
  const [maldicoesElementos, setMaldicoesElementos] = useState<Record<number, string>>(itemInventario.maldicoes_elementos || {});
  
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
    return Array.from(new Set(p));
  };

  const aplicarAprimoradoNaPericia = (target: string, modId: number) => {
    setModificacoes(prev => [...(prev || []), modId]);
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
  
  function getEspacoNumber(val: string | number) {
    const num = Number(String(val).replace(',', '.').replace(/[^0-9.-]+/g, ''));
    return isNaN(num) ? 0 : num;
  };

  
    const catNum = categoriaRomanParaNum(categoria);
    let modificador = modificacoes.length;
    let custoMaldicoes = maldicoes.length > 0 ? 2 + (maldicoes.length - 1) : 0;
    const catFinal = catNum + modificador + custoMaldicoes;
    const custoAtual = modificador + custoMaldicoes;
    const podeAdicionarMod = catFinal + 1 <= 4;
    const custoProximaMaldicao = maldicoes.length === 0 ? 2 : 1;
    const podeAdicionarMald = (catFinal + custoProximaMaldicao) <= 4;
  
    const modsFull = modificacoes.map(id => modificacoesHook.modificacoes.find(m => m.Codigo_Modif === id)).filter(Boolean);
  
    let extraEspacos = 0;
    modsFull.forEach(m => {
      const nome = m?.Nome_Modif.trim().toLowerCase() || '';
      if (nome === 'discreto' || nome === 'discreta') extraEspacos -= 1;
      else if (nome === 'blindada' || nome === 'reforçada') extraEspacos += 1;
    });
  
    const baseEspacosNum = getEspacoNumber(espacos);
    const espacosFinal = Math.max(0, baseEspacosNum + extraEspacos);


    const handleAddMald = (id: number, elementoVaria?: string) => {
    if (podeAdicionarMald) {
      setMaldicoes(prev => [...(prev || []), id]);
      if (elementoVaria) {
        setMaldicoesElementos(prev => ({ ...(prev || {}), [id]: elementoVaria }));
      }
    }
  };

  const handleRemoveMald = (index: number) => {
    setMaldicoes(prev => { if (!prev) return [];
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
    if (nome.toLowerCase().includes('soqueira')) {
      return maldicoesHook.maldicoes.filter(m => {
        const cat = m.Categoria_Mald.trim().toLowerCase();
        return cat.includes('arma') || cat.includes('corpo a corpo');
      });
    }
    return maldicoesHook.maldicoes.filter(m => m.Categoria_Mald.trim().toLowerCase().includes('vestiment') || m.Categoria_Mald.trim().toLowerCase().includes('utens') || m.Categoria_Mald.trim().toLowerCase().includes('acess'));
  };

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
        setModificacoes(prev => [...(prev || []), id]);
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
    setModificacoes(prev => (prev || []).filter((_, i) => i !== index));
  };

  const getOpcoesModificacoes = () => {
    return modificacoesHook.modificacoes.filter(m => {
      const nomeMod = m.Nome_Modif.trim().toLowerCase();
      
      if (nomeMod === 'bateria potente') {
        const codigo = Number(item.Codigo_Item);
        return [5, 10, 33, 42].includes(codigo);
      }
      
      if (nomeMod === 'aprimorado') {
        const isVestimenta = nome.toLowerCase().includes('vestimenta');
        const isUtensilio = nome.toLowerCase().includes('utensílio') || nome.toLowerCase().includes('utensilio');
        const isAmuleto = nome.toLowerCase().includes('amuleto sagrado');
        const temBonusPericia = /\((.*?)\)/.test(nome);
        return isVestimenta || isUtensilio || isAmuleto || temBonusPericia;
      }
      
      if (nomeMod === 'rodinhas de skate para todo terreno') {
        const codigo = Number(item.Codigo_Item);
        return codigo === 12;
      }

      const cat = m.Categoria_Modif.toLowerCase().trim();
      
      if (nome.toLowerCase().includes('soqueira')) {
        if (cat.includes('corpo a corpo') || cat.includes('disparo')) return true;
      }

      const grupoLower = grupo.toLowerCase().trim();
      
      if (cat === grupoLower) return true;
      
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
    if (editorDesc.current) {
      setDescricao(editorDesc.current.innerHTML);
    }
    
    onSave({
      Nome_Item: nome,
      Desc_Item: editorDesc.current?.innerHTML || descricao,
      Categoria_Item: categoria,
      Espacos_Itens: getEspacoNumber(espacos),
      Dt_Item: dt,
      Grupo_Item: grupo,
    }, modificacoes, maldicoes, maldicoesElementos);
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
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

        <div className="flex flex-shrink-0 items-center justify-between border-b border-white/5 bg-zinc-900/40 px-6 py-5">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="font-display text-xl uppercase tracking-wider text-zinc-100 drop-shadow-md">
                Editar Item
              </h2>
              <p className="text-[11px] text-zinc-500 mt-1 uppercase tracking-widest font-semibold">
                Configure os atributos e detalhes do item
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
          
          <section>
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-green-400/90">Informações Principais</h3>
              <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="col-span-1 md:col-span-2">
                <InputLabel label="Nome do Item" />
                <InputOtimizado
                  value={nome}
                  onChange={setNome}
                  className={inputClass}
                />
              </div>

              <div>
                <InputLabel label="Categoria" />
                  <CustomSelect
                    value={categoriaNumParaRoman(catFinal)}
                    onChange={(val) => {
                      const finalDesejado = categoriaRomanParaNum(val);
                      setCategoria(categoriaNumParaRoman(Math.max(0, finalDesejado - custoAtual)));
                    }}
                    options={[
                      { value: '0', label: '0' },
                      { value: 'I', label: 'I' },
                      { value: 'II', label: 'II' },
                      { value: 'III', label: 'III' },
                      { value: 'IV', label: 'IV' }
                    ]}
                  />
              </div>

              <div>
                <InputLabel label="Espaços" />
                  <InputOtimizado
                    value={String(espacosFinal)}
                    onChange={val => {
                      const num = getEspacoNumber(val);
                      setEspacos(String(num - extraEspacos));
                    }}
                  type="number"
                  step="0.5"
                  className={inputClass}
                />
              </div>
              
              <div>
                <InputLabel label="DT" />
                <InputOtimizado
                  value={dt}
                  onChange={setDt}
                  placeholder="Ex: Fortitude, 15 ou 20"
                  className={inputClass}
                />
              </div>

              <div>
                <InputLabel label="Grupo" />
                <InputOtimizado
                  value={grupo}
                  onChange={setGrupo}
                  placeholder="Ex: Acessórios"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

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

          <section>
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-green-400/90">Poderes e Aprimoramentos</h3>
              <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent"></div>
            </div>
            
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/20 p-5">
              <AprimoramentosSelector 
                modificacoesAplicadas={modificacoes}
                opcoesModificacoes={getOpcoesModificacoes ? getOpcoesModificacoes() : []}
                todasModificacoes={modificacoesHook ? modificacoesHook.modificacoes : []}
                onAddMod={handleAddMod ? handleAddMod : () => {}}
                onRemoveMod={handleRemoveMod ? handleRemoveMod : () => {}}
                podeAdicionarMod={typeof podeAdicionarMod !== 'undefined' ? podeAdicionarMod : true}
                
                maldicoesAplicadas={maldicoes}
                opcoesMaldicoes={getOpcoesMaldicoes ? getOpcoesMaldicoes() : []}
                todasMaldicoes={maldicoesHook ? maldicoesHook.maldicoes : []}
                maldicoesElementos={typeof maldicoesElementos !== 'undefined' ? maldicoesElementos : {}}
                onAddMald={handleAddMald ? handleAddMald : () => {}}
                onRemoveMald={handleRemoveMald ? handleRemoveMald : () => {}}
                podeAdicionarMald={typeof podeAdicionarMald !== 'undefined' ? podeAdicionarMald : true}
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

      {escolhendoFuncaoAdicional !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 backdrop-blur-sm bg-black/60 transition-opacity" onClick={() => setEscolhendoFuncaoAdicional(null)} />
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-800 bg-[#0a0a0a] shadow-[0_0_40px_rgba(0,0,0,0.8)] ring-1 ring-white/5 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
            
            <div className="flex flex-shrink-0 items-center justify-between border-b border-white/5 bg-zinc-900/40 px-6 py-4">
              <h3 className="font-display text-base uppercase tracking-wider text-zinc-100 drop-shadow-md">
                Função Adicional
              </h3>
              <button
                onClick={() => setEscolhendoFuncaoAdicional(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Escolha a Perícia</p>
              <div className="w-full">
                <CustomSelect
                  value=""
                  onChange={val => {
                    if (val) {
                      setModificacoes(prev => [...(prev || []), escolhendoFuncaoAdicional]);
                      const match = nome.match(/\((.*?)\)/);
                      if (match) {
                        setNome(prev => prev.replace(/\((.*?)\)/, `($1, ${val})`));
                      } else {
                        setNome(prev => `${prev} (${val})`);
                      }
                      setEscolhendoFuncaoAdicional(null);
                    }
                  }}
                  options={[
                    { value: "", label: "Selecione a perícia..." },
                    ...TODAS_PERICIAS.filter(p => {
                      const match = nome.match(/\((.*?)\)/);
                      if (match && match[1]) {
                        return match[1].toLowerCase().trim() !== p.toLowerCase().trim();
                      }
                      return true;
                    }).map(p => ({ value: p, label: p }))
                  ]}
                  wrapperClassName="w-full"
                  className="w-full rounded bg-zinc-900/50 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none transition-all focus:border-green-500 focus:bg-zinc-900 focus:ring-1 focus:ring-green-500/50 hover:border-zinc-700"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-white/5 bg-zinc-900/40 px-6 py-4">
              <button
                onClick={() => setEscolhendoFuncaoAdicional(null)}
                className="rounded px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {escolhendoAprimorado !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-5" onClick={(e) => e.stopPropagation()}>
          <div className="flex w-full max-w-sm flex-col overflow-hidden rounded border border-zinc-700 bg-zinc-900 p-5 shadow-2xl">
            <h3 className="mb-4 font-bold text-sm uppercase tracking-wider text-zinc-100">Qual perícia Aprimorar? (+5)</h3>
            <div className="w-full mb-4">
              <CustomSelect
                value=""
                onChange={val => {
                  if (val) {
                    aplicarAprimoradoNaPericia(val, escolhendoAprimorado);
                    setEscolhendoAprimorado(null);
                  }
                }}
                options={[
                  { value: "", label: "Selecione a perícia..." },
                  ...getPericiasDoItem().filter(p => {
                      const match = nome.match(/\((.*?)\)/);
                      if (match) {
                         const parts = match[1].split(',').map(s => s.trim());
                         const jaAprimorada = parts.find(part => part.toLowerCase().startsWith(p.toLowerCase()) && part.includes('*'));
                         if (jaAprimorada) return false;
                      }
                      return true;
                   }).map(p => ({ value: p, label: p }))
                ]}
                wrapperClassName="w-full"
                className={selectClass}
              />
            </div>
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
