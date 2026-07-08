import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type {
  Tela,
  ClasseRPG,
  Atributos,
  AtributoKey,
  AbaDireita,
  AbaModalPoderes,
} from '../types';
import { usePoderes } from '../hooks/usePoderes';
import { usePericias } from '../hooks/usePericias';
import { useStatus } from '../hooks/useStatus';
import { useOrigem } from '../hooks/useOrigem';
import { capMaximoAtributo, pontosIniciaisPorNex } from '../utils/rpgRules';

// ============================================================
// TUDO QUE O CONTEXTO EXPÕE
// ============================================================
interface RPGContextType {
  // Navegação
  telaAtual: Tela;
  setTelaAtual: React.Dispatch<React.SetStateAction<Tela>>;

  // Classe
  classe: ClasseRPG;
  setClasse: React.Dispatch<React.SetStateAction<ClasseRPG>>;

  // NEX
  nex: number;
  setNex: React.Dispatch<React.SetStateAction<number>>;

  // Atributos
  atributos: Atributos;
  setAtributos: React.Dispatch<React.SetStateAction<Atributos>>;
  bonusAtributos: Atributos;
  setBonusAtributos: React.Dispatch<React.SetStateAction<Atributos>>;
  pontosRestantes: number;
  alterarAtributo: (nome: AtributoKey, operacao: 'aumentar' | 'diminuir') => void;

  // Status (PV, SAN, PE)
  status: ReturnType<typeof useStatus>;

  // Perícias
  periciasHook: ReturnType<typeof usePericias>;

  // Poderes
  poderesHook: ReturnType<typeof usePoderes>;

  // Abas da ficha
  abaDireita: AbaDireita;
  setAbaDireita: React.Dispatch<React.SetStateAction<AbaDireita>>;
  abaModalPoderes: AbaModalPoderes;
  setAbaModalPoderes: React.Dispatch<React.SetStateAction<AbaModalPoderes>>;

  // Origens
  origensHook: ReturnType<typeof useOrigem>;

  // Defesa
  defEquip: number;
  setDefEquip: React.Dispatch<React.SetStateAction<number>>;
  defOutros: number;
  setDefOutros: React.Dispatch<React.SetStateAction<number>>;
  defesaTotal: number;

  // Proteções, Resistências, Proficiências
  protecoes: string[];
  setProtecoes: React.Dispatch<React.SetStateAction<string[]>>;
  resistencias: string[];
  setResistencias: React.Dispatch<React.SetStateAction<string[]>>;
  proficiencias: string[];
  setProficiencias: React.Dispatch<React.SetStateAction<string[]>>;

  // Regras de perícia (invertido semanticamente: true = regras ativas)
  regrasAtivas: boolean;
  setRegrasAtivas: React.Dispatch<React.SetStateAction<boolean>>;

  // Utilitários
  bloquearLetras: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  refazerPersonagem: () => void;

  // Habilidades
  filtroHabilidades: string;
  setFiltroHabilidades: React.Dispatch<React.SetStateAction<string>>;
  habilidadesExpandidas: string[];
  setHabilidadesExpandidas: React.Dispatch<React.SetStateAction<string[]>>;

  // Modal de poderes
  nexModalAberto: number | null;
  setNexModalAberto: React.Dispatch<React.SetStateAction<number | null>>;
  poderesModalExpandidos: number[];
  setPoderesModalExpandidos: React.Dispatch<React.SetStateAction<number[]>>;

  // Editor inline de poderes
  nexPoderEditando: number | null;
  setNexPoderEditando: React.Dispatch<React.SetStateAction<number | null>>;
  nomeEditando: string;
  setNomeEditando: React.Dispatch<React.SetStateAction<string>>;
  descricaoEditando: string;
  setDescricaoEditando: React.Dispatch<React.SetStateAction<string>>;

  // Skills do Combatente
  skillCombatente1: string;
  setSkillCombatente1: React.Dispatch<React.SetStateAction<string>>;
  skillCombatente2: string;
  setSkillCombatente2: React.Dispatch<React.SetStateAction<string>>;

  // Deslocamento
  deslocM: number;
  setDeslocM: React.Dispatch<React.SetStateAction<number>>;
  deslocQ: number;
  setDeslocQ: React.Dispatch<React.SetStateAction<number>>;
}

const RPGContext = createContext<RPGContextType | null>(null);

// ============================================================
// PROVIDER — envolve a aplicação inteira
// ============================================================
export function RPGProvider({ children }: { children: React.ReactNode }) {
  // --- Navegação ---
  const [telaAtual, setTelaAtual] = useState<Tela>('atributos');

  // --- Classe e NEX ---
  const [classe, setClasse] = useState<ClasseRPG>(null);
  const [nex, setNex] = useState(5);

  // --- Abas ---
  const [abaDireita, setAbaDireita] = useState<AbaDireita>('combate');
  const [abaModalPoderes, setAbaModalPoderes] = useState<AbaModalPoderes>('classe');

  // --- Atributos ---
  const [atributos, setAtributos] = useState<Atributos>({ FOR: 1, AGI: 1, INT: 1, PRE: 1, VIG: 1 });
  const [bonusAtributos, setBonusAtributos] = useState<Atributos>({ FOR: 0, AGI: 0, INT: 0, PRE: 0, VIG: 0 });

  // --- Defesa ---
  const [defEquip, setDefEquip] = useState(0);
  const [defOutros, setDefOutros] = useState(0);

  // --- Proteções, Resistências, Proficiências ---
  const [protecoes, setProtecoes] = useState<string[]>([]);
  const [resistencias, setResistencias] = useState<string[]>([]);
  const [proficiencias, setProficiencias] = useState<string[]>([]);

  // --- Perícias / Regras ---
  const [regrasAtivas, setRegrasAtivas] = useState(true);

  // --- Habilidades ---
  const [filtroHabilidades, setFiltroHabilidades] = useState('');
  const [habilidadesExpandidas, setHabilidadesExpandidas] = useState<string[]>([]);

  // --- Modal de poderes ---
  const [nexModalAberto, setNexModalAberto] = useState<number | null>(null);
  const [poderesModalExpandidos, setPoderesModalExpandidos] = useState<number[]>([]);

  // --- Editor inline de poderes ---
  const [nexPoderEditando, setNexPoderEditando] = useState<number | null>(null);
  const [nomeEditando, setNomeEditando] = useState('');
  const [descricaoEditando, setDescricaoEditando] = useState('');

  // --- Combatente skills ---
  const [skillCombatente1, setSkillCombatente1] = useState('');
  const [skillCombatente2, setSkillCombatente2] = useState('');

  // --- Deslocamento ---
  const [deslocM, setDeslocM] = useState(9);
  const [deslocQ, setDeslocQ] = useState(6);

  // ============================================================
  // HOOKS
  // ============================================================

  const poderesHook = usePoderes(classe);
  const origensHook = useOrigem();
  const status = useStatus(classe, nex, atributos);

  // Perícias grátis (vem da classe + origem)
  const periciasGratis = useMemo(() => {
    const gratis: string[] = [];
    if (classe === 'Ocultista') {
      gratis.push('Vontade', 'Ocultismo');
    } else if (classe === 'Combatente') {
      if (skillCombatente1) gratis.push(skillCombatente1);
      if (skillCombatente2) gratis.push(skillCombatente2);
    }
    if (origensHook.origemSelecionada) {
      if (origensHook.origemSelecionada.nome_p1) gratis.push(origensHook.origemSelecionada.nome_p1);
      if (origensHook.origemSelecionada.nome_p2) gratis.push(origensHook.origemSelecionada.nome_p2);
      if (origensHook.origemSelecionada.nome_pesp) gratis.push(origensHook.origemSelecionada.nome_pesp);
    }
    return gratis;
  }, [classe, skillCombatente1, skillCombatente2, origensHook.origemSelecionada]);

  const periciasHook = usePericias(classe, nex, atributos, regrasAtivas, periciasGratis);

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
  // DEFESA (valor derivado — podia ser só useMemo)
  // ============================================================
  const defesaTotal = 10 + atributos.AGI + bonusAtributos.AGI + defEquip + defOutros;

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

  const value: RPGContextType = {
    telaAtual, setTelaAtual,
    classe, setClasse,
    nex, setNex,
    atributos, setAtributos,
    bonusAtributos, setBonusAtributos,
    pontosRestantes, alterarAtributo,
    status,
    periciasHook,
    poderesHook,
    abaDireita, setAbaDireita,
    abaModalPoderes, setAbaModalPoderes,
    origensHook,
    defEquip, setDefEquip,
    defOutros, setDefOutros,
    defesaTotal,
    protecoes, setProtecoes,
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
  };

  return <RPGContext.Provider value={value}>{children}</RPGContext.Provider>;
}

// ============================================================
// HOOK PARA CONSUMIR O CONTEXTO
// ============================================================
export function useRPG(): RPGContextType {
  const ctx = useContext(RPGContext);
  if (!ctx) throw new Error('useRPG deve ser usado dentro de RPGProvider');
  return ctx;
}