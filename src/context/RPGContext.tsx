import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
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
import { calcularBonusMaldicoes, type MaldicoesBonusGlobais } from '../utils/maldicoesRules';
import { useModificacoes } from '../hooks/useModificacoes';
import { useMaldicoes } from '../hooks/useMaldicoes';
import { capMaximoAtributo, pontosIniciaisPorNivel } from '../utils/rpgRules';

// ============================================================
// TUDO QUE O CONTEXTO EXPÕE
// ============================================================
interface RPGContextType {
  telaAtual: Tela;
  setTelaAtual: React.Dispatch<React.SetStateAction<Tela>>;
  classe: ClasseRPG;
  setClasse: React.Dispatch<React.SetStateAction<ClasseRPG>>;
  nex: number;
  rawNex: number;
  setNex: React.Dispatch<React.SetStateAction<number>>;
  nomePersonagem: string;
  setNomePersonagem: React.Dispatch<React.SetStateAction<string>>;
  nomeJogador: string;
  setNomeJogador: React.Dispatch<React.SetStateAction<string>>;
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
  bonusMaldicoes: MaldicoesBonusGlobais;
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
  defOutrosBonusVampiro: number;
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
  regrasAtivasAtributos: boolean;
  setRegrasAtivasAtributos: React.Dispatch<React.SetStateAction<boolean>>;
  bloquearLetras: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  refazerPersonagem: () => void;
  filtroHabilidades: string;
  setFiltroHabilidades: React.Dispatch<React.SetStateAction<string>>;
  habilidadesExpandidas: string[];
  setHabilidadesExpandidas: React.Dispatch<React.SetStateAction<string[]>>;
  nexModalAberto: number | string | null;
  setNexModalAberto: React.Dispatch<React.SetStateAction<number | string | null>>;
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
  rawNivel: number;
  setNivel: React.Dispatch<React.SetStateAction<number>>;
  rituaisHook: ReturnType<typeof useRituais>;
  rituaisExpandidos: number[];
  setRituaisExpandidos: React.Dispatch<React.SetStateAction<number[]>>;
  versaoRitual: Record<number, VersaoRitual>;
  setVersaoRitual: React.Dispatch<React.SetStateAction<Record<number, VersaoRitual>>>;
  elementoRitual: Record<number, string>;
  setElementoRitual: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  jaTinhaPericiaTrilha: boolean;
  jaTinhaPericiaVersatilidade: boolean;
  periciasGratisSemTrilha: string[];
  jaTinhaProfissaoTrilha: boolean;
  trilhaProfissaoConcedida: string | null;

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
  temGranadeiro10: boolean;
  temGranadeiro40: boolean;
  temGranadeiro65: boolean;
  temGranadeiro99: boolean;
  maxExplosivosAutorais: number;
  temDobroPerito: boolean;
  temCriptologista10: boolean;
  temCriptologista40: boolean;
  temCriptologista65: boolean;
  temCriptologista99: boolean;
  selosPorInterludio: number;
  temDobroCriarSelo: boolean;
  temIlusionista10: boolean;
  temIlusionista40: boolean;
  temIlusionista65: boolean;
  temIlusionista99: boolean;
  temArtistaMarcialTrilha10: boolean;
  temArtistaMarcialTrilha40: boolean;
  temArtistaMarcialTrilha65: boolean;
  temArtistaMarcialTrilha99: boolean;
  temArtistaMarcialAprimorado: boolean;
  temAdepto10: boolean;
  temAdepto40: boolean;
  temAdepto65: boolean;
  temAdepto99: boolean;
  temMataLeao10: boolean;
  temAcrobata10: boolean;
  temAcrobata40: boolean;
  temAcrobata65: boolean;
  temAcrobata99: boolean;
  temVigilante10: boolean;
  temVigilante40: boolean;
  temVigilante65: boolean;
  temVigilante99: boolean;
  temViajanteDasSombras10: boolean;
  temViajanteDasSombras40: boolean;
  temViajanteDasSombras65: boolean;
  temViajanteDasSombras99: boolean;
  temServente10: boolean;
  temServente40: boolean;
  temServente65: boolean;
  temServente99: boolean;
  serventeElementoPrimario: string;
  serventeElementoSecundario: string;
  temMonstruoso10: boolean;
  temMonstruoso40: boolean;
  temMonstruoso65: boolean;
  temMonstruoso75: boolean;
  temMonstruoso99: boolean;
  isMonstruosoAtivo10: boolean;
  isMonstruosoAtivo40: boolean;
  isMonstruosoAtivo65: boolean;
  isMonstruosoAtivo75: boolean;
  temMonstruosoEsp10: boolean;
  temMonstruosoEsp40: boolean;
  temMonstruosoEsp65: boolean;
  temMonstruosoEsp75: boolean;
  temMonstruosoEsp99: boolean;
  isMonstruosoEspAtivo: boolean;
  temMonstruosoOcult10: boolean;
  temMonstruosoOcult40: boolean;
  temMonstruosoOcult65: boolean;
  temMonstruosoOcult75: boolean;
  temMonstruosoOcult99: boolean;
  isMonstruosoOcultAtivo: boolean;
  monstruosoElemento: string;
  jaTinhaOcultismoMonstruoso: boolean;
  temVampiro10: boolean;
  temVampiro40: boolean;
  temVampiro65: boolean;
  temVampiro99: boolean;
  vampiroArquetipo: string;
  bloquearIntimidacaoVampiro: boolean;
  bonusDeslocTrilha34: number;
  bonusDeslocTotal: number;
  deslocamentoTotalM: number;
  danoDeMovimento: number;
  bonusDefesaTrilha34: number;
  defOutrosBonusRegra72: number;
  defOutrosBonusRegra107: number;
  devorarIntCount: number;
  necrosarForCount: number;
  inexistirAgiCount: number;
  queimarVigCount: number;
  maxDevorarInt: number;
  maxNecrosarFor: number;
  maxInexistirAgi: number;
  maxQueimarVig: number;
  escolhaRegra53: 'FOR' | 'AGI' | null;
  setEscolhaRegra53: React.Dispatch<React.SetStateAction<'FOR' | 'AGI' | null>>;
  bonusTrilhasAtributos: Atributos;
  atributosFinais: Atributos;
  ppMax: number;
  ppTurno: number;
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
  const [regrasAtivasAtributos, setRegrasAtivasAtributos] = useState(true);
  const [filtroHabilidades, setFiltroHabilidades] = useState('');
  const [habilidadesExpandidas, setHabilidadesExpandidas] = useState<string[]>([]);
  const [nexModalAberto, setNexModalAberto] = useState<number | string | null>(null);
  const [poderesModalExpandidos, setPoderesModalExpandidos] = useState<number[]>([]);
  const [nexPoderEditando, setNexPoderEditando] = useState<number | string | null>(null);
  const [nomePersonagem, setNomePersonagem] = useState('');
  const [nomeJogador, setNomeJogador] = useState('');
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
      
      if (nome === 'nex_experiencia') {
        if (novo[nome]) {
          // Ativou a regra: salva nível baseado no NEX atual
          setNivel(Math.min(20, Math.max(1, Math.ceil(nex / 5))));
          setNex(0);
        } else {
          // Desativou a regra: recupera NEX baseado no Nível atual
          setNex(Math.min(99, Math.max(5, nivel * 5)));
        }
      }
      return novo;
    });
  }, [nex, nivel]);


  // ============================================================
  // HOOKS
  // ============================================================
  const trilhasHook = useTrilhas(classe);
  const poderesHook = usePoderes(classe);
  const origensHook = useOrigem();

  useEffect(() => {
    if (trilhasHook.trilhaSelecionada?.Codigo_Trilha !== 1 && poderesExtras["aniquilador_arma_favorita"]) {
      setPoderesExtras(prev => {
        const next = { ...prev };
        delete next["aniquilador_arma_favorita"];
        return next;
      });
    }
  }, [trilhasHook.trilhaSelecionada?.Codigo_Trilha]);

  const isTrilhaAM = Boolean(
    trilhasHook.trilhaSelecionada && (
      Number(trilhasHook.trilhaSelecionada.Codigo_Trilha) === 31 ||
      Number((trilhasHook.trilhaSelecionada as any)?.codigo_trilha) === 31 ||
      String(trilhasHook.trilhaSelecionada.Nome_Trilha || '').trim().toLowerCase() === 'artista marcial'
    )
  );
  const isVersatilidadeAM = Boolean(
    trilhasHook.versatilidadeSelecionada && (
      Number(trilhasHook.versatilidadeSelecionada.Codigo_Trilha) === 31 ||
      Number((trilhasHook.versatilidadeSelecionada as any)?.codigo_trilha) === 31 ||
      String(trilhasHook.versatilidadeSelecionada.Nome_Trilha || '').trim().toLowerCase() === 'artista marcial'
    )
  );
  const temArtistaMarcialTrilha = isTrilhaAM || isVersatilidadeAM;
  const temArtistaMarcialTrilha10 = isTrilhaAM || (isVersatilidadeAM && (regras['nex_experiencia'] ? (nivel >= 10) : (nex >= 50)));
  const temArtistaMarcialNosPoderes = Object.values(poderesHook.poderesEscolhidos).some(p => 
    p.codigoRegra === 84 || p.nome?.toLowerCase() === 'artista marcial'
  );
  const temArtistaMarcialAprimorado = temArtistaMarcialTrilha10 && temArtistaMarcialNosPoderes;

  // Computa o conjunto de regras automáticas ativas
  const regrasAutomaticasAtivas = useMemo(() => {
    const set = new Set<number>();
    if (origensHook.origemSelecionada?.Codigo_Regra) {
      set.add(Number(origensHook.origemSelecionada.Codigo_Regra));
    }
    Object.values(poderesHook.poderesEscolhidos).forEach(p => {
      if (p.codigoRegra) set.add(Number(p.codigoRegra));
    });
    if (temArtistaMarcialTrilha10) {
      set.add(84);
    }
    // Precisa bater com effectiveNex/effectiveNivel (inclui +5% NEX / +1 nível da Regra 83 - Agente de Nascença)
    const bonusNex83 = set.has(83) ? 5 : 0;
    const bonusNivel83 = set.has(83) ? 1 : 0;
    const effNex = Math.min(99, (regras['nex_experiencia'] ? nivel * 5 : nex) + bonusNex83);
    const effNivel = Math.min(20, (regras['nex_experiencia'] ? nivel : Math.ceil(nex / 5)) + bonusNivel83);
    const isMonstTrilha = trilhasHook.trilhaSelecionada && (
      Number(trilhasHook.trilhaSelecionada.Codigo_Trilha) === 18 ||
      Number((trilhasHook.trilhaSelecionada as any)?.codigo_trilha) === 18 ||
      (String(trilhasHook.trilhaSelecionada.Nome_Trilha || '').trim().toLowerCase().includes('monstruoso') && (trilhasHook.trilhaSelecionada.Classe_Trilha === 'Combatente' || (trilhasHook.trilhaSelecionada as any)?.classe === 'Combatente'))
    );
    const isMonstVers = trilhasHook.versatilidadeSelecionada && (
      Number(trilhasHook.versatilidadeSelecionada.Codigo_Trilha) === 18 ||
      Number((trilhasHook.versatilidadeSelecionada as any)?.codigo_trilha) === 18 ||
      (String(trilhasHook.versatilidadeSelecionada.Nome_Trilha || '').trim().toLowerCase().includes('monstruoso') && (trilhasHook.versatilidadeSelecionada.Classe_Trilha === 'Combatente' || (trilhasHook.versatilidadeSelecionada as any)?.classe === 'Combatente'))
    );
    const hasMonst10 = (isMonstTrilha && (regras['nex_experiencia'] ? effNivel >= 2 : effNex >= 10)) || (isMonstVers && (regras['nex_experiencia'] ? effNivel >= 10 : effNex >= 50));
    const hasMonst40 = isMonstTrilha && (regras['nex_experiencia'] ? effNivel >= 8 : effNex >= 40);
    const hasMonst65 = isMonstTrilha && (regras['nex_experiencia'] ? effNivel >= 13 : effNex >= 65);
    const hasMonst75 = isMonstTrilha && (regras['nex_experiencia'] ? effNivel >= 15 : effNex >= 75);
    const hasMonst99 = isMonstTrilha && (regras['nex_experiencia'] ? effNivel >= 20 : effNex >= 99);
    const elemMonst = afinidadeEscolhida || poderesExtras['monstruoso_elemento'] || 'Sangue';

    const isMonstruosoAtivo = hasMonst99 || poderesExtras['monstruoso_ativo'] !== 'false';
    const isMonstAtivo10 = isMonstruosoAtivo;
    const isMonstAtivo40 = isMonstruosoAtivo;
    const isMonstAtivo65 = isMonstruosoAtivo;
    const isMonstAtivo75 = true;

    if (hasMonst10 && isMonstAtivo10) {
      if (elemMonst === 'Sangue') set.add(70);
      else if (elemMonst === 'Morte') set.add(71);
      else if (elemMonst === 'Conhecimento') set.add(72);
      else if (elemMonst === 'Energia') set.add(73);
    }
    if (hasMonst40 && isMonstAtivo40) {
      if (elemMonst === 'Morte') set.add(74);
      else if (elemMonst === 'Conhecimento') set.add(75);
    }
    if (hasMonst65 && isMonstAtivo65) {
      if (elemMonst === 'Energia') set.add(76);
    }
    if (hasMonst75 && isMonstAtivo75) {
      set.add(69);
    }
    if (hasMonst99) {
      if (elemMonst === 'Sangue') set.add(77);
      else if (elemMonst === 'Morte') set.add(78);
      else if (elemMonst === 'Conhecimento') set.add(79);
      else if (elemMonst === 'Energia') set.add(80);
    }

    // Trilha 45: Monstruoso (Especialista)
    const isMonstEspTrilha = trilhasHook.trilhaSelecionada && (
      Number(trilhasHook.trilhaSelecionada.Codigo_Trilha) === 45 ||
      Number((trilhasHook.trilhaSelecionada as any)?.codigo_trilha) === 45 ||
      (String(trilhasHook.trilhaSelecionada.Nome_Trilha || '').trim().toLowerCase().includes('monstruoso') && (trilhasHook.trilhaSelecionada.Classe_Trilha === 'Especialista' || (trilhasHook.trilhaSelecionada as any)?.classe === 'Especialista'))
    );
    const isMonstEspVers = trilhasHook.versatilidadeSelecionada && (
      Number(trilhasHook.versatilidadeSelecionada.Codigo_Trilha) === 45 ||
      Number((trilhasHook.versatilidadeSelecionada as any)?.codigo_trilha) === 45 ||
      (String(trilhasHook.versatilidadeSelecionada.Nome_Trilha || '').trim().toLowerCase().includes('monstruoso') && (trilhasHook.versatilidadeSelecionada.Classe_Trilha === 'Especialista' || (trilhasHook.versatilidadeSelecionada as any)?.classe === 'Especialista'))
    );
    const hasMonstEsp10 = (isMonstEspTrilha && (regras['nex_experiencia'] ? effNivel >= 2 : effNex >= 10)) || (isMonstEspVers && (regras['nex_experiencia'] ? effNivel >= 10 : effNex >= 50));
    const hasMonstEsp40 = isMonstEspTrilha && (regras['nex_experiencia'] ? effNivel >= 8 : effNex >= 40);
    const hasMonstEsp65 = isMonstEspTrilha && (regras['nex_experiencia'] ? effNivel >= 13 : effNex >= 65);
    const hasMonstEsp75 = isMonstEspTrilha && (regras['nex_experiencia'] ? effNivel >= 15 : effNex >= 75);
    const hasMonstEsp99 = isMonstEspTrilha && (regras['nex_experiencia'] ? effNivel >= 20 : effNex >= 99);
    const isMonstEspAtivo = poderesExtras['monstruoso_ativo'] !== 'false';

    if (hasMonstEsp10 && isMonstEspAtivo) {
      if (elemMonst === 'Sangue') set.add(100);
      else if (elemMonst === 'Morte') set.add(101);
      else if (elemMonst === 'Conhecimento') set.add(102);
      else if (elemMonst === 'Energia') set.add(103);
    }
    if (hasMonstEsp40 && isMonstEspAtivo) {
      if (elemMonst === 'Sangue') set.add(104);
      else if (elemMonst === 'Morte') set.add(105);
      else if (elemMonst === 'Conhecimento') set.add(106);
      else if (elemMonst === 'Energia') set.add(107);
    }
    if (hasMonstEsp65 && isMonstEspAtivo) {
      if (elemMonst === 'Sangue') set.add(108);
      else if (elemMonst === 'Morte') set.add(109);
      else if (elemMonst === 'Conhecimento') set.add(110);
      else if (elemMonst === 'Energia') set.add(111);
    }
    if (hasMonstEsp75) {
      set.add(69);
    }
    if (hasMonstEsp99 && isMonstEspAtivo) {
      if (elemMonst === 'Sangue') set.add(112);
      else if (elemMonst === 'Morte') set.add(113);
      else if (elemMonst === 'Conhecimento') set.add(114);
      else if (elemMonst === 'Energia') set.add(115);
    }

    // Trilha 47: Monstruoso (Ocultista)
    const isMonstOcultTrilha = trilhasHook.trilhaSelecionada && (
      Number(trilhasHook.trilhaSelecionada.Codigo_Trilha) === 47 ||
      Number((trilhasHook.trilhaSelecionada as any)?.codigo_trilha) === 47 ||
      (String(trilhasHook.trilhaSelecionada.Nome_Trilha || '').trim().toLowerCase().includes('monstruoso') && (trilhasHook.trilhaSelecionada.Classe_Trilha === 'Ocultista' || (trilhasHook.trilhaSelecionada as any)?.classe === 'Ocultista'))
    );
    const isMonstOcultVers = trilhasHook.versatilidadeSelecionada && (
      Number(trilhasHook.versatilidadeSelecionada.Codigo_Trilha) === 47 ||
      Number((trilhasHook.versatilidadeSelecionada as any)?.codigo_trilha) === 47 ||
      (String(trilhasHook.versatilidadeSelecionada.Nome_Trilha || '').trim().toLowerCase().includes('monstruoso') && (trilhasHook.versatilidadeSelecionada.Classe_Trilha === 'Ocultista' || (trilhasHook.versatilidadeSelecionada as any)?.classe === 'Ocultista'))
    );
    const hasMonstOcult10 = (isMonstOcultTrilha && (regras['nex_experiencia'] ? effNivel >= 2 : effNex >= 10)) || (isMonstOcultVers && (regras['nex_experiencia'] ? effNivel >= 10 : effNex >= 50));
    const hasMonstOcult40 = isMonstOcultTrilha && (regras['nex_experiencia'] ? effNivel >= 8 : effNex >= 40);
    const hasMonstOcult65 = isMonstOcultTrilha && (regras['nex_experiencia'] ? effNivel >= 13 : effNex >= 65);
    const hasMonstOcult75 = isMonstOcultTrilha && (regras['nex_experiencia'] ? effNivel >= 15 : effNex >= 75);
    const hasMonstOcult99 = isMonstOcultTrilha && (regras['nex_experiencia'] ? effNivel >= 20 : effNex >= 99);
    const isMonstOcultAtivo = poderesExtras['monstruoso_ativo'] !== 'false';

    if (hasMonstOcult10 && isMonstOcultAtivo) {
      if (elemMonst === 'Sangue') set.add(116);
      else if (elemMonst === 'Morte') set.add(117);
      else if (elemMonst === 'Conhecimento') set.add(118);
      else if (elemMonst === 'Energia') set.add(119);
    }
    if (hasMonstOcult40 && isMonstOcultAtivo) {
      if (elemMonst === 'Sangue') set.add(120);
      else if (elemMonst === 'Morte') set.add(121);
      else if (elemMonst === 'Conhecimento') set.add(122);
      else if (elemMonst === 'Energia') set.add(123);
    }
    if (hasMonstOcult65 && isMonstOcultAtivo) {
      if (elemMonst === 'Sangue') set.add(124);
      else if (elemMonst === 'Morte') set.add(125);
      else if (elemMonst === 'Conhecimento') set.add(126);
      else if (elemMonst === 'Energia') set.add(127);
    }
    if (hasMonstOcult75) {
      set.add(69);
    }
    if (hasMonstOcult99 && isMonstOcultAtivo) {
      if (elemMonst === 'Sangue') set.add(128);
      else if (elemMonst === 'Morte') set.add(129);
      else if (elemMonst === 'Conhecimento') set.add(130);
      else if (elemMonst === 'Energia') set.add(131);
    }
    return set;
  }, [origensHook.origemSelecionada, poderesHook.poderesEscolhidos, temArtistaMarcialTrilha10, trilhasHook.trilhaSelecionada, trilhasHook.versatilidadeSelecionada, regras, nivel, nex, afinidadeEscolhida, poderesExtras]);

  const effectiveNex = useMemo(() => {
    let finalNex = nex;
    if (regrasAutomaticasAtivas.has(83)) finalNex += 5;
    return Math.min(99, finalNex);
  }, [nex, regrasAutomaticasAtivas]);

  const effectiveNivel = useMemo(() => {
    let finalNivel = nivel;
    if (regrasAutomaticasAtivas.has(83)) finalNivel += 1;
    return Math.min(20, finalNivel);
  }, [nivel, regrasAutomaticasAtivas]);

  const isTrilhaAcrobata = Boolean(
    trilhasHook.trilhaSelecionada && (
      Number(trilhasHook.trilhaSelecionada.Codigo_Trilha) === 34 ||
      Number((trilhasHook.trilhaSelecionada as any)?.codigo_trilha) === 34 ||
      String(trilhasHook.trilhaSelecionada.Nome_Trilha || '').trim().toLowerCase().includes('acrobata')
    )
  );
  const isVersatilidadeAcrobata = Boolean(
    trilhasHook.versatilidadeSelecionada && (
      Number(trilhasHook.versatilidadeSelecionada.Codigo_Trilha) === 34 ||
      Number((trilhasHook.versatilidadeSelecionada as any)?.codigo_trilha) === 34 ||
      String(trilhasHook.versatilidadeSelecionada.Nome_Trilha || '').trim().toLowerCase().includes('acrobata')
    )
  );
  const temAcrobata10 = (isTrilhaAcrobata && (regras['nex_experiencia'] ? effectiveNivel >= 2 : effectiveNex >= 10)) || (isVersatilidadeAcrobata && (regras['nex_experiencia'] ? effectiveNivel >= 10 : effectiveNex >= 50));
  const temAcrobata40 = isTrilhaAcrobata && (regras['nex_experiencia'] ? effectiveNivel >= 8 : effectiveNex >= 40);
  const temAcrobata65 = isTrilhaAcrobata && (regras['nex_experiencia'] ? effectiveNivel >= 13 : effectiveNex >= 65);
  const temAcrobata99 = isTrilhaAcrobata && (regras['nex_experiencia'] ? effectiveNivel >= 20 : effectiveNex >= 99);

  const isTrilhaVigilante = Boolean(
    trilhasHook.trilhaSelecionada && (
      Number(trilhasHook.trilhaSelecionada.Codigo_Trilha) === 35 ||
      Number((trilhasHook.trilhaSelecionada as any)?.codigo_trilha) === 35 ||
      String(trilhasHook.trilhaSelecionada.Nome_Trilha || '').trim().toLowerCase().includes('vigilante')
    )
  );
  const isVersatilidadeVigilante = Boolean(
    trilhasHook.versatilidadeSelecionada && (
      Number(trilhasHook.versatilidadeSelecionada.Codigo_Trilha) === 35 ||
      Number((trilhasHook.versatilidadeSelecionada as any)?.codigo_trilha) === 35 ||
      String(trilhasHook.versatilidadeSelecionada.Nome_Trilha || '').trim().toLowerCase().includes('vigilante')
    )
  );
  const temVigilante10 = (isTrilhaVigilante && (regras['nex_experiencia'] ? effectiveNivel >= 2 : effectiveNex >= 10)) || (isVersatilidadeVigilante && (regras['nex_experiencia'] ? effectiveNivel >= 10 : effectiveNex >= 50));
  const temVigilante40 = isTrilhaVigilante && (regras['nex_experiencia'] ? effectiveNivel >= 8 : effectiveNex >= 40);
  const temVigilante65 = isTrilhaVigilante && (regras['nex_experiencia'] ? effectiveNivel >= 13 : effectiveNex >= 65);
  const temVigilante99 = isTrilhaVigilante && (regras['nex_experiencia'] ? effectiveNivel >= 20 : effectiveNex >= 99);

  const isTrilhaViajanteDasSombras = Boolean(
    trilhasHook.trilhaSelecionada && (
      Number(trilhasHook.trilhaSelecionada.Codigo_Trilha) === 44 ||
      Number((trilhasHook.trilhaSelecionada as any)?.codigo_trilha) === 44 ||
      String(trilhasHook.trilhaSelecionada.Nome_Trilha || '').trim().toLowerCase().includes('viajante das sombras')
    )
  );
  const isVersatilidadeViajanteDasSombras = Boolean(
    trilhasHook.versatilidadeSelecionada && (
      Number(trilhasHook.versatilidadeSelecionada.Codigo_Trilha) === 44 ||
      Number((trilhasHook.versatilidadeSelecionada as any)?.codigo_trilha) === 44 ||
      String(trilhasHook.versatilidadeSelecionada.Nome_Trilha || '').trim().toLowerCase().includes('viajante das sombras')
    )
  );
  const temViajanteDasSombras10 = (isTrilhaViajanteDasSombras && (regras['nex_experiencia'] ? effectiveNivel >= 2 : effectiveNex >= 10)) || (isVersatilidadeViajanteDasSombras && (regras['nex_experiencia'] ? effectiveNivel >= 10 : effectiveNex >= 50));
  const temViajanteDasSombras40 = isTrilhaViajanteDasSombras && (regras['nex_experiencia'] ? effectiveNivel >= 8 : effectiveNex >= 40);
  const temViajanteDasSombras65 = isTrilhaViajanteDasSombras && (regras['nex_experiencia'] ? effectiveNivel >= 13 : effectiveNex >= 65);
  const temViajanteDasSombras99 = isTrilhaViajanteDasSombras && (regras['nex_experiencia'] ? effectiveNivel >= 20 : effectiveNex >= 99);

  const isTrilhaServente = Boolean(
    trilhasHook.trilhaSelecionada && (
      Number(trilhasHook.trilhaSelecionada.Codigo_Trilha) === 43 ||
      Number((trilhasHook.trilhaSelecionada as any)?.codigo_trilha) === 43 ||
      String(trilhasHook.trilhaSelecionada.Nome_Trilha || '').trim().toLowerCase().includes('servente')
    )
  );
  const isVersatilidadeServente = Boolean(
    trilhasHook.versatilidadeSelecionada && (
      Number(trilhasHook.versatilidadeSelecionada.Codigo_Trilha) === 43 ||
      Number((trilhasHook.versatilidadeSelecionada as any)?.codigo_trilha) === 43 ||
      String(trilhasHook.versatilidadeSelecionada.Nome_Trilha || '').trim().toLowerCase().includes('servente')
    )
  );
  const temServente10 = (isTrilhaServente && (regras['nex_experiencia'] ? effectiveNivel >= 2 : effectiveNex >= 10)) || (isVersatilidadeServente && (regras['nex_experiencia'] ? effectiveNivel >= 10 : effectiveNex >= 50));
  const temServente40 = isTrilhaServente && (regras['nex_experiencia'] ? effectiveNivel >= 8 : effectiveNex >= 40);
  const temServente65 = isTrilhaServente && (regras['nex_experiencia'] ? effectiveNivel >= 13 : effectiveNex >= 65);
  const temServente99 = isTrilhaServente && (regras['nex_experiencia'] ? effectiveNivel >= 20 : effectiveNex >= 99);

  const serventeElementoPrimario = poderesExtras['servente_elemento_primario'] || 'Sangue';
  const serventeElementoSecundario = poderesExtras['servente_elemento_secundario'] || '';

  const isTrilhaMonstruoso = Boolean(
    trilhasHook.trilhaSelecionada && (
      Number(trilhasHook.trilhaSelecionada.Codigo_Trilha) === 18 ||
      Number((trilhasHook.trilhaSelecionada as any)?.codigo_trilha) === 18 ||
      (String(trilhasHook.trilhaSelecionada.Nome_Trilha || '').trim().toLowerCase().includes('monstruoso') && (trilhasHook.trilhaSelecionada.Classe_Trilha === 'Combatente' || (trilhasHook.trilhaSelecionada as any)?.classe === 'Combatente'))
    )
  );
  const isVersatilidadeMonstruoso = Boolean(
    trilhasHook.versatilidadeSelecionada && (
      Number(trilhasHook.versatilidadeSelecionada.Codigo_Trilha) === 18 ||
      Number((trilhasHook.versatilidadeSelecionada as any)?.codigo_trilha) === 18 ||
      (String(trilhasHook.versatilidadeSelecionada.Nome_Trilha || '').trim().toLowerCase().includes('monstruoso') && (trilhasHook.versatilidadeSelecionada.Classe_Trilha === 'Combatente' || (trilhasHook.versatilidadeSelecionada as any)?.classe === 'Combatente'))
    )
  );
  const temMonstruoso10 = (isTrilhaMonstruoso && (regras['nex_experiencia'] ? effectiveNivel >= 2 : effectiveNex >= 10)) || (isVersatilidadeMonstruoso && (regras['nex_experiencia'] ? effectiveNivel >= 10 : effectiveNex >= 50));
  const temMonstruoso40 = isTrilhaMonstruoso && (regras['nex_experiencia'] ? effectiveNivel >= 8 : effectiveNex >= 40);
  const temMonstruoso65 = isTrilhaMonstruoso && (regras['nex_experiencia'] ? effectiveNivel >= 13 : effectiveNex >= 65);
  const temMonstruoso75 = isTrilhaMonstruoso && (regras['nex_experiencia'] ? effectiveNivel >= 15 : effectiveNex >= 75);
  const temMonstruoso99 = isTrilhaMonstruoso && (regras['nex_experiencia'] ? effectiveNivel >= 20 : effectiveNex >= 99);

  const isMonstruosoAtivo = temMonstruoso99 || poderesExtras['monstruoso_ativo'] !== 'false';
  const isMonstruosoAtivo10 = isMonstruosoAtivo;
  const isMonstruosoAtivo40 = isMonstruosoAtivo;
  const isMonstruosoAtivo65 = isMonstruosoAtivo;
  const isMonstruosoAtivo75 = true;

  const isTrilhaMonstruosoEsp = Boolean(
    trilhasHook.trilhaSelecionada && (
      Number(trilhasHook.trilhaSelecionada.Codigo_Trilha) === 45 ||
      Number((trilhasHook.trilhaSelecionada as any)?.codigo_trilha) === 45 ||
      (String(trilhasHook.trilhaSelecionada.Nome_Trilha || '').trim().toLowerCase().includes('monstruoso') && (trilhasHook.trilhaSelecionada.Classe_Trilha === 'Especialista' || (trilhasHook.trilhaSelecionada as any)?.classe === 'Especialista'))
    )
  );
  const isVersatilidadeMonstruosoEsp = Boolean(
    trilhasHook.versatilidadeSelecionada && (
      Number(trilhasHook.versatilidadeSelecionada.Codigo_Trilha) === 45 ||
      Number((trilhasHook.versatilidadeSelecionada as any)?.codigo_trilha) === 45 ||
      (String(trilhasHook.versatilidadeSelecionada.Nome_Trilha || '').trim().toLowerCase().includes('monstruoso') && (trilhasHook.versatilidadeSelecionada.Classe_Trilha === 'Especialista' || (trilhasHook.versatilidadeSelecionada as any)?.classe === 'Especialista'))
    )
  );
  const temMonstruosoEsp10 = (isTrilhaMonstruosoEsp && (regras['nex_experiencia'] ? effectiveNivel >= 2 : effectiveNex >= 10)) || (isVersatilidadeMonstruosoEsp && (regras['nex_experiencia'] ? effectiveNivel >= 10 : effectiveNex >= 50));
  const temMonstruosoEsp40 = isTrilhaMonstruosoEsp && (regras['nex_experiencia'] ? effectiveNivel >= 8 : effectiveNex >= 40);
  const temMonstruosoEsp65 = isTrilhaMonstruosoEsp && (regras['nex_experiencia'] ? effectiveNivel >= 13 : effectiveNex >= 65);
  const temMonstruosoEsp75 = isTrilhaMonstruosoEsp && (regras['nex_experiencia'] ? effectiveNivel >= 15 : effectiveNex >= 75);
  const temMonstruosoEsp99 = isTrilhaMonstruosoEsp && (regras['nex_experiencia'] ? effectiveNivel >= 20 : effectiveNex >= 99);
  const isMonstruosoEspAtivo = poderesExtras['monstruoso_ativo'] !== 'false';

  const isTrilhaMonstruosoOcult = Boolean(
    trilhasHook.trilhaSelecionada && (
      Number(trilhasHook.trilhaSelecionada.Codigo_Trilha) === 47 ||
      Number((trilhasHook.trilhaSelecionada as any)?.codigo_trilha) === 47 ||
      (String(trilhasHook.trilhaSelecionada.Nome_Trilha || '').trim().toLowerCase().includes('monstruoso') && (trilhasHook.trilhaSelecionada.Classe_Trilha === 'Ocultista' || (trilhasHook.trilhaSelecionada as any)?.classe === 'Ocultista'))
    )
  );
  const isVersatilidadeMonstruosoOcult = Boolean(
    trilhasHook.versatilidadeSelecionada && (
      Number(trilhasHook.versatilidadeSelecionada.Codigo_Trilha) === 47 ||
      Number((trilhasHook.versatilidadeSelecionada as any)?.codigo_trilha) === 47 ||
      (String(trilhasHook.versatilidadeSelecionada.Nome_Trilha || '').trim().toLowerCase().includes('monstruoso') && (trilhasHook.versatilidadeSelecionada.Classe_Trilha === 'Ocultista' || (trilhasHook.versatilidadeSelecionada as any)?.classe === 'Ocultista'))
    )
  );
  const temMonstruosoOcult10 = (isTrilhaMonstruosoOcult && (regras['nex_experiencia'] ? effectiveNivel >= 2 : effectiveNex >= 10)) || (isVersatilidadeMonstruosoOcult && (regras['nex_experiencia'] ? effectiveNivel >= 10 : effectiveNex >= 50));
  const temMonstruosoOcult40 = isTrilhaMonstruosoOcult && (regras['nex_experiencia'] ? effectiveNivel >= 8 : effectiveNex >= 40);
  const temMonstruosoOcult65 = isTrilhaMonstruosoOcult && (regras['nex_experiencia'] ? effectiveNivel >= 13 : effectiveNex >= 65);
  const temMonstruosoOcult75 = isTrilhaMonstruosoOcult && (regras['nex_experiencia'] ? effectiveNivel >= 15 : effectiveNex >= 75);
  const temMonstruosoOcult99 = isTrilhaMonstruosoOcult && (regras['nex_experiencia'] ? effectiveNivel >= 20 : effectiveNex >= 99);
  const isMonstruosoOcultAtivo = poderesExtras['monstruoso_ativo'] !== 'false';

  const monstruosoElemento = useMemo(() => {
    if (afinidadeEscolhida) return afinidadeEscolhida;
    return poderesExtras['monstruoso_elemento'] || 'Sangue';
  }, [afinidadeEscolhida, poderesExtras]);

  // Trilha 48, 49 e 50: Vontade Vampírica (Ancião / Bestial / Encantador)
  const codTrilhaSel = Number(trilhasHook.trilhaSelecionada?.Codigo_Trilha || (trilhasHook.trilhaSelecionada as any)?.codigo_trilha);
  const codVersatilidadeSel = Number(trilhasHook.versatilidadeSelecionada?.Codigo_Trilha || (trilhasHook.versatilidadeSelecionada as any)?.codigo_trilha);
  const isTrilhaVampiro = Boolean(
    trilhasHook.trilhaSelecionada && (
      codTrilhaSel === 48 ||
      codTrilhaSel === 49 ||
      codTrilhaSel === 50 ||
      String(trilhasHook.trilhaSelecionada.Nome_Trilha || '').trim().toLowerCase().includes('vontade vampírica') ||
      String(trilhasHook.trilhaSelecionada.Nome_Trilha || '').trim().toLowerCase().includes('vontade vampirica')
    )
  );
  const isVersatilidadeVampiro = Boolean(
    trilhasHook.versatilidadeSelecionada && (
      codVersatilidadeSel === 48 ||
      codVersatilidadeSel === 49 ||
      codVersatilidadeSel === 50 ||
      String(trilhasHook.versatilidadeSelecionada.Nome_Trilha || '').trim().toLowerCase().includes('vontade vampírica') ||
      String(trilhasHook.versatilidadeSelecionada.Nome_Trilha || '').trim().toLowerCase().includes('vontade vampirica')
    )
  );
  const temVampiro10 = (isTrilhaVampiro && (regras['nex_experiencia'] ? effectiveNivel >= 2 : effectiveNex >= 10)) || (isVersatilidadeVampiro && (regras['nex_experiencia'] ? effectiveNivel >= 10 : effectiveNex >= 50));
  const temVampiro40 = isTrilhaVampiro && (regras['nex_experiencia'] ? effectiveNivel >= 8 : effectiveNex >= 40);
  const temVampiro65 = isTrilhaVampiro && (regras['nex_experiencia'] ? effectiveNivel >= 13 : effectiveNex >= 65);
  const temVampiro99 = isTrilhaVampiro && (regras['nex_experiencia'] ? effectiveNivel >= 20 : effectiveNex >= 99);
  const vampiroArquetipo = poderesExtras['vampiro_arquetipo'] || 'Ancião';
  const bloquearIntimidacaoVampiro = Boolean(
    temVampiro40 &&
    vampiroArquetipo === 'Bestial' &&
    poderesExtras['vampiro_opcao_40'] === '2'
  );

  const opcoesTrilhasArmas = useMemo(() => ({
    temArtistaMarcialTrilha: temArtistaMarcialTrilha10,
    temArtistaMarcialDuplicata: temArtistaMarcialAprimorado,
    temAcrobata10,
    temVampiro10,
    temVampiro40,
    temVampiro65,
    temVampiro99,
    vampiroArquetipo,
    vampiroOpcao40: poderesExtras['vampiro_opcao_40'],
  }), [temArtistaMarcialTrilha10, temArtistaMarcialAprimorado, temAcrobata10, temVampiro10, temVampiro40, temVampiro65, temVampiro99, vampiroArquetipo, poderesExtras]);

  const armasHook = useArmas(effectiveNex, regrasAutomaticasAtivas, opcoesTrilhasArmas);
  const municoesHook = useMunicoes();
  const apenasEscudosMonstruoso = temMonstruoso99 && monstruosoElemento === 'Energia';
  const opcoesProtecoes = useMemo(() => ({ apenasEscudos: apenasEscudosMonstruoso }), [apenasEscudosMonstruoso]);
  const protecoesHook = useProtecoes(opcoesProtecoes);
  const rituaisHook = useRituais();

  const modificacoesHook = useModificacoes();
  const maldicoesHook = useMaldicoes();

  const maxVestimentasMonstruoso = apenasEscudosMonstruoso ? 0 : (regrasAutomaticasAtivas.has(23) ? 3 : 2);
  const itensHook = useItens(maxVestimentasMonstruoso);
  const itensAmaldicoadosHook = useItensAmaldicoados();

  const bonusVestimentas = useMemo(() => {
    return calcularBonusVestimentas(itensAmaldicoadosHook.itensAmaldicoadosInventario);
  }, [itensAmaldicoadosHook.itensAmaldicoadosInventario]);

  const bonusMaldicoes = useMemo(() => {
    return calcularBonusMaldicoes(armasHook.armasInventario, protecoesHook.protecoesInventario, itensHook.itensInventario, municoesHook.municoesInventario, maldicoesHook.maldicoes);
  }, [armasHook.armasInventario, protecoesHook.protecoesInventario, itensHook.itensInventario, municoesHook.municoesInventario, maldicoesHook.maldicoes]);


  const toggleVestimentaGeral = useCallback((id: string, isAmaldicoado: boolean) => {
    const maxVestimentas = maxVestimentasMonstruoso;
    
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

    if (maxVestimentas === 0) {
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

  // Monstruoso 99% Energia: desequipa vestimentas e armaduras que não sejam escudo
  React.useEffect(() => {
    if (temMonstruoso99 && monstruosoElemento === 'Energia') {
      itensHook.setItensInventario(prev => prev.map(i => i.equipado ? { ...i, equipado: false } : i));
      itensAmaldicoadosHook.setItensAmaldicoadosInventario(prev => prev.map(i => i.equipado ? { ...i, equipado: false } : i));
      protecoesHook.setProtecoesInventario(prev => prev.map(i => {
        const isEscudo = i.protecao.Proficiencia?.toLowerCase().includes('escudo') || i.protecao.Nome_Protecao?.toLowerCase().includes('escudo');
        if (i.equipado && !isEscudo) {
          return { ...i, equipado: false };
        }
        return i;
      }));
    }
  }, [temMonstruoso99, monstruosoElemento]);

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
      const getRitualKey = (r: any) => `${r.codigo_ritual}_${r.origem || ''}`;
      
      // Calculate what was added
      current.forEach(ritual => {
        if (ritual.origem?.startsWith('maldicao_conjuracao_')) return;
        const key = getRitualKey(ritual);
        if (!previous.some(p => getRitualKey(p) === key)) {
          const def = rituaisHook.rituais?.find(r => r.Codigo_Ritual === ritual.codigo_ritual);
          const circulo = Number(ritual.circulo || def?.Circulo_Ritual) || 0;
          nexDiff += circulo;
        }
      });
      
      // Calculate what was removed
      previous.forEach(ritual => {
        if (ritual.origem?.startsWith('maldicao_conjuracao_')) return;
        const key = getRitualKey(ritual);
        if (!current.some(p => getRitualKey(p) === key)) {
          const def = rituaisHook.rituais?.find(r => r.Codigo_Ritual === ritual.codigo_ritual);
          const circulo = Number(ritual.circulo || def?.Circulo_Ritual) || 0;
          nexDiff -= circulo;
        }
      });

      if (nexDiff !== 0) {
        setNex(prev => Math.min(99, Math.max(0, prev + nexDiff)));
      }
    }

    rituaisAprendidosRef.current = current;
  }, [rituaisHook.rituaisAprendidos, rituaisHook.rituais, regras]);

  const paranormalPenalty = useMemo(() => {
    const qtd = Object.entries(poderesHook.poderesEscolhidos).filter(([key, p]) => {
      if (p.categoria !== 'paranormais') return false;
      const numKey = Number(key);
      if (!isNaN(numKey) && numKey >= 1000) return false;
      if (String(key).startsWith('extra_')) return false;
      return true;
    }).length;
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


  const temBibliotecario99 = trilhasHook.trilhaSelecionada?.Codigo_Trilha === 19 && (regras['nex_experiencia'] ? effectiveNivel >= 20 : effectiveNex >= 99);
  const temArtistaMarcialTrilha99 = isTrilhaAM && (regras['nex_experiencia'] ? effectiveNivel >= 20 : effectiveNex >= 99);
  const temArtistaMarcialTrilha40 = isTrilhaAM && (regras['nex_experiencia'] ? effectiveNivel >= 8 : effectiveNex >= 40);
  const temArtistaMarcialTrilha65 = isTrilhaAM && (regras['nex_experiencia'] ? effectiveNivel >= 13 : effectiveNex >= 65);

  const bonusTrilhasAtributos = useMemo(() => {
    const obj: Atributos = { FOR: 0, AGI: 0, INT: 0, PRE: 0, VIG: 0 };
    if (temBibliotecario99) obj.INT += 1;
    if (temArtistaMarcialTrilha99) {
      obj.AGI += 1;
      obj.FOR += 1;
    }
    // Monstruoso
    if (temMonstruoso65) {
      obj.PRE -= 1;
    }
    if (temMonstruoso40 && isMonstruosoAtivo40 && monstruosoElemento === 'Conhecimento') {
      obj.INT += 1;
    }
    if (temMonstruoso99) {
      if (monstruosoElemento === 'Sangue') {
        obj.INT -= 1;
        obj.FOR += 1;
      } else if (monstruosoElemento === 'Morte') {
        obj.PRE -= 1;
        obj.VIG += 1;
      } else if (monstruosoElemento === 'Conhecimento') {
        obj.FOR -= 1;
        obj.INT += 1;
      } else if (monstruosoElemento === 'Energia') {
        obj.FOR -= 1;
        obj.AGI += 1;
      }
    }
    // Regras 108 a 115 (Poderes de Monstruoso Especialista)
    if (temMonstruosoEsp65 || temMonstruosoOcult65) obj.PRE -= 1;
    if (temMonstruosoEsp99 || temMonstruosoOcult99) obj.PRE -= 1;
    if (regrasAutomaticasAtivas.has(108)) obj.FOR += 1;
    if (regrasAutomaticasAtivas.has(109)) obj.VIG += 1;
    if (regrasAutomaticasAtivas.has(110)) obj.INT += 1;
    if (regrasAutomaticasAtivas.has(111)) obj.AGI += 1;
    if (regrasAutomaticasAtivas.has(112)) obj.FOR += 1;
    if (regrasAutomaticasAtivas.has(113)) obj.VIG += 1;
    if (regrasAutomaticasAtivas.has(114)) obj.INT += 1;
    if (regrasAutomaticasAtivas.has(115)) obj.AGI += 1;

    // Vontade Vampírica (Encantador): 65% Opção 1 (+1 AGI)
    if (temVampiro65 && vampiroArquetipo === 'Encantador' && poderesExtras['vampiro_opcao_65'] === '1') {
      obj.AGI += 1;
    }
    // Regras 116..119 e 128..131 (Poderes de Monstruoso Ocultista)
    if (regrasAutomaticasAtivas.has(116)) obj.FOR += 1;
    if (regrasAutomaticasAtivas.has(117)) obj.VIG += 1;
    if (regrasAutomaticasAtivas.has(118)) obj.INT += 1;
    if (regrasAutomaticasAtivas.has(119)) obj.AGI += 1;
    if (regrasAutomaticasAtivas.has(128)) obj.FOR += 1;
    if (regrasAutomaticasAtivas.has(129)) obj.VIG += 1;
    if (regrasAutomaticasAtivas.has(130)) obj.INT += 1;
    if (regrasAutomaticasAtivas.has(131)) obj.AGI += 1;
    return obj;
  }, [temBibliotecario99, temArtistaMarcialTrilha99, temMonstruoso65, isMonstruosoAtivo65, temMonstruoso40, isMonstruosoAtivo40, temMonstruoso99, monstruosoElemento, temMonstruosoEsp65, temMonstruosoEsp99, temMonstruosoOcult65, temMonstruosoOcult99, regrasAutomaticasAtivas]);

  const maxDevorarInt = Math.max(0, atributos.INT + bonusTrilhasAtributos.INT);
  const maxNecrosarFor = Math.max(0, atributos.FOR + bonusTrilhasAtributos.FOR);
  const maxInexistirAgi = Math.max(0, atributos.AGI + bonusTrilhasAtributos.AGI);
  const maxQueimarVig = Math.max(0, atributos.VIG + bonusTrilhasAtributos.VIG);

  const devorarIntCount = regrasAutomaticasAtivas.has(104)
    ? Math.min(maxDevorarInt, Math.max(0, Number(poderesExtras['devorar_int'] || 0)))
    : 0;
  const necrosarForCount = regrasAutomaticasAtivas.has(105)
    ? Math.min(maxNecrosarFor, Math.max(0, Number(poderesExtras['necrosar_for'] || 0)))
    : 0;
  const inexistirAgiCount = regrasAutomaticasAtivas.has(106)
    ? Math.min(maxInexistirAgi, Math.max(0, Number(poderesExtras['inexistir_agi'] || 0)))
    : 0;
  const queimarVigCount = regrasAutomaticasAtivas.has(107)
    ? Math.min(maxQueimarVig, Math.max(0, Number(poderesExtras['queimar_vig'] || 0)))
    : 0;

  const atributosBaseComBonus = useMemo(() => {
    const obj = { ...atributos };
    (Object.keys(obj) as AtributoKey[]).forEach(k => {
      obj[k] += bonusAtributos[k] + (bonusMaldicoes.atributos[k] || 0) + bonusTrilhasAtributos[k];
    });
    return obj;
  }, [atributos, bonusAtributos, bonusMaldicoes, bonusTrilhasAtributos]);

  const temCascaGrossa = (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 5 && (regras['nex_experiencia'] ? effectiveNivel >= 2 : effectiveNex >= 10)) || (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 5 && (regras['nex_experiencia'] ? effectiveNivel >= 10 : effectiveNex >= 50));
  const bonusPvTrilha5 = temCascaGrossa ? effectiveNivel : 0;

  const temIntuitivo40 = (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 14 && (regras['nex_experiencia'] ? effectiveNivel >= 8 : effectiveNex >= 40));
  const bonusPeTurnoTrilha14 = temIntuitivo40 ? atributosBaseComBonus.PRE : 0;

  // Trilha 19 (Bibliotecário) 99%: soma o valor de Intelecto em seu total de PE
  const bonusPeTrilha19 = temBibliotecario99 ? atributosBaseComBonus.INT : 0;

  // Trilha 32: Adepto ao Oculto
  const isTrilhaAdepto = Boolean(
    trilhasHook.trilhaSelecionada && (
      Number(trilhasHook.trilhaSelecionada.Codigo_Trilha) === 32 ||
      Number((trilhasHook.trilhaSelecionada as any)?.codigo_trilha) === 32 ||
      String(trilhasHook.trilhaSelecionada.Nome_Trilha || '').trim().toLowerCase().includes('adepto ao oculto')
    )
  );
  const isVersatilidadeAdepto = Boolean(
    trilhasHook.versatilidadeSelecionada && (
      Number(trilhasHook.versatilidadeSelecionada.Codigo_Trilha) === 32 ||
      Number((trilhasHook.versatilidadeSelecionada as any)?.codigo_trilha) === 32 ||
      String(trilhasHook.versatilidadeSelecionada.Nome_Trilha || '').trim().toLowerCase().includes('adepto ao oculto')
    )
  );
  const temAdepto10 = (isTrilhaAdepto && (regras['nex_experiencia'] ? effectiveNivel >= 2 : effectiveNex >= 10)) || (isVersatilidadeAdepto && (regras['nex_experiencia'] ? effectiveNivel >= 10 : effectiveNex >= 50));
  const temAdepto40 = isTrilhaAdepto && (regras['nex_experiencia'] ? effectiveNivel >= 8 : effectiveNex >= 40);
  const temAdepto65 = isTrilhaAdepto && (regras['nex_experiencia'] ? effectiveNivel >= 13 : effectiveNex >= 65);
  const temAdepto99 = isTrilhaAdepto && (regras['nex_experiencia'] ? effectiveNivel >= 20 : effectiveNex >= 99);

  const atrAdepto = poderesExtras['adepto_atributo_40'] === 'AGI' ? 'AGI' : 'VIG';
  const bonusPeAdepto10 = temAdepto10 ? effectiveNivel : 0;
  const bonusPeAdepto40 = temAdepto40 ? (atributosBaseComBonus[atrAdepto] - atributosBaseComBonus.PRE) * effectiveNivel : 0;
  const bonusPeTrilha32 = bonusPeAdepto10 + bonusPeAdepto40;

  // Trilha 33: Mata Leão
  const isTrilhaMataLeao = Boolean(
    trilhasHook.trilhaSelecionada && (
      Number(trilhasHook.trilhaSelecionada.Codigo_Trilha) === 33 ||
      Number((trilhasHook.trilhaSelecionada as any)?.codigo_trilha) === 33 ||
      String(trilhasHook.trilhaSelecionada.Nome_Trilha || '').trim().toLowerCase().includes('mata leão')
    )
  );
  const isVersatilidadeMataLeao = Boolean(
    trilhasHook.versatilidadeSelecionada && (
      Number(trilhasHook.versatilidadeSelecionada.Codigo_Trilha) === 33 ||
      Number((trilhasHook.versatilidadeSelecionada as any)?.codigo_trilha) === 33 ||
      String(trilhasHook.versatilidadeSelecionada.Nome_Trilha || '').trim().toLowerCase().includes('mata leão')
    )
  );
  const temMataLeao10 = (isTrilhaMataLeao && (regras['nex_experiencia'] ? effectiveNivel >= 2 : effectiveNex >= 10)) || (isVersatilidadeMataLeao && (regras['nex_experiencia'] ? effectiveNivel >= 10 : effectiveNex >= 50));

  // Trilha 34: Acrobata
  const bonusDeslocTrilha34 = (temAcrobata10 ? 3 : 0) + (temAcrobata65 ? 3 : 0) + (temAcrobata99 ? 3 : 0);
  const bonusDeslocRegra103_115 = regrasAutomaticasAtivas.has(115) ? 12 : (regrasAutomaticasAtivas.has(103) ? 6 : 0);
  const bonusDeslocVampiro = (temVampiro65 && vampiroArquetipo === 'Encantador' && poderesExtras['vampiro_opcao_65'] === '1') ? 3 : 0;
  const bonusDeslocGeral = (regrasAutomaticasAtivas.has(12) ? 3 : 0) + (regrasAutomaticasAtivas.has(41) ? 3 : 0) + bonusDeslocRegra103_115 + bonusDeslocVampiro + (bonusVestimentas?.deslocamento || 0) + (bonusMaldicoes?.deslocamento || 0);
  const bonusDeslocTotal = bonusDeslocGeral + bonusDeslocTrilha34;
  const deslocamentoTotalM = deslocM + bonusDeslocTotal;
  const danoDeMovimento = Math.floor(deslocamentoTotalM / 1.5);
  const bonusDefesaTrilha34 = temAcrobata99 ? danoDeMovimento : (temAcrobata65 ? Math.floor(danoDeMovimento / 2) : 0);

  const perdaSanidadeAdepto = useMemo(() => {
    if (!temAdepto10) return 0;
    let perda = 0;
    (rituaisHook.rituaisAprendidos || []).forEach(r => {
      if (r.origem?.startsWith('adepto_') && r.origem !== 'adepto_99') {
        const base = rituaisHook.rituais.find(br => br.Codigo_Ritual === r.codigo_ritual);
        const circulo = r.circulo || base?.Circulo_Ritual || 1;
        perda += circulo;
      }
    });
    return perda;
  }, [temAdepto10, rituaisHook.rituaisAprendidos, rituaisHook.rituais]);

  // Limpeza automática se a trilha ou versatilidade Adepto ao Oculto for removida/trocada
  React.useEffect(() => {
    const hasAdepto = isTrilhaAdepto || isVersatilidadeAdepto;
    if (!hasAdepto) {
      const temRitualAdepto = (rituaisHook.rituaisAprendidos || []).some(r => r.origem?.startsWith('adepto_'));
      if (temRitualAdepto) {
        rituaisHook.atualizarRituaisAprendidos(prev => prev.filter(r => !r.origem?.startsWith('adepto_')));
      }
      if (poderesExtras['adepto_atributo_40'] || poderesExtras['adepto_recusados'] || poderesExtras['adepto_excluidos']) {
        setPoderesExtras(prev => {
          const n = { ...prev };
          delete n.adepto_atributo_40;
          delete n.adepto_recusados;
          delete n.adepto_excluidos;
          return n;
        });
      }
    }
  }, [isTrilhaAdepto, isVersatilidadeAdepto, rituaisHook.rituaisAprendidos, poderesExtras, rituaisHook.atualizarRituaisAprendidos, setPoderesExtras]);

  // Monstruoso: Morte 10% soma Força na vida máxima (Regra 71)
  const bonusPvMonstruoso = (temMonstruoso10 && isMonstruosoAtivo10 && monstruosoElemento === 'Morte') ? atributosBaseComBonus.FOR : 0;

  // Monstruoso: NEX 40% permite usar atributo alternativo para PE em vez de Presença
  const atrMonstruosoPe: AtributoKey = monstruosoElemento === 'Sangue' ? 'FOR' : monstruosoElemento === 'Morte' ? 'VIG' : monstruosoElemento === 'Conhecimento' ? 'INT' : 'AGI';
  const bonusPeMonstruoso = (temMonstruoso40 && isMonstruosoAtivo40) ? Math.max(0, atributosBaseComBonus[atrMonstruosoPe] - atributosBaseComBonus.PRE) * effectiveNivel : 0;

  // Carisma (+1 PRE de maldição) não fornece PE adicionais
  const atributosParaStatus = useMemo(() => ({
    ...atributosBaseComBonus,
    PRE: atributosBaseComBonus.PRE - (bonusMaldicoes.atributos.PRE || 0)
  }), [atributosBaseComBonus, bonusMaldicoes.atributos.PRE]);

  const status = useStatus(
    classe, 
    effectiveNex, 
    effectiveNivel, 
    atributosParaStatus, 
    paranormalPenalty + perdaSanidadeAdepto, 
    regrasAutomaticasAtivas, 
    bonusVestimentas.pv + bonusMaldicoes.pv + bonusPvTrilha5 + bonusPvMonstruoso, 
    bonusVestimentas.pe + bonusMaldicoes.pe + bonusPeTrilha19 + bonusPeTrilha32 + bonusPeMonstruoso, 
    bonusPeTurnoTrilha14
  );

  
    // Controle para evitar que o PE temporário do Agente de Nascença fique voltando infinitamente
  const origin83Applied = React.useRef(false);
  React.useEffect(() => {
    if (regrasAutomaticasAtivas.has(83)) {
      const reached = (regras['nex_experiencia'] && nivel >= 20) || (!regras['nex_experiencia'] && nex >= 95);
      if (reached && !origin83Applied.current) {
        origin83Applied.current = true;
        // Só aplica se o usuário já não tiver PEs temporários configurados (para não sobrescrever o save dele)
        if (!status.hasPeTemp) {
          status.setHasPeTemp(true);
          status.setPeTempMax(10);
          status.setPeTempAtual(10);
        }
      }
    } else {
      origin83Applied.current = false;
    }
  }, [regrasAutomaticasAtivas, nex, nivel, regras]); // Removemos 'status' das dependências para não engatilhar ao desativar

const temPossuido = trilhasHook.trilhaSelecionada?.Codigo_Trilha === 23;
  const ppMax = temPossuido ? 3 + Object.values(poderesHook.poderesEscolhidos).filter(p => p.categoria === 'paranormais').length * 2 : 0;
  const ppTurno = temPossuido ? atributosBaseComBonus.PRE : 0;

  const previousPpMax = React.useRef(ppMax);
  useEffect(() => {
    if (status.ppAtual === null && ppMax > 0) {
      status.setPpAtual(ppMax);
    } else if (status.ppAtual !== null && ppMax > previousPpMax.current) {
      const diff = ppMax - previousPpMax.current;
      status.setPpAtual(prev => (prev ?? 0) + diff);
    } else if (status.ppAtual !== null && status.ppAtual > ppMax) {
      status.setPpAtual(ppMax);
    }
    previousPpMax.current = ppMax;
  }, [ppMax, status.ppAtual, status.setPpAtual]);

  useEffect(() => {
    const machucado = status.pvAtual !== null && status.pvMax > 0 && status.pvAtual <= Math.floor(status.pvMax / 2);
    if (!machucado && escolhaRegra53) {
      setEscolhaRegra53(null);
    }
  }, [status.pvAtual, status.pvMax, escolhaRegra53]);

  const atributosFinais = useMemo(() => {
    const obj = { ...atributosBaseComBonus };
    const machucado = status.pvAtual !== null && status.pvMax > 0 && status.pvAtual <= Math.floor(status.pvMax / 2);
    if (machucado && regrasAutomaticasAtivas.has(53) && escolhaRegra53) {
      obj[escolhaRegra53] += regrasAutomaticasAtivas.has(54) ? 2 : 1;
    }

    // Reduções temporárias das regras 104, 105, 106, 107 (não afetam PV, PE, SAN, PD ou quantidade de perícias)
    obj.INT = Math.max(0, obj.INT - devorarIntCount);
    obj.FOR = Math.max(0, obj.FOR - necrosarForCount);
    obj.AGI = Math.max(0, obj.AGI - inexistirAgiCount);
    obj.VIG = Math.max(0, obj.VIG - queimarVigCount);
    
    return obj;
  }, [atributosBaseComBonus, status.pvAtual, status.pvMax, regrasAutomaticasAtivas, escolhaRegra53, devorarIntCount, necrosarForCount, inexistirAgiCount, queimarVigCount]);

  const afinidadeAtiva = useMemo(() => {
    if (!afinidadeEscolhida) return false;

    // Se a regra estiver ativa, a afinidade é garantida a partir do NEX 60 automaticamente
    if (regras['nex_experiencia'] && nivel >= 12) {
      return true;
    }

    // Comportamento original corrigido: transcender antes de 50% não dá afinidade.
    // Chaves de transcender são: nexPatamar + 1000 (ex: 1025, 1050).
    return Object.entries(poderesHook.poderesEscolhidos).some(([key, p]) => {
      if (p.categoria !== 'paranormais') return false;
      
      let nexSlot = Number(key);
      if (isNaN(nexSlot)) return false;

      // Normaliza as chaves do botão transcender (1025 -> 25, 1050 -> 50, etc)
      if (nexSlot > 1000) {
        nexSlot -= 1000;
      }

      return nexSlot >= 50;
    });
  }, [afinidadeEscolhida, poderesHook.poderesEscolhidos, regras, nex, nivel]);

  const periciasGratisSemTrilha = useMemo(() => {
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
        // Regra 1: Apenas a per�cia 1
      } else if (Codigo_Per_Regra === 6) {
        // Regra 6: Per�cia 1 + escolha
        if (escolhaRegra6 === 'p2' && nome_p2) gratis.push(nome_p2);
        else if (escolhaRegra6 === 'pesp' && nome_pesp) gratis.push(nome_pesp);
      } else if (Codigo_Per_Regra === 7) {
        // Regra 7 n�o adiciona treino b�sico aqui
      } else {
        // Padr�o: Per�cia 1 + Per�cia 2
        if (nome_p2) gratis.push(nome_p2);
      }
    }
    return gratis;
  }, [classe, skillCombatente1, skillCombatente2, origensHook.origemSelecionada]);

  const jaTinhaSobrevivenciaVersatilidade = useMemo(() => {
    if (periciasGratisSemTrilha.includes('Sobrevivência')) return true;
    if (poderesExtras['cacador_versatilidade_ja_tinha_sobrevivencia'] !== undefined) {
      return poderesExtras['cacador_versatilidade_ja_tinha_sobrevivencia'] === 'true';
    }
    return false;
  }, [poderesExtras, periciasGratisSemTrilha]);

  const temCacadorVersatilidade = (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 17 && (regras['nex_experiencia'] ? effectiveNivel >= 10 : effectiveNex >= 50));

  const jaTinhaReligiaoVersatilidade = useMemo(() => {
    if (periciasGratisSemTrilha.includes('Religião')) return true;
    if (poderesExtras['exorcista_versatilidade_ja_tinha_religiao'] !== undefined) {
      return poderesExtras['exorcista_versatilidade_ja_tinha_religiao'] === 'true';
    }
    return false;
  }, [poderesExtras, periciasGratisSemTrilha]);

  const temExorcistaVersatilidade = (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 22 && (regras['nex_experiencia'] ? effectiveNivel >= 10 : effectiveNex >= 50));
  const temExorcista10 = (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 22 && (regras['nex_experiencia'] ? effectiveNivel >= 2 : effectiveNex >= 10));
  const temExorcista40 = (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 22 && (regras['nex_experiencia'] ? effectiveNivel >= 8 : effectiveNex >= 40));

  const jaTinhaOcultismoMonstruoso = useMemo(() => {
    if (periciasGratisSemTrilha.includes('Ocultismo')) return true;
    if (poderesExtras['monstruoso_ocultismo_jatinha'] !== undefined) {
      return poderesExtras['monstruoso_ocultismo_jatinha'] === 'true';
    }
    if (poderesExtras['monstruoso_ja_tinha_ocultismo'] !== undefined) {
      return poderesExtras['monstruoso_ja_tinha_ocultismo'] === 'true';
    }
    return false;
  }, [poderesExtras, periciasGratisSemTrilha]);

  const jaTinhaPericiaVampiro = useMemo(() => {
    const periciaNome = 'Fortitude';
    if (periciasGratisSemTrilha.includes(periciaNome)) return true;
    if (poderesExtras['vampiro_ja_tinha_pericia'] !== undefined) {
      return poderesExtras['vampiro_ja_tinha_pericia'] === 'true';
    }
    return false;
  }, [poderesExtras, periciasGratisSemTrilha]);

  const periciasGratis = useMemo(() => {
    const list = [...periciasGratisSemTrilha];

    // Trilha Selecionada (Trilha principal dá a perícia da trilha por padrão — no Monstruoso é Fortitude; o Ocultismo vem da regra de 10% abaixo)
    if (trilhasHook.trilhaSelecionada && trilhasHook.trilhaSelecionada.nome_pericia) {
      const codT = Number(trilhasHook.trilhaSelecionada.Codigo_Trilha);
      // Fichas salvas antes da correção podem ter 'Ocultismo' como perícia do Monstruoso; a perícia da trilha é Fortitude
      const nomeT = (codT === 18 || codT === 45) && trilhasHook.trilhaSelecionada.nome_pericia === 'Ocultismo'
        ? 'Fortitude'
        : trilhasHook.trilhaSelecionada.nome_pericia;
      list.push(nomeT);
    }
    if (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 16 && poderesExtras['agente_secreto_pericia']) {
      list.push(poderesExtras['agente_secreto_pericia']);
    }

    // Versatilidade Selecionada (não dá a perícia da trilha por padrão; somente se a própria habilidade de 10% da trilha conceder a perícia)
    if (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 17) {
      if (temCacadorVersatilidade && !jaTinhaSobrevivenciaVersatilidade) {
        list.push('Sobrevivência');
      }
    } else if (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 22) {
      if (temExorcistaVersatilidade && !jaTinhaReligiaoVersatilidade) {
        list.push('Religião');
      }
    }
    if (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 16 && (poderesExtras['agente_secreto_pericia_versatilidade'] || poderesExtras['agente_secreto_pericia'])) {
      list.push(poderesExtras['agente_secreto_pericia_versatilidade'] || poderesExtras['agente_secreto_pericia']);
    }

    // Monstruoso (Trilhas 18, 45 e 47): em 10%, torna-se treinado em Ocultismo se ainda não era treinado
    if ((temMonstruoso10 || temMonstruosoEsp10 || temMonstruosoOcult10) && !jaTinhaOcultismoMonstruoso && !list.includes('Ocultismo')) {
      list.push('Ocultismo');
    }

    // Regra 102: escolha 2 perícias para treinar (se não tiver a Regra 114 que substitui por 3 experts)
    if (regrasAutomaticasAtivas.has(102) && !regrasAutomaticasAtivas.has(114)) {
      [1, 2].forEach(slot => {
        const p = poderesExtras[`regra102_pericia_${slot}`];
        const jaTinha = poderesExtras[`regra102_jatinha_${slot}`] === 'true';
        if (p && !jaTinha && !list.includes(p)) {
          list.push(p);
        }
      });
    }

    return list;
  }, [
    periciasGratisSemTrilha, 
    trilhasHook.trilhaSelecionada, 
    trilhasHook.versatilidadeSelecionada, 
    poderesExtras,
    temCacadorVersatilidade,
    jaTinhaSobrevivenciaVersatilidade,
    temExorcistaVersatilidade,
    jaTinhaReligiaoVersatilidade,
    temMonstruoso10,
    temMonstruosoEsp10,
    temMonstruosoOcult10,
    jaTinhaOcultismoMonstruoso,
    regrasAutomaticasAtivas
  ]);

  const jaTinhaPericiaTrilha = useMemo(() => {
    if (!trilhasHook.trilhaSelecionada) return false;
    if (trilhasHook.trilhaSelecionada.Codigo_Trilha === 16 && poderesExtras['agente_secreto_pericia']) {
      return periciasGratisSemTrilha.includes(poderesExtras['agente_secreto_pericia']);
    }
    // Caçador, Muambeiro, Exorcista, Monstruoso e Vampiro resolvem suas perícias diretamente em regras específicas
    if (trilhasHook.trilhaSelecionada.Codigo_Trilha === 17 || trilhasHook.trilhaSelecionada.Codigo_Trilha === 18 || trilhasHook.trilhaSelecionada.Codigo_Trilha === 45 || trilhasHook.trilhaSelecionada.Codigo_Trilha === 47 || trilhasHook.trilhaSelecionada.Codigo_Trilha === 48 || trilhasHook.trilhaSelecionada.Codigo_Trilha === 49 || trilhasHook.trilhaSelecionada.Codigo_Trilha === 50 || trilhasHook.trilhaSelecionada.Codigo_Trilha === 21 || trilhasHook.trilhaSelecionada.Codigo_Trilha === 22) {
      return false;
    }
    if (!trilhasHook.trilhaSelecionada.nome_pericia) return false;
    return periciasGratisSemTrilha.includes(trilhasHook.trilhaSelecionada.nome_pericia);
  }, [periciasGratisSemTrilha, trilhasHook.trilhaSelecionada, poderesExtras]);

  const jaTinhaPericiaVersatilidade = useMemo(() => {
    if (!trilhasHook.versatilidadeSelecionada) return false;
    if (trilhasHook.versatilidadeSelecionada.Codigo_Trilha === 16 && poderesExtras['agente_secreto_pericia_versatilidade']) {
      return periciasGratisSemTrilha.includes(poderesExtras['agente_secreto_pericia_versatilidade']);
    }
    // Caçador, Muambeiro, Exorcista, Monstruoso e Vampiro não dão o +1d20 de duplicata de trilha na Versatilidade
    if (trilhasHook.versatilidadeSelecionada.Codigo_Trilha === 17 || trilhasHook.versatilidadeSelecionada.Codigo_Trilha === 18 || trilhasHook.versatilidadeSelecionada.Codigo_Trilha === 45 || trilhasHook.versatilidadeSelecionada.Codigo_Trilha === 47 || trilhasHook.versatilidadeSelecionada.Codigo_Trilha === 48 || trilhasHook.versatilidadeSelecionada.Codigo_Trilha === 49 || trilhasHook.versatilidadeSelecionada.Codigo_Trilha === 50 || trilhasHook.versatilidadeSelecionada.Codigo_Trilha === 21 || trilhasHook.versatilidadeSelecionada.Codigo_Trilha === 22) {
      return false;
    }
    if (!trilhasHook.versatilidadeSelecionada.nome_pericia) return false;
    return periciasGratisSemTrilha.includes(trilhasHook.versatilidadeSelecionada.nome_pericia);
  }, [periciasGratisSemTrilha, trilhasHook.versatilidadeSelecionada, poderesExtras]);

  const veteranasGratis = useMemo(() => {
    const vet: string[] = [];
    if (origensHook.origemSelecionada?.Codigo_Per_Regra === 7) {
      vet.push('Pilotagem');
    }
    if (temExorcista40 && poderesExtras['exorcista_opcao_40'] !== 'dados') {
      vet.push('Religião');
    }
    return vet;
  }, [origensHook.origemSelecionada, temExorcista40, poderesExtras]);

  const expertsGratis = useMemo(() => {
    const exp: string[] = [];
    if (regrasAutomaticasAtivas.has(114)) {
      [1, 2, 3].forEach(slot => {
        const p = poderesExtras[`regra114_pericia_${slot}`];
        const jaExpert = poderesExtras[`regra114_jaexpert_${slot}`] === 'true';
        if (p && !jaExpert && !exp.includes(p)) {
          exp.push(p);
        }
      });
    }
    return exp;
  }, [regrasAutomaticasAtivas, poderesExtras]);

  // Sagacidade (+1 INT de maldição) e reduções temporárias (Devorar INT) não alteram a quantidade de perícias aprendidas
  const atributosParaPericias = useMemo(() => ({
    ...atributosBaseComBonus,
    INT: atributosBaseComBonus.INT - (bonusMaldicoes.atributos.INT || 0)
  }), [atributosBaseComBonus, bonusMaldicoes.atributos.INT]);

  const atributosFinaisParaPericiasBonus = useMemo(() => ({
    ...atributosFinais,
    INT: atributosBaseComBonus.INT
  }), [atributosFinais, atributosBaseComBonus.INT]);

  const bonusPericiasCombinado = useMemo(() => {
    const comb = { ...bonusVestimentas.pericias };
    Object.keys(bonusMaldicoes.pericias || {}).forEach(k => {
      comb[k] = (comb[k] || 0) + bonusMaldicoes.pericias[k];
    });

    if (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 16) {
      const periciaEscolhida = poderesExtras['agente_secreto_pericia'];
      if (periciaEscolhida) {
        const jaTinha = periciasGratisSemTrilha.includes(periciaEscolhida);
        if (jaTinha) {
          comb[periciaEscolhida] = (comb[periciaEscolhida] || 0) + 2;
        }
      }

      const temTrilha40 = (regras['nex_experiencia'] ? effectiveNivel >= 8 : effectiveNex >= 40);
      if (temTrilha40) {
        comb['Diplomacia'] = (comb['Diplomacia'] || 0) + 2;
        comb['Enganação'] = (comb['Enganação'] || 0) + 2;
      }
    }

    // Trilha 17 (Caçador)
    const temCacador10 = (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 17 && (regras['nex_experiencia'] ? effectiveNivel >= 2 : effectiveNex >= 10));

    // Na Trilha Principal: Como Caçador já dá Sobrevivência por padrão, a habilidade de 10% dá o +2 automaticamente
    if (temCacador10) {
      comb['Sobrevivência'] = (comb['Sobrevivência'] || 0) + 2;
    }
    // Na Versatilidade: Só dá o +2 se já tiver Sobrevivência (se não tiver, ganha treino em periciasGratis)
    if (temCacadorVersatilidade && jaTinhaSobrevivenciaVersatilidade) {
      comb['Sobrevivência'] = (comb['Sobrevivência'] || 0) + 2;
    }

    // Trilha 22 (Exorcista)
    // Na Trilha Principal: Como Exorcista já dá Religião por padrão, a habilidade de 10% dá o +2 automaticamente
    if (temExorcista10) {
      comb['Religião'] = (comb['Religião'] || 0) + 2;
    }
    // Na Versatilidade: Só dá o +2 se já tiver Religião (se não tiver, ganha treino em periciasGratis)
    if (temExorcistaVersatilidade && jaTinhaReligiaoVersatilidade) {
      comb['Religião'] = (comb['Religião'] || 0) + 2;
    }

    if (temAdepto40) {
      const atr = poderesExtras['adepto_atributo_40'] === 'AGI' ? 'AGI' : 'VIG';
      const temBonusParanormal = (bonusMaldicoes.atributos[atr] || 0) > 0;
      if (temBonusParanormal) {
        const periciaBonus = atr === 'VIG' ? 'Fortitude' : 'Reflexos';
        comb[periciaBonus] = (comb[periciaBonus] || 0) + 2;
      }
    }

    // Monstruoso (Trilhas 18, 45 e 47): +2 em Ocultismo caso já fosse treinado antes da trilha
    if ((temMonstruoso10 || temMonstruosoEsp10 || temMonstruosoOcult10) && jaTinhaOcultismoMonstruoso) {
      comb['Ocultismo'] = (comb['Ocultismo'] || 0) + 2;
    }

    // Trilha Vampírica: 10% dá +2 na perícia da trilha (Fortitude) se já fosse treinado
    if (temVampiro10 && jaTinhaPericiaVampiro) {
      const pNome = trilhasHook.trilhaSelecionada?.nome_pericia || 'Fortitude';
      comb[pNome] = (comb[pNome] || 0) + 2;
    }

    // Trilha Vampírica (Ancião): 40% Opção 2 (+2 Vontade)
    if (temVampiro40 && vampiroArquetipo === 'Ancião' && poderesExtras['vampiro_opcao_40'] === '2') {
      comb['Vontade'] = (comb['Vontade'] || 0) + 2;
    }

    // Trilha Vampírica (Ancião): 40% Opção 3 (-2 Diplomacia, Enganação e Intuição)
    if (temVampiro40 && vampiroArquetipo === 'Ancião' && poderesExtras['vampiro_opcao_40'] === '3') {
      comb['Diplomacia'] = (comb['Diplomacia'] || 0) - 2;
      comb['Enganação'] = (comb['Enganação'] || 0) - 2;
      comb['Intuição'] = (comb['Intuição'] || 0) - 2;
    }

    // Trilha Vampírica (Encantador): 65% Opção 1 (+2 em todas as perícias baseadas em Agilidade)
    if (temVampiro65 && vampiroArquetipo === 'Encantador' && poderesExtras['vampiro_opcao_65'] === '1') {
      ['Acrobacia', 'Crime', 'Furtividade', 'Iniciativa', 'Pilotagem', 'Pontaria', 'Reflexos'].forEach(p => {
        comb[p] = (comb[p] || 0) + 2;
      });
    }

    // Trilha Vampírica (Encantador): 99% Opção 2 (+10 Reflexos)
    if (temVampiro99 && vampiroArquetipo === 'Encantador' && poderesExtras['vampiro_opcao_99'] === '2') {
      comb['Reflexos'] = (comb['Reflexos'] || 0) + 10;
    }

    // Trilha 45 e 47: Penalidade permanente em Diplomacia, Enganação e Intuição (-2 em 10%, -5 em 40%, -10 em 99%)
    const temMonstEspOuOcult99 = temMonstruosoEsp99 || temMonstruosoOcult99;
    const temMonstEspOuOcult40 = temMonstruosoEsp40 || temMonstruosoOcult40;
    const temMonstEspOuOcult10 = temMonstruosoEsp10 || temMonstruosoOcult10;

    if (temMonstEspOuOcult99) {
      comb['Diplomacia'] = (comb['Diplomacia'] || 0) - 10;
      comb['Enganação'] = (comb['Enganação'] || 0) - 10;
      comb['Intuição'] = (comb['Intuição'] || 0) - 10;
    } else if (temMonstEspOuOcult40) {
      comb['Diplomacia'] = (comb['Diplomacia'] || 0) - 5;
      comb['Enganação'] = (comb['Enganação'] || 0) - 5;
      comb['Intuição'] = (comb['Intuição'] || 0) - 5;
    } else if (temMonstEspOuOcult10) {
      comb['Diplomacia'] = (comb['Diplomacia'] || 0) - 2;
      comb['Enganação'] = (comb['Enganação'] || 0) - 2;
      comb['Intuição'] = (comb['Intuição'] || 0) - 2;
    }

    // Regra 100 e 112: Penalidade em Furtividade (-5 se Regra 112 ativa, senão -2 se Regra 100 ativa)
    if (regrasAutomaticasAtivas.has(112)) {
      comb['Furtividade'] = (comb['Furtividade'] || 0) - 5;
    } else if (regrasAutomaticasAtivas.has(100)) {
      comb['Furtividade'] = (comb['Furtividade'] || 0) - 2;
    }

    // Regra 102: +2 nas perícias escolhidas se já era treinado (quando Regra 114 não está ativa)
    if (regrasAutomaticasAtivas.has(102) && !regrasAutomaticasAtivas.has(114)) {
      [1, 2].forEach(slot => {
        const p = poderesExtras[`regra102_pericia_${slot}`];
        const jaTinha = poderesExtras[`regra102_jatinha_${slot}`] === 'true';
        if (p && jaTinha) {
          comb[p] = (comb[p] || 0) + 2;
        }
      });
    }

    // Regra 114: +10 nas perícias escolhidas se já era Expert
    if (regrasAutomaticasAtivas.has(114)) {
      [1, 2, 3].forEach(slot => {
        const p = poderesExtras[`regra114_pericia_${slot}`];
        const jaExpert = poderesExtras[`regra114_jaexpert_${slot}`] === 'true';
        if (p && jaExpert) {
          comb[p] = (comb[p] || 0) + 10;
        }
      });
    }

    return comb;
  }, [
    bonusVestimentas.pericias,
    bonusMaldicoes.pericias,
    bonusMaldicoes.atributos,
    trilhasHook.trilhaSelecionada,
    poderesExtras,
    periciasGratisSemTrilha,
    regras,
    effectiveNivel,
    effectiveNex,
    temCacadorVersatilidade,
    jaTinhaSobrevivenciaVersatilidade,
    temExorcista10,
    temExorcistaVersatilidade,
    jaTinhaReligiaoVersatilidade,
    temAdepto40,
    temMonstruoso10,
    temMonstruosoEsp10,
    temMonstruosoOcult10,
    jaTinhaOcultismoMonstruoso,
    temVampiro10,
    jaTinhaPericiaVampiro,
    temVampiro40,
    temVampiro65,
    temVampiro99,
    vampiroArquetipo,
    temMonstruosoEsp99,
    temMonstruosoOcult99,
    temMonstruosoEsp40,
    temMonstruosoOcult40,
    regrasAutomaticasAtivas
  ]);

  const periciasHook = usePericias(
    classe, 
    effectiveNivel, 
    atributosParaPericias, 
    regrasAtivas, 
    periciasGratis, 
    origensHook.origemSelecionada?.Codigo_Per_Regra, 
    veteranasGratis, 
    regrasAutomaticasAtivas,
    poderesHook.poderesEscolhidos,
    origensHook.origemSelecionada,
    bonusPericiasCombinado,
    expertsGratis,
    atributosFinaisParaPericiasBonus,
    inexistirAgiCount
  );

  // Sincroniza flag de Ocultismo prévio para fichas que já estavam com Trilha 18 ou 45 selecionada antes da atualização
  useEffect(() => {
    const codT = trilhasHook.trilhaSelecionada?.Codigo_Trilha;
    const codV = trilhasHook.versatilidadeSelecionada?.Codigo_Trilha;
    if ((codT === 18 || codT === 45 || codT === 47 || codV === 18 || codV === 45 || codV === 47) && poderesExtras['monstruoso_ocultismo_jatinha'] === undefined && Object.keys(periciasHook.pericias).length > 0) {
      const jaTinha = (periciasHook.pericias['Ocultismo']?.treino || 0) >= 5 || periciasGratisSemTrilha.includes('Ocultismo');
      setPoderesExtras(prev => ({
        ...prev,
        monstruoso_ocultismo_jatinha: String(jaTinha),
        monstruoso_ja_tinha_ocultismo: String(jaTinha),
      }));
    }
    if (([48, 49, 50].includes(codT || 0) || [48, 49, 50].includes(codV || 0)) && poderesExtras['vampiro_ja_tinha_pericia'] === undefined && Object.keys(periciasHook.pericias).length > 0) {
      const pNome = trilhasHook.trilhaSelecionada?.nome_pericia || 'Fortitude';
      const jaTinha = (periciasHook.pericias[pNome]?.treino || 0) >= 5 || periciasGratisSemTrilha.includes(pNome);
      setPoderesExtras(prev => ({
        ...prev,
        vampiro_ja_tinha_pericia: String(jaTinha),
      }));
    }
  }, [trilhasHook.trilhaSelecionada, trilhasHook.versatilidadeSelecionada, poderesExtras, periciasHook.pericias, periciasGratisSemTrilha]);

  const jaTinhaProfissaoTrilha = useMemo(() => {
    const trilha = trilhasHook.trilhaSelecionada;
    const profName = trilha?.Profissao_Pericia || (trilha?.Codigo_Trilha === 21 ? poderesExtras['muambeiro_profissao_10'] : null);
    if (!trilha || !profName) return false;
    const pName = profName.trim().toLowerCase();
    // Verifica se a profissão existe E não foi injetada por nós (ou seja, foi criada manualmente pelo jogador)
    return periciasHook.profissoes.some(p => (p.nome || '').toLowerCase() === pName && (p as any).origem !== 'trilha' && (p as any).origem !== 'trilha65');
  }, [trilhasHook.trilhaSelecionada, poderesExtras, periciasHook.profissoes]);

  const profissaoTrilhaRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const trilha = trilhasHook.trilhaSelecionada;
    const profName = trilha?.Profissao_Pericia || (trilha?.Codigo_Trilha === 21 ? poderesExtras['muambeiro_profissao_10'] : null);
    if (trilha && profName) {
      const pName = profName.trim();
      if (profissaoTrilhaRef.current !== pName) {
        if (profissaoTrilhaRef.current) {
          const oldName = profissaoTrilhaRef.current;
          periciasHook.setProfissoes(prev => prev.filter(p => !((p.nome || '').toLowerCase() === oldName.toLowerCase() && (p as any).origem === 'trilha')));
        }
        periciasHook.setProfissoes(prev => {
          const exists = prev.find(p => (p.nome || '').toLowerCase() === pName.toLowerCase());
          if (exists) {
            return prev;
          } else {
            return [...prev, { nome: pName, treino: 5, outros: 0, origem: 'trilha' } as any];
          }
        });
        profissaoTrilhaRef.current = pName;
      }
    } else {
      if (profissaoTrilhaRef.current) {
        const oldName = profissaoTrilhaRef.current;
        periciasHook.setProfissoes(prev => prev.filter(p => !((p.nome || '').toLowerCase() === oldName.toLowerCase() && (p as any).origem === 'trilha')));
        profissaoTrilhaRef.current = null;
      }
    }
  }, [trilhasHook.trilhaSelecionada, poderesExtras, periciasHook.setProfissoes]);

  // Granadeiro Blaster (Trilha 25)
  const temGranadeiro = trilhasHook.trilhaSelecionada?.Codigo_Trilha === 25 || trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 25;
  const temGranadeiro10 = temGranadeiro && (regras['nex_experiencia'] ? effectiveNivel >= 2 : effectiveNex >= 10);
  const temGranadeiro40 = trilhasHook.trilhaSelecionada?.Codigo_Trilha === 25 && (regras['nex_experiencia'] ? effectiveNivel >= 8 : effectiveNex >= 40);
  const temGranadeiro65 = trilhasHook.trilhaSelecionada?.Codigo_Trilha === 25 && (regras['nex_experiencia'] ? effectiveNivel >= 13 : effectiveNex >= 65);
  const temGranadeiro99 = trilhasHook.trilhaSelecionada?.Codigo_Trilha === 25 && (regras['nex_experiencia'] ? effectiveNivel >= 20 : effectiveNex >= 99);

  const maxExplosivosAutorais = temGranadeiro10 ? (
    effectiveNex >= 99 ? 4 : (effectiveNex >= 65 ? 3 : (effectiveNex >= 40 ? 2 : 1))
  ) : 0;

  const temPeritoEmExplosivosNosPoderes = Object.values(poderesHook.poderesEscolhidos).some(p => 
    p.codigoRegra === 29 || p.nome?.toLowerCase() === 'perito em explosivos'
  );
  const temDobroPerito = temGranadeiro40 && temPeritoEmExplosivosNosPoderes;

  // Criptologista do Oculto (Trilha 26)
  const temCriptologista = trilhasHook.trilhaSelecionada?.Codigo_Trilha === 26 || trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 26;
  const temCriptologista10 = (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 26 && (regras['nex_experiencia'] ? effectiveNivel >= 2 : effectiveNex >= 10)) || (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 26 && (regras['nex_experiencia'] ? effectiveNivel >= 10 : effectiveNex >= 50));
  const temCriptologista40 = trilhasHook.trilhaSelecionada?.Codigo_Trilha === 26 && (regras['nex_experiencia'] ? effectiveNivel >= 8 : effectiveNex >= 40);
  const temCriptologista65 = trilhasHook.trilhaSelecionada?.Codigo_Trilha === 26 && (regras['nex_experiencia'] ? effectiveNivel >= 13 : effectiveNex >= 65);
  const temCriptologista99 = trilhasHook.trilhaSelecionada?.Codigo_Trilha === 26 && (regras['nex_experiencia'] ? effectiveNivel >= 20 : effectiveNex >= 99);

  const selosPorInterludio = temCriptologista10 ? (
    2 + (temCriptologista40 ? 1 : 0) + (temCriptologista65 ? 1 : 0) + (temCriptologista99 ? 1 : 0)
  ) : 1;

  const temCriarSeloNosPoderes = Object.values(poderesHook.poderesEscolhidos).some(p => 
    p.nome?.toLowerCase() === 'criar selo' || p.nome?.toLowerCase().startsWith('criar selo')
  );
  const temDobroCriarSelo = temCriptologista10 && temCriarSeloNosPoderes;

  // Ilusionista (Trilha 29)
  const temIlusionista = trilhasHook.trilhaSelecionada?.Codigo_Trilha === 29 || trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 29;
  const temIlusionista10 = (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 29 && (regras['nex_experiencia'] ? effectiveNivel >= 2 : effectiveNex >= 10)) || (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 29 && (regras['nex_experiencia'] ? effectiveNivel >= 10 : effectiveNex >= 50));
  const temIlusionista40 = trilhasHook.trilhaSelecionada?.Codigo_Trilha === 29 && (regras['nex_experiencia'] ? effectiveNivel >= 8 : effectiveNex >= 40);
  const temIlusionista65 = trilhasHook.trilhaSelecionada?.Codigo_Trilha === 29 && (regras['nex_experiencia'] ? effectiveNivel >= 13 : effectiveNex >= 65);
  const temIlusionista99 = trilhasHook.trilhaSelecionada?.Codigo_Trilha === 29 && (regras['nex_experiencia'] ? effectiveNivel >= 20 : effectiveNex >= 99);

  // Trilha 25 (Granadeiro Blaster - 10% Meus Bebês): Treinamento em Profissão (químico) ou +5 se já treinado
  const profissaoGranadeiroRef = React.useRef<{ nome: string; concedeuTreino: boolean } | null>(null);

  React.useEffect(() => {
    const pName = 'Químico';
    if (temGranadeiro10) {
      if (!profissaoGranadeiroRef.current) {
        periciasHook.setProfissoes(prev => {
          const exists = prev.find(p => (p.nome || '').toLowerCase() === pName.toLowerCase());
          if (exists) {
            if ((exists as any).origem === 'granadeiro') {
              profissaoGranadeiroRef.current = { nome: pName, concedeuTreino: true };
              return prev;
            }
            profissaoGranadeiroRef.current = { nome: pName, concedeuTreino: false };
            return prev.map(p => (p.nome || '').toLowerCase() === pName.toLowerCase() ? { ...p, outros: (p.outros || 0) + 5 } : p);
          } else {
            profissaoGranadeiroRef.current = { nome: pName, concedeuTreino: true };
            return [...prev, { nome: pName, treino: 5, outros: 0, origem: 'granadeiro' } as any];
          }
        });
      }
    } else {
      if (profissaoGranadeiroRef.current) {
        const old = profissaoGranadeiroRef.current;
        periciasHook.setProfissoes(prev => {
          if (old.concedeuTreino) {
            return prev.filter(p => !((p.nome || '').toLowerCase() === old.nome.toLowerCase() && (p as any).origem === 'granadeiro'));
          } else {
            return prev.map(p => (p.nome || '').toLowerCase() === old.nome.toLowerCase() ? { ...p, outros: Math.max(0, (p.outros || 0) - 5) } : p);
          }
        });
        profissaoGranadeiroRef.current = null;
      }
    }
  }, [temGranadeiro10, periciasHook.setProfissoes]);

  // Trilha 21 (Muambeiro - 65% Laboratório de Campo): Escolha de Profissão ou +5 se já treinada
  const temMuambeiro65 = trilhasHook.trilhaSelecionada?.Codigo_Trilha === 21 && (regras['nex_experiencia'] ? effectiveNivel >= 13 : effectiveNex >= 65);
  const prof65 = temMuambeiro65 ? poderesExtras['muambeiro_profissao_65'] : null;
  const profissaoTrilha65Ref = React.useRef<{ nome: string; concedeuTreino: boolean } | null>(null);

  React.useEffect(() => {
    if (prof65) {
      const pName = prof65.trim();
      if (profissaoTrilha65Ref.current?.nome !== pName) {
        // Desfazer escolha anterior se houver
        if (profissaoTrilha65Ref.current) {
          const old = profissaoTrilha65Ref.current;
          periciasHook.setProfissoes(prev => {
            if (old.concedeuTreino) {
              return prev.filter(p => !((p.nome || '').toLowerCase() === old.nome.toLowerCase() && (p as any).origem === 'trilha65'));
            } else {
              return prev.map(p => (p.nome || '').toLowerCase() === old.nome.toLowerCase() ? { ...p, outros: Math.max(0, (p.outros || 0) - 5) } : p);
            }
          });
        }

        // Aplicar a nova escolha de 65%
        periciasHook.setProfissoes(prev => {
          const exists = prev.find(p => (p.nome || '').toLowerCase() === pName.toLowerCase());
          if (exists) {
            // Se já for treinado em uma dessas perícias, recebe +5 nela
            profissaoTrilha65Ref.current = { nome: pName, concedeuTreino: false };
            return prev.map(p => (p.nome || '').toLowerCase() === pName.toLowerCase() ? { ...p, outros: (p.outros || 0) + 5 } : p);
          } else {
            // Não tem: recebe treinamento
            profissaoTrilha65Ref.current = { nome: pName, concedeuTreino: true };
            return [...prev, { nome: pName, treino: 5, outros: 0, origem: 'trilha65' } as any];
          }
        });
      }
    } else {
      if (profissaoTrilha65Ref.current) {
        const old = profissaoTrilha65Ref.current;
        periciasHook.setProfissoes(prev => {
          if (old.concedeuTreino) {
            return prev.filter(p => !((p.nome || '').toLowerCase() === old.nome.toLowerCase() && (p as any).origem === 'trilha65'));
          } else {
            return prev.map(p => (p.nome || '').toLowerCase() === old.nome.toLowerCase() ? { ...p, outros: Math.max(0, (p.outros || 0) - 5) } : p);
          }
        });
        profissaoTrilha65Ref.current = null;
      }
    }
  }, [prof65, periciasHook.setProfissoes]);

  const grauProfissao = periciasHook.pericias['Profissão']?.treino || 0;
  const inventarioHook = useInventario(origensHook.origemSelecionada?.Codigo_Regra, grauProfissao);

  // ============================================================
  // LÓGICA DE ATRIBUTOS
  // ============================================================
  const capMaximo = capMaximoAtributo(effectiveNivel);
  const pontosIniciais = pontosIniciaisPorNivel(effectiveNivel);

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
  const proficienciasTotais = useMemo(() => {
    const list = [...proficiencias];
    if (regrasAutomaticasAtivas.has(17) && !list.includes('Armas Pesadas')) list.push('Armas Pesadas');
    if (regrasAutomaticasAtivas.has(20) && !list.includes('Proteções Pesadas')) list.push('Proteções Pesadas');
    if (regrasAutomaticasAtivas.has(27) && !list.includes('Armas Táticas (de fogo)')) list.push('Armas Táticas (de fogo)');
    if (regrasAutomaticasAtivas.has(28) && !list.includes('Armas Táticas (corpo a corpo e de disparo)')) list.push('Armas Táticas (corpo a corpo e de disparo)');
    if (regrasAutomaticasAtivas.has(38) && !list.includes('Proteções Leves')) list.push('Proteções Leves');
    return list;
  }, [proficiencias, regrasAutomaticasAtivas]);

  // ============================================================
  // DEFESA
  // ============================================================
  const defOutrosBonusRegra4 = regrasAutomaticasAtivas.has(4) ? 2 : 0;
  const defOutrosBonusRegra12 = regrasAutomaticasAtivas.has(12) ? 2 : 0;
  
  const temProtecaoPesada = protecoesHook?.protecoesInventario.some(p => p.equipado && p.protecao.Proficiencia?.toLowerCase().includes('pesada')) || false;
  const defOutrosBonusRegra21 = (regrasAutomaticasAtivas.has(21) && temProtecaoPesada) ? 2 : 0;
  
  const temProtecaoLeve = protecoesHook?.protecoesInventario.some(p => p.equipado && p.protecao.Proficiencia?.toLowerCase().includes('leve')) || false;
  const defOutrosBonusRegra25 = (regrasAutomaticasAtivas.has(25) && temProtecaoLeve) ? 2 : 0;
  const isMachucado = status.pvAtual !== null && status.pvMax > 0 && status.pvAtual <= Math.floor(status.pvMax / 2);
  const temInquebravel = trilhasHook.trilhaSelecionada?.Codigo_Trilha === 5 && (regras['nex_experiencia'] ? effectiveNivel >= 20 : effectiveNex >= 99);
  const defOutrosBonusTrilha5 = (temInquebravel && isMachucado) ? 5 : 0;

  const totalDefesaProtecoes = useMemo(() => (protecoesHook?.protecoesInventario || []).reduce((acc, item) => {
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
  }, 0), [protecoesHook?.protecoesInventario, modificacoesHook?.modificacoes]);

  const defOutrosBonusRegra72 = regrasAutomaticasAtivas.has(72) ? atributosFinais.INT : 0;
  const defOutrosBonusRegra107 = regrasAutomaticasAtivas.has(107) ? (2 + queimarVigCount * 2) : 0;
  const defOutrosBonusVampiro = (temVampiro40 && vampiroArquetipo === 'Encantador' && poderesExtras['vampiro_opcao_40'] === '3' ? -2 : 0) +
    (temVampiro99 && vampiroArquetipo === 'Encantador' && poderesExtras['vampiro_opcao_99'] === '2' ? 10 : 0);

  const defesaTotal = 10 + atributosFinais.AGI + defEquip + defOutros + defOutrosBonusRegra4 + defOutrosBonusRegra12 + defOutrosBonusRegra21 + defOutrosBonusRegra25 + defOutrosBonusRegra72 + defOutrosBonusRegra107 + defOutrosBonusTrilha5 + bonusDefesaTrilha34 + defOutrosBonusVampiro + totalDefesaProtecoes + (bonusVestimentas?.defesa || 0) + (bonusMaldicoes?.defesa || 0);

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
    setNex(5);
    setNivel(1);
    setDefEquip(0);
    setDefOutros(0);
    setBloqueioData({ base: 0, bonusVig: false });
    setProtecoes([]);
    setSentidos([]);
    setImunidades([]);
    setVulnerabilidades([]);
    setResistencias([]);
    setProficiencias([]);
    setDeslocM(9);
    setDeslocQ(6);
    setBonusDadosCondicionais('');
    setBonusDadosAtivos('');
    setVersaoRitual({});
    setElementoRitual({});
    setAfinidadeEscolhida(null);
    setPoderesExtras({});
    setProgressaoNexRecusados([]);
    setProgressaoNexEditados({});
    setElementoRegra18(null);
    setEscolhaRegra53(null);
    setNomePersonagem('');
    setNomeJogador('');
    setNomeEditando('');
    setDescricaoEditando('');
    setAfinidadeEditando('');
    origensHook.setOrigemSelecionada(null);
    trilhasHook.setTrilhaSelecionada(null);
    trilhasHook.setVersatilidadeSelecionada(null);
    poderesHook.setPoderesEscolhidos({});
    rituaisHook.setRituaisAprendidos([]);
    armasHook.setArmasInventario([]);
    protecoesHook.setProtecoesInventario([]);
    municoesHook.setMunicoesInventario([]);
    itensHook.setItensInventario([]);
    itensAmaldicoadosHook.setItensAmaldicoadosInventario([]);
    periciasHook.setProfissoes([]);
    inventarioHook.setPrestigio(0);
    inventarioHook.setCreditoOverride(null);
    inventarioHook.setLimitesItensOverride(null);
    status.resetarStatus();
    setTelaAtual('atributos');
  }, [
    origensHook,
    trilhasHook,
    poderesHook,
    rituaisHook,
    armasHook,
    protecoesHook,
    municoesHook,
    itensHook,
    itensAmaldicoadosHook,
    periciasHook,
    inventarioHook,
    status
  ]);

  // ============================================================
  // VALUE DO CONTEXTO
  // ============================================================
  const value = useMemo<RPGContextType>(() => ({
    telaAtual, setTelaAtual,
    classe, setClasse,
    nex: effectiveNex, rawNex: nex, setNex,
    nomePersonagem, setNomePersonagem,
    nomeJogador, setNomeJogador,
    atributos, setAtributos,
    bonusAtributos, setBonusAtributos,
    pontosRestantes, alterarAtributo,
    status, periciasHook, poderesHook, origensHook, trilhasHook, rituaisHook, inventarioHook, armasHook, municoesHook, protecoesHook, itensHook, itensAmaldicoadosHook, toggleVestimentaGeral, modificacoesHook, maldicoesHook, bonusVestimentas,
    bonusMaldicoes,
    abaDireita, setAbaDireita,
    abaModalPoderes, setAbaModalPoderes,
    tipoModalPoderes, setTipoModalPoderes,
    defEquip, setDefEquip,
    defOutros, setDefOutros,
    defesaTotal,
    defOutrosBonusVampiro,
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
    regrasAtivasAtributos, setRegrasAtivasAtributos,
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
    nivel: effectiveNivel, rawNivel: nivel, setNivel,
    rituaisExpandidos, setRituaisExpandidos,
    versaoRitual, setVersaoRitual,
    elementoRitual, setElementoRitual,
    jaTinhaPericiaTrilha,
    jaTinhaPericiaVersatilidade,
    periciasGratisSemTrilha,
    jaTinhaProfissaoTrilha,
    trilhaProfissaoConcedida: profissaoTrilhaRef.current,
    afinidadeEscolhida, setAfinidadeEscolhida, afinidadeAtiva,
    poderesExtras, setPoderesExtras,
    progressaoNexRecusados, setProgressaoNexRecusados,
    progressaoNexEditados, setProgressaoNexEditados,
    elementoRegra18, setElementoRegra18,
    regrasAutomaticasAtivas,
    temGranadeiro10,
    temGranadeiro40,
    temGranadeiro65,
    temGranadeiro99,
    maxExplosivosAutorais,
    temDobroPerito,
    temCriptologista10,
    temCriptologista40,
    temCriptologista65,
    temCriptologista99,
    selosPorInterludio,
    temDobroCriarSelo,
    temIlusionista10,
    temIlusionista40,
    temIlusionista65,
    temIlusionista99,
    temArtistaMarcialTrilha10,
    temArtistaMarcialTrilha40,
    temArtistaMarcialTrilha65,
    temArtistaMarcialTrilha99,
    temArtistaMarcialAprimorado,
    temAdepto10,
    temAdepto40,
    temAdepto65,
    temAdepto99,
    temMataLeao10,
    temAcrobata10,
    temAcrobata40,
    temAcrobata65,
    temAcrobata99,
    temVigilante10,
    temVigilante40,
    temVigilante65,
    temVigilante99,
    temViajanteDasSombras10,
    temViajanteDasSombras40,
    temViajanteDasSombras65,
    temViajanteDasSombras99,
    temServente10,
    temServente40,
    temServente65,
    temServente99,
    serventeElementoPrimario,
    serventeElementoSecundario,
    temMonstruoso10,
    temMonstruoso40,
    temMonstruoso65,
    temMonstruoso75,
    temMonstruoso99,
    isMonstruosoAtivo10,
    isMonstruosoAtivo40,
    isMonstruosoAtivo65,
    isMonstruosoAtivo75,
    temMonstruosoEsp10,
    temMonstruosoEsp40,
    temMonstruosoEsp65,
    temMonstruosoEsp75,
    temMonstruosoEsp99,
    isMonstruosoEspAtivo,
    temMonstruosoOcult10,
    temMonstruosoOcult40,
    temMonstruosoOcult65,
    temMonstruosoOcult75,
    temMonstruosoOcult99,
    isMonstruosoOcultAtivo,
    monstruosoElemento,
    jaTinhaOcultismoMonstruoso,
    temVampiro10,
    temVampiro40,
    temVampiro65,
    temVampiro99,
    vampiroArquetipo,
    bloquearIntimidacaoVampiro,
    defOutrosBonusRegra72,
    defOutrosBonusRegra107,
    devorarIntCount,
    necrosarForCount,
    inexistirAgiCount,
    queimarVigCount,
    maxDevorarInt,
    maxNecrosarFor,
    maxInexistirAgi,
    maxQueimarVig,
    bonusDeslocTrilha34,
    bonusDeslocTotal,
    deslocamentoTotalM,
    danoDeMovimento,
    bonusDefesaTrilha34,
    escolhaRegra53, setEscolhaRegra53,
    atributosFinais,
    bonusTrilhasAtributos,
    ppMax,
    ppTurno
  }), [
    telaAtual, classe, effectiveNex, nex, nomePersonagem, nomeJogador,
    atributos, bonusAtributos, pontosRestantes, alterarAtributo,
    status, periciasHook, poderesHook, origensHook, trilhasHook, rituaisHook, inventarioHook,
    armasHook, municoesHook, protecoesHook, itensHook, itensAmaldicoadosHook, toggleVestimentaGeral,
    modificacoesHook, maldicoesHook, bonusVestimentas, bonusMaldicoes,
    abaDireita, abaModalPoderes, tipoModalPoderes,
    defEquip, defOutros, defesaTotal, defOutrosBonusVampiro, totalDefesaProtecoes,
    bloqueioData, protecoes, proficienciasTotais, sentidos, imunidades, vulnerabilidades, resistencias, proficiencias,
    regrasAtivas, regrasAtivasAtributos, bloquearLetras, refazerPersonagem,
    filtroHabilidades, habilidadesExpandidas, nexModalAberto, poderesModalExpandidos, nexPoderEditando,
    nomeEditando, descricaoEditando, afinidadeEditando, skillCombatente1, skillCombatente2,
    deslocM, deslocQ, bonusDadosCondicionais, bonusDadosAtivos, regras, toggleRegra,
    effectiveNivel, nivel, rituaisExpandidos, versaoRitual, elementoRitual,
    jaTinhaPericiaTrilha, jaTinhaPericiaVersatilidade, periciasGratisSemTrilha, jaTinhaProfissaoTrilha,
    afinidadeEscolhida, afinidadeAtiva, poderesExtras, progressaoNexRecusados, progressaoNexEditados,
    elementoRegra18, regrasAutomaticasAtivas,
    temGranadeiro10, temGranadeiro40, temGranadeiro65, temGranadeiro99, maxExplosivosAutorais, temDobroPerito,
    temCriptologista10, temCriptologista40, temCriptologista65, temCriptologista99, selosPorInterludio, temDobroCriarSelo,
    temIlusionista10, temIlusionista40, temIlusionista65, temIlusionista99,
    temArtistaMarcialTrilha10, temArtistaMarcialTrilha40, temArtistaMarcialTrilha65, temArtistaMarcialTrilha99, temArtistaMarcialAprimorado,
    temAdepto10, temAdepto40, temAdepto65, temAdepto99, temMataLeao10,
    temAcrobata10, temAcrobata40, temAcrobata65, temAcrobata99,
    temVigilante10, temVigilante40, temVigilante65, temVigilante99,
    temViajanteDasSombras10, temViajanteDasSombras40, temViajanteDasSombras65, temViajanteDasSombras99,
    temServente10, temServente40, temServente65, temServente99, serventeElementoPrimario, serventeElementoSecundario,
    temMonstruoso10, temMonstruoso40, temMonstruoso65, temMonstruoso75, temMonstruoso99,
    isMonstruosoAtivo10, isMonstruosoAtivo40, isMonstruosoAtivo65, isMonstruosoAtivo75,
    temMonstruosoEsp10, temMonstruosoEsp40, temMonstruosoEsp65, temMonstruosoEsp75, temMonstruosoEsp99, isMonstruosoEspAtivo,
    temMonstruosoOcult10, temMonstruosoOcult40, temMonstruosoOcult65, temMonstruosoOcult75, temMonstruosoOcult99, isMonstruosoOcultAtivo,
    monstruosoElemento, jaTinhaOcultismoMonstruoso,
    temVampiro10, temVampiro40, temVampiro65, temVampiro99, vampiroArquetipo, bloquearIntimidacaoVampiro,
    defOutrosBonusRegra72, defOutrosBonusRegra107,
    devorarIntCount, necrosarForCount, inexistirAgiCount, queimarVigCount,
    maxDevorarInt, maxNecrosarFor, maxInexistirAgi, maxQueimarVig,
    bonusDeslocTrilha34, bonusDeslocTotal, deslocamentoTotalM, danoDeMovimento, bonusDefesaTrilha34,
    escolhaRegra53, atributosFinais, bonusTrilhasAtributos, ppMax, ppTurno
  ]);

  return <RPGContext.Provider value={value}>{children}</RPGContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRPG(): RPGContextType {
  const ctx = useContext(RPGContext);
  if (!ctx) throw new Error('useRPG deve ser usado dentro de RPGProvider');
  return ctx;
}
