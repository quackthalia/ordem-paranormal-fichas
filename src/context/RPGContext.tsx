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
  protecoes: string[];
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
  skillCombatente1: string;
  setSkillCombatente1: React.Dispatch<React.SetStateAction<string>>;
  skillCombatente2: string;
  setSkillCombatente2: React.Dispatch<React.SetStateAction<string>>;
  deslocM: number;
  setDeslocM: React.Dispatch<React.SetStateAction<number>>;
  deslocQ: number;
  setDeslocQ: React.Dispatch<React.SetStateAction<number>>;
  regras: Record<string, boolean>;
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
  const [skillCombatente1, setSkillCombatente1] = useState('');
  const [skillCombatente2, setSkillCombatente2] = useState('');
  const [deslocM, setDeslocM] = useState(9);
  const [deslocQ, setDeslocQ] = useState(6);
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

  const toggleRegra = useCallback((nome: string) => {
    setRegras(prev => {
      const novo = { ...prev, [nome]: !prev[nome] };
      // Se ativar nex_experiencia, pode calcular um nivel base inicial pra facilitar
      if (nome === 'nex_experiencia' && novo[nome]) {
        setNivel(Math.min(20, Math.max(1, Math.ceil(nex / 5))));
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
  const rituaisHook = useRituais();

  // Computa o conjunto de regras automáticas ativas
  const regrasAutomaticasAtivas = useMemo(() => {
    const set = new Set<number>();
    if (origensHook.origemSelecionada?.Codigo_Regra) {
      set.add(origensHook.origemSelecionada.Codigo_Regra);
    }
    Object.values(poderesHook.poderesEscolhidos).forEach(p => {
      if (p.Codigo_Regra) set.add(p.Codigo_Regra);
    });
    return set;
  }, [origensHook.origemSelecionada, poderesHook.poderesEscolhidos]);

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

  const quantidadePoderesParanormais = useMemo(() => {
    return Object.entries(poderesHook.poderesEscolhidos).filter(([key, p]) => p.categoria === 'paranormais' && key !== 'extra_regra1').length;
  }, [poderesHook.poderesEscolhidos]);

  const status = useStatus(classe, nex, nivel, atributos, quantidadePoderesParanormais, regrasAutomaticasAtivas);

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

  const periciasHook = usePericias(classe, nex, atributos, regrasAtivas, periciasGratis, origensHook.origemSelecionada?.Codigo_Per_Regra, veteranasGratis);

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
  // DEFESA
  // ============================================================
  const defOutrosBonusRegra4 = regrasAutomaticasAtivas.has(4) ? 2 : 0;
  const defesaTotal = 10 + atributos.AGI + bonusAtributos.AGI + defEquip + defOutros + defOutrosBonusRegra4;

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
    return calcularStatusBase(classe, atributos, nivel, origensHook.origemSelecionada?.Codigo_Regra);
  }, [classe, atributos, nivel, origensHook.origemSelecionada?.Codigo_Regra]);

  const value: RPGContextType = {
    telaAtual, setTelaAtual,
    classe, setClasse,
    nex, setNex,
    atributos, setAtributos,
    bonusAtributos, setBonusAtributos,
    pontosRestantes, alterarAtributo,
    status, periciasHook, poderesHook, origensHook, trilhasHook, rituaisHook, inventarioHook,
    abaDireita, setAbaDireita,
    abaModalPoderes, setAbaModalPoderes,
    tipoModalPoderes, setTipoModalPoderes,
    defEquip, setDefEquip,
    defOutros, setDefOutros,
    defesaTotal,
    protecoes, setProtecoes,
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
    skillCombatente1, setSkillCombatente1,
    skillCombatente2, setSkillCombatente2,
    deslocM, setDeslocM,
    deslocQ, setDeslocQ,
    regras, toggleRegra,
    nivel, setNivel,
    rituaisHook,
    rituaisExpandidos, setRituaisExpandidos,
    versaoRitual, setVersaoRitual,
    elementoRitual, setElementoRitual,
    afinidadeEscolhida, setAfinidadeEscolhida, afinidadeAtiva,
    poderesExtras, setPoderesExtras,
    progressaoNexRecusados, setProgressaoNexRecusados,
    progressaoNexEditados, setProgressaoNexEditados,
    elementoRegra18, setElementoRegra18,
    regrasAutomaticasAtivas,
  };

  return <RPGContext.Provider value={value}>{children}</RPGContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRPG(): RPGContextType {
  const ctx = useContext(RPGContext);
  if (!ctx) throw new Error('useRPG deve ser usado dentro de RPGProvider');
  return ctx;
}