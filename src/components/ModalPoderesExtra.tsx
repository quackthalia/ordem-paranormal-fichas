import React, { useState, useMemo } from 'react';
import type { Poder, PoderParanormal, Trilha } from '../types';
import { sortPorElementoENome } from '../utils/rpgRules';
import { useRPG } from '../context/RPGContext';
import { verificarPreRequisitos, formatarTextoPreRequisitos } from '../utils/preRequisitos';

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
  if (e === 'medo') return '#000000';
  return '#ffffff';
}

interface ModalPoderesExtraProps {
  isOpen: boolean;
  onClose: () => void;
  poderesGerais: Poder[];
  poderesParanormais: PoderParanormal[];
  trilhas?: Trilha[];
  onEscolher: (poder: Poder | PoderParanormal, elemento?: string, pericia?: number) => void;
}

type MainAba = 'utilidade' | 'combate' | 'gerais' | 'paranormais' | 'trilhas';
type SubAbaClasse = 'todas' | 'combatente' | 'especialista' | 'ocultista' | 'geral';

export const ModalPoderesExtra: React.FC<ModalPoderesExtraProps> = ({
  isOpen,
  onClose,
  poderesGerais,
  poderesParanormais,
  trilhas = [],
  onEscolher
}) => {
  const [abaPrincipal, setAbaPrincipal] = useState<MainAba>('utilidade');
  const [subAbaClasse, setSubAbaClasse] = useState<SubAbaClasse>('todas');
  const [subAbaElemento, setSubAbaElemento] = useState<string | null>(null);
  const [busca, setBusca] = useState('');

  const { nex, atributos, periciasHook, trilhasHook, poderesHook, rituaisHook, origensHook } = useRPG();
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

    return {
      atributos,
      nex,
      pericias: periciasHook.pericias,
      nomesPericias: periciasHook.nomesPericias,
      poderes: poderesArray,
      origem: origensHook.origemSelecionada?.nome_origem,
      rituaisAprendidos: rituaisHook.rituaisAprendidos,
      rituais: rituaisHook.rituais
    };
  }, [atributos, nex, periciasHook.pericias, periciasHook.nomesPericias, poderesHook.poderesEscolhidos, trilhasHook.trilhaSelecionada, rituaisHook.rituaisAprendidos, rituaisHook.rituais, origensHook.origemSelecionada]);

  const [poderesExpandidos, setPoderesExpandidos] = useState<number[]>([]);
  const [escolhendoElementoId, setEscolhendoElementoId] = useState<number | null>(null);
  const [escolhendoPericiaId, setEscolhendoPericiaId] = useState<number | null>(null);

  const periciasDisponiveis = useMemo(() => {
    return Object.entries(contextoPrereq.nomesPericias)
      .map(([id, nome]) => ({ id: Number(id), nome }))
      .sort((a,b) => a.nome.localeCompare(b.nome));
  }, [contextoPrereq.nomesPericias]);

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

    if (abaPrincipal === 'trilhas') return []; // Handled separately

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

  const trilhasFiltradas = useMemo(() => {
    return trilhas
      .filter(t => {
        const classeTrilha = (t.Classe_Trilha || '').toLowerCase();
        if (subAbaClasse !== 'todas') {
          // Para "geral", verifica se a classe contém 'geral' ou 'todas'
          if (subAbaClasse === 'geral') {
            if (classeTrilha !== 'geral' && classeTrilha !== 'todas' && classeTrilha !== 'todos') return false;
          } else {
            if (classeTrilha !== subAbaClasse) return false;
          }
        }
        
        if (busca.trim()) {
          const lower = busca.toLowerCase();
          if (!t.Nome_Trilha.toLowerCase().includes(lower)) return false;
        }
        return true;
      })
      .sort((a, b) => a.Nome_Trilha.localeCompare(b.Nome_Trilha));
  }, [subAbaClasse, busca, trilhas]);

  if (!isOpen) return null;

  const abas: { id: MainAba; label: string }[] = [
    { id: 'utilidade', label: 'Utilidade' },
    { id: 'combate', label: 'Combate' },
    { id: 'gerais', label: 'Gerais' },
    { id: 'trilhas', label: 'Trilhas' },
    { id: 'paranormais', label: 'Paranormais' },
  ];

  const subAbasClasses: { id: SubAbaClasse; label: string }[] = [
    { id: 'todas', label: 'Todas Classes' },
    { id: 'combatente', label: 'Combatente' },
    { id: 'especialista', label: 'Especialista' },
    { id: 'ocultista', label: 'Ocultista' },
    { id: 'geral', label: 'Gerais' },
  ];

  const subAbasElementos = ['Sangue', 'Morte', 'Conhecimento', 'Energia', 'Medo', 'Varia'];

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
          {(abaPrincipal === 'utilidade' || abaPrincipal === 'combate' || abaPrincipal === 'trilhas') && (
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
          {abaPrincipal === 'trilhas' && trilhasFiltradas.map(trilha => {
            const codigo = trilha.Codigo_Trilha;
            const estaExpandido = poderesExpandidos.includes(codigo);
            return (
              <div key={codigo} className="mb-3 overflow-hidden rounded-r border-l-4 border-zinc-600 bg-zinc-950/60">
                <div
                  onClick={() => toggleExpandir(codigo)}
                  className="flex cursor-pointer items-center justify-between gap-3 bg-zinc-900/80 px-4 py-3 transition hover:bg-zinc-800/80"
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-bold text-zinc-100">{trilha.Nome_Trilha}</span>
                    <span className="inline-block rounded bg-zinc-800 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider leading-tight text-zinc-400">
                      {trilha.Classe_Trilha}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Adicionar a trilha inteira (4 poderes)
                        [10, 40, 65, 99].forEach(nex => {
                          onEscolher({
                            codigo_poder: Date.now() + nex,
                            Nome: `${trilha.Nome_Trilha} - ${(trilha as any)[`Nome_Habilidade_${nex}`]}`,
                            Descricao: (trilha as any)[`Descricao_Habilidade_${nex}`],
                            Tipo: 'Trilha',
                            Classe: trilha.Classe_Trilha,
                            Fonte: trilha.Fonte_Trilha,
                          } as Poder);
                        });
                        onClose();
                      }}
                      className="rounded bg-zinc-700 px-3.5 py-1.5 text-[0.65rem] font-bold uppercase text-zinc-100 transition hover:bg-zinc-600"
                    >
                      Escolher Trilha Completa
                    </button>
                    <span className="w-5 text-center text-zinc-600">
                      {estaExpandido ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {estaExpandido && (
                  <div className="border-t border-zinc-800 px-5 py-4 text-left">
                    <div className="mb-4 text-sm leading-relaxed text-zinc-400" dangerouslySetInnerHTML={{ __html: formatarDescricao(trilha.Descricao_Trilha) }} />
                    
                    {[10, 40, 65, 99].map(nexLvl => {
                      const habNameKey = `Nome_Habilidade_${nexLvl}` as keyof typeof trilha;
                      const habDescKey = `Descricao_Habilidade_${nexLvl}` as keyof typeof trilha;
                      const nomeHab = trilha[habNameKey] as string;
                      const descHab = trilha[habDescKey] as string;
                      
                      if (!nomeHab) return null;

                      return (
                        <div key={nexLvl} className="mb-2 rounded border border-zinc-800 bg-zinc-900/40 p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-bold text-zinc-300">
                              NEX {nexLvl}% - <span className="text-zinc-400">{nomeHab}</span>
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEscolher({
                                  codigo_poder: Date.now() + nexLvl,
                                  Nome: `${trilha.Nome_Trilha} - ${nomeHab}`,
                                  Descricao: descHab,
                                  Tipo: 'Trilha',
                                  Classe: trilha.Classe_Trilha,
                                  Fonte: trilha.Fonte_Trilha,
                                } as Poder);
                                onClose();
                              }}
                              className="rounded bg-red-900/60 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-red-200 transition hover:bg-red-800/80"
                            >
                              Escolher
                            </button>
                          </div>
                          <div className="text-xs leading-relaxed text-zinc-500" dangerouslySetInnerHTML={{ __html: formatarDescricao(descHab) }} />
                        </div>
                      );
                    })}

                    {trilha.Especial_Trilha && (
                      <div className="mt-3 inline-block rounded bg-purple-400/5 px-3 py-2 text-xs italic text-purple-400">
                        <strong>Especial:</strong> {trilha.Especial_Trilha}
                      </div>
                    )}

                    {trilha.Fonte_Trilha && (
                      <div className="mt-2 text-[0.6rem] uppercase tracking-wider text-zinc-600">
                        Fonte: {trilha.Fonte_Trilha}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {abaPrincipal !== 'trilhas' && listaFiltrada.map(poder => {
            const codigo = 'codigo_poder' in poder ? poder.codigo_poder : (poder as Poder).codigo_poder;
            const ehParanormal = abaPrincipal === 'paranormais';
            const estaExpandido = poderesExpandidos.includes(codigo);
            const val = verificarPreRequisitos(poder as Poder, contextoPrereq);

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
                    {escolhendoElementoId === codigo ? (
                      <div className="flex gap-1 items-center bg-zinc-950 p-1 rounded border border-zinc-800">
                        <span className="text-[0.55rem] text-zinc-500 uppercase font-bold px-1 hidden sm:inline">Elemento:</span>
                        {['Sangue', 'Morte', 'Conhecimento', 'Energia'].map(elem => {
                          const valElem = verificarPreRequisitos(poder as Poder, contextoPrereq, elem);
                          return (
                            <button
                              key={elem}
                              title={valElem.motivo || ''}
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setEscolhendoElementoId(null); 
                                onEscolher(poder, elem); 
                                onClose(); 
                              }}
                              className={`rounded px-1.5 py-0.5 text-[0.55rem] font-bold uppercase transition border ${
                                !valElem.atende 
                                  ? 'bg-zinc-900 border-red-900/50 text-red-500 hover:bg-red-900/20' // Adição livre com warning
                                  : 'border-zinc-700 hover:scale-105'
                              }`}
                              style={valElem.atende ? { backgroundColor: obterCorBadge(elem), color: obterCorTexto(elem) } : undefined}
                            >
                              {elem}
                            </button>
                          );
                        })}
                        <button
                          onClick={(e) => { e.stopPropagation(); setEscolhendoElementoId(null); }}
                          className="ml-1 rounded px-1 py-0.5 text-[0.6rem] font-bold text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition"
                        >
                          ✕
                        </button>
                      </div>
                    ) : escolhendoPericiaId === codigo ? (
                      <div className="flex gap-1 items-center bg-zinc-950 p-1 rounded border border-zinc-800" onClick={e => e.stopPropagation()}>
                        <span className="text-[0.55rem] text-zinc-500 uppercase font-bold px-1 hidden sm:inline">Perícia:</span>
                        <select
                          className="bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 rounded px-1 outline-none py-1 max-w-[120px]"
                          onChange={(e) => {
                            const cod = Number(e.target.value);
                            if (cod) {
                              setEscolhendoPericiaId(null);
                              onEscolher(poder, undefined, cod);
                              onClose();
                            }
                          }}
                          defaultValue=""
                        >
                          <option value="" disabled>Escolher...</option>
                          {periciasDisponiveis.map(p => {
                            const valPericia = verificarPreRequisitos(poder as Poder, contextoPrereq, undefined, p.id);
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
                          onClick={(e) => { e.stopPropagation(); setEscolhendoPericiaId(null); }}
                          className="ml-1 rounded px-1 py-0.5 text-[0.6rem] font-bold text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const precisaElemento = poder.Nome.toLowerCase().includes('elemento') || ((poder as any).Descricao && (poder as any).Descricao.toLowerCase().includes('escolha um elemento'));
                          const precisaPericia = poder.Nome.toLowerCase().includes('perícia') || ((poder as any).Descricao && (poder as any).Descricao.toLowerCase().includes('escolha uma perícia'));
                          
                          if (precisaElemento) {
                            setEscolhendoElementoId(codigo);
                          } else if (precisaPericia) {
                            setEscolhendoPericiaId(codigo);
                          } else {
                            onEscolher(poder);
                            onClose();
                          }
                        }}
                        className="rounded bg-red-700 px-3.5 py-1.5 text-xs font-bold uppercase text-zinc-100 transition hover:bg-red-600"
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
                    <div className="text-sm leading-relaxed text-zinc-400" dangerouslySetInnerHTML={{ __html: formatarDescricao(poder.Descricao) }} />
                    
                    {ehParanormal && 'Afinidade' in poder && poder.Afinidade && (
                      <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                        <strong className="text-zinc-100">Afinidade:</strong> {poder.Afinidade}
                      </p>
                    )}

                    {poder.PreRequisitos && (
                      <div className="mt-3 inline-block rounded bg-amber-400/5 px-3 py-2 text-xs italic text-amber-400">
                        <strong>Pré-requisitos:</strong> {formatarTextoPreRequisitos(poder.PreRequisitos, contextoPrereq.nomesPericias)}
                      </div>
                    )}
                    
                    {!val.atende && val.motivo && (
                      <div className="mt-2 block rounded bg-red-900/20 px-3 py-2 text-xs italic text-red-400">
                        <strong>Aviso de Requisitos:</strong> Oficialmente requer {val.motivo} (Adição livre)
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
          
          {abaPrincipal !== 'trilhas' && listaFiltrada.length === 0 && (
            <div className="py-10 text-center text-zinc-500">
              Nenhum poder encontrado nesta categoria.
            </div>
          )}
          
          {abaPrincipal === 'trilhas' && trilhasFiltradas.length === 0 && (
            <div className="py-10 text-center text-zinc-500">
              Nenhuma trilha encontrada nesta categoria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
