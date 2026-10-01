import React, { useState, useRef, useEffect } from 'react';
import type { MunicaoInventario, Municao } from '../types';
import { InputOtimizado } from './InputOtimizado';
import { CustomSelect } from './CustomSelect';
import { ToolbarFormato } from './ToolbarFormato';
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

export function ModalEditarMunicao({
  itemInventario,
  onSave,
  onClose,
}: {
  itemInventario: MunicaoInventario;
  onSave: (novosDados: Partial<Municao>, modificacoes?: number[], maldicoes?: number[], maldicoesElementos?: Record<number, string>) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!itemInventario || !itemInventario.municao) {
    return null;
  }

  const { municao } = itemInventario;

  const [nome, setNome] = useState(municao.Nome_Item || '');
  const [descricao, setDescricao] = useState(municao.Descricao_Item || '');
  const [categoria, setCategoria] = useState(municao.Categoria_Item || 'I');
  const [espacos, setEspacos] = useState(municao['Espaços_Item']?.toString() || '1');

  const { modificacoesHook, maldicoesHook } = useRPG();

  const initialMods = Array.isArray(itemInventario.modificacoes) ? itemInventario.modificacoes : [];
  const initialMalds = Array.isArray(itemInventario.maldicoes) ? itemInventario.maldicoes : [];
  
  const [modificacoes, setModificacoes] = useState<number[]>(initialMods);
  const [maldicoes, setMaldicoes] = useState<number[]>(initialMalds);
  const [maldicoesElementos, setMaldicoesElementos] = useState<Record<number, string>>({});

  const temDiscreto = modificacoes.some(id => {
    const nome = modificacoesHook.modificacoes.find(m => m.Codigo_Modif === id)?.Nome_Modif.trim().toLowerCase();
    return nome === 'discreto' || nome === 'discreta';
  });
  
  function getEspacoNumber(val: string | number) {
    const num = Number(String(val).replace(',', '.').replace(/[^0-9.-]+/g, ''));
    return isNaN(num) ? 0 : num;
  };
  const baseEspacos = getEspacoNumber(espacos);
  const espacosFinais = temDiscreto ? Math.max(0, baseEspacos - 1) : baseEspacos;

  
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
    return maldicoesHook.maldicoes.filter(m => {
      const cat = m.Categoria_Mald.trim().toLowerCase();
      return cat.includes('munição') || cat.includes('municão');
    });
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
      return cat.includes('muni');
    });
  };

  const editorDesc = useRef<HTMLDivElement | null>(null);

  const handleSalvar = () => {
    if (editorDesc.current) {
      setDescricao(editorDesc.current.innerHTML);
    }
    
    onSave({
      Nome_Item: nome,
      Descricao_Item: editorDesc.current?.innerHTML || descricao,
      Categoria_Item: categoria,
      'Espaços_Item': getEspacoNumber(espacos),
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
        {/* Glow de borda no topo do Modal */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

        <div className="flex flex-shrink-0 items-center justify-between border-b border-white/5 bg-zinc-900/40 px-6 py-5">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="font-display text-xl uppercase tracking-wider text-zinc-100 drop-shadow-md">
                {itemInventario.id === 'NEW' ? 'Criar Munição' : 'Editar Munição'}
              </h2>
              <p className="text-[11px] text-zinc-500 mt-1 uppercase tracking-widest font-semibold">
                Configure os atributos e poderes
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
                <InputLabel label="Nome da Munição" />
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

          {/* SECTION: Aprimoramentos */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-green-400/90">Aprimoramentos da Munição</h3>
              <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent"></div>
            </div>
            
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/20 p-5">
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
                esconderMaldicoes={true}
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
