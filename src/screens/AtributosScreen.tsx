import React from 'react';
import { useRPG } from '../context/RPGContext';
import { capMaximoAtributo, NEX_OPTIONS } from '../utils/rpgRules';
import type { AtributoKey } from '../types';

const ATRIBUTOS_ORDER: AtributoKey[] = ['FOR', 'AGI', 'INT', 'PRE', 'VIG'];

export const AtributosScreen: React.FC = () => {
  const {
    nex, setNex,
    atributos, setAtributos,
    pontosRestantes,
    alterarAtributo,
    setTelaAtual,
  } = useRPG();

  const handleNexChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const novoNex = Number(e.target.value);
    setNex(novoNex);
    setAtributos({ FOR: 1, AGI: 1, INT: 1, PRE: 1, VIG: 1 });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Criação de Personagem: Atributos</h1>

      {/* SELETOR DE NEX */}
      <div style={styles.nexBox}>
        <label htmlFor="nex-select" style={styles.label}>Escolha o NEX Inicial:</label>
        <select
          id="nex-select"
          value={nex}
          onChange={handleNexChange}
          style={styles.select}
        >
          {NEX_OPTIONS.map(n => (
            <option key={n} value={n}>{n}%</option>
          ))}
        </select>
      </div>

      {/* PONTOS RESTANTES */}
      <div style={{
        ...styles.pontos,
        color: pontosRestantes < 0 ? '#ff4d4d' : '#4dff4d',
      }}>
        <strong>Pontos Restantes: {pontosRestantes}</strong>
      </div>

      {/* LISTA DE ATRIBUTOS */}
      <div style={styles.lista}>
        {ATRIBUTOS_ORDER.map(nome => {
          const temAtributoZerado = Object.values(atributos).some(v => v === 0);
          const naoPodeDiminuir = atributos[nome] === 0 || (atributos[nome] === 1 && temAtributoZerado);
          const naoPodeAumentar = pontosRestantes <= 0 || atributos[nome] >= capMaximoAtributo(nex);

          return (
            <div key={nome} style={styles.row}>
              <span style={styles.nome}>{nome}</span>
              <div style={styles.controls}>
                <button
                  onClick={() => alterarAtributo(nome, 'diminuir')}
                  disabled={naoPodeDiminuir}
                  style={{ ...styles.btn, backgroundColor: naoPodeDiminuir ? '#555' : '#cc3333' }}
                >
                  -
                </button>
                <span style={styles.valor}>{atributos[nome]}</span>
                <button
                  onClick={() => alterarAtributo(nome, 'aumentar')}
                  disabled={naoPodeAumentar}
                  style={{ ...styles.btn, backgroundColor: naoPodeAumentar ? '#555' : '#33cc33' }}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={() => setTelaAtual('origens')} style={styles.avancar}>
        Avançar para Origens ➔
      </button>
    </div>
  );
};

// ============================================================
// ESTILOS
// ============================================================
const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%', maxWidth: '800px', margin: '0 auto',
    padding: '30px 40px', fontFamily: 'sans-serif',
  },
  title: { marginBottom: '30px' },
  nexBox: {
    marginBottom: '20px', padding: '15px',
    border: '1px solid #333', borderRadius: '5px',
  },
  label: { marginRight: '10px', fontWeight: 'bold' },
  select: {
    padding: '5px', backgroundColor: '#222',
    color: '#fff', border: '1px solid #555',
  },
  pontos: { fontSize: '1.2rem', marginBottom: '25px' },
  lista: {
    display: 'flex', flexDirection: 'column', gap: '15px',
    maxWidth: '400px', marginBottom: '30px',
  },
  row: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '10px',
    backgroundColor: '#1e1e1e', borderRadius: '5px',
  },
  nome: { fontWeight: 'bold', width: '50px' },
  controls: { display: 'flex', alignItems: 'center', gap: '15px' },
  btn: {
    width: '35px', height: '35px',
    color: '#fff', border: 'none',
    borderRadius: '5px', cursor: 'pointer',
    fontSize: '1.2rem',
  },
  valor: { fontSize: '1.5rem', minWidth: '20px', textAlign: 'center' },
  avancar: {
    padding: '15px 30px', fontSize: '1.2rem',
    backgroundColor: '#fff', color: '#000',
    border: 'none', borderRadius: '5px',
    cursor: 'pointer', fontWeight: 'bold',
  },
};