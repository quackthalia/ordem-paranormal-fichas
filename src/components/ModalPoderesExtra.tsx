import React, { useState, useMemo } from 'react';
import type { Poder, PoderParanormal } from '../types';
import { sortPorElementoENome } from '../utils/rpgRules';

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

const CORES_ELEMENTOS: Record<string, string> = {
  sangue: '#b31717',
  conhecimento: '#b07902',
  energia: '#af27d9',
  morte: '#000000',
  medo: '#ffffff',
  varia: '#888888',
};

function obterCorBadge(elemento: string): string {
  return CORES_ELEMENTOS[elemento?.toLowerCase()] || '#666';
}

function obterCorTexto(elemento: string): string {
  const e = elemento?.toLowerCase();
  if (e === 'medo' || e === 'conhecimento') return '#000000';
  return '#ffffff';
}

interface ModalPoderesExtraProps {
  isOpen: boolean;
  onClose: () => void;
  poderesGerais: Poder[];
  poderesParanormais: PoderParanormal[];
  onEscolher: (poder: Poder | PoderParanormal) => void;
}

type MainAba = 'utilidade' | 'combate' | 'gerais' | 'paranormais';
type SubAbaClasse = 'todas' | 'combatente' | 'especialista' | 'ocultista';

export const ModalPoderesExtra: React.FC<ModalPoderesExtraProps> = ({
  isOpen,
  onClose,
  poderesGerais,
  poderesParanormais,
  onEscolher
}) => {
  const [abaPrincipal, setAbaPrincipal] = useState<MainAba>('utilidade');
  const [subAbaClasse, setSubAbaClasse] = useState<SubAbaClasse>('todas');
  const [subAbaElemento, setSubAbaElemento] = useState<string | null>(null);
  const [busca, setBusca] = useState('');

  const [poderesExpandidos, setPoderesExpandidos] = useState<number[]>([]);

  const toggleExpandir = (codigo: number) => {
    setPoderesExpandidos(prev => 
      prev.includes(codigo) ? prev.filter(c => c !== codigo) : [...prev, codigo]
    );
  };

  const listaFiltrada = useMemo(() => {
    if (abaPrincipal === 'paranormais') {
      let lista = [...poderesParanormais].filter(p => {
        if (subAbaElemento && p.Elemento?.toLowerCase() !== subAbaElemento.toLowerCase()) return false;
        if (busca.trim() && !p.Nome.toLowerCase().includes(busca.toLowerCase())) return false;
        return true;
      });
      return lista.sort((a, b) => sortPorElementoENome(a, b, p => p.Elemento, p => p.Nome));
    }

    return poderesGerais
      .filter(p => {
        const classePoder = (p.Classe || '').toLowerCase();
        const tipoPoder = (p.Tipo || '').toLowerCase();

        let show = false;
        if (abaPrincipal === 'utilidade') {
          show = tipoPoder === 'utilidade';
        } else if (abaPrincipal === 'combate') {
          show = tipoPoder === 'combate';
        } else if (abaPrincipal === 'gerais') {
          show = tipoPoder === 'geral' || classePoder === 'geral' || classePoder === 'todos';
        }

        if (!show) return false;

        // Apply class sub-filter for utilidade and combate
        if (abaPrincipal === 'utilidade' || abaPrincipal === 'combate') {
          if (subAbaClasse !== 'todas' && classePoder !== subAbaClasse) {
            return false;
          }
        }

        if (busca.trim()) {
          const lower = busca.toLowerCase();
          if (!p.Nome.toLowerCase().includes(lower)) return false;
        }

        return true;
      })
      .sort((a, b) => a.Nome.localeCompare(b.Nome));
  }, [abaPrincipal, subAbaClasse, subAbaElemento, poderesGerais, poderesParanormais]);

  if (!isOpen) return null;

  const abas: { id: MainAba; label: string }[] = [
    { id: 'utilidade', label: 'Utilidade' },
    { id: 'combate', label: 'Combate' },
    { id: 'gerais', label: 'Gerais' },
    { id: 'paranormais', label: 'Paranormais' },
  ];

  const subAbasClasses: { id: SubAbaClasse; label: string }[] = [
    { id: 'todas', label: 'Todas Classes' },
    { id: 'combatente', label: 'Combatente' },
    { id: 'especialista', label: 'Especialista' },
    { id: 'ocultista', label: 'Ocultista' },
  ];

  const subAbasElementos = ['Sangue', 'Morte', 'Conhecimento', 'Energia', 'Medo'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex flex-col border-b border-zinc-800 p-5 pb-4 bg-zinc-950">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg uppercase tracking-wide text-zinc-100">
              ESCOLHER PODER EXTRA
            </h3>
            <button onClick={onClose} className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100">&times;</button>
          </div>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar poder..."
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-red-700"
          />
        </div>

        {/* Abas */}
        <div className="flex border-b border-zinc-800 bg-zinc-950">
          {abas.map(aba => (
            <button
              key={aba.id}
              onClick={() => setAbaPrincipal(aba.id)}
              className={`min-w-[70px] flex-1 rounded-t px-1 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                abaPrincipal === aba.id
                  ? 'border border-b-0 border-red-900 bg-zinc-900 text-zinc-100'
                  : 'border border-transparent text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
              }`}
            >
              {aba.label}
            </button>
          ))}
        </div>

          {/* Sub Abas */}
          {(abaPrincipal === 'utilidade' || abaPrincipal === 'combate') && (
            <div className="flex flex-wrap gap-1 border-b border-zinc-800 bg-zinc-950/80 px-3 py-2">
              {subAbasClasses.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setSubAbaClasse(sub.id)}
                  className={`rounded px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-wider transition ${
                    subAbaClasse === sub.id
                      ? 'bg-red-900/40 text-red-300 border border-red-800'
                      : 'bg-zinc-800/60 text-zinc-500 border border-zinc-700 hover:text-zinc-300'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}

          {abaPrincipal === 'paranormais' && (
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
              {subAbasElementos.map(elem => {
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

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-5">
          {listaFiltrada.map(poder => {
            const codigo = 'codigo_poder' in poder ? poder.codigo_poder : (poder as Poder).codigo_poder;
            const ehParanormal = abaPrincipal === 'paranormais';
            const estaExpandido = poderesExpandidos.includes(codigo);

            return (
              <div key={codigo} className="mb-3 overflow-hidden rounded-r border-l-4 border-red-800 bg-zinc-950/60">
                <div
                  onClick={() => toggleExpandir(codigo)}
                  className="flex cursor-pointer items-center justify-between gap-3 bg-zinc-900/80 px-4 py-3 transition hover:bg-zinc-800/80"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-100">{poder.Nome}</span>
                    {ehParanormal && 'Elemento' in poder && poder.Elemento && (
                      <span
                        className="inline-block rounded px-1.5 py-px text-[9px] font-bold uppercase tracking-wider leading-tight"
                        style={{
                          backgroundColor: obterCorBadge(poder.Elemento),
                          color: obterCorTexto(poder.Elemento),
                        }}
                      >
                        {poder.Elemento}
                      </span>
                    )}
                    {!ehParanormal && 'Classe' in poder && poder.Classe && (
                      <span className="inline-block rounded bg-zinc-800 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider leading-tight text-zinc-400">
                        {poder.Classe}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEscolher(poder);
                        onClose();
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
                    <div className="text-sm leading-relaxed text-zinc-400" dangerouslySetInnerHTML={{ __html: formatarDescricao(poder.Descricao) }} />
                    
                    {ehParanormal && 'Afinidade' in poder && poder.Afinidade && (
                      <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                        <strong className="text-zinc-100">Afinidade:</strong> {poder.Afinidade}
                      </p>
                    )}

                    {poder.PreRequisitos && (
                      <div className="mt-3 inline-block rounded bg-amber-400/5 px-3 py-2 text-xs italic text-amber-400">
                        <strong>Pré-requisitos:</strong> {poder.PreRequisitos}
                      </div>
                    )}

                    {ehParanormal && 'PreRequisitosAfinidade' in poder && poder.PreRequisitosAfinidade && (
                      <div className="mt-2 inline-block rounded bg-purple-400/5 px-3 py-2 text-xs italic text-purple-400">
                        <strong>Pré-requisitos da Afinidade:</strong> {poder.PreRequisitosAfinidade}
                      </div>
                    )}

                    {'Fonte' in poder && poder.Fonte && (
                      <div className="mt-2 text-[0.6rem] uppercase tracking-wider text-zinc-600">
                        Fonte: {poder.Fonte}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {listaFiltrada.length === 0 && (
            <div className="py-10 text-center text-zinc-500">
              Nenhum poder encontrado nesta categoria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
