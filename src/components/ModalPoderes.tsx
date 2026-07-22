import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useRPG } from '../context/RPGContext';
import { usePoderesFiltrados } from '../hooks/usePoderes';
import { InputOtimizado } from './InputOtimizado';
import { ToolbarFormato } from './ToolbarFormato';
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
  poder: { codigo_poder: number; Nome: string; Descricao: string; PreRequisitos: string; Fonte: string; Pre_Codigo?: number | null; Tipo?: string; Classe?: string | null; };
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

  // DEBUG PARA PRE REQUISITO SANGUE 2
  if (poder.Nome.includes("Anatomia Insana") || poder.Nome.includes("Sangue Fervente")) {
    console.log("DEBUG PODER:", poder.Nome, "Pre_Codigo:", poder.Pre_Codigo, "Val:", val);
  }

  const bloqueado = !val.atende;

  const precisaEscolherElemento = poder.Nome.toLowerCase().includes('elemento') || (poder.Descricao && poder.Descricao.toLowerCase().includes('escolha um elemento'));
  const [escolhendoElemento, setEscolhendoElemento] = useState(false);

  const precisaEscolherPericia = poder.Nome.toLowerCase().includes('perícia') || (poder.Descricao && poder.Descricao.toLowerCase().includes('escolha uma perícia'));
  const [escolhendoPericia, setEscolhendoPericia] = useState(false);
  const periciasDisponiveis = contextoPrereq ? Object.entries(contextoPrereq.nomesPericias).map(([id, nome]) => ({ id: Number(id), nome })).sort((a,b) => a.nome.localeCompare(b.nome)) : [];

  return (
    <div className="mb-3 overflow-hidden rounded-r border-l-4 border-red-800 bg-zinc-950/60">
      <div
        onClick={onToggle}
        className="flex cursor-pointer items-center justify-between gap-3 bg-zinc-900/80 px-4 py-3 transition hover:bg-zinc-800/80"
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-zinc-100">{poder.Nome}</span>
          {ehParanormal && paranormalData?.Elemento && (
            <span
              className="inline-block rounded px-1.5 py-px text-[9px] font-bold uppercase tracking-wider leading-tight"
              style={{
                backgroundColor: obterCorBadge(paranormalData.Elemento),
                color: obterCorTexto(paranormalData.Elemento),
              }}
            >
              {paranormalData.Elemento}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {escolhendoElemento ? (
            <div className="flex gap-1 items-center bg-zinc-950 p-1 rounded border border-zinc-800">
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
                    }`}
                    style={valElem.atende ? { backgroundColor: obterCorBadge(elem), color: obterCorTexto(elem) } : undefined}
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
            <div className="flex gap-1 items-center bg-zinc-950 p-1 rounded border border-zinc-800" onClick={e => e.stopPropagation()}>
              <span className="text-[0.55rem] text-zinc-500 uppercase font-bold px-1 hidden sm:inline">Perícia:</span>
              <select
                className="bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 rounded px-1 outline-none py-1 max-w-[120px]"
                onChange={(e) => {
                  const cod = Number(e.target.value);
                  if (cod) {
                    setEscolhendoPericia(false);
                    onEscolher(undefined, cod);
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled>Escolher...</option>
                {periciasDisponiveis.map(p => {
                  const valPericia = contextoPrereq ? verificarPreRequisitos(poder as Poder, contextoPrereq, undefined, p.id) : { atende: true };
                  return (
                    <option 
                      key={p.id} 
                      value={p.id} 
                      disabled={!valPericia.atende}
                      style={{ color: !valPericia.atende ? '#52525b' : '#e4e4e7', backgroundColor: !valPericia.atende ? '#18181b' : '#27272a' }}
                      className={!valPericia.atende ? "italic" : ""}
                    >
                      {p.nome}
                    </option>
                  );
                })}
              </select>
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
              title={val.motivo || ''}
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
              className={`rounded px-3.5 py-1.5 text-xs font-bold uppercase transition ${
                bloqueado 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-red-700 text-zinc-100 hover:bg-red-600'
              }`}
            >
              Escolher
            </button>
          )}
          <span className="w-5 text-center text-zinc-600">
            {estaExpandido ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {estaExpandido && (
        <div className="border-t border-zinc-800 px-5 py-4 text-left">
          <div
            className="text-sm leading-relaxed text-zinc-400"
            dangerouslySetInnerHTML={{ __html: formatarDescricao(poder.Descricao) }}
          />

          {ehParanormal && paranormalData?.Afinidade && (
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">
              <strong className="text-zinc-100">Afinidade:</strong> {paranormalData.Afinidade}
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

          {poder.Fonte && (
            <div className="mt-2 text-[0.6rem] uppercase tracking-wider text-zinc-600">
              Fonte: {poder.Fonte}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const ModalPoderes: React.FC = () => {
  const {
    nexModalAberto, setNexModalAberto,
    abaModalPoderes, setAbaModalPoderes,
    classe,
    poderesHook,
    poderesModalExpandidos, setPoderesModalExpandidos,
    nexPoderEditando, setNexPoderEditando,
    nomeEditando, setNomeEditando,
    descricaoEditando,
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
    const poderesArray: { nome: string; elemento?: string }[] = Object.values(poderesHook.poderesEscolhidos).map(p => ({
      nome: p.nome.toLowerCase(),
      elemento: p.elemento
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

    console.log("PODERES NO CONTEXTO:", poderesArray);

    return {
      atributos,
      nex: typeof nexModalAberto === 'number' ? nexModalAberto : nex,
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [subAbaElemento, setSubAbaElemento] = useState<string | null>(null);
  const [afinidadeEditando, setAfinidadeEditando] = useState('');
  const [busca, setBusca] = useState('');

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

  // Filtro por elemento
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
    // Se for um slot de Transcender, só pode pegar poder paranormal
    if ((nexModalAberto !== null && typeof nexModalAberto === 'number' && nexModalAberto > 1000) || nexModalAberto === 'extra_regra1') {
      return [['paranormais', 'Poderes Paranormais']];
    }

    const base: [AbaModalPoderes, string][] = [
      ['gerais', 'Poderes Gerais'],
    ];
    
    // Se a regra nex_experiencia NÃO estiver ativa, permite poderes paranormais nos slots normais
    if (!regras['nex_experiencia']) {
      base.push(['paranormais', 'Poderes Paranormais']);
    }

    if (ehCombate) return [['combate', 'Poderes de Combate'], ...base];
    return [['classe', 'Poderes de Utilidade'], ...base];
  }, [ehCombate, regras, nexModalAberto]);

  useEffect(() => {
    // Se a aba atual não estiver nas abas disponíveis, força para a primeira aba disponível
    if (!abasDisponiveis.some(([aba]) => aba === abaModalPoderes)) {
      setAbaModalPoderes(abasDisponiveis[0][0]);
    }
  }, [abasDisponiveis, abaModalPoderes, setAbaModalPoderes]);

  const handleTabChange = useCallback((aba: AbaModalPoderes) => {
    if (scrollContainerRef.current) {
      scrollPositions.current[abaModalPoderes] = scrollContainerRef.current.scrollTop;
    }
    setAbaModalPoderes(aba);
  }, [abaModalPoderes, setAbaModalPoderes]);

  // ================================================================
  // EDITOR INLINE
  // ================================================================
  if (nexPoderEditando !== null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-5">
        <div className="flex w-full max-w-2xl flex-col gap-4 rounded-lg border border-zinc-700 bg-zinc-900 p-6 shadow-2xl shadow-black/50">
          <h3 className="font-display border-b border-zinc-800 pb-2.5 text-left text-lg uppercase tracking-wide text-zinc-100">
            Editar Poder <span className="text-red-500">({typeof nexPoderEditando === 'number' ? `NEX ${nexPoderEditando}%` : 'Poder Extra'})</span>
          </h3>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Nome do Poder</label>
            <InputOtimizado
              value={nomeEditando}
              onChange={setNomeEditando}
              className="rounded border border-zinc-700 bg-zinc-950 p-2.5 text-zinc-100 outline-none focus:border-red-700"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Afinidade</label>
            <InputOtimizado
              value={afinidadeEditando}
              onChange={setAfinidadeEditando}
              className="rounded border border-zinc-700 bg-zinc-950 p-2.5 text-zinc-100 outline-none focus:border-red-700"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
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
                className="min-h-36 overflow-y-auto rounded-b border border-zinc-700 bg-zinc-950 p-3 text-left text-sm leading-relaxed text-zinc-100 outline-none focus:border-red-700"
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
                editarPoder(nexPoderEditando, nomeEditando, texto, afinidadeEditando);
                setNexPoderEditando(null);
              }}
              className="rounded bg-red-700 px-4 py-2 text-sm font-bold text-zinc-100 transition hover:bg-red-600"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // MODAL PRINCIPAL
  // ================================================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-5">
      <div className="flex h-[75vh] w-full max-w-3xl flex-col rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50">
        {/* CABEÇALHO */}
        <div className="flex flex-col border-b border-zinc-800 p-5 pb-4 bg-zinc-950 rounded-t-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display m-0 text-lg uppercase tracking-wide text-zinc-100">
              Escolher Poder — <span className="text-red-500">NEX {nexModalAberto && nexModalAberto > 1000 ? nexModalAberto - 1000 : nexModalAberto}%</span>
            </h3>
            <button
              onClick={() => setNexModalAberto(null)}
              className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100"
            >
              &times;
            </button>
          </div>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar poder..."
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-red-700"
          />
        </div>

        {/* ABAS PRINCIPAIS */}
        <div className="flex border-b border-zinc-800 bg-zinc-950">
          {abasDisponiveis.map(([aba, rotulo]) => (
            <button
              key={aba}
              onClick={() => handleTabChange(aba)}
              className={`min-w-[70px] flex-1 rounded-t px-1 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                abaModalPoderes === aba
                  ? 'border border-b-0 border-red-900 bg-zinc-900 text-zinc-100'
                  : 'border border-transparent text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
              }`}
            >
              {rotulo}
            </button>
          ))}
        </div>

        {/* SUB-ABAS DE ELEMENTO */}
        {abaModalPoderes === 'paranormais' && (
          <div className="flex flex-wrap gap-1 border-b border-zinc-800 bg-zinc-950/80 px-3 py-2">
            <button
              onClick={() => setSubAbaElemento(null)}
              className={`rounded px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-wider transition ${
                subAbaElemento === null
                  ? 'bg-red-900/40 text-red-300 border border-red-800'
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
                  className={`rounded px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-wider transition border ${
                    ativo
                      ? 'border-zinc-600 text-zinc-100'
                      : 'border-zinc-700 text-zinc-500 hover:text-zinc-300'
                  }`}
                  style={{
                    backgroundColor: ativo ? obterCorBadge(elem) : 'transparent',
                    color: ativo ? obterCorTexto(elem) : undefined,
                  }}
                >
                  {elem}
                </button>
              );
            })}
          </div>
        )}

        {/* LISTA DE PODERES */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-5">
          {listaFiltrada.map((poder: any) => {
            const estaExpandido = poderesModalExpandidos.includes(poder.codigo_poder);
            const pp = (poderesParanormais || []).find(
              (p: { Nome: string }) => p.Nome === poder.Nome
            );

            console.log('🔍 Renderizando poder:', poder.Nome, 'PreRequisitosAfinidade:', pp?.PreRequisitosAfinidade);

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
                  let categoria: 'utilidade' | 'combate' | 'gerais' = 'utilidade';
                  if (abaModalPoderes === 'combate') categoria = 'combate';
                  else if (abaModalPoderes === 'gerais') categoria = 'gerais';
                  
                  const nexEscolhido = nexModalAberto!;
                  const nomePericia = periciaId ? contextoPrereq.nomesPericias[periciaId] : undefined;
                  escolherPoder(nexEscolhido, poder, categoria, elem, nomePericia);
                  setNexModalAberto(null);

                  if (poder.Nome.toLowerCase() === 'aprender ritual') {
                    window.dispatchEvent(new CustomEvent('abrirModalRituais', { detail: { nex: nexEscolhido } }));
                  }
                }}
              />
            );
          })}

          {listaFiltrada.length === 0 && (
            <div className="mt-5 text-center italic text-zinc-600">
              Nenhum poder encontrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};