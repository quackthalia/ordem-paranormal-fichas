import React from 'react';
import { useRPG } from '../../context/RPGContext';
import type { AtributoKey } from '../../types';

export const PericiasTable: React.FC = () => {
  const { periciasHook, regrasAtivas, setRegrasAtivas } = useRPG();
  const { pericias, handleMudarPericia, limites, totais } = periciasHook;

  const { maxTreinadas, maxUpgrades } = limites;
  const { totalTreinadasUsadas, totalUpgradesGastos } = totais;

  return (
    <div style={styles.container}>
      <h3 style={styles.titulo}>Perícias</h3>

      {/* PAINEL DE REGRAS */}
      <div style={styles.painelRegras}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={regrasAtivas}
            onChange={(e) => setRegrasAtivas(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          {regrasAtivas ? 'Regras Ativas' : 'Modo Livre'}
        </label>

        {regrasAtivas && (
          <div style={styles.pontosRow}>
            <span style={{
              ...styles.ponto,
              color: maxTreinadas - totalTreinadasUsadas < 0 ? '#ff4d4d' : '#8fa0f0',
            }}>
              Treinar: {maxTreinadas - totalTreinadasUsadas}
            </span>
            <span style={{
              ...styles.ponto,
              color: maxUpgrades - totalUpgradesGastos < 0 ? '#ff4d4d' : '#68bd82',
            }}>
              Aumentar Grau: {maxUpgrades - totalUpgradesGastos}
            </span>
          </div>
        )}
      </div>

      {/* TABELA */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadTr}>
              <th style={styles.th}>Perícia</th>
              <th style={styles.th}>Dados</th>
              <th style={styles.th}>Bônus</th>
              <th style={styles.th}>Treino</th>
              <th style={styles.th}>Outros</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(pericias).map(([nome, dadosPericia]) => {
              const totalBonus = dadosPericia.treino + dadosPericia.outros;

              let corTexto = '#ccc';
              if (dadosPericia.treino === 5) corTexto = '#43a047';
              else if (dadosPericia.treino === 10) corTexto = '#1e88e5';
              else if (dadosPericia.treino === 15) corTexto = '#f57c00';

              return (
                <tr key={nome} style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: 'bold', color: corTexto }}>
                    {nome}
                  </td>

                  <td style={{ ...styles.td, textAlign: 'center', color: corTexto }}>
                    <span>(</span>
                    <select
                      value={dadosPericia.atributo}
                      onChange={(e) =>
                        handleMudarPericia(nome, 'atributo', e.target.value as AtributoKey)
                      }
                      style={{
                        ...estiloSelectDropdown,
                        color: corTexto,
                      }}
                    >
                      <option value="FOR">FOR</option>
                      <option value="AGI">AGI</option>
                      <option value="INT">INT</option>
                      <option value="PRE">PRE</option>
                      <option value="VIG">VIG</option>
                    </select>
                    <span>)</span>
                  </td>

                  <td style={{
                    ...styles.td,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: corTexto,
                    fontSize: '1.05rem',
                  }}>
                    ( {totalBonus} )
                  </td>

                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <select
                      value={dadosPericia.treino}
                      onChange={(e) =>
                        handleMudarPericia(nome, 'treino', Number(e.target.value))
                      }
                      style={{
                        ...estiloSelectDropdown,
                        borderBottom: `1px solid ${corTexto}`,
                        width: '50px',
                        color: corTexto,
                      }}
                    >
                      <option value={0}>0</option>
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                    </select>
                  </td>

                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <input
                      type="number"
                      onKeyDown={(e) => {
                        if (['e', 'E', '+', '-', '.', ','].includes(e.key)) e.preventDefault();
                      }}
                      value={dadosPericia.outros === 0 ? '' : dadosPericia.outros}
                      placeholder="0"
                      onChange={(e) =>
                        handleMudarPericia(nome, 'outros', Math.max(0, Number(e.target.value)))
                      }
                      style={{
                        ...estiloInputOutros,
                        color: corTexto,
                        borderBottom: `1px solid ${corTexto}`,
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================
// ESTILOS
// ============================================================
const estiloSelectDropdown: React.CSSProperties = {
  backgroundColor: 'transparent',
  color: '#fff',
  border: 'none',
  fontSize: '1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  outline: 'none',
  textAlign: 'center',
  appearance: 'none',
};

const estiloInputOutros: React.CSSProperties = {
  width: '45px',
  backgroundColor: 'transparent',
  border: 'none',
  textAlign: 'center',
  fontSize: '1rem',
  fontWeight: 'bold',
  outline: 'none',
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#181818',
    padding: '30px',
    borderRadius: '8px',
    border: '1px solid #333',
  },
  titulo: {
    textTransform: 'uppercase',
    letterSpacing: '2px',
    color: '#ccc',
    borderBottom: '1px solid #333',
    paddingBottom: '10px',
    marginBottom: '25px',
    textAlign: 'center',
  },
  painelRegras: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#050505',
    padding: '6px 12px',
    borderRadius: '4px',
    border: '1px solid #222',
    marginBottom: '15px',
    fontSize: '0.8rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    color: '#aaa',
  },
  pontosRow: {
    display: 'flex',
    gap: '15px',
    fontWeight: 'bold',
  },
  ponto: {
    fontSize: '0.8rem',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '1rem',
    color: '#fff',
  },
  theadTr: {
    color: '#888',
    textTransform: 'uppercase',
    fontSize: '0.85rem',
    letterSpacing: '1px',
    borderBottom: '1px solid #444',
  },
  th: {
    padding: '10px 8px',
  },
  tr: {
    borderBottom: '1px solid #222',
    backgroundColor: 'transparent',
  },
  td: {
    padding: '10px 8px',
  },
};