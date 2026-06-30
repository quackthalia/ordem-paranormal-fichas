import { useState } from 'react'

function App() {
  // 1. Estados da Ficha (coisas que mudam na tela)
  const [nex, setNex] = useState<number>(5) // Começa em 5%
  
  // Atributos começam todos em 1 por padrão
  const [atributos, setAtributos] = useState({
    FOR: 1,
    AGI: 1,
    INT: 1,
    PRE: 1,
    VIG: 1
  })

  // 2. Lógica de Regras baseada no NEX que o usuário escolheu
  // Limite máximo do atributo: 3 se for NEX 5%, senão 5.
  const capMaximo = nex === 5 ? 3 : 5

  // Quantos pontos o NEX dá por padrão de acordo com a regra:
  // 5% e 10% = 4 pontos
  // 20% = 5 pontos
  // 50% = 6 pontos
  // 80% = 7 pontos
  // 95% = 8 pontos
  let pontosIniciaisDoNex = 4
  if (nex >= 20) pontosIniciaisDoNex += 1
  if (nex >= 50) pontosIniciaisDoNex += 1
  if (nex >= 80) pontosIniciaisDoNex += 1
  if (nex >= 95) pontosIniciaisDoNex += 1

  // 3. Lógica de cálculo dos pontos gastos e bônus por valor 0
  // Começamos contando os pontos que a pessoa já gastou (tudo que ela colocou acima de 1)
  let pontosGastos = 0
  let bonusPorAtributoZero = 0

  // Passamos por cada atributo para calcular o balanço de pontos
  Object.values(atributos).forEach((valor) => {
    if (valor === 0) {
      // Se reduziu para 0, ganha 1 ponto de bônus
      bonusPorAtributoZero += 1
    } else if (valor > 1) {
      // Se aumentou além do 1 inicial, conta quantos pontos gastou
      pontosGastos += (valor - 1)
    }
  })

  // Pontos Totais Disponíveis = Iniciais do NEX + Bônus de Zeros
  const pontosTotaisDisponiveis = pontosIniciaisDoNex + bonusPorAtributoZero
  const pontosRestantes = pontosTotaisDisponiveis - pontosGastos

  // 4. Funções para os botões de + e -
  const alterarAtributo = (nome: keyof typeof atributos, operacao: 'aumentar' | 'diminuir') => {
    const valorAtual = atributos[nome]

    if (operacao === 'aumentar') {
      if (pontosRestantes > 0 && valorAtual < capMaximo) {
        setAtributos({ ...atributos, [nome]: valorAtual + 1 })
      }
    } else if (operacao === 'diminuir') {
      // LOCK: Se o atributo for 1, só deixa diminuir se NÃO houver outro em 0
      if (valorAtual === 1) {
        const qtdZeros = Object.values(atributos).filter(v => v === 0).length
        if (qtdZeros >= 1) return // Dá o lock silencioso (bloqueia o clique)
      }

      if (valorAtual > 0) {
        setAtributos({ ...atributos, [nome]: valorAtual - 1 })
      }
    }
  }

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', backgroundColor: '#121212', color: '#fff', minHeight: '100vh' }}>
      <h1>Ordem Paranormal: Criação de Personagem</h1>
      
      {/* Seletor de NEX */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #333', borderRadius: '5px' }}>
        <label htmlFor="nex-select" style={{ marginRight: '10px', fontWeight: 'bold' }}>Escolha o NEX Inicial:</label>
        <select 
          id="nex-select"
          value={nex} 
          onChange={(e) => {
            setNex(Number(e.target.value))
            // Reseta os atributos para 1 ao mudar de NEX para evitar bugs de pontos antigos
            setAtributos({ FOR: 1, AGI: 1, INT: 1, PRE: 1, VIG: 1 })
          }}
          style={{ padding: '5px', backgroundColor: '#222', color: '#fff', border: '1px solid #555' }}
        >
          {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99].map(n => (
            <option key={n} value={n}>{n}%</option>
          ))}
        </select>
      </div>

      {/* Painel de Pontos */}
      <div style={{ fontSize: '1.2rem', marginBottom: '25px', color: pontosRestantes < 0 ? '#ff4d4d' : '#4dff4d' }}>
        <strong>Pontos Restantes: {pontosRestantes}</strong> <small style={{ color: '#aaa' }}>(Total disponível: {pontosTotaisDisponiveis})</small>
        <div style={{ fontSize: '0.9rem', color: '#aaa', marginTop: '5px' }}>
          Limite Máximo por Atributo (CAP) neste NEX: <span style={{ color: '#ffcc00' }}>{capMaximo}</span>
        </div>
      </div>

      {/* Distribuição dos Atributos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
        {(Object.keys(atributos) as Array<keyof typeof atributos>).map((nome) => (
          <div key={nome} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#1e1e1e', borderRadius: '5px' }}>
            <span style={{ fontWeight: 'bold', width: '50px' }}>{nome}</span>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button 
                onClick={() => alterarAtributo(nome, 'diminuir')}
                style={{ width: '35px', height: '35px', cursor: 'pointer', backgroundColor: '#cc3333', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
              >
                -
              </button>
              
              <span style={{ fontSize: '1.5rem', minWidth: '20px', textAlign: 'center' }}>
                {atributos[nome]}
              </span>
              
              <button 
                onClick={() => alterarAtributo(nome, 'aumentar')}
                style={{ width: '35px', height: '35px', cursor: 'pointer', backgroundColor: '#33cc33', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App