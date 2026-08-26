import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Collapse } from './Collapse';

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

interface ModalHabilidadeTrilhaExtraProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (habilidade: { nome: string; descricao: string; preRequisitos: string; fonte: string; tipo: 'Trilha' }) => void;
  nexAtual: number;
}

export const ModalHabilidadeTrilhaExtra: React.FC<ModalHabilidadeTrilhaExtraProps> = ({
  isOpen,
  onClose,
  onSelect,
  nexAtual,
}) => {
  const [trilhas, setTrilhas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandidos, setExpandidos] = useState<string[]>([]);

  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    async function fetchTrilhas() {
      setLoading(true);
      const { data } = await supabase
        .from('Trilhas')
        .select('*')
        .eq('Classe_Trilha', 'Ocultista');
      
      if (data) {
        setTrilhas(data.sort((a, b) => a.Nome_Trilha.localeCompare(b.Nome_Trilha)));
      }
      setLoading(false);
    }
    fetchTrilhas();
  }, [isOpen]);

  if (!isOpen) return null;

  const nexLevels = [10, 40, 65, 99];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans" onClick={onClose}>
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col border-b border-zinc-800 p-5 pb-4 bg-zinc-900/50">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg uppercase tracking-wide text-zinc-100">Escolher Poder de Trilha <span className="text-green-500">(Ocultista)</span></h2>
            <button onClick={onClose} className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100">&times;</button>
          </div>
          <p className="mt-1 text-xs text-zinc-400">Selecione uma habilidade ritualística (NEX atual: {nexAtual}%)</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
            <div className="text-center py-10 text-zinc-500 italic">Carregando trilhas de Ocultista...</div>
          ) : (
            <div className="flex flex-col gap-6">
              {trilhas.map((trilha) => (
                <div key={trilha.Codigo_Trilha} className="rounded border border-zinc-700 bg-zinc-800/50 overflow-hidden">
                  <div className="bg-zinc-800/80 px-4 py-2 border-b border-zinc-700/50 flex justify-between items-center">
                    <span className="font-bold text-zinc-200 uppercase tracking-wider text-sm">{trilha.Nome_Trilha}</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{trilha.Fonte_Trilha}</span>
                  </div>
                  <div className="p-3 flex flex-col md:flex-row gap-3 items-start">
                    <div className="flex flex-col gap-3 w-full md:w-1/2">
                      {nexLevels.filter((_, i) => i % 2 === 0).map((nivel) => {
                        const nome = trilha[`Nome_Habilidade_${nivel}`];
                        const descricao = trilha[`Descricao_Habilidade_${nivel}`];
                        if (!nome || !descricao) return null;

                        const id = `${trilha.Codigo_Trilha}_${nivel}`;
                        const meetsNex = nexAtual >= nivel;
                        const isExpanded = expandidos.includes(id);

                        return (
                          <div key={id} className={`bg-zinc-900/40 border border-zinc-800/80 rounded p-3 hover:border-green-500/50 hover:bg-zinc-900/80 transition group flex flex-col h-full ${!meetsNex ? 'opacity-70' : ''}`}>
                            <div 
                              className="flex justify-between items-start cursor-pointer mb-2"
                              onClick={() => setExpandidos(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                            >
                              <div>
                                <span className="inline-block rounded bg-green-900/40 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider leading-tight text-green-300 mb-1">NEX {nivel}%</span>
                                <h4 className="font-bold text-zinc-200 group-hover:text-green-400 transition">{nome}</h4>
                              </div>
                              <span className="text-zinc-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
                            </div>
                            
                            <Collapse isOpen={isExpanded} previewHeight="4.5em">
                              <div 
                                className="text-xs text-zinc-400 mb-4 leading-relaxed whitespace-pre-wrap min-h-[4.5em]" 
                                dangerouslySetInnerHTML={{ __html: formatarDescricao(descricao) }} 
                              />
                            </Collapse>
                            
                            <div className="flex flex-wrap items-center gap-2 mt-auto text-[11px] border-t border-zinc-800/50 pt-2">
                              {meetsNex ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect({
                                      nome,
                                      descricao,
                                      preRequisitos: `NEX ${nivel}% (${trilha.Nome_Trilha})`,
                                      fonte: trilha.Fonte_Trilha || 'OPRPG',
                                      tipo: 'Trilha'
                                    });
                                  }}
                                  className="ml-auto px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors active:scale-95"
                                >
                                  Escolher
                                </button>
                              ) : (
                                <span className="ml-auto text-[0.65rem] uppercase font-bold text-zinc-600 tracking-wider">NEX Insuficiente</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex flex-col gap-3 w-full md:w-1/2">
                      {nexLevels.filter((_, i) => i % 2 !== 0).map((nivel) => {
                        const nome = trilha[`Nome_Habilidade_${nivel}`];
                        const descricao = trilha[`Descricao_Habilidade_${nivel}`];
                        if (!nome || !descricao) return null;

                        const id = `${trilha.Codigo_Trilha}_${nivel}`;
                        const meetsNex = nexAtual >= nivel;
                        const isExpanded = expandidos.includes(id);

                        return (
                          <div key={id} className={`bg-zinc-900/40 border border-zinc-800/80 rounded p-3 hover:border-green-500/50 hover:bg-zinc-900/80 transition group flex flex-col h-full ${!meetsNex ? 'opacity-70' : ''}`}>
                            <div 
                              className="flex justify-between items-start cursor-pointer mb-2"
                              onClick={() => setExpandidos(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                            >
                              <div>
                                <span className="inline-block rounded bg-green-900/40 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider leading-tight text-green-300 mb-1">NEX {nivel}%</span>
                                <h4 className="font-bold text-zinc-200 group-hover:text-green-400 transition">{nome}</h4>
                              </div>
                              <span className="text-zinc-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
                            </div>
                            
                            <Collapse isOpen={isExpanded} previewHeight="4.5em">
                              <div 
                                className="text-xs text-zinc-400 mb-4 leading-relaxed whitespace-pre-wrap min-h-[4.5em]" 
                                dangerouslySetInnerHTML={{ __html: formatarDescricao(descricao) }} 
                              />
                            </Collapse>
                            
                            <div className="flex flex-wrap items-center gap-2 mt-auto text-[11px] border-t border-zinc-800/50 pt-2">
                              {meetsNex ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect({
                                      nome,
                                      descricao,
                                      preRequisitos: `NEX ${nivel}% (${trilha.Nome_Trilha})`,
                                      fonte: trilha.Fonte_Trilha || 'OPRPG',
                                      tipo: 'Trilha'
                                    });
                                  }}
                                  className="ml-auto px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors active:scale-95"
                                >
                                  Escolher
                                </button>
                              ) : (
                                <span className="ml-auto text-[0.65rem] uppercase font-bold text-zinc-600 tracking-wider">NEX Insuficiente</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
