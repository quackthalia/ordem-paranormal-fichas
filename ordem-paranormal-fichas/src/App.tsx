
import React, { useState, useEffect, useRef } from 'react'

type Tela = 'atributos' | 'classe' | 'ficha'
type ClasseRPG = 'Combatente' | 'Especialista' | 'Ocultista' | null
type AtributoKey = 'FOR' | 'AGI' | 'INT' | 'PRE' | 'VIG'

interface Pericia {
  atributo: AtributoKey
  treino: number
  outros: number
}

function App() {
  // --- 1. ESTADOS DA APLICAÇÃO ---
  const [telaAtual, setTelaAtual] = useState<Tela>('atributos')
  const [classe, setClasse] = useState<ClasseRPG>(null)
  const [nex, setNex] = useState<number>(5)
  
  const [atributos, setAtributos] = useState({ FOR: 1, AGI: 1, INT: 1, PRE: 1, VIG: 1 })
  const [bonusAtributos, setBonusAtributos] = useState({ FOR: 0, AGI: 0, INT: 0, PRE: 0, VIG: 0 })

  const [pvAtual, setPvAtual] = useState<number>(-1)
  const [sanAtual, setSanAtual] = useState<number>(-1)
  const [peAtual, setPeAtual] = useState<number>(-1)

  const [pvMax, setPvMax] = useState<number>(0)
  const [sanMax, setSanMax] = useState<number>(0)
  const [peMax, setPeMax] = useState<number>(0)

  const [hasPvTemp, setHasPvTemp] = useState<boolean>(false)
  const [pvTempAtual, setPvTempAtual] = useState<number>(0)
  const [pvTempMax, setPvTempMax] = useState<number>(0)

  const [hasPeTemp, setHasPeTemp] = useState<boolean>(false)
  const [peTempAtual, setPeTempAtual] = useState<number>(0)
  const [peTempMax, setPeTempMax] = useState<number>(0)

  // CONTROLES DO COMBATENTE
  const [skillCombatente1, setSkillCombatente1] = useState<string>('')
  const [skillCombatente2, setSkillCombatente2] = useState<string>('')

  // --- ESTADO DAS PERÍCIAS (28 NO TOTAL) ---
  const periciasIniciais: Record<string, Pericia> = {
    Acrobacia: { atributo: 'AGI', treino: 0, outros: 0 },
    Adestramento: { atributo: 'PRE', treino: 0, outros: 0 },
    Artes: { atributo: 'PRE', treino: 0, outros: 0 },
    Atletismo: { atributo: 'FOR', treino: 0, outros: 0 },
    Atualidades: { atributo: 'INT', treino: 0, outros: 0 },
    Ciências: { atributo: 'INT', treino: 0, outros: 0 },
    Crime: { atributo: 'AGI', treino: 0, outros: 0 },
    Diplomacia: { atributo: 'PRE', treino: 0, outros: 0 }, 
    Enganação: { atributo: 'PRE', treino: 0, outros: 0 },
    Fortitude: { atributo: 'VIG', treino: 0, outros: 0 },
    Furtividade: { atributo: 'AGI', treino: 0, outros: 0 },
    Iniciativa: { atributo: 'AGI', treino: 0, outros: 0 },
    Intimidação: { atributo: 'PRE', treino: 0, outros: 0 },
    Intuição: { atributo: 'INT', treino: 0, outros: 0 },
    Investigação: { atributo: 'INT', treino: 0, outros: 0 },
    Luta: { atributo: 'FOR', treino: 0, outros: 0 },
    Medicina: { atributo: 'INT', treino: 0, outros: 0 },
    Ocultismo: { atributo: 'INT', treino: 0, outros: 0 },
    Percepção: { atributo: 'PRE', treino: 0, outros: 0 },
    Pilotagem: { atributo: 'AGI', treino: 0, outros: 0 },
    Pontaria: { atributo: 'AGI', treino: 0, outros: 0 },
    Profissão: { atributo: 'INT', treino: 0, outros: 0 },
    Reflexos: { atributo: 'AGI', treino: 0, outros: 0 },
    Religião: { atributo: 'PRE', treino: 0, outros: 0 },
    Sobrevivência: { atributo: 'INT', treino: 0, outros: 0 },
    Tática: { atributo: 'INT', treino: 0, outros: 0 },
    Tecnologia: { atributo: 'INT', treino: 0, outros: 0 },
    Vontade: { atributo: 'PRE', treino: 0, outros: 0 },
  }

  const [pericias, setPericias] = useState<Record<string, Pericia>>(JSON.parse(JSON.stringify(periciasIniciais)))
  const prevCalc = useRef({ pv: 0, san: 0, pe: 0, init: false })

  // CONTROLES DE DEFESA, BLOQUEIO E ESQUIVA (Movido para cá para ler 'pericias' corretamente)
  const [defEquip, setDefEquip] = useState<number>(0)
  const [defOutros, setDefOutros] = useState<number>(0)
  const [bloqueio, setBloqueio] = useState<number>(0)
  const [esquiva, setEsquiva] = useState<number>(0)

  // Controle para ativar/desativar as limitações automáticas de perícia
  const [limitarPericias, setLimitarPericias] = useState<boolean>(true)

const defesaTotal = 10 + atributos.AGI + bonusAtributos.AGI + defEquip + defOutros

  useEffect(() => {
    const bonusFortitude = pericias.Fortitude.treino + pericias.Fortitude.outros
    setBloqueio(bonusFortitude)
  }, [pericias.Fortitude.treino, pericias.Fortitude.outros])

  useEffect(() => {
    const bonusReflexos = pericias.Reflexos.treino + pericias.Reflexos.outros
    setEsquiva(defesaTotal + bonusReflexos)
  }, [defesaTotal, pericias.Reflexos.treino, pericias.Reflexos.outros])


  // --- 2. LÓGICA DE PONTOS (TELA 1) ---
  const capMaximo = nex === 5 ? 3 : 5
  let pontosIniciaisDoNex = 4
  if (nex >= 20) pontosIniciaisDoNex += 1
  if (nex >= 50) pontosIniciaisDoNex += 1
  if (nex >= 80) pontosIniciaisDoNex += 1
  if (nex >= 95) pontosIniciaisDoNex += 1

  let pontosGastos = 0
  let bonusPorAtributoZero = 0
  Object.values(atributos).forEach((valor) => {
    if (valor === 0) bonusPorAtributoZero += 1
    else if (valor > 1) pontosGastos += (valor - 1)
  })
  const pontosTotaisDisponiveis = pontosIniciaisDoNex + bonusPorAtributoZero
  const pontosRestantes = pontosTotaisDisponiveis - pontosGastos

  const alterarAtributo = (nome: keyof typeof atributos, operacao: 'aumentar' | 'diminuir') => {
    const valorAtual = atributos[nome]
    if (operacao === 'aumentar' && pontosRestantes > 0 && valorAtual < capMaximo) {
      setAtributos({ ...atributos, [nome]: valorAtual + 1 })
    } else if (operacao === 'diminuir') {
      if (valorAtual === 1 && Object.values(atributos).filter(v => v === 0).length >= 1) return
      if (valorAtual > 0) setAtributos({ ...atributos, [nome]: valorAtual - 1 })
    }
  }

  // --- 3. MATEMÁTICA DOS STATUS BASE ---
  const nivel = nex === 99 ? 20 : Math.floor(nex / 5)
  let calcMaxPv = 0, calcMaxPe = 0, calcMaxSan = 0
  const peTurno = nivel

  if (classe === 'Combatente') {
    calcMaxPv = (20 + atributos.VIG) + ((nivel - 1) * (4 + atributos.VIG))
    calcMaxPe = (2 + atributos.PRE) + ((nivel - 1) * (2 + atributos.PRE))
    calcMaxSan = 12 + ((nivel - 1) * 3)
  } else if (classe === 'Especialista') {
    calcMaxPv = (16 + atributos.VIG) + ((nivel - 1) * (3 + atributos.VIG))
    calcMaxPe = (3 + atributos.PRE) + ((nivel - 1) * (3 + atributos.PRE))
    calcMaxSan = 16 + ((nivel - 1) * 4)
  } else if (classe === 'Ocultista') {
    calcMaxPv = (12 + atributos.VIG) + ((nivel - 1) * (2 + atributos.VIG))
    calcMaxPe = (4 + atributos.PRE) + ((nivel - 1) * (4 + atributos.PRE))
    calcMaxSan = 20 + ((nivel - 1) * 5)
  }

//  4. RITUAL DE SINCRONIZAÇÃO CORRIGIDO (SEM -1)
  useEffect(() => {
    if (!classe) return;

    if (!prevCalc.current.init) {
      // Primeira vez carregando a ficha: define o valor atual igual ao máximo correto
      setPvMax(calcMaxPv);
      setPvAtual(calcMaxPv);
      setSanMax(calcMaxSan);
      setSanAtual(calcMaxSan);
      setPeMax(calcMaxPe);
      setPeAtual(calcMaxPe);
      
      prevCalc.current = { pv: calcMaxPv, san: calcMaxSan, pe: calcMaxPe, init: true };
    } else {
      // Quando muda o NEX ou Atributos, calcula apenas a diferença (delta)
      const deltaPv = calcMaxPv - prevCalc.current.pv;
      const deltaSan = calcMaxSan - prevCalc.current.san;
      const deltaPe = calcMaxPe - prevCalc.current.pe;

      if (deltaPv !== 0) {
        setPvMax(calcMaxPv);
        setPvAtual(prev => (prev === -1 ? calcMaxPv : Math.max(0, prev + deltaPv)));
      }
      if (deltaSan !== 0) {
        setSanMax(calcMaxSan);
        setSanAtual(prev => (prev === -1 ? calcMaxSan : Math.max(0, prev + deltaSan)));
      }
      if (deltaPe !== 0) {
        setPeMax(calcMaxPe);
        setPeAtual(prev => (prev === -1 ? calcMaxPe : Math.max(0, prev + deltaPe)));
      }

      prevCalc.current = { pv: calcMaxPv, san: calcMaxSan, pe: calcMaxPe, init: true };
    }
  }, [calcMaxPv, calcMaxSan, calcMaxPe, classe]);

  // --- 5. CONTROLES DA INTERFACE ---
  const alterarStatus = (tipo: 'pv' | 'san' | 'pe', qtd: number) => {
    if (tipo === 'pv') setPvAtual(prev => Math.max(0, Math.min(pvMax, prev + qtd)))
    if (tipo === 'san') setSanAtual(prev => Math.max(0, Math.min(sanMax, prev + qtd)))
    if (tipo === 'pe') setPeAtual(prev => Math.max(0, Math.min(peMax, prev + qtd)))
  }

  const bloquearLetras = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
      e.preventDefault()
    }
  }

// --- 1. MATEMÁTICA DE PERÍCIAS (REGRAS OFICIAIS ACUMULATIVAS) ---
  let maxTreinadas = 0;
  let maxUpgrades = 0; // Reserva única de pontos de Aumentar Grau (Veterano ou Expert)

  // Define os limites base de cada classe
  if (classe === 'Combatente') {
    maxTreinadas = 1 + atributos.INT;
    if (nex >= 35) maxUpgrades += (2 + atributos.INT);
    if (nex >= 70) maxUpgrades += (2 + atributos.INT);
  } else if (classe === 'Especialista') {
    maxTreinadas = 7 + atributos.INT;
    if (nex >= 35) maxUpgrades += (5 + atributos.INT);
    if (nex >= 70) maxUpgrades += (5 + atributos.INT);
  } else if (classe === 'Ocultista') {
    maxTreinadas = 3 + atributos.INT;
    if (nex >= 35) maxUpgrades += (3 + atributos.INT);
    if (nex >= 70) maxUpgrades += (3 + atributos.INT);
  }

  // Identifica quais perícias vieram automáticas da classe para NÃO contá-las no limite máximo
  const periciasGratis: string[] = [];
  if (classe === 'Ocultista') {
    periciasGratis.push('Vontade', 'Ocultismo');
  } else if (classe === 'Combatente') {
    if (skillCombatente1) periciasGratis.push(skillCombatente1);
    if (skillCombatente2) periciasGratis.push(skillCombatente2);
  }

  let totalTreinadasUsadas = 0;
  let totalUpgradesGastos = 0;

  Object.entries(pericias).forEach(([nome, dados]) => {
    // Só conta no limite de "Treinar" se o usuário treinou E não é uma perícia grátis da classe
    if (dados.treino >= 5) {
      if (!periciasGratis.includes(nome)) {
        totalTreinadasUsadas += 1;
      }
    }

    // Regra de Upgrades (Aumentar Grau)
    if (dados.treino === 10) {
      totalUpgradesGastos += 1;
    } else if (dados.treino === 15) {
      totalUpgradesGastos += 2;
    }
  });

const handleMudarPericia = (nome: string, campo: keyof Pericia, valor: any) => {
    // Se NÃO estiver liberado (caixinha "Liberar Perícias" desmarcada), aplica as regras oficiais
    if (campo === 'treino' && !limitarPericias) {
      const novoValor = Number(valor);
      
      // BLOQUEIO SILENCIOSO: Impede o usuário de destreinar (< 5) as perícias obrigatórias da classe
      if (novoValor < 5 && periciasGratis.includes(nome)) {
        return;
      }

      // BLOQUEIO SILENCIOSO: NEX mínimo exigido pelo livro
      if (novoValor === 10 && nex < 35) {
        return;
      }
      if (novoValor === 15 && nex < 70) {
        return;
      }

      // Simulação em tempo real para verificar se estoura os limites máximos
      const periciasSimuladas = {
        ...pericias,
        [nome]: { ...pericias[nome], treino: novoValor }
      };

      let simTreinadas = 0;
      let simUpgrades = 0;

      Object.entries(periciasSimuladas).forEach(([n, d]) => {
        if (d.treino >= 5 && !periciasGratis.includes(n)) {
          simTreinadas += 1;
        }
        if (d.treino === 10) simUpgrades += 1;
        else if (d.treino === 15) simUpgrades += 2;
      });

      // BLOQUEIO SILENCIOSO: Se estourar o limite de vagas para Treinar
      if (simTreinadas > maxTreinadas) {
        return;
      }
      
      // BLOQUEIO SILENCIOSO: Se estourar a reserva de pontos de Aumentar Grau
      if (simUpgrades > maxUpgrades) {
        return;
      }
    }

    // Se passou por todas as regras (ou se o "Liberar Perícias" estiver ativado), atualiza o estado normalmente
    setPericias(prev => ({
      ...prev,
      [nome]: { ...prev[nome], [campo]: valor }
    }));
  };
  const escolherClasse = (novaClasse: ClasseRPG) => {
    let novasPericias = JSON.parse(JSON.stringify(periciasIniciais));

    if (novaClasse === 'Ocultista') {
      novasPericias['Vontade'].treino = 5;
      novasPericias['Ocultismo'].treino = 5;
    } else if (novaClasse === 'Combatente') {
      if (!skillCombatente1 || !skillCombatente2) return;
      novasPericias[skillCombatente1].treino = 5;
      novasPericias[skillCombatente2].treino = 5;
    }

    setPericias(novasPericias);
    setClasse(novaClasse);
    setTelaAtual('ficha');
  }

  const estiloBotaoSeta = { background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', padding: '0 8px', fontWeight: 'bold', userSelect: 'none' as const }
  const estiloInputMaximo = { width: '45px', backgroundColor: 'transparent', color: '#fff', border: 'none', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold', outline: 'none' }
  const estiloInputTemp = { width: '35px', backgroundColor: 'transparent', color: '#fff', border: 'none', textAlign: 'center', fontSize: '1rem', fontWeight: 'bold', outline: 'none' }
  const estiloSelectDropdown = { backgroundColor: 'transparent', color: '#fff', border: 'none', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', outline: 'none', textAlign: 'center' as const, appearance: 'none' as const }

  const combatentePronto = skillCombatente1 !== '' && skillCombatente2 !== ''

  return (
    <div style={{ padding: '30px 40px', fontFamily: 'sans-serif', backgroundColor: '#121212', color: '#fff', minHeight: '100vh', width: '100vw', boxSizing: 'border-box' }}>
      
      <style dangerouslySetInnerHTML={{ __html: `
        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          background-color: #121212;
          overflow-x: hidden;
        }
        * { box-sizing: border-box; }
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        select option { background-color: #1a1a1a; color: #fff; }
      `}} />
      
      {telaAtual === 'atributos' && (
        <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
          <h1>Criação de Personagem: Atributos</h1>
          <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #333', borderRadius: '5px' }}>
            <label htmlFor="nex-select-init" style={{ marginRight: '10px', fontWeight: 'bold' }}>Escolha o NEX Inicial:</label>
            <select id="nex-select-init" value={nex} onChange={(e) => setNex(Number(e.target.value))} style={{ padding: '5px', backgroundColor: '#222', color: '#fff', border: '1px solid #555' }}>
              {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99].map(n => <option key={n} value={n}>{n}%</option>)}
            </select>
          </div>
          <div style={{ fontSize: '1.2rem', marginBottom: '25px', color: pontosRestantes < 0 ? '#ff4d4d' : '#4dff4d' }}><strong>Pontos Restantes: {pontosRestantes}</strong></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', marginBottom: '30px' }}>
            {(Object.keys(atributos) as Array<keyof typeof atributos>).map((nome) => (
              <div key={nome} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#1e1e1e', borderRadius: '5px' }}>
                <span style={{ fontWeight: 'bold', width: '50px' }}>{nome}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <button onClick={() => alterarAtributo(nome, 'diminuir')} disabled={atributos[nome] === 0 || (atributos[nome] === 1 && Object.values(atributos).filter(v => v === 0).length >= 1)} style={{ width: '35px', height: '35px', backgroundColor: (atributos[nome] === 0 || (atributos[nome] === 1 && Object.values(atributos).filter(v => v === 0).length >= 1)) ? '#555' : '#cc3333', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>-</button>
                  <span style={{ fontSize: '1.5rem', minWidth: '20px', textAlign: 'center' }}>{atributos[nome]}</span>
                  <button onClick={() => alterarAtributo(nome, 'aumentar')} disabled={pontosRestantes <= 0 || atributos[nome] >= capMaximo} style={{ width: '35px', height: '35px', backgroundColor: (pontosRestantes <= 0 || atributos[nome] >= capMaximo) ? '#555' : '#33cc33', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>+</button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setTelaAtual('classe')} style={{ padding: '15px 30px', fontSize: '1.2rem', backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Avançar para Classe ➔</button>
        </div>
      )}

      {telaAtual === 'classe' && (
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>Escolha sua Classe</h1>
          
          <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch' }}>
            
            {/* BLOCO COMBATENTE */}
            <div style={{ flex: 1, backgroundColor: '#1a0505', border: '1px solid #ff4444', padding: '25px', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ color: '#ff4444', marginBottom: '15px', textAlign: 'center' }}>Combatente</h2>
              <p style={{ fontSize: '0.9rem', color: '#ccc', flexGrow: 1, lineHeight: '1.5' }}>Treinado para lutar com todo tipo de armas, e com a força e a coragem para encarar os perigos de frente. É o tipo de agente que prefere abordagens mais diretas e costuma atirar primeiro e perguntar depois.</p>
              
              <div style={{ margin: '20px 0', padding: '15px', backgroundColor: '#000', borderRadius: '8px', border: '1px solid #331111', minHeight: '102px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                  <label style={{ cursor: 'pointer' }}><input type="radio" name="c1" onChange={() => setSkillCombatente1('Luta')} /> Luta</label>
                  <span style={{ color: '#555' }}>//</span>
                  <label style={{ cursor: 'pointer' }}><input type="radio" name="c1" onChange={() => setSkillCombatente1('Pontaria')} /> Pontaria</label>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                  <label style={{ cursor: 'pointer' }}><input type="radio" name="c2" onChange={() => setSkillCombatente2('Fortitude')} /> Fortitude</label>
                  <span style={{ color: '#555' }}>//</span>
                  <label style={{ cursor: 'pointer' }}><input type="radio" name="c2" onChange={() => setSkillCombatente2('Reflexos')} /> Reflexos</label>
                </div>
              </div>

              <button 
                onClick={() => escolherClasse('Combatente')} 
                disabled={!combatentePronto}
                style={{ 
                  padding: '15px', 
                  cursor: combatentePronto ? 'pointer' : 'not-allowed', 
                  backgroundColor: combatentePronto ? '#552222' : '#2a2a2a', 
                  color: combatentePronto ? '#fff' : '#666', 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontWeight: 'bold', 
                  width: '100%' 
                }}
              >
                Selecionar Combatente
              </button>
            </div>

            {/* BLOCO ESPECIALISTA */}
            <div style={{ flex: 1, backgroundColor: '#05051a', border: '1px solid #4444ff', padding: '25px', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ color: '#4444ff', marginBottom: '15px', textAlign: 'center' }}>Especialista</h2>
              <p style={{ fontSize: '0.9rem', color: '#ccc', flexGrow: 1, lineHeight: '1.5' }}>Um agente que confia mais em esperteza do que em força bruta. Um especialista se vale de conhecimento técnico, raciocínio rápido ou mesmo lábia para resolver mistérios e enfrentar o paranormal.</p>
              
              <div style={{ margin: '20px 0', padding: '15px', backgroundColor: 'transparent', minHeight: '102px' }}>
                {/* Espaço intencionalmente vazio */}
              </div>

              <button onClick={() => escolherClasse('Especialista')} style={{ padding: '15px', cursor: 'pointer', backgroundColor: '#222255', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', width: '100%' }}>Selecionar Especialista</button>
            </div>

            {/* BLOCO OCULTISTA */}
            <div style={{ flex: 1, backgroundColor: '#12051a', border: '1px solid #9933ff', padding: '25px', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ color: '#9933ff', marginBottom: '15px', textAlign: 'center' }}>Ocultista</h2>
              <p style={{ fontSize: '0.9rem', color: '#ccc', flexGrow: 1, lineHeight: '1.5' }}>Muitos estudiosos das entidades se perdem em busca de poder, mas existem aqueles que visam compreender e dominar os mistérios paranormais para usá-los contra o próprio Outro Lado. Possui talento para se conectar com elementos paranormais.</p>
              
              <div style={{ margin: '20px 0', padding: '15px', backgroundColor: '#000', borderRadius: '8px', border: '1px solid #331111', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '102px' }}>
                <p style={{ fontSize: '0.95rem', color: '#d4aaff', margin: 0, fontWeight: 'bold' }}>Vontade & Ocultismo</p>
              </div>

              <button onClick={() => escolherClasse('Ocultista')} style={{ padding: '15px', cursor: 'pointer', backgroundColor: '#331144', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', width: '100%' }}>Selecionar Ocultista</button>
            </div>

          </div>
        </div>
      )}

      {telaAtual === 'ficha' && (
        <div style={{ width: '100%', padding: '0 20px' }}>
          <h2 style={{ textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '40px' }}>Ficha de {classe}</h2>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '60px', width: '100%', justifyContent: 'space-between' }}>
            
            {/* COLUNA ESQUERDA: Atributos e Status */}
            <div style={{ flex: '1 1 45%', minWidth: '400px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 'bold', color: '#aaa' }}>NEX</span>
                  <select value={nex} onChange={(e) => setNex(Number(e.target.value))} style={{ padding: '5px 10px', backgroundColor: '#121212', color: '#fff', border: '1px solid #fff', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99].map(n => <option key={n} value={n}>{n}%</option>)}
                  </select>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ padding: '5px 15px', border: '1px solid #fff', fontSize: '1.2rem', fontWeight: 'bold' }}>{peTurno}</div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#aaa', marginTop: '5px' }}>PE / TURNO</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
                {(Object.keys(atributos) as Array<keyof typeof atributos>).map((nome) => (
                  <div key={nome} style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent', borderRadius: '50%', width: '70px', height: '70px', border: '2px solid #444' }}>
                    <div title="Bônus (Itens/Poderes)" style={{ position: 'absolute', top: '-5px', right: '-5px', width: '24px', height: '24px', backgroundColor: '#181818', border: '2px solid #ffcc00', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <input type="number" onKeyDown={bloquearLetras} value={bonusAtributos[nome]} onChange={(e) => setBonusAtributos({ ...bonusAtributos, [nome]: Math.max(0, Number(e.target.value)) })} style={{ width: '100%', backgroundColor: 'transparent', color: '#ffcc00', border: 'none', textAlign: 'center', fontSize: '0.8rem', fontWeight: 'bold', outline: 'none' }} />
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 'bold', marginTop: '10px' }}>{nome}</span>
                    <input type="number" onKeyDown={bloquearLetras} value={atributos[nome]} onChange={(e) => setAtributos({ ...atributos, [nome]: Number(e.target.value) })} style={{ width: '100%', backgroundColor: 'transparent', color: '#fff', border: 'none', textAlign: 'center', fontSize: '1.6rem', fontWeight: 'bold', outline: 'none', marginTop: '-2px' }} />
                  </div>
                ))}
              </div>

              {/* BARRAS DE STATUS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginBottom: '30px' }}>
                {/* VIDA */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <span style={{ fontWeight: 'bold', color: '#ccc', fontSize: '0.9rem', marginLeft: '5px' }}>VIDA</span>
                    <label style={{ fontSize: '0.8rem', color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <input type="checkbox" checked={hasPvTemp} onChange={(e) => { 
                        const isChecked = e.target.checked;
                        setHasPvTemp(isChecked);
                        if (!isChecked) { setPvTempAtual(0); setPvTempMax(0); }
                      }} />
                      + Temporário
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: hasPvTemp ? '2.5' : '1', backgroundColor: '#220000', border: '1px solid #ff4d4d', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.3s' }}>
                      <div><button onClick={() => alterarStatus('pv', -5)} style={estiloBotaoSeta}>«</button><button onClick={() => alterarStatus('pv', -1)} style={estiloBotaoSeta}>‹</button></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{pvAtual}</span>
                        <span style={{ fontSize: '1.2rem', color: '#aaa' }}>/</span>
                        <input type="number" onKeyDown={bloquearLetras} value={pvMax} onChange={(e) => setPvMax(Math.max(1, Number(e.target.value)))} style={estiloInputMaximo} title="Editar Vida Máxima" />
                      </div>
                      <div><button onClick={() => alterarStatus('pv', 1)} style={estiloBotaoSeta}>›</button><button onClick={() => alterarStatus('pv', 5)} style={estiloBotaoSeta}>»</button></div>
                    </div>

                    {hasPvTemp && (
                      <div style={{ flex: '1', backgroundColor: '#331111', border: '1px dashed #ff6666', padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                        <input type="number" onKeyDown={bloquearLetras} value={pvTempAtual} onChange={(e) => setPvTempAtual(Math.max(0, Number(e.target.value)))} style={estiloInputTemp} />
                        <span style={{ color: '#aaa' }}>/</span>
                        <input type="number" onKeyDown={bloquearLetras} value={pvTempMax} onChange={(e) => setPvTempMax(Math.max(0, Number(e.target.value)))} style={estiloInputTemp} />
                      </div>
                    )}
                  </div>
                </div>

                {/* SANIDADE */}
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontWeight: 'bold', color: '#ccc', fontSize: '0.9rem', marginLeft: '5px' }}>SANIDADE</span>
                  <div style={{ backgroundColor: '#1a0033', border: '1px solid #9933ff', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
                    <div><button onClick={() => alterarStatus('san', -5)} style={estiloBotaoSeta}>«</button><button onClick={() => alterarStatus('san', -1)} style={estiloBotaoSeta}>‹</button></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{sanAtual}</span>
                      <span style={{ fontSize: '1.2rem', color: '#aaa' }}>/</span>
                      <input type="number" onKeyDown={bloquearLetras} value={sanMax} onChange={(e) => setSanMax(Math.max(1, Number(e.target.value)))} style={estiloInputMaximo} title="Editar Sanidade Máxima" />
                    </div>
                    <div><button onClick={() => alterarStatus('san', 1)} style={estiloBotaoSeta}>›</button><button onClick={() => alterarStatus('san', 5)} style={estiloBotaoSeta}>»</button></div>
                  </div>
                </div>

                {/* ESFORÇO */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <span style={{ fontWeight: 'bold', color: '#ccc', fontSize: '0.9rem', marginLeft: '5px' }}>ESFORÇO</span>
                    <label style={{ fontSize: '0.8rem', color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <input type="checkbox" checked={hasPeTemp} onChange={(e) => { 
                        const isChecked = e.target.checked;
                        setHasPeTemp(isChecked);
                        if (!isChecked) { setPeTempAtual(0); setPeTempMax(0); }
                      }} />
                      + Temporário
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: hasPeTemp ? '2.5' : '1', backgroundColor: '#331a00', border: '1px solid #ff9900', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.3s' }}>
                      <div><button onClick={() => alterarStatus('pe', -5)} style={estiloBotaoSeta}>«</button><button onClick={() => alterarStatus('pe', -1)} style={estiloBotaoSeta}>‹</button></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{peAtual}</span>
                        <span style={{ fontSize: '1.2rem', color: '#aaa' }}>/</span>
                        <input type="number" onKeyDown={bloquearLetras} value={peMax} onChange={(e) => setPeMax(Math.max(1, Number(e.target.value)))} style={estiloInputMaximo} title="Editar PE Máximo" />
                      </div>
                      <div><button onClick={() => alterarStatus('pe', 1)} style={estiloBotaoSeta}>›</button><button onClick={() => alterarStatus('pe', 5)} style={estiloBotaoSeta}>»</button></div>
                    </div>

                    {hasPeTemp && (
                      <div style={{ flex: '1', backgroundColor: '#332200', border: '1px dashed #ffcc00', padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                        <input type="number" onKeyDown={bloquearLetras} value={peTempAtual} onChange={(e) => setPeTempAtual(Math.max(0, Number(e.target.value)))} style={estiloInputTemp} />
                        <span style={{ color: '#aaa' }}>/</span>
                        <input type="number" onKeyDown={bloquearLetras} value={peTempMax} onChange={(e) => setPeTempMax(Math.max(0, Number(e.target.value)))} style={estiloInputTemp} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* BLOCO DE DEFESA, BLOQUEIO E ESQUIVA */}
                <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #333', borderRadius: '8px', backgroundColor: '#161616', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
                  
                  {/* DEFESA */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ border: '2px solid #fff', borderRadius: '8px', width: '55px', height: '55px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.6rem', fontWeight: 'bold' }}>
                      {defesaTotal}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#aaa', letterSpacing: '1px' }}>DEFESA</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.95rem', marginTop: '2px' }}>
                        <span>= 10 + AGI +</span>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <input 
                            type="number" 
                            onKeyDown={bloquearLetras} 
                            value={defEquip === 0 ? '' : defEquip} 
                            placeholder="0"
                            onChange={(e) => setDefEquip(Math.max(0, Number(e.target.value)))} 
                            style={{ width: '40px', backgroundColor: 'transparent', color: '#fff', border: 'none', borderBottom: '1px solid #fff', textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold', outline: 'none' } as React.CSSProperties} 
                          />
                          <span style={{ fontSize: '0.65rem', color: '#777', marginTop: '2px' }}>Equip.</span>
                        </div>
                        <span>+</span>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <input 
                            type="number" 
                            onKeyDown={bloquearLetras} 
                            value={defOutros === 0 ? '' : defOutros} 
                            placeholder="0"
                            onChange={(e) => setDefOutros(Math.max(0, Number(e.target.value)))} 
                            style={{ width: '40px', backgroundColor: 'transparent', color: '#fff', border: 'none', borderBottom: '1px solid #fff', textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold', outline: 'none' } as React.CSSProperties} 
                          />
                          <span style={{ fontSize: '0.65rem', color: '#777', marginTop: '2px' }}>Outros.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BLOQUEIO */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#aaa', letterSpacing: '1px' }}>BLOQUEIO</span>
                    <input 
                      type="number" 
                      onKeyDown={bloquearLetras} 
                      value={bloqueio === 0 ? '' : bloqueio} 
                      placeholder="0"
                      onChange={(e) => setBloqueio(Math.max(0, Number(e.target.value)))} 
                      style={{ width: '50px', backgroundColor: 'transparent', color: '#fff', border: 'none', borderBottom: '1px solid #fff', textAlign: 'center', fontSize: '1.3rem', fontWeight: 'bold', outline: 'none', marginTop: '5px' } as React.CSSProperties} 
                    />
                  </div>

                  {/* ESQUIVA */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#aaa', letterSpacing: '1px' }}>ESQUIVA</span>
                    <input 
                      type="number" 
                      onKeyDown={bloquearLetras} 
                      value={esquiva === 0 ? '' : esquiva} 
                      placeholder="0"
                      onChange={(e) => setEsquiva(Math.max(0, Number(e.target.value)))} 
                      style={{ width: '50px', backgroundColor: 'transparent', color: '#fff', border: 'none', borderBottom: '1px solid #fff', textAlign: 'center', fontSize: '1.3rem', fontWeight: 'bold', outline: 'none', marginTop: '5px' } as React.CSSProperties} 
                    />
                  </div>

                </div>

            </div>

          {/* COLUNA DIREITA: Perícias */}
            <div style={{ flex: '1 1 45%', minWidth: '400px', backgroundColor: '#181818', padding: '30px', borderRadius: '8px', border: '1px solid #333' }}>
              <h3 style={{ textTransform: 'uppercase', letterSpacing: '2px', color: '#ccc', borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '25px', textAlign: 'center' }}>Perícias</h3>
{/* PAINEL COMPACTO DE REGRAS DE PERÍCIA (NOVO E MINIMALISTA) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#050505', padding: '6px 12px', borderRadius: '4px', border: '1px solid #222', marginBottom: '15px', fontSize: '0.8rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#aaa' }}>
                <input 
                  type="checkbox" 
                  checked={limitarPericias} 
                  onChange={(e) => setLimitarPericias(e.target.checked)} 
                  style={{ cursor: 'pointer' }}
                />
                Liberar Perícias
              </label>

              {/* Só exibe os pontos se o botão de liberar estiver DESLIGADO (!limitarPericias) */}
              {!limitarPericias && (
                <div style={{ display: 'flex', gap: '15px', fontWeight: 'bold' }}>
                  <span style={{ color: maxTreinadas - totalTreinadasUsadas < 0 ? '#ff4d4d' : '#8fa0f0' }}>
                    Treinar: {maxTreinadas - totalTreinadasUsadas}
                  </span>
                  <span style={{ color: maxUpgrades - totalUpgradesGastos < 0 ? '#ff4d4d' : '#68bd82' }}>
                    Aumentar Grau: {maxUpgrades - totalUpgradesGastos}
                  </span>
                </div>
              )}
            </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem', color: '#fff' }}>
                  <thead>
                    <tr style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px', borderBottom: '1px solid #444' }}>
                      <th style={{ textAlign: 'left', padding: '10px 8px' }}>Perícia</th>
                      <th style={{ padding: '10px 8px' }}>Dados</th>
                      <th style={{ padding: '10px 8px' }}>Bônus</th>
                      <th style={{ padding: '10px 8px' }}>Treino</th>
                      <th style={{ padding: '10px 8px' }}>Outros</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(pericias).map(([nome, dadosPericia]) => {
                      const totalBonus = dadosPericia.treino + dadosPericia.outros
                      
                      // LÓGICA DE CORES DOS NÍVEIS DE TREINAMENTO
                      let corTexto = '#ccc'
                      if (dadosPericia.treino === 5) corTexto = '#43a047'
                      else if (dadosPericia.treino === 10) corTexto = '#1e88e5'
                      else if (dadosPericia.treino === 15) corTexto = '#f57c00'

                      return (
                        <tr key={nome} style={{ borderBottom: '1px solid #222', backgroundColor: 'transparent' }}>
                          <td style={{ padding: '10px 8px', fontWeight: 'bold', color: corTexto }}>{nome}</td>
                          
                          <td style={{ textAlign: 'center', padding: '10px 8px', color: corTexto }}>
                            <span style={{ marginRight: '4px' }}>(</span>
                            <select 
                              value={dadosPericia.atributo} 
                              onChange={(e) => handleMudarPericia(nome, 'atributo', e.target.value)}
                              style={{ ...estiloSelectDropdown, color: corTexto }}
                            >
                              <option value="FOR">FOR</option>
                              <option value="AGI">AGI</option>
                              <option value="INT">INT</option>
                              <option value="PRE">PRE</option>
                              <option value="VIG">VIG</option>
                            </select>
                            <span style={{ marginLeft: '4px' }}>)</span>
                          </td>
                          
                          <td style={{ textAlign: 'center', padding: '10px 8px', fontWeight: 'bold', color: corTexto, fontSize: '1.05rem' }}>
                            ( {totalBonus} )
                          </td>
                          
                          <td style={{ textAlign: 'center', padding: '10px 8px' }}>
                            <select 
                              value={dadosPericia.treino} 
                              onChange={(e) => handleMudarPericia(nome, 'treino', Number(e.target.value))}
                              style={{ ...estiloSelectDropdown, borderBottom: `1px solid ${corTexto}`, width: '50px', color: corTexto }}
                            >
                              <option value={0}>0</option>
                              <option value={5}>5</option>
                              <option value={10}>10</option>
                              <option value={15}>15</option>
                            </select>
                          </td>
                          
                          <td style={{ textAlign: 'center', padding: '10px 8px' }}>
                            <input 
                              type="number" 
                              onKeyDown={bloquearLetras} 
                              value={dadosPericia.outros === 0 ? '' : dadosPericia.outros} 
                              placeholder="0"
                              onChange={(e) => handleMudarPericia(nome, 'outros', Math.max(0, Number(e.target.value)))}
                              style={{ width: '45px', backgroundColor: 'transparent', color: corTexto, border: 'none', borderBottom: `1px solid ${corTexto}`, textAlign: 'center', fontSize: '1rem', fontWeight: 'bold', outline: 'none' }}
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <button onClick={() => { 
            setPvAtual(-1); setSanAtual(-1); setPeAtual(-1); 
            setPvMax(0); setSanMax(0); setPeMax(0);
            setBonusAtributos({ FOR: 0, AGI: 0, INT: 0, PRE: 0, VIG: 0 }); 
            setHasPvTemp(false); setHasPeTemp(false); 
            setPericias(JSON.parse(JSON.stringify(periciasIniciais)));
            setSkillCombatente1(''); setSkillCombatente2('');
            prevCalc.current = { pv: 0, san: 0, pe: 0, init: false };
            setTelaAtual('atributos'); 
          }} style={{ marginTop: '50px', padding: '15px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%', fontSize: '1.1rem', fontWeight: 'bold' }}>
            Reiniciar Ficha
          </button>
        </div>
      )}

    </div>
  )
}

export default App