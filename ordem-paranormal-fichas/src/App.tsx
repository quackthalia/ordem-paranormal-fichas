import { useState, useEffect, useRef } from 'react'

type Tela = 'atributos' | 'classe' | 'ficha'
type ClasseRPG = 'Combatente' | 'Especialista' | 'Ocultista' | null

function App() {
  // --- 1. ESTADOS DA APLICAÇÃO ---
  const [telaAtual, setTelaAtual] = useState<Tela>('atributos')
  const [classe, setClasse] = useState<ClasseRPG>(null)
  const [nex, setNex] = useState<number>(5)
  const [atributos, setAtributos] = useState({ FOR: 1, AGI: 1, INT: 1, PRE: 1, VIG: 1 })

  // Valores ATUAIS das barras
  const [pvAtual, setPvAtual] = useState<number>(-1)
  const [sanAtual, setSanAtual] = useState<number>(-1)
  const [peAtual, setPeAtual] = useState<number>(-1)

  // O "Gravador" que lembra os valores máximos da última vez que o site renderizou
  const prevMaxes = useRef({ pv: 0, san: 0, pe: 0 })

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

  // --- 3. MATEMÁTICA DOS STATUS MÁXIMOS ---
  const nivel = nex === 99 ? 20 : Math.floor(nex / 5)
  let maxPv = 0, maxPe = 0, maxSan = 0
  const peTurno = nivel

  if (classe === 'Combatente') {
    maxPv = (20 + atributos.VIG) + ((nivel - 1) * (4 + atributos.VIG))
    maxPe = (2 + atributos.PRE) + ((nivel - 1) * (2 + atributos.PRE))
    maxSan = 12 + ((nivel - 1) * 3)
  } else if (classe === 'Especialista') {
    maxPv = (16 + atributos.VIG) + ((nivel - 1) * (3 + atributos.VIG))
    maxPe = (3 + atributos.PRE) + ((nivel - 1) * (3 + atributos.PRE))
    maxSan = 16 + ((nivel - 1) * 4)
  } else if (classe === 'Ocultista') {
    maxPv = (12 + atributos.VIG) + ((nivel - 1) * (2 + atributos.VIG))
    maxPe = (4 + atributos.PRE) + ((nivel - 1) * (4 + atributos.PRE))
    maxSan = 20 + ((nivel - 1) * 5)
  }

  // --- 4. NOVO RITUAL DE SINCRONIZAÇÃO (Aplica o ganho/perda no Atual) ---
  useEffect(() => {
    if (classe) {
      if (pvAtual === -1) {
        // Primeira vez carregando a ficha: começa 100% cheio
        setPvAtual(maxPv)
        setSanAtual(maxSan)
        setPeAtual(maxPe)
        prevMaxes.current = { pv: maxPv, san: maxSan, pe: maxPe }
      } else {
        // Calcula quanto ganhou ou perdeu de limite máximo
        const deltaPv = maxPv - prevMaxes.current.pv
        const deltaSan = maxSan - prevMaxes.current.san
        const deltaPe = maxPe - prevMaxes.current.pe

        // Soma/subtrai a diferença diretamente no seu valor ATUAL
        if (deltaPv !== 0) setPvAtual(prev => Math.max(0, Math.min(maxPv, prev + deltaPv)))
        if (deltaSan !== 0) setSanAtual(prev => Math.max(0, Math.min(maxSan, prev + deltaSan)))
        if (deltaPe !== 0) setPeAtual(prev => Math.max(0, Math.min(maxPe, prev + deltaPe)))

        // Atualiza o gravador para a próxima mudança
        prevMaxes.current = { pv: maxPv, san: maxSan, pe: maxPe }
      }
    }
  }, [maxPv, maxSan, maxPe, classe])

  // --- 5. CONTROLE DAS SETAS MANUAIS ---
  const alterarStatus = (tipo: 'pv' | 'san' | 'pe', qtd: number) => {
    if (tipo === 'pv') setPvAtual(prev => Math.max(0, Math.min(maxPv, prev + qtd)))
    if (tipo === 'san') setSanAtual(prev => Math.max(0, Math.min(maxSan, prev + qtd)))
    if (tipo === 'pe') setPeAtual(prev => Math.max(0, Math.min(maxPe, prev + qtd)))
  }

  const estiloBotaoSeta = {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: '0 8px',
    fontWeight: 'bold',
    userSelect: 'none' as const
  }

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', backgroundColor: '#121212', color: '#fff', minHeight: '100vh' }}>
      
      {/* TELA 1: ATRIBUTOS */}
      {telaAtual === 'atributos' && (
        <div>
          <h1>Criação de Personagem: Atributos</h1>
          <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #333', borderRadius: '5px' }}>
            <label htmlFor="nex-select-init" style={{ marginRight: '10px', fontWeight: 'bold' }}>Escolha o NEX Inicial:</label>
            <select 
              id="nex-select-init"
              value={nex} 
              onChange={(e) => {
                setNex(Number(e.target.value))
                setAtributos({ FOR: 1, AGI: 1, INT: 1, PRE: 1, VIG: 1 })
              }}
              style={{ padding: '5px', backgroundColor: '#222', color: '#fff', border: '1px solid #555' }}
            >
              {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99].map(n => (
                <option key={n} value={n}>{n}%</option>
              ))}
            </select>
          </div>

          <div style={{ fontSize: '1.2rem', marginBottom: '25px', color: pontosRestantes < 0 ? '#ff4d4d' : '#4dff4d' }}>
            <strong>Pontos Restantes: {pontosRestantes}</strong>
          </div>

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

          <button onClick={() => setTelaAtual('classe')} style={{ padding: '15px 30px', fontSize: '1.2rem', backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Avançar para Classe ➔
          </button>
        </div>
      )}

      {/* TELA 2: CLASSE */}
      {telaAtual === 'classe' && (
        <div>
          <h1>Escolha sua Trilha (Classe)</h1>
          <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
            <button onClick={() => setTelaAtual('ficha')} style={{ padding: '20px', fontSize: '1.2rem', cursor: 'pointer', backgroundColor: '#552222', color: '#fff', border: '2px solid #ff4444', borderRadius: '8px' }} onClickCapture={() => setClasse('Combatente')}>Combatente</button>
            <button onClick={() => setTelaAtual('ficha')} style={{ padding: '20px', fontSize: '1.2rem', cursor: 'pointer', backgroundColor: '#222255', color: '#fff', border: '2px solid #4444ff', borderRadius: '8px' }} onClickCapture={() => setClasse('Especialista')}>Especialista</button>
            <button onClick={() => setTelaAtual('ficha')} style={{ padding: '20px', fontSize: '1.2rem', cursor: 'pointer', backgroundColor: '#331144', color: '#fff', border: '2px solid #9933ff', borderRadius: '8px' }} onClickCapture={() => setClasse('Ocultista')}>Ocultista</button>
          </div>
        </div>
      )}

      {/* TELA 3: FICHA FINAL */}
      {telaAtual === 'ficha' && (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px' }}>Ficha de {classe}</h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: 'bold', color: '#aaa' }}>NEX</span>
              <select 
                value={nex} 
                onChange={(e) => setNex(Number(e.target.value))}
                style={{ padding: '5px 10px', backgroundColor: '#121212', color: '#fff', border: '1px solid #fff', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99].map(n => (
                  <option key={n} value={n}>{n}%</option>
                ))}
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <div style={{ padding: '5px 15px', border: '1px solid #fff', fontSize: '1.2rem', fontWeight: 'bold' }}>{peTurno}</div>
               <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#aaa', marginTop: '5px' }}>PE / TURNO</span>
            </div>
          </div>

          {/* Atributos Editáveis */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px', flexWrap: 'wrap' }}>
            {(Object.keys(atributos) as Array<keyof typeof atributos>).map((nome) => (
              <div key={nome} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#1a1a1a', padding: '15px', borderRadius: '50%', width: '70px', height: '70px', border: '2px solid #444' }}>
                <span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 'bold' }}>{nome}</span>
                <input 
                  type="number" 
                  value={atributos[nome]}
                  onChange={(e) => setAtributos({ ...atributos, [nome]: Number(e.target.value) })}
                  style={{ width: '40px', backgroundColor: 'transparent', color: '#fff', border: 'none', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', outline: 'none' }}
                />
              </div>
            ))}
          </div>

          {/* Barras de Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* VIDA (PV) */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontWeight: 'bold', color: '#ccc', fontSize: '0.9rem' }}>VIDA</span>
              <div style={{ backgroundColor: '#220000', border: '1px solid #ff4d4d', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <button onClick={() => alterarStatus('pv', -5)} style={estiloBotaoSeta}>«</button>
                  <button onClick={() => alterarStatus('pv', -1)} style={estiloBotaoSeta}>‹</button>
                </div>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{pvAtual} / {maxPv}</span>
                <div>
                  <button onClick={() => alterarStatus('pv', 1)} style={estiloBotaoSeta}>›</button>
                  <button onClick={() => alterarStatus('pv', 5)} style={estiloBotaoSeta}>»</button>
                </div>
              </div>
            </div>

            {/* SANIDADE (SAN) */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontWeight: 'bold', color: '#ccc', fontSize: '0.9rem' }}>SANIDADE</span>
              <div style={{ backgroundColor: '#1a0033', border: '1px solid #9933ff', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <button onClick={() => alterarStatus('san', -5)} style={estiloBotaoSeta}>«</button>
                  <button onClick={() => alterarStatus('san', -1)} style={estiloBotaoSeta}>‹</button>
                </div>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{sanAtual} / {maxSan}</span>
                <div>
                  <button onClick={() => alterarStatus('san', 1)} style={estiloBotaoSeta}>›</button>
                  <button onClick={() => alterarStatus('san', 5)} style={estiloBotaoSeta}>»</button>
                </div>
              </div>
            </div>

            {/* PONTOS DE ESFORÇO (PE) */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontWeight: 'bold', color: '#ccc', fontSize: '0.9rem' }}>ESFORÇO</span>
              <div style={{ backgroundColor: '#331a00', border: '1px solid #ff9900', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <button onClick={() => alterarStatus('pe', -5)} style={estiloBotaoSeta}>«</button>
                  <button onClick={() => alterarStatus('pe', -1)} style={estiloBotaoSeta}>‹</button>
                </div>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{peAtual} / {maxPe}</span>
                <div>
                  <button onClick={() => alterarStatus('pe', 1)} style={estiloBotaoSeta}>›</button>
                  <button onClick={() => alterarStatus('pe', 5)} style={estiloBotaoSeta}>»</button>
                </div>
              </div>
            </div>

          </div>

          <button 
            onClick={() => { 
              setPvAtual(-1); setSanAtual(-1); setPeAtual(-1);
              setTelaAtual('atributos'); 
            }} 
            style={{ marginTop: '50px', padding: '10px', backgroundColor: 'transparent', color: '#666', border: 'none', cursor: 'pointer', width: '100%' }}
          >
            Reiniciar Ficha
          </button>
        </div>
      )}

    </div>
  )
}

export default App