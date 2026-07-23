import React, { useEffect, useState, useMemo } from 'react';
import { useRPG } from '../context/RPGContext';
import { InputOtimizado } from './InputOtimizado';
import type { Poder } from '../types';
import { supabase } from '../services/supabase';
import { verificarPreRequisitos, formatarTextoPreRequisitos } from '../utils/preRequisitos';
import type { ContextoPreRequisitos } from '../utils/preRequisitos';

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

export const ModalPoderOutraClasse: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { classe, nex, atributos, periciasHook, poderesHook } = useRPG();
  const [poderes, setPoderes] = useState<Poder[]>([]);
  const [filtro, setFiltro] = useState('');
  const [expandidos, setExpandidos] = useState<number[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<string>('');

  const [escolhendoElementoId, setEscolhendoElementoId] = useState<number | null>(null);
  const [escolhendoRitualId, setEscolhendoRitualId] = useState<number | null>(null);
  const [escolhendoPericiaId, setEscolhendoPericiaId] = useState<number | null>(null);



  const contextoPrereq: ContextoPreRequisitos = useMemo(() => {
    const poderesArray: { nome: string; elemento?: string }[] = Object.values(poderesHook.poderesEscolhidos).map(p => ({
      nome: p.nome.toLowerCase(),
      elemento: p.elemento
    }));
    
    return {
      atributos,
      nex,
      pericias: periciasHook.pericias,
      nomesPericias: periciasHook.nomesPericias,
      poderes: poderesArray
    };
  }, [atributos, nex, periciasHook.pericias, periciasHook.nomesPericias, poderesHook.poderesEscolhidos]);

  useEffect(() => {
    if (!isOpen) return;
    
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

    const filtrados = poderesHook.listaPoderesUtilidade.filter(p => {
      const classeNormalizada = p.Classe?.toLowerCase() || '';
      return classeNormalizada === (abaAtiva || classesParaBuscar[0]).toLowerCase();
    });

    // Ordenar por nome
    filtrados.sort((a, b) => a.Nome.localeCompare(b.Nome));
    setPoderes(filtrados);
  }, [isOpen, classe, poderesHook.listaPoderesUtilidade, abaAtiva]);

  if (!isOpen) return null;

  let classesDisponiveis: string[] = [];
  if (classe === 'Especialista') classesDisponiveis = ['Combatente', 'Ocultista'];
  else if (classe === 'Combatente') classesDisponiveis = ['Especialista', 'Ocultista'];
  else if (classe === 'Ocultista') classesDisponiveis = ['Combatente', 'Especialista'];

  const poderesFiltrados = poderes.filter(p => p.Nome.toLowerCase().includes(filtro.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="flex h-[85vh] w-[90vw] max-w-4xl flex-col rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col border-b border-zinc-800 p-5 pb-4 bg-zinc-950 rounded-t-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display m-0 text-lg uppercase tracking-wide text-zinc-100">Poder de Outra Classe</h2>
            <button onClick={onClose} className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100">&times;</button>
          </div>
          <InputOtimizado value={filtro} onChange={setFiltro} placeholder={`Buscar poder de ${abaAtiva}...`} className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-red-700" />
        </div>
        
        <div className="flex border-b border-zinc-800 bg-zinc-950">
          {classesDisponiveis.map(c => (
            <button
              key={c}
              onClick={() => setAbaAtiva(c)}
              className={`min-w-[70px] flex-1 rounded-t px-1 py-2.5 text-xs font-bold uppercase tracking-wider transition ${abaAtiva === c ? 'border border-b-0 border-red-900 bg-zinc-900 text-zinc-100' : 'border border-transparent text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="flex flex-col gap-3">
            {poderesFiltrados.map(poder => {
              const req = verificarPreRequisitos(poder as Poder, contextoPrereq);
              const isExpanded = expandidos.includes(poder.codigo_poder);
              const alreadyHas = Object.values(poderesHook.poderesEscolhidos).some(p => p.nome === poder.Nome);
              const blocked = !req.atende || alreadyHas;

              const precisaEscolherElemento = poder.Nome.toLowerCase().includes('elemento') || (poder.Descricao && poder.Descricao.toLowerCase().includes('escolha um elemento')) || poder.Codigo_Regra === 34 || poder.Codigo_Regra === 36;
              const precisaEscolherRitual = poder.Codigo_Regra === 35;
              const precisaEscolherPericia = poder.Nome.toLowerCase().includes('perícia') || (poder.Descricao && poder.Descricao.toLowerCase().includes('escolha uma perícia'));

              return (
                <div key={poder.codigo_poder} className="rounded border border-zinc-700 bg-zinc-800/50 overflow-hidden">
                  <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-zinc-700/50 transition" onClick={() => setExpandidos(prev => prev.includes(poder.codigo_poder) ? prev.filter(id => id !== poder.codigo_poder) : [...prev, poder.codigo_poder])}>
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-zinc-200">{poder.Nome}</span>
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500">{poder.Codigo_Poder === 179 ? 'Combatente' : poder.Codigo_Poder === 181 ? 'Especialista' : 'Ocultista'}</span>
                    </div>
                    <div className="flex items-center gap-4">
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
                      ) : !alreadyHas && escolhendoRitualId === poder.codigo_poder ? (
                        <div className="flex gap-1 items-center bg-zinc-950 p-1 rounded border border-zinc-800" onClick={e => e.stopPropagation()}>
                          <span className="text-[0.55rem] text-zinc-500 uppercase font-bold px-1 hidden sm:inline">Ritual:</span>
                          <select
                            className="bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 rounded px-1 outline-none py-1 max-w-[140px]"
                            onChange={(e) => {
                              const nomeRitual = e.target.value;
                              if (nomeRitual) {
                                setEscolhendoRitualId(null);
                                poderesHook.escolherPoderExtra(poder, nomeRitual, undefined, 'extra_regra31');
                                onClose();
                              }
                            }}
                            defaultValue=""
                          >
                            <option value="" disabled>Escolher...</option>
                            {(contextoPrereq?.rituaisAprendidos || []).map((r, i) => (
                              <option key={i} value={r.customNome || r.nome}>{r.customNome || r.nome}</option>
                            ))}
                          </select>
                          <button onClick={(e) => { e.stopPropagation(); setEscolhendoRitualId(null); }} className="ml-1 rounded px-1 py-0.5 text-[0.6rem] font-bold text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition">✕</button>
                        </div>
                      ) : !alreadyHas && (
                        <button
                          disabled={blocked}
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
                          className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition ${blocked ? 'bg-zinc-800 text-zinc-600' : 'bg-red-700 text-white hover:bg-red-600'}`}
                        >
                          Escolher
                        </button>
                      )}
                      <span className="text-zinc-600">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="p-5 border-t border-zinc-700 text-sm text-zinc-400 bg-zinc-900/30">
                      <div dangerouslySetInnerHTML={{ __html: formatarDescricao(poder.Descricao) }} />
                      {poder.PreRequisitos && (
                        <div className="mt-4 p-2 rounded bg-amber-500/10 text-xs italic text-amber-500 border border-amber-500/20">Pré-requisitos: {formatarTextoPreRequisitos(poder.PreRequisitos, contextoPrereq.nomesPericias)}</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
