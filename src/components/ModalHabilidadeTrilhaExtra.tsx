import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-5">
      <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50" style={{ maxHeight: '85vh' }}>
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-4">
          <div>
            <h2 className="font-display text-lg uppercase tracking-wider text-zinc-100">Escolher Poder de Trilha <span className="text-red-500">(Ocultista)</span></h2>
            <p className="mt-1 text-xs text-zinc-500">Selecione uma habilidade ritualística (NEX atual: {nexAtual}%)</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 transition hover:text-red-400">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
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
                  <div className="p-3 flex flex-col gap-2">
                    {nexLevels.map((nivel) => {
                      const nome = trilha[`Nome_Habilidade_${nivel}`];
                      const descricao = trilha[`Descricao_Habilidade_${nivel}`];
                      if (!nome || !descricao) return null;

                      const id = `${trilha.Codigo_Trilha}_${nivel}`;
                      const meetsNex = nexAtual >= nivel;
                      const isExpanded = expandidos.includes(id);

                      return (
                        <div key={id} className={`rounded border overflow-hidden transition ${meetsNex ? 'border-zinc-700 bg-zinc-900/50' : 'border-zinc-800 bg-zinc-900/20 opacity-70'}`}>
                          <div 
                            className="flex justify-between items-center p-3 cursor-pointer hover:bg-zinc-700/30 transition"
                            onClick={() => setExpandidos(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                          >
                            <div className="flex items-center gap-2">
                              <span className="inline-block rounded bg-red-900/40 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider leading-tight text-red-200">NEX {nivel}%</span>
                              <span className="font-bold text-zinc-100 text-sm">{nome}</span>
                            </div>
                            <div className="flex items-center gap-3">
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
                                  className="rounded px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider transition bg-red-900 text-red-100 hover:bg-red-800"
                                >
                                  Escolher
                                </button>
                              ) : (
                                <span className="text-[0.65rem] uppercase font-bold text-zinc-600 tracking-wider">NEX Insuficiente</span>
                              )}
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="px-5 py-4 border-t border-zinc-800/50 bg-zinc-950/30">
                              <div className="text-sm leading-relaxed text-zinc-400" dangerouslySetInnerHTML={{ __html: formatarDescricao(descricao) }} />
                            </div>
                          )}
                        </div>
                      );
                    })}
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
