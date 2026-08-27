import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type {
  Tela,
  ClasseRPG,
  Atributos,
  AtributoKey,
  AbaDireita,
  AbaModalPoderes,
  VersaoRitual,
} from '../types';
import { usePoderes } from '../hooks/usePoderes';
import { usePericias } from '../hooks/usePericias';
import { useStatus } from '../hooks/useStatus';
import { useOrigem } from '../hooks/useOrigem';
import { useRituais } from '../hooks/useRituais';
import { useTrilhas } from '../hooks/useTrilhas';
import { useInventario } from '../hooks/useInventario';
import { useArmas } from '../hooks/useArmas';
import { useMunicoes } from '../hooks/useMunicoes';
import { useProtecoes } from '../hooks/useProtecoes';
import { useItens } from '../hooks/useItens';
import { useItensAmaldicoados } from '../hooks/useItensAmaldicoados';
import { calcularBonusVestimentas, type VestimentasBonus } from '../utils/vestimentasRules';
import { useModificacoes } from '../hooks/useModificacoes';
import { useMaldicoes } from '../hooks/useMaldicoes';
import { capMaximoAtributo, pontosIniciaisPorNex, calcularStatusBase } from '../utils/rpgRules';

// ============================================================
// TUDO QUE O CONTEXTO EXPÕE
// ============================================================
interface RPGContextType {
  telaAtual: Tela;
  setTelaAtual: React.Dispatch<React.SetStateAction<Tela>>;
  classe: ClasseRPG;
  setClasse: React.Dispatch<React.SetStateAction<ClasseRPG>>;
  nex: number;
  setNex: React.Dispatch<React.SetStateAction<number>>;
  atributos: Atributos;
  setAtributos: React.Dispatch<React.SetStateAction<Atributos>>;
  bonusAtributos: Atributos;
  setBonusAtributos: React.Dispatch<React.SetStateAction<Atributos>>;
  pontosRestantes: number;
  alterarAtributo: (nome: AtributoKey, operacao: 'aumentar' | 'diminuir') => void;
  status: ReturnType<typeof useStatus>;
  periciasHook: ReturnType<typeof usePericias>;
  poderesHook: ReturnType<typeof usePoderes>;
  inventarioHook: ReturnType<typeof useInventario>;
  armasHook: ReturnType<typeof useArmas>;
  municoesHook: ReturnType<typeof useMunicoes>;
  protecoesHook: ReturnType<typeof useProtecoes>;
  itensHook: ReturnType<typeof useItens>;
  itensAmaldicoadosHook: ReturnType<typeof useItensAmaldicoados>;
  bonusVestimentas: VestimentasBonus;
  toggleVestimentaGeral: (id: string, isAmaldicoado: boolean) => void;
  modificacoesHook: ReturnType<typeof useModificacoes>;
  maldicoesHook: ReturnType<typeof useMaldicoes>;
  abaDireita: AbaDireita;
  setAbaDireita: React.Dispatch<React.SetStateAction<AbaDireita>>;
  abaModalPoderes: AbaModalPoderes;
  setAbaModalPoderes: React.Dispatch<React.SetStateAction<AbaModalPoderes>>;
  tipoModalPoderes: 'utilidade' | 'combate';
  setTipoModalPoderes: React.Dispatch<React.SetStateAction<'utilidade' | 'combate'>>;
  origensHook: ReturnType<typeof useOrigem>;
  trilhasHook: ReturnType<typeof useTrilhas>;
  defEquip: number;
  setDefEquip: React.Dispatch<React.SetStateAction<number>>;
  defOutros: number;
  setDefOutros: React.Dispatch<React.SetStateAction<number>>;
  defesaTotal: number;
  totalDefesaProtecoes: number;
  bloqueioData: { base: number, bonusVig: boolean };
  setBloqueioData: React.Dispatch<React.SetStateAction<{ base: number, bonusVig: boolean }>>;
  protecoes: string[];
  proficienciasTotais: string[];
  sentidos: string[];
  imunidades: string[];
  vulnerabilidades: string[];
  setProtecoes: React.Dispatch<React.SetStateAction<string[]>>;
  setSentidos: React.Dispatch<React.SetStateAction<string[]>>;
  setImunidades: React.Dispatch<React.SetStateAction<string[]>>;
  setVulnerabilidades: React.Dispatch<React.SetStateAction<string[]>>;
  resistencias: string[];
  setResistencias: React.Dispatch<React.SetStateAction<string[]>>;
  proficiencias: string[];
  setProficiencias: React.Dispatch<React.SetStateAction<string[]>>;
  regrasAtivas: boolean;
  setRegrasAtivas: React.Dispatch<React.SetStateAction<boolean>>;
  bloquearLetras: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  refazerPersonagem: () => void;
  filtroHabilidades: string;
  setFiltroHabilidades: React.Dispatch<React.SetStateAction<string>>;
  habilidadesExpandidas: string[];
  setHabilidadesExpandidas: React.Dispatch<React.SetStateAction<string[]>>;
  nexModalAberto: number | null;
  setNexModalAberto: React.Dispatch<React.SetStateAction<number | null>>;
  poderesModalExpandidos: number[];
  setPoderesModalExpandidos: React.Dispatch<React.SetStateAction<number[]>>;
  nexPoderEditando: number | string | null;
  setNexPoderEditando: React.Dispatch<React.SetStateAction<number | string | null>>;
  nomeEditando: string;
  setNomeEditando: React.Dispatch<React.SetStateAction<string>>;
  descricaoEditando: string;
  setDescricaoEditando: React.Dispatch<React.SetStateAction<string>>;
  afinidadeEditando: string;
  setAfinidadeEditando: React.Dispatch<React.SetStateAction<string>>;
  skillCombatente1: string;
  setSkillCombatente1: React.Dispatch<React.SetStateAction<string>>;
  skillCombatente2: string;
  setSkillCombatente2: React.Dispatch<React.SetStateAction<string>>;
  deslocM: number;
  setDeslocM: React.Dispatch<React.SetStateAction<number>>;
  deslocQ: number;
  setDeslocQ: React.Dispatch<React.SetStateAction<number>>;
  bonusDadosCondicionais: string;
  setBonusDadosCondicionais: React.Dispatch<React.SetStateAction<string>>;
  bonusDadosAtivos: string;
  setBonusDadosAtivos: React.Dispatch<React.SetStateAction<string>>;
  regras: Record<string, boolean>;
  setRegras: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  toggleRegra: (nome: string) => void;
  nivel: number;
  setNivel: React.Dispatch<React.SetStateAction<number>>;
  rituaisHook: ReturnType<typeof useRituais>;
  rituaisExpandidos: number[];
  setRituaisExpandidos: React.Dispatch<React.SetStateAction<number[]>>;
  versaoRitual: Record<number, VersaoRitual>;
  setVersaoRitual: React.Dispatch<React.SetStateAction<Record<number, VersaoRitual>>>;
  elementoRitual: Record<number, string>;
  setElementoRitual: React.Dispatch<React.SetStateAction<Record<number, string>>>;

  afinidadeEscolhida: string | null;
  setAfinidadeEscolhida: React.Dispatch<React.SetStateAction<string | null>>;
  afinidadeAtiva: boolean;
  poderesExtras: Record<string, string>;
  setPoderesExtras: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  progressaoNexRecusados: number[];
  setProgressaoNexRecusados: React.Dispatch<React.SetStateAction<number[]>>;
  progressaoNexEditados: Record<number, string>;
  setProgressaoNexEditados: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  elementoRegra18: string | null;
  setElementoRegra18: React.Dispatch<React.SetStateAction<string | null>>;
  regrasAutomaticasAtivas: Set<number>;
  escolhaRegra53: 'FOR' | 'AGI' | null;
  setEscolhaRegra53: React.Dispatch<React.SetStateAction<'FOR' | 'AGI' | null>>;
  atributosFinais: Atributos;
}

const RPGContext = createContext<RPGContextType | null>(null);

// ============================================================
// PROVIDER
// ============================================================
export function RPGProvider({ children }: { children: React.ReactNode }) {
  const [telaAtual, setTelaAtual] = useState<Tela>('atributos');
  const [classe, setClasse] = useState<ClasseRPG>(null);
  const [nex, setNex] = useState(5);
  const [abaDireita, setAbaDireita] = useState<AbaDireita>('combate');
  const [abaModalPoderes, setAbaModalPoderes] = useState<AbaModalPoderes>('classe');
  const [tipoModalPoderes, setTipoModalPoderes] = useState<'utilidade' | 'combate'>('utilidade');
  const [atributos, setAtributos] = useState<Atributos>({ FOR: 1, AGI: 1, INT: 1, PRE: 1, VIG: 1 });
  const [bonusAtributos, setBonusAtributos] = useState<Atributos>({ FOR: 0, AGI: 0, INT: 0, PRE: 0, VIG: 0 });
  const [defEquip, setDefEquip] = useState(0);
  const [defOutros, setDefOutros] = useState(0);
  const [bloqueioData, setBloqueioData] = useState({ base: 0, bonusVig: false });
  const [protecoes, setProtecoes] = useState<string[]>([]);
  const [sentidos, setSentidos] = useState<string[]>([]);
  const [imunidades, setImunidades] = useState<string[]>([]);
  const [vulnerabilidades, setVulnerabilidades] = useState<string[]>([]);
  const [resistencias, setResistencias] = useState<string[]>([]);
  const [proficiencias, setProficiencias] = useState<string[]>([]);
  const [regrasAtivas, setRegrasAtivas] = useState(true);
  const [filtroHabilidades, setFiltroHabilidades] = useState('');
  const [habilidadesExpandidas, setHabilidadesExpandidas] = useState<string[]>([]);
  const [nexModalAberto, setNexModalAberto] = useState<number | null>(null);
  const [poderesModalExpandidos, setPoderesModalExpandidos] = useState<number[]>([]);
  const [nexPoderEditando, setNexPoderEditando] = useState<number | string | null>(null);
  const [nomeEditando, setNomeEditando] = useState('');
  const [descricaoEditando, setDescricaoEditando] = useState('');
  const [afinidadeEditando, setAfinidadeEditando] = useState('');
  const [skillCombatente1, setSkillCombatente1] = useState('');
  const [skillCombatente2, setSkillCombatente2] = useState('');
  const [deslocM, setDeslocM] = useState(9);
  const [deslocQ, setDeslocQ] = useState(6);
  const [bonusDadosCondicionais, setBonusDadosCondicionais] = useState('');
  const [bonusDadosAtivos, setBonusDadosAtivos] = useState('');
  const [regras, setRegras] = useState<Record<string, boolean>>({});
  const [nivel, setNivel] = useState(1);

  const [rituaisExpandidos, setRituaisExpandidos] = useState<number[]>([]);
  const [versaoRitual, setVersaoRitual] = useState<Record<number, VersaoRitual>>({});
  const [elementoRitual, setElementoRitual] = useState<Record<number, string>>({});
  
  const [afinidadeEscolhida, setAfinidadeEscolhida] = useState<string | null>(null);
  const [poderesExtras, setPoderesExtras] = useState<Record<string, string>>({});
  const [progressaoNexRecusados, setProgressaoNexRecusados] = useState<number[]>([]);
  const [progressaoNexEditados, setProgressaoNexEditados] = useState<Record<number, string>>({});
  const [elementoRegra18, setElementoRegra18] = useState<string | null>(null);
  const [escolhaRegra53, setEscolhaRegra53] = useState<'FOR' | 'AGI' | null>(null);

  const toggleRegra = useCallback((nome: string) => {
    setRegras(prev => {
      const novo = { ...prev, [nome]: !prev[nome] };
      // Se ativar nex_experiencia, pode calcular um nivel base inicial pra facilitar
      if (nome === 'nex_experiencia' && novo[nome]) {
        setNivel(Math.min(20, Math.max(1, Math.ceil(nex / 5))));
        setNex(0);
      }
      return novo;
    });
  }, [nex]);

  // ============================================================
  // HOOKS
  // ============================================================
  const trilhasHook = useTrilhas(classe);
  const poderesHook = usePoderes(classe);
  const origensHook = useOrigem();
  const inventarioHook = useInventario(origensHook.origemSelecionada?.Codigo_Regra);
  const armasHook = useArmas();
  const municoesHook = useMunicoes();
  const protecoesHook = useProtecoes();
  const rituaisHook = useRituais();

  const modificacoesHook = useModificacoes();
  const maldicoesHook = useMaldicoes();

  // Computa o conjunto de regras automáticas ativas
  const regrasAutomaticasAtivas = useMemo(() => {
    const set = new Set<number>();
    if (origensHook.origemSelecionada?.Codigo_Regra) {
      set.add(Number(origensHook.origemSelecionada.Codigo_Regra));
    }
    Object.values(poderesHook.poderesEscolhidos).forEach(p => {
      if (p.codigoRegra) set.add(Number(p.codigoRegra));
    });
    return set;
  }, [origensHook.origemSelecionada, poderesHook.poderesEscolhidos]);

  const itensHook = useItens(regrasAutomaticasAtivas.has(23) ? 3 : 2);
  const itensAmaldicoadosHook = useItensAmaldicoados();

  const bonusVestimentas = useMemo(() => {
    return calcularBonusVestimentas(itensAmaldicoadosHook.itensAmaldicoadosInventario);
  }, [itensAmaldicoadosHook.itensAmaldicoadosInventario]);


  const toggleVestimentaGeral = useCallback((id: string, isAmaldicoado: boolean) => {
    const maxVestimentas = regrasAutomaticasAtivas.has(23) ? 3 : 2;
    
    let isEquipando = false;
    if (isAmaldicoado) {
      isEquipando = !itensAmaldicoadosHook.itensAmaldicoadosInventario.find(i => i.id === id)?.equipado;
    } else {
      isEquipando = !itensHook.itensInventario.find(i => i.id === id)?.equipado;
    }

    if (!isEquipando) {
      if (isAmaldicoado) itensAmaldicoadosHook.toggleEquipadoSimples(id, false);
      else itensHook.toggleEquipadoSimples(id, false);
      return;
    }

    const vestimentasGeraisEquipadas = itensHook.itensInventario.filter(i => i.equipado && (i.item.Nome_Item.toLowerCase().includes('vestimenta') || i.item.Nome_Item.toLowerCase().includes('amuleto sagrado')));
    const vestimentasAmaldicoadasEquipadas = itensAmaldicoadosHook.itensAmaldicoadosInventario.filter(i => i.equipado && i.item['Vestimenta?']?.toLowerCase() === 'true');

    const totalEquipadas = vestimentasGeraisEquipadas.length + vestimentasAmaldicoadasEquipadas.length;

    if (totalEquipadas >= maxVestimentas) {
      if (vestimentasGeraisEquipadas.length > 0) {
        itensHook.toggleEquipadoSimples(vestimentasGeraisEquipadas[0].id, false);
      } else if (vestimentasAmaldicoadasEquipadas.length > 0) {
        itensAmaldicoadosHook.toggleEquipadoSimples(vestimentasAmaldicoadasEquipadas[0].id, false);
      }
    }

    if (isAmaldicoado) itensAmaldicoadosHook.toggleEquipadoSimples(id, true);
    else itensHook.toggleEquipadoSimples(id, true);
  }, [itensHook, itensAmaldicoadosHook, regrasAutomaticasAtivas]);

  // Sincroniza ganho/perda de NEX pelos Rituais
  const rituaisAprendidosRef = React.useRef(rituaisHook.rituaisAprendidos);

  React.useEffect(() => {
    if (!regras['nex_experiencia']) {
      rituaisAprendidosRef.current = rituaisHook.rituaisAprendidos;
      return;
    }

    const previous = rituaisAprendidosRef.current;
    const current = rituaisHook.rituaisAprendidos;

    if (previous && current && previous !== current) {
      let nexDiff = 0;
      
      // Calculate what was added
      current.forEach(ritual => {
        if (!previous.some(p => p.id === ritual.id)) {
          const def = rituaisHook.rituais?.find(r => r.Nome_Ritual === ritual.nome);
          if (def) nexDiff += parseInt(def.Circulo, 10) || 0;
        }
      });
      
      // Calculate what was removed
      previous.forEach(ritual => {
        if (!current.some(p => p.id === ritual.id)) {
          const def = rituaisHook.rituais?.find(r => r.Nome_Ritual === ritual.nome);
          if (def) nexDiff -= parseInt(def.Circulo, 10) || 0;
        }
      });

      if (nexDiff !== 0) {
        setNex(prev => Math.min(99, Math.max(0, prev + nexDiff)));
      }
    }

    rituaisAprendidosRef.current = current;
  }, [rituaisHook.rituaisAprendidos, rituaisHook.rituais, regras]);

  const paranormalPenalty = useMemo(() => {
    const qtd = Object.entries(poderesHook.poderesEscolhidos).filter(([key, p]) => p.categoria === 'paranormais' && key !== 'extra_regra1').length;
    if (qtd === 0 || !classe) return 0;
    
    let perda = 0;
    if (classe === 'Especialista') perda = 4;
    else if (classe === 'Combatente') perda = 3;
    else if (classe === 'Ocultista') perda = 5;
    
    return qtd * perda;
  }, [poderesHook.poderesEscolhidos, classe]);

  // Sincroniza o nível com o NEX caso a regra 'nex_experiencia' não esteja ativa
  React.useEffect(() => {
    if (!regras['nex_experiencia']) {
      setNivel(Math.min(20, Math.max(1, Math.ceil(nex / 5))));
    }
  }, [nex, regras]);

  const atributosBaseComBonus = useMemo(() => {
    const obj = { ...atributos };
    (Object.keys(obj) as AtributoKey[]).forEach(k => {
      obj[k] += bonusAtributos[k];
    });
    return obj;
  }, [atributos, bonusAtributos]);

  const status = useStatus(classe, nex, nivel, atributosBaseComBonus, paranormalPenalty, regrasAutomaticasAtivas, bonusVestimentas.pv, bonusVestimentas.pe);

  const atributosFinais = useMemo(() => {
    const obj = { ...atributosBaseComBonus };
    const machucado = status.pvAtual !== null && status.pvMax > 0 && status.pvAtual <= Math.floor(status.pvMax / 2);
    if (machucado && regrasAutomaticasAtivas.has(53) && escolhaRegra53) {
      obj[escolhaRegra53] += regrasAutomaticasAtivas.has(54) ? 2 : 1;
    }
    
    // Clear choice if not machucado anymore
    if (!machucado && escolhaRegra53) {
       setEscolhaRegra53(null);
    }
    
    return obj;
  }, [atributosBaseComBonus, status.pvAtual, status.pvMax, regrasAutomaticasAtivas, escolhaRegra53]);

  const afinidadeAtiva = useMemo(() => {
    if (!afinidadeEscolhida) return false;

    // Se a regra estiver ativa, a afinidade é garantida a partir do NEX 60 automaticamente
    if (regras['nex_experiencia'] && nex >= 60) {
      return true;
    }

    // Comportamento original
    return Object.entries(poderesHook.poderesEscolhidos).some(([key, p]) => {
      if (p.categoria !== 'paranormais') return false;
      const nexSlot = Number(key);
      if (!isNaN(nexSlot) && nexSlot >= 50) return true;
      return false;
    });
  }, [afinidadeEscolhida, poderesHook.poderesEscolhidos, regras, nex]);

  const periciasGratis = useMemo(() => {
    const gratis: string[] = [];
    if (classe === 'Ocultista') {
      gratis.push('Vontade', 'Ocultismo');
    } else if (classe === 'Combatente') {
      if (skillCombatente1) gratis.push(skillCombatente1);
      if (skillCombatente2) gratis.push(skillCombatente2);
    }
    if (origensHook.origemSelecionada) {
      const { nome_p1, nome_p2, nome_pesp, Codigo_Per_Regra, escolhaRegra6 } = origensHook.origemSelecionada;
      if (nome_p1) gratis.push(nome_p1);

      if (Codigo_Per_Regra === 1) {
        // Regra 1: Apenas a perícia 1
      } else if (Codigo_Per_Regra === 6) {
        // Regra 6: Perícia 1 + escolha
        if (escolhaRegra6 === 'p2' && nome_p2) gratis.push(nome_p2);
        else if (escolhaRegra6 === 'pesp' && nome_pesp) gratis.push(nome_pesp);
      } else if (Codigo_Per_Regra === 7) {
        // Regra 7 não adiciona treino básico aqui
      } else {
        // Padrão: Perícia 1 + Perícia 2
        if (nome_p2) gratis.push(nome_p2);
      }
    }
    if (trilhasHook.trilhaSelecionada && trilhasHook.trilhaSelecionada.nome_pericia) {
      gratis.push(trilhasHook.trilhaSelecionada.nome_pericia);
    }
    return gratis;
  }, [classe, skillCombatente1, skillCombatente2, origensHook.origemSelecionada, trilhasHook.trilhaSelecionada]);

  const veteranasGratis = useMemo(() => {
    const vet: string[] = [];
    if (origensHook.origemSelecionada?.Codigo_Per_Regra === 7) {
      vet.push('Pilotagem');
    }
    return vet;
  }, [origensHook.origemSelecionada]);

  const periciasHook = usePericias(
    classe, 
    nex, 
    atributosFinais, 
    regrasAtivas, 
    periciasGratis, 
    origensHook.origemSelecionada?.Codigo_Per_Regra, 
    veteranasGratis, 
    regrasAutomaticasAtivas, 
    poderesHook.poderesEscolhidos,
    origensHook.origemSelecionada,
    bonusVestimentas.pericias
  );

  // ============================================================
  // LÓGICA DE ATRIBUTOS
  // ============================================================
  const capMaximo = capMaximoAtributo(nex);
  const pontosIniciais = pontosIniciaisPorNex(nex);

  let pontosGastos = 0;
  let bonusPorAtributoZero = 0;
  Object.values(atributos).forEach(valor => {
    if (valor === 0) bonusPorAtributoZero += 1;
    else if (valor > 1) pontosGastos += valor - 1;
  });
  const pontosTotais = pontosIniciais + bonusPorAtributoZero;
  const pontosRestantes = pontosTotais - pontosGastos;

  const alterarAtributo = useCallback(
    (nome: AtributoKey, operacao: 'aumentar' | 'diminuir') => {
      setAtributos(prev => {
        const valorAtual = prev[nome];
        if (operacao === 'aumentar' && pontosRestantes > 0 && valorAtual < capMaximo) {
          return { ...prev, [nome]: valorAtual + 1 };
        }
        if (operacao === 'diminuir') {
          if (valorAtual === 1 && Object.values(prev).filter(v => v === 0).length >= 1) {
            return prev;
          }
          if (valorAtual > 0) return { ...prev, [nome]: valorAtual - 1 };
        }
        return prev;
      });
    },
    [pontosRestantes, capMaximo]
  );

  // ============================================================
  // PROFICIÊNCIAS TOTAIS
  // ============================================================
  const proficienciasTotais = [...proficiencias];
  if (regrasAutomaticasAtivas.has(17) && !proficienciasTotais.includes('Armas Pesadas')) proficienciasTotais.push('Armas Pesadas');
  if (regrasAutomaticasAtivas.has(20) && !proficienciasTotais.includes('Proteções Pesadas')) proficienciasTotais.push('Proteções Pesadas');
  if (regrasAutomaticasAtivas.has(27) && !proficienciasTotais.includes('Armas Táticas (de fogo)')) proficienciasTotais.push('Armas Táticas (de fogo)');
  if (regrasAutomaticasAtivas.has(28) && !proficienciasTotais.includes('Armas Táticas (corpo a corpo e de disparo)')) proficienciasTotais.push('Armas Táticas (corpo a corpo e de disparo)');
  if (regrasAutomaticasAtivas.has(38) && !proficienciasTotais.includes('Proteções Leves')) proficienciasTotais.push('Proteções Leves');

  // ============================================================
  // DEFESA
  // ============================================================
  const defOutrosBonusRegra4 = regrasAutomaticasAtivas.has(4) ? 2 : 0;
  const defOutrosBonusRegra12 = regrasAutomaticasAtivas.has(12) ? 2 : 0;
  
  const temProtecaoPesada = protecoesHook?.protecoesInventario.some(p => p.equipado && p.protecao.Proficiencia?.toLowerCase().includes('pesada')) || false;
  const defOutrosBonusRegra21 = (regrasAutomaticasAtivas.has(21) && temProtecaoPesada) ? 2 : 0;
  
  const temProtecaoLeve = protecoesHook?.protecoesInventario.some(p => p.equipado && p.protecao.Proficiencia?.toLowerCase().includes('leve')) || false;
  const defOutrosBonusRegra25 = (regrasAutomaticasAtivas.has(25) && temProtecaoLeve) ? 2 : 0;

  const totalDefesaProtecoes = (protecoesHook?.protecoesInventario || []).reduce((acc, item) => {
    if (!item.equipado) return acc;
    const defRaw = String(item.protecao.Defesa_Protecao || '0').replace(/[^0-9.-]+/g, '');
    let defVal = Number(defRaw);
    if (isNaN(defVal)) defVal = 0;
    
    // Bônus Reforçada
    const temReforcada = (item.modificacoes || []).some(id => {
      const m = modificacoesHook?.modificacoes.find(mod => mod.Codigo_Modif === id);
      return m?.Nome_Modif.trim().toLowerCase() === 'reforçada';
    });
    if (temReforcada) defVal += 2;
    
    return acc + defVal;
  }, 0);

  const defesaTotal = 10 + atributos.AGI + bonusAtributos.AGI + defEquip + defOutros + defOutrosBonusRegra4 + defOutrosBonusRegra12 + defOutrosBonusRegra21 + defOutrosBonusRegra25 + totalDefesaProtecoes;

  // ============================================================
  // UTILITÁRIOS
  // ============================================================
  const bloquearLetras = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
      e.preventDefault();
    }
  }, []);

  const refazerPersonagem = useCallback(() => {
    setAtributos({ FOR: 1, AGI: 1, INT: 1, PRE: 1, VIG: 1 });
    setBonusAtributos({ FOR: 0, AGI: 0, INT: 0, PRE: 0, VIG: 0 });
    setSkillCombatente1('');
    setSkillCombatente2('');
    setClasse(null);
    setTelaAtual('atributos');
    setProtecoes([]);
    setResistencias([]);
    setProficiencias([]);
    status.resetarStatus();
  }, [status]);

  // ============================================================
  // VALUE DO CONTEXTO
  // ============================================================
  // Calcula status reais
  const { pvMax, peMax, sanMax, peTurno } = useMemo(() => {
    if (!classe) return { pvMax: 0, peMax: 0, sanMax: 0, peTurno: 0 };
    return calcularStatusBase(classe, atributosFinais, nivel, regrasAutomaticasAtivas);
  }, [classe, atributosFinais, nivel, regrasAutomaticasAtivas]);

  const value: RPGContextType = {
    telaAtual, setTelaAtual,
    classe, setClasse,
    nex, setNex,
    atributos, setAtributos,
    bonusAtributos, setBonusAtributos,
    pontosRestantes, alterarAtributo,
    status, periciasHook, poderesHook, origensHook, trilhasHook, rituaisHook, inventarioHook, armasHook, municoesHook, protecoesHook, itensHook, itensAmaldicoadosHook, toggleVestimentaGeral, modificacoesHook, maldicoesHook, bonusVestimentas,
    abaDireita, setAbaDireita,
    abaModalPoderes, setAbaModalPoderes,
    tipoModalPoderes, setTipoModalPoderes,
    defEquip, setDefEquip,
    defOutros, setDefOutros,
    defesaTotal,
    totalDefesaProtecoes,
    bloqueioData, setBloqueioData,
    protecoes, setProtecoes,
    proficienciasTotais,
    sentidos, setSentidos,
    imunidades, setImunidades,
    vulnerabilidades, setVulnerabilidades,
    resistencias, setResistencias,
    proficiencias, setProficiencias,
    regrasAtivas, setRegrasAtivas,
    bloquearLetras, refazerPersonagem,
    filtroHabilidades, setFiltroHabilidades,
    habilidadesExpandidas, setHabilidadesExpandidas,
    nexModalAberto, setNexModalAberto,
    poderesModalExpandidos, setPoderesModalExpandidos,
    nexPoderEditando, setNexPoderEditando,
    nomeEditando, setNomeEditando,
    descricaoEditando, setDescricaoEditando,
    afinidadeEditando, setAfinidadeEditando,
    skillCombatente1, setSkillCombatente1,
    skillCombatente2, setSkillCombatente2,
    deslocM, setDeslocM,
    deslocQ, setDeslocQ,
    bonusDadosCondicionais, setBonusDadosCondicionais,
    bonusDadosAtivos, setBonusDadosAtivos,
    regras, setRegras, toggleRegra,
    nivel, setNivel,
    rituaisExpandidos, setRituaisExpandidos,
    versaoRitual, setVersaoRitual,
    elementoRitual, setElementoRitual,
    afinidadeEscolhida, setAfinidadeEscolhida, afinidadeAtiva,
    poderesExtras, setPoderesExtras,
    progressaoNexRecusados, setProgressaoNexRecusados,
    progressaoNexEditados, setProgressaoNexEditados,
    elementoRegra18, setElementoRegra18,
    regrasAutomaticasAtivas,
    escolhaRegra53, setEscolhaRegra53,
    atributosFinais
  };

  return <RPGContext.Provider value={value}>{children}</RPGContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRPG(): RPGContextType {
  const ctx = useContext(RPGContext);
  if (!ctx) throw new Error('useRPG deve ser usado dentro de RPGProvider');
  return ctx;
}