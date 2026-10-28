import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Collapse } from './Collapse';
import { CustomSelect } from './CustomSelect';
import { InputOtimizado } from './InputOtimizado';
import { useRPG } from '../context/RPGContext';
import { calcularNivel } from '../utils/rpgRules';

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
  apenas10?: boolean;
  trilhaIdIgnorar?: number;
  tituloCustom?: string;
}

export const ModalHabilidadeTrilhaExtra: React.FC<ModalHabilidadeTrilhaExtraProps> = ({
  isOpen,
  onClose,
  onSelect,
  nexAtual,
  apenas10,
  trilhaIdIgnorar,
  tituloCustom,
}) => {
  const { regras, trilhasHook } = useRPG();
  const [trilhas, setTrilhas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandidos, setExpandidos] = useState<string[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroFonte, setFiltroFonte] = useState<string>('Todas');
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(false);

  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (trilhasHook?.trilhas && trilhasHook.trilhas.length > 0) {
      const ocultistaTrilhas = trilhasHook.trilhas.filter(t => t.Classe_Trilha === 'Ocultista');
      const filtradas = trilhaIdIgnorar ? ocultistaTrilhas.filter(t => t.Codigo_Trilha !== trilhaIdIgnorar) : ocultistaTrilhas;
      setTrilhas([...filtradas].sort((a, b) => a.Nome_Trilha.localeCompare(b.Nome_Trilha)));
      setLoading(false);
      return;
    }
    async function fetchTrilhas() {
      setLoading(true);
      const { data } = await supabase
        .from('Trilhas')
        .select('*')
        .eq('Classe_Trilha', 'Ocultista');
      
      if (data) {
        const filtradas = trilhaIdIgnorar ? data.filter(t => t.Codigo_Trilha !== trilhaIdIgnorar) : data;
        setTrilhas(filtradas.sort((a, b) => a.Nome_Trilha.localeCompare(b.Nome_Trilha)));
      }
      setLoading(false);
    }
    fetchTrilhas();
  }, [isOpen, trilhaIdIgnorar, trilhasHook?.trilhas]);

  if (!isOpen) return null;

  const nexLevels = apenas10 ? [10] : [10, 40, 65, 99];
  const trilhasFiltradas = trilhas.filter((trilha) => {
    if (busca.trim()) {
      const lower = busca.toLowerCase();
      const matchNome = trilha.Nome_Trilha?.toLowerCase().includes(lower);
      const matchHab = nexLevels.some(lvl => {
        const nome = trilha[`Nome_Habilidade_${lvl}`];
        return nome && nome.toLowerCase().includes(lower);
      });
      if (!matchNome && !matchHab) return false;
    }
    if (filtroFonte !== 'Todas') {
      const fonte = (trilha.Fonte_Trilha || '').trim().toLowerCase();
      if (filtroFonte === 'Homebrew') {
        if (fonte !== 'homebrew' && fonte !== 'hb') return false;
      } else if (filtroFonte === 'AS') {
        if (fonte !== 'as' && fonte !== 'a.s.' && fonte !== 'a.s' && !fonte.includes('sobreviv') && !fonte.includes('arquivo') && !fonte.includes('aurora') && !fonte.includes('aniquila')) return false;
      } else {
        if (fonte !== filtroFonte.toLowerCase()) return false;
      }
    }
    return true;
  });



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans" onClick={onClose}>
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col border-b border-zinc-800 p-5 pb-4 bg-zinc-900/50">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg uppercase tracking-wide text-zinc-100">{tituloCustom || 'Escolher Poder de Trilha'} <span className="text-green-500">(Ocultista)</span></h2>
            <button onClick={onClose} className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100">&times;</button>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            {apenas10 
              ? (regras['nex_experiencia'] ? 'Selecione o poder de Nível 2 de uma trilha de Ocultista' : 'Selecione o poder de 10% de uma trilha de Ocultista')
              : (regras['nex_experiencia'] ? `Selecione uma habilidade ritualística (Nível atual: ${calcularNivel(nexAtual)})` : `Selecione uma habilidade ritualística (NEX atual: ${nexAtual}%)`)}
          </p>
          <div className="flex items-stretch gap-2 mt-3">
            <InputOtimizado
              value={busca}
              onChange={setBusca}
              placeholder="Buscar trilha ou habilidade..."
              className="flex-1 rounded border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-green-700"
            />
            <button
              onClick={() => setMostrarFiltrosAvancados(!mostrarFiltrosAvancados)}
              className={`rounded border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition ${
                mostrarFiltrosAvancados || filtroFonte !== 'Todas'
                  ? 'border-green-800 bg-green-900/40 text-green-300'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              Filtros
            </button>
          </div>
          <Collapse isOpen={mostrarFiltrosAvancados} className="z-50">
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-zinc-800/80 mt-3">
              <div className="flex flex-col gap-1 w-full sm:w-auto flex-1 min-w-[120px]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Fonte</label>
                <CustomSelect
                  value={filtroFonte}
                  onChange={setFiltroFonte}
                  options={[
                    { value: 'Todas', label: 'Todas' },
                    { value: 'OPRPG', label: 'OPRPG' },
                    { value: 'SaH', label: 'SaH' },
                    { value: 'AS', label: 'AS' },
                    { value: 'Homebrew', label: 'Homebrew' }
                  ]}
                  wrapperClassName="w-full"
                />
              </div>
            </div>
          </Collapse>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
            <div className="text-center py-10 text-zinc-500 italic">Carregando trilhas de Ocultista...</div>
          ) : (
            <div className="flex flex-col gap-6">
              {trilhasFiltradas.map((trilha) => (
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
                          <div key={id} className={`bg-zinc-900/40 border border-zinc-800/80 rounded p-3 hover:border-green-500/50 hover:bg-zinc-900/80 group flex flex-col overflow-hidden transition-all duration-300 ease-in-out cursor-pointer ${isExpanded ? 'min-h-[170px] max-h-[3000px]' : 'min-h-[170px] max-h-[170px]'} ${!meetsNex ? 'opacity-70' : ''}`}>
                            <div 
                              className="flex justify-between items-start cursor-pointer mb-2"
                              onClick={() => setExpandidos(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                            >
                              <div>
                                <span className="inline-block rounded bg-green-900/40 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider leading-tight text-green-300 mb-1">
                                  {regras['nex_experiencia'] ? `Nível ${calcularNivel(nivel)}` : `NEX ${nivel}%`}
                                </span>
                                <h4 className="font-bold text-zinc-200 group-hover:text-green-400 transition">{nome}</h4>
                              </div>
                              <span className="text-zinc-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
                            </div>
                            
                            <div className="flex-1 flex flex-col">
                              <Collapse isOpen={isExpanded} previewHeight="4.5em">
                                <div 
                                  className="text-xs text-zinc-400 mb-2 leading-relaxed whitespace-pre-wrap select-none" 
                                  dangerouslySetInnerHTML={{ __html: formatarDescricao(descricao) }} 
                                />
                              </Collapse>
                            </div>
                            
                            <div className="flex flex-nowrap items-center gap-2 mt-auto text-[11px] border-t border-zinc-800/50 pt-2 shrink-0">
                              {meetsNex ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect({
                                      nome,
                                      descricao,
                                      preRequisitos: regras['nex_experiencia'] ? `Nível ${calcularNivel(nivel)} (${trilha.Nome_Trilha})` : `NEX ${nivel}% (${trilha.Nome_Trilha})`,
                                      fonte: trilha.Fonte_Trilha || 'OPRPG',
                                      tipo: 'Trilha'
                                    });
                                  }}
                                  className="ml-auto shrink-0 px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors active:scale-95"
                                >
                                  Escolher
                                </button>
                              ) : (
                                <span className="ml-auto text-[0.65rem] uppercase font-bold text-zinc-600 tracking-wider">
                                  {regras['nex_experiencia'] ? 'Nível Insuficiente' : 'NEX Insuficiente'}
                                </span>
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
                          <div key={id} className={`bg-zinc-900/40 border border-zinc-800/80 rounded p-3 hover:border-green-500/50 hover:bg-zinc-900/80 group flex flex-col overflow-hidden transition-all duration-300 ease-in-out cursor-pointer ${isExpanded ? 'min-h-[170px] max-h-[3000px]' : 'min-h-[170px] max-h-[170px]'} ${!meetsNex ? 'opacity-70' : ''}`}>
                            <div 
                              className="flex justify-between items-start cursor-pointer mb-2"
                              onClick={() => setExpandidos(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                            >
                              <div>
                                <span className="inline-block rounded bg-green-900/40 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider leading-tight text-green-300 mb-1">
                                  {regras['nex_experiencia'] ? `Nível ${calcularNivel(nivel)}` : `NEX ${nivel}%`}
                                </span>
                                <h4 className="font-bold text-zinc-200 group-hover:text-green-400 transition">{nome}</h4>
                              </div>
                              <span className="text-zinc-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
                            </div>
                            
                            <div className="flex-1 flex flex-col">
                              <Collapse isOpen={isExpanded} previewHeight="4.5em">
                                <div 
                                  className="text-xs text-zinc-400 mb-2 leading-relaxed whitespace-pre-wrap select-none" 
                                  dangerouslySetInnerHTML={{ __html: formatarDescricao(descricao) }} 
                                />
                              </Collapse>
                            </div>
                            
                            <div className="flex flex-nowrap items-center gap-2 mt-auto text-[11px] border-t border-zinc-800/50 pt-2 shrink-0">
                              {meetsNex ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect({
                                      nome,
                                      descricao,
                                      preRequisitos: regras['nex_experiencia'] ? `Nível ${calcularNivel(nivel)} (${trilha.Nome_Trilha})` : `NEX ${nivel}% (${trilha.Nome_Trilha})`,
                                      fonte: trilha.Fonte_Trilha || 'OPRPG',
                                      tipo: 'Trilha'
                                    });
                                  }}
                                  className="ml-auto shrink-0 px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors active:scale-95"
                                >
                                  Escolher
                                </button>
                              ) : (
                                <span className="ml-auto text-[0.65rem] uppercase font-bold text-zinc-600 tracking-wider">
                                  {regras['nex_experiencia'] ? 'Nível Insuficiente' : 'NEX Insuficiente'}
                                </span>
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
