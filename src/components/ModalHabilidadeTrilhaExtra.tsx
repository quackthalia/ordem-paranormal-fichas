import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabase';
import { Collapse } from './Collapse';
import { CustomSelect } from './CustomSelect';
import { InputOtimizado } from './InputOtimizado';
import { useRPG } from '../context/RPGContext';
import { calcularNivel } from '../utils/rpgRules';
import type { Trilha } from '../types';

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
  onSelect: (habilidade: { 
    nome: string; 
    descricao: string; 
    preRequisitos: string; 
    fonte: string; 
    tipo: 'Trilha';
    trilhaCodigo?: number;
    trilhaNome?: string;
    nivelHab?: number;
  }) => void;
  nexAtual: number;
  apenas10?: boolean;
  trilhaIdIgnorar?: number;
  tituloCustom?: string;
  subtituloCustom?: string;
  habilidadesJaAdquiridas?: { nome: string; trilhaCodigo?: number; nivelHab?: number }[];
}

export const ModalHabilidadeTrilhaExtra: React.FC<ModalHabilidadeTrilhaExtraProps> = ({
  isOpen,
  onClose,
  onSelect,
  nexAtual,
  apenas10,
  trilhaIdIgnorar,
  tituloCustom,
  subtituloCustom,
  habilidadesJaAdquiridas = [],
}) => {
  const { regras, trilhasHook } = useRPG();
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandidos, setExpandidos] = useState<string[]>([]);
  const [trilhasExpandidasCards, setTrilhasExpandidasCards] = useState<number[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroFonte, setFiltroFonte] = useState<string>('Todas');
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(false);

  useEffect(() => {
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
        const filtradas = trilhaIdIgnorar ? data.filter((t: any) => t.Codigo_Trilha !== trilhaIdIgnorar) : data;
        setTrilhas((filtradas as Trilha[]).sort((a, b) => a.Nome_Trilha.localeCompare(b.Nome_Trilha)));
      }
      setLoading(false);
    }
    fetchTrilhas();
  }, [isOpen, trilhaIdIgnorar, trilhasHook?.trilhas]);

  const nexLevels = apenas10 ? [10] : [10, 40, 65];

  const trilhasFiltradas = useMemo(() => {
    return trilhas.filter((trilha) => {
      if (busca.trim()) {
        const lower = busca.toLowerCase();
        const matchNome = trilha.Nome_Trilha?.toLowerCase().includes(lower);
        const matchHab = nexLevels.some(lvl => {
          const nome = (trilha as any)[`Nome_Habilidade_${lvl}`];
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
  }, [trilhas, busca, filtroFonte, nexLevels]);

  if (!isOpen) return null;

  // Função para validar se uma habilidade específica de uma trilha pode ser escolhida
  const checarDisponibilidadeHabilidade = (trilha: Trilha, nivel: number) => {
    const nomeHab = (trilha as any)[`Nome_Habilidade_${nivel}`];
    if (!nomeHab) return { pode: false, motivo: 'Habilidade não encontrada' };

    // Já tem essa habilidade exata?
    const jaTemEssa = habilidadesJaAdquiridas.some(h => 
      h.nome?.trim().toLowerCase() === nomeHab.trim().toLowerCase() ||
      (h.trilhaCodigo === trilha.Codigo_Trilha && h.nivelHab === nivel)
    );
    if (jaTemEssa) {
      return { pode: false, motivo: 'Já Adquirida' };
    }

    // Checa NEX mínimo
    if (nexAtual < nivel) {
      return { 
        pode: false, 
        motivo: regras['nex_experiencia'] ? `Nível ${calcularNivel(nivel)} Insuficiente` : `NEX ${nivel}% Insuficiente` 
      };
    }

    // Regras de progressão por trilha:
    // 10%: sempre livre se tiver NEX
    if (nivel === 10) {
      return { pode: true };
    }

    // 40%: Requer ter pego a habilidade de 10% desta mesma trilha
    if (nivel === 40) {
      const nome10 = trilha.Nome_Habilidade_10?.trim().toLowerCase();
      const tem10DestaTrilha = habilidadesJaAdquiridas.some(h => 
        (h.trilhaCodigo === trilha.Codigo_Trilha && h.nivelHab === 10) ||
        (nome10 && h.nome?.trim().toLowerCase() === nome10)
      );
      if (!tem10DestaTrilha) {
        return { 
          pode: false, 
          motivo: regras['nex_experiencia'] ? `Requer poder de Nível 2 (${trilha.Nome_Trilha})` : `Requer poder de 10% (${trilha.Nome_Trilha})` 
        };
      }
      return { pode: true };
    }

    // 65%: Requer ter pego a habilidade de 40% desta mesma trilha
    if (nivel === 65) {
      const nome40 = trilha.Nome_Habilidade_40?.trim().toLowerCase();
      const tem40DestaTrilha = habilidadesJaAdquiridas.some(h => 
        (h.trilhaCodigo === trilha.Codigo_Trilha && h.nivelHab === 40) ||
        (nome40 && h.nome?.trim().toLowerCase() === nome40)
      );
      if (!tem40DestaTrilha) {
        return { 
          pode: false, 
          motivo: regras['nex_experiencia'] ? `Requer poder de Nível 8 (${trilha.Nome_Trilha})` : `Requer poder de 40% (${trilha.Nome_Trilha})` 
        };
      }
      return { pode: true };
    }

    return { pode: true };
  };

  const renderCardHabilidade = (trilha: Trilha, nivel: number) => {
    const nome = (trilha as any)[`Nome_Habilidade_${nivel}`];
    const descricao = (trilha as any)[`Descricao_Habilidade_${nivel}`];
    if (!nome || !descricao) return null;

    const id = `${trilha.Codigo_Trilha}_${nivel}`;
    const status = checarDisponibilidadeHabilidade(trilha, nivel);
    const isExpanded = expandidos.includes(id);

    const rawAuto = ((trilha as any)[`Auto_${nivel}`] || '').toString().toLowerCase().trim();
    const isAuto = rawAuto === 'sim' || rawAuto === 'auto';
    const isSemi = rawAuto === 'semi';

    return (
      <div 
        key={id} 
        className={`bg-zinc-900/60 border rounded-lg p-3.5 transition-all duration-200 flex flex-col justify-between ${
          status.pode 
            ? 'border-zinc-800 hover:border-green-500/50 hover:bg-zinc-900/90 shadow-sm' 
            : 'border-zinc-900/80 bg-zinc-950/40 opacity-70'
        }`}
      >
        <div>
          <div 
            className="flex justify-between items-start cursor-pointer mb-2 gap-2"
            onClick={() => setExpandidos(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
          >
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-block rounded bg-green-950/70 border border-green-800/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider leading-tight text-green-300">
                  {regras['nex_experiencia'] ? `NV ${calcularNivel(nivel)}` : `${nivel}%`}
                </span>
                {(isAuto || isSemi) && (
                  <span
                    title={isAuto ? 'Totalmente automático' : 'Semi-automático'}
                    className={`shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.55rem] font-bold uppercase tracking-wider ${
                      isAuto
                        ? 'bg-green-950/60 text-green-400 border border-green-800/50'
                        : 'bg-yellow-950/60 text-yellow-400 border border-yellow-800/50'
                    }`}
                  >
                    {isAuto ? (
                      <>
                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z"/></svg>
                        Auto
                      </>
                    ) : (
                      <>
                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" opacity="0.5"/><path d="M19 3v4m0 4v10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
                        Semi
                      </>
                    )}
                  </span>
                )}
              </div>
              <h4 className="font-bold text-zinc-100 text-sm tracking-wide leading-snug">{nome}</h4>
            </div>
            <span className="text-zinc-500 text-xs px-1 hover:text-zinc-300 transition-colors shrink-0">
              {isExpanded ? '▲' : '▼'}
            </span>
          </div>

          <div className="text-xs text-zinc-400 mb-3 leading-relaxed">
            <Collapse isOpen={isExpanded} previewHeight="4em">
              <div 
                className="select-none leading-relaxed" 
                dangerouslySetInnerHTML={{ __html: formatarDescricao(descricao) }} 
              />
            </Collapse>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-zinc-800/60 mt-auto shrink-0">
          <span className="text-[10px] text-zinc-500 tracking-wider">
            {trilha.Nome_Trilha}
          </span>
          {status.pode ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect({
                  nome,
                  descricao,
                  preRequisitos: regras['nex_experiencia'] ? `Nível ${calcularNivel(nivel)} (${trilha.Nome_Trilha})` : `NEX ${nivel}% (${trilha.Nome_Trilha})`,
                  fonte: trilha.Fonte_Trilha || 'OPRPG',
                  tipo: 'Trilha',
                  trilhaCodigo: trilha.Codigo_Trilha,
                  trilhaNome: trilha.Nome_Trilha,
                  nivelHab: nivel,
                });
              }}
              className="px-3.5 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-[11px] uppercase tracking-wider transition active:scale-95 shadow-sm"
            >
              Escolher
            </button>
          ) : (
            <span className="text-[10px] font-bold text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-zinc-800 text-right leading-tight max-w-[200px]">
              {status.motivo}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans" onClick={onClose}>
      <div 
        className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[90vh]" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex flex-col border-b border-zinc-800 p-5 pb-4 bg-zinc-900/60">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-display text-lg uppercase tracking-wide text-zinc-100 flex items-center gap-2">
              <span>{tituloCustom || 'DOMINAR HABILIDADE RITUALÍSTICA'}</span>
              <span className="text-green-500 text-sm font-sans font-bold">
                {subtituloCustom || (apenas10 ? '(10%)' : '(Trilhas de Ocultista)')}
              </span>
            </h2>
            <button 
              onClick={onClose} 
              className="text-zinc-500 hover:text-white transition text-2xl leading-none px-1"
            >
              &times;
            </button>
          </div>
          <p className="text-xs text-zinc-400">
            {apenas10 
              ? (regras['nex_experiencia'] ? 'Selecione a habilidade de Nível 2 de uma trilha de Ocultista.' : 'Selecione a habilidade de 10% de uma trilha de Ocultista.')
              : (regras['nex_experiencia'] 
                  ? `Selecione uma habilidade ritualística (Nível atual: ${calcularNivel(nexAtual)}). Habilidades avançadas requerem a anterior da mesma trilha.` 
                  : `Selecione uma habilidade ritualística (NEX atual: ${nexAtual}%). Habilidades de 40% requerem a de 10% da mesma trilha, e 65% requerem a de 40%.`)}
          </p>

          {/* Barra de Busca e Filtros */}
          <div className="flex items-stretch gap-2 mt-4">
            <InputOtimizado
              value={busca}
              onChange={setBusca}
              placeholder="Buscar trilha ou habilidade ritualística..."
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900/90 px-3.5 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-green-600 transition"
            />
            <button
              onClick={() => setMostrarFiltrosAvancados(!mostrarFiltrosAvancados)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                mostrarFiltrosAvancados || filtroFonte !== 'Todas'
                  ? 'border-green-700 bg-green-950/60 text-green-300'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              Filtros
            </button>
          </div>

          <Collapse isOpen={mostrarFiltrosAvancados} className="z-50">
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-zinc-800/80 mt-3">
              <div className="flex flex-col gap-1 w-full sm:w-auto flex-1 min-w-[140px]">
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

        {/* Lista de Trilhas e Habilidades */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar">
          {loading ? (
            <div className="text-center py-12 text-zinc-500 italic">Carregando trilhas de Ocultista...</div>
          ) : trilhasFiltradas.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 italic">Nenhuma trilha encontrada para a busca atual.</div>
          ) : (
            <div className="flex flex-col gap-5">
              {trilhasFiltradas.map((trilha) => {
                const estaExpandida = trilhasExpandidasCards.includes(trilha.Codigo_Trilha);
                return (
                  <div 
                    key={trilha.Codigo_Trilha} 
                    className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden shadow-md"
                  >
                    {/* Header da Trilha */}
                    <div 
                      onClick={() => setTrilhasExpandidasCards(prev => 
                        prev.includes(trilha.Codigo_Trilha) 
                          ? prev.filter(c => c !== trilha.Codigo_Trilha) 
                          : [...prev, trilha.Codigo_Trilha]
                      )}
                      className="bg-zinc-800/60 px-4 py-3 border-b border-zinc-800 flex justify-between items-center cursor-pointer hover:bg-zinc-800 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-zinc-100 uppercase tracking-wider text-sm">
                          {trilha.Nome_Trilha}
                        </span>
                        {trilha.nome_pericia && (
                          <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                            ({trilha.nome_pericia})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                          {trilha.Fonte_Trilha || 'OPRPG'}
                        </span>
                        <span className="text-zinc-400 text-xs">
                          {estaExpandida ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>

                    {/* Descrição curta da Trilha */}
                    {trilha.Descricao_Trilha && (
                      <div className="px-4 py-2.5 text-xs text-zinc-400 border-b border-zinc-800/40 bg-zinc-950/20 leading-relaxed">
                        <Collapse isOpen={estaExpandida} previewHeight="1.5em">
                          <div dangerouslySetInnerHTML={{ __html: formatarDescricao(trilha.Descricao_Trilha) }} />
                        </Collapse>
                      </div>
                    )}

                    {/* Grade de habilidades desta Trilha */}
                    <div className="p-3.5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {nexLevels.map(lvl => renderCardHabilidade(trilha, lvl))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
