import React from 'react';
import { useRPG } from '../../context/RPGContext';
import { InputOtimizado } from '../../components/InputOtimizado';
import type { HabilidadeItem } from '../../types';
import {
  calcularBonusAtaqueEspecial,
  calcularBonusPerito,
  calcularBonusEngenhosidade,
  calcularTotalRituais,
  obterLimiteCirculos,
} from '../../utils/rpgRules';

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
  } = useRPG();

  const { poderClasse, poderesClasse, poderesEscolhidos, removerPoder } = poderesHook;
  const { origemSelecionada } = origensHook;

  // Monta a lista de habilidades
  const listaHabilidades = React.useMemo(() => {
    const lista: HabilidadeItem[] = [];

    // 1. Poder da Origem
    if (origemSelecionada?.Nome_Poder) {
      lista.push({
        id: 'origem_poder',
        nome: origemSelecionada.Nome_Poder,
        descricao: origemSelecionada.Descricao_Poder,
        tipo: 'Origem',
        extra: null,
        subPoder: null,
      });
    }

    // 2. Poderes de Classe
    if (classe === 'Combatente') {
      const atkEspecial = poderClasse;
      if (atkEspecial) {
        lista.push({
          id: 'classe_poder_179',
          nome: atkEspecial.Nome,
          descricao: atkEspecial.Descricao,
          tipo: 'Classe',
          extra: calcularBonusAtaqueEspecial(nex),
          subPoder: null,
        });
      }
    }

    if (classe === 'Especialista') {
      const ecletico = poderesClasse.find(p => p.codigo_poder === 180);
      const perito = poderesClasse.find(p => p.codigo_poder === 181);
      const engenhosidade = poderesClasse.find(p => p.codigo_poder === 182);

      if (ecletico) {
        lista.push({
          id: 'classe_poder_180',
          nome: ecletico.Nome,
          descricao: ecletico.Descricao,
          tipo: 'Classe',
          extra: null,
          subPoder: (engenhosidade && nex >= 40) ? {
            nome: engenhosidade.Nome,
            descricao: engenhosidade.Descricao,
            extra: calcularBonusEngenhosidade(nex),
          } : null,
        });
      }

      if (perito) {
        lista.push({
          id: 'classe_poder_181',
          nome: perito.Nome,
          descricao: perito.Descricao,
          tipo: 'Classe',
          extra: calcularBonusPerito(nex),
          subPoder: null,
        });
      }
    }

    if (classe === 'Ocultista') {
      const escolhido = poderesClasse.find(p => p.codigo_poder === 183);
      if (escolhido) {
        lista.push({
          id: 'classe_poder_183',
          nome: escolhido.Nome,
          descricao: escolhido.Descricao,
          tipo: 'Classe',
          extra: calcularTotalRituais(nex),
          limiteCirculos: obterLimiteCirculos(nex),
        });
      }
    }

    // 3. Slots de poder por NEX
    const patamares = [10, 20, 30, 40, 50, 60, 70, 80, 90, 99];
    patamares.forEach(nivel => {
      if (nex >= nivel) {
        const escolhido = poderesEscolhidos[nivel];
        if (escolhido) {
          lista.push({
            id: `escolha_nex_${nivel}`,
            nome: escolhido.nome,
            descricao: escolhido.descricao,
            tipo: `NEX ${nivel}%`,
            preRequisitos: escolhido.preRequisitos,
          });
        } else {
          lista.push({
            id: `escolha_nex_${nivel}`,
            nome: 'Escolher Poder de Utilidade',
            descricao: 'Clique no "+" para abrir a lista e selecionar seu poder.',
            tipo: `NEX ${nivel}%`,
            isSlotVazio: true,
            nexDoSlot: nivel,
          });
        }
      }
    });

    return lista;
  }, [classe, nex, origemSelecionada, poderClasse, poderesClasse, poderesEscolhidos]);

  // Filtro
  const habilidadesFiltradas = listaHabilidades.filter(hab =>
    hab.nome.toLowerCase().includes(filtroHabilidades.toLowerCase())
  );

  return (
    <div className="flex flex-col rounded-lg border border-zinc-800 bg-zinc-900/60 p-5">
      {/* BOTÕES DAS ABAS */}
      <div className="mb-5 flex flex-wrap gap-1 border-b-2 border-zinc-800 pb-2.5">
        {(['combate', 'habilidades', 'rituais', 'inventario', 'descricao'] as const).map(aba => (
          <button
            key={aba}
            onClick={() => setAbaDireita(aba)}
            className={`min-w-[70px] flex-1 rounded px-1 py-2 text-xs font-bold uppercase tracking-wider transition ${
              abaDireita === aba
                ? 'border border-red-900 bg-red-950/40 text-zinc-100'
                : 'border border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {aba === 'inventario' ? 'Inventário' : aba === 'descricao' ? 'Descrição' : aba}
          </button>
        ))}
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="mt-2 flex flex-1 flex-col">
        {abaDireita === 'combate' && (
          <div className="mt-5 text-center italic text-zinc-600">Conteúdo de Combate</div>
        )}

        {abaDireita === 'habilidades' && (
          <div className="flex h-full flex-col">
            {/* TOPO: Filtro + Botão Adicionar */}
            <div className="mb-5 flex items-center gap-4">
              <InputOtimizado
                value={filtroHabilidades}
                onChange={setFiltroHabilidades}
                placeholder="Filtrar habilidades..."
                className="flex-1 border-b border-zinc-700 bg-transparent py-2 text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-red-700"
              />
              <button className="whitespace-nowrap rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-200 transition hover:border-red-800 hover:bg-red-950/40">
                + Adicionar
              </button>
            </div>

            {/* LISTA DE HABILIDADES */}
            <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto pr-1">
              {habilidadesFiltradas.length > 0 ? (
                habilidadesFiltradas.map(hab => {
                  const estaExpandida = habilidadesExpandidas.includes(hab.id);

                  return (
                    <div
                      key={hab.id}
                      className={`overflow-hidden rounded-r border-l-4 bg-zinc-950/60 ${
                        hab.isSlotVazio ? 'border-zinc-600 border-dashed' : 'border-red-800'
                      }`}
                    >
                      {/* CABEÇALHO */}
                      <div
                        onClick={() => {
                          if (hab.isSlotVazio) {
                            setNexModalAberto(hab.nexDoSlot ?? null);
                          } else {
                            setHabilidadesExpandidas(prev =>
                              prev.includes(hab.id)
                                ? prev.filter(id => id !== hab.id)
                                : [...prev, hab.id]
                            );
                          }
                        }}
                        className="flex cursor-pointer items-center justify-between gap-2 bg-zinc-900/80 px-4 py-3 transition hover:bg-zinc-800/80"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-bold ${hab.isSlotVazio ? 'text-zinc-400' : 'text-zinc-100'}`}>
                            {hab.nome}
                          </span>
                          {hab.extra && (
                            <span className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-xs font-bold text-amber-400">
                              {hab.extra}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="rounded border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[0.65rem] uppercase tracking-wider text-zinc-500">
                            {hab.tipo}
                          </span>
                          <span className="text-xs text-zinc-600">
                            {hab.isSlotVazio ? (
                              <strong className="text-lg text-red-600">+</strong>
                            ) : (
                              estaExpandida ? '▲' : '▼'
                            )}
                          </span>
                        </div>
                      </div>

                      {/* CONTEÚDO EXPANDIDO */}
                      {estaExpandida && !hab.isSlotVazio && (
                        <div className="px-4 py-4 text-left text-sm leading-relaxed text-zinc-400">
                          <div dangerouslySetInnerHTML={{ __html: hab.descricao }} />

                          {hab.subPoder && (
                            <div className="mt-4 rounded-r border-l-2 border-amber-500 bg-zinc-900/80 p-3">
                              <div className="mb-1.5 flex items-center justify-between">
                                <span className="text-sm font-bold text-zinc-100">{hab.subPoder.nome}</span>
                                {hab.subPoder.extra && (
                                  <span className="rounded border border-zinc-700 bg-zinc-950 px-1.5 py-0.5 text-xs font-bold text-amber-400">
                                    {hab.subPoder.extra}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-zinc-400">{hab.subPoder.descricao}</div>
                            </div>
                          )}

                          {hab.limiteCirculos && (
                            <div className="mt-4 rounded-r border-l-2 border-zinc-400 bg-zinc-900/80 p-3">
                              <div className="mb-2 text-sm font-bold text-zinc-100">Rituais:</div>
                              <div className="flex flex-wrap gap-2">
                                {([
                                  ['1° Círculo', hab.limiteCirculos.c1],
                                  ['2° Círculo', hab.limiteCirculos.c2],
                                  ['3° Círculo', hab.limiteCirculos.c3],
                                  ['4° Círculo', hab.limiteCirculos.c4],
                                ] as const).map(([rotulo, qtd]) => (
                                  <span
                                    key={rotulo}
                                    className={`rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs ${
                                      qtd > 0 ? 'text-zinc-100' : 'text-zinc-600'
                                    }`}
                                  >
                                    {rotulo}: <strong>{qtd}</strong>
                                  </span>
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
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const nivel = parseInt(hab.id.replace('escolha_nex_', ''));
                                  setNexPoderEditando(nivel);
                                  setNomeEditando(hab.nome);
                                  setDescricaoEditando(hab.descricao);
                                }}
                                className="flex-1 rounded border border-zinc-700 bg-zinc-800 p-2 text-xs font-bold text-zinc-200 transition hover:bg-zinc-700"
                              >
                                Editar
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removerPoder(parseInt(hab.id.replace('escolha_nex_', '')));
                                }}
                                className="flex-1 rounded border border-red-900 bg-transparent p-2 text-xs font-bold text-red-500 transition hover:bg-red-950/40"
                              >
                                Remover Poder
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="mt-5 text-center italic text-zinc-600">Nenhuma habilidade encontrada.</div>
              )}
            </div>
          </div>
        )}

        {abaDireita === 'rituais' && (
          <div className="mt-5 text-center italic text-zinc-600">Conteúdo de Rituais</div>
        )}
        {abaDireita === 'inventario' && (
          <div className="mt-5 text-center italic text-zinc-600">Conteúdo de Inventário</div>
        )}
        {abaDireita === 'descricao' && (
          <div className="mt-5 text-center italic text-zinc-600">Conteúdo de Descrição</div>
        )}
      </div>
    </div>
  );
};
