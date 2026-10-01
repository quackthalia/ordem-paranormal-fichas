import React, { useState, useRef } from 'react';
import type { ArmaInventario, Arma } from '../types';
import { InputOtimizado } from './InputOtimizado';
import { ToolbarFormato } from './ToolbarFormato';
import { CustomSelect } from './CustomSelect';

import { AprimoramentosSelector } from './AprimoramentosSelector';
import { useRPG } from '../context/RPGContext';
import { categoriaRomanParaNum, categoriaNumParaRoman, calcularAtributosArmaFinais } from '../utils/rpgRules';

const InputLabel = ({ label }: { label: string }) => (
    <div className="flex items-center mb-1.5 min-h-[22px]">
      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
        {label}
      </label>
    </div>
  );

export function ModalEditarArma({
  armaInventario,
  onSave,
  onClose,
}: {
  armaInventario: ArmaInventario;
  onSave: (novosDados: Partial<Arma>, modificacoes?: number[], maldicoes?: number[], maldicoesElementos?: Record<number, string>) => void;
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
  const [danoSecundario, setDanoSecundario] = useState(arma.Dano_Secundario || '');
  const [critico, setCritico] = useState(arma.Critico_Arma?.toString() || '');
  const [multiplicador, setMultiplicador] = useState(arma.Multiplicador_Arma?.toString() || '');
  const [alcance, setAlcance] = useState(arma.Alcance_Item || '');

  const [categoria, setCategoria] = useState(arma.Categoria_Item || '');
  const [espacos, setEspacos] = useState(arma['Espaços_Item']?.toString() || '');
  const [dt, setDt] = useState(arma.dt_item || '');

  const [proficiencia, setProficiencia] = useState(arma.Proficiencia || 'Armas Simples');
  const [tipoArma, setTipoArma] = useState(arma.Tipo_Arma || 'Corpo a Corpo');
  const [empunhadura, setEmpunhadura] = useState(arma.Empunhadura_Arma || 'Uma Mão');
  const parsedTipo = (arma.Tipo_Dano_Arma || 'Corte').split('/');
  const [tipoDano, setTipoDano] = useState(parsedTipo[0].trim());
  const [tipoDanoSec, setTipoDanoSec] = useState(parsedTipo.length > 1 ? parsedTipo[1].trim() : 'Nenhum');
  const [improvisada, setImprovisada] = useState(!!arma['Improvisada?']);

  const { modificacoesHook, maldicoesHook } = useRPG();

  const initialMods = Array.isArray(armaInventario.modificacoes) ? armaInventario.modificacoes : [];
  const initialMalds = Array.isArray(armaInventario.maldicoes) ? armaInventario.maldicoes : [];
  
  const [modificacoes, setModificacoes] = useState<number[]>(initialMods);
  const [maldicoes, setMaldicoes] = useState<number[]>(initialMalds);
  const [maldicoesElementos, setMaldicoesElementos] = useState<Record<number, string>>(armaInventario.maldicoes_elementos || {});

  const modsAtivas = modificacoes
    .map(id => modificacoesHook.modificacoes.find((m: any) => m.Codigo_Modif === id))
    .filter(Boolean);
  const maldsAtivas = maldicoes
    .map(id => maldicoesHook.maldicoes.find((m: any) => m.Codigo_Mald === id))
    .filter(Boolean);

  const temApocaliptica = modsAtivas.some((m: any) => m.Nome_Modif.trim().toLowerCase() === 'apocalíptica' || m.Nome_Modif.trim().toLowerCase() === 'apocaliptica');

  const statsFinais = calcularAtributosArmaFinais(
    dano,
    Number(critico) || 20,
    Number(multiplicador) || 2,
    alcance,
    modsAtivas,
    maldsAtivas
  );

  const renderLabel = (baseLabel: string, baseValue: any, finalValue: any, isMultiplier = false) => {
    let isModified = String(baseValue).trim().toLowerCase() !== String(finalValue).trim().toLowerCase();
      if ((baseValue === '-' || !baseValue || String(baseValue).trim().toLowerCase() === 'corpo a corpo') && String(finalValue).trim().toLowerCase() === 'corpo a corpo') {
        isModified = false;
      }
    const displayFinal = isMultiplier ? `x${finalValue}` : finalValue;
    return (
      <div className="flex justify-between items-center mb-1.5 min-h-[22px]">
        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
          {baseLabel}
        </label>
        {isModified && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-green-400 bg-green-950/30 px-1.5 py-0.5 rounded border border-green-900/50">
            Final: {displayFinal}
          </span>
        )}
      </div>
    );
  };


  const editorDesc = useRef<HTMLDivElement | null>(null);

  function getEspacoNumber(str: string | number) { const val = Number(String(str).replace(',', '.').replace(/[^0-9.-]+/g, ''));
    return isNaN(val) ? 0 : val;
  };

  const handleSalvar = () => {
    if (editorDesc.current) {
      setDescricao(editorDesc.current.innerHTML);
    }

    onSave({
      Nome_Item: nome,
      Descricao_Item: editorDesc.current?.innerHTML || descricao,
      Dano_Arma: dano,
      Dano_Secundario: danoSecundario,
      Critico_Arma: Number(critico) || 20,
      Multiplicador_Arma: Number(multiplicador) || 2,
      Alcance_Item: alcance,

      Categoria_Item: categoria,
      'Espaços_Item': getEspacoNumber(espacos),
      dt_item: dt,
      Proficiencia: proficiencia,
      Tipo_Arma: tipoArma,
      Empunhadura_Arma: empunhadura,
      Tipo_Dano_Arma: (tipoDanoSec !== 'Nenhum' && danoSecundario.trim() !== '') ? `${tipoDano}/${tipoDanoSec}` : tipoDano,
        'Improvisada?': improvisada
    }, modificacoes, maldicoes, maldicoesElementos);
    onClose();
  };

  const getOpcoesModificacoes = () => {
    return modificacoesHook.modificacoes.filter(m => {
      if (m.Nome_Modif === 'Ferrolho Automático' && arma['Automatica?']) return false;
      
      const cat = m.Categoria_Modif?.toLowerCase() || '';
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

  const getOpcoesMaldicoes = () => {
    return maldicoesHook.maldicoes.filter(m => m.Categoria_Mald.trim().toLowerCase().includes('armas'));
  };

  
    const catNum = categoriaRomanParaNum(categoria);
    let modificador = modificacoes.length;
    if (temApocaliptica) modificador -= 2;
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

  const handleAddMod = (id: number) => {
    if (podeAdicionarMod) {
      setModificacoes(prev => [...prev, id]);
    }
  };

  const handleRemoveMod = (index: number) => {
    setModificacoes(prev => prev.filter((_, i) => i !== index));
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
                {armaInventario.id === 'NEW' ? 'Criar Arma' : 'Editar Arma'}
              </h2>
              <p className="text-[11px] text-zinc-500 mt-1 uppercase tracking-widest font-semibold">
                Configure os atributos, dano e modificações
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
          
          {/* SECTION: Atributos Básicos */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-green-400/90">Atributos Básicos</h3>
              <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="col-span-1 md:col-span-2">
                <InputLabel label="Nome da Arma" />
                <InputOtimizado value={nome} onChange={setNome} className={inputClass} />
              </div>

              <div>
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
                  className={selectClass}
                />
              </div>

              <div>
                <InputLabel label="Tipo da Arma" />
                <CustomSelect
                  value={tipoArma}
                  onChange={val => setTipoArma(val)}
                  options={[
                    { value: "Corpo a Corpo", label: "Corpo a Corpo" },
                    { value: "Arma de Disparo", label: "Arma de Disparo" },
                    { value: "Arma de Fogo", label: "Arma de Fogo" },
                    { value: "Arma de Arremesso", label: "Arma de Arremesso" }
                    ]}
                  wrapperClassName="w-full"
                  className={selectClass}
                />
              </div>

              <div>
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
                  className={selectClass}
                />
              </div>

              <div>
                <div className="flex gap-2">
                    <div className="flex-1">
                      <InputLabel label="Tipo" />
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
                      />
                    </div>
                    {danoSecundario.trim() !== '' && (
                      <div className="flex-1">
                        <InputLabel label="Tipo Secundário" />
                        <CustomSelect
                          value={tipoDanoSec}
                        onChange={val => setTipoDanoSec(val)}
                        options={[ { value: 'Nenhum', label: 'Nenhum' }, ...[
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
                      ] ]}
                        />
                      </div>
                    )}
                  </div>
              </div>

              
                <div>
                  {renderLabel('Dano', dano, statsFinais.dano)}
                  <InputOtimizado value={dano} onChange={setDano} className={inputClass} placeholder="Ex: 1d6" />
                </div>
                
                {danoSecundario.trim() !== '' && (
                  <div>
                    {renderLabel('Dano Secundário', danoSecundario, statsFinais.danoSecundario || danoSecundario)}
                    <InputOtimizado value={danoSecundario} onChange={(val) => {
                      setDanoSecundario(val);
                      if (val.trim() === '') setTipoDanoSec('Nenhum');
                    }} className={inputClass} placeholder="Ex: 1d12" />
                  </div>
                )}
                {danoSecundario.trim() === '' && (
                  <div>
                    <InputLabel label="Dano Secundário" />
                    <InputOtimizado value={danoSecundario} onChange={(val) => {
                      setDanoSecundario(val);
                      if (val.trim() !== '' && tipoDanoSec === 'Nenhum') {
                        setTipoDanoSec(tipoDano);
                      }
                    }} className={inputClass} placeholder="Ex: 1d12" />
                  </div>
                )}

                <div>
                  {renderLabel('Crítico', critico || '20', statsFinais.critico)}
                  <InputOtimizado value={critico} onChange={setCritico} type="number" className={inputClass} />
                </div>

                <div>
                  {renderLabel('Multiplicador', multiplicador || '2', statsFinais.multiplicador, true)}
                  <InputOtimizado value={multiplicador} onChange={setMultiplicador} type="number" className={inputClass} />
                </div>

                <div>
                  {renderLabel('Alcance', alcance || '-', statsFinais.alcance)}
                  <CustomSelect
                    value={alcance}
                    onChange={val => setAlcance(val)}
                    options={[
                      { value: "Corpo a Corpo", label: "Corpo a Corpo" },
                      { value: "Curto", label: "Curto" },
                      { value: "Médio", label: "Médio" },
                      { value: "Longo", label: "Longo" },
                      { value: "Extremo", label: "Extremo" }
                    ]}
                    wrapperClassName="w-full"
                    className={selectClass}
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
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-green-400/90">Aprimoramentos</h3>
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
