import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useRPG } from '../context/RPGContext';
import { usePoderesFiltrados } from '../hooks/usePoderes';
import { InputOtimizado } from './InputOtimizado';
import type { AbaModalPoderes } from '../types';
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
  if (e === 'medo' || e === 'conhecimento') return '#000000';
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
}: {
  poder: { codigo_poder: number; Nome: string; Descricao: string; PreRequisitos: string; Fonte: string };
  ehParanormal: boolean;
  paranormalData?: {
    Elemento?: string;
    Afinidade?: string;
    PreRequisitosAfinidade?: string;
  };
  estaExpandido: boolean;
  onToggle: () => void;
  onEscolher: () => void;
}) {
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
          <button
            onClick={(e) => { e.stopPropagation(); onEscolher(); }}
            className="rounded bg-red-700 px-3.5 py-1.5 text-xs font-bold uppercase text-zinc-100 transition hover:bg-red-600"
          >
            Escolher
          </button>
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
              <strong>Pré-requisitos:</strong> {poder.PreRequisitos}
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
  } = useRPG();

  const editorRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [subAbaElemento, setSubAbaElemento] = useState<string | null>(null);
  const [afinidadeEditando, setAfinidadeEditando] = useState('');

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
    atributos.INT + bonusAtributos.INT
  );

  // Filtro por elemento
  const listaFiltrada = useMemo(() => {
    let filtrada = listaFiltradaBase;
    if (abaModalPoderes === 'paranormais' && subAbaElemento) {
      filtrada = filtrada.filter((p: any) => {
        const el = (p.Elemento || '').toLowerCase();
        return el === subAbaElemento.toLowerCase();
      });
    }

    if (abaModalPoderes === 'paranormais') {
      return [...filtrada].sort((a: any, b: any) => sortPorElementoENome(a, b, p => p?.Elemento, p => p?.Nome));
    }
    
    return filtrada;
  }, [listaFiltradaBase, abaModalPoderes, subAbaElemento]);

  useEffect(() => { setSubAbaElemento(null); }, [abaModalPoderes]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollPositions.current[abaModalPoderes] || 0;
    }
  }, [abaModalPoderes]);

  const ehCombate = nexModalAberto !== null && PATAMARES_COMBATE.includes(nexModalAberto);

  const abasDisponiveis = useMemo((): [AbaModalPoderes, string][] => {
    const base: [AbaModalPoderes, string][] = [
      ['gerais', 'Poderes Gerais'],
      ['paranormais', 'Poderes Paranormais'],
    ];
    if (ehCombate) return [['combate', 'Poderes de Combate'], ...base];
    return [['classe', 'Poderes de Utilidade'], ...base];
  }, [ehCombate]);

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
            Editar Poder <span className="text-red-500">(NEX {nexPoderEditando}%)</span>
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
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Descrição</label>
            <div
              ref={(el) => {
                editorRef.current = el;
                if (el && !el.dataset.initialized) {
                  el.innerHTML = descricaoEditando;
                  el.dataset.initialized = 'true';
                }
              }}
              contentEditable
              className="min-h-36 overflow-y-auto rounded border border-zinc-700 bg-zinc-950 p-3 text-left text-sm leading-relaxed text-zinc-100 outline-none focus:border-red-700"
            />
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
        <div className="flex items-center justify-between border-b border-zinc-800 p-5">
          <h3 className="font-display m-0 text-lg uppercase tracking-wide text-zinc-100">
            Escolher Poder — <span className="text-red-500">NEX {nexModalAberto}%</span>
          </h3>
          <button
            onClick={() => setNexModalAberto(null)}
            className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100"
          >
            &times;
          </button>
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
                }}
                ehParanormal={!!pp}
                paranormalData={pp ? {
                  Elemento: pp.Elemento,
                  Afinidade: pp.Afinidade,
                  PreRequisitosAfinidade: pp.PreRequisitosAfinidade || undefined,
                } : undefined}
                estaExpandido={estaExpandido}
                onToggle={() => {
                  setPoderesModalExpandidos(prev =>
                    prev.includes(poder.codigo_poder)
                      ? prev.filter((id: number) => id !== poder.codigo_poder)
                      : [...prev, poder.codigo_poder]
                  );
                }}
                onEscolher={() => {
                  let categoria: 'utilidade' | 'combate' | 'gerais' = 'utilidade';
                  if (abaModalPoderes === 'combate') categoria = 'combate';
                  else if (abaModalPoderes === 'gerais') categoria = 'gerais';
                  
                  const nexEscolhido = nexModalAberto!;
                  escolherPoder(nexEscolhido, poder, categoria);
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