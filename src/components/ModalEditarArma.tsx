import React, { useState, useRef } from 'react';
import type { ArmaInventario, Arma } from '../types';
import { InputOtimizado } from './InputOtimizado';
import { ToolbarFormato } from './ToolbarFormato';
import { CustomSelect } from './CustomSelect';

import { AprimoramentosSelector } from './AprimoramentosSelector';
import { useRPG } from '../context/RPGContext';
import { categoriaRomanParaNum, categoriaNumParaRoman } from '../utils/rpgRules';

export function ModalEditarArma({
  armaInventario,
  onSave,
  onClose,
}: {
  armaInventario: ArmaInventario;
  onSave: (novosDados: Partial<Arma>, modificacoes?: number[], maldições?: number[], maldiçõesElementos?: Record<number, string>) => void;
  onClose: () => void;
}) {
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  if (!armaInventario || !armaInventario.arma) {
    return null;
  }

  const { arma } = armaInventario;

  const [nome, setNome] = useState(arma.Nome_Item || '');
  const [descricao, setDescricao] = useState(arma.Descricao_Item || '');
  const [dano, setDano] = useState(arma.Dano_Arma || '');
  const [critico, setCritico] = useState(arma.Critico_Arma?.toString() || '');
  const [multiplicador, setMultiplicador] = useState(arma.Multiplicador_Arma?.toString() || '');
  const [alcance, setAlcance] = useState(arma.Alcance_Item || '');
  const [danoSecundario, setDanoSecundario] = useState(arma.Dano_Secundario || '');
  const [categoria, setCategoria] = useState(arma.Categoria_Item || '');
  const [espacos, setEspacos] = useState(arma['Espaços_Item']?.toString() || '');
  const [dt, setDt] = useState(arma.dt_item || '');

  const [proficiencia, setProficiencia] = useState(arma.Proficiencia || 'Armas Simples');
  const [tipoArma, setTipoArma] = useState(arma.Tipo_Arma || 'Corpo a Corpo');
  const [empunhadura, setEmpunhadura] = useState(arma.Empunhadura_Arma || 'Uma Mão');
  const [tipoDano, setTipoDano] = useState(arma.Tipo_Dano_Arma || 'Corte');

  const { modificacoesHook, maldiçõesHook } = useRPG();
  const [modificacoes, setModificacoes] = useState<number[]>(armaInventario.modificacoes || []);
  const [maldições, setMaldicoes] = useState<number[]>(armaInventario.maldições || []);
  const [maldiçõesElementos, setMaldicoesElementos] = useState<Record<number, string>>(armaInventario.maldições_elementos || {});
  

  const editorDesc = useRef<HTMLDivElement | null>(null);

  const temDiscreto = modificacoes.some(id => modificacoesHook.modificacoes.find(m => m.Codigo_Modif === id)?.Nome_Modif.trim().toLowerCase() === 'discreto' || modificacoesHook.modificacoes.find(m => m.Codigo_Modif === id)?.Nome_Modif.trim().toLowerCase() === 'discreta');
  
  const temMira = modificacoes.some(id => {
    const nome = modificacoesHook.modificacoes.find(m => m.Codigo_Modif === id)?.Nome_Modif.trim().toLowerCase();
    return nome === 'mira laser' || nome === 'perigosa';
  });

  const temCalibreGrosso = modificacoes.some(id => {
    const nome = modificacoesHook.modificacoes.find(m => m.Codigo_Modif === id)?.Nome_Modif.trim().toLowerCase();
    return nome === 'calibre grosso';
  });

  const temMiraTelescopica = modificacoes.some(id => {
    const nome = modificacoesHook.modificacoes.find(m => m.Codigo_Modif === id)?.Nome_Modif.trim().toLowerCase();
    return nome === 'mira telescópica';
  });

  const getEspacoNumber = (val: string | number) => {
    const num = Number(String(val).replace(',', '.').replace(/[^0-9.-]+/g, ''));
    return isNaN(num) ? 0 : num;
  };
  const baseEspacos = getEspacoNumber(espacos);
  const espacosFinais = temDiscreto ? Math.max(0, baseEspacos - 1) : baseEspacos;

  const criticoFinal = temMira ? Math.max(1, Number(critico || 20) - 2) : (critico || 20);
  const danoFinal = temCalibreGrosso ? dano.replace(/(\d+)d(\d+)/i, (match, p1, p2) => `${Number(p1) + 1}d${p2}`) : dano;
  
  const ordAlcance = ['', 'Curto', 'Médio', 'Longo', 'Extremo', 'Ilimitado'];
  let alcanceFinal = alcance;
  if (temMiraTelescopica) {
    const idx = ordAlcance.indexOf(alcance);
    if (idx !== -1 && idx < ordAlcance.length - 1) {
      alcanceFinal = ordAlcance[idx + 1];
    }
  }

  const catNum = categoriaRomanParaNum(categoria);
    let modificador = modificacoes.length;
  
    if (arma.Codigo_Arma === 71 && modificador > 0) {
      modificador -= 1;
    }
  
    const temApocaliptica = modificacoes.some(id => {
      const nome = modificacoesHook.modificacoes.find(m => m.Codigo_Modif === id)?.Nome_Modif.trim().toLowerCase();
      return nome === 'apocalíptica';
    });
    if (temApocaliptica) {
      modificador -= 1;
    }

    // Calcula o custo das maldições
    let custoMaldicoes = 0;
    if (maldições.length > 0) {
      custoMaldicoes = 2 + (maldições.length - 1);
    }

    const catFinal = catNum + modificador + custoMaldicoes;
    const podeAdicionarMod = catFinal < 4;
    const custoProximaMaldicao = maldições.length === 0 ? 2 : 1;
    const podeAdicionarMald = (catFinal + custoProximaMaldicao) <= 4;

  
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
      return maldiçõesHook.maldições.filter(m => m.Categoria_Mald.trim().toLowerCase() === 'armas');
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
      // Impede Ferrolho Automático se a arma já é automática
      if (m.Nome_Modif === 'Ferrolho Automático' && arma['Automatica?']) return false;
      
      const cat = m.Categoria_Modif.toLowerCase();
      const tipo = tipoArma.toLowerCase();

      const isFogo = tipo.includes('fogo');
      const isDisparo = tipo.includes('disparo');
      const isCorpo = tipo.includes('corpo');
      const isArremesso = tipo.includes('arremesso');
      const isExplosivo = tipo.includes('explosivo');

      if (cat.includes('armas de fogo / bestas e balestras') && (isFogo || isDisparo)) return true;
      if (cat.includes('arma de fogo') && isFogo) return true;
      if (cat.includes('corpo a corpo') && (isCorpo || isArremesso)) return true;
      if (cat.includes('arremesso') && isArremesso) return true;
      if ((cat.includes('explosivo') || cat.includes('granada')) && isExplosivo) return true;
      if (cat === 'armas') return true;
      return false;
    });
  };

  const handleSalvar = () => {
    onSave({
      Nome_Item: nome,
      Descricao_Item: editorDesc.current?.innerHTML || descricao,
      Dano_Arma: dano,
      Critico_Arma: Number(critico) || 20,
      Multiplicador_Arma: Number(multiplicador) || 2,
      Alcance_Item: alcance,
      Dano_Secundario: danoSecundario,
      Categoria_Item: categoria,
      'Espaços_Item': getEspacoNumber(espacos),
      dt_item: dt,
      Proficiencia: proficiencia,
      Tipo_Arma: tipoArma,
      Empunhadura_Arma: empunhadura,
      Tipo_Dano_Arma: tipoDano,
    }, modificacoes, maldições, maldiçõesElementos);
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
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-5 py-4">
          <h2 className="font-display text-lg uppercase tracking-wide text-zinc-100">
            Editar Arma
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-green-500 transition"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col gap-4">
          <div className="rounded border border-zinc-800 bg-zinc-950 p-4">
            <h3 className="font-bold text-green-500 mb-2 border-b border-zinc-800 pb-2">Informações da Arma</h3>
            <div className="flex flex-col gap-2 mt-4">
              
              <InputLabel label="Nome da Arma" />
              <InputOtimizado
                value={nome}
                onChange={setNome}
                className="w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-100 outline-none focus:border-green-700 transition"
              />
            </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                <div >
                  <InputLabel label="Proficiência" />
                  <CustomSelect
                    value={proficiencia}
                    onChange={val => setProficiencia(val)}
                    options={[
                      { value: "Armas Simples", label: "Armas Simples" },
                      { value: "Armas Táticas", label: "Armas Táticas" },
                      { value: "Armas Pesadas", label: "Armas Pesadas" }
                    ]}
                    wrapperClassName="w-full"
                  />
                </div>

                <div >
                  <InputLabel label="Tipo da Arma" />
                  <CustomSelect
                    value={tipoArma}
                    onChange={val => setTipoArma(val)}
                    options={[
                      { value: "Corpo a Corpo", label: "Corpo a Corpo" },
                      { value: "Arma de Disparo", label: "Arma de Disparo" },
                      { value: "Arma de Fogo", label: "Arma de Fogo" },
                      { value: "Arma de Arremesso", label: "Arma de Arremesso" },
                      { value: "Explosivos", label: "Explosivos" }
                    ]}
                    wrapperClassName="w-full"
                  />
                </div>

                <div >
                  <InputLabel label="Empunhadura" />
                  <CustomSelect
                    value={empunhadura}
                    onChange={val => setEmpunhadura(val)}
                    options={[
                      { value: "Leve", label: "Leve" },
                      { value: "Uma Mão", label: "Uma Mão" },
                      { value: "Duas Mãos", label: "Duas Mãos" },
                      { value: "Uma Mão/Duas Mãos", label: "Uma Mão/Duas Mãos" }
                    ]}
                    wrapperClassName="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div >
                  <InputLabel label="Tipo de Dano" />
                  <CustomSelect
                    value={tipoDano}
                    onChange={val => setTipoDano(val)}
                    options={[
                      { value: "Corte", label: "Corte" },
                      { value: "Perfuração", label: "Perfuração" },
                      { value: "Impacto", label: "Impacto" },
                      { value: "Balístico", label: "Balístico" },
                      { value: "Fogo", label: "Fogo" },
                      { value: "Frio", label: "Frio" },
                      { value: "Químico", label: "Químico" },
                      { value: "Eletricidade", label: "Eletricidade" },
                      { value: "Morte", label: "Morte" },
                      { value: "Sangue", label: "Sangue" },
                      { value: "Energia", label: "Energia" },
                      { value: "Conhecimento", label: "Conhecimento" },
                      { value: "Medo", label: "Medo" }
                    ]}
                    wrapperClassName="w-full"
                  />
                </div>

                <div>
                  <InputLabel label="Dano" />
                  <InputOtimizado
                    value={danoFinal}
                    onChange={val => {
                      if (temCalibreGrosso) {
                        const reversao = val.replace(/(\d+)d(\d+)/i, (match, p1, p2) => `${Math.max(1, Number(p1) - 1)}d${p2}`);
                        setDano(reversao);
                      } else {
                        setDano(val);
                      }
                    }}
                    placeholder="Ex: 1d8"
                    className="w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-100 outline-none focus:border-green-700 transition"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <InputLabel label="Crítico (Margem)" />
                    <InputOtimizado
                      value={criticoFinal.toString()}
                      onChange={val => {
                        const num = Number(val);
                        if (!isNaN(num)) {
                          setCritico(temMira ? (num + 2).toString() : val);
                        } else {
                          setCritico(val);
                        }
                      }}
                      placeholder="Ex: 19"
                      className="w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-100 outline-none focus:border-green-700 transition"
                    />
                  </div>
                  <div className="flex-1">
                    <InputLabel label="Multiplicador" />
                    <InputOtimizado
                      value={multiplicador}
                      onChange={setMultiplicador}
                      placeholder="Ex: 2"
                      className="w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-100 outline-none focus:border-green-700 transition"
                    />
                  </div>
                </div>

                <div >
                  <InputLabel label="Alcance" />
                  <CustomSelect
                    value={alcanceFinal}
                    onChange={(val) => {
                      if (temMiraTelescopica) {
                        const idx = ordAlcance.indexOf(val);
                        if (idx > 0) {
                          setAlcance(ordAlcance[idx - 1]);
                        } else {
                          setAlcance(val);
                        }
                      } else {
                        setAlcance(val);
                      }
                    }}
                    options={[
                      { value: "", label: "Nenhum" },
                      { value: "Curto", label: "Curto" },
                      { value: "Médio", label: "Médio" },
                      { value: "Longo", label: "Longo" },
                      { value: "Extremo", label: "Extremo" },
                      { value: "Ilimitado", label: "Ilimitado" }
                    ]}
                    wrapperClassName="w-full"
                  />
                </div>
                
                <div>
                  <InputLabel label="Dano Secundário" />
                  <InputOtimizado
                    value={danoSecundario}
                    onChange={setDanoSecundario}
                    placeholder="Ex: +2d6 (Explosivo)"
                    className="w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-100 outline-none focus:border-green-700 transition"
                  />
                </div>
                
                <div>
                  <InputLabel label="DT" />
                  <InputOtimizado
                    value={dt}
                    onChange={setDt}
                    placeholder="Ex: Fortitude, 15 ou 20"
                    className="w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-100 outline-none focus:border-green-700 transition"
                  />
                </div>

                <div>
                  <InputLabel label="Categoria" />
                  <InputOtimizado
                    value={categoriaNumParaRoman(catFinal)}
                    onChange={(val) => {
                        const finalDesejado = categoriaRomanParaNum(val);
                        let modCount = modificacoes.length;
                        if (temApocaliptica) modCount -= 1;
                        setCategoria(categoriaNumParaRoman(Math.max(0, finalDesejado - modCount - custoMaldicoes)));
                      }}
                    placeholder="Ex: I, II, 0"
                    className="w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-100 outline-none focus:border-green-700 transition"
                  />
                </div>

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
                    className="w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-100 outline-none focus:border-green-700 transition"
                  />
                </div>
            </div>
          </div>

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
              
              maldiçõesAplicadas={maldições}
              opcoesMaldicoes={getOpcoesMaldicoes()}
              todasMaldicoes={maldiçõesHook.maldições}
              maldiçõesElementos={maldiçõesElementos}
              onAddMald={handleAddMald}
              onRemoveMald={handleRemoveMald}
              podeAdicionarMald={podeAdicionarMald}
            />
          </div>

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
            className="rounded bg-green-700 px-5 py-2 text-xs font-bold uppercase tracking-wider text-zinc-100 shadow hover:bg-green-600"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
