import React, { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase'

type Tela = 'atributos' | 'origens' | 'classe' | 'ficha'
type ClasseRPG = 'Combatente' | 'Especialista' | 'Ocultista' | null
type AtributoKey = 'FOR' | 'AGI' | 'INT' | 'PRE' | 'VIG'

interface Pericia {
  atributo: AtributoKey
  treino: number
  outros: number
}

// -------------------------------------------------------------
// COMPONENTE PARA ACABAR COM O LAG AO DIGITAR (DEBOUNCE)
// -------------------------------------------------------------
const InputOtimizado = ({ value, onChange, placeholder, style }: any) => {
  const [localValue, setLocalValue] = useState(value);

  // Sincroniza se o valor mudar de fora
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Aguarda 300ms após a última tecla para recarregar a ficha
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) onChange(localValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [localValue, value, onChange]);

  return (
    <input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      placeholder={placeholder}
      style={style}
    />
  );
};

function App() {
  // --- 1. ESTADOS DA APLICAÇÃO ---
  const [telaAtual, setTelaAtual] = useState<Tela>('atributos')
  const [classe, setClasse] = useState<ClasseRPG>(null)
  const [nex, setNex] = useState<number>(5)
  const [abaDireita, setAbaDireita] = useState<'combate' | 'habilidades' | 'rituais' | 'inventario' | 'descricao'>('combate')
  
  const [nexModalAberto, setNexModalAberto] = useState<number | null>(null)
  const [abaModalPoderes, setAbaModalPoderes] = useState<'classe' | 'gerais'>('classe')
  const [poderesEscolhidosPorNex, setPoderesEscolhidosPorNex] = useState<Record<number, any>>({})
  const [poderesClasse, setPoderesClasse] = useState<any[]>([])

  // --- ESTADOS PARA EDIÇÃO LOCAL DE PODERES ---
  const [nexPoderEditando, setNexPoderEditando] = useState<number | null>(null);
  const [nomeEditando, setNomeEditando] = useState('');
  const [descricaoEditando, setDescricaoEditando] = useState('');
  const editorRef = useRef<any>(null);

  // --- OTIMIZAÇÕES DE PERFORMANCE PARA OS PODERES ---
  const listaPoderesModalMemoizada = React.useMemo(() => {
    return listaPoderesUtilidadeBanco
      .filter((p) => {
        const classePoder = p.Classe?.toLowerCase() || '';
        const tipoPoder = p.Tipo?.toLowerCase() || '';
        if (abaModalPoderes === 'classe') {
          return classePoder === classe?.toLowerCase() && classePoder !== 'geral' && classePoder !== 'gerais' && tipoPoder === 'utilidade';
        } else {
          return classePoder.includes('geral') || tipoPoder.includes('geral') || classePoder === 'todos';
        }
      })
      .sort((a, b) => a.Nome.localeCompare(b.Nome));
  }, [listaPoderesUtilidadeBanco, abaModalPoderes, classe]);


  // Passo 1: Busca TODOS os poderes disponíveis para a classe para listar no Bloco Suspenso (Dropdown)
  useEffect(() => {
    async function carregarPoderesClasse() {
      if (!classe) {
        setPoderesClasse([])
        return
      }
      // Busca todos os poderes onde a coluna 'classe' bate com a classe do personagem
      const { data, error } = await supabase
        .from('Poderes')
        .select('*')
        .eq('Classe', classe)
      
      if (error) {
        console.error("Erro na busca dos poderes no Supabase:", error)
      }
      if (data) {
        const listaNormalizada = data.map((item: any) => ({
          codigo_poder: item.codigo_poder || item.Codigo_Poder,
          Nome: item.nome || item.Nome,
          Descricao: item.descricao || item.Descricao,
          Requisito: item.requisito || item.pre_requisito || item.Requisito || 'Nenhum'
        }))
        setPoderesClasse(listaNormalizada)
      }
    }
    carregarPoderesClasse()
  }, [classe])

  const [origens, setOrigens] = useState<any[]>([])
  const [origemSelecionada, setOrigemSelecionada] = useState<any>(null)
  const [origensExpandidas, setOrigensExpandidas] = useState<number[]>([])
  const [nomesPericias, setNomesPericias] = useState<Record<number, string>>({})
  
  const [deslocM, setDeslocM] = useState<number>(9)
  const [deslocQ, setDeslocQ] = useState<number>(6)
  
  // CORRIGIDO: Parênteses e chaves que estavam faltando
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
  const [skillCombatente1, setSkillCombatente1] = useState<string>("")
  const [skillCombatente2, setSkillCombatente2] = useState<string>("")
  
  // Estados para Proteções, Resistências e Proficiências
  const [protecoes, setProtecoes] = useState<string[]>([])
  const [inputProtecao, setInputProtecao] = useState("")
  const [resistencias, setResistencias] = useState<string[]>([])
  const [inputResistencia, setInputResistencia] = useState("")
  const [proficiencias, setProficiencias] = useState<string[]>([])
  const [inputProficiencia, setInputProficiencia] = useState("")

  // --- Estados para a aba Habilidades
  const [filtroHabilidades, setFiltroHabilidades] = useState("")
  const [modalHabilidadesAberto, setModalHabilidadesAberto] = useState(false)
  const [habilidadesExpandidas, setHabilidadesExpandidas] = useState<string[]>([])
  const [habilidades, setHabilidades] = useState<any[]>([]) 
  const [listaPoderesUtilidadeBanco, setListaPoderesUtilidadeBanco] = useState<any[]>([])
  const [poderesModalExpandidos, setPoderesModalExpandidos] = useState<number[]>([])

  // Carrega as proficiências iniciais baseadas na classe escolhida
  useEffect(() => {
    if (classe === 'Combatente') {
      setProficiencias(['Armas Simples', 'Armas Táticas', 'Proteções Leves'])
    } else if (classe === 'Especialista') {
      setProficiencias(['Armas Simples', 'Proteções Leves'])
    } else if (classe === 'Ocultista') {
      setProficiencias(['Armas Simples'])
    }
  }, [classe])

  const [pericias, setPericias] = useState<Record<string, any>>({})
  const prevCalc = useRef({ pv: 0, san: 0, pe: 0, init: false })

  // BUSCAR PERÍCIAS DO SUPABASE (CORRIGIDO OS CIFRÕES BIZARROS)
  useEffect(() => {
    const puxarPericiasDoBanco = async () => {
      const { data, error } = await supabase
        .from('Perícias') // Nome exato da sua tabela no Supabase
        .select('Codigo_Pericia, Nome_Pericia, Atributo_Pericia')
        
      if (error) {
        console.error("Erro ao buscar perícias no Supabase:", error)
        return
      }
      if (data) {
        const objetoPericias: Record<string, any> = {}
        data.forEach((pericia) => {
          objetoPericias[pericia.Nome_Pericia] = {
            id: pericia.Codigo_Pericia,
            atributo: pericia.Atributo_Pericia,
            treino: 0,
            outros: 0
          }
        })
        setPericias(objetoPericias)
      }
    }
    puxarPericiasDoBanco()
  }, [])

  // BUSCAR ORIGENS DO SUPABASE
  useEffect(() => {
    const puxarDados = async () => {
      const { data: dataOrigens } = await supabase
        .from('Origens')
        .select('Codigo_Origem, Nome, Descricao, Pericia_Treinada_1, Pericia_Treinada_2, Pericia_Treinada_Especial, Nome_Poder, Descricao_Poder, Fonte')
        
      if (dataOrigens) {
          // Organiza de A a Z pelo Nome
          const origensOrdenadas = dataOrigens.sort((a, b) => a.Nome.localeCompare(b.Nome));
          setOrigens(origensOrdenadas);
        }
      
      const { data: dataPericias } = await supabase
        .from('Perícias')
        .select('Codigo_Pericia, Nome_Pericia')
        
      if (dataPericias) {
        const mapa: Record<number, string> = {}
        dataPericias.forEach((p: any) => {
          mapa[p.Codigo_Pericia] = p.Nome_Pericia
        })
        setNomesPericias(mapa)
      }
    }
    puxarDados()
  }, [])

  // CONTROLES DE DEFESA, BLOQUEIO E ESQUIVA
  const [defEquip, setDefEquip] = useState<number>(0)
  const [defOutros, setDefOutros] = useState<number>(0)
  const [bloqueio, setBloqueio] = useState<number>(0)
  const [esquiva, setEsquiva] = useState<number>(0)
  const [limitarPericias, setLimitarPericias] = useState<boolean>(true)
  
  const defesaTotal = 10 + atributos.AGI + bonusAtributos.AGI + defEquip + defOutros

  useEffect(() => {
    if (pericias.Fortitude) {
      const bonusFortitude = pericias.Fortitude.treino + pericias.Fortitude.outros
      setBloqueio(bonusFortitude)
    }
  }, [pericias])

  useEffect(() => {
    if (pericias.Reflexos) {
      const bonusReflexos = pericias.Reflexos.treino + pericias.Reflexos.outros
      setEsquiva(defesaTotal + bonusReflexos)
    }
  }, [defesaTotal, pericias])

  // Busca TODOS os poderes para o pop-up e nós filtramos nas abas
  useEffect(() => {
    async function carregarPoderesUtilidade() {
      const { data, error } = await supabase
        .from('Poderes')
        .select('*');
        
      if (error) {
        console.error("Erro ao buscar poderes:", error);
      } else if (data) {
        const dadosNormalizados = data.map((p: any) => ({
          codigo_poder: p.Codigo_Poder ?? p.codigo_poder,
          Nome: p.Nome ?? p.nome ?? "",
          Descricao: p.Descrição ?? p.descrição ?? p.Descricao ?? p.descricao ?? "",
          Classe: p.Classe ?? p.classe ?? "",
          Tipo: p.Tipo ?? p.tipo ?? "", // Puxando o Tipo!
          PreRequisitos: p['Pre-Requisitos'] ?? p['pre-requisitos'] ?? p.Pre_Requisitos ?? p.pre_requisitos ?? p.Requisitos ?? p.requisitos ?? ""
        }));
        setListaPoderesUtilidadeBanco(dadosNormalizados);
      }
    }
    carregarPoderesUtilidade();
  }, []);

  const [poderClasse, setPoderClasse] = useState<any>(null)

  useEffect(() => {
    async function carregarPoderClasse() {
      if (classe === 'Combatente') {
        const { data, error } = await supabase
          .from('Poderes')
          .select('*')
          .eq('Codigo_Poder', 179)
          .single()
          
        if (!error && data) {
          setPoderClasse(data)
        }
      } else {
        setPoderClasse(null)
      }
    }
    carregarPoderClasse()
  }, [classe])

  // BÔNUS DAS CLASSES CORRIGIDOS (SEM CIFRÕES)
  const calcularBonusAtaqueEspecial = () => {
    if (nex >= 85) return '5 PE, +20'
    if (nex >= 55) return '4 PE, +15'
    if (nex >= 25) return '3 PE, +10'
    return '2 PE, +5'
  }

  const calcularBonusPerito = () => {
    if (nex >= 85) return '5 PE, +1d12'
    if (nex >= 55) return '4 PE, +1d10'
    if (nex >= 25) return '3 PE, +1d8'
    return '2 PE, +1d6'
  }

  const calcularBonusEngenhosidade = () => {
    if (nex >= 75) return '4 PE, Veterano'
    return '2 PE, Expert'
  }

  const calcularTotalRituaisOcultista = () => {
    if (nex >= 99) return '22 Rituais'
    if (nex >= 95) return '21 Rituais'
    if (nex >= 90) return '20 Rituais'
    if (nex >= 85) return '19 Rituais'
    if (nex >= 60) return '14 Rituais'
    if (nex >= 55) return '13 Rituais'
    if (nex >= 30) return '8 Rituais'
    if (nex >= 25) return '7 Rituais'
    if (nex >= 10) return '4 Rituais'
    return '3 Rituais'
  }

  const obterLimiteCirculosOcultista = () => {
    if (nex >= 99) return { c1: 6, c2: 6, c3: 6, c4: 4 }
    if (nex >= 95) return { c1: 6, c2: 6, c3: 6, c4: 3 }
    if (nex >= 90) return { c1: 6, c2: 6, c3: 6, c4: 2 }
    if (nex >= 85) return { c1: 6, c2: 6, c3: 6, c4: 1 }
    if (nex >= 60) return { c1: 6, c2: 6, c3: 2, c4: 0 }
    if (nex >= 55) return { c1: 6, c2: 6, c3: 1, c4: 0 }
    if (nex >= 30) return { c1: 6, c2: 2, c3: 0, c4: 0 }
    if (nex >= 25) return { c1: 6, c2: 1, c3: 0, c4: 0 }
    if (nex >= 10) return { c1: 4, c2: 0, c3: 0, c4: 0 }
    return { c1: 3, c2: 0, c3: 0, c4: 0 }
  }

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
  if (origemSelecionada) {
    if (origemSelecionada.nome_p1) periciasGratis.push(origemSelecionada.nome_p1);
    if (origemSelecionada.nome_p2) periciasGratis.push(origemSelecionada.nome_p2);
    if (origemSelecionada.nome_pesp) periciasGratis.push(origemSelecionada.nome_pesp);
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
    let novasPericias = JSON.parse(JSON.stringify(pericias || {}));

    if (origemSelecionada) {
      if (origemSelecionada.nome_p1 && novasPericias[origemSelecionada.nome_p1]) {
        novasPericias[origemSelecionada.nome_p1].treino = 5;
      }
      if (origemSelecionada.nome_p2 && novasPericias[origemSelecionada.nome_p2]) {
        novasPericias[origemSelecionada.nome_p2].treino = 5;
      }
      if (origemSelecionada.nome_pesp && novasPericias[origemSelecionada.nome_pesp]) {
        novasPericias[origemSelecionada.nome_pesp].treino = 5;
      }
    }

    if (novaClasse === 'Ocultista') {
      if (novasPericias['Vontade']) novasPericias['Vontade'].treino = 5;
      if (novasPericias['Ocultismo']) novasPericias['Ocultismo'].treino = 5;
    } else if (novaClasse === 'Combatente') {
      if (!skillCombatente1 || !skillCombatente2) return;
      if (novasPericias[skillCombatente1]) novasPericias[skillCombatente1].treino = 5;
      if (novasPericias[skillCombatente2]) novasPericias[skillCombatente2].treino = 5;
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

// Função para definir a cor da badge dinamicamente
const obterCorBadge = (texto: string) => {
  // Tira acentos e deixa tudo minúsculo (ex: "Proteções Leves" vira "protecoes leves")
  const txt = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  // Elementos
  if (txt.includes('sangue')) return '#CD0000';
  if (txt.includes('morte')) return '#363636';
  if (txt.includes('conhecimento')) return '#FFC125';
  if (txt.includes('energia')) return '#BF3EFF';
  if (txt.includes('medo')) return '#E8E8E8';

  // Físicos
  if (txt.includes('balistico') || txt.includes('corte') || txt.includes('impacto') || txt.includes('perfuracao')) return '#B5B5B5';
  
  // Outros Danos
  if (txt.includes('calor')) return '#FF4500';
  if (txt.includes('frio')) return '#98F5FF';
  if (txt.includes('eletricidade')) return '#FFFF00';
  if (txt.includes('quimico')) return '#00EE00';
  if (txt.includes('mental') || txt.includes('mentais')) return '#436EEE';

  // Proficiências e Proteções (Ajustado para aceitar variações como "leves", "pesadas" ou só o termo)
  if (txt.includes('arma') && txt.includes('simples')) return '#BCD2EE';
  if (txt.includes('arma') && txt.includes('tatica')) return '#A2B5CD';
  if (txt.includes('arma') && txt.includes('pesada')) return '#6E7B8B';
  if (txt.includes('leve')) return '#9BCD9B'; // Agora aceita "Leve", "Leves", "Proteção Leve", etc.
  if (txt.includes('pesada')) return '#698B69'; // Agora aceita "Pesada", "Pesadas", "Proteção Pesada", etc.

  // Cor Padrão (se não bater com nada)
  return '#4da6ff'; 
};

  return (
    <div style={{ padding: '30px 40px', fontFamily: 'sans-serif', backgroundColor: '#121212', color: '#fff', minHeight: '100vh', width: '100vw', boxSizing: 'border-box' }}>
      
      <style dangerouslySetInnerHTML={{ __html:
      `html, body, #root {
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
          <button onClick={() => setTelaAtual('origens')} style={{ padding: '15px 30px', fontSize: '1.2rem', backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Avançar para Origens ➔</button>
        </div>
      )}

      {telaAtual === 'origens' && (
        <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
          <h1 style={{ marginBottom: '30px' }}>Escolha sua Origem</h1>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
            {origens.map((origem) => {
              const estaExpandida = origensExpandidas.includes(origem.Codigo_Origem);

              const nomeP1 = nomesPericias[origem.Pericia_Treinada_1] || origem.Pericia_Treinada_1;
              const nomeP2 = nomesPericias[origem.Pericia_Treinada_2] || origem.Pericia_Treinada_2;
              const nomePEsp = origem.Pericia_Treinada_Especial ? (nomesPericias[origem.Pericia_Treinada_Especial] || origem.Pericia_Treinada_Especial) : null;

              return (
                <div 
                  key={origem.Codigo_Origem} 
                  style={{ 
                    backgroundColor: '#151515', 
                    borderLeft: '4px solid #4da6ff',
                    overflow: 'hidden',
                  }}
                >
                  {/* BARRA DO TOPO */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px' }}>
                    
                    {/* ÁREA CLICÁVEL (TÍTULO) PARA EXPANDIR */}
                    <div 
                      onClick={() => {
                        setOrigensExpandidas(prev => 
                          prev.includes(origem.Codigo_Origem) 
                            ? prev.filter(id => id !== origem.Codigo_Origem) 
                            : [...prev, origem.Codigo_Origem]
                        );
                      }}
                      style={{ flex: 1, cursor: 'pointer', textAlign: 'left' }}
                    >
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
                        {origem.Nome}
                      </span>
                    </div>

                    {/* BOTÃO "ESCOLHER ORIGEM" NO CANTO */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); 
                        setOrigemSelecionada({
                          ...origem,
                          nome_p1: nomeP1,
                          nome_p2: nomeP2,
                          nome_pesp: nomePEsp
                        });
                        setTelaAtual('classe');
                      }}
                      style={{ 
                        padding: '10px 15px', 
                        backgroundColor: '#4da6ff', 
                        color: '#000', 
                        border: 'none', 
                        borderRadius: '3px', 
                        fontWeight: 'bold', 
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        marginLeft: '15px'
                      }}
                    >
                      ESCOLHER ORIGEM
                    </button>
                  </div>

                  {/* CONTEÚDO EXPANDIDO */}
                  {estaExpandida && (
                    <div style={{ padding: '0px 20px 20px 20px', backgroundColor: '#151515', color: '#ccc', lineHeight: '1.6', textAlign: 'left' }}>
                      
                      <p style={{ marginTop: '0', marginBottom: '10px' }}>
                        {origem.Descricao}
                      </p>
                      
                      <p style={{ margin: '10px 0' }}>
                        <strong style={{ color: '#fff' }}>Perícias treinadas. </strong> 
                        {nomeP1} e {nomeP2}{nomePEsp ? ` e ${nomePEsp}` : ''}.
                      </p>

                      <p style={{ margin: '10px 0' }}>
                        <strong style={{ color: '#fff' }}>{origem.Nome_Poder}. </strong> 
                        {origem.Descricao_Poder}
                      </p>

                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '20px' }}>
            <button onClick={() => setTelaAtual('atributos')} style={{ padding: '12px 25px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>◀ Voltar</button>
          </div>
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
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', width: '100%', justifyContent: 'space-between' }}>
            
            {/* COLUNA ESQUERDA: Atributos e Status */}
          <div style={{ flex: '1 1 30%', minWidth: '400px' }}>

            {/* ATRIBUTOS (Agora no topo) */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
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

            {/* CAIXAS: NEX, PE/TURNO e DESLOCAMENTO (Embaixo dos atributos) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
              
              {/* Lado Esquerdo: NEX e PE/TURNO */}
              <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                
                {/* BLOCO NEX */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 'bold', color: '#aaa', fontSize: '1.2rem' }}>NEX</span>
                  <select value={nex} onChange={(e) => setNex(Number(e.target.value))} style={{ padding: '8px 10px', backgroundColor: '#121212', color: '#fff', border: '1px solid #fff', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', appearance: 'none', textAlign: 'center' }}>
                    {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99].map(n => <option key={n} value={n}>{n}%</option>)}
                  </select>
                </div>

                {/* BLOCO PE/TURNO */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ padding: '8px 15px', border: '1px solid #fff', fontSize: '1.2rem', fontWeight: 'bold', minWidth: '60px', textAlign: 'center' }}>
                    {peTurno}
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#aaa', marginTop: '5px' }}>PE/TURNO</span>
                </div>

              </div>

              {/* Lado Direito: DESLOCAMENTO */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #fff', padding: '5px 10px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  <input 
                    type="number" 
                    value={deslocM} 
                    onChange={(e) => {
                      const m = Number(e.target.value);
                      setDeslocM(m);
                      setDeslocQ(Math.floor(m / 1.5)); // Calcula o quadrado automaticamente (ex: 12 / 1.5 = 8)
                    }} 
                    style={{ width: '40px', backgroundColor: 'transparent', color: '#fff', border: 'none', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold', outline: 'none' }} 
                  />
                  <span>m /</span>
                  <input 
                    type="number" 
                    value={deslocQ} 
                    onChange={(e) => {
                      const q = Number(e.target.value);
                      setDeslocQ(q);
                      setDeslocM(q * 1.5); // Calcula os metros automaticamente (ex: 8 * 1.5 = 12)
                    }} 
                    style={{ width: '40px', backgroundColor: 'transparent', color: '#fff', border: 'none', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold', outline: 'none' }} 
                  />
                  <span>q</span>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#aaa', marginTop: '5px' }}>Deslocamento</span>
              </div>

            </div>

            {/* BARRAS DE STATUS (Daqui pra baixo o código continua igual) */}

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

              {/* SEÇÃO: PROTEÇÃO, RESISTÊNCIAS E PROFICIÊNCIAS */}
              <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
                
                {/* BLOCK 1: PROTEÇÃO */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 'bold', color: '#aaa', minWidth: '110px', fontSize: '0.9rem', textTransform: 'uppercase' }}>Proteção</span>
                    <input
                      type="text"
                      value={inputProtecao}
                      placeholder="Digite e aperte Enter..."
                      onChange={(e) => setInputProtecao(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && inputProtecao.trim() !== '') {
                          setProtecoes([...protecoes, inputProtecao.trim()]);
                          setInputProtecao('');
                        }
                      }}
                      style={{ flex: 1, backgroundColor: 'transparent', color: '#fff', border: 'none', borderBottom: '1px solid #444', padding: '5px 0', fontSize: '1rem', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingLeft: '120px' }}>
                    {protecoes.map((item, index) => {
                      const cor = obterCorBadge(item);
                      return (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#222', border: `1px solid ${cor}`, borderRadius: '4px', padding: '4px 8px', fontSize: '0.85rem', color: '#fff' }}>
                          <span>{item}</span>
                          <button 
  onClick={() => setProtecoes(protecoes.filter((_, i) => i !== index))} 
  style={{ backgroundColor: 'transparent', color: cor, border: 'none', cursor: 'pointer', padding: '0 2px', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}
>
  x
</button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* BLOCK 2: RESISTÊNCIAS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 'bold', color: '#aaa', minWidth: '110px', fontSize: '0.9rem', textTransform: 'uppercase' }}>Resistências</span>
                    <input
                      type="text"
                      value={inputResistencia}
                      placeholder="Digite e aperte Enter..."
                      onChange={(e) => setInputResistencia(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && inputResistencia.trim() !== '') {
                          setResistencias([...resistencias, inputResistencia.trim()]);
                          setInputResistencia('');
                        }
                      }}
                      style={{ flex: 1, backgroundColor: 'transparent', color: '#fff', border: 'none', borderBottom: '1px solid #444', padding: '5px 0', fontSize: '1rem', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingLeft: '120px' }}>
                    {resistencias.map((item, index) => {
                      const cor = obterCorBadge(item);
                      return (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#222', border: `1px solid ${cor}`, borderRadius: '4px', padding: '4px 8px', fontSize: '0.85rem', color: '#fff' }}>
                          <span>{item}</span>
                          <button 
  onClick={() => setResistencias(resistencias.filter((_, i) => i !== index))} 
  style={{ backgroundColor: 'transparent', color: cor, border: 'none', cursor: 'pointer', padding: '0 2px', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}
>
  x
</button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* BLOCK 3: PROFICIÊNCIAS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 'bold', color: '#aaa', minWidth: '110px', fontSize: '0.9rem', textTransform: 'uppercase' }}>Proficiências</span>
                    <input
                      type="text"
                      value={inputProficiencia}
                      placeholder="Digite e aperte Enter..."
                      onChange={(e) => setInputProficiencia(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && inputProficiencia.trim() !== '') {
                          setProficiencias([...proficiencias, inputProficiencia.trim()]);
                          setInputProficiencia('');
                        }
                      }}
                      style={{ flex: 1, backgroundColor: 'transparent', color: '#fff', border: 'none', borderBottom: '1px solid #444', padding: '5px 0', fontSize: '1rem', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingLeft: '120px' }}>
                    {proficiencias.map((item, index) => {
                      const cor = obterCorBadge(item);
                      return (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#222', border: `1px solid ${cor}`, borderRadius: '4px', padding: '4px 8px', fontSize: '0.85rem', color: '#fff' }}>
                          <span>{item}</span>
                          <button 
  onClick={() => setProficiencias(proficiencias.filter((_, i) => i !== index))} 
  style={{ backgroundColor: 'transparent', color: cor, border: 'none', cursor: 'pointer', padding: '0 2px', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}
>
  x
</button>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>           
            
            {/* COLUNA DIREITA: Perícias */}
            <div style={{ flex: '1 1 32%', minWidth: '400px', backgroundColor: '#181818', padding: '30px', borderRadius: '8px', border: '1px solid #333' }}>
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

            {/* COLUNA DIREITA (NOVA): SISTEMA DE ABAS */}
            <div style={{ flex: '1 1 34%', minWidth: '350px', backgroundColor: '#141414', padding: '20px', borderRadius: '8px', border: '1px solid #252525', display: 'flex', flexDirection: 'column' }}>
              
              {/* BOTÕES DAS ABAS */}
              <div style={{ display: 'flex', gap: '4px', borderBottom: '2px solid #252525', paddingBottom: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {(['combate', 'habilidades', 'rituais', 'inventario', 'descricao'] as const).map((aba) => (
                  <button
                    key={aba}
                    onClick={() => setAbaDireita(aba)}
                    style={{
                      flex: 1,
                      minWidth: '70px',
                      padding: '8px 4px',
                      backgroundColor: abaDireita === aba ? '#2a2a2a' : 'transparent',
                      color: abaDireita === aba ? '#fff' : '#777',
                      border: abaDireita === aba ? '1px solid #444' : '1px solid transparent',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {aba === 'inventario' ? 'Inventário' : aba === 'descricao' ? 'Descrição' : aba}
                  </button>
                ))}
              </div>

                {/* CONTEÚDO DAS ABAS */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '10px' }}>
                
                {/* ABA 1: COMBATE */}
                {abaDireita === 'combate' && <div style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>Conteúdo de Combate</div>}

                {/* ABA 2: HABILIDADES */}
                {abaDireita === 'habilidades' && (
                  (() => {
                    const listaHabilidades = [];
                    
                    // 1. Puxa o poder da Origem
                    if (origemSelecionada && origemSelecionada.Nome_Poder) {
                      listaHabilidades.push({
                        id: 'origem_poder',
                        nome: origemSelecionada.Nome_Poder,
                        descricao: origemSelecionada.Descricao_Poder,
                        tipo: 'Origem',
                        extra: null,
                        subPoder: null
                      });
                    }
                    
                    // 2. Monta os poderes se for COMBATENTE
                    if (classe === 'Combatente') {
                      const atkEspecial = poderesClasse.find(p => p.codigo_poder === 179);
                      if (atkEspecial) {
                        listaHabilidades.push({
                          id: 'classe_poder_179',
                          nome: atkEspecial.Nome,
                          descricao: atkEspecial.Descricao,
                          tipo: 'Classe',
                          extra: calcularBonusAtaqueEspecial(),
                          subPoder: null
                        });
                      }
                    }

                    // 3. Monta os poderes se for ESPECIALISTA
                    if (classe === 'Especialista') {
                      const ecletico = poderesClasse.find(p => p.codigo_poder === 180);
                      const perito = poderesClasse.find(p => p.codigo_poder === 181);
                      const engenhosidade = poderesClasse.find(p => p.codigo_poder === 182);

                      // Eclético (Id 180) - Só ganha o anexo da Engenhosidade se NEX >= 40
                      if (ecletico) {
                        listaHabilidades.push({
                          id: 'classe_poder_180',
                          nome: ecletico.Nome,
                          descricao: ecletico.Descricao,
                          tipo: 'Classe',
                          extra: null,
                          // Se NEX for 40 ou mais, a Engenhosidade entra conectada ao Eclético
                          subPoder: (engenhosidade && nex >= 40) ? {
                            nome: engenhosidade.Nome,
                            descricao: engenhosidade.Descricao,
                            extra: calcularBonusEngenhosidade()
                          } : null
                        });
                      }

                      // Perito (Id 181) - Evolui os dados com o NEX
                      if (perito) {
                        listaHabilidades.push({
                          id: 'classe_poder_181',
                          nome: perito.Nome,
                          descricao: perito.Descricao,
                          tipo: 'Classe',
                          extra: calcularBonusPerito(),
                          subPoder: null
                        });
                      }
                    }

                    // 4. Monta os poderes se for OCULTISTA
                    if (classe === 'Ocultista') {
                      const escolhidoOutroLado = poderesClasse.find(p => p.codigo_poder === 183);
                      
                      if (escolhidoOutroLado) {
                        listaHabilidades.push({
                          id: 'classe_poder_183',
                          nome: escolhidoOutroLado.Nome,
                          descricao: escolhidoOutroLado.Descricao,
                          tipo: 'Classe',
                          extra: calcularTotalRituaisOcultista(), // Mostra o total na badge
                          // Passamos a estrutura de círculos para ser desenhada dentro do card
                          limiteCirculos: obterLimiteCirculosOcultista() 
                        });
                      }
                    }

                    // 5. Adiciona os Slots de Escolha de Poder por NEX (10%, 20%, 30%...)
                    // Criamos uma lista com todos os NEX pares possíveis no sistema
                    const patamaresNexPares = [10, 20, 30, 40, 50, 60, 70, 80, 90, 99];
                    
                    patamaresNexPares.forEach((nivelFixado) => {
                      // Só mostra o slot se o personagem tiver nível/NEX suficiente
                      if (nex >= nivelFixado) {
                        const poderJaEscolhido = poderesEscolhidosPorNex[nivelFixado];

                        if (poderJaEscolhido) {
                          // Se já escolheu, monta o card com as informações do poder selecionado
                          listaHabilidades.push({
                            id: `escolha_nex_${nivelFixado}`,
                            nome: poderJaEscolhido.Nome,
                            descricao: poderJaEscolhido.Descricao,
                            tipo: `NEX ${nivelFixado}%`,
                            preRequisitos: poderJaEscolhido.PreRequisitos // Passamos para renderizar na expansão
                          });
                        } else {
                          // Se não escolheu, monta a linha indicando que há um poder pendente
                          listaHabilidades.push({
                            id: `escolha_nex_${nivelFixado}`,
                            nome: `Escolher Poder de Utilidade`,
                            descricao: `Clique no botão "+" à direita para abrir a lista e selecionar seu poder.`,
                            tipo: `NEX ${nivelFixado}%`,
                            isSlotVazio: true,
                            nexDoSlot: nivelFixado
                          });
                        }
                      }
                    });

                    // Aplica o filtro da barra de pesquisa
                    const habilidadesFiltradas = listaHabilidades.filter(hab => hab.nome.toLowerCase().includes(filtroHabilidades.toLowerCase()));

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        
                        {/* TOPO: Filtro e Botão Adicionar */}
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                          <InputOtimizado 
                            value={filtroHabilidades}
                            onChange={(novoValor: string) => setFiltroHabilidades(novoValor)}
                            placeholder="Filtrar Habilidades..."
                            style={{ flex: 1, backgroundColor: 'transparent', color: '#fff', border: 'none', borderBottom: '1px solid #444', padding: '8px 0', fontSize: '1rem', outline: 'none' }}
                          />
                          <button 
                            onClick={() => console.log('Abrir modal de habilidade')}
                            style={{ backgroundColor: '#2a2a2a', color: '#fff', border: '1px solid #444', borderRadius: '4px', padding: '8px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                          >
                            + Adicionar Habilidade
                          </button>
                        </div>

                        {/* LISTA DE HABILIDADES EXPANSÍVEIS */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1, paddingRight: '5px' }}>
                          {habilidadesFiltradas.length > 0 ? habilidadesFiltradas.map((hab) => {
                            const estaExpandida = habilidadesExpandidas.includes(hab.id);
                            
                            return (
                              <div key={hab.id} style={{ backgroundColor: '#111', borderLeft: '4px solid #4facfe', borderRadius: '0 4px 4px 0', overflow: 'hidden', borderTop: '1px solid #222', borderRight: '1px solid #222', borderBottom: '1px solid #222' }}>
                                
                                {/* CABEÇALHO DA HABILIDADE */}
                                <div 
                                  onClick={() => {
                                    if (hab.isSlotVazio) {
                                      setNexModalAberto(hab.nexDoSlot);
                                    } else {
                                      setHabilidadesExpandidas(prev => 
                                        prev.includes(hab.id) ? prev.filter(id => id !== hab.id) : [...prev, hab.id]
                                      );
                                    }
                                  }}
                                  style={{ padding: '12px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: '#1a1a1a' }}
                                >
                                  {/* Lado Esquerdo: Nome + O Extra do NEX */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontWeight: 'bold', color: hab.isSlotVazio ? '#4facfe' : '#fff', fontSize: '0.95rem' }}>
                                      {hab.nome}
                                    </span>
                                    
                                    {hab.extra && (
                                      <span style={{ color: '#ffcc00', fontSize: '0.8rem', fontWeight: 'bold', backgroundColor: '#222', padding: '2px 6px', borderRadius: '4px', border: '1px solid #333' }}>
                                        {hab.extra}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Lado Direito: Tag "CLASSE" ou "ORIGEM" */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {hab.tipo && (
                                      <span style={{ backgroundColor: '#050505', border: '1px solid #333', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {hab.tipo}
                                      </span>
                                    )}
                                    <span style={{ color: '#666', fontSize: '0.8rem' }}>
                                      {hab.isSlotVazio ? (
                                        <strong style={{ color: '#ff1111', fontSize: '1.2rem', paddingRight: '2px' }}>+</strong>
                                      ) : (
                                        estaExpandida ? '▲' : '▼'
                                      )}
                                    </span>
                                  </div>
                                </div>

                                {/* DESCRIÇÃO EXPANDIDA */}
                                {estaExpandida && (
                                  <div style={{ padding: '15px', color: '#ccc', fontSize: '0.85rem', lineHeight: '1.5', backgroundColor: '#111', fontStyle: 'normal', textAlign: 'left' }}>
                                    
                                    {/* DESCRIÇÃO COM SUPORTE A NEGRITO/ITÁLICO */}
                                    <div dangerouslySetInnerHTML={{ __html: hab.descricao }} />
                                    
                                    {/* CONEXÃO: ENGENHOSIDADE */}
                                    {hab.subPoder && (
                                      <div style={{ marginTop: '15px', padding: '12px', backgroundColor: '#161616', borderLeft: '3px solid #ffcc00', borderRadius: '4px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                          <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.9rem' }}>
                                            {hab.subPoder.nome}
                                          </span>
                                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: '#222', padding: '2px 6px', borderRadius: '4px', color: '#ffcc00', border: '1px solid #333' }}>
                                            {hab.subPoder.extra}
                                          </span>
                                        </div>
                                        <div style={{ color: '#ccc', fontSize: '0.8rem' }}>
                                          {hab.subPoder.descricao}
                                        </div>
                                      </div>
                                    )}

                                    {/* DETALHAMENTO DE CÍRCULOS (Ocultista) */}
                                    {hab.limiteCirculos && (
                                      <div style={{ marginTop: '15px', padding: '12px', backgroundColor: '#161616', borderLeft: '3px solid #9933ff', borderRadius: '4px' }}>
                                        <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '8px', fontSize: '0.9rem' }}>Rituais:</div>
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                          <span style={{ backgroundColor: '#222', padding: '4px 8px', borderRadius: '4px', border: '1px solid #333', color: hab.limiteCirculos.c1 > 0 ? '#fff' : '#555' }}>1° Círculo: <strong>{hab.limiteCirculos.c1}</strong></span>
                                          <span style={{ backgroundColor: '#222', padding: '4px 8px', borderRadius: '4px', border: '1px solid #333', color: hab.limiteCirculos.c2 > 0 ? '#fff' : '#555' }}>2° Círculo: <strong>{hab.limiteCirculos.c2}</strong></span>
                                          <span style={{ backgroundColor: '#222', padding: '4px 8px', borderRadius: '4px', border: '1px solid #333', color: hab.limiteCirculos.c3 > 0 ? '#fff' : '#555' }}>3° Círculo: <strong>{hab.limiteCirculos.c3}</strong></span>
                                          <span style={{ backgroundColor: '#222', padding: '4px 8px', borderRadius: '4px', border: '1px solid #333', color: hab.limiteCirculos.c4 > 0 ? '#fff' : '#555' }}>4° Círculo: <strong>{hab.limiteCirculos.c4}</strong></span>
                                        </div>
                                      </div>
                                    )}

                                    {/* EXIBIÇÃO DE PRÉ-REQUISITO */}
                                    {hab.preRequisitos && (
                                      <div style={{ marginTop: '12px', padding: '6px 10px', fontSize: '0.75rem', color: '#ffcc00', fontStyle: 'italic', backgroundColor: 'rgba(255,204,0,0.03)', borderRadius: '4px', display: 'inline-block' }}>
                                        <strong>Pré-requisitos:</strong> {hab.preRequisitos}
                                      </div>
                                    )}

                                    {/* BOTÕES LADO A LADO: EDITAR E REMOVER */}
                                    {hab.id.startsWith('escolha_nex_') && !hab.isSlotVazio && (
                                      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const nivelSlot = parseInt(hab.id.replace('escolha_nex_', ''));
                                            setNexPoderEditando(nivelSlot);
                                            setNomeEditando(hab.nome);
                                            setDescricaoEditando(hab.descricao);
                                          }}
                                          style={{ flex: 1, backgroundColor: '#2a2a2a', color: '#fff', border: '1px solid #444', padding: '8px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}
                                        >
                                          Editar
                                        </button>

                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const nivelSlot = parseInt(hab.id.replace('escolha_nex_', ''));
                                            setPoderesEscolhidosPorNex(prev => {
                                              const novo = { ...prev };
                                              delete novo[nivelSlot];
                                              return novo;
                                            });
                                          }}
                                          style={{ flex: 1, backgroundColor: 'transparent', color: '#ff1111', border: '1px solid #ff1111', padding: '8px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}
                                        >
                                          Remover Poder
                                        </button>
                                      </div>
                                    )}

                                  </div>
                                )}
                              </div>
                            );
                          }) : (
                            <div style={{ textAlign: 'center', color: '#555', fontStyle: 'italic', marginTop: '20px' }}>Nenhuma habilidade encontrada.</div>
                          )}
                        </div>
                      </div>
                    );
                  })()
                )}

                {/* ABA 3: RITUAIS */}
                {abaDireita === 'rituais' && <div style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>Conteúdo de Rituais</div>}
                
                {/* ABA 4: INVENTÁRIO */}
                {abaDireita === 'inventario' && <div style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>Conteúdo de Inventário</div>}
                
                {/* ABA 5: DESCRIÇÃO */}
                {abaDireita === 'descricao' && <div style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>Conteúdo de Descrição</div>}
                
              </div>

            </div>

          </div> {/* FIM DO CONTAINER DE DUAS COLUNAS */}

          <button onClick={() => { 
            setPvAtual(-1); setSanAtual(-1); setPeAtual(-1); 
            setPvMax(0); setSanMax(0); setPeMax(0);
            setBonusAtributos({ FOR: 0, AGI: 0, INT: 0, PRE: 0, VIG: 0 }); 
            setHasPvTemp(false); setHasPeTemp(false); 
            setPericias(JSON.parse(JSON.stringify(pericias)));
            setSkillCombatente1(''); setSkillCombatente2('');
            prevCalc.current = { pv: 0, san: 0, pe: 0, init: false };
            setTelaAtual('atributos'); 
          }} style={{ marginTop: '50px', padding: '15px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%', fontSize: '1rem', fontWeight: 'bold' }}>
            Refazer Personagem
          </button>
        </div>
      )}

      {/* POP-UP (MODAL) DE ESCOLHA DE PODERES POR NEX */}
      {nexModalAberto !== null && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', width: '100%', maxWidth: '850px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            
            {/* CABEÇALHO DO MODAL */}
            <div style={{ padding: '20px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>Escolher Poder — NEX {nexModalAberto}%</h3>
              <button onClick={() => setNexModalAberto(null)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>

            {/* ABAS SEPARADORAS DE FILTRO */}
            <div style={{ display: 'flex', backgroundColor: '#121212', borderBottom: '1px solid #333' }}>
              <button 
                onClick={() => {
                  setAbaModalPoderes('classe');
                  // Reseta o scroll para o topo ao trocar de aba
                  const divScroll = document.getElementById('caixa-scroll-poderes');
                  if (divScroll) divScroll.scrollTop = 0;
                }}
                style={{ flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: abaModalPoderes === 'classe' ? '3px solid #ff0000' : 'none', color: abaModalPoderes === 'classe' ? '#fff' : '#666', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
              >
                Poderes de {classe || 'Classe'}
              </button>
              <button 
                onClick={() => {
                  setAbaModalPoderes('gerais');
                  // Reseta o scroll para o topo ao trocar de aba
                  const divScroll = document.getElementById('caixa-scroll-poderes');
                  if (divScroll) divScroll.scrollTop = 0;
                }}
                style={{ flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: abaModalPoderes === 'gerais' ? '3px solid #ff0000' : 'none', color: abaModalPoderes === 'gerais' ? '#fff' : '#666', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
              >
                Poderes Gerais
              </button>
            </div>

            {/* LISTAGEM DOS PODERES (BLOCO SUSPENSO / SANFONA) */}
            <div id="caixa-scroll-poderes" style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'block' }}>
              {listaPoderesModalMemoizada.map((poder) => {
                  const estaExpandido = poderesModalExpandidos.includes(poder.codigo_poder);

                  return (
                    <div 
                      key={poder.codigo_poder} 
                      style={{ 
                        backgroundColor: '#111', 
                        borderLeft: '4px solid #ff0000', 
                        borderRadius: '4px', 
                        overflow: 'hidden', 
                        borderTop: '1px solid #333', 
                        borderRight: '1px solid #333', 
                        borderBottom: '1px solid #333',
                        marginBottom: '12px',
                        display: 'block'
                      }}
                    >
                      
                      {/* TÍTULO CLICÁVEL COM O BOTÃO DE ESCOLHER EMBUTIDO */}
                      <div 
                        onClick={() => {
                          setPoderesModalExpandidos(prev => 
                            prev.includes(poder.codigo_poder) ? prev.filter(id => id !== poder.codigo_poder) : [...prev, poder.codigo_poder]
                          );
                        }}
                        style={{ padding: '12px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: '#1a1a1a' }}
                      >
                        {/* Nome do Poder */}
                        <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '1rem', flex: 1 }}>
                          {poder.Nome}
                        </span>
                        
                        {/* Lado Direito: Botão Escolher + Seta */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation(); // Impede de abrir/fechar a sanfona ao clicar no botão
                              setPoderesEscolhidosPorNex(prev => ({
                                ...prev,
                                [nexModalAberto as number]: poder
                              }));
                              setNexModalAberto(null); // Fecha o Pop-up
                            }}
                            style={{ backgroundColor: '#ff0000', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', transition: '0.2s' }}
                          >
                            Escolher
                          </button>
                          
                          <span style={{ color: '#666', fontSize: '1rem', width: '20px', textAlign: 'center' }}>
                            {estaExpandido ? '▲' : '▼'}
                          </span>
                        </div>
                      </div>

                      {/* CORPO EXPANDIDO (APENAS DESCRIÇÃO E REQUISITOS AGORA) */}
                      {estaExpandido && (
                        <div style={{ padding: '15px 20px', backgroundColor: '#161616', borderTop: '1px solid #222', textAlign: 'left' }}>
                          <div style={{ color: '#bbb', fontSize: '0.9rem', lineHeight: '1.5' }}>
                            {poder.Descricao}
                          </div>
                          
                          {/* PRÉ-REQUISITOS */}
                          {poder.PreRequisitos && (
                            <div style={{ fontSize: '0.8rem', color: '#ffcc00', fontStyle: 'italic', backgroundColor: 'rgba(255,204,0,0.05)', padding: '8px 12px', borderRadius: '4px', marginTop: '15px', display: 'inline-block' }}>
                              <strong>Pré-requisitos:</strong> {poder.PreRequisitos}
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  );
                })}

              {/* MENSAGEM SE A ABA ESTIVER VAZIA (Aplicando as mesmas regras do filtro) */}
              {listaPoderesUtilidadeBanco.filter(p => {
                const classePoder = p.Classe?.toLowerCase() || '';
                const tipoPoder = p.Tipo?.toLowerCase() || '';
                if (abaModalPoderes === 'classe') {
                  return classePoder === classe?.toLowerCase() && classePoder !== 'geral' && classePoder !== 'gerais' && tipoPoder === 'utilidade';
                } else {
                  return classePoder.includes('geral') || tipoPoder.includes('geral') || classePoder === 'todos';
                }
              }).length === 0 && (
                <div style={{ color: '#555', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>Nenhum poder encontrado nesta categoria.</div>
              )}
            </div>

          </div>
        </div>
      )}

    {/* ======================================================= */}
      {/* POP-UP (MODAL) PARA EDITAR O PODER SELECIONADO (LOCAL)  */}
      {/* ======================================================= */}
      {nexPoderEditando !== null && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', width: '100%', maxWidth: '800px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '15px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', borderBottom: '1px solid #333', paddingBottom: '10px', textAlign: 'left', fontFamily: 'inherit' }}>
              Editar Poder (NEX {nexPoderEditando}%)
            </h3>
            
            {/* CAMPO NOME */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'left' }}>
              <label style={{ color: '#aaa', fontSize: '0.85rem', fontWeight: 'bold', fontFamily: 'inherit' }}>Nome do Poder</label>
              <InputOtimizado 
                value={nomeEditando} 
                onChange={(novoValor: string) => setNomeEditando(novoValor)}
                style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px', padding: '10px', color: '#fff', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>

            {/* CAMPO DESCRIÇÃO COM EDITOR VISUAL AUTOMÁTICO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'left' }}>
              <label style={{ color: '#aaa', fontSize: '0.85rem', fontWeight: 'bold', fontFamily: 'inherit' }}>Descrição</label>
              
              {/* BARRA DE FERRAMENTAS VISUAIS */}
              <div style={{ display: 'flex', gap: '6px', backgroundColor: '#121212', padding: '6px', border: '1px solid #333', borderBottom: 'none', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}>
                <button 
                  type="button"
                  onClick={() => document.execCommand('bold', false)}
                  style={{ backgroundColor: '#222', color: '#fff', border: '1px solid #444', width: '32px', height: '32px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit' }}
                  title="Negrito"
                >
                  B
                </button>
                <button 
                  type="button"
                  onClick={() => document.execCommand('italic', false)}
                  style={{ backgroundColor: '#222', color: '#fff', border: '1px solid #444', width: '32px', height: '32px', borderRadius: '4px', fontStyle: 'italic', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit' }}
                  title="Itálico"
                >
                  I
                </button>
              </div>

              {/* ÁREA DE TEXTO EDITÁVEL DE VERDADE */}
              <div 
                ref={(el) => {
                  if (el) {
                    editorRef.current = el;
                    if (!el.dataset.initialized) {
                      el.innerHTML = descricaoEditando;
                      el.dataset.initialized = 'true';
                    }
                  }
                }}
                contentEditable
                style={{ 
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
                  textAlign: 'left'
                }}
              />
            </div>

            {/* BOTÕES CANCELAR E APLICAR */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button 
                onClick={() => setNexPoderEditando(null)}
                style={{ backgroundColor: '#222', color: '#aaa', border: '1px solid #444', padding: '8px 16px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  const textoFormatadoSalvar = editorRef.current ? editorRef.current.innerHTML : '';
                  setPoderesEscolhidosPorNex(prev => ({
                    ...prev,
                    [nexPoderEditando as number]: {
                      ...prev[nexPoderEditando as number],
                      Nome: nomeEditando,
                      Descricao: textoFormatadoSalvar
                    }
                  }));
                  setNexPoderEditando(null);
                }}
                style={{ backgroundColor: '#ff0000', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Aplicar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default App;