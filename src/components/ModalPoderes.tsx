import React, { useRef, useMemo, useEffect } from 'react';
import { useRPG } from '../context/RPGContext';
import { usePoderesFiltrados } from '../hooks/usePoderes';
import { InputOtimizado } from './InputOtimizado';
import type { AbaModalPoderes } from '../types';

/** Patamares de Combate (NEX ímpar a partir de 15) */
const PATAMARES_COMBATE = [15, 25, 35, 45, 55, 65, 75, 85, 95];

// ============================================================
// 🔥 FUNÇÃO DE FORMATAÇÃO — quebras de linha + markdown
// ============================================================
function formatarDescricao(texto: string): string {
  if (!texto) return '';

  let resultado = texto;

  // Se NÃO parece já ser HTML (não tem tags), aplicar regras
  if (!resultado.includes('<') && !resultado.includes('&')) {
    // Escapar HTML básico
    resultado = resultado
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 🔥 Negrito: *palavra*
    resultado = resultado.replace(/\*(.*?)\*/g, '<strong>$1</strong>');

    // 🔥 Itálico: _palavra_
    resultado = resultado.replace(/_(.*?)_/g, '<em>$1</em>');
  }

  // 🔥 Quebras de linha
  resultado = resultado.replace(/\n/g, '<br />');

  return resultado;
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
  } = useRPG();

  const editorRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 🔥 Scroll position salvo por aba
  const scrollPositions = useRef<Record<string, number>>({
    classe: 0,
    combate: 0,
    gerais: 0,
  });

  const { listaPoderesUtilidade, escolherPoder, editarPoder } = poderesHook;
  const listaFiltrada = usePoderesFiltrados(listaPoderesUtilidade, abaModalPoderes, classe);

  // 🔥 Restaura scroll da aba atual depois que renderiza
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollPositions.current[abaModalPoderes] || 0;
    }
  }, [abaModalPoderes]);

  // DESCOBRE se o modal atual é de Combate ou Utilidade pelo NEX
  const ehCombate = nexModalAberto !== null && PATAMARES_COMBATE.includes(nexModalAberto);

  // ABAS FIXAS
  const abasDisponiveis = useMemo((): [AbaModalPoderes, string][] => {
    if (ehCombate) {
      return [
        ['combate', 'Poderes de Combate'],
        ['gerais', 'Poderes Gerais'],
      ];
    }
    return [
      ['classe', 'Poderes de Utilidade'],
      ['gerais', 'Poderes Gerais'],
    ];
  }, [ehCombate]);

  // 🔥 Handler de troca de aba com salvamento de scroll
  const handleTabChange = (aba: AbaModalPoderes) => {
    if (scrollContainerRef.current) {
      scrollPositions.current[abaModalPoderes] = scrollContainerRef.current.scrollTop;
    }
    setAbaModalPoderes(aba);
  };

  // ====== EDITOR ======
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
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Descrição</label>
            <div className="flex gap-1.5 rounded-t border border-b-0 border-zinc-700 bg-zinc-950 p-1.5">
              <button
                type="button"
                onClick={() => document.execCommand('bold', false)}
                className="h-8 w-8 rounded border border-zinc-700 bg-zinc-800 text-sm text-zinc-100 transition hover:bg-zinc-700"
                title="Negrito"
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                onClick={() => document.execCommand('italic', false)}
                className="h-8 w-8 rounded border border-zinc-700 bg-zinc-800 text-sm text-zinc-100 transition hover:bg-zinc-700"
                title="Itálico"
              >
                <em>I</em>
              </button>
            </div>
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
                editarPoder(nexPoderEditando, nomeEditando, texto);
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

  // ====== MODAL DE ESCOLHA ======
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-5">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50">
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between border-b border-zinc-800 p-5">
          <h3 className="font-display m-0 text-lg uppercase tracking-wide text-zinc-100">
            Escolher Poder — <span className="text-red-500">NEX {nexModalAberto}%</span>
          </h3>
          <button
            onClick={() => setNexModalAberto(null)}
            className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100"
            title="Fechar"
          >
            &times;
          </button>
        </div>

        {/* ABAS — totalmente estáveis */}
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

        {/* 🔥 LISTA DE PODERES — ref pra scroll + scroll independente por aba */}
        <div
          ref={scrollContainerRef}
          id="caixa-scroll-poderes"
          className="flex-1 overflow-y-auto p-5"
        >
          {listaFiltrada.map(poder => {
            const estaExpandido = poderesModalExpandidos.includes(poder.codigo_poder);

            return (
              <div
                key={poder.codigo_poder}
                className="mb-3 overflow-hidden rounded-r border-l-4 border-red-800 bg-zinc-950/60"
              >
                <div
                  onClick={() => {
                    setPoderesModalExpandidos(prev =>
                      prev.includes(poder.codigo_poder)
                        ? prev.filter(id => id !== poder.codigo_poder)
                        : [...prev, poder.codigo_poder]
                    );
                  }}
                  className="flex cursor-pointer items-center justify-between gap-3 bg-zinc-900/80 px-4 py-3 transition hover:bg-zinc-800/80"
                >
                  <span className="flex-1 font-bold text-zinc-100">{poder.Nome}</span>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        escolherPoder(nexModalAberto!, poder);
                        setNexModalAberto(null);
                      }}
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
                    {/* 🔥 DESCRIÇÃO FORMATADA — quebras de linha + negrito/itálico */}
                    <div
                      className="text-sm leading-relaxed text-zinc-400"
                      dangerouslySetInnerHTML={{ __html: formatarDescricao(poder.Descricao) }}
                    />
                    {poder.PreRequisitos && (
                      <div className="mt-3 inline-block rounded bg-amber-400/5 px-3 py-2 text-xs italic text-amber-400">
                        <strong>Pré-requisitos:</strong> {poder.PreRequisitos}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {listaFiltrada.length === 0 && (
            <div className="mt-5 text-center italic text-zinc-600">
              Nenhum poder encontrado nesta categoria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};