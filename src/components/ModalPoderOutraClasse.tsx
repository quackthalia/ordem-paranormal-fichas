import { CustomSelect } from './CustomSelect';
import { Collapse } from './Collapse';
import React, { useEffect, useState, useMemo } from 'react';
import { useRPG } from '../context/RPGContext';
import { InputOtimizado } from './InputOtimizado';
import type { Poder } from '../types';
import { verificarPreRequisitos, formatarTextoPreRequisitos } from '../utils/preRequisitos';
import type { ContextoPreRequisitos } from '../utils/preRequisitos';
import { ModalEscolherRitualAprendido } from './ModalEscolherRitualAprendido';

function formatarDescricao(texto: string): string {
  if (!texto) return '';
  let resultado = texto;
  if (!resultado.includes('<') && !resultado.includes('&')) {
    resultado = resultado
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    resultado = resultado.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    resultado = resultado.replace(/_(.*?)_/g, '<em>$1</em>');
  }
  resultado = resultado.replace(/\n/g, '<br />');
  return resultado;
}

export const ModalPoderOutraClasse: React.FC<{ isOpen: boolean; onClose: () => void; categoriaPermitida?: 'combate' | 'utilidade' | 'gerais' }> = ({ isOpen, onClose, categoriaPermitida }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = 'unset'; };
    } else {
      setFiltro('');
      setExpandidos([]);
      setEscolhendoElementoId(null);
      setEscolhendoRitualId(null);
      setEscolhendoPericiaId(null);
    }
  }, [isOpen]);

  const { classe, nex, nivel, regras, atributos, periciasHook, poderesHook, rituaisHook } = useRPG();
  const [poderes, setPoderes] = useState<Poder[]>([]);
  const [filtro, setFiltro] = useState('');
  const [expandidos, setExpandidos] = useState<number[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<string>('');

  const [escolhendoElementoId, setEscolhendoElementoId] = useState<number | null>(null);
  const [escolhendoRitualId, setEscolhendoRitualId] = useState<number | null>(null);
  const [escolhendoPericiaId, setEscolhendoPericiaId] = useState<number | null>(null);



  const contextoPrereq: ContextoPreRequisitos = useMemo(() => {
    const poderesArray: { nome: string; elemento?: string; codigoRegra?: number | null; periciaEscolhidaNome?: string }[] = Object.values(poderesHook.poderesEscolhidos).map(p => ({
      nome: p.nome.toLowerCase(),
      elemento: p.elemento,
      codigoRegra: p.codigoRegra,
      periciaEscolhidaNome: p.periciaEscolhidaNome
    }));
    
    return {
      atributos,
      nex,
      nivel,
      pericias: periciasHook.pericias,
      nomesPericias: periciasHook.nomesPericias,
      poderes: poderesArray,
      rituaisAprendidos: rituaisHook.rituaisAprendidos,
      rituais: rituaisHook.rituais,
      regras
    };
  }, [atributos, nex, nivel, periciasHook.pericias, periciasHook.nomesPericias, poderesHook.poderesEscolhidos, rituaisHook.rituaisAprendidos, rituaisHook.rituais, regras]);

  useEffect(() => {
    if (!isOpen) {
      setFiltro('');
      setExpandidos([]);
      setEscolhendoElementoId(null);
      setEscolhendoRitualId(null);
      setEscolhendoPericiaId(null);
      return;
    }
    
    let classesParaBuscar: string[] = [];
    if (classe === 'Especialista') classesParaBuscar = ['Combatente', 'Ocultista'];
    else if (classe === 'Combatente') classesParaBuscar = ['Especialista', 'Ocultista'];
    else if (classe === 'Ocultista') classesParaBuscar = ['Combatente', 'Especialista'];

    if (classesParaBuscar.length === 0) {
      setPoderes([]);
      return;
    }

    if (!abaAtiva || !classesParaBuscar.includes(abaAtiva)) {
      setAbaAtiva(classesParaBuscar[0]);
    }

    let filtrados = poderesHook.listaPoderesUtilidade.filter(p => {
      const classeNormalizada = p.Classe?.toLowerCase() || '';
      return classeNormalizada === (abaAtiva || classesParaBuscar[0]).toLowerCase();
    });

    if (categoriaPermitida === 'combate') {
      filtrados = filtrados.filter(p => p.Tipo?.toLowerCase().trim() === 'combate' || p.Tipo?.toLowerCase().trim() === 'varia');
    } else if (categoriaPermitida === 'utilidade') {
      filtrados = filtrados.filter(p => p.Tipo?.toLowerCase().trim() === 'utilidade' || p.Tipo?.toLowerCase().trim() === 'varia');
    }

    // Ordenar por nome
    filtrados.sort((a, b) => a.Nome.localeCompare(b.Nome));
    setPoderes(filtrados);
  }, [isOpen, classe, poderesHook.listaPoderesUtilidade, abaAtiva, categoriaPermitida]);

  if (!isOpen) return null;

  let classesDisponiveis: string[] = [];
  if (classe === 'Especialista') classesDisponiveis = ['Combatente', 'Ocultista'];
  else if (classe === 'Combatente') classesDisponiveis = ['Especialista', 'Ocultista'];
  else if (classe === 'Ocultista') classesDisponiveis = ['Combatente', 'Especialista'];

  const poderesFiltrados = poderes.filter(p => p.Nome.toLowerCase().includes(filtro.toLowerCase()));
  const periciasDisponiveis = Object.entries(contextoPrereq.nomesPericias).map(([id, nome]) => ({ id: Number(id), nome })).sort((a, b) => a.nome.localeCompare(b.nome));


  const renderPoder = (poder: any) => {

              const req = verificarPreRequisitos(poder as Poder, contextoPrereq);
              const isExpanded = expandidos.includes(poder.codigo_poder);
              const alreadyHas = Object.values(poderesHook.poderesEscolhidos).some(p => p.nome === poder.Nome);
              
              const precisaEscolherElemento = poder.Nome.toLowerCase().includes('elemento') || (poder.Descricao && poder.Descricao.toLowerCase().includes('escolha um elemento')) || poder.Codigo_Regra === 34 || poder.Codigo_Regra === 36;
              const precisaEscolherRitual = poder.Codigo_Regra === 35;
              const precisaEscolherPericia = poder.Nome.toLowerCase().includes('perícia') || (poder.Descricao && poder.Descricao.toLowerCase().includes('escolha uma perícia'));

              const rituaisAprendidos = contextoPrereq?.rituaisAprendidos || [];
              const bloqRitual = precisaEscolherRitual && rituaisAprendidos.length === 0;
              const blocked = !req.atende || alreadyHas || bloqRitual;

              return (
                <div key={poder.codigo_poder} className={`bg-zinc-900/40 border border-zinc-800/80 rounded p-3 hover:border-green-500/50 hover:bg-zinc-900/80 group flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'min-h-[155px] max-h-[3000px]' : 'min-h-[155px] max-h-[155px]'} cursor-pointer`}>
                  <div 
                    className="flex items-start justify-between gap-3 mb-2 cursor-pointer"
                    onClick={() => setExpandidos(prev => prev.includes(poder.codigo_poder) ? prev.filter(id => id !== poder.codigo_poder) : [...prev, poder.codigo_poder])}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-zinc-200 group-hover:text-green-400 transition select-none truncate">{poder.Nome}</span>
                      <span className="inline-block rounded bg-zinc-800 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider leading-tight text-zinc-400">{poder.Tipo || poder.Classe}</span>
                    </div>
                    <span className="w-5 text-center text-zinc-500 text-xs flex-shrink-0 mt-0.5">{isExpanded ? '▲' : '▼'}</span>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <Collapse isOpen={isExpanded} previewHeight="4.5em">
                      <p 
                        className="text-xs text-zinc-400 mb-2 leading-relaxed whitespace-pre-wrap select-none"
                        dangerouslySetInnerHTML={{ __html: formatarDescricao(poder.Descricao) }}
                      />
                    </Collapse>
                    <Collapse isOpen={isExpanded}>
                      <div className="mt-2 text-left border-t border-zinc-800/50 pt-2 flex flex-col gap-2">
                        {poder.PreRequisitos && (
                          <div className="inline-block rounded bg-amber-400/5 px-3 py-2 text-xs italic text-amber-400 border border-amber-500/20">
                            <strong>Pré-requisitos:</strong> {formatarTextoPreRequisitos(poder.PreRequisitos, contextoPrereq.nomesPericias)}
                          </div>
                        )}
                        {poder.Fonte && (
                          <div className="text-[0.6rem] uppercase tracking-wider text-zinc-600">
                            Fonte: {poder.Fonte}
                          </div>
                        )}
                      </div>
                    </Collapse>
                  </div>

                  <div className="flex flex-nowrap items-center gap-2 mt-auto overflow-hidden transition-all duration-300 ease-in-out text-[11px] border-t border-zinc-800/50 pt-2 mt-2">
                    <div className="flex items-center justify-end w-full gap-2">
                      {!alreadyHas && escolhendoElementoId === poder.codigo_poder ? (
                        <div className="flex gap-1 items-center bg-zinc-950 p-1 rounded border border-zinc-800" onClick={e => e.stopPropagation()}>
                          <span className="text-[0.55rem] text-zinc-500 uppercase font-bold px-1 hidden sm:inline">Elemento:</span>
                          {['Sangue', 'Morte', 'Conhecimento', 'Energia'].map(elem => {
                            const valElem = verificarPreRequisitos(poder as Poder, contextoPrereq, elem);
                            return (
                              <button
                                key={elem}
                                disabled={!valElem.atende}
                                title={valElem.motivo || ''}
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setEscolhendoElementoId(null); 
                                  poderesHook.escolherPoderExtra(poder, elem, undefined, 'extra_regra31');
                                  onClose();
                                }}
                                className={`rounded px-1.5 py-0.5 text-[0.55rem] font-bold uppercase transition border ${!valElem.atende ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-50' : 'border-zinc-700 hover:scale-105'}`}
                                style={valElem.atende ? { backgroundColor: elem==='Sangue'?'#7f1d1d':elem==='Morte'?'#000':elem==='Conhecimento'?'#b45309':'#4c1d95', color: elem==='Morte'?'#d4d4d8':'#f4f4f5' } : undefined}
                              >
                                {elem}
                              </button>
                            );
                          })}
                          <button onClick={(e) => { e.stopPropagation(); setEscolhendoElementoId(null); }} className="ml-1 rounded px-1 py-0.5 text-[0.6rem] font-bold text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition">✕</button>
                        </div>
                      ) : !alreadyHas && escolhendoPericiaId === poder.codigo_poder ? (
                        <div className="flex flex-wrap gap-1 items-center bg-zinc-950 p-1.5 rounded border border-zinc-800" onClick={e => e.stopPropagation()}>
                          <span className="text-[0.55rem] text-zinc-500 uppercase font-bold px-1 hidden sm:inline">Perícia:</span>
                          <CustomSelect
  value=""
  onChange={(val) => {
    const cod = Number(val);
    if (cod) {
      const nomePericia = contextoPrereq.nomesPericias[cod];
      setEscolhendoPericiaId(null);
      poderesHook.escolherPoderExtra(poder, undefined, nomePericia, 'extra_regra31');
      onClose();
    }
  }}
  options={[
    { value: '', label: 'Escolher...' },
    ...periciasDisponiveis.map(p => {
      const valPericia = verificarPreRequisitos(poder as Poder, contextoPrereq, undefined, p.id);
      return {
        value: String(p.id),
        label: p.nome,
        disabled: !valPericia.atende
      };
    })
  ]}
  wrapperClassName="max-w-[120px]"
  className="bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 rounded px-1 py-1"
/>
                          <button
                            onClick={(e) => { e.stopPropagation(); setEscolhendoPericiaId(null); }}
                            className="ml-1 rounded px-1 py-0.5 text-[0.6rem] font-bold text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition"
                          >
                            ✕
                          </button>
                        </div>
                      ) : !alreadyHas && (
                        <button
                          disabled={blocked}
                          title={bloqRitual ? "Você não possui nenhum ritual aprendido." : ""}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!blocked) {
                              if (precisaEscolherElemento) setEscolhendoElementoId(poder.codigo_poder);
                              else if (precisaEscolherRitual) setEscolhendoRitualId(poder.codigo_poder);
                              else if (precisaEscolherPericia) setEscolhendoPericiaId(poder.codigo_poder);
                              else {
                                poderesHook.escolherPoderExtra(poder, undefined, undefined, 'extra_regra31');
                                onClose();
                              }
                            }
                          }}
                          className={`ml-auto px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors active:scale-95 ${blocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          Escolher
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans" onClick={onClose}>
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col border-b border-zinc-800 p-5 pb-4 bg-zinc-900/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg uppercase tracking-wide text-zinc-100">PODER DE OUTRA CLASSE</h3>
            <button onClick={onClose} className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100">&times;</button>
          </div>
          <InputOtimizado value={filtro} onChange={setFiltro} placeholder={`Buscar poder de ${abaAtiva}...`} className="flex-1 rounded border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-green-700" />
        </div>
        
        <div className="flex border-b border-zinc-800 bg-zinc-950">
          {classesDisponiveis.map(c => (
            <button
              key={c}
              onClick={() => setAbaAtiva(c)}
              className={`min-w-[70px] flex-1 rounded-t px-1 py-2.5 text-xs font-bold uppercase tracking-wider transition ${abaAtiva === c ? 'border border-b-0 border-green-900 bg-zinc-900 text-zinc-100' : 'border border-transparent text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="flex flex-col md:flex-row gap-3 items-start">
            <div className="flex flex-col gap-3 w-full md:w-1/2 flex-1 min-w-0">
              {poderesFiltrados.filter((_, i) => i % 2 === 0).map(renderPoder)}
            </div>
            <div className="flex flex-col gap-3 w-full md:w-1/2 flex-1 min-w-0">
              {poderesFiltrados.filter((_, i) => i % 2 !== 0).map(renderPoder)}
            </div>
          </div>
        </div>
      </div>

      {escolhendoRitualId && (
        <ModalEscolherRitualAprendido
          isOpen={true}
          onClose={() => setEscolhendoRitualId(null)}
          onSelect={(ritualNome) => {
            const poder = poderesFiltrados.find(p => p.codigo_poder === escolhendoRitualId);
            if (poder) {
              poderesHook.escolherPoderExtra(poder, ritualNome, undefined, 'extra_regra31');
            }
            setEscolhendoRitualId(null);
            onClose();
          }}
          rituaisNomes={(contextoPrereq?.rituaisAprendidos || []).map((ra: any) => {
            const r = (contextoPrereq?.rituais || []).find((rt: any) => rt.Codigo_Ritual === ra.codigo_ritual);
            return ra.customNome || (r ? r.Nome_Ritual : String(ra.codigo_ritual));
          })}
        />
      )}
    </div>
  );
}
