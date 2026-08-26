import { CustomSelect } from './CustomSelect';
import { Collapse } from './Collapse';
import React, { useEffect, useState, useMemo } from 'react';
import { useRPG } from '../context/RPGContext';
import { InputOtimizado } from './InputOtimizado';
import { supabase } from '../services/supabase';
import type { Origem } from '../types';
import { ModalEscolherRitualAprendido } from './ModalEscolherRitualAprendido';
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

export const ModalPoderOutraOrigem: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
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

  const { nex, atributos, periciasHook, poderesHook, origensHook, rituaisHook } = useRPG();
  const [origens, setOrigens] = useState<Origem[]>([]);
  const [filtro, setFiltro] = useState('');
  const [expandidos, setExpandidos] = useState<number[]>([]);

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
      pericias: periciasHook.pericias,
      nomesPericias: periciasHook.nomesPericias,
      poderes: poderesArray,
      rituaisAprendidos: rituaisHook.rituaisAprendidos,
      rituais: rituaisHook.rituais
    };
  }, [atributos, nex, periciasHook.pericias, periciasHook.nomesPericias, poderesHook.poderesEscolhidos, rituaisHook.rituaisAprendidos, rituaisHook.rituais]);

  useEffect(() => {
    if (!isOpen) return;
    async function fetchOrigens() {
      const { data } = await supabase.from('Origens').select('*').order('Nome');
      if (data) {
        setOrigens(data as Origem[]);
      }
    }
    fetchOrigens();
  }, [isOpen]);

  if (!isOpen) return null;

  // Filtrar pela string e garantir que não seja a origem atual
  const origensFiltradas = origens.filter(o => 
    o.Nome.toLowerCase().includes(filtro.toLowerCase()) && 
    o.Codigo_Origem !== origensHook.origemSelecionada?.Codigo_Origem
  );

  const periciasDisponiveis = Object.entries(contextoPrereq.nomesPericias).map(([id, nome]) => ({ id: Number(id), nome })).sort((a, b) => a.nome.localeCompare(b.nome));


  const renderOrigem = (origem: any) => {

              const isExpanded = expandidos.includes(origem.Codigo_Origem);
              const alreadyHas = Object.values(poderesHook.poderesEscolhidos).some(p => p.nome === origem.Nome_Poder);

              const pseudoPoder = { Nome: origem.Nome_Poder, Descricao: origem.Descricao_Poder, Codigo_Regra: origem.Codigo_Regra, PreRequisitos: '' } as any;
              const precisaEscolherElemento = origem.Nome_Poder.toLowerCase().includes('elemento') || (origem.Descricao_Poder && origem.Descricao_Poder.toLowerCase().includes('escolha um elemento')) || origem.Codigo_Regra === 34 || origem.Codigo_Regra === 36;
              const precisaEscolherRitual = origem.Codigo_Regra === 35;
              const precisaEscolherPericia = origem.Nome_Poder.toLowerCase().includes('perícia') || (origem.Descricao_Poder && origem.Descricao_Poder.toLowerCase().includes('escolha uma perícia'));

              const rituaisAprendidos = contextoPrereq?.rituaisAprendidos || [];
              const bloqRitual = precisaEscolherRitual && rituaisAprendidos.length === 0;

              return (
                <div key={origem.Codigo_Origem} className={`bg-zinc-900/40 border border-zinc-800/80 rounded p-3 hover:border-green-500/50 hover:bg-zinc-900/80 transition group flex flex-col min-h-[190px]`}>
                  <div className="flex justify-between items-center cursor-pointer transition">
                    <button onClick={(e) => { e.stopPropagation(); setExpandidos(prev => prev.includes(origem.Codigo_Origem) ? prev.filter(id => id !== origem.Codigo_Origem) : [...prev, origem.Codigo_Origem]); }} className="flex flex-1 items-center gap-3 bg-transparent text-left outline-none font-bold text-zinc-200 group-hover:text-green-400 transition">
                      <span className="text-sm font-bold text-zinc-200 group-hover:text-green-400 transition">{origem.Nome}</span>
                    </button>
                    <div className="flex items-center gap-3"><span className="text-zinc-500 text-xs">{isExpanded ? '▲' : '▼'}</span></div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-auto text-[11px] border-t border-zinc-800/50 pt-2 mt-3">
                    <div className="flex items-center justify-end w-full gap-2">
                      {!alreadyHas && escolhendoElementoId === origem.Codigo_Origem ? (
                        <div className="flex gap-1 items-center bg-zinc-950 p-1 rounded border border-zinc-800" onClick={e => e.stopPropagation()}>
                          <span className="text-[0.55rem] text-zinc-500 uppercase font-bold px-1 hidden sm:inline">Elemento:</span>
                          {['Sangue', 'Morte', 'Conhecimento', 'Energia'].map(elem => (
                            <button
                              key={elem}
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setEscolhendoElementoId(null); 
                                poderesHook.escolherPoderExtra({ Id_Poder: -origem.Codigo_Origem, Codigo_Poder: -1, Nome: origem.Nome_Poder, Descricao: origem.Descricao_Poder, Fonte: origem.Fonte, Tipo: 'Geral', Codigo_Regra: origem.Codigo_Regra } as any, elem, undefined, 'extra_regra32');
                                onClose();
                              }}
                              className="rounded px-1.5 py-0.5 text-[0.55rem] font-bold uppercase transition border border-zinc-700 hover:scale-105"
                              style={{ backgroundColor: elem==='Sangue'?'#7f1d1d':elem==='Morte'?'#000':elem==='Conhecimento'?'#b45309':'#4c1d95', color: elem==='Morte'?'#d4d4d8':'#f4f4f5' }}
                            >
                              {elem}
                            </button>
                          ))}
                          <button onClick={(e) => { e.stopPropagation(); setEscolhendoElementoId(null); }} className="ml-1 rounded px-1 py-0.5 text-[0.6rem] font-bold text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition">✕</button>
                        </div>
                      ) : !alreadyHas && escolhendoPericiaId === origem.Codigo_Origem ? (
                        <div className="flex flex-wrap gap-1 items-center bg-zinc-950 p-1.5 rounded border border-zinc-800" onClick={e => e.stopPropagation()}>
                          <span className="text-[0.55rem] text-zinc-500 uppercase font-bold px-1 hidden sm:inline">Perícia:</span>
                          <CustomSelect
  value=""
  onChange={(val) => {
    const cod = Number(val);
    if (cod && contextoPrereq) {
      const nomePericia = contextoPrereq.nomesPericias[cod];
      setEscolhendoPericiaId(null);
      poderesHook.escolherPoderExtra({
        Id_Poder: -origem.Codigo_Origem,
        Codigo_Poder: -1,
        Nome: origem.Nome_Poder,
        Descricao: origem.Descricao_Poder,
        Fonte: origem.Fonte,
        Tipo: 'Geral',
        Codigo_Regra: origem.Codigo_Regra
      } as any, undefined, nomePericia, 'extra_regra32');
      onClose();
    }
  }}
  options={[
    { value: '', label: 'Escolher...' },
    ...periciasDisponiveis.map(p => ({
      value: String(p.id),
      label: p.nome
    }))
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
                          disabled={bloqRitual}
                          title={bloqRitual ? "Você não possui nenhum ritual aprendido." : ""}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (precisaEscolherElemento) setEscolhendoElementoId(origem.Codigo_Origem);
                            else if (precisaEscolherRitual) setEscolhendoRitualId(origem.Codigo_Origem);
                            else if (precisaEscolherPericia) setEscolhendoPericiaId(origem.Codigo_Origem);
                            else {
                              // Passa como "Poder" falso adaptando os campos da Origem
                              poderesHook.escolherPoderExtra({
                                Id_Poder: -origem.Codigo_Origem,
                                Codigo_Poder: -1,
                                Nome: origem.Nome_Poder,
                                Descricao: origem.Descricao_Poder,
                                Fonte: origem.Fonte,
                                Tipo: 'Geral',
                                Codigo_Regra: origem.Codigo_Regra
                              } as any, undefined, undefined, 'extra_regra32');
                              onClose();
                            }
                          }}
                          className={`ml-auto px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors active:scale-95 ${bloqRitual ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          Escolher
                        </button>
                      )}
                    </div>
                  </div>
                  <Collapse isOpen={isExpanded}>
                    <div className="border-t border-zinc-800 px-5 py-4 text-left">
                      <p>
                        <strong className="text-green-500">{origem.Nome_Poder}. </strong>
                        <span className="text-xs text-zinc-400 mb-4 leading-relaxed whitespace-pre-wrap min-h-[3.2em]" dangerouslySetInnerHTML={{ __html: formatarDescricao(origem.Descricao_Poder) }} />
                      </p>
                    </div>
                  </Collapse>
                </div>
              );
            
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans" onClick={onClose}>
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col border-b border-zinc-800 p-5 pb-4 bg-zinc-900/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg uppercase tracking-wide text-zinc-100">PODER DE OUTRA ORIGEM</h3>
            <button onClick={onClose} className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100">&times;</button>
          </div>
          <InputOtimizado value={filtro} onChange={setFiltro} placeholder="Buscar origem..." className="flex-1 rounded border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-green-700" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="flex flex-col md:flex-row gap-3 items-start">
            <div className="flex flex-col gap-3 w-full md:w-1/2 flex-1 min-w-0">
              {origensFiltradas.filter((_, i) => i % 2 === 0).map(renderOrigem)}
            </div>
            <div className="flex flex-col gap-3 w-full md:w-1/2 flex-1 min-w-0">
              {origensFiltradas.filter((_, i) => i % 2 !== 0).map(renderOrigem)}
            </div>
          </div>
        </div>
      </div>

      {escolhendoRitualId && (
        <ModalEscolherRitualAprendido
          isOpen={true}
          onClose={() => setEscolhendoRitualId(null)}
          onSelect={(ritualNome) => {
            const origem = origensFiltradas.find(o => o.Codigo_Origem === escolhendoRitualId);
            if (origem) {
              poderesHook.escolherPoderExtra({ Id_Poder: -origem.Codigo_Origem, Codigo_Poder: -1, Nome: origem.Nome_Poder, Descricao: origem.Descricao_Poder, Fonte: origem.Fonte, Tipo: 'Geral', Codigo_Regra: origem.Codigo_Regra } as any, ritualNome, undefined, 'extra_regra32');
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
