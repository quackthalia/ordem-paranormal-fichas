import React from 'react';
import { useRPG } from '../../context/RPGContext';
import { InputOtimizado } from '../../components/InputOtimizado';
import type { HabilidadeItem, CategoriaHabilidade } from '../../types';
import {
  calcularBonusAtaqueEspecial,
  calcularBonusPerito,
  calcularBonusEngenhosidade,
  calcularTotalRituais,
  obterLimiteCirculos,
} from '../../utils/rpgRules';

/** 🔥 CORES ATUALIZADAS */
const CORES_ELEMENTOS: Record<string, string> = {
  sangue: '#b31717',
  conhecimento: '#b07902',
  energia: '#af27d9',
  morte: '#000000',
  medo: '#ffffff',
  varia: '#888888',
};

function obterCorBadge(elemento: string): string {
  return CORES_ELEMENTOS[elemento.toLowerCase()] || '#666';
}

function obterCorTexto(elemento: string): string {
  const e = elemento.toLowerCase();
  if (e === 'medo' || e === 'conhecimento') return '#000';
  return '#fff';
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

export const AbasPanel: React.FC = () => {
  const {
    abaDireita, setAbaDireita,
    classe, nex,
    poderesHook,
    origensHook,
    filtroHabilidades, setFiltroHabilidades,
    habilidadesExpandidas, setHabilidadesExpandidas,
    setNexModalAberto,
    setNexPoderEditando, setNomeEditando, setDescricaoEditando,
    setAbaModalPoderes,
    setTipoModalPoderes,
  } = useRPG();

  const { poderClasse, poderesClasse, poderesEscolhidos, poderesParanormais, removerPoder } = poderesHook;
  const { origemSelecionada } = origensHook;

  const poderesParanormaisMap = React.useMemo(() => {
    const map = new Map<string, typeof poderesParanormais[0]>();
    poderesParanormais.forEach(pp => {
      map.set(pp.Nome.toLowerCase(), pp);
    });
    return map;
  }, [poderesParanormais]);

  const extrairNexDoId = (id: string): number | null => {
    const match = id.match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
  };

  const listaHabilidades = React.useMemo(() => {
    const lista: HabilidadeItem[] = [];

    // 1. Origem
    if (origemSelecionada?.Nome_Poder) {
      lista.push({
        id: 'origem_poder',
        nome: origemSelecionada.Nome_Poder,
        descricao: origemSelecionada.Descricao_Poder,
        tipo: 'Origem',
        extra: null,
        subPoder: null,
        categoria: 'origem',
      });
    }

    // 2. Classe
    if (classe === 'Combatente' && poderClasse) {
      lista.push({
        id: 'classe_poder_179',
        nome: poderClasse.Nome,
        descricao: poderClasse.Descricao,
        tipo: 'Classe',
        extra: calcularBonusAtaqueEspecial(nex),
        subPoder: null,
        fonte: poderClasse.Fonte || undefined,
        categoria: 'classe',
      });
    }

    if (classe === 'Especialista') {
      const ecletico = poderesClasse.find(p => p.codigo_poder === 180);
      const perito = poderesClasse.find(p => p.codigo_poder === 181);
      const engenhosidade = poderesClasse.find(p => p.codigo_poder === 182);
      if (ecletico) lista.push({ id: 'classe_poder_180', nome: ecletico.Nome, descricao: ecletico.Descricao, tipo: 'Classe', extra: null, subPoder: (engenhosidade && nex >= 40) ? { nome: engenhosidade.Nome, descricao: engenhosidade.Descricao, extra: calcularBonusEngenhosidade(nex) } : null, fonte: ecletico.Fonte || undefined, categoria: 'classe' });
      if (perito) lista.push({ id: 'classe_poder_181', nome: perito.Nome, descricao: perito.Descricao, tipo: 'Classe', extra: calcularBonusPerito(nex), subPoder: null, fonte: perito.Fonte || undefined, categoria: 'classe' });
    }

    if (classe === 'Ocultista') {
      const escolhido = poderesClasse.find(p => p.codigo_poder === 183);
      if (escolhido) lista.push({ id: 'classe_poder_183', nome: escolhido.Nome, descricao: escolhido.Descricao, tipo: 'Classe', extra: calcularTotalRituais(nex), limiteCirculos: obterLimiteCirculos(nex), fonte: escolhido.Fonte || undefined, categoria: 'classe' });
    }

    // 3. Utilidade (NEX 10,20,30...)
    const patamares = [10, 20, 30, 40, 50, 60, 70, 80, 90, 99];
    patamares.forEach(nivel => {
      if (nex >= nivel) {
        const escolhido = poderesEscolhidos[nivel];
        if (escolhido) {
          const pp = poderesParanormaisMap.get(escolhido.nome.toLowerCase());
          lista.push({
            id: `escolha_nex_${nivel}`,
            nome: escolhido.nome,
            descricao: escolhido.descricao,
            tipo: `NEX ${nivel}%`,
            preRequisitos: escolhido.preRequisitos,
            fonte: escolhido.fonte,
            elemento: pp?.Elemento,
            afinidade: pp?.Afinidade,
            categoria: pp ? 'paranormais' : 'utilidade',
          });
        } else {
          lista.push({ id: `escolha_nex_${nivel}`, nome: 'Escolher Poder de Utilidade', descricao: 'Clique no "+" para abrir a lista e selecionar seu poder.', tipo: `NEX ${nivel}%`, isSlotVazio: true, nexDoSlot: nivel, categoria: 'utilidade' });
        }
      }
    });

    // 4. Combate (NEX 15,25,35...)
    const patamaresCombate = [15, 25, 35, 45, 55, 65, 75, 85, 95];
    patamaresCombate.forEach(nivel => {
      if (nex >= nivel) {
        const escolhido = poderesEscolhidos[nivel];
        if (escolhido) {
          const pp = poderesParanormaisMap.get(escolhido.nome.toLowerCase());
          lista.push({
            id: `escolha_nex_combate_${nivel}`,
            nome: escolhido.nome,
            descricao: escolhido.descricao,
            tipo: `NEX ${nivel}%`,
            preRequisitos: escolhido.preRequisitos,
            fonte: escolhido.fonte,
            elemento: pp?.Elemento,
            afinidade: pp?.Afinidade,
            categoria: pp ? 'paranormais' : 'combate',
          });
        } else {
          lista.push({ id: `escolha_nex_combate_${nivel}`, nome: 'Escolher Poder de Combate', descricao: 'Clique no "+" para abrir a lista e selecionar seu poder de combate.', tipo: `NEX ${nivel}%`, isSlotVazio: true, nexDoSlot: nivel, categoria: 'combate' });
        }
      }
    });

    return lista;
  }, [classe, nex, origemSelecionada, poderClasse, poderesClasse, poderesEscolhidos, poderesParanormaisMap]);

  const habilidadesFiltradas = listaHabilidades.filter(hab =>
    hab.nome.toLowerCase().includes(filtroHabilidades.toLowerCase())
  );

  const ordemCategorias: CategoriaHabilidade[] = ['origem', 'classe', 'utilidade', 'combate', 'paranormais'];
  const rotuloCategoria: Record<CategoriaHabilidade, string> = {
    origem: 'Poder de Origem',
    classe: 'Poderes de Classe',
    utilidade: 'Poderes de Utilidade',
    combate: 'Poderes de Combate',
    paranormais: 'Poderes Paranormais',
  };

  return (
    <div className="flex flex-col rounded-lg border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="mb-5 flex flex-wrap gap-1 border-b-2 border-zinc-800 pb-2.5">
        {(['combate', 'habilidades', 'rituais', 'inventario', 'descricao'] as const).map(aba => (
          <button key={aba} onClick={() => setAbaDireita(aba)}
            className={`min-w-[70px] flex-1 rounded px-1 py-2 text-xs font-bold uppercase tracking-wider transition ${
              abaDireita === aba ? 'border border-red-900 bg-red-950/40 text-zinc-100' : 'border border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {aba === 'inventario' ? 'Inventário' : aba === 'descricao' ? 'Descrição' : aba}
          </button>
        ))}
      </div>

      <div className="mt-2 flex flex-1 flex-col">
        {abaDireita === 'combate' && <div className="mt-5 text-center italic text-zinc-600">Conteúdo de Combate</div>}

        {abaDireita === 'habilidades' && (
          <div className="flex h-full flex-col">
            <div className="mb-5 flex items-center gap-4">
              <InputOtimizado value={filtroHabilidades} onChange={setFiltroHabilidades}
                placeholder="Filtrar habilidades..."
                className="flex-1 border-b border-zinc-700 bg-transparent py-2 text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-red-700"
              />
              <button className="whitespace-nowrap rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-200 transition hover:border-red-800 hover:bg-red-950/40">
                + Adicionar
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-0 overflow-y-auto pr-1">
              {ordemCategorias.map(categoria => {
                const itensDaCategoria = habilidadesFiltradas.filter(h => h.categoria === categoria);
                if (itensDaCategoria.length === 0) return null;

                return (
                  <div key={categoria} className="mb-4">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-zinc-600">{rotuloCategoria[categoria]}</span>
                      <div className="flex-1 border-t border-zinc-800" />
                    </div>

                    <div className="flex flex-col gap-2.5">
                      {itensDaCategoria.map(hab => {
                        const estaExpandida = habilidadesExpandidas.includes(hab.id);

                        return (
                          <div key={hab.id}
                            className={`overflow-hidden rounded-r border-l-4 bg-zinc-950/60 ${
                              hab.isSlotVazio ? 'border-zinc-600 border-dashed' : hab.categoria === 'paranormais' ? 'border-l-0' : 'border-red-800'
                            }`}
                          >
                            {hab.elemento && (
                              <div className="h-0.5 w-full" style={{ backgroundColor: obterCorBadge(hab.elemento) }} />
                            )}

                            <div onClick={() => {
                              if (hab.isSlotVazio) {
                                const tipo = hab.id.includes('combate') ? 'combate' : 'utilidade';
                                setTipoModalPoderes(tipo);
                                setAbaModalPoderes(tipo === 'combate' ? 'combate' : 'classe');
                                setNexModalAberto(hab.nexDoSlot ?? extrairNexDoId(hab.id));
                              } else {
                                setHabilidadesExpandidas(prev =>
                                  prev.includes(hab.id) ? prev.filter(id => id !== hab.id) : [...prev, hab.id]
                                );
                              }
                            }}
                              className="flex cursor-pointer items-center justify-between gap-2 bg-zinc-900/80 px-4 py-3 transition hover:bg-zinc-800/80"
                            >
                              <div className="flex items-center gap-3">
                                <span className={`text-sm font-bold ${hab.isSlotVazio ? 'text-zinc-400' : 'text-zinc-100'}`}>{hab.nome}</span>
                                {hab.extra && <span className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-xs font-bold text-amber-400">{hab.extra}</span>}
                              </div>
                              <div className="flex items-center gap-2.5">
                                <span className="rounded border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[0.65rem] uppercase tracking-wider text-zinc-500">{hab.tipo}</span>
                                <span className="text-xs text-zinc-600">{hab.isSlotVazio ? <strong className="text-lg text-red-600">+</strong> : (estaExpandida ? '▲' : '▼')}</span>
                              </div>
                            </div>

                            {hab.isSlotVazio ? (
                              <div className="border-t border-zinc-800 px-4 py-3 text-left text-sm leading-relaxed text-zinc-500">{hab.descricao}</div>
                            ) : (estaExpandida && (
                              <div className="px-4 py-4 text-left text-sm leading-relaxed text-zinc-400">
                                {/* 🔥 Badge do elemento ACIMA da descrição */}
                                {hab.elemento && (
                                  <div className="mb-3">
                                    <span className="inline-block rounded px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider leading-none"
                                      style={{ backgroundColor: obterCorBadge(hab.elemento), color: obterCorTexto(hab.elemento) }}
                                    >
                                      {hab.elemento}
                                    </span>
                                  </div>
                                )}

                                <div dangerouslySetInnerHTML={{ __html: formatarDescricao(hab.descricao) }} />

                                {/* 🔥 Afinidade: texto simples */}
                                {hab.afinidade && (
                                  <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                                    <strong className="text-zinc-100">Afinidade:</strong> {hab.afinidade}
                                  </p>
                                )}

                                <div className="mt-3 text-[0.6rem] uppercase tracking-wider text-zinc-600">Fonte: {hab.fonte || 'NÃO DEFINIDA'}</div>

                                {hab.subPoder && (
                                  <div className="mt-4 rounded-r border-l-2 border-amber-500 bg-zinc-900/80 p-3">
                                    <div className="mb-1.5 flex items-center justify-between">
                                      <span className="text-sm font-bold text-zinc-100">{hab.subPoder.nome}</span>
                                      {hab.subPoder.extra && <span className="rounded border border-zinc-700 bg-zinc-950 px-1.5 py-0.5 text-xs font-bold text-amber-400">{hab.subPoder.extra}</span>}
                                    </div>
                                    <div className="text-xs text-zinc-400">{hab.subPoder.descricao}</div>
                                  </div>
                                )}

                                {hab.limiteCirculos && (
                                  <div className="mt-4 rounded-r border-l-2 border-zinc-400 bg-zinc-900/80 p-3">
                                    <div className="mb-2 text-sm font-bold text-zinc-100">Rituais:</div>
                                    <div className="flex flex-wrap gap-2">
                                      {([['1° Círculo', hab.limiteCirculos.c1], ['2° Círculo', hab.limiteCirculos.c2], ['3° Círculo', hab.limiteCirculos.c3], ['4° Círculo', hab.limiteCirculos.c4]] as const).map(([rotulo, qtd]) => (
                                        <span key={rotulo} className={`rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs ${qtd > 0 ? 'text-zinc-100' : 'text-zinc-600'}`}>{rotulo}: <strong>{qtd}</strong></span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {hab.preRequisitos && (
                                  <div className="mt-3 inline-block rounded bg-amber-400/5 px-2.5 py-1.5 text-xs italic text-amber-400">
                                    <strong>Pré-requisitos:</strong> {hab.preRequisitos}
                                  </div>
                                )}

                                {hab.id.startsWith('escolha_nex_') && (
                                  <div className="mt-4 flex gap-2.5">
                                    <button onClick={(e) => { e.stopPropagation(); const nivel = extrairNexDoId(hab.id); if (nivel !== null) { setNexPoderEditando(nivel); setNomeEditando(hab.nome); setDescricaoEditando(hab.descricao); } }}
                                      className="flex-1 rounded border border-zinc-700 bg-zinc-800 p-2 text-xs font-bold text-zinc-200 transition hover:bg-zinc-700"
                                    >Editar</button>
                                    <button onClick={(e) => { e.stopPropagation(); const nivel = extrairNexDoId(hab.id); if (nivel !== null) removerPoder(nivel); }}
                                      className="flex-1 rounded border border-red-900 bg-transparent p-2 text-xs font-bold text-red-500 transition hover:bg-red-950/40"
                                    >Remover Poder</button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {habilidadesFiltradas.length === 0 && (
                <div className="mt-5 text-center italic text-zinc-600">Nenhuma habilidade encontrada.</div>
              )}
            </div>
          </div>
        )}

        {abaDireita === 'rituais' && <div className="mt-5 text-center italic text-zinc-600">Conteúdo de Rituais</div>}
        {abaDireita === 'inventario' && <div className="mt-5 text-center italic text-zinc-600">Conteúdo de Inventário</div>}
        {abaDireita === 'descricao' && <div className="mt-5 text-center italic text-zinc-600">Conteúdo de Descrição</div>}
      </div>
    </div>
  );
};