import React from 'react';
import { useRPG } from '../../context/RPGContext';
import { StatusPanel } from './StatusPanel';
import { PericiasTable } from './PericiasTable';
import { AbasPanel } from './AbasPanel';
import { ModalPoderes } from '../../components/ModalPoderes';

export const FichaScreen: React.FC = () => {
  const {
    classe,
    setBonusAtributos,
    setTelaAtual,
    status,
    setSkillCombatente1,
    setSkillCombatente2,
    nexModalAberto,
  } = useRPG();

  const handleRefazer = () => {
    status.resetarStatus();
    setBonusAtributos({ FOR: 0, AGI: 0, INT: 0, PRE: 0, VIG: 0 });
    setSkillCombatente1('');
    setSkillCombatente2('');
    setTelaAtual('atributos');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>Ficha de {classe}</h2>

      <div style={styles.grid2colunas}>
        {/* COLUNA ESQUERDA: Atributos + Status + Defesa + Proteções */}
        <div style={styles.colEsquerda}>
          <AtributosFicha />
          <StatusPanel />
          <DefesaPanel />
          <ProtecoesPanel />
        </div>

        {/* COLUNA MEIO: Perícias */}
        <div style={styles.colMeio}>
          <PericiasTable />
        </div>

        {/* COLUNA DIREITA: Abas (Combate, Habilidades, Rituais...) */}
        <div style={styles.colDireita}>
          <AbasPanel />
        </div>
      </div>

      <button onClick={handleRefazer} style={styles.refazerBtn}>
        Refazer Personagem
      </button>

      {nexModalAberto !== null && <ModalPoderes />}
    </div>
  );
};

// ============================================================
// COMPONENTE INTERNO: ATRIBUTOS NA FICHA
// ============================================================
function AtributosFicha() {
  const { atributos, setAtributos, bonusAtributos, setBonusAtributos, bloquearLetras } = useRPG();

  return (
    <div style={styles.atributosRow}>
      {(Object.keys(atributos) as Array<keyof typeof atributos>).map(nome => (
        <div key={nome} style={styles.atributoCircle}>
          <div style={styles.bonusBadge}>
            <input
              type="number"
              onKeyDown={bloquearLetras}
              value={bonusAtributos[nome]}
              onChange={(e) =>
                setBonusAtributos({ ...bonusAtributos, [nome]: Math.max(0, Number(e.target.value)) })
              }
              style={styles.bonusInput}
            />
          </div>
          <span style={styles.atributoLabel}>{nome}</span>
          <input
            type="number"
            onKeyDown={bloquearLetras}
            value={atributos[nome]}
            onChange={(e) => setAtributos({ ...atributos, [nome]: Number(e.target.value) })}
            style={styles.atributoInput}
          />
        </div>
      ))}
    </div>
  );
}

// ============================================================
// COMPONENTE INTERNO: DEFESA
// ============================================================
function DefesaPanel() {
  const { defesaTotal, defEquip, setDefEquip, defOutros, setDefOutros, bloquearLetras, status } = useRPG();

  const bloqueio = (status as any).bloqueio ?? 0;
  const esquiva = (status as any).esquiva ?? 0;

  return (
    <div style={styles.defesaBox}>
      <div style={styles.defesaItem}>
        <div style={styles.defesaValor}>{defesaTotal}</div>
        <div>
          <div style={styles.defesaLabel}>DEFESA</div>
          <div style={styles.defesaFormula}>
            = 10 + AGI +
            <input type="number" onKeyDown={bloquearLetras}
              value={defEquip || ''} placeholder="0"
              onChange={e => setDefEquip(Math.max(0, Number(e.target.value)))}
              style={styles.defesaInput} />
            +
            <input type="number" onKeyDown={bloquearLetras}
              value={defOutros || ''} placeholder="0"
              onChange={e => setDefOutros(Math.max(0, Number(e.target.value)))}
              style={styles.defesaInput} />
          </div>
        </div>
      </div>

      <div style={styles.defesaStat}>
        <span style={styles.defesaLabel}>BLOQUEIO</span>
        <span style={styles.defesaValorPqn}>{bloqueio}</span>
      </div>
      <div style={styles.defesaStat}>
        <span style={styles.defesaLabel}>ESQUIVA</span>
        <span style={styles.defesaValorPqn}>{esquiva}</span>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTE INTERNO: PROTEÇÕES, RESISTÊNCIAS, PROFICIÊNCIAS
// ============================================================
function ProtecoesPanel() {
  const {
    protecoes, setProtecoes,
    resistencias, setResistencias,
    proficiencias, setProficiencias,
  } = useRPG();

  return (
    <div style={styles.protecoesContainer}>
      <BadgeBlock
        titulo="Proteção"
        itens={protecoes}
        setItens={setProtecoes}
      />
      <BadgeBlock
        titulo="Resistências"
        itens={resistencias}
        setItens={setResistencias}
      />
      <BadgeBlock
        titulo="Proficiências"
        itens={proficiencias}
        setItens={setProficiencias}
      />
    </div>
  );
}

// ============================================================
// COMPONENTE INTERNO: BADGE (para Proteções, Resistências, etc.)
// ============================================================
function BadgeBlock({
  titulo,
  itens,
  setItens,
}: {
  titulo: string;
  itens: string[];
  setItens: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [inputValue, setInputValue] = React.useState('');

  return (
    <div style={styles.badgeBlock}>
      <div style={styles.badgeHeader}>
        <span style={styles.badgeTitulo}>{titulo}</span>
        <input
          type="text"
          value={inputValue}
          placeholder="Digite e Enter..."
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && inputValue.trim()) {
              setItens([...itens, inputValue.trim()]);
              setInputValue('');
            }
          }}
          style={styles.badgeInput}
        />
      </div>
      <div style={styles.badgeList}>
        {itens.map((item, i) => (
          <div key={i} style={{ ...styles.badge, borderColor: obterCorBadge(item) }}>
            <span>{item}</span>
            <button onClick={() => setItens(itens.filter((_, j) => j !== i))} style={styles.badgeX}>x</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// FUNÇÃO AUXILIAR: COR DA BADGE
// ============================================================
function obterCorBadge(texto: string): string {
  const txt = texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (txt.includes('sangue')) return '#CD0000';
  if (txt.includes('morte')) return '#363636';
  if (txt.includes('conhecimento')) return '#FFC125';
  if (txt.includes('energia')) return '#BF3EFF';
  if (txt.includes('medo')) return '#E8E8E8';
  if (txt.includes('balistico') || txt.includes('corte') || txt.includes('impacto') || txt.includes('perfuracao')) return '#B5B5B5';
  if (txt.includes('calor')) return '#FF4500';
  if (txt.includes('frio')) return '#98F5FF';
  if (txt.includes('eletricidade')) return '#FFFF00';
  if (txt.includes('quimico')) return '#00EE00';
  if (txt.includes('mental') || txt.includes('mentais')) return '#436EEE';
  if (txt.includes('arma') && txt.includes('simples')) return '#BCD2EE';
  if (txt.includes('arma') && txt.includes('tatica')) return '#A2B5CD';
  if (txt.includes('arma') && txt.includes('pesada')) return '#6E7B8B';
  if (txt.includes('leve')) return '#9BCD9B';
  if (txt.includes('pesada')) return '#698B69';
  return '#4da6ff';
}

// ============================================================
// ESTILOS
// ============================================================
const styles: Record<string, React.CSSProperties> = {
  container: { width: '100%', padding: '0 20px', fontFamily: 'sans-serif' },
  titulo: {
    textAlign: 'center', textTransform: 'uppercase',
    letterSpacing: '2px', marginBottom: '40px',
  },
  grid2colunas: {
    display: 'flex', flexWrap: 'wrap', gap: '20px',
    width: '100%', justifyContent: 'space-between',
  },
  colEsquerda: { flex: '1 1 30%', minWidth: '400px' },
  colMeio: { flex: '1 1 32%', minWidth: '400px' },
  colDireita: { flex: '1 1 34%', minWidth: '350px' },
  atributosRow: {
    display: 'flex', justifyContent: 'center', gap: '20px',
    marginBottom: '30px', flexWrap: 'wrap',
  },
  atributoCircle: {
    position: 'relative', display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'transparent', borderRadius: '50%',
    width: '70px', height: '70px', border: '2px solid #444',
  },
  bonusBadge: {
    position: 'absolute', top: '-5px', right: '-5px',
    width: '24px', height: '24px', backgroundColor: '#181818',
    border: '2px solid #ffcc00', borderRadius: '50%',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
  },
  bonusInput: {
    width: '100%', backgroundColor: 'transparent', color: '#ffcc00',
    border: 'none', textAlign: 'center', fontSize: '0.8rem',
    fontWeight: 'bold', outline: 'none',
  },
  atributoLabel: { fontSize: '0.8rem', color: '#aaa', fontWeight: 'bold', marginTop: '10px' },
  atributoInput: {
    width: '100%', backgroundColor: 'transparent', color: '#fff',
    border: 'none', textAlign: 'center', fontSize: '1.6rem',
    fontWeight: 'bold', outline: 'none', marginTop: '-2px',
  },
  defesaBox: {
    marginTop: '30px', padding: '20px', border: '1px solid #333',
    borderRadius: '8px', backgroundColor: '#161616',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap',
  },
  defesaItem: { display: 'flex', alignItems: 'center', gap: '15px' },
  defesaValor: {
    border: '2px solid #fff', borderRadius: '8px',
    width: '55px', height: '55px',
    display: 'flex', justifyContent: 'center',
    alignItems: 'center', fontSize: '1.6rem', fontWeight: 'bold',
  },
  defesaLabel: { fontSize: '0.85rem', fontWeight: 'bold', color: '#aaa', letterSpacing: '1px' },
  defesaFormula: {
    display: 'flex', alignItems: 'center', gap: '5px',
    fontSize: '0.95rem', marginTop: '2px',
  },
  defesaInput: {
    width: '40px', backgroundColor: 'transparent', color: '#fff',
    border: 'none', borderBottom: '1px solid #fff',
    textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold', outline: 'none',
  },
  defesaStat: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  defesaValorPqn: {
    width: '50px', backgroundColor: 'transparent', color: '#fff',
    border: 'none', borderBottom: '1px solid #fff',
    textAlign: 'center', fontSize: '1.3rem', fontWeight: 'bold',
    outline: 'none', marginTop: '5px',
  },
  protecoesContainer: { marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' },
  badgeBlock: { display: 'flex', flexDirection: 'column', gap: '8px' },
  badgeHeader: { display: 'flex', alignItems: 'center', gap: '10px' },
  badgeTitulo: { fontWeight: 'bold', color: '#aaa', minWidth: '110px', fontSize: '0.9rem', textTransform: 'uppercase' },
  badgeInput: {
    flex: 1, backgroundColor: 'transparent', color: '#fff',
    border: 'none', borderBottom: '1px solid #444',
    padding: '5px 0', fontSize: '1rem', outline: 'none',
  },
  badgeList: { display: 'flex', flexWrap: 'wrap', gap: '8px', paddingLeft: '120px' },
  badge: {
    display: 'flex', alignItems: 'center', gap: '6px',
    backgroundColor: '#222', border: `1px solid #4da6ff`,
    borderRadius: '4px', padding: '4px 8px',
    fontSize: '0.85rem', color: '#fff',
  },
  badgeX: {
    backgroundColor: 'transparent', color: '#4da6ff',
    border: 'none', cursor: 'pointer', padding: '0 2px',
    fontSize: '0.85rem', display: 'flex', alignItems: 'center',
  },
  refazerBtn: {
    marginTop: '50px', padding: '15px', backgroundColor: '#333',
    color: '#fff', border: 'none', borderRadius: '5px',
    cursor: 'pointer', width: '100%', fontSize: '1rem', fontWeight: 'bold',
  },
};