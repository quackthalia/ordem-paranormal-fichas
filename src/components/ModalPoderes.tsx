import React, { useRef } from 'react';
import { useRPG } from '../context/RPGContext';
import { usePoderesFiltrados } from '../hooks/usePoderes';
import { InputOtimizado } from './InputOtimizado';

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

  const { listaPoderesUtilidade, escolherPoder, editarPoder } = poderesHook;

  const listaFiltrada = usePoderesFiltrados(listaPoderesUtilidade, abaModalPoderes, classe);

  // Se tiver um editor aberto, mostra o modal de edição
  if (nexPoderEditando !== null) {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <h3 style={styles.modalTitulo}>
            Editar Poder (NEX {nexPoderEditando}%)
          </h3>

          <div style={styles.campo}>
            <label style={styles.label}>Nome do Poder</label>
            <InputOtimizado
              value={nomeEditando}
              onChange={setNomeEditando}
              style={styles.input}
            />
          </div>

          <div style={styles.campo}>
            <label style={styles.label}>Descrição</label>
            {/* Barra de ferramentas */}
            <div style={styles.toolbar}>
              <button
                type="button"
                onClick={() => document.execCommand('bold', false)}
                style={styles.toolBtn}
                title="Negrito"
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                onClick={() => document.execCommand('italic', false)}
                style={styles.toolBtn}
                title="Itálico"
              >
                <em>I</em>
              </button>
            </div>
            {/* Editor contentEditable */}
            <div
              ref={(el) => {
                editorRef.current = el;
                if (el && !el.dataset.initialized) {
                  el.innerHTML = descricaoEditando;
                  el.dataset.initialized = 'true';
                }
              }}
              contentEditable
              style={styles.editor}
            />
          </div>

          <div style={styles.acoes}>
            <button onClick={() => setNexPoderEditando(null)} style={styles.btnCancelar}>
              Cancelar
            </button>
            <button
              onClick={() => {
                const texto = editorRef.current?.innerHTML || '';
                editarPoder(nexPoderEditando, nomeEditando, texto);
                setNexPoderEditando(null);
              }}
              style={styles.btnAplicar}
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Modal de escolha de poderes
  return (
    <div style={styles.overlay}>
      <div style={styles.modalGrande}>
        {/* CABEÇALHO */}
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>
            Escolher Poder — NEX {nexModalAberto}%
          </h3>
          <button onClick={() => setNexModalAberto(null)} style={styles.fecharBtn}>
            &times;
          </button>
        </div>

        {/* ABAS */}
        <div style={styles.abasModal}>
          <button
            onClick={() => {
              setAbaModalPoderes('classe');
              const div = document.getElementById('caixa-scroll-poderes');
              if (div) div.scrollTop = 0;
            }}
            style={{
              ...styles.abaModalBtn,
              borderBottom: abaModalPoderes === 'classe' ? '3px solid #ff0000' : 'none',
              color: abaModalPoderes === 'classe' ? '#fff' : '#666',
            }}
          >
            Poderes de Utilidade
          </button>
          <button
            onClick={() => {
              setAbaModalPoderes('gerais');
              const div = document.getElementById('caixa-scroll-poderes');
              if (div) div.scrollTop = 0;
            }}
            style={{
              ...styles.abaModalBtn,
              borderBottom: abaModalPoderes === 'gerais' ? '3px solid #ff0000' : 'none',
              color: abaModalPoderes === 'gerais' ? '#fff' : '#666',
            }}
          >
            Poderes Gerais
          </button>
        </div>

        {/* LISTA DE PODERES */}
        <div id="caixa-scroll-poderes" style={styles.listaPoderes}>
          {listaFiltrada.map(poder => {
            const estaExpandido = poderesModalExpandidos.includes(poder.codigo_poder);

            return (
              <div key={poder.codigo_poder} style={styles.poderCard}>
                <div
                  onClick={() => {
                    setPoderesModalExpandidos(prev =>
                      prev.includes(poder.codigo_poder)
                        ? prev.filter(id => id !== poder.codigo_poder)
                        : [...prev, poder.codigo_poder]
                    );
                  }}
                  style={styles.poderHeader}
                >
                  <span style={styles.poderNome}>{poder.Nome}</span>

                  <div style={styles.poderActions}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        escolherPoder(nexModalAberto!, poder);
                        setNexModalAberto(null);
                      }}
                      style={styles.escolherBtnPoder}
                    >
                      Escolher
                    </button>
                    <span style={{ color: '#666', fontSize: '1rem', width: '20px', textAlign: 'center' }}>
                      {estaExpandido ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {estaExpandido && (
                  <div style={styles.poderConteudo}>
                    <div style={styles.poderDescricao}>{poder.Descricao}</div>
                    {poder.PreRequisitos && (
                      <div style={styles.preRequisitos}>
                        <strong>Pré-requisitos:</strong> {poder.PreRequisitos}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {listaFiltrada.length === 0 && (
            <div style={styles.semPoderes}>
              Nenhum poder encontrado nesta categoria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// ESTILOS
// ============================================================
const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: '20px',
  },
  modal: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '800px',
    padding: '25px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  modalGrande: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '850px',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  },
  modalHeader: {
    padding: '20px',
    borderBottom: '1px solid #333',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitulo: {
    margin: 0,
    color: '#fff',
    fontSize: '1.2rem',
    borderBottom: '1px solid #333',
    paddingBottom: '10px',
    textAlign: 'left',
    fontFamily: 'inherit',
  },
  fecharBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  abasModal: {
    display: 'flex',
    backgroundColor: '#121212',
    borderBottom: '1px solid #333',
  },
  abaModalBtn: {
    flex: 1,
    padding: '12px',
    background: 'none',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: '0.2s',
  },
  listaPoderes: {
    padding: '20px',
    overflowY: 'auto',
    flex: 1,
    display: 'block',
  },
  poderCard: {
    backgroundColor: '#111',
    borderLeft: '4px solid #ff0000',
    borderRadius: '4px',
    overflow: 'hidden',
    borderTop: '1px solid #333',
    borderRight: '1px solid #333',
    borderBottom: '1px solid #333',
    marginBottom: '12px',
    display: 'block',
  },
  poderHeader: {
    padding: '12px 15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    backgroundColor: '#1a1a1a',
  },
  poderNome: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: '1rem',
    flex: 1,
  },
  poderActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  escolherBtnPoder: {
    backgroundColor: '#ff0000',
    color: '#fff',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    textTransform: 'uppercase',
    transition: '0.2s',
  },
  poderConteudo: {
    padding: '15px 20px',
    backgroundColor: '#161616',
    borderTop: '1px solid #222',
    textAlign: 'left',
  },
  poderDescricao: {
    color: '#bbb',
    fontSize: '0.9rem',
    lineHeight: '1.5',
  },
  preRequisitos: {
    fontSize: '0.8rem',
    color: '#ffcc00',
    fontStyle: 'italic',
    backgroundColor: 'rgba(255,204,0,0.05)',
    padding: '8px 12px',
    borderRadius: '4px',
    marginTop: '15px',
    display: 'inline-block',
  },
  semPoderes: {
    color: '#555',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: '20px',
  },
  campo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    textAlign: 'left',
  },
  label: {
    color: '#aaa',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    fontFamily: 'inherit',
  },
  input: {
    backgroundColor: '#111',
    border: '1px solid #333',
    borderRadius: '4px',
    padding: '10px',
    color: '#fff',
    fontSize: '0.95rem',
    outline: 'none',
    fontFamily: 'inherit',
  },
  toolbar: {
    display: 'flex',
    gap: '6px',
    backgroundColor: '#121212',
    padding: '6px',
    border: '1px solid #333',
    borderBottom: 'none',
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
  },
  toolBtn: {
    backgroundColor: '#222',
    color: '#fff',
    border: '1px solid #444',
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
  },
  editor: {
    backgroundColor: '#111',
    border: '1px solid #333',
    borderBottomLeftRadius: '4px',
    borderBottomRightRadius: '4px',
    padding: '12px',
    color: '#fff',
    fontSize: '0.9rem',
    lineHeight: '1.5',
    outline: 'none',
    minHeight: '140px',
    overflowY: 'auto',
    fontFamily: 'inherit',
    textAlign: 'left',
  },
  acoes: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '10px',
  },
  btnCancelar: {
    backgroundColor: '#222',
    color: '#aaa',
    border: '1px solid #444',
    padding: '8px 16px',
    borderRadius: '4px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnAplicar: {
    backgroundColor: '#ff0000',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};