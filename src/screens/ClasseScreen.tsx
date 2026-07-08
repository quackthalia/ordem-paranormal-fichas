import React from 'react';
import { useRPG } from '../context/RPGContext';
import { proficienciasIniciais } from '../utils/rpgRules';
import type { ClasseRPG } from '../types';

export const ClasseScreen: React.FC = () => {
  const {
    setClasse,
    setTelaAtual,
    skillCombatente1,
    setSkillCombatente1,
    setSkillCombatente2,
    skillCombatente2,
    setProficiencias,
  } = useRPG();

  const combatentePronto = skillCombatente1 !== '' && skillCombatente2 !== '';

  const escolherClasse = (novaClasse: ClasseRPG) => {
    if (!novaClasse) return;

    setClasse(novaClasse);
    setProficiencias(proficienciasIniciais(novaClasse));
    setTelaAtual('ficha');
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.titulo}>Escolha sua Classe</h1>

      <div style={styles.grid}>
        {/* COMBATENTE */}
        <div style={styles.cardCombate}>
          <h2 style={styles.tituloCombate}>Combatente</h2>
          <p style={styles.desc}>
            Treinado para lutar com todo tipo de armas, e com a força e a coragem
            para encarar os perigos de frente.
          </p>

          <div style={styles.skillsBox}>
            <div style={styles.radioGroup}>
              <label><input type="radio" name="c1" onChange={() => setSkillCombatente1('Luta')} /> Luta</label>
              <span style={{ color: '#555' }}>//</span>
              <label><input type="radio" name="c1" onChange={() => setSkillCombatente1('Pontaria')} /> Pontaria</label>
            </div>
            <div style={styles.radioGroup}>
              <label><input type="radio" name="c2" onChange={() => setSkillCombatente2('Fortitude')} /> Fortitude</label>
              <span style={{ color: '#555' }}>//</span>
              <label><input type="radio" name="c2" onChange={() => setSkillCombatente2('Reflexos')} /> Reflexos</label>
            </div>
          </div>

          <button
            onClick={() => escolherClasse('Combatente')}
            disabled={!combatentePronto}
            style={{
              ...styles.btn,
              backgroundColor: combatentePronto ? '#552222' : '#2a2a2a',
              color: combatentePronto ? '#fff' : '#666',
              cursor: combatentePronto ? 'pointer' : 'not-allowed',
            }}
          >
            Selecionar Combatente
          </button>
        </div>

        {/* ESPECIALISTA */}
        <div style={styles.cardEspec}>
          <h2 style={styles.tituloEspec}>Especialista</h2>
          <p style={styles.desc}>
            Um agente que confia mais em esperteza do que em força bruta.
          </p>
          <div style={{ margin: '20px 0', padding: '15px', minHeight: '102px' }} />
          <button
            onClick={() => escolherClasse('Especialista')}
            style={{ ...styles.btn, backgroundColor: '#222255' }}
          >
            Selecionar Especialista
          </button>
        </div>

        {/* OCULTISTA */}
        <div style={styles.cardOcult}>
          <h2 style={styles.tituloOcult}>Ocultista</h2>
          <p style={styles.desc}>
            Muitos estudiosos das entidades se perdem em busca de poder...
          </p>
          <div style={styles.rituaisBox}>
            <p style={{ fontSize: '0.95rem', color: '#d4aaff', margin: 0, fontWeight: 'bold' }}>
              Vontade & Ocultismo
            </p>
          </div>
          <button
            onClick={() => escolherClasse('Ocultista')}
            style={{ ...styles.btn, backgroundColor: '#331144' }}
          >
            Selecionar Ocultista
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%', maxWidth: '1200px', margin: '0 auto',
    padding: '30px 40px', fontFamily: 'sans-serif',
  },
  titulo: { textAlign: 'center', marginBottom: '40px' },
  grid: { display: 'flex', gap: '20px', alignItems: 'stretch' },
  cardCombate: {
    flex: 1, backgroundColor: '#1a0505', border: '1px solid #ff4444',
    padding: '25px', borderRadius: '12px', display: 'flex', flexDirection: 'column',
  },
  cardEspec: {
    flex: 1, backgroundColor: '#05051a', border: '1px solid #4444ff',
    padding: '25px', borderRadius: '12px', display: 'flex', flexDirection: 'column',
  },
  cardOcult: {
    flex: 1, backgroundColor: '#12051a', border: '1px solid #9933ff',
    padding: '25px', borderRadius: '12px', display: 'flex', flexDirection: 'column',
  },
  tituloCombate: { color: '#ff4444', marginBottom: '15px', textAlign: 'center' },
  tituloEspec: { color: '#4444ff', marginBottom: '15px', textAlign: 'center' },
  tituloOcult: { color: '#9933ff', marginBottom: '15px', textAlign: 'center' },
  desc: { fontSize: '0.9rem', color: '#ccc', flexGrow: 1, lineHeight: '1.5' },
  skillsBox: {
    margin: '20px 0', padding: '15px', backgroundColor: '#000',
    borderRadius: '8px', border: '1px solid #331111',
    minHeight: '102px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
  },
  radioGroup: {
    marginBottom: '15px', display: 'flex',
    justifyContent: 'center', alignItems: 'center', gap: '10px',
  },
  rituaisBox: {
    margin: '20px 0', padding: '15px', backgroundColor: '#000',
    borderRadius: '8px', border: '1px solid #331111',
    display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '102px',
  },
  btn: {
    padding: '15px', border: 'none', borderRadius: '8px',
    fontWeight: 'bold', width: '100%', color: '#fff', cursor: 'pointer',
  },
};