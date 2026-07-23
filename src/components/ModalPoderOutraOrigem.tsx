import React, { useEffect, useState } from 'react';
import { useRPG } from '../context/RPGContext';
import { InputOtimizado } from './InputOtimizado';
import { supabase } from '../services/supabase';
import type { Origem } from '../types';

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
  const { poderesHook, origensHook } = useRPG();
  const [origens, setOrigens] = useState<Origem[]>([]);
  const [filtro, setFiltro] = useState('');
  const [expandidos, setExpandidos] = useState<number[]>([]);

  const [escolhendoElementoId, setEscolhendoElementoId] = useState<number | null>(null);
  const [escolhendoRitualId, setEscolhendoRitualId] = useState<number | null>(null);
  const [escolhendoPericiaId, setEscolhendoPericiaId] = useState<number | null>(null);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="flex h-[85vh] w-[90vw] max-w-4xl flex-col rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-4">
          <h2 className="font-display text-xl uppercase tracking-widest text-red-500">Poder de Outra Origem</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">✕</button>
        </div>
        
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
          <InputOtimizado value={filtro} onChange={setFiltro} placeholder="Buscar origem..." className="w-full bg-zinc-950 border border-zinc-700 p-3 text-sm text-zinc-200 rounded outline-none focus:border-red-800 transition" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="flex flex-col gap-3">
            {origensFiltradas.map(origem => {
              const isExpanded = expandidos.includes(origem.Codigo_Origem);
              const alreadyHas = Object.values(poderesHook.poderesEscolhidos).some(p => p.nome === origem.Nome_Poder);

              const pseudoPoder = { Nome: origem.Nome_Poder, Descricao: origem.Descricao_Poder, Codigo_Regra: origem.Codigo_Regra, PreRequisitos: '' } as any;
              const precisaEscolherElemento = origem.Nome_Poder.toLowerCase().includes('elemento') || (origem.Descricao_Poder && origem.Descricao_Poder.toLowerCase().includes('escolha um elemento')) || origem.Codigo_Regra === 34 || origem.Codigo_Regra === 36;
              const precisaEscolherRitual = origem.Codigo_Regra === 35;
              const precisaEscolherPericia = origem.Nome_Poder.toLowerCase().includes('perícia') || (origem.Descricao_Poder && origem.Descricao_Poder.toLowerCase().includes('escolha uma perícia'));

              return (
                <div key={origem.Codigo_Origem} className="overflow-hidden rounded-md border border-zinc-800 bg-zinc-900 transition hover:border-zinc-700">
                  <div className="flex justify-between items-center bg-zinc-900/50 p-4">
                    <button onClick={(e) => { e.stopPropagation(); setExpandidos(prev => prev.includes(origem.Codigo_Origem) ? prev.filter(id => id !== origem.Codigo_Origem) : [...prev, origem.Codigo_Origem]); }} className="flex flex-1 items-center gap-3 bg-transparent text-left outline-none">
                      <span className={`text-xs text-zinc-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                      <span className="text-lg font-bold text-zinc-100">{origem.Nome}</span>
                    </button>
                    <div className="flex items-center gap-4">
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
                      ) : !alreadyHas && escolhendoRitualId === origem.Codigo_Origem ? (
                        <div className="flex gap-1 items-center bg-zinc-950 p-1 rounded border border-zinc-800" onClick={e => e.stopPropagation()}>
                          <span className="text-[0.55rem] text-zinc-500 uppercase font-bold px-1 hidden sm:inline">Ritual:</span>
                          <select
                            className="bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 rounded px-1 outline-none py-1 max-w-[140px]"
                            onChange={(e) => {
                              const nomeRitual = e.target.value;
                              if (nomeRitual) {
                                setEscolhendoRitualId(null);
                                poderesHook.escolherPoderExtra({ Id_Poder: -origem.Codigo_Origem, Codigo_Poder: -1, Nome: origem.Nome_Poder, Descricao: origem.Descricao_Poder, Fonte: origem.Fonte, Tipo: 'Geral', Codigo_Regra: origem.Codigo_Regra } as any, nomeRitual, undefined, 'extra_regra32');
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
                          className={`rounded-md px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-100 transition bg-red-700 hover:bg-red-600`}
                        >
                          Escolher
                        </button>
                      )}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="border-t border-zinc-800 px-5 pb-5 pt-4 text-left leading-relaxed text-zinc-400">
                      <p>
                        <strong className="text-red-500">{origem.Nome_Poder}. </strong>
                        <span dangerouslySetInnerHTML={{ __html: formatarDescricao(origem.Descricao_Poder) }} />
                      </p>
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
