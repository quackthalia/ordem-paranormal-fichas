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
    <div style={styles.container}>
      {/* BOTÕES DAS ABAS */}
      <div style={styles.abasRow}>
        {(['combate', 'habilidades', 'rituais', 'inventario', 'descricao'] as const).map(aba => (
          <button
            key={aba}
            onClick={() => setAbaDireita(aba)}
            style={{
              ...styles.abaBtn,
              backgroundColor: abaDireita === aba ? '#2a2a2a' : 'transparent',
              color: abaDireita === aba ? '#fff' : '#777',
              border: abaDireita === aba ? '1px solid #444' : '1px solid transparent',
            }}
          >
            {aba === 'inventario' ? 'Inventário' : aba === 'descricao' ? 'Descrição' : aba}
          </button>
        ))}
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div style={styles.conteudo}>
        {abaDireita === 'combate' && (
          <div style={styles.placeholder}>Conteúdo de Combate</div>
        )}

        {abaDireita === 'habilidades' && (
          <div style={styles.habilidadesContainer}>
            {/* TOPO: Filtro + Botão Adicionar */}
            <div style={styles.filtroRow}>
              <InputOtimizado
                value={filtroHabilidades}
                onChange={setFiltroHabilidades}
                placeholder="Filtrar Habilidades..."
                style={styles.filtroInput}
              />
              <button style={styles.addBtn}>+ Adicionar Habilidade</button>
            </div>

            {/* LISTA DE HABILIDADES */}
            <div style={styles.listaHabilidades}>
              {habilidadesFiltradas.length > 0 ? (
                habilidadesFiltradas.map(hab => {
                  const estaExpandida = habilidadesExpandidas.includes(hab.id);

                  return (
                    <div key={hab.id} style={styles.habilidadeCard}>
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
                        style={styles.habHeader}
                      >
                        <div style={styles.habNomeRow}>
                          <span style={{
                            ...styles.habNome,
                            color: hab.isSlotVazio ? '#4facfe' : '#fff',
                          }}>
                            {hab.nome}
                          </span>
                          {hab.extra && (
                            <span style={styles.habExtra}>{hab.extra}</span>
                          )}
                        </div>

                        <div style={styles.habTagRow}>
                          <span style={styles.habTag}>{hab.tipo}</span>
                          <span style={styles.habSeta}>
                            {hab.isSlotVazio ? (
                              <strong style={{ color: '#ff1111', fontSize: '1.2rem' }}>+</strong>
                            ) : (
                              estaExpandida ? '▲' : '▼'
                            )}
                          </span>
                        </div>
                      </div>

                      {/* CONTEÚDO EXPANDIDO */}
                      {estaExpandida && !hab.isSlotVazio && (
                        <div style={styles.habConteudo}>
                          <div
                            dangerouslySetInnerHTML={{ __html: hab.descricao }}
                            style={styles.habDescricao}
                          />

                          {hab.subPoder && (
                            <div style={styles.subPoderBox}>
                              <div style={styles.subPoderHeader}>
                                <span style={styles.subPoderNome}>{hab.subPoder.nome}</span>
                                {hab.subPoder.extra && (
                                  <span style={styles.subPoderExtra}>{hab.subPoder.extra}</span>
                                )}
                              </div>
                              <div style={styles.subPoderDesc}>{hab.subPoder.descricao}</div>
                            </div>
                          )}

                          {hab.limiteCirculos && (
                            <div style={styles.circulosBox}>
                              <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '8px', fontSize: '0.9rem' }}>
                                Rituais:
                              </div>
                              <div style={styles.circulosRow}>
                                <span style={{
                                  ...styles.circulo,
                                  color: hab.limiteCirculos.c1 > 0 ? '#fff' : '#555',
                                }}>
                                  1° Círculo: <strong>{hab.limiteCirculos.c1}</strong>
                                </span>
                                <span style={{
                                  ...styles.circulo,
                                  color: hab.limiteCirculos.c2 > 0 ? '#fff' : '#555',
                                }}>
                                  2° Círculo: <strong>{hab.limiteCirculos.c2}</strong>
                                </span>
                                <span style={{
                                  ...styles.circulo,
                                  color: hab.limiteCirculos.c3 > 0 ? '#fff' : '#555',
                                }}>
                                  3° Círculo: <strong>{hab.limiteCirculos.c3}</strong>
                                </span>
                                <span style={{
                                  ...styles.circulo,
                                  color: hab.limiteCirculos.c4 > 0 ? '#fff' : '#555',
                                }}>
                                  4° Círculo: <strong>{hab.limiteCirculos.c4}</strong>
                                </span>
                              </div>
                            </div>
                          )}

                          {hab.preRequisitos && (
                            <div style={styles.preReq}>
                              <strong>Pré-requisitos:</strong> {hab.preRequisitos}
                            </div>
                          )}

                          {hab.id.startsWith('escolha_nex_') && (
                            <div style={styles.acoesRow}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const nivel = parseInt(hab.id.replace('escolha_nex_', ''));
                                  setNexPoderEditando(nivel);
                                  setNomeEditando(hab.nome);
                                  setDescricaoEditando(hab.descricao);
                                }}
                                style={styles.editarBtn}
                              >
                                Editar
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removerPoder(parseInt(hab.id.replace('escolha_nex_', '')));
                                }}
                                style={styles.removerBtn}
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
                <div style={styles.semResultados}>Nenhuma habilidade encontrada.</div>
              )}
            </div>
          </div>
        )}

        {abaDireita === 'rituais' && (
          <div style={styles.placeholder}>Conteúdo de Rituais</div>
        )}
        {abaDireita === 'inventario' && (
          <div style={styles.placeholder}>Conteúdo de Inventário</div>
        )}
        {abaDireita === 'descricao' && (
          <div style={styles.placeholder}>Conteúdo de Descrição</div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// ESTILOS
// ============================================================
const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#141414',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #252525',
    display: 'flex',
    flexDirection: 'column',
  },
  abasRow: {
    display: 'flex',
    gap: '4px',
    borderBottom: '2px solid #252525',
    paddingBottom: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  abaBtn: {
    flex: 1,
    minWidth: '70px',
    padding: '8px 4px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'all 0.2s',
  },
  conteudo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    marginTop: '10px',
  },
  placeholder: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: '20px',
  },
  habilidadesContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  filtroRow: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    marginBottom: '20px',
  },
  filtroInput: {
    flex: 1,
    backgroundColor: 'transparent',
    color: '#fff',
    border: 'none',
    borderBottom: '1px solid #444',
    padding: '8px 0',
    fontSize: '1rem',
    outline: 'none',
  },
  addBtn: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: '4px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },
  listaHabilidades: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    overflowY: 'auto',
    flex: 1,
    paddingRight: '5px',
  },
  habilidadeCard: {
    backgroundColor: '#111',
    borderLeft: '4px solid #4facfe',
    borderRadius: '0 4px 4px 0',
    overflow: 'hidden',
    borderTop: '1px solid #222',
    borderRight: '1px solid #222',
    borderBottom: '1px solid #222',
  },
  habHeader: {
    padding: '12px 15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    backgroundColor: '#1a1a1a',
  },
  habNomeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  habNome: {
    fontWeight: 'bold',
    fontSize: '0.95rem',
  },
  habExtra: {
    color: '#ffcc00',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    backgroundColor: '#222',
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid #333',
  },
  habTagRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  habTag: {
    backgroundColor: '#050505',
    border: '1px solid #333',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.65rem',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  habSeta: {
    color: '#666',
    fontSize: '0.8rem',
  },
  habConteudo: {
    padding: '15px',
    color: '#ccc',
    fontSize: '0.85rem',
    lineHeight: '1.5',
    backgroundColor: '#111',
    fontStyle: 'normal',
    textAlign: 'left',
  },
  habDescricao: {
    color: '#ccc',
    fontSize: '0.85rem',
    lineHeight: '1.5',
  },
  subPoderBox: {
    marginTop: '15px',
    padding: '12px',
    backgroundColor: '#161616',
    borderLeft: '3px solid #ffcc00',
    borderRadius: '4px',
  },
  subPoderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  subPoderNome: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: '0.9rem',
  },
  subPoderExtra: {
    fontSize: '0.75rem',
    fontWeight: 'bold',
    backgroundColor: '#222',
    padding: '2px 6px',
    borderRadius: '4px',
    color: '#ffcc00',
    border: '1px solid #333',
  },
  subPoderDesc: {
    color: '#ccc',
    fontSize: '0.8rem',
  },
  circulosBox: {
    marginTop: '15px',
    padding: '12px',
    backgroundColor: '#161616',
    borderLeft: '3px solid #9933ff',
    borderRadius: '4px',
  },
  circulosRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  circulo: {
    backgroundColor: '#222',
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid #333',
    fontSize: '0.8rem',
  },
  preReq: {
    marginTop: '12px',
    padding: '6px 10px',
    fontSize: '0.75rem',
    color: '#ffcc00',
    fontStyle: 'italic',
    backgroundColor: 'rgba(255,204,0,0.03)',
    borderRadius: '4px',
    display: 'inline-block',
  },
  acoesRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
  },
  editarBtn: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    color: '#fff',
    border: '1px solid #444',
    padding: '8px',
    borderRadius: '4px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  removerBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    color: '#ff1111',
    border: '1px solid #ff1111',
    padding: '8px',
    borderRadius: '4px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  semResultados: {
    textAlign: 'center',
    color: '#555',
    fontStyle: 'italic',
    marginTop: '20px',
  },
};