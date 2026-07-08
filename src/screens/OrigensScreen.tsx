import React from 'react';
import { useRPG } from '../context/RPGContext';

export const OrigensScreen: React.FC = () => {
  const { setTelaAtual, origensHook } = useRPG();
  const {
    origens,
    origensExpandidas,
    toggleOrigemExpandida,
    loading,
    error,
    selecionarOrigem,
    nomePericia,
  } = origensHook;

  if (loading) return <div style={styles.container}>Carregando origens...</div>;
  if (error) return <div style={styles.container}>Erro: {error}</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.titulo}>Escolha sua Origem</h1>

      <div style={styles.lista}>
        {origens.map(origem => {
          const estaExpandida = origensExpandidas.includes(origem.Codigo_Origem);

          return (
            <div key={origem.Codigo_Origem} style={styles.card}>
              {/* CABEÇALHO */}
              <div style={styles.cardHeader}>
                <div
                  onClick={() => toggleOrigemExpandida(origem.Codigo_Origem)}
                  style={styles.cardNome}
                >
                  <span style={styles.nomeTexto}>{origem.Nome}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    selecionarOrigem(origem);
                    setTelaAtual('classe');
                  }}
                  style={styles.escolherBtn}
                >
                  ESCOLHER ORIGEM
                </button>
              </div>

              {/* CONTEÚDO EXPANSÍVEL */}
              {estaExpandida && (
                <div style={styles.cardConteudo}>
                  <p style={styles.descricao}>{origem.Descricao}</p>
                  <p style={styles.pericias}>
                    <strong>Perícias treinadas. </strong>
                    {nomePericia(origem.Pericia_Treinada_1)} e {nomePericia(origem.Pericia_Treinada_2)}
                    {origem.Pericia_Treinada_Especial ? ` e ${nomePericia(origem.Pericia_Treinada_Especial)}` : ''}.
                  </p>
                  <p style={styles.poder}>
                    <strong>{origem.Nome_Poder}. </strong>
                    {origem.Descricao_Poder}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button onClick={() => setTelaAtual('atributos')} style={styles.voltarBtn}>
        ◀ Voltar
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%', maxWidth: '800px', margin: '0 auto',
    padding: '30px 40px', fontFamily: 'sans-serif',
  },
  titulo: { marginBottom: '30px' },
  lista: { display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' },
  card: {
    backgroundColor: '#151515', borderLeft: '4px solid #4da6ff',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '15px 20px',
  },
  cardNome: { flex: 1, cursor: 'pointer', textAlign: 'left' },
  nomeTexto: { fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' },
  escolherBtn: {
    padding: '10px 15px', backgroundColor: '#4da6ff',
    color: '#000', border: 'none', borderRadius: '3px',
    fontWeight: 'bold', cursor: 'pointer',
    textTransform: 'uppercase', marginLeft: '15px',
  },
  cardConteudo: {
    padding: '0px 20px 20px 20px', backgroundColor: '#151515',
    color: '#ccc', lineHeight: '1.6', textAlign: 'left',
  },
  descricao: { marginTop: 0, marginBottom: '10px' },
  pericias: { margin: '10px 0' },
  poder: { margin: '10px 0' },
  voltarBtn: {
    padding: '12px 25px', backgroundColor: '#333',
    color: '#fff', border: 'none', borderRadius: '5px',
    cursor: 'pointer',
  },
};