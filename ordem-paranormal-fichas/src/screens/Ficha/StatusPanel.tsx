import React from 'react';
import { useRPG } from '../../context/RPGContext';

export const StatusPanel: React.FC = () => {
  const {
    status,
    nex,
    setNex,
    bloquearLetras,
    deslocM, setDeslocM,
    deslocQ, setDeslocQ,
  } = useRPG();

  const {
    pvAtual, pvMax, setPvMax,
    sanAtual, sanMax, setSanMax,
    peAtual, peMax, setPeMax,
    peTurno,
    hasPvTemp, setHasPvTemp,
    pvTempAtual, setPvTempAtual, pvTempMax, setPvTempMax,
    hasPeTemp, setHasPeTemp,
    peTempAtual, setPeTempAtual, peTempMax, setPeTempMax,
    alterarStatus,
  } = status;

  return (
    <div>
      {/* LINHA: NEX + PE/TURNO + DESLOCAMENTO */}
      <div style={styles.infoRow}>
        {/* NEX */}
        <div style={styles.infoBloco}>
          <span style={styles.infoLabel}>NEX</span>
          <select
            value={nex}
            onChange={(e) => setNex(Number(e.target.value))}
            style={styles.nexSelect}
          >
            {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99].map(n => (
              <option key={n} value={n}>{n}%</option>
            ))}
          </select>
        </div>

        {/* PE/TURNO */}
        <div style={styles.infoBloco}>
          <div style={styles.peTurnoBox}>{peTurno}</div>
          <span style={styles.infoLabel}>PE/TURNO</span>
        </div>

        {/* DESLOCAMENTO */}
        <div style={styles.infoBloco}>
          <div style={styles.deslocBox}>
            <input
              type="number"
              value={deslocM}
              onChange={(e) => {
                const m = Number(e.target.value);
                setDeslocM(m);
                setDeslocQ(Math.floor(m / 1.5));
              }}
              style={styles.deslocInput}
            />
            <span>m /</span>
            <input
              type="number"
              value={deslocQ}
              onChange={(e) => {
                const q = Number(e.target.value);
                setDeslocQ(q);
                setDeslocM(q * 1.5);
              }}
              style={styles.deslocInput}
            />
            <span>q</span>
          </div>
          <span style={styles.infoLabel}>Deslocamento</span>
        </div>
      </div>

      {/* BARRAS DE STATUS */}
      <div style={styles.barrasContainer}>
        {/* VIDA */}
        <BarraStatus
          titulo="VIDA"
          cor="#ff4d4d"
          corFundo="#220000"
          valorAtual={pvAtual}
          valorMax={pvMax}
          setValorMax={setPvMax}
          alterarStatus={(qtd) => alterarStatus('pv', qtd)}
          bloquearLetras={bloquearLetras}
          hasTemp={hasPvTemp}
          setHasTemp={setHasPvTemp}
          tempAtual={pvTempAtual}
          setTempAtual={setPvTempAtual}
          tempMax={pvTempMax}
          setTempMax={setPvTempMax}
          corTemp="#ff6666"
          corTempFundo="#331111"
        />

        {/* SANIDADE */}
        <BarraStatus
          titulo="SANIDADE"
          cor="#9933ff"
          corFundo="#1a0033"
          valorAtual={sanAtual}
          valorMax={sanMax}
          setValorMax={setSanMax}
          alterarStatus={(qtd) => alterarStatus('san', qtd)}
          bloquearLetras={bloquearLetras}
        />

        {/* ESFORÇO */}
        <BarraStatus
          titulo="ESFORÇO"
          cor="#ff9900"
          corFundo="#331a00"
          valorAtual={peAtual}
          valorMax={peMax}
          setValorMax={setPeMax}
          alterarStatus={(qtd) => alterarStatus('pe', qtd)}
          bloquearLetras={bloquearLetras}
          hasTemp={hasPeTemp}
          setHasTemp={setHasPeTemp}
          tempAtual={peTempAtual}
          setTempAtual={setPeTempAtual}
          tempMax={peTempMax}
          setTempMax={setPeTempMax}
          corTemp="#ffcc00"
          corTempFundo="#332200"
        />
      </div>
    </div>
  );
};

// ============================================================
// COMPONENTE INTERNO: UMA BARRA DE STATUS (PV, SAN ou PE)
// ============================================================
interface BarraStatusProps {
  titulo: string;
  cor: string;
  corFundo: string;
  valorAtual: number;
  valorMax: number;
  setValorMax: React.Dispatch<React.SetStateAction<number>>;
  alterarStatus: (qtd: number) => void;
  bloquearLetras: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  hasTemp?: boolean;
  setHasTemp?: React.Dispatch<React.SetStateAction<boolean>>;
  tempAtual?: number;
  setTempAtual?: React.Dispatch<React.SetStateAction<number>>;
  tempMax?: number;
  setTempMax?: React.Dispatch<React.SetStateAction<number>>;
  corTemp?: string;
  corTempFundo?: string;
}

function BarraStatus({
  titulo,
  cor,
  corFundo,
  valorAtual,
  valorMax,
  setValorMax,
  alterarStatus,
  bloquearLetras,
  hasTemp,
  setHasTemp,
  tempAtual,
  setTempAtual,
  tempMax,
  setTempMax,
  corTemp,
  corTempFundo,
}: BarraStatusProps) {
  return (
    <div>
      {/* CABEÇALHO */}
      <div style={styles.barraHeader}>
        <span style={styles.barraTitulo}>{titulo}</span>
        {setHasTemp && (
          <label style={styles.tempLabel}>
            <input
              type="checkbox"
              checked={hasTemp}
              onChange={(e) => {
                setHasTemp(e.target.checked);
                if (!e.target.checked && setTempAtual && setTempMax) {
                  setTempAtual(0);
                  setTempMax(0);
                }
              }}
            />
            + Temporário
          </label>
        )}
      </div>

      {/* CORPO */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <div
          style={{
            flex: hasTemp ? '2.5' : '1',
            backgroundColor: corFundo,
            border: `1px solid ${cor}`,
            padding: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'all 0.3s',
          }}
        >
          <div>
            <button onClick={() => alterarStatus(-5)} style={estiloBotaoSeta}>«</button>
            <button onClick={() => alterarStatus(-1)} style={estiloBotaoSeta}>‹</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{valorAtual}</span>
            <span style={{ fontSize: '1.2rem', color: '#aaa' }}>/</span>
            <input
              type="number"
              onKeyDown={bloquearLetras}
              value={valorMax}
              onChange={(e) => setValorMax(Math.max(1, Number(e.target.value)))}
              style={estiloInputMaximo}
              title={`Editar ${titulo} Máxima`}
            />
          </div>
          <div>
            <button onClick={() => alterarStatus(1)} style={estiloBotaoSeta}>›</button>
            <button onClick={() => alterarStatus(5)} style={estiloBotaoSeta}>»</button>
          </div>
        </div>

        {/* TEMPORÁRIO */}
        {hasTemp && setTempAtual && setTempMax && (
          <div
            style={{
              flex: '1',
              backgroundColor: corTempFundo,
              border: `1px dashed ${corTemp}`,
              padding: '10px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <input
              type="number"
              onKeyDown={bloquearLetras}
              value={tempAtual}
              onChange={(e) => setTempAtual(Math.max(0, Number(e.target.value)))}
              style={estiloInputTemp}
            />
            <span style={{ color: '#aaa' }}>/</span>
            <input
              type="number"
              onKeyDown={bloquearLetras}
              value={tempMax}
              onChange={(e) => setTempMax(Math.max(0, Number(e.target.value)))}
              style={estiloInputTemp}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// ESTILOS COMPARTILHADOS
// ============================================================
const estiloBotaoSeta: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#fff',
  fontSize: '1.2rem',
  cursor: 'pointer',
  padding: '0 8px',
  fontWeight: 'bold',
  userSelect: 'none',
};

const estiloInputMaximo: React.CSSProperties = {
  width: '45px',
  backgroundColor: 'transparent',
  color: '#fff',
  border: 'none',
  textAlign: 'center',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  outline: 'none',
};

const estiloInputTemp: React.CSSProperties = {
  width: '35px',
  backgroundColor: 'transparent',
  color: '#fff',
  border: 'none',
  textAlign: 'center',
  fontSize: '1rem',
  fontWeight: 'bold',
  outline: 'none',
};

const styles: Record<string, React.CSSProperties> = {
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '40px',
    borderBottom: '1px solid #333',
    paddingBottom: '20px',
  },
  infoBloco: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
  },
  infoLabel: {
    fontSize: '0.8rem',
    fontWeight: 'bold',
    color: '#aaa',
    marginTop: '5px',
  },
  nexSelect: {
    padding: '8px 10px',
    backgroundColor: '#121212',
    color: '#fff',
    border: '1px solid #fff',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    appearance: 'none',
    textAlign: 'center',
  },
  peTurnoBox: {
    padding: '8px 15px',
    border: '1px solid #fff',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    minWidth: '60px',
    textAlign: 'center',
  },
  deslocBox: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #fff',
    padding: '5px 10px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  deslocInput: {
    width: '40px',
    backgroundColor: 'transparent',
    color: '#fff',
    border: 'none',
    textAlign: 'center',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    outline: 'none',
  },
  barrasContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
    marginBottom: '30px',
  },
  barraHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '5px',
  },
  barraTitulo: {
    fontWeight: 'bold',
    color: '#ccc',
    fontSize: '0.9rem',
    marginLeft: '5px',
  },
  tempLabel: {
    fontSize: '0.8rem',
    color: '#aaa',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
};