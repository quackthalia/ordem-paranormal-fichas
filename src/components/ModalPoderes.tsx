import { Collapse } from './Collapse';
import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useRPG } from '../context/RPGContext';
import { usePoderesFiltrados } from '../hooks/usePoderes';
import { InputOtimizado } from './InputOtimizado';
import { CustomSelect } from './CustomSelect';
import { ToolbarFormato } from './ToolbarFormato';
import { ModalEscolherRitualAprendido } from './ModalEscolherRitualAprendido';
import type { AbaModalPoderes, Poder } from '../types';
import { verificarPreRequisitos, formatarTextoPreRequisitos } from '../utils/preRequisitos';
import type { ContextoPreRequisitos } from '../utils/preRequisitos';
import { sortPorElementoENome } from '../utils/rpgRules';

const PATAMARES_COMBATE = [15, 25, 35, 45, 55, 65, 75, 85, 95];

// ═══════════════════════════════════════
// CORES DOS ELEMENTOS
// ═══════════════════════════════════════
const CORES_ELEMENTOS: Record<string, string> = {
  sangue: '#b31717',
  conhecimento: '#b07902',
  energia: '#af27d9',
  morte: '#000000',
  medo: '#ffffff',
  varia: '#888888',
};

const ELEMENTOS = ['Sangue', 'Conhecimento', 'Energia', 'Morte', 'Varia'];

function obterCorBadge(elemento: string): string {
  return CORES_ELEMENTOS[elemento.toLowerCase()] || '#666';
}

function obterCorTexto(elemento: string): string {
  const e = elemento.toLowerCase();
  if (e === 'medo') return '#000000';
  return '#ffffff';
}

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

/** Card de poder (reutilizado) */
function PoderCard({
  poder,
  ehParanormal,
  paranormalData,
  estaExpandido,
  onToggle,
  onEscolher,
  contextoPrereq,
}: {
  poder: { codigo_poder: number; Nome: string; Descricao: string; PreRequisitos: string; Fonte: string; Pre_Codigo?: number | null; Tipo?: string; Classe?: string | null; Codigo_Regra?: number; };
  ehParanormal: boolean;
  paranormalData?: {
    Elemento?: string;
    Afinidade?: string;
    PreRequisitosAfinidade?: string;
    Pre_Codigo_Afinidade?: number | null;
  };
  estaExpandido: boolean;
  onToggle: () => void;
  onEscolher: (elementoEscolhido?: string, periciaEscolhida?: number) => void;
  contextoPrereq?: ContextoPreRequisitos;
}) {
  const count = contextoPrereq ? contextoPrereq.poderes.filter(p => p.nome === poder.Nome.toLowerCase()).length : 0;
  
  let val = { atende: true, motivo: '' };
  if (contextoPrereq) {
    if (count >= 1 && ehParanormal && paranormalData?.Pre_Codigo_Afinidade) {
      val = verificarPreRequisitos(
        { ...poder, PreRequisitos: paranormalData.PreRequisitosAfinidade || '', Pre_Codigo: paranormalData.Pre_Codigo_Afinidade } as Poder,
        contextoPrereq
      );
    } else {
      val = verificarPreRequisitos(poder as Poder, contextoPrereq);
    }
  }

  const precisaEscolherRitual = poder.Codigo_Regra === 35;
  const rituaisAprendidos = contextoPrereq?.rituaisAprendidos || [];
  
  // Mapeamos os IDs aprendidos para seus respectivos nomes!
  const rituaisAprendidosNomes = rituaisAprendidos.map(ra => {
    const r = (contextoPrereq?.rituais || []).find((rt: any) => rt.Codigo_Ritual === ra.codigo_ritual);
    return ra.customNome || (r ? r.Nome_Ritual : String(ra.codigo_ritual));
  });

  const precisaEscolherElemento = poder.Nome.toLowerCase().includes('elemento') || (poder.Descricao && poder.Descricao.toLowerCase().includes('escolha um elemento')) || poder.Codigo_Regra === 34 || poder.Codigo_Regra === 36;
  const [escolhendoElemento, setEscolhendoElemento] = useState(false);

  const bloqueado = !val.atende || (precisaEscolherRitual && rituaisAprendidos.length === 0);
  const blockMotivo = !val.atende ? val.motivo : (precisaEscolherRitual && rituaisAprendidos.length === 0) ? 'Você não possui nenhum ritual aprendido.' : '';

  const precisaEscolherPericia = poder.Nome.toLowerCase().includes('perícia') || (poder.Descricao && poder.Descricao.toLowerCase().includes('escolha uma perícia'));
  const [escolhendoPericia, setEscolhendoPericia] = useState(false);
  const periciasDisponiveis = contextoPrereq ? Object.entries(contextoPrereq.nomesPericias).map(([id, nome]) => ({ id: Number(id), nome })).sort((a,b) => a.nome.localeCompare(b.nome)) : [];

  return (
    <div className={`bg-zinc-900/40 border border-zinc-800/80 rounded p-3 hover:border-green-500/50 hover:bg-zinc-900/80 transition group flex flex-col`}>
      <div
        onClick={onToggle}
        className="flex cursor-pointer items-start justify-between gap-3 mb-2 min-h-[2.5rem]"
      >
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-zinc-200 group-hover:text-green-400 transition line-clamp-2">{poder.Nome}</span>
            {ehParanormal && paranormalData?.Elemento && (
              <span
                className={`inline-block rounded px-1.5 py-px text-[9px] font-bold uppercase tracking-wider leading-tight ${
                  (() => {
                    const elStr = paranormalData.Elemento!.toLowerCase();
                    if (elStr.includes('medo')) return 'bg-zinc-200/80 text-zinc-950 px-2';
                    if (elStr.includes('sangue')) return 'text-red-500';
                    if (elStr.includes('morte')) return 'bg-black/50 text-white px-2';
                    if (elStr.includes('conhecimento')) return 'text-yellow-500';
                    if (elStr.includes('energia')) return 'text-purple-500';
                    return 'text-zinc-400';
                  })()
                }`}
              >
                {paranormalData.Elemento}
              </span>
            )}
          </div>
            <Collapse isOpen={estaExpandido} previewHeight="4.5em">
              <div 
                className="text-xs text-zinc-400 mt-1 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: formatarDescricao(poder.Descricao) }}
              />
            </Collapse>
            <Collapse isOpen={estaExpandido}>
              {poder.Fonte && (
                <div className="mt-2 text-[0.6rem] uppercase tracking-wider text-zinc-600">
                  Fonte: {poder.Fonte}
                </div>
              )}
            </Collapse>
        </div>
        <button className="text-zinc-500 text-xs mt-1 shrink-0">
          {estaExpandido ? '▲' : '▼'}
        </button>
      </div>

      <Collapse isOpen={estaExpandido}>
        <div className="mt-3 text-left border-t border-zinc-800/50 pt-3">

          {ehParanormal && paranormalData?.Afinidade && (
            <p className="mt-3 text-xs leading-relaxed text-zinc-300">
              <strong className="text-green-400 font-bold">Afinidade:</strong> {paranormalData.Afinidade}
            </p>
          )}

          {poder.PreRequisitos && (
            <div className="mt-3 inline-block rounded bg-amber-400/5 px-3 py-2 text-xs italic text-amber-400">
              <strong>Pré-requisitos:</strong> {contextoPrereq ? formatarTextoPreRequisitos(poder.PreRequisitos, contextoPrereq.nomesPericias) : poder.PreRequisitos}
            </div>
          )}

          {ehParanormal && paranormalData?.PreRequisitosAfinidade && (
            <div className="mt-2 inline-block rounded bg-purple-400/5 px-3 py-2 text-xs italic text-purple-400">
              <strong>Pré-requisitos da Afinidade:</strong> {paranormalData.PreRequisitosAfinidade}
            </div>
          )}


        </div>
      </Collapse>

      <div className="flex flex-wrap items-center gap-2 mt-auto text-[11px] border-t border-zinc-800/50 pt-3 mt-3">
        <div className="ml-auto flex items-center gap-2">
          {escolhendoElemento ? (
            <div className="flex flex-wrap gap-1 items-center bg-zinc-950 p-1.5 rounded border border-zinc-800">
              <span className="text-[0.55rem] text-zinc-500 uppercase font-bold px-1 hidden sm:inline">Elemento:</span>
              {['Sangue', 'Morte', 'Conhecimento', 'Energia'].map(elem => {
                const valElem = contextoPrereq ? verificarPreRequisitos(poder as Poder, contextoPrereq, elem) : { atende: true };
                return (
                  <button
                    key={elem}
                    disabled={!valElem.atende}
                    title={valElem.motivo || ''}
                    onClick={(e) => { e.stopPropagation(); setEscolhendoElemento(false); onEscolher(elem); }}
                    className={`rounded px-1.5 py-0.5 text-[0.55rem] font-bold uppercase transition border ${
                      !valElem.atende 
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'
                        : 'border-zinc-700 hover:scale-105'
                    } ${
                      valElem.atende ? (() => {
                        const elStr = elem.toLowerCase();
                        if (elStr.includes('medo')) return 'bg-zinc-200/80 text-zinc-950 px-2';
                        if (elStr.includes('sangue')) return 'text-red-500 bg-transparent';
                        if (elStr.includes('morte')) return 'bg-black/50 text-white px-2';
                        if (elStr.includes('conhecimento')) return 'text-yellow-500 bg-transparent';
                        if (elStr.includes('energia')) return 'text-purple-500 bg-transparent';
                        return 'text-zinc-400 bg-transparent';
                      })() : ''
                    }`}
                  >
                    {elem}
                  </button>
                );
              })}
              <button
                onClick={(e) => { e.stopPropagation(); setEscolhendoElemento(false); }}
                className="ml-1 rounded px-1 py-0.5 text-[0.6rem] font-bold text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition"
              >
                ✕
              </button>
            </div>
          ) : escolhendoPericia ? (
            <div className="flex flex-wrap gap-1 items-center bg-zinc-950 p-1.5 rounded border border-zinc-800" onClick={e => e.stopPropagation()}>
              <span className="text-[0.55rem] text-zinc-500 uppercase font-bold px-1 hidden sm:inline">Perícia:</span>
              <CustomSelect
  value=""
  onChange={(val) => {
    const cod = Number(val);
    if (cod) {
      setEscolhendoPericia(false);
      onEscolher(undefined, cod);
    }
  }}
  options={[
    { value: '', label: 'Escolher...' },
    ...periciasDisponiveis.map(p => {
      const valPericia = contextoPrereq ? verificarPreRequisitos(poder as Poder, contextoPrereq, undefined, p.id) : { atende: true };
      const isFocoEmPericia = (poder as any).Codigo_Regra === 42;
      const jaFocou = isFocoEmPericia && contextoPrereq ? Object.values(contextoPrereq.poderes).some(pe => pe.codigoRegra === 42 && pe.periciaEscolhidaNome === p.nome) : false;
      const isDisabled = !valPericia.atende || jaFocou;
      return {
        value: String(p.id),
        label: `${p.nome} ${jaFocou ? "(Já Escolhido)" : ""}`.trim(),
        disabled: isDisabled
      };
    })
  ]}
  wrapperClassName="max-w-[120px]"
  className="bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 rounded px-1 py-1"
/>
              <button
                onClick={(e) => { e.stopPropagation(); setEscolhendoPericia(false); }}
                className="ml-1 rounded px-1 py-0.5 text-[0.6rem] font-bold text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              disabled={bloqueado}
              title={blockMotivo || ''}
              onClick={(e) => { 
                e.stopPropagation(); 
                if (precisaEscolherElemento) {
                  setEscolhendoElemento(true);
                } else if (precisaEscolherPericia) {
                  setEscolhendoPericia(true);
                } else {
                  onEscolher(); 
                }
              }}
              className={`px-3 py-1 rounded font-bold text-[10px] uppercase tracking-wider transition-colors ${bloqueado ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-green-700 hover:bg-green-600 text-white active:scale-95'}`}
            >
              Escolher
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export const ModalPoderes: React.FC = () => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const {
    nexModalAberto, setNexModalAberto,
    abaModalPoderes, setAbaModalPoderes,
    classe,
    poderesHook,
    poderesModalExpandidos, setPoderesModalExpandidos,
    nexPoderEditando, setNexPoderEditando,
    nomeEditando, setNomeEditando,
    descricaoEditando,
    afinidadeEditando,
    atributos,
    bonusAtributos,
    afinidadeEscolhida,
    afinidadeAtiva,
    regras,
    periciasHook,
    nex,
    trilhasHook,
    rituaisHook,
    origensHook,
  } = useRPG();

  const contextoPrereq = useMemo(() => {
    const poderesArray: { nome: string; elemento?: string; codigoRegra?: number | null; periciaEscolhidaNome?: string }[] = Object.values(poderesHook.poderesEscolhidos).map(p => ({
      nome: p.nome.toLowerCase(),
      elemento: p.elemento,
      codigoRegra: p.codigoRegra,
      periciaEscolhidaNome: p.periciaEscolhidaNome
    }));
    
    if (poderesHook.poderClasse) {
      poderesArray.push({ nome: poderesHook.poderClasse.Nome.toLowerCase() });
    }

    if (trilhasHook.trilhaSelecionada) {
      const t = trilhasHook.trilhaSelecionada;
      if (nex >= 10 && t.Nome_Habilidade_10) poderesArray.push({ nome: t.Nome_Habilidade_10.toLowerCase() });
      if (nex >= 40 && t.Nome_Habilidade_40) poderesArray.push({ nome: t.Nome_Habilidade_40.toLowerCase() });
      if (nex >= 65 && t.Nome_Habilidade_65) poderesArray.push({ nome: t.Nome_Habilidade_65.toLowerCase() });
      if (nex >= 99 && t.Nome_Habilidade_99) poderesArray.push({ nome: t.Nome_Habilidade_99.toLowerCase() });
    }

    let nexContexto = nex;
    if (typeof nexModalAberto === 'number') {
      if (regras['nex_experiencia'] && nexModalAberto <= 20 && nexModalAberto > 0) {
        nexContexto = nexModalAberto === 20 ? 99 : nexModalAberto * 5;
      } else {
        nexContexto = nexModalAberto;
      }
    }

    return {
      atributos,
      nex: nexContexto,
      pericias: periciasHook.pericias,
      nomesPericias: periciasHook.nomesPericias,
      poderes: poderesArray,
      origem: origensHook.origemSelecionada?.nome_origem,
      grupo_origem: origensHook.origemSelecionada?.Codigo_Grupo || null,
      rituaisAprendidos: rituaisHook.rituaisAprendidos,
      rituais: rituaisHook.rituais,
      regras
    };
  }, [atributos, nex, periciasHook.pericias, periciasHook.nomesPericias, poderesHook.poderesEscolhidos, trilhasHook.trilhaSelecionada, rituaisHook.rituaisAprendidos, rituaisHook.rituais, origensHook.origemSelecionada, regras]);

  const editorRef = useRef<HTMLDivElement>(null);
  const afinidadeRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [subAbaElemento, setSubAbaElemento] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  
  const [ritualModalAbertoPara, setRitualModalAbertoPara] = useState<{
    poder: Poder;
    categoria: 'utilidade' | 'combate' | 'gerais' | 'paranormais' | 'trilha';
  } | null>(null);

  const scrollPositions = useRef<Record<string, number>>({
    classe: 0, combate: 0, gerais: 0, paranormais: 0,
  });

  const {
    listaPoderesUtilidade,
    poderesParanormais,
    escolherPoder,
    editarPoder,
  } = poderesHook;

  const listaFiltradaBase = usePoderesFiltrados(
    listaPoderesUtilidade,
    poderesParanormais || [],
    abaModalPoderes,
    classe,
    poderesHook.poderesEscolhidos,
    atributos.INT + bonusAtributos.INT,
    afinidadeEscolhida,
    afinidadeAtiva
  );

  const listaFiltrada = useMemo(() => {
    let filtrada = listaFiltradaBase.filter((poder: any) => {
      if (abaModalPoderes === 'paranormais') {
        if (subAbaElemento) {
          if (poder.Elemento?.toLowerCase() !== subAbaElemento.toLowerCase()) return false;
        }
      }

      if (busca.trim()) {
        const lower = busca.toLowerCase();
        if (!poder.Nome.toLowerCase().includes(lower)) return false;
      }

      return true;
    });

    if (abaModalPoderes === 'paranormais') {
      return [...filtrada].sort((a: any, b: any) => sortPorElementoENome(a, b, p => p?.Elemento, p => p?.Nome));
    }
    
    return filtrada;
  }, [listaFiltradaBase, abaModalPoderes, subAbaElemento, busca]);

  useEffect(() => { setSubAbaElemento(null); }, [abaModalPoderes]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollPositions.current[abaModalPoderes] || 0;
    }
  }, [abaModalPoderes]);

  const ehCombate = nexModalAberto !== null && PATAMARES_COMBATE.includes(nexModalAberto);

  const abasDisponiveis = useMemo((): [AbaModalPoderes, string][] => {
    if ((nexModalAberto !== null && typeof nexModalAberto === 'number' && nexModalAberto > 1000) || nexModalAberto === 'extra_regra1') {
      return [['paranormais', 'Poderes Paranormais']];
    }

    const base: [AbaModalPoderes, string][] = [
      ['gerais', 'Poderes Gerais'],
    ];
    
    if (!regras['nex_experiencia']) {
      base.push(['paranormais', 'Poderes Paranormais']);
    }

    if (ehCombate) return [['combate', 'Poderes de Combate'], ...base];
    return [['classe', 'Poderes de Utilidade'], ...base];
  }, [ehCombate, regras, nexModalAberto]);

  useEffect(() => {
    if (!abasDisponiveis.some(([aba]) => aba === abaModalPoderes)) {
      setAbaModalPoderes(abasDisponiveis[0][0]);
    }
  }, [abasDisponiveis, abaModalPoderes, setAbaModalPoderes]);

  useEffect(() => {
    if (nexModalAberto === null) {
      setPoderesModalExpandidos([]);
      setBusca('');
      setSubAbaElemento(null);
      setRitualModalAbertoPara(null);
    }
  }, [nexModalAberto, setPoderesModalExpandidos]);

  const handleTabChange = useCallback((aba: AbaModalPoderes) => {
    if (scrollContainerRef.current) {
      scrollPositions.current[abaModalPoderes] = scrollContainerRef.current.scrollTop;
    }
    setAbaModalPoderes(aba);
  }, [abaModalPoderes, setAbaModalPoderes]);

  if (nexPoderEditando !== null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans" onClick={() => setNexPoderEditando(null)}>
        <div className="flex w-full max-w-4xl flex-col gap-4 rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
          <h3 className="font-display border-b border-zinc-800 pb-2.5 text-left text-lg uppercase tracking-wide text-zinc-100">
            EDITAR PODER <span className="text-green-500">({typeof nexPoderEditando === 'number' ? `NEX ${nexPoderEditando}%` : 'PODER EXTRA'})</span>
          </h3>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Nome do Poder</label>
            <InputOtimizado
              value={nomeEditando}
              onChange={setNomeEditando}
              className="rounded border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-zinc-100 outline-none focus:border-green-700"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Descrição</label>
            <div>
              <ToolbarFormato editorRef={editorRef as any} />
              <div
                ref={(el) => {
                  editorRef.current = el;
                  if (el && !el.dataset.initialized) {
                    el.innerHTML = descricaoEditando;
                    el.dataset.initialized = 'true';
                  }
                }}
                contentEditable
                className="min-h-36 overflow-y-auto custom-scrollbar rounded-b border border-zinc-700 bg-zinc-950 p-3 text-left text-sm leading-relaxed text-zinc-100 outline-none focus:border-green-700"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Afinidade</label>
            <div>
              <ToolbarFormato editorRef={afinidadeRef as any} />
              <div
                ref={(el) => {
                  afinidadeRef.current = el;
                  if (el && !el.dataset.initialized) {
                    el.innerHTML = afinidadeEditando;
                    el.dataset.initialized = 'true';
                  }
                }}
                contentEditable
                className="min-h-24 overflow-y-auto custom-scrollbar rounded-b border border-zinc-700 bg-zinc-950 p-3 text-left text-sm leading-relaxed text-zinc-100 outline-none focus:border-green-700"
              />
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-2.5">
            <button
              onClick={() => setNexPoderEditando(null)}
              className="rounded border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:bg-zinc-700"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                const texto = editorRef.current?.innerHTML || '';
                const textoAfinidade = afinidadeRef.current?.innerHTML || '';
                editarPoder(nexPoderEditando, nomeEditando, texto, textoAfinidade);
                setNexPoderEditando(null);
              }}
              className="rounded bg-green-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-600 active:scale-95 uppercase tracking-wider"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans" onClick={() => setNexModalAberto(null)}>
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col border-b border-zinc-800 p-5 pb-4 bg-zinc-900/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg uppercase tracking-wide text-zinc-100 m-0">
              ESCOLHER PODER — <span className="text-green-500">NEX {nexModalAberto && nexModalAberto > 1000 ? nexModalAberto - 1000 : nexModalAberto}%</span>
            </h3>
            <button
              onClick={() => setNexModalAberto(null)}
              className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100 leading-none h-6"
            >
              &times;
            </button>
          </div>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar poder..."
            className="flex-1 rounded border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-green-700 w-full"
          />
        </div>

        <div className="flex border-b border-zinc-800 bg-zinc-950">
          {abasDisponiveis.map(([aba, rotulo]) => (
            <button
              key={aba}
              onClick={() => handleTabChange(aba)}
              className={`min-w-[70px] flex-1 rounded-t px-1 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                abaModalPoderes === aba
                  ? 'border border-b-0 border-green-900 bg-zinc-900 text-zinc-100'
                  : 'border border-transparent text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
              }`}
            >
              {rotulo}
            </button>
          ))}
        </div>

        {abaModalPoderes === 'paranormais' && (
          <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 bg-zinc-900/90 px-4 py-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Elementos:</span>
            <button
              onClick={() => setSubAbaElemento(null)}
              className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
                subAbaElemento === null
                  ? 'bg-green-900/40 text-green-300 border border-green-800'
                  : 'bg-zinc-800/60 text-zinc-500 border border-zinc-700 hover:text-zinc-300'
              }`}
            >
              Todos
            </button>
            {ELEMENTOS.map(elem => {
              const ativo = subAbaElemento === elem;
              return (
                <button
                  key={elem}
                  onClick={() => setSubAbaElemento(elem)}
                  className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition border ${
                    ativo
                      ? (() => {
                          const elStr = elem.toLowerCase();
                          if (elStr.includes('medo')) return 'border-zinc-500 bg-zinc-200/80 text-zinc-950 px-3';
                          if (elStr.includes('sangue')) return 'border-red-900 bg-red-950/20 text-red-500';
                          if (elStr.includes('morte')) return 'border-zinc-700 bg-black/50 text-white px-3';
                          if (elStr.includes('conhecimento')) return 'border-yellow-900 bg-yellow-950/20 text-yellow-500';
                          if (elStr.includes('energia')) return 'border-purple-900 bg-purple-950/20 text-purple-500';
                          return 'border-zinc-600 text-zinc-100';
                        })()
                      : 'border-zinc-700 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {elem}
                </button>
              );
            })}
          </div>
        )}

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {(() => {
            const renderedPoderes = listaFiltrada.map((poder: any) => {
              const estaExpandido = poderesModalExpandidos.includes(poder.codigo_poder);
              const pp = (poderesParanormais || []).find(
                (p: { Nome: string }) => p.Nome === poder.Nome
              );

              return (
                <PoderCard
                  key={poder.codigo_poder}
                  poder={{
                    codigo_poder: poder.codigo_poder,
                    Nome: poder.Nome,
                    Descricao: poder.Descricao,
                    PreRequisitos: poder.PreRequisitos || '',
                    Fonte: (poder as any).Fonte || pp?.Fonte || '',
                    Pre_Codigo: poder.Pre_Codigo,
                    Tipo: poder.Tipo,
                    Classe: poder.Classe,
                    Codigo_Regra: poder.Codigo_Regra,
                  }}
                  contextoPrereq={contextoPrereq}
                  ehParanormal={!!pp}
                  paranormalData={pp ? {
                    Elemento: pp.Elemento,
                    Afinidade: pp.Afinidade,
                    PreRequisitosAfinidade: pp.PreRequisitosAfinidade || undefined,
                    Pre_Codigo_Afinidade: pp.Pre_Codigo_Afinidade,
                  } : undefined}
                  estaExpandido={estaExpandido}
                  onToggle={() => {
                    setPoderesModalExpandidos(prev =>
                      prev.includes(poder.codigo_poder)
                        ? prev.filter((id: number) => id !== poder.codigo_poder)
                        : [...prev, poder.codigo_poder]
                    );
                  }}
                  onEscolher={(elem, periciaId) => {
                    let categoria: 'utilidade' | 'combate' | 'gerais' | 'paranormais' | 'trilha' = 'utilidade';
                    if (abaModalPoderes === 'combate') categoria = 'combate';
                    else if (abaModalPoderes === 'gerais') categoria = 'gerais';
                    
                    const nexEscolhido = nexModalAberto!;
                    const nomePericia = periciaId ? contextoPrereq.nomesPericias[periciaId] : undefined;

                    if (poder.Nome.toLowerCase() === 'aprender ritual') {
                      escolherPoder(nexEscolhido, poder, categoria, elem, nomePericia);
                      window.dispatchEvent(new CustomEvent('abrirModalRituais', { detail: { nex: nexEscolhido } }));
                      setNexModalAberto(null);
                    } else if (poder.Nome.toLowerCase() === 'especialista diletante' || poder.Codigo_Regra === 31 || (poder as any).codigo_regra === 31) {
                      escolherPoder(nexEscolhido, poder, categoria, elem, nomePericia);
                      window.dispatchEvent(new CustomEvent('abrirModalOutraClasse', { detail: { nex: nexEscolhido } }));
                      setNexModalAberto(null);
                    } else if (poder.Nome.toLowerCase().includes('flashback') || poder.Codigo_Regra === 32 || (poder as any).codigo_regra === 32) {
                      escolherPoder(nexEscolhido, poder, categoria, elem, nomePericia);
                      window.dispatchEvent(new Event('abrirModalOutraOrigem'));
                      setNexModalAberto(null);
                    } else if (poder.Codigo_Regra === 35) {
                      setRitualModalAbertoPara({ poder, categoria });
                    } else {
                      escolherPoder(nexEscolhido, poder, categoria, elem, nomePericia);
                      setNexModalAberto(null);
                    }
                  }}
                />
              );
            });

            return (
              <div className="flex flex-col md:flex-row gap-3 items-start">
                <div className="flex md:hidden flex-col gap-3 flex-1 w-full min-w-0">
                  {renderedPoderes}
                </div>
                <div className="hidden md:flex flex-col gap-3 md:w-1/2 flex-1 min-w-0">
                  {renderedPoderes.filter((_, i) => i % 2 === 0)}
                </div>
                <div className="hidden md:flex flex-col gap-3 md:w-1/2 flex-1 min-w-0">
                  {renderedPoderes.filter((_, i) => i % 2 !== 0)}
                </div>
              </div>
            );
          })()}

          {listaFiltrada.length === 0 && (
            <div className="mt-5 text-center italic text-zinc-600 col-span-full">
              Nenhum poder encontrado.
            </div>
          )}
        </div>
      </div>

      {/* Modal de Escolher Ritual Aprendido */}
      {ritualModalAbertoPara && (
        <ModalEscolherRitualAprendido
          isOpen={true}
          onClose={() => setRitualModalAbertoPara(null)}
          onSelect={(ritualNome) => {
            const nexEscolhido = nexModalAberto!;
            escolherPoder(nexEscolhido, ritualModalAbertoPara.poder, ritualModalAbertoPara.categoria, ritualNome, undefined);
            setRitualModalAbertoPara(null);
            setNexModalAberto(null);
          }}
          rituaisNomes={(contextoPrereq?.rituaisAprendidos || []).map((ra: any) => {
            const r = (contextoPrereq?.rituais || []).find((rt: any) => rt.Codigo_Ritual === ra.codigo_ritual);
            return ra.customNome || (r ? r.Nome_Ritual : String(ra.codigo_ritual));
          })}
        />
      )}
    </div>
  );
};