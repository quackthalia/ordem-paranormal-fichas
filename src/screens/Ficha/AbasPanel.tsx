import React from 'react';
import { useRPG } from '../../context/RPGContext';
import { InputOtimizado } from '../../components/InputOtimizado';
import { ModalRituais } from '../../components/ModalRituais';
import { ModalRituaisExtra } from '../../components/ModalRituaisExtra';
import { ModalTrilhas } from '../../components/ModalTrilhas';
import { CustomSelect } from '../../components/CustomSelect';
import { Collapse } from '../../components/Collapse';
import { ModalEditarTrilha } from '../../components/ModalEditarTrilha';
import type { HabilidadeItem, CategoriaHabilidade, VersaoRitual } from '../../types';
import {
  calcularBonusAtaqueEspecial,
  calcularBonusPerito,
  calcularBonusEngenhosidade,
  calcularTotalRituais,
  obterLimiteCirculos,
  calcularNivel,
  sortPorElementoENome,
  verificarRequisitoRitual,
  verificarAcessoCirculo,
} from '../../utils/rpgRules';

import { ModalPoderes } from '../../components/ModalPoderes';
import { ToolbarFormato } from '../../components/ToolbarFormato';
import { ModalPoderesExtra } from '../../components/ModalPoderesExtra';
import { ModalPoderOutraClasse } from '../../components/ModalPoderOutraClasse';
import { ModalPoderOutraOrigem } from '../../components/ModalPoderOutraOrigem';
import { ModalHabilidadeTrilhaExtra } from '../../components/ModalHabilidadeTrilhaExtra';
import { ProgressaoNEXPanel } from './ProgressaoNEXPanel';
import { InventarioPanel } from './InventarioPanel';
import { CombatePanel } from './CombatePanel';
// ═══════════════════════════════════════════════════════════════
// CORES DOS ELEMENTOS
// ═══════════════════════════════════════════════════════════════
const CORES_ELEMENTOS: Record<string, string> = {
  sangue: '#b31717',
  conhecimento: '#b07902',
  energia: '#af27d9',
  morte: '#000000',
  medo: '#ffffff',
  varia: '#888888',
  lista: '#888888',
};

const CORES_ELEMENTOS_BOTOES: Record<string, { ativo: string; inativo: string }> = {
  Sangue: {
    ativo: 'bg-red-950/80 border-red-500 text-red-200 shadow-[0_0_8px_rgba(239,68,68,0.3)]',
    inativo: 'bg-zinc-900/80 border-red-900/40 text-red-400/80 hover:border-red-600 hover:text-red-300'
  },
  Morte: {
    ativo: 'bg-black border-zinc-400 text-white shadow-[0_0_8px_rgba(255,255,255,0.2)]',
    inativo: 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
  },
  Conhecimento: {
    ativo: 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.3)]',
    inativo: 'bg-zinc-900/80 border-amber-900/40 text-amber-400/80 hover:border-amber-600 hover:text-amber-300'
  },
  Energia: {
    ativo: 'bg-purple-950/80 border-purple-500 text-purple-200 shadow-[0_0_8px_rgba(168,85,247,0.3)]',
    inativo: 'bg-zinc-900/80 border-purple-900/40 text-purple-400/80 hover:border-purple-600 hover:text-purple-300'
  },
  Medo: {
    ativo: 'bg-zinc-100 border-white text-zinc-950 font-black shadow-[0_0_10px_rgba(255,255,255,0.5)]',
    inativo: 'bg-zinc-900/80 border-zinc-600 text-zinc-300 hover:border-zinc-400 hover:text-white'
  }
};

function sanidadePorNivel(classe: string | null): number {
  switch (classe) {
    case 'Especialista': return 3;
    case 'Combatente': return 2;
    case 'Ocultista': return 4;
    default: return 0;
  }
}

function getBadgeElemento(elemento: string): string {
  if (!elemento) return 'bg-zinc-900 text-zinc-400';
  const el = elemento.toLowerCase();
  
  if (el.includes(' e ')) {
    return 'bg-zinc-800 text-zinc-300';
  }

  switch (el) {
    case 'morte': return 'bg-black/50 text-white';
    case 'medo': return 'bg-zinc-200/80 text-zinc-950';
    case 'sangue': return 'bg-red-950/20 text-red-500';
    case 'energia': return 'bg-purple-950/20 text-purple-500';
    case 'conhecimento': return 'bg-yellow-950/20 text-yellow-500';
    default: return 'bg-zinc-900 text-zinc-400';
  }
}

function obterCorBadge(elemento: string): string {
  if (!elemento) return '#666';
  const elementoStr = elemento.toLowerCase();
  if (elementoStr.includes(' e ')) {
    const partes = elementoStr.split(' e ');
    const cor1 = CORES_ELEMENTOS[partes[0].trim()] || '#666';
    const cor2 = CORES_ELEMENTOS[partes[1].trim()] || '#666';
    return `linear-gradient(135deg, ${cor1} 50%, ${cor2} 50%)`;
  }
  return CORES_ELEMENTOS[elementoStr] || '#666';
}

function obterCorElementoPrimario(elemento: string): string {
  if (!elemento) return '#666';
  const elementoStr = elemento.toLowerCase();
  if (elementoStr.includes(' e ')) {
    const partes = elementoStr.split(' e ');
    return CORES_ELEMENTOS[partes[0].trim()] || '#666';
  }
  return CORES_ELEMENTOS[elementoStr] || '#666';
}

function obterCorTexto(elemento: string): string {
  if (!elemento) return '#ffffff';
  const e = elemento.toLowerCase();
  if (e.includes(' e ')) return '#ffffff';
  if (e === 'medo') return '#000000';
  return '#ffffff';
}

function formatarDescricao(texto: string): string {
  if (!texto) return '';
  let resultado = texto;
  if (!resultado.includes('<') && !resultado.includes('&')) {
    resultado = resultado
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    resultado = resultado.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    resultado = resultado.replace(/_(.*?)_/g, '<em>$1</em>');
  }
  resultado = resultado.replace(/\n/g, '<br />');
  return resultado;
}

/**
 * Extrai o valor correto de um campo com "/" baseado na versão selecionada.
 * Formato: "Normal/Discente/Verdadeiro" ou "Normal/Verdadeiro" (quando só tem verdadeiro).
 */
function obterValorVersao(
  campo: string,
  versao: VersaoRitual,
  temDiscente: boolean,
  temVerdadeiro: boolean
): string {
  if (!campo || versao === 'normal') {
    // Na versão normal, pega tudo antes da primeira /
    if (campo && campo.includes('/')) {
      return campo.split('/')[0].trim();
    }
    return campo || '';
  }

  const partes = campo.split('/').map(p => p.trim());
  const normal = partes[0]; // Valor base (Normal)

  if (partes.length === 1) return normal; // Sem /, valor único

  if (versao === 'discente') {
    // Discente é sempre o segundo valor (índice 1)
    // Se vazio (convenção // = sem alteração), cai pro Normal
    return partes[1] || normal;
  }

  if (versao === 'verdadeiro') {
    if (temDiscente && temVerdadeiro) {
      // Formato: Normal/Discente/Verdadeiro → índice 2
      // Se vazio, cai pro Normal
      return partes[2] || normal;
    }
    // Formato: Normal/Verdadeiro → índice 1
    return partes[1] || normal;
  }

  return normal;
}

const AbasPanelInner: React.FC = () => {
  const {
    abaDireita, setAbaDireita,
    atributos, atributosFinais, classe, nex,
    poderesHook,
    origensHook,
    filtroHabilidades, setFiltroHabilidades,
    habilidadesExpandidas, setHabilidadesExpandidas,
    setNexModalAberto,
    setNexPoderEditando, setNomeEditando, setDescricaoEditando, setAfinidadeEditando,
    setAbaModalPoderes,
    setTipoModalPoderes,
    regras,
    rituaisHook,
    rituaisExpandidos, setRituaisExpandidos,
    versaoRitual, setVersaoRitual,
    elementoRitual, setElementoRitual,
    status, trilhasHook, periciasHook, poderesExtras, setPoderesExtras,
    temAdepto10, temAdepto40, temAdepto65, temAdepto99,
    temCriptologista10, temCriptologista40, temCriptologista65, temCriptologista99, selosPorInterludio, temDobroCriarSelo,
    temMonstruoso10, temMonstruoso40, temMonstruoso65, temMonstruoso75, temMonstruoso99, monstruosoElemento,
    isMonstruosoAtivo10, isMonstruosoAtivo40, isMonstruosoAtivo65, isMonstruosoAtivo75,
    temMonstruosoEsp10, temMonstruosoEsp40, temMonstruosoEsp65, temMonstruosoEsp75, temMonstruosoEsp99, isMonstruosoEspAtivo,
    temMonstruosoOcult10, temMonstruosoOcult40, temMonstruosoOcult65, temMonstruosoOcult75, temMonstruosoOcult99, isMonstruosoOcultAtivo,
    temVampiro10, temVampiro40, temVampiro65, temVampiro99, vampiroArquetipo,
    temServente10, temServente40, temServente65, temServente99, serventeElementoPrimario, serventeElementoSecundario,
  } = useRPG();

  const [escolhendoRitualPlaceholder, setEscolhendoRitualPlaceholder] = React.useState<{ origem: string, nex?: number, maxCirculo?: number, circuloFixo?: number, elementoFiltro?: string } | null>(null);
  const [ritualEditandoOrigem, setRitualEditandoOrigem] = React.useState<string | null>(null);
  const [ritualNomeEditando, setRitualNomeEditando] = React.useState('');
  const [ritualDescricaoEditando, setRitualDescricaoEditando] = React.useState('');
  const [ritualPropsEditando, setRitualPropsEditando] = React.useState<import('../../types').RitualAprendido['customProps']>({});
  const [ritualVersaoEditando, setRitualVersaoEditando] = React.useState<'normal' | 'discente' | 'verdadeiro'>('normal');
  const [modalTrilhasAberto, setModalTrilhasAberto] = React.useState(false);
  const [modalVersatilidadeAberto, setModalVersatilidadeAberto] = React.useState(false);
  const [modalExtraAberto, setModalExtraAberto] = React.useState(false);
  const [modalRituaisExtraAberto, setModalRituaisExtraAberto] = React.useState(false);
  const [modalPoderOutraClasseAberto, setModalPoderOutraClasseAberto] = React.useState(false);
  const [modalPoderOutraOrigemAberto, setModalPoderOutraOrigemAberto] = React.useState(false);
  const [categoriaDiletante, setCategoriaDiletante] = React.useState<'combate' | 'utilidade' | 'gerais'>('gerais');
  const [modalTrilhaExtraAberto, setModalTrilhaExtraAberto] = React.useState(false);
  const [modalTrilhaPossuido65Aberto, setModalTrilhaPossuido65Aberto] = React.useState(false);
  const [filtroRituais, setFiltroRituais] = React.useState('');
  const [subAbaRituais, setSubAbaRituais] = React.useState<'rituais' | 'grimorio'>('rituais');
  const [editandoTrilha, setEditandoTrilha] = React.useState(false);
  const [editandoVersatilidade, setEditandoVersatilidade] = React.useState(false);
  const ritualEditorRef = React.useRef<HTMLDivElement>(null);

  const { poderClasse, poderesClasse, poderesEscolhidos, poderesParanormais, removerPoder, listaPoderesUtilidade, escolherPoderExtra } = poderesHook;
  const { origemSelecionada } = origensHook;

  React.useEffect(() => {
    if (ritualEditandoOrigem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [ritualEditandoOrigem]);

  const { afinidadeEscolhida, afinidadeAtiva, nivel, regrasAutomaticasAtivas, armasHook, bonusMaldicoes, itensHook } = useRPG();
  const effectiveNex = regras['nex_experiencia'] ? (nivel * 5) : nex;
  const isLamina = (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 15 && (regras['nex_experiencia'] ? nivel >= 2 : effectiveNex >= 10)) || (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 15 && (regras['nex_experiencia'] ? nivel >= 10 : effectiveNex >= 50));

  React.useEffect(() => {
    setRituaisExpandidos([]);
    if (setHabilidadesExpandidas) setHabilidadesExpandidas([]);
  }, [abaDireita, setRituaisExpandidos, setHabilidadesExpandidas]);

  React.useEffect(() => {
    const handler = (e: any) => {
      setEscolhendoRitualPlaceholder({ origem: `poder_57_${e.detail.nex}`, nex: e.detail.nex });
    };
    const handleAbrirModalOutraClasse = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.nex !== undefined) {
        const nexSlot = Number(customEvent.detail.nex);
        if (!isNaN(nexSlot)) {
          setCategoriaDiletante(nexSlot % 2 !== 0 ? 'combate' : 'utilidade');
        }
      }
      setModalPoderOutraClasseAberto(true);
    };
    const handleAbrirModalOutraOrigem = () => setModalPoderOutraOrigemAberto(true);

    window.addEventListener('abrirModalRituais', handler);
    window.addEventListener('abrirModalOutraClasse', handleAbrirModalOutraClasse);
    window.addEventListener('abrirModalOutraOrigem', handleAbrirModalOutraOrigem);
    return () => {
      window.removeEventListener('abrirModalRituais', handler);
      window.removeEventListener('abrirModalOutraClasse', handleAbrirModalOutraClasse);
      window.removeEventListener('abrirModalOutraOrigem', handleAbrirModalOutraOrigem);
    };
  }, []);

  const poderesParanormaisMap = React.useMemo(() => {
    const map = new Map<string, typeof poderesParanormais[0]>();
    poderesParanormais.forEach(pp => {
      map.set(pp.Nome.toLowerCase(), pp);
    });
    return map;
  }, [poderesParanormais]);

  const poderesGeraisMap = React.useMemo(() => {
    const map = new Map<string, string | null>();
    listaPoderesUtilidade.forEach(p => {
      map.set(p.Nome.toLowerCase().trim(), p.Automatico ?? null);
    });
    poderesClasse.forEach(p => {
      map.set(p.Nome.toLowerCase().trim(), p.Automatico ?? null);
    });
    return map;
  }, [listaPoderesUtilidade, poderesClasse]);


  React.useEffect(() => {
    let changed = false;
    const novosPoderes = { ...poderesHook.poderesEscolhidos };
    
    if (regras['nex_experiencia']) {
      Object.entries(novosPoderes).forEach(([key, p]) => {
        const keyNum = parseInt(key, 10);
        if (!isNaN(keyNum) && keyNum >= 1000) return; // Ignora slots específicos da Progressão NEX
        
        const baseNomeStr = p.nome.toLowerCase().trim();
        const isAprenderRitual = baseNomeStr.startsWith('aprender ritual');
        const isResistir = baseNomeStr.startsWith('resistir a ');
        const nomeBase = isAprenderRitual ? 'aprender ritual' : (isResistir ? 'resistir a <elemento>' : baseNomeStr);
        if (poderesParanormaisMap.has(nomeBase)) {
          delete novosPoderes[key as unknown as number];
          changed = true;
        }
      });
    } else {
      Object.entries(novosPoderes).forEach(([key, p]) => {
        const keyNum = parseInt(key, 10);
        if (!isNaN(keyNum) && keyNum >= 1000) {
          delete novosPoderes[key as unknown as number];
          changed = true;
        }
      });
    }

    if (changed) {
      poderesHook.setPoderesEscolhidos(novosPoderes);
    }
  }, [regras['nex_experiencia'], poderesParanormaisMap, poderesHook.setPoderesEscolhidos]);

  const extrairKeyDoId = (id: string): number | string | null => {
    if (id === 'extra_regra32' || id.startsWith('extra_')) return id;
    if (id.includes('_extra_')) {
      const match = id.match(/_(extra_.+)$/);
      if (match) return match[1];
    }
    const match = id.match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
  };

  const listaHabilidades = React.useMemo(() => {
    const contagemPoderes: Record<string, number> = {};
    const primeiraVez: Record<string, string | number> = {};
    const afinidadesAdquiridas: Record<string, string | number> = {};

    Object.entries(poderesEscolhidos).forEach(([key, p]) => {
      const baseNomeStr = p.nome.toLowerCase().trim();
      const isAprenderRitual = baseNomeStr.startsWith('aprender ritual');
      const isResistir = baseNomeStr.startsWith('resistir a ');
      const nomeBase = isAprenderRitual ? 'aprender ritual' : (isResistir ? 'resistir a <elemento>' : baseNomeStr);
      const pp = poderesParanormaisMap.get(nomeBase);
      const trackingKey = baseNomeStr; // Usa o nome específico (ex: "resistir a sangue")
      
      contagemPoderes[trackingKey] = (contagemPoderes[trackingKey] || 0) + 1;
      
      if (pp) {
        if (!primeiraVez[trackingKey]) {
          primeiraVez[trackingKey] = key;
        } else {
          afinidadesAdquiridas[trackingKey] = key;
        }
      }
    });

    const poderesRenderizados = new Set<string>();
    let lista: HabilidadeItem[] = [];

    // 1. Origem
    if (origemSelecionada?.Nome_Poder) {
      lista.push({
        id: 'origem_poder',
        nome: origemSelecionada.Nome_Poder,
        descricao: origemSelecionada.Descricao_Poder,
        tipo: 'Origem',
        extra: null,
        subPoder: null,
        categoria: 'origem',
      });
    }

    // Regra 32 (Flashback) logo abaixo da origem
    if (regrasAutomaticasAtivas.has(32)) {
      const usouRegra32 = poderesEscolhidos['extra_regra32'];
      if (usouRegra32) {
         lista.push({ id: 'extra_regra32', nome: usouRegra32.nome, descricao: usouRegra32.descricao, tipo: 'Flashback', categoria: 'origem', fonte: usouRegra32.fonte, preRequisitos: usouRegra32.preRequisitos, elemento: usouRegra32.elemento, afinidade: usouRegra32.afinidade });
      } else {
         lista.push({ id: 'escolha_extra_regra32', nome: 'Escolher Poder de Outra Origem', descricao: 'Clique no "+" para abrir a lista e selecionar seu poder de origem.', tipo: 'Flashback', isSlotVazio: true, nexDoSlot: 0, categoria: 'origem' });
      }
    }

    // 1.1 Poder Extra da Origem (Regra 1)
    if (origemSelecionada?.Codigo_Regra === 1) {
      const extraKey = 'extra_regra1';
      const escolhido = poderesEscolhidos[extraKey];
      if (escolhido) {
        lista.push({
          id: `escolha_${extraKey}`,
          nome: escolhido.nome,
          descricao: escolhido.descricao,
          tipo: 'Origem',
          categoria: 'paranormais',
          preRequisitos: escolhido.preRequisitos,
          fonte: escolhido.fonte,
          elemento: escolhido.elemento
        });
      } else {
        lista.push({
          id: `escolha_${extraKey}`,
          nome: 'Escolher Poder Paranormal',
          descricao: 'Sua origem fornece um poder paranormal extra.',
          tipo: 'Origem',
          isSlotVazio: true,
          nexDoSlot: 0,
          categoria: 'paranormais'
        });
      }
    }

    // 1.5 Trilha
    if (effectiveNex >= 10 && (classe === 'Combatente' || classe === 'Especialista' || classe === 'Ocultista')) {
      if (trilhasHook.trilhaSelecionada) {
        lista.push({
          id: 'trilha_selecionada',
          nome: trilhasHook.trilhaSelecionada.Nome_Trilha,
          descricao: '',
          tipo: 'Trilha',
          categoria: 'trilha',
          extra: null,
        });
      } else {
        lista.push({
          id: 'escolha_trilha',
          nome: 'Escolher Trilha',
          descricao: 'Clique no "+" para abrir a lista e selecionar sua trilha.',
          tipo: regras['nex_experiencia'] ? `Nível 2` : `NEX 10%`,
          isSlotVazio: true,
          nexDoSlot: 10,
          categoria: 'trilha',
        });
      }
    }

    if (effectiveNex >= 50) {
      if (trilhasHook.versatilidadeSelecionada) {
        lista.push({
          id: 'versatilidade_selecionada',
          nome: trilhasHook.versatilidadeSelecionada.Nome_Trilha,
          descricao: '',
          tipo: 'Versatilidade',
          categoria: 'trilha',
          extra: null,
          isVersatilidade: true,
        });
      } else {
        lista.push({
          id: 'escolha_versatilidade',
          nome: 'Escolher Versatilidade',
          descricao: `Em ${regras['nex_experiencia'] ? 'Nível 10' : 'NEX 50%'}, escolha entre receber um poder de ${classe.toLowerCase()} ou o primeiro poder de uma trilha de ${classe.toLowerCase()} que não a sua. Clique no "+" para selecionar.`,
          tipo: regras['nex_experiencia'] ? `Nível 10` : `NEX 50%`,
          isSlotVazio: true,
          nexDoSlot: 50,
          categoria: 'trilha',
        });
      }
    }

    // 1.6 Poder de Trilha Automático (Monstruoso 75% -> Poder 187)
    if (temMonstruoso75 || temMonstruosoEsp75 || temMonstruosoOcult75) {
      const p187 = listaPoderesUtilidade.find(p => Number(p.codigo_poder) === 187) || poderesClasse.find(p => Number(p.codigo_poder) === 187);
      const fallbackDesc = "Quando o personagem atinge NEX 75%, se torna permanentemente perturbado. Suas ações já não são mais aceitas pela Ordem, que vai banir e potencialmente caçar o ex-agente. Considere que ele começa cada missão com equipamento equivalente a uma patente um nível inferior à sua, conseguido por conta própria.\nQuando o personagem atinge NEX 99%, sua Sanidade é reduzida a 1. Por fim, sempre que ficar enlouquecendo, em vez de sofrer um efeito de insanidade (veja OPRPG, p.111), o personagem fica confuso (a condição se encerra normalmente ou quando o personagem não está mais enlouquecendo). Se um personagem Monstruoso enlouquecer com 99% de NEX, se torna permanentemente uma criatura do Outro Lado.\nSe estiver usando a regra opcional Jogando sem Sanidade, em vez disso considere que o personagem está sempre perturbado e fica enlouquecendo (e confuso) sempre que perde 1 ponto de determinação por qualquer efeito (exceto por pagar custos de habilidades e itens).";
      lista.push({
        id: 'trilha_monstruoso_poder_187',
        nome: p187?.Nome || 'Monstruosa Transformação',
        descricao: p187?.Descricao || fallbackDesc,
        tipo: regras['nex_experiencia'] ? 'Nível 15' : 'NEX 75%',
        categoria: 'trilha',
        fonte: p187?.Fonte || 'SaH',
        preRequisitos: p187?.PreRequisitos || 'Trilha Monstruoso',
        automatico: (p187 as any)?.['Automatico?'] || p187?.Automatico || undefined,
      });
    }

    // Trilha 26 (Criptologista do Oculto - 10% Método Intuitivo): Concede Criar Selo
    const temCriarSeloNosPoderes = Object.values(poderesEscolhidos).some(p => 
      p.nome?.toLowerCase() === 'criar selo' || p.nome?.toLowerCase().startsWith('criar selo')
    );
    if (temCriptologista10 && !temCriarSeloNosPoderes) {
      lista.push({
        id: 'trilha_criptologista_criar_selo',
        nome: 'Criar Selo',
        descricao: 'Você sabe fabricar selos paranormais de rituais que conheça (veja a página 151). Fabricar um selo gasta uma ação de interlúdio e um número de PE iguais ao custo de conjurar o ritual. Você pode ter um número máximo de selos criados a qualquer momento igual à sua Presença.',
        tipo: 'Habilidade de Trilha',
        categoria: 'utilidade',
        fonte: 'Criptologista do Oculto',
        automatico: 'Sim',
      });
    }

    // Trilha Vampírica (40% Opção 3 baseada no Arquétipo)
    // Ancião: Concede Aura de Pavor
    const temAuraPavorNosPoderes = Object.values(poderesEscolhidos).some(p => 
      p.codigoRegra === 29 || (p as any).codigo_poder === 29 || (p as any).Codigo_Poder_Paranormal === 29 || p.nome?.toLowerCase().trim() === 'aura de pavor'
    );
    if (temVampiro40 && vampiroArquetipo === 'Ancião' && poderesExtras['vampiro_opcao_40'] === '3' && !temAuraPavorNosPoderes) {
      lista.push({
        id: 'trilha_vampiro_aura_de_pavor',
        nome: 'Aura de Pavor',
        descricao: 'Ao receber esse poder, você é tomado por uma aura de Morte que nunca mais o abandona. Do ponto de vista dos outros, é como se o mundo ao seu redor perdesse as cores e se tornasse mais opressor. Você pode gastar 2 PE e uma ação de movimento para deixar uma pessoa ou animal em alcance médio apavorado (Vontade DT Pre reduz para abalado). O alvo não precisa ser capaz de ver você. Esta condição termina ao fim da cena, se o alvo se afastar de você além de alcance médio ou se você usar este efeito em outro alvo. Uma mesma pessoa ou animal só pode sofrer o efeito deste poder uma vez por dia.',
        tipo: 'Habilidade de Trilha',
        categoria: 'paranormais',
        elemento: 'Morte',
        fonte: 'Vontade Vampírica (40%)',
        automatico: 'Sim',
      });
    }

    // Bestial: Concede Instintos Sanguinários
    const temInstintosSanguinariosNosPoderes = Object.values(poderesEscolhidos).some(p => 
      p.codigoRegra === 23 || (p as any).codigo_poder === 23 || (p as any).Codigo_Poder_Paranormal === 23 || p.nome?.toLowerCase().trim() === 'instintos sanguinários' || p.nome?.toLowerCase().trim() === 'instintos sanguinarios'
    );
    if (temVampiro40 && vampiroArquetipo === 'Bestial' && poderesExtras['vampiro_opcao_40'] === '3' && !temInstintosSanguinariosNosPoderes) {
      const p23Instintos = poderesParanormais.find(p => Number(p.codigo_poder) === 23);
      lista.push({
        id: 'trilha_vampiro_instintos_sanguinarios',
        nome: 'Instintos Sanguinários',
        descricao: p23Instintos?.Descricao || 'Você recebe +2 em testes de ataque e rolagens de dano com armas corpo a corpo e +5 em testes de Atletismo e Fortitude.',
        tipo: 'Habilidade de Trilha',
        categoria: 'paranormais',
        elemento: 'Sangue',
        fonte: 'Vontade Vampírica (40%)',
        automatico: 'Semi',
      });
    }

    // Encantador: Concede Sensitivo
    const temSensitivoNosPoderes = Object.values(poderesEscolhidos).some(p => 
      p.codigoRegra === 55 || (p as any).codigo_poder === 10 || (p as any).Codigo_Poder_Paranormal === 10 || p.nome?.toLowerCase().trim() === 'sensitivo'
    );
    if (temVampiro40 && vampiroArquetipo === 'Encantador' && poderesExtras['vampiro_opcao_40'] === '3' && !temSensitivoNosPoderes) {
      const p10Sensitivo = poderesParanormais.find(p => Number(p.codigo_poder) === 10 || p.codigoRegra === 55);
      lista.push({
        id: 'trilha_vampiro_sensitivo',
        nome: 'Sensitivo',
        descricao: p10Sensitivo?.Descricao || 'Você consegue sentir as emoções e intenções de outros personagens, como medo, raiva ou malícia, recebendo +5 em testes de Diplomacia, Intimidação e Intuição.',
        tipo: 'Habilidade de Trilha',
        categoria: 'paranormais',
        elemento: 'Conhecimento',
        fonte: 'Vontade Vampírica (40%)',
        automatico: 'Sim',
      });
    }

    // 1.7 Monstruoso Ocultista 40%: Tatuagem Ritualística (ou Slot Extra se já tiver)
    const p89Tatuagem = listaPoderesUtilidade.find(p => Number(p.codigo_poder) === 89) || poderesClasse.find(p => Number(p.codigo_poder) === 89);
    const buildDescTatuagem = (baseDesc?: string) => {
      let text = baseDesc || p89Tatuagem?.Descricao || "Símbolos marcados em sua pele reduzem em –1 PE o custo de rituais de alcance pessoal que têm você como alvo.";
      if (temMonstruosoOcult40) {
        if (!text.includes('++Escarificação')) {
          text += `\n\n++Escarificação (${monstruosoElemento})++: Diferente do normal, este poder também se aplica a todos os rituais de ${monstruosoElemento} marcados em sua pele, não apenas aos de alcance pessoal que têm você como alvo.`;
        }
        if (temMonstruosoOcult65 && !text.includes('tem sua DT aumentada em +2')) {
          text += `\n\nA DT dos rituais de ${monstruosoElemento} marcados na pele tem sua DT aumentada em +2.`;
        }
        if (temMonstruosoOcult99 && !text.includes('sem a necessidade de fala')) {
          text += `\n\nVocê pode conjurar rituais de ${monstruosoElemento} marcados na pele sem a necessidade de fala, gestos e componentes.`;
        }
      }
      return text;
    };

    if (temMonstruosoOcult40) {
      const temTatuagemEscolhida = Object.values(poderesEscolhidos).some(p => 
        p.codigoRegra === 89 || (p as any).codigo_poder === 89 || p.nome?.toLowerCase().trim() === 'tatuagem ritualística'
      );

      if (!temTatuagemEscolhida) {
        lista.push({
          id: 'trilha_monstruoso_poder_tatuagem',
          nome: 'Tatuagem Ritualística',
          descricao: buildDescTatuagem(),
          tipo: regras['nex_experiencia'] ? 'Nível 8' : 'NEX 40%',
          categoria: 'trilha',
          fonte: 'OPRPG',
          preRequisitos: 'Trilha Monstruoso (40%)',
          automatico: (p89Tatuagem as any)?.['Automatico?'] || p89Tatuagem?.Automatico || undefined,
        });
      } else {
        const extraKey = 'extra_monstruoso_ocult_40';
        const usouExtra = poderesEscolhidos[extraKey];
        if (usouExtra) {
          lista.push({
            id: `escolha_${extraKey}`,
            nome: usouExtra.nome,
            descricao: usouExtra.descricao,
            tipo: 'Monstruoso 40%',
            categoria: (usouExtra.categoria as any) || 'utilidade',
            fonte: usouExtra.fonte,
            preRequisitos: usouExtra.preRequisitos,
            elemento: usouExtra.elemento,
            afinidade: usouExtra.afinidade,
            automatico: usouExtra.automatico,
          });
        } else {
          lista.push({
            id: `escolha_${extraKey}`,
            nome: 'Escolher Poder de Ocultista Extra',
            descricao: 'Como você já possui Tatuagem Ritualística, a trilha fornece um poder de ocultista extra (Combate, Utilidade ou Geral). Clique no "+" para selecionar.',
            tipo: 'Monstruoso 40%',
            isSlotVazio: true,
            nexDoSlot: 40,
            categoria: 'utilidade',
          });
        }
      }
    }

    // 2. Classe
    if (classe === 'Combatente' && poderClasse) {
      lista.push({ id: 'classe_poder_179', nome: poderClasse.Nome, descricao: poderClasse.Descricao, tipo: 'Classe', extra: calcularBonusAtaqueEspecial(nex), subPoder: null, fonte: poderClasse.Fonte || undefined, categoria: 'classe' });
    }
    if (classe === 'Especialista') {
      const ecletico = poderesClasse.find(p => p.codigo_poder === 180);
      const perito = poderesClasse.find(p => p.codigo_poder === 181);
      const engenhosidade = poderesClasse.find(p => p.codigo_poder === 182);
      if (ecletico) lista.push({ id: 'classe_poder_180', nome: ecletico.Nome, descricao: ecletico.Descricao, tipo: 'Classe', extra: null, subPoder: (engenhosidade && effectiveNex >= 40) ? { nome: engenhosidade.Nome, descricao: engenhosidade.Descricao, extra: calcularBonusEngenhosidade(effectiveNex) } : null, fonte: ecletico.Fonte || undefined, categoria: 'classe' });
      if (perito) lista.push({ id: 'classe_poder_181', nome: perito.Nome, descricao: perito.Descricao, tipo: 'Classe', extra: calcularBonusPerito(effectiveNex), subPoder: null, fonte: perito.Fonte || undefined, categoria: 'classe' });
    }
    if (classe === 'Ocultista') {
      const escolhido = poderesClasse.find(p => p.codigo_poder === 183);
      if (escolhido) lista.push({ id: 'classe_poder_183', nome: escolhido.Nome, descricao: escolhido.Descricao, tipo: 'Classe', extra: calcularTotalRituais(effectiveNex), limiteCirculos: obterLimiteCirculos(effectiveNex), fonte: escolhido.Fonte || undefined, categoria: 'classe' });
    }

    // 3. Utilidade
    const temPossuido = trilhasHook.trilhaSelecionada?.Codigo_Trilha === 23;
    const patamares = temPossuido ? [] : [10, 20, 30, 40, 50, 60, 70, 80, 90, 99];
    patamares.forEach(nivelPatamar => {
      if (effectiveNex >= nivelPatamar) {
        const escolhido = poderesEscolhidos[nivelPatamar];
        if (escolhido) {
          const isAprenderRitual = escolhido.nome.toLowerCase().startsWith('aprender ritual (');
          const isResistir = escolhido.nome.toLowerCase().startsWith('resistir a ');
          const nomePoderBase = isAprenderRitual ? 'aprender ritual' : (isResistir ? 'resistir a <elemento>' : escolhido.nome.toLowerCase().trim());
          const pp = poderesParanormaisMap.get(nomePoderBase);
          
          let elementoDoPoder = escolhido.elemento || pp?.Elemento;
          if (isAprenderRitual) {
            const ra = rituaisHook.rituaisAprendidos?.find(r => r.origem === `poder_57_${nivelPatamar}`);
            if (ra) {
              const rBase = rituaisHook.rituais.find(r => r.Codigo_Ritual === ra.codigo_ritual);
              const isLista = rBase?.Elemento_Ritual.toLowerCase() === 'lista' || rBase?.Elemento_Ritual.toLowerCase() === 'varia';
              elementoDoPoder = isLista ? ra.elemento_escolhido : rBase?.Elemento_Ritual;
            }
          }

          let categoria: CategoriaHabilidade;
          if (pp) {
            categoria = 'paranormais';
          } else if (escolhido.categoria === 'gerais') {
            categoria = 'gerais';
          } else {
            categoria = 'utilidade';
          }
          const nivelLabel = regras['nex_experiencia'] ? `Nível ${calcularNivel(nivelPatamar)}` : `NEX ${nivelPatamar}%`;
          const tipoLabel = categoria === 'paranormais' ? `Transcender ${nivelPatamar}%` : nivelLabel;
          const afinidadeDoPoder = escolhido.afinidade || pp?.Afinidade;
          const nomeBaseCheck = escolhido.nome.toLowerCase().trim();
          const afinidadeAtiva = afinidadeDoPoder ? contagemPoderes[nomeBaseCheck] >= 2 : false;
          const adqKey = afinidadesAdquiridas[nomeBaseCheck];
          const adqLabel = adqKey ? (
            String(adqKey).startsWith('extra_') ? 'Extra' : (
              (parseInt(String(adqKey), 10) >= 1000) ? 
              (regras['nex_experiencia'] ? `Nível ${calcularNivel(parseInt(String(adqKey), 10) - 1000)}` : `NEX ${parseInt(String(adqKey), 10) - 1000}%`) :
              (regras['nex_experiencia'] ? `Nível ${calcularNivel(parseInt(String(adqKey), 10))}` : `NEX ${parseInt(String(adqKey), 10)}%`)
            )
          ) : '';
          
          const finalTipoLabel = (categoria === 'paranormais' && afinidadeAtiva && adqLabel) 
            ? `${tipoLabel}, Afinidade`
            : tipoLabel;

          if (pp && poderesRenderizados.has(nomeBaseCheck)) {
            // Ignora o segundo block completamente
          } else {
            if (pp) poderesRenderizados.add(nomeBaseCheck);
            const automaticoVal = pp ? (afinidadeAtiva ? (pp['Automatico?_Afinidade'] ?? pp['Automatico?']) : pp['Automatico?']) : (poderesGeraisMap.get(nomeBaseCheck) || undefined);
            const isTatuagem = escolhido.codigoRegra === 89 || (escolhido as any).codigo_poder === 89 || escolhido.nome?.toLowerCase().trim() === 'tatuagem ritualística';
            const descFinal = (temMonstruosoOcult40 && isTatuagem) ? buildDescTatuagem(escolhido.descricao) : escolhido.descricao;
            lista.push({ id: `escolha_nex_${nivelPatamar}`, nome: escolhido.nome, descricao: descFinal, tipo: finalTipoLabel, preRequisitos: escolhido.preRequisitos, fonte: escolhido.fonte || pp?.Fonte, elemento: elementoDoPoder, afinidade: afinidadeDoPoder, afinidadeAtiva, afinidadeAdquiridaKey: adqKey, categoria, automatico: automaticoVal, codigoRegra: escolhido.codigoRegra });
          }
        } else {
          const nivelLabel = regras['nex_experiencia'] ? `Nível ${calcularNivel(nivelPatamar)}` : `NEX ${nivelPatamar}%`;
          lista.push({ id: `escolha_nex_${nivelPatamar}`, nome: 'Escolher Poder de Utilidade', descricao: 'Clique no "+" para abrir a lista e selecionar seu poder.', tipo: nivelLabel, isSlotVazio: true, nexDoSlot: nivelPatamar, categoria: 'utilidade' });
        }
      }
    });

    // 4. Combate
    const patamaresCombate = temPossuido ? [] : [15, 25, 35, 45, 55, 65, 75, 85, 95];
    patamaresCombate.forEach(nivelPatamar => {
      if (effectiveNex >= nivelPatamar) {
        const escolhido = poderesEscolhidos[nivelPatamar];
        if (escolhido) {
          const isAprenderRitual = escolhido.nome.toLowerCase().startsWith('aprender ritual (');
          const isResistir = escolhido.nome.toLowerCase().startsWith('resistir a ');
          const nomePoderBase = isAprenderRitual ? 'aprender ritual' : (isResistir ? 'resistir a <elemento>' : escolhido.nome.toLowerCase().trim());
          const pp = poderesParanormaisMap.get(nomePoderBase);
          
          let elementoDoPoder = escolhido.elemento || pp?.Elemento;
          if (isAprenderRitual) {
            const ra = rituaisHook.rituaisAprendidos?.find(r => r.origem === `poder_57_${nivelPatamar}`);
            if (ra) {
              const rBase = rituaisHook.rituais.find(r => r.Codigo_Ritual === ra.codigo_ritual);
              const isLista = rBase?.Elemento_Ritual.toLowerCase() === 'lista' || rBase?.Elemento_Ritual.toLowerCase() === 'varia';
              elementoDoPoder = isLista ? ra.elemento_escolhido : rBase?.Elemento_Ritual;
            }
          }

          let categoria: CategoriaHabilidade;
          if (pp) {
            categoria = 'paranormais';
          } else if (escolhido.categoria === 'gerais') {
            categoria = 'gerais';
          } else {
            categoria = 'combate';
          }
          const nivelLabel = regras['nex_experiencia'] ? `Nível ${calcularNivel(nivelPatamar)}` : `NEX ${nivelPatamar}%`;
          const tipoLabel = categoria === 'paranormais' ? `Transcender ${nivelPatamar}%` : nivelLabel;
          const afinidadeDoPoder = escolhido.afinidade || pp?.Afinidade;
          const nomeBaseCheck = escolhido.nome.toLowerCase().trim();
          const afinidadeAtiva = afinidadeDoPoder ? contagemPoderes[nomeBaseCheck] >= 2 : false;
          const adqKey = afinidadesAdquiridas[nomeBaseCheck];
          const adqLabel = adqKey ? (
            String(adqKey).startsWith('extra_') ? 'Extra' : (
              (parseInt(String(adqKey), 10) >= 1000) ? 
              (regras['nex_experiencia'] ? `Nível ${calcularNivel(parseInt(String(adqKey), 10) - 1000)}` : `NEX ${parseInt(String(adqKey), 10) - 1000}%`) :
              (regras['nex_experiencia'] ? `Nível ${calcularNivel(parseInt(String(adqKey), 10))}` : `NEX ${parseInt(String(adqKey), 10)}%`)
            )
          ) : '';
          
          const finalTipoLabel = (categoria === 'paranormais' && afinidadeAtiva && adqLabel) 
            ? `${tipoLabel}, Afinidade`
            : tipoLabel;

          if (pp && poderesRenderizados.has(nomeBaseCheck)) {
            // Ignora o segundo block
          } else {
            if (pp) poderesRenderizados.add(nomeBaseCheck);
            const automaticoVal = pp ? (afinidadeAtiva ? (pp['Automatico?_Afinidade'] ?? pp['Automatico?']) : pp['Automatico?']) : (poderesGeraisMap.get(nomeBaseCheck) || undefined);
            const isTatuagemComb = escolhido.codigoRegra === 89 || (escolhido as any).codigo_poder === 89 || escolhido.nome?.toLowerCase().trim() === 'tatuagem ritualística';
            const descFinalComb = (temMonstruosoOcult40 && isTatuagemComb) ? buildDescTatuagem(escolhido.descricao) : escolhido.descricao;
            lista.push({ id: `escolha_nex_combate_${nivelPatamar}`, nome: escolhido.nome, descricao: descFinalComb, tipo: finalTipoLabel, preRequisitos: escolhido.preRequisitos, fonte: escolhido.fonte || pp?.Fonte, elemento: elementoDoPoder, afinidade: afinidadeDoPoder, afinidadeAtiva, afinidadeAdquiridaKey: adqKey, categoria, automatico: automaticoVal, codigoRegra: escolhido.codigoRegra });
          }
        } else {
          const nivelLabel = regras['nex_experiencia'] ? `Nível ${calcularNivel(nivelPatamar)}` : `NEX ${nivelPatamar}%`;
          lista.push({ id: `escolha_nex_combate_${nivelPatamar}`, nome: 'Escolher Poder de Combate', descricao: 'Clique no "+" para abrir a lista e selecionar seu poder de combate.', tipo: nivelLabel, isSlotVazio: true, nexDoSlot: nivelPatamar, categoria: 'combate' });
        }
      }
    });

    // 5. Poderes Extras
    Object.keys(poderesEscolhidos).forEach(key => {
      if (String(key).startsWith('extra_') && key !== 'extra_regra1' && key !== 'extra_regra31' && key !== 'extra_regra32' && key !== 'extra_regra37' && key !== 'extra_regra39') {
        const escolhido = poderesEscolhidos[key];
        const isAprenderRitual = escolhido.nome.toLowerCase().startsWith('aprender ritual (');
        const isResistir = escolhido.nome.toLowerCase().startsWith('resistir a ');
        const nomePoderBase = isAprenderRitual ? 'aprender ritual' : (isResistir ? 'resistir a <elemento>' : escolhido.nome.toLowerCase().trim());
        const pp = poderesParanormaisMap.get(nomePoderBase);
        
        let elementoDoPoder = escolhido.elemento || pp?.Elemento;
        if (isAprenderRitual) {
          const ra = rituaisHook.rituaisAprendidos?.find(r => r.origem === `poder_57_${key}`);
          if (ra) {
            const rBase = rituaisHook.rituais.find(r => r.Codigo_Ritual === ra.codigo_ritual);
            const isLista = rBase?.Elemento_Ritual.toLowerCase() === 'lista' || rBase?.Elemento_Ritual.toLowerCase() === 'varia';
            elementoDoPoder = isLista ? ra.elemento_escolhido : rBase?.Elemento_Ritual;
          }
        }
        
        let categoria: CategoriaHabilidade;
        if (pp) {
          categoria = 'paranormais';
        } else if (escolhido.categoria === 'gerais') {
          categoria = 'gerais';
        } else {
          categoria = 'utilidade';
        }
        const tipoLabel = (escolhido.fonte === 'Dedo Decepado' || (typeof key === 'string' && key.startsWith('extra_dedo_decepado'))) ? 'DEDO DECEPADO' : (escolhido.fonte && !['Ordem Paranormal RPG', 'Sobrevivendo ao Horror'].includes(escolhido.fonte) ? escolhido.fonte : (categoria === 'paranormais' ? `Transcender Extra` : `Extra`));
        const afinidadeDoPoder = escolhido.afinidade || pp?.Afinidade;
        const nomeBaseCheck = escolhido.nome.toLowerCase().trim();
        const afinidadeAtiva = afinidadeDoPoder ? contagemPoderes[nomeBaseCheck] >= 2 : false;
        const adqKey = afinidadesAdquiridas[nomeBaseCheck];
        const adqLabel = adqKey ? (
          String(adqKey).startsWith('extra_') ? 'Extra' : (
            (parseInt(String(adqKey), 10) >= 1000) ? 
            (regras['nex_experiencia'] ? `Nível ${calcularNivel(parseInt(String(adqKey), 10) - 1000)}` : `NEX ${parseInt(String(adqKey), 10) - 1000}%`) :
            (regras['nex_experiencia'] ? `Nível ${calcularNivel(parseInt(String(adqKey), 10))}` : `NEX ${parseInt(String(adqKey), 10)}%`)
          )
        ) : '';
        
        const finalTipoLabel = (categoria === 'paranormais' && afinidadeAtiva && adqLabel) 
          ? `${tipoLabel}, Afinidade`
          : tipoLabel;

        if (pp && poderesRenderizados.has(nomeBaseCheck)) {
          // Ignora duplicata
        } else {
          if (pp) poderesRenderizados.add(nomeBaseCheck);
          const automaticoVal = pp ? (afinidadeAtiva ? (pp['Automatico?_Afinidade'] ?? pp['Automatico?']) : pp['Automatico?']) : (poderesGeraisMap.get(nomeBaseCheck) || undefined);
          const isTatuagemExtra = escolhido.codigoRegra === 89 || (escolhido as any).codigo_poder === 89 || escolhido.nome?.toLowerCase().trim() === 'tatuagem ritualística';
          const descFinalExtra = (temMonstruosoOcult40 && isTatuagemExtra) ? buildDescTatuagem(escolhido.descricao) : escolhido.descricao;
          lista.push({ id: `escolha_${key}`, nome: escolhido.nome, descricao: descFinalExtra, tipo: finalTipoLabel, preRequisitos: escolhido.preRequisitos, fonte: escolhido.fonte || pp?.Fonte, elemento: elementoDoPoder, afinidade: afinidadeDoPoder, afinidadeAtiva, afinidadeAdquiridaKey: adqKey, categoria, automatico: automaticoVal, codigoRegra: escolhido.codigoRegra });
        }
      }
    });

    // 6. Transcender via Progressão de NEX (Custom)
    const patamaresTranscenderProgressao = temPossuido ? [15, 30, 45, 60, 75, 90] : [25, 35, 50, 60, 75, 90];
    if (temPossuido && poderesExtras['possuido_opcao_65'] === 'transcender') {
      patamaresTranscenderProgressao.push(65);
      patamaresTranscenderProgressao.sort((a,b) => a-b);
    }
    patamaresTranscenderProgressao.forEach(nivelPatamar => {
      const chave = 1000 + nivelPatamar;
      const escolhido = poderesEscolhidos[chave];
      if (escolhido) {
        const isAprenderRitual = escolhido.nome.toLowerCase().startsWith('aprender ritual (');
        const isResistir = escolhido.nome.toLowerCase().startsWith('resistir a ');
        const nomePoderBase = isAprenderRitual ? 'aprender ritual' : (isResistir ? 'resistir a <elemento>' : escolhido.nome.toLowerCase().trim());
        const pp = poderesParanormaisMap.get(nomePoderBase);
        
        let elementoDoPoder = escolhido.elemento || pp?.Elemento;
        if (isAprenderRitual) {
          const ra = rituaisHook.rituaisAprendidos?.find(r => r.origem === `poder_57_${chave}`);
          if (ra) {
            const rBase = rituaisHook.rituais.find(r => r.Codigo_Ritual === ra.codigo_ritual);
            const isLista = rBase?.Elemento_Ritual.toLowerCase() === 'lista' || rBase?.Elemento_Ritual.toLowerCase() === 'varia';
            elementoDoPoder = isLista ? ra.elemento_escolhido : rBase?.Elemento_Ritual;
          }
        }

        const nivelLabel = regras['nex_experiencia'] ? `Nível ${calcularNivel(nivelPatamar)}` : `NEX ${nivelPatamar}%`;
        const tipoLabel = `Transcender ${nivelPatamar}%`;
        const afinidadeDoPoder = escolhido.afinidade || pp?.Afinidade;
        const nomeBaseCheck = escolhido.nome.toLowerCase().trim();
        const afinidadeAtiva = afinidadeDoPoder ? contagemPoderes[nomeBaseCheck] >= 2 : false;
        
        const adqKey = afinidadesAdquiridas[nomeBaseCheck];
        const adqLabel = adqKey ? (
          String(adqKey).startsWith('extra_') ? 'Extra' : (
            (parseInt(String(adqKey), 10) >= 1000) ? 
            (regras['nex_experiencia'] ? `Nível ${calcularNivel(parseInt(String(adqKey), 10) - 1000)}` : `NEX ${parseInt(String(adqKey), 10) - 1000}%`) :
            (regras['nex_experiencia'] ? `Nível ${calcularNivel(parseInt(String(adqKey), 10))}` : `NEX ${parseInt(String(adqKey), 10)}%`)
          )
        ) : '';
        
        const finalTipoLabel = (afinidadeAtiva && adqLabel) 
          ? `${tipoLabel}, Afinidade`
          : tipoLabel;

        if (pp && poderesRenderizados.has(nomeBaseCheck)) {
          // Ignora duplicata
        } else {
          if (pp) poderesRenderizados.add(nomeBaseCheck);
          const automaticoVal = pp ? (afinidadeAtiva ? (pp['Automatico?_Afinidade'] ?? pp['Automatico?']) : pp['Automatico?']) : (poderesGeraisMap.get(nomeBaseCheck) || undefined);
          lista.push({ 
            id: `escolha_nex_${chave}`, 
            nome: escolhido.nome, 
            descricao: escolhido.descricao, 
            tipo: finalTipoLabel, 
            preRequisitos: escolhido.preRequisitos, 
            fonte: escolhido.fonte || pp?.Fonte, 
            elemento: elementoDoPoder, 
            afinidade: afinidadeDoPoder,
            afinidadeAtiva,
            afinidadeAdquiridaKey: adqKey,
            categoria: 'paranormais',
            automatico: automaticoVal,
          });
        }
      } else if (temPossuido && effectiveNex >= nivelPatamar) {
        const nivelLabel = regras['nex_experiencia'] ? `Nível ${calcularNivel(nivelPatamar)}` : `NEX ${nivelPatamar}%`;
        lista.push({
          id: `escolha_transcender_${chave}`,
          nome: 'Escolher Poder Paranormal',
          descricao: 'Clique no "+" para abrir a lista e selecionar seu poder paranormal.',
          tipo: `Transcender ${nivelLabel}`,
          isSlotVazio: true,
          nexDoSlot: chave,
          categoria: 'paranormais',
        });
      }
    });

    if (temPossuido && (poderesExtras['possuido_opcao_65'] === 'trilha' || poderesExtras['possuido_opcao_65'] === 'versatilidade') && effectiveNex >= 65) {
      const extraKey = 'extra_possuido_trilha_65';
      const usou65 = poderesEscolhidos[extraKey];
      if (usou65) {
        lista.push({
          id: `escolha_${extraKey}`,
          nome: usou65.nome,
          descricao: usou65.descricao,
          tipo: '10% Trilha (Ocultista)',
          categoria: 'trilha',
          fonte: usou65.fonte,
          preRequisitos: usou65.preRequisitos,
          elemento: usou65.elemento,
          afinidade: usou65.afinidade,
        });
      } else {
        lista.push({
          id: 'escolha_possuido_trilha_65',
          nome: 'Escolher 10% Trilha (Ocultista)',
          descricao: 'Clique no "+" para escolher o primeiro poder (10%) de uma trilha de Ocultista.',
          tipo: '10% Trilha (Ocultista)',
          isSlotVazio: true,
          nexDoSlot: 0,
          categoria: 'trilha',
        });
      }
    }

      // --- REGRAS 31 e 32 (Poderes Extras) ---
      if (regrasAutomaticasAtivas.has(31)) {
        let diletanteCat: 'combate' | 'utilidade' | 'gerais' = 'gerais';
        Object.entries(poderesEscolhidos).forEach(([key, p]) => {
          if (p.codigoRegra === 31) {
            const nexSlot = parseInt(key);
            if (!isNaN(nexSlot)) {
              diletanteCat = (nexSlot % 2 !== 0) ? 'combate' : 'utilidade';
            } else {
              diletanteCat = p.categoria as any;
            }
          }
        });

        const usouRegra31 = poderesEscolhidos['extra_regra31'];
        if (usouRegra31) {
           lista.push({ id: 'escolha_extra_regra31', nome: usouRegra31.nome, descricao: usouRegra31.descricao, tipo: 'Especialista Diletante', categoria: diletanteCat, fonte: usouRegra31.fonte, preRequisitos: usouRegra31.preRequisitos, elemento: usouRegra31.elemento, afinidade: usouRegra31.afinidade });
        } else {
           lista.push({ id: 'escolha_extra_regra31', nome: 'Escolher Poder de Outra Classe', descricao: 'Clique no "+" para abrir a lista e selecionar seu poder extra.', tipo: 'Especialista Diletante', isSlotVazio: true, nexDoSlot: 0, categoria: diletanteCat });
        }
      }

      // --- REGRAS 37 e 39 (Poderes Extras) ---
      if (regrasAutomaticasAtivas.has(37)) {
        const extraKey = 'extra_regra37';
        const usouRegra37 = poderesEscolhidos[extraKey];
        if (usouRegra37) {
           lista.push({ id: `escolha_${extraKey}`, nome: usouRegra37.nome, descricao: usouRegra37.descricao, tipo: 'Dominar Habilidade Ritualística', categoria: 'trilha', fonte: usouRegra37.fonte, preRequisitos: usouRegra37.preRequisitos, elemento: usouRegra37.elemento, afinidade: usouRegra37.afinidade });
        } else {
           lista.push({ id: `escolha_${extraKey}`, nome: 'Escolher Poder de Trilha', descricao: 'Clique no "+" para abrir a lista e selecionar sua habilidade ritualística.', tipo: 'Dominar Habilidade Ritualística', isSlotVazio: true, nexDoSlot: 0, categoria: 'trilha' });
        }
      }

      if (regrasAutomaticasAtivas.has(39)) {
        const extraKey = 'extra_regra39';
        const usouRegra39 = poderesEscolhidos[extraKey];
        if (usouRegra39) {
           lista.push({ id: `escolha_${extraKey}`, nome: usouRegra39.nome, descricao: usouRegra39.descricao, tipo: 'Poder Paranormal Extra', categoria: 'paranormais', fonte: usouRegra39.fonte, preRequisitos: usouRegra39.preRequisitos, elemento: usouRegra39.elemento, afinidade: usouRegra39.afinidade });
        } else {
           lista.push({ id: `escolha_${extraKey}`, nome: 'Escolher Poder Paranormal', descricao: 'Clique no "+" para abrir a lista e selecionar seu poder paranormal extra.', tipo: 'Poder Paranormal Extra', isSlotVazio: true, nexDoSlot: 0, categoria: 'paranormais' });
        }
      }



    // Desbloqueio Cronológico: Separado por Combate e Utilidade/Trilha
    const slotsVazios = lista.filter(h => h.isSlotVazio && h.nexDoSlot !== undefined);
    if (slotsVazios.length > 0) {
      const vaziosCombate = slotsVazios.filter(h => h.categoria === 'combate' && !String(h.id).includes('_extra_'));
      const vaziosUtilidade = slotsVazios.filter(h => h.categoria === 'utilidade' && !String(h.id).includes('_extra_'));
      const vaziosTrilha = slotsVazios.filter(h => h.categoria === 'trilha' && !String(h.id).includes('_extra_'));
      const vaziosGerais = slotsVazios.filter(h => h.categoria === 'gerais' && !String(h.id).includes('_extra_'));
      
      const menorNexCombate = vaziosCombate.length > 0 ? Math.min(...vaziosCombate.map(h => h.nexDoSlot!)) : Infinity;
      const menorNexUtilidade = vaziosUtilidade.length > 0 ? Math.min(...vaziosUtilidade.map(h => h.nexDoSlot!)) : Infinity;
      const menorNexTrilha = vaziosTrilha.length > 0 ? Math.min(...vaziosTrilha.map(h => h.nexDoSlot!)) : Infinity;
      const menorNexGerais = vaziosGerais.length > 0 ? Math.min(...vaziosGerais.map(h => h.nexDoSlot!)) : Infinity;
      
      lista = lista.filter(h => {
        if (h.isSlotVazio && h.nexDoSlot !== undefined) {
          if (String(h.id).includes('_extra_')) return true;

          if (h.categoria === 'combate') {
            return h.nexDoSlot <= menorNexCombate;
          } else if (h.categoria === 'utilidade') {
            return h.nexDoSlot <= menorNexUtilidade;
          } else if (h.categoria === 'trilha') {
            return h.nexDoSlot <= menorNexTrilha;
          } else if (h.categoria === 'gerais') {
            return h.nexDoSlot <= menorNexGerais;
          }
        }
        return true;
      });
    }

    return lista;
  }, [classe, nex, nivel, origemSelecionada, poderClasse, poderesClasse, poderesEscolhidos, poderesParanormais, poderesParanormaisMap, rituaisHook.rituaisAprendidos, rituaisHook.rituais, regras, trilhasHook.trilhaSelecionada, trilhasHook.versatilidadeSelecionada, regrasAutomaticasAtivas, temMonstruoso75, temMonstruosoEsp75, listaPoderesUtilidade, temCriptologista10, temCriptologista40, temCriptologista65, temCriptologista99, temVampiro40, poderesExtras]);

  const habilidadesFiltradas = listaHabilidades.filter(hab =>
    hab.nome.toLowerCase().includes(filtroHabilidades.toLowerCase()) ||
    (hab.id === 'trilha_selecionada' && Boolean(
      trilhasHook.trilhaSelecionada?.Nome_Habilidade_10?.toLowerCase().includes(filtroHabilidades.toLowerCase()) ||
      trilhasHook.trilhaSelecionada?.Nome_Habilidade_40?.toLowerCase().includes(filtroHabilidades.toLowerCase()) ||
      trilhasHook.trilhaSelecionada?.Nome_Habilidade_65?.toLowerCase().includes(filtroHabilidades.toLowerCase()) ||
      trilhasHook.trilhaSelecionada?.Nome_Habilidade_99?.toLowerCase().includes(filtroHabilidades.toLowerCase())
    ))
  );

  const ordemCategorias: (CategoriaHabilidade | 'trilha')[] = ['origem', 'trilha', 'classe', 'utilidade', 'combate', 'paranormais', 'gerais'];
  const rotuloCategoria: Record<CategoriaHabilidade | 'trilha', string> = {
    origem: 'Poder de Origem',
    trilha: 'Trilha da Classe',
    classe: 'Poderes de Classe',
    utilidade: 'Poderes de Utilidade',
    combate: 'Poderes de Combate',
    paranormais: 'Poderes Paranormais',
    gerais: 'Poderes Gerais',
  };

  return (
    <div className="flex flex-col h-full min-h-0 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 md:p-4">
      <div className="mb-5 flex flex-nowrap overflow-x-auto gap-x-1 border-b border-zinc-800 custom-scrollbar pb-1">
        {(['combate','habilidades','rituais','inventario','descricao','regras'] as const).map(aba => (
          <button key={aba} onClick={() => setAbaDireita(aba)}
            className={`shrink-0 px-1 py-2 text-[10px] md:text-[11px] 2xl:text-xs font-bold uppercase tracking-wide transition whitespace-nowrap flex-1 text-center ${
              abaDireita === aba ? 'border-b-2 border-green-800 text-zinc-100' : 'border-b-2 border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >{aba === 'inventario' ? 'Inventário' : aba === 'descricao' ? 'Descrição' : aba === 'regras' ? 'Regras' : aba}</button>
        ))}
      </div>

      <div className="mt-2 flex flex-1 flex-col min-h-0">
        {abaDireita === 'combate' && <CombatePanel />}

        {abaDireita === 'habilidades' && (
          <div className="flex flex-1 flex-col min-h-0">
            <div className="mb-5 flex items-center gap-4">
              <InputOtimizado value={filtroHabilidades} onChange={setFiltroHabilidades}
                placeholder="Filtrar habilidades..."
                className="flex-1 border-b border-zinc-700 bg-transparent py-2 text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-green-700"
              />
              <button onClick={() => setModalExtraAberto(true)} className="whitespace-nowrap rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-200 transition hover:border-green-800 hover:bg-green-950/40">+ Adicionar</button>
            </div>

            <div className="flex flex-1 flex-col gap-0 overflow-y-auto pr-1 min-h-0 custom-scrollbar">
              {ordemCategorias.map(categoria => {
                const itensDaCategoria = habilidadesFiltradas.filter(h => h.categoria === categoria);
                if (itensDaCategoria.length === 0) return null;

                if (categoria === 'paranormais') {
                  itensDaCategoria.sort((a, b) => {
                    const keyA = extrairKeyDoId(a.id);
                    const keyB = extrairKeyDoId(b.id);
                    
                    const getNex = (key: number | string | null) => {
                      if (typeof key === 'string') return 9999;
                      if (typeof key === 'number') {
                         return key >= 1000 ? key - 1000 : key;
                      }
                      return 9999;
                    };
                    
                    const nexA = getNex(keyA);
                    const nexB = getNex(keyB);
                    
                    if (nexA !== nexB) return nexA - nexB;
                    return sortPorElementoENome(a, b, hab => hab?.elemento, hab => hab?.nome);
                  });
                }

                return (
                  <div key={categoria} className="mb-4">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-zinc-600">{rotuloCategoria[categoria]}</span>
                      <div className="flex-1 border-t border-zinc-800" />
                    </div>

                    <div className="flex flex-col gap-2.5">
                      {(() => {
                        const renderHab = (hab: any) => {
                          const estaExpandida = habilidadesExpandidas.includes(hab.id);

                        if (hab.isSlotVazio) {
                          return (
                            <div
                              key={hab.id}
                              onClick={() => {
                                if (hab.id === 'escolha_extra_regra37') {
                                  setModalTrilhaExtraAberto(true);
                                } else if (hab.categoria === 'trilha') {
                                  if (hab.id === 'escolha_versatilidade') {
                                    setModalVersatilidadeAberto(true);
                                  } else if (hab.id === 'escolha_possuido_trilha_65') {
                                    setModalTrilhaPossuido65Aberto(true);
                                  } else {
                                    setModalTrilhasAberto(true);
                                  }
                                } else if (hab.id === 'escolha_extra_regra1') {
                                  setTipoModalPoderes('utilidade');
                                  setAbaModalPoderes('paranormais');
                                  setNexModalAberto('extra_regra1');
                                } else if (hab.id === 'escolha_extra_regra31') {
                                  let cat: 'combate' | 'utilidade' | 'gerais' = 'gerais';
                                  Object.entries(poderesEscolhidos).forEach(([key, p]) => {
                                    if (p.codigoRegra === 31) {
                                      const nexSlot = parseInt(key);
                                      if (!isNaN(nexSlot)) {
                                        cat = (nexSlot % 2 !== 0) ? 'combate' : 'utilidade';
                                      } else {
                                        cat = p.categoria as any;
                                      }
                                    }
                                  });
                                  setCategoriaDiletante(cat);
                                  setModalPoderOutraClasseAberto(true);
                                } else if (hab.id === 'escolha_extra_regra32') {
                                  setModalPoderOutraOrigemAberto(true);
                                } else if (hab.id === 'escolha_extra_monstruoso_ocult_40') {
                                  setTipoModalPoderes('utilidade');
                                  setAbaModalPoderes('classe');
                                  setNexModalAberto('extra_monstruoso_ocult_40');
                                } else if (hab.id === 'escolha_extra_regra39') {
                                  setNexModalAberto('extra_regra39');
                                } else {
                                  const tipo = hab.id.includes('combate') ? 'combate' : 'utilidade';
                                  setTipoModalPoderes(tipo);
                                  setAbaModalPoderes(tipo === 'combate' ? 'combate' : 'classe');
                                  setNexModalAberto(hab.nexDoSlot ?? (extrairKeyDoId(hab.id) as number));
                                }
                              }}
                              className="group flex w-full cursor-pointer flex-col overflow-hidden rounded border-2 border-dashed border-zinc-700 border-l-zinc-600 border-l-4 bg-zinc-900/40 transition hover:border-green-800 hover:bg-zinc-900/80"
                              style={{ borderLeftStyle: 'solid' }}
                            >
                              <div className="flex items-center justify-between gap-3 bg-zinc-800/40 px-4 py-3 transition group-hover:bg-zinc-800/60">
                                <div className="flex flex-col items-start gap-0.5 text-left">
                                  <span className="text-sm font-bold text-zinc-400 group-hover:text-zinc-300">{hab.nome}</span>
                                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-400">{hab.tipo}</span>
                                </div>
                                <span className="whitespace-nowrap rounded bg-green-900/40 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-green-400 transition group-hover:bg-green-900/60 group-hover:text-green-300">+ Adicionar</span>
                              </div>
                              <div className="border-t border-zinc-800/50 px-4 py-3 text-left text-xs leading-relaxed text-zinc-500 transition group-hover:text-zinc-400">
                                {hab.descricao}
                              </div>
                            </div>
                          );
                        }

                        if (hab.id === 'trilha_selecionada' || hab.id === 'versatilidade_selecionada') {
                          const isVersatilidade = hab.isVersatilidade;
                          const t = isVersatilidade ? trilhasHook.versatilidadeSelecionada : trilhasHook.trilhaSelecionada;
                          
                          if (!t) return null;

                          const isMonstruosoComb = Number(t.Codigo_Trilha) === 18 || (String(t.Nome_Trilha || '').trim().toLowerCase().includes('monstruoso') && t.Classe_Trilha === 'Combatente');
                          const isMonstruosoEsp = Number(t.Codigo_Trilha) === 45 || (String(t.Nome_Trilha || '').trim().toLowerCase().includes('monstruoso') && t.Classe_Trilha === 'Especialista');
                          const isMonstruosoOcult = Number(t.Codigo_Trilha) === 47 || (String(t.Nome_Trilha || '').trim().toLowerCase().includes('monstruoso') && t.Classe_Trilha === 'Ocultista');
                          const isMonstruoso = isMonstruosoComb || isMonstruosoEsp || isMonstruosoOcult || String(t.Nome_Trilha || '').trim().toLowerCase().includes('monstruoso');
                          const nexLevels = isVersatilidade ? [10] : [10, 40, 65, 99];
                          
                          return (
                            <div key={hab.id} className="mb-2 overflow-hidden rounded-r border-l-4 border-green-800 bg-zinc-900/50">
                              <div
                                onClick={() => trilhasHook.toggleTrilhaExpandida(isVersatilidade ? t.Codigo_Trilha + 10000 : t.Codigo_Trilha)}
                                className="flex cursor-pointer flex-col bg-zinc-800/40 px-4 py-3 transition hover:bg-zinc-700/50"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="text-[0.65rem] font-bold uppercase tracking-widest text-zinc-500">
                                      {hab.tipo}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-zinc-200">{isVersatilidade ? 'Versatilidade' : t.Nome_Trilha}</span>
                                      {!isVersatilidade && (
                                        <span className="text-[10px] uppercase text-zinc-500">
                                          ({t.nome_pericia})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-xs text-zinc-600">
                                    {trilhasHook.trilhasExpandidas.includes(isVersatilidade ? t.Codigo_Trilha + 10000 : t.Codigo_Trilha) ? '▲' : '▼'}
                                  </span>
                                </div>
                              </div>
              
                              <Collapse isOpen={trilhasHook.trilhasExpandidas.includes(isVersatilidade ? t.Codigo_Trilha + 10000 : t.Codigo_Trilha)}>
                                <div className="px-4 pb-4 pt-1 text-sm text-zinc-400">
                                  <div
                                    className="mb-4 text-zinc-400 text-left leading-relaxed text-sm"
                                    dangerouslySetInnerHTML={{ __html: formatarDescricao(isVersatilidade ? `Em ${regras['nex_experiencia'] ? 'Nível 10' : 'NEX 50%'}, escolha entre receber um poder de ${classe.toLowerCase()} ou o primeiro poder de uma trilha de ${classe.toLowerCase()} que não a sua.<br/><br/>Trilha Escolhida: <strong>${t.Nome_Trilha}</strong>` : t.Descricao_Trilha) }}
                                  />
                                  
                                  {t.Codigo_Trilha === 43 && (
                                    <div className="mb-4 rounded-lg border border-zinc-700 bg-zinc-950/80 p-3.5 shadow-md flex flex-col gap-3">
                                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                          <span className="text-xs font-bold uppercase tracking-wider text-green-400">
                                            Configuração da Trilha: Criatura Paranormal (Patrono)
                                          </span>
                                        </div>
                                        {poderesExtras['servente_elemento_primario'] && (
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Elementos:</span>
                                            <span className={`rounded px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${getBadgeElemento(poderesExtras['servente_elemento_primario'])}`}>
                                              {poderesExtras['servente_elemento_primario']}
                                            </span>
                                            {poderesExtras['servente_elemento_secundario'] && (
                                              <span className={`rounded px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${getBadgeElemento(poderesExtras['servente_elemento_secundario'])}`}>
                                                {poderesExtras['servente_elemento_secundario']}
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                          Nome da Criatura Paranormal:
                                        </label>
                                        <input
                                          type="text"
                                          placeholder="Ex: O Espreitador, Dama de Sangue, Ceifador..."
                                          value={poderesExtras['servente_criatura_nome'] || ''}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setPoderesExtras(prev => ({ ...prev, servente_criatura_nome: val }));
                                          }}
                                          className="w-full rounded border border-zinc-700 bg-zinc-900/90 px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-green-600 transition shadow-inner"
                                        />
                                      </div>

                                      <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between">
                                          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                            Elemento Primário da Criatura:
                                          </label>
                                          <span className="text-[9px] text-zinc-500 italic">(Gera 2 rituais de 1º círculo)</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 items-center">
                                          {(['Sangue', 'Morte', 'Conhecimento', 'Energia', 'Medo'] as const).map(elem => {
                                            const isPrimario = (poderesExtras['servente_elemento_primario'] || 'Sangue') === elem;
                                            const estilo = isPrimario ? CORES_ELEMENTOS_BOTOES[elem].ativo : CORES_ELEMENTOS_BOTOES[elem].inativo;
                                            return (
                                              <button
                                                key={elem}
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setPoderesExtras(prev => {
                                                    const sec = prev['servente_elemento_secundario'] === elem ? '' : prev['servente_elemento_secundario'];
                                                    return { ...prev, servente_elemento_primario: elem, servente_elemento_secundario: sec };
                                                  });
                                                }}
                                                className={`px-3 py-1 rounded text-xs font-bold uppercase border transition ${estilo}`}
                                              >
                                                {elem}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>

                                      <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between">
                                          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                            Elemento Secundário (Opcional):
                                          </label>
                                          <span className="text-[9px] text-zinc-500 italic">(Caso a criatura tenha dois elementos)</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 items-center">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setPoderesExtras(prev => ({ ...prev, servente_elemento_secundario: '' }));
                                            }}
                                            className={`px-3 py-1 rounded text-xs font-bold uppercase border transition ${
                                              !poderesExtras['servente_elemento_secundario']
                                                ? 'bg-zinc-800 border-zinc-500 text-zinc-100 font-bold'
                                                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                                            }`}
                                          >
                                            Nenhum
                                          </button>
                                          {(['Sangue', 'Morte', 'Conhecimento', 'Energia', 'Medo'] as const).map(elem => {
                                            const primario = poderesExtras['servente_elemento_primario'] || 'Sangue';
                                            if (elem === primario) return null;
                                            const isSec = poderesExtras['servente_elemento_secundario'] === elem;
                                            const estilo = isSec ? CORES_ELEMENTOS_BOTOES[elem].ativo : CORES_ELEMENTOS_BOTOES[elem].inativo;
                                            return (
                                              <button
                                                key={elem}
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setPoderesExtras(prev => ({ ...prev, servente_elemento_secundario: elem }));
                                                }}
                                                className={`px-3 py-1 rounded text-xs font-bold uppercase border transition ${estilo}`}
                                              >
                                                {elem}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-green-400 border-b border-zinc-800 pb-1">
                                    {isVersatilidade ? 'Poder da Trilha' : 'Habilidades da Trilha'}
                                  </h4>
              
                                  {nexLevels.map((nexLvl) => {
                                    if (effectiveNex < nexLvl) return null;

                                    const habNameKey = `Nome_Habilidade_${nexLvl}` as keyof typeof t;
                                    const habDescKey = `Descricao_Habilidade_${nexLvl}` as keyof typeof t;
                                    let nomeHab = t[habNameKey] as string;
                                    if (t.Codigo_Trilha === 7 && nexLvl === 10) {
                                      if (effectiveNex >= 99) nomeHab += ' (+4d6)';
                                      else if (effectiveNex >= 65) nomeHab += ' (+3d6)';
                                      else if (effectiveNex >= 40) nomeHab += ' (+2d6)';
                                      else nomeHab += ' (+1d6)';
                                    } else if (t.Codigo_Trilha === 8 && nexLvl === 10) {
                                      if (effectiveNex >= 99) nomeHab += ' (5 PE, +5d10)';
                                      else if (effectiveNex >= 65) nomeHab += ' (4 PE, +4d10)';
                                      else if (effectiveNex >= 40) nomeHab += ' (3 PE, +3d10)';
                                      else nomeHab += ' (2 PE, +2d10)';
                                    } else if (t.Codigo_Trilha === 9 && nexLvl === 40) {
                                      if (effectiveNex >= 65) nomeHab += ' (8 PE, +2d20)';
                                      else if (effectiveNex >= 40) nomeHab += ' (4 PE, +1d10)';
                                    }
                                    let descHab = t[habDescKey] as string;
                                    if (t.Codigo_Trilha === 26 && nexLvl === 10) {
                                      const maxSelos = temDobroCriarSelo ? atributosFinais.PRE * 2 : atributosFinais.PRE;
                                      descHab += `<br/><br/><strong class="text-green-400">❖ Método Intuitivo${temDobroCriarSelo ? ' Aprimorado' : ''}:</strong> você pode fabricar ${selosPorInterludio} selo(s) em uma ação de interlúdio e ter um máximo de ${maxSelos} selo(s) ativos simultâneos${temDobroCriarSelo ? ' (Presença × 2)' : ' (Presença)'}.`;
                                    }
              
                                    if (!nomeHab) return null;
              
                                    const uniqueHabId = `trilha_${isVersatilidade ? 'versatilidade_' : ''}${t.Codigo_Trilha}_hab_${nexLvl}`;
                                    const isHabExpanded = habilidadesExpandidas.includes(uniqueHabId);
                                    const isAtivoMonst = !isMonstruoso ? true : (
                                      isMonstruosoEsp ? isMonstruosoEspAtivo : (
                                        isMonstruosoOcult ? isMonstruosoOcultAtivo : (
                                          temMonstruoso99 ? true : (
                                            nexLvl === 10 ? isMonstruosoAtivo10 :
                                            nexLvl === 40 ? isMonstruosoAtivo40 :
                                            nexLvl === 65 ? isMonstruosoAtivo65 : true
                                          )
                                        )
                                      )
                                    );
                                    const toggleAtivoMonst = (e?: React.MouseEvent | React.ChangeEvent) => {
                                      if (e && 'stopPropagation' in e) e.stopPropagation();
                                      setPoderesExtras(prev => ({
                                        ...prev,
                                        monstruoso_ativo: prev['monstruoso_ativo'] === 'false' ? 'true' : 'false'
                                      }));
                                    };
              
                                    return (
                                      <div key={nexLvl} className="mb-2 overflow-hidden rounded border border-zinc-800 bg-zinc-900/50">
                                        <div
                                          onClick={() => setHabilidadesExpandidas(prev => prev.includes(uniqueHabId) ? prev.filter(id => id !== uniqueHabId) : [...prev, uniqueHabId])}
                                          className="flex cursor-pointer items-center justify-between px-3 py-2 transition hover:bg-zinc-800"
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            {isMonstruoso && (isMonstruosoEsp || isMonstruosoOcult || !temMonstruoso99) && (
                                              <input
                                                type="checkbox"
                                                checked={isAtivoMonst}
                                                onClick={e => e.stopPropagation()}
                                                onChange={toggleAtivoMonst}
                                                className="accent-green-500 rounded cursor-pointer h-3.5 w-3.5 shrink-0"
                                                title={isAtivoMonst ? "Desativar poderes do elemento" : "Ativar poderes do elemento"}
                                              />
                                            )}
                                            <span className="font-bold text-zinc-200 text-xs truncate">
                                              {regras['nex_experiencia'] ? `Nível ${calcularNivel(nexLvl)}` : `NEX ${nexLvl}%`} - <span className="text-zinc-300">{nomeHab}</span>
                                            </span>
                                          </div>
                                          <span className="text-xs text-zinc-600 shrink-0">
                                            {isHabExpanded ? '▲' : '▼'}
                                          </span>
                                        </div>
                                        <Collapse isOpen={isHabExpanded}>
                                          {(() => {
                                            const isTrilhaVamp = t.Codigo_Trilha === 48 || t.Codigo_Trilha === 49 || t.Codigo_Trilha === 50 || (t.Nome_Trilha && t.Nome_Trilha.toLowerCase().includes('vontade vamp'));
const opcaoKey = `vampiro_opcao_${nexLvl}`;
const opcaoEscolhida = poderesExtras[opcaoKey];

// Em 10%, extrai os 3 arquétipos do texto (Ancião, Bestial, Encantador)
if (isTrilhaVamp && nexLvl === 10 && !opcaoEscolhida) {
  const intro10 = descHab.split(/•\s*Ancião:/)[0].trim();
  const regexArqs = /•\s*(Ancião|Bestial|Encantador):([\s\S]*?)(?=(?:•\s*(?:Ancião|Bestial|Encantador):|$))/g;
  const arqs: { nome: string; texto: string }[] = [];
  let ma;
  while ((ma = regexArqs.exec(descHab)) !== null) {
    arqs.push({ nome: ma[1].trim(), texto: ma[2].trim() });
  }

  return (
    <div className="flex flex-col gap-3 px-3 pb-3 pt-1">
      {intro10 && (
        <div
          className="text-xs text-zinc-400"
          dangerouslySetInnerHTML={{ __html: formatarDescricao(intro10) }}
        />
      )}
      <div className="flex flex-col gap-2.5">
        {arqs.map((arqItem) => {
          return (
            <div
              key={arqItem.nome}
              onClick={e => e.stopPropagation()}
              className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 shadow-sm hover:border-zinc-700 transition flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-green-400">
                  {arqItem.nome}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPoderesExtras(prev => ({
                      ...prev,
                      [opcaoKey]: arqItem.nome,
                      vampiro_arquetipo: arqItem.nome
                    }));
                  }}
                  className="px-2.5 py-1 rounded bg-green-950/50 border border-green-700/60 text-green-300 hover:bg-green-900/60 hover:text-white text-[11px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  + Escolher
                </button>
              </div>
              <div
                className="max-h-48 overflow-y-auto pr-1 text-xs text-zinc-300 leading-relaxed custom-scrollbar"
                dangerouslySetInnerHTML={{ __html: formatarDescricao(arqItem.texto) }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Em 40%, 65%, 99%: extrai a seção do arquétipo escolhido em 10%
const arqEscolhido = poderesExtras['vampiro_opcao_10'] || poderesExtras['vampiro_arquetipo'] || 'Ancião';
let blocoArq = descHab;
let subintroArq = '';
const opcoesArq: string[] = [];

if (isTrilhaVamp && nexLvl > 10) {
  const regexBloco = new RegExp('•\\s*' + arqEscolhido + ':([\\s\\S]*?)(?=(?:•\\s*(?:Ancião|Bestial|Encantador):|$))');
  const matchBloco = descHab.match(regexBloco);
  if (matchBloco) {
    blocoArq = matchBloco[1].trim();
    subintroArq = blocoArq.split(/&-/)[0].trim();
    const regexOpcoes = /&-([\s\S]*?)&/g;
    let mo;
    while ((mo = regexOpcoes.exec(blocoArq)) !== null) {
      opcoesArq.push(mo[1].trim());
    }
  } else {
    subintroArq = descHab.split(/&-/)[0].trim();
    const regexOpcoes = /&-([\s\S]*?)&/g;
    let mo;
    while ((mo = regexOpcoes.exec(descHab)) !== null) {
      opcoesArq.push(mo[1].trim());
    }
  }
}

if (isTrilhaVamp && nexLvl > 10 && opcoesArq.length > 0 && !opcaoEscolhida) {
  const introComum = descHab.split(/•\s*(?:Ancião|Bestial|Encantador):/)[0].trim();

  return (
    <div className="flex flex-col gap-3 px-3 pb-3 pt-1">
      {introComum && (
        <div
          className="text-xs text-zinc-400 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatarDescricao(introComum) }}
        />
      )}
      {subintroArq && (
        <div
          className="text-xs text-zinc-400 leading-relaxed border-l-2 border-green-800/60 pl-2.5 my-1"
          dangerouslySetInnerHTML={{ __html: formatarDescricao(subintroArq) }}
        />
      )}
      <div className="flex flex-col gap-2.5">
        {opcoesArq.map((opcaoTexto, idx) => {
          const numOpcao = String(idx + 1);
          const badgeTag = (() => {
            if (nexLvl === 40) {
              if (arqEscolhido === 'Ancião') return idx === 1 ? 'Semi' : idx === 2 ? 'Auto' : null;
              if (arqEscolhido === 'Bestial') return idx === 1 ? null : idx === 2 ? 'Semi' : null;
              if (arqEscolhido === 'Encantador') return idx === 2 ? 'Auto' : null;
            } else if (nexLvl === 65) {
              if (arqEscolhido === 'Encantador') return idx === 0 ? 'Semi' : null;
            } else if (nexLvl === 99) {
              if (arqEscolhido === 'Encantador') return idx === 1 ? 'Semi' : null;
            }
            return null;
          })();

          return (
            <div
              key={numOpcao}
              onClick={e => e.stopPropagation()}
              className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 shadow-sm hover:border-zinc-700 transition flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-green-400">
                    Opção {numOpcao}
                  </span>
                  {badgeTag && (
                    <span
                      title={badgeTag === 'Auto' ? 'Totalmente automático — acontece sozinho' : 'Semi-automático — parte funciona automaticamente'}
                      className={`shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-wider ${badgeTag === 'Auto' ? 'bg-green-950/60 text-green-400 border border-green-800/50' : 'bg-yellow-950/60 text-yellow-400 border border-yellow-800/50'}`}
                    >
                      {badgeTag === 'Auto' ? (
                        <>
                          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z"/></svg>
                          Auto
                        </>
                      ) : (
                        <>
                          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" opacity="0.5"/><path d="M19 3v4m0 4v10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
                          Semi
                        </>
                      )}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPoderesExtras(prev => ({
                      ...prev,
                      [opcaoKey]: numOpcao
                    }));
                  }}
                  className="px-2.5 py-1 rounded bg-green-950/50 border border-green-700/60 text-green-300 hover:bg-green-900/60 hover:text-white text-[11px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  + Escolher
                </button>
              </div>
              <div
                className="max-h-48 overflow-y-auto pr-1 text-xs text-zinc-300 leading-relaxed custom-scrollbar"
                dangerouslySetInnerHTML={{ __html: formatarDescricao(opcaoTexto) }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Se for trilha vampírica com opção escolhida, substitui o bloco de opções pelo texto da opção escolhida
let textoExibicao = descHab;
if (isTrilhaVamp && nexLvl === 10 && opcaoEscolhida) {
  const intro10 = descHab.split(/•\s*Ancião:/)[0].trim();
  const regexEscolhido = new RegExp('(•\\s*' + opcaoEscolhida + ':[\\s\\S]*?)(?=(?:•\\s*(?:Ancião|Bestial|Encantador):|$))');
  const textoDoArq = (descHab.match(regexEscolhido)?.[1] || '').trim();
  textoExibicao = (intro10 + '\n\n' + textoDoArq).trim();
} else if (isTrilhaVamp && nexLvl > 10 && opcaoEscolhida) {
  const chosenIdx = Number(opcaoEscolhida) - 1;
  const textoOpcaoEscolhida = opcoesArq[chosenIdx] || '';
  const introComum = descHab.split(/•\s*(?:Ancião|Bestial|Encantador):/)[0].trim();
  const partes = [];
  if (introComum) partes.push(introComum);
  if (subintroArq) partes.push(subintroArq);
  if (textoOpcaoEscolhida) partes.push(textoOpcaoEscolhida);
  textoExibicao = partes.join('\n\n').trim();
}

return (
  <div
    className="px-3 pb-3 pt-1 text-xs text-zinc-400"
    dangerouslySetInnerHTML={{ __html: formatarDescricao(textoExibicao) }}
  />
);
})()}

                                          {isMonstruoso && nexLvl === 10 && (
                                            <div className="px-3 pb-3 pt-2 border-t border-zinc-800/80 flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                                              <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                                  Elemento Escolhido (10%):
                                                </span>
                                                {afinidadeEscolhida && (
                                                  <span className="text-[10px] text-zinc-500 italic">
                                                    (Vinculado à Afinidade: {afinidadeEscolhida})
                                                  </span>
                                                )}
                                              </div>
                                              <div className="flex flex-wrap gap-2 items-center">
                                                {(['Sangue', 'Morte', 'Conhecimento', 'Energia'] as const).map(elem => {
                                                  const isSelected = monstruosoElemento === elem;
                                                  const isDisabled = Boolean(afinidadeEscolhida && afinidadeEscolhida !== elem);
                                                  return (
                                                    <button
                                                      key={elem}
                                                      type="button"
                                                      disabled={isDisabled}
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (!afinidadeEscolhida) {
                                                          setPoderesExtras(prev => ({ ...prev, monstruoso_elemento: elem }));
                                                        }
                                                      }}
                                                      className={`px-3 py-1 rounded text-xs font-bold uppercase border transition ${
                                                        isSelected 
                                                          ? 'bg-green-950/60 border-green-600 text-green-300' 
                                                          : isDisabled
                                                            ? 'opacity-40 cursor-not-allowed bg-zinc-900 border-zinc-800 text-zinc-600'
                                                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                                      }`}
                                                    >
                                                      {elem}
                                                    </button>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          )}
                                          {isMonstruoso && (() => {
                                            const poderMonstruosoMap: Record<number, Record<string, number>> = isMonstruosoOcult
                                              ? {
                                                  10: { Sangue: 231, Morte: 232, Conhecimento: 233, Energia: 234 },
                                                  40: { Sangue: 235, Morte: 236, Conhecimento: 237, Energia: 238 },
                                                  65: { Sangue: 239, Morte: 240, Conhecimento: 241, Energia: 242 },
                                                  99: { Sangue: 243, Morte: 244, Conhecimento: 245, Energia: 246 },
                                                }
                                              : isMonstruosoEsp
                                              ? {
                                                  10: { Sangue: 215, Morte: 216, Conhecimento: 217, Energia: 218 },
                                                  40: { Sangue: 219, Morte: 220, Conhecimento: 221, Energia: 222 },
                                                  65: { Sangue: 223, Morte: 224, Conhecimento: 225, Energia: 226 },
                                                  99: { Sangue: 227, Morte: 228, Conhecimento: 229, Energia: 230 },
                                                }
                                              : {
                                                  10: { Sangue: 188, Morte: 189, Conhecimento: 190, Energia: 191 },
                                                  40: { Sangue: 192, Morte: 193, Conhecimento: 194, Energia: 195 },
                                                  65: { Sangue: 196, Morte: 197, Conhecimento: 198, Energia: 199 },
                                                  99: { Sangue: 200, Morte: 201, Conhecimento: 202, Energia: 203 },
                                                };
                                            const codPoder = poderMonstruosoMap[nexLvl]?.[monstruosoElemento];
                                            if (!codPoder) return null;
                                            const pData = listaPoderesUtilidade.find(p => p.codigo_poder === codPoder);
                                            if (!pData) return null;
                                            const badgeClasses = getBadgeElemento(monstruosoElemento);
                                            const rawPAuto = ((pData as any)['Automatico?'] || pData.Automatico || '').toString().toLowerCase().trim();
                                            const isAuto = rawPAuto === 'sim' || rawPAuto === 'auto';
                                            const isSemi = rawPAuto === 'semi';
                                            return (
                                              <div className={`mx-3 mb-3 mt-1 rounded-r border-l-2 transition-all duration-300 ${isAtivoMonst ? 'border-green-500 bg-zinc-900/80' : 'border-zinc-700 bg-zinc-900/40 opacity-60'} p-3 flex flex-col`} onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                  <div className="flex items-center gap-2 min-w-0">
                                                    <span className={`text-sm font-bold transition-colors duration-200 ${isAtivoMonst ? 'text-zinc-100' : 'text-zinc-500 line-through'}`}>{pData.Nome}</span>
                                                    {(isAuto || isSemi) && (
                                                      <span
                                                        title={isAuto ? 'Totalmente automático — acontece sozinho' : 'Semi-automático — parte funciona automaticamente'}
                                                        className={`shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-wider ${
                                                          isAuto
                                                            ? 'bg-green-950/60 text-green-400 border border-green-800/50'
                                                            : 'bg-yellow-950/60 text-yellow-400 border border-yellow-800/50'
                                                        }`}
                                                      >
                                                        {isAuto ? (
                                                          <>
                                                            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z"/></svg>
                                                            Auto
                                                          </>
                                                        ) : (
                                                          <>
                                                            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" opacity="0.5"/><path d="M19 3v4m0 4v10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
                                                            Semi
                                                          </>
                                                        )}
                                                      </span>
                                                    )}
                                                  </div>
                                                  <span className={`rounded px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider transition-all duration-200 ${badgeClasses}`}>
                                                    {monstruosoElemento}
                                                  </span>
                                                </div>
                                                <div 
                                                  className="text-xs text-zinc-300 leading-relaxed"
                                                  dangerouslySetInnerHTML={{ __html: formatarDescricao(pData.Descricao) }}
                                                />
                                                {isMonstruosoEsp && nexLvl === 10 && (
                                                  <Collapse isOpen={codPoder === 217 && isAtivoMonst && !regrasAutomaticasAtivas.has(114)}>
                                                    <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex flex-col gap-2">
                                                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                                        Perícias Escolhidas (Treinar ou +2):
                                                      </span>
                                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {[1, 2].map(slot => {
                                                          const atual = poderesExtras[`regra102_pericia_${slot}`] || '';
                                                          const outra = poderesExtras[`regra102_pericia_${slot === 1 ? 2 : 1}`] || '';
                                                          const listaNomes = Object.keys(periciasHook.pericias || {}).sort((a, b) => a.localeCompare(b, 'pt-BR'));
                                                          return (
                                                            <CustomSelect
                                                              key={slot}
                                                              value={atual}
                                                              onChange={(val) => {
                                                                if (!val) {
                                                                  setPoderesExtras(prev => {
                                                                    const n = { ...prev };
                                                                    delete n[`regra102_pericia_${slot}`];
                                                                    delete n[`regra102_jatinha_${slot}`];
                                                                    return n;
                                                                  });
                                                                  return;
                                                                }
                                                                const jaEraTreinado = (periciasHook.pericias[val]?.treino || 0) >= 5;
                                                                setPoderesExtras(prev => ({
                                                                  ...prev,
                                                                  [`regra102_pericia_${slot}`]: val,
                                                                  [`regra102_jatinha_${slot}`]: jaEraTreinado ? 'true' : 'false',
                                                                }));
                                                              }}
                                                              options={[
                                                                { value: '', label: `Perícia ${slot}...` },
                                                                ...listaNomes.map(nomeP => ({
                                                                  value: nomeP,
                                                                  label: nomeP,
                                                                  disabled: nomeP === outra
                                                                }))
                                                              ]}
                                                              wrapperClassName="w-full"
                                                              className="w-full rounded border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200"
                                                              portal
                                                            />
                                                          );
                                                        })}
                                                      </div>
                                                    </div>
                                                  </Collapse>
                                                )}
                                                {isMonstruosoEsp && nexLvl === 99 && (
                                                  <Collapse isOpen={codPoder === 229 && isAtivoMonst}>
                                                    <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex flex-col gap-2">
                                                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                                        Perícias Escolhidas (Expert ou +10):
                                                      </span>
                                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                        {[1, 2, 3].map(slot => {
                                                          const atual = poderesExtras[`regra114_pericia_${slot}`] || '';
                                                          const outras = [1, 2, 3].filter(s => s !== slot).map(s => poderesExtras[`regra114_pericia_${s}`]).filter(Boolean);
                                                          const listaNomes = Object.keys(periciasHook.pericias || {}).sort((a, b) => a.localeCompare(b, 'pt-BR'));
                                                          return (
                                                            <CustomSelect
                                                              key={slot}
                                                              value={atual}
                                                              onChange={(val) => {
                                                                if (!val) {
                                                                  setPoderesExtras(prev => {
                                                                    const n = { ...prev };
                                                                    delete n[`regra114_pericia_${slot}`];
                                                                    delete n[`regra114_jaexpert_${slot}`];
                                                                    return n;
                                                                  });
                                                                  return;
                                                                }
                                                                const jaEraExpert = (periciasHook.pericias[val]?.treino || 0) >= 15;
                                                                setPoderesExtras(prev => ({
                                                                  ...prev,
                                                                  [`regra114_pericia_${slot}`]: val,
                                                                  [`regra114_jaexpert_${slot}`]: jaEraExpert ? 'true' : 'false',
                                                                }));
                                                              }}
                                                              options={[
                                                                { value: '', label: `Perícia ${slot}...` },
                                                                ...listaNomes.map(nomeP => ({
                                                                  value: nomeP,
                                                                  label: nomeP,
                                                                  disabled: outras.includes(nomeP)
                                                                }))
                                                              ]}
                                                              wrapperClassName="w-full"
                                                              className="w-full rounded border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200"
                                                              portal
                                                            />
                                                          );
                                                        })}
                                                      </div>
                                                    </div>
                                                  </Collapse>
                                                )}
                                              </div>
                                            );
                                          })()}
                                          {t.Codigo_Trilha === 21 && nexLvl === 65 && !isVersatilidade && (
                                            <div className="px-3 pb-3 pt-1 border-t border-zinc-800/80 flex flex-col gap-1.5" onClick={e => e.stopPropagation()}>
                                              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                                Profissão do Laboratório de Campo (65%):
                                              </span>
                                              <div className="flex flex-wrap gap-2 items-center">
                                                {['Armeiro', 'Engenheiro', 'Químico'].map(prof => {
                                                  const isSelected = poderesExtras['muambeiro_profissao_65'] === prof;
                                                  return (
                                                    <button
                                                      key={prof}
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPoderesExtras(prev => ({ ...prev, muambeiro_profissao_65: prof }));
                                                      }}
                                                      className={`px-3 py-1 rounded text-xs font-bold uppercase border transition ${
                                                        isSelected 
                                                          ? 'bg-green-950/60 border-green-600 text-green-300' 
                                                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                                      }`}
                                                    >
                                                      {prof}
                                                    </button>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          )}
                                                                                   {t.Codigo_Trilha === 23 && nexLvl === 65 && !isVersatilidade && (
                                              <div className="px-3 pb-3 pt-1 border-t border-zinc-800/80 flex flex-col gap-1.5" onClick={e => e.stopPropagation()}>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                                  Opção de 65%:
                                                </span>
                                                <div className="flex flex-wrap gap-2 items-center">
                                                  <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setPoderesExtras(prev => ({ ...prev, possuido_opcao_65: 'transcender' })); }}
                                                    className={`px-3 py-1 rounded text-xs font-bold uppercase border transition ${poderesExtras['possuido_opcao_65'] === 'transcender' ? 'bg-green-950/60 border-green-600 text-green-300' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'}`}
                                                  >
                                                    TRANSCENDER
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setPoderesExtras(prev => ({ ...prev, possuido_opcao_65: 'trilha' })); }}
                                                    className={`px-3 py-1 rounded text-xs font-bold uppercase border transition ${(poderesExtras['possuido_opcao_65'] === 'trilha' || poderesExtras['possuido_opcao_65'] === 'versatilidade') ? 'bg-green-950/60 border-green-600 text-green-300' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'}`}
                                                  >
                                                    10% TRILHA (OCULTISTA)
                                                  </button>
                                                </div>
                                              </div>
                                            )}
                                            {t.Codigo_Trilha === 23 && nexLvl === 99 && afinidadeEscolhida && (
                                              <div className="px-3 pb-3 pt-1 border-t border-zinc-800/80 flex flex-col gap-1.5" onClick={e => e.stopPropagation()}>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-green-500">
                                                  Presente da Afinidade:
                                                </span>
                                                <p className="text-xs text-zinc-300">
                                                  {afinidadeEscolhida.toLowerCase() === 'sangue' && 'Poder de código 204: Presente da Obsessão (Sangue) — Uma vez por rodada, você pode gastar 6 PE para recuperar 50 PV. Quando faz isso, até o início do seu próximo turno, os bônus por treinamento em suas perícias baseadas em Força e Vigor, e em Intimidação, mudam para +35. As demais perícias baseadas em Presença mudam para –10. Você pode ativar esse poder mesmo inconsciente.'}
                                                   {afinidadeEscolhida.toLowerCase() === 'morte' && 'Poder de código 205: Presente do Tempo (Morte) — Uma vez por rodada, você pode gastar 6 PE para receber um turno adicional na última contagem de iniciativa da rodada. Você pode ativar essa habilidade mesmo inconsciente.'}
                                                   {afinidadeEscolhida.toLowerCase() === 'conhecimento' && 'Poder de código 206: Presente do Saber (Conhecimento) — Uma vez por cena, você pode gastar 6 PE para reescrever uma fração de seu próprio ser. Você recebe um poder qualquer até o fim da cena. Você deve cumprir os pré-requisitos do poder escolhido, e não pode escolher poderes de trilha de NEX 99%. A cada vez que usa este poder, você deve fazer um teste de Vontade (DT 15 + 5 para cada vez que usou este poder na mesma missão). Se falhar, perde 1d6 pontos de Sanidade para cada vez que usou esse poder nesta missão.'}
                                                   {afinidadeEscolhida.toLowerCase() === 'energia' && 'Poder de código 207: Presente do Espaço (Energia) — Uma vez por rodada, você pode gastar 6 PE para se teletransportar para outro ponto em alcance médio. Você não precisa conhecer o local para onde vai nem precisa vê-lo, mas se teletransportar-se para um espaço ocupado vai ser arremessado para o espaço disponível mais próximo.'}
                                                 </p>
                                              </div>
                                            )}
                                            {t.Codigo_Trilha === 22 && nexLvl === 40 && !isVersatilidade && (
                                             <div className="px-3 pb-3 pt-1 border-t border-zinc-800/80 flex flex-col gap-1.5" onClick={e => e.stopPropagation()}>
                                               <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                                 Benefício de Poder da Fé (40%):
                                               </span>
                                               <div className="flex flex-wrap gap-2 items-center">
                                                 <button
                                                   type="button"
                                                   onClick={(e) => {
                                                     e.stopPropagation();
                                                     setPoderesExtras(prev => ({ ...prev, exorcista_opcao_40: 'veterano' }));
                                                   }}
                                                   className={`px-3 py-1 rounded text-xs font-bold uppercase border transition ${
                                                     poderesExtras['exorcista_opcao_40'] !== 'dados'
                                                       ? 'bg-green-950/60 border-green-600 text-green-300' 
                                                       : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                                   }`}
                                                 >
                                                   Tornar Veterano (Grátis)
                                                 </button>
                                                 <button
                                                   type="button"
                                                   onClick={(e) => {
                                                     e.stopPropagation();
                                                     setPoderesExtras(prev => ({ ...prev, exorcista_opcao_40: 'dados' }));
                                                   }}
                                                   className={`px-3 py-1 rounded text-xs font-bold uppercase border transition ${
                                                     poderesExtras['exorcista_opcao_40'] === 'dados'
                                                       ? 'bg-green-950/60 border-green-600 text-green-300' 
                                                       : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                                   }`}
                                                 >
                                                   Já era Veterano (+1d20)
                                                 </button>
                                               </div>
                                             </div>
                                           )}
                                            {t.Codigo_Trilha === 32 && nexLvl === 40 && !isVersatilidade && (
                                              <div className="px-3 pb-3 pt-1 border-t border-zinc-800/80 flex flex-col gap-1.5" onClick={e => e.stopPropagation()}>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                                  Atributo para PE e DT dos Rituais (40%):
                                                </span>
                                                <div className="flex flex-wrap gap-2 items-center">
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setPoderesExtras(prev => ({ ...prev, adepto_atributo_40: 'VIG' }));
                                                    }}
                                                    className={`px-3 py-1 rounded text-xs font-bold uppercase border transition ${
                                                      poderesExtras['adepto_atributo_40'] !== 'AGI'
                                                        ? 'bg-green-950/60 border-green-600 text-green-300' 
                                                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                                    }}`}
                                                  >
                                                    Vigor (Padrão)
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setPoderesExtras(prev => ({ ...prev, adepto_atributo_40: 'AGI' }));
                                                    }}
                                                    className={`px-3 py-1 rounded text-xs font-bold uppercase border transition ${
                                                      poderesExtras['adepto_atributo_40'] === 'AGI'
                                                        ? 'bg-green-950/60 border-green-600 text-green-300' 
                                                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                                    }}`}
                                                  >
                                                    Agilidade
                                                  </button>
                                                </div>
                                              </div>
                                            )}
                                             {t.Codigo_Trilha === 43 && nexLvl === 10 && (
                                                <div className="px-3 pb-3 pt-2 border-t border-zinc-800/80 flex flex-col gap-2.5" onClick={e => e.stopPropagation()}>
                                                  <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                                      Criatura Paranormal (Patrono):
                                                    </span>
                                                    <input
                                                      type="text"
                                                      placeholder="Nome da criatura..."
                                                      value={poderesExtras['servente_criatura_nome'] || ''}
                                                      onChange={(e) => {
                                                        const val = e.target.value;
                                                        setPoderesExtras(prev => ({ ...prev, servente_criatura_nome: val }));
                                                      }}
                                                      className="w-full rounded border border-zinc-700 bg-zinc-900/90 px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-green-600 transition shadow-inner"
                                                    />
                                                  </div>
                                                  <div className="flex flex-col gap-1.5">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                                      Elemento Primário (Patrono):
                                                    </span>
                                                    <div className="flex flex-wrap gap-2 items-center">
                                                      {(['Sangue', 'Morte', 'Conhecimento', 'Energia', 'Medo'] as const).map(elem => {
                                                        const isPrimario = (poderesExtras['servente_elemento_primario'] || 'Sangue') === elem;
                                                        const estilo = isPrimario ? CORES_ELEMENTOS_BOTOES[elem].ativo : CORES_ELEMENTOS_BOTOES[elem].inativo;
                                                        return (
                                                          <button
                                                            key={elem}
                                                            type="button"
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              setPoderesExtras(prev => {
                                                                const sec = prev['servente_elemento_secundario'] === elem ? '' : prev['servente_elemento_secundario'];
                                                                return { ...prev, servente_elemento_primario: elem, servente_elemento_secundario: sec };
                                                              });
                                                            }}
                                                            className={`px-3 py-1 rounded text-xs font-bold uppercase border transition ${estilo}`}
                                                          >
                                                            {elem}
                                                          </button>
                                                        );
                                                      })}
                                                    </div>
                                                  </div>
                                                  <div className="flex flex-col gap-1.5">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                                      Elemento Secundário (Opcional):
                                                    </span>
                                                    <div className="flex flex-wrap gap-2 items-center">
                                                      <button
                                                        type="button"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setPoderesExtras(prev => ({ ...prev, servente_elemento_secundario: '' }));
                                                        }}
                                                        className={`px-3 py-1 rounded text-xs font-bold uppercase border transition ${
                                                          !poderesExtras['servente_elemento_secundario']
                                                            ? 'bg-zinc-800 border-zinc-500 text-zinc-100 font-bold'
                                                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                                                        }`}
                                                      >
                                                        Nenhum
                                                      </button>
                                                      {(['Sangue', 'Morte', 'Conhecimento', 'Energia', 'Medo'] as const).map(elem => {
                                                        const primario = poderesExtras['servente_elemento_primario'] || 'Sangue';
                                                        if (elem === primario) return null;
                                                        const isSec = poderesExtras['servente_elemento_secundario'] === elem;
                                                        const estilo = isSec ? CORES_ELEMENTOS_BOTOES[elem].ativo : CORES_ELEMENTOS_BOTOES[elem].inativo;
                                                        return (
                                                          <button
                                                            key={elem}
                                                            type="button"
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              setPoderesExtras(prev => ({ ...prev, servente_elemento_secundario: elem }));
                                                            }}
                                                            className={`px-3 py-1 rounded text-xs font-bold uppercase border transition ${estilo}`}
                                                          >
                                                            {elem}
                                                          </button>
                                                        );
                                                      })}
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                         </Collapse>
                                      </div>
                                    );
                                  })}
                                  {t.Fonte_Trilha && (
                                     <div className="mt-3 flex justify-end">
                                       <span className="text-[10px] uppercase tracking-wider text-zinc-600">Fonte: {t.Fonte_Trilha}</span>
                                     </div>
                                  )}

                                  <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-zinc-800/50">
                                    {!isVersatilidade && (
                                      <button onClick={(e) => { e.stopPropagation(); setEditandoTrilha(true); }}
                                        className="text-xs px-3 py-1.5 rounded bg-zinc-900 border border-zinc-700 hover:border-yellow-700 hover:bg-yellow-900/20 text-zinc-300 hover:text-yellow-400 transition-colors"
                                      >Editar</button>
                                    )}
                                    <button onClick={(e) => {
                                       e.stopPropagation();
                                       if (isVersatilidade) {
                                         if (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 17) {
                                           setPoderesExtras(prev => {
                                             const n = { ...prev };
                                             delete n.cacador_versatilidade_ja_tinha_sobrevivencia;
                                             return n;
                                           });
                                         }
                                         if (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 21) {
                                           setPoderesExtras(prev => {
                                             const n = { ...prev };
                                             delete n.muambeiro_versatilidade_profissao;
                                             return n;
                                           });
                                         }
                                         if (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 22) {
                                           setPoderesExtras(prev => {
                                             const n = { ...prev };
                                             delete n.exorcista_versatilidade_ja_tinha_religiao;
                                             return n;
                                           });
                                         }
                                         if (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 43) {
                                            if (trilhasHook.trilhaSelecionada?.Codigo_Trilha !== 43) {
                                              rituaisHook.atualizarRituaisAprendidos(prev => prev.filter(r => !r.origem?.startsWith('servente_')));
                                              setPoderesExtras(prev => {
                                                const n = { ...prev };
                                                delete n.servente_criatura_nome;
                                                delete n.servente_elemento_primario;
                                                delete n.servente_elemento_secundario;
                                                return n;
                                              });
                                            }
                                          }
                                          if (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 32) {
                                           if (trilhasHook.trilhaSelecionada?.Codigo_Trilha !== 32) {
                                             rituaisHook.atualizarRituaisAprendidos(prev => prev.filter(r => !r.origem?.startsWith('adepto_')));
                                             setPoderesExtras(prev => {
                                               const n = { ...prev };
                                               delete n.adepto_atributo_40;
                                               delete n.adepto_recusados;
                                               delete n.adepto_excluidos;
                                               return n;
                                             });
                                           }
                                         }
                                         if (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 48 || trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 49 || trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 50) {
                                           if (trilhasHook.trilhaSelecionada?.Codigo_Trilha !== 48 && trilhasHook.trilhaSelecionada?.Codigo_Trilha !== 49 && trilhasHook.trilhaSelecionada?.Codigo_Trilha !== 50) {
                                             setPoderesExtras(prev => {
                                               const n = { ...prev };
                                               delete n.vampiro_ja_tinha_pericia;
                                               delete n.vampiro_arquetipo;
                                               delete n.vampiro_opcao_40;
                                               delete n.vampiro_opcao_65;
                                               delete n.vampiro_opcao_99;
                                               return n;
                                             });
                                           }
                                         }
                                         if (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 18 || trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 45 || trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 47) {
                                           if (trilhasHook.trilhaSelecionada?.Codigo_Trilha !== 18 && trilhasHook.trilhaSelecionada?.Codigo_Trilha !== 45 && trilhasHook.trilhaSelecionada?.Codigo_Trilha !== 47) {
                                             setPoderesExtras(prev => {
                                               const n = { ...prev };
                                               delete n.monstruoso_ja_tinha_ocultismo;
                                               delete n.monstruoso_ocultismo_jatinha;
                                               delete n.monstruoso_elemento;
                                               delete n.monstruoso_ativo;
                                               delete n.extra_monstruoso_ocult_40;
                                               return n;
                                             });
                                             rituaisHook.atualizarRituaisAprendidos(prev => prev.filter(r => !r.origem?.startsWith('monstruoso_ocult_') && r.origem !== 'trilha_monstruoso_ocult_cicatrizacao'));
                                           }
                                         }
                                         trilhasHook.setVersatilidadeSelecionada(null);
                                       } else {
                                         if (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 18 || trilhasHook.trilhaSelecionada?.Codigo_Trilha === 45 || trilhasHook.trilhaSelecionada?.Codigo_Trilha === 47) {
                                           if (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha !== 18 && trilhasHook.versatilidadeSelecionada?.Codigo_Trilha !== 45 && trilhasHook.versatilidadeSelecionada?.Codigo_Trilha !== 47) {
                                             setPoderesExtras(prev => {
                                               const n = { ...prev };
                                               delete n.monstruoso_ja_tinha_ocultismo;
                                               delete n.monstruoso_ocultismo_jatinha;
                                               delete n.monstruoso_elemento;
                                               delete n.monstruoso_ativo;
                                               delete n.extra_monstruoso_ocult_40;
                                               return n;
                                             });
                                             rituaisHook.atualizarRituaisAprendidos(prev => prev.filter(r => !r.origem?.startsWith('monstruoso_ocult_') && r.origem !== 'trilha_monstruoso_ocult_cicatrizacao'));
                                           }
                                         }
                                         if (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 17) {
                                           setPoderesExtras(prev => {
                                             const n = { ...prev };
                                             delete n.cacador_ja_tinha_sobrevivencia;
                                             return n;
                                           });
                                         }
                                         if (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 21) {
                                           setPoderesExtras(prev => {
                                             const n = { ...prev };
                                             delete n.muambeiro_profissao_10;
                                             delete n.muambeiro_profissao_65;
                                             return n;
                                           });
                                         }
                                         if (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 22) {
                                           setPoderesExtras(prev => {
                                             const n = { ...prev };
                                             delete n.exorcista_ja_tinha_religiao;
                                             delete n.exorcista_opcao_40;
                                             return n;
                                           });
                                         }
                                         if (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 43) {
                                            if (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha !== 43) {
                                              rituaisHook.atualizarRituaisAprendidos(prev => prev.filter(r => !r.origem?.startsWith('servente_')));
                                              setPoderesExtras(prev => {
                                                const n = { ...prev };
                                                delete n.servente_criatura_nome;
                                                delete n.servente_elemento_primario;
                                                delete n.servente_elemento_secundario;
                                                return n;
                                              });
                                            }
                                          }
                                          if (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 32) {
                                           if (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha !== 32) {
                                             rituaisHook.atualizarRituaisAprendidos(prev => prev.filter(r => !r.origem?.startsWith('adepto_')));
                                             setPoderesExtras(prev => {
                                               const n = { ...prev };
                                               delete n.adepto_atributo_40;
                                               delete n.adepto_recusados;
                                               delete n.adepto_excluidos;
                                               return n;
                                             });
                                           }
                                         }
                                         if (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 48 || trilhasHook.trilhaSelecionada?.Codigo_Trilha === 49 || trilhasHook.trilhaSelecionada?.Codigo_Trilha === 50) {
                                           if (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha !== 48 && trilhasHook.versatilidadeSelecionada?.Codigo_Trilha !== 49 && trilhasHook.versatilidadeSelecionada?.Codigo_Trilha !== 50) {
                                             setPoderesExtras(prev => {
                                               const n = { ...prev };
                                               delete n.vampiro_ja_tinha_pericia;
                                               delete n.vampiro_arquetipo;
                                               delete n.vampiro_opcao_40;
                                               delete n.vampiro_opcao_65;
                                               delete n.vampiro_opcao_99;
                                               return n;
                                             });
                                           }
                                         }
                                         trilhasHook.setTrilhaSelecionada(null);
                                       }
                                     }}
                                       className="text-xs text-green-500 hover:text-green-400 bg-green-950/30 hover:bg-green-900/50 px-3 py-1.5 rounded border border-green-900/50 transition-colors"
                                     >Remover</button>
                                  </div>
                                </div>
                              </Collapse>
                            </div>
                          );
                        }

                        let corBordaLeft = 'border-l-green-800';
                        if (hab.categoria === 'paranormais' && hab.elemento) {
                          const elStr = hab.elemento.toLowerCase();
                          corBordaLeft = elStr.includes('medo') ? 'border-l-zinc-200' :
                                         elStr.includes('sangue') ? 'border-l-red-600' :
                                         elStr.includes('morte') ? 'border-l-black' :
                                         elStr.includes('conhecimento') ? 'border-l-yellow-600' :
                                         elStr.includes('energia') ? 'border-l-purple-600' : 
                                         (elStr.includes('varia') || elStr.includes('vária')) ? 'border-l-green-600' : 'border-l-zinc-600';
                        }

                        return (
                          <div key={hab.id}
                            className={`overflow-hidden rounded-r border-l-4 bg-zinc-900/50 ${corBordaLeft}`}
                          >
                            <div onClick={() => {
                              setHabilidadesExpandidas(prev =>
                                prev.includes(hab.id) ? prev.filter(id => id !== hab.id) : [...prev, hab.id]
                              );
                            }}
                              className="flex cursor-pointer justify-between gap-3 relative bg-zinc-800/40 px-4 py-3 transition hover:bg-zinc-700/50"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <span className="text-sm font-bold truncate text-zinc-100">{hab.nome}</span>
                                {hab.extra && <span className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-xs font-bold text-amber-400 shrink-0">{hab.extra}</span>}
                                
                              </div>
                              <div className="flex items-center gap-2.5">
                                {hab.elemento && (
                                  <span className={`rounded px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${getBadgeElemento(hab.elemento)}`}>
                                    {hab.elemento}
                                  </span>
                                )}
                                <span className="rounded border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[0.65rem] uppercase tracking-wider text-zinc-500">{hab.tipo}</span>
                                <span className="text-xs text-zinc-600">{estaExpandida ? '▲' : '▼'}</span>
                              </div>
                            </div>

                            <Collapse isOpen={estaExpandida}>
                              <div className="px-4 py-4 text-left text-sm leading-relaxed text-zinc-400">
                                {(() => {
                                  const rawHabAuto = (hab.automatico || '').toString().toLowerCase().trim();
                                  const isHabAuto = rawHabAuto === 'sim' || rawHabAuto === 'auto';
                                  const isHabSemi = rawHabAuto === 'semi';
                                  if (!isHabAuto && !isHabSemi) return null;
                                  return (
                                    <div className="mb-3 flex items-center justify-between gap-2 border-b border-zinc-800/50 pb-2">
                                      <div className="flex items-center gap-2">
                                        <span
                                          title={isHabAuto ? 'Totalmente automático' : 'Semi-automático'}
                                          className={`shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-wider ${
                                            isHabAuto
                                              ? 'bg-green-950/60 text-green-400 border border-green-800/50'
                                              : 'bg-yellow-950/60 text-yellow-400 border border-yellow-800/50'
                                          }`}
                                        >
                                          {isHabAuto ? (
                                            <>
                                              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z"/></svg>
                                              Auto
                                            </>
                                          ) : (
                                            <>
                                              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" opacity="0.5"/><path d="M19 3v4m0 4v10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
                                              Semi
                                            </>
                                          )}
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-zinc-500 italic">
                                        {isHabAuto 
                                          ? 'Os bônus deste poder já estão aplicados na sua ficha.' 
                                          : 'Uma parte deste poder é aplicada automaticamente na sua ficha, e a outra não.'}
                                      </span>
                                    </div>
                                  );
                                })()}
                                <div dangerouslySetInnerHTML={{ __html: formatarDescricao(
                                  (hab.nome?.toLowerCase() === 'criar selo' && temCriptologista10)
                                    ? `${hab.descricao}<br/><br/><strong class="text-green-400">❖ Método Intuitivo${temDobroCriarSelo ? ' Aprimorado' : ''}:</strong> você pode fabricar ${selosPorInterludio} selo(s) em uma ação de interlúdio e ter um máximo de ${temDobroCriarSelo ? atributosFinais.PRE * 2 : atributosFinais.PRE} selo(s) ativos simultâneos${temDobroCriarSelo ? ' (Presença × 2)' : ' (Presença)'}.`
                                    : (hab.nome?.toLowerCase() === 'tatuagem ritualística' && temMonstruosoOcult40)
                                      ? `${hab.descricao}<br/><br/><strong class="text-green-400">❖ Ser Perfurado (40%):</strong> Diferente do normal, este poder também se aplica a todos os rituais de ${monstruosoElemento} marcados em sua pele, não apenas aos de alcance pessoal que têm você como alvo.${temMonstruosoOcult65 ? `<br/><br/><strong class="text-green-400">❖ Ser Rasgado (65%):</strong> a DT dos rituais de ${monstruosoElemento} marcados na pele tem sua DT aumentada em +2.` : ''}${temMonstruosoOcult99 ? `<br/><br/><strong class="text-green-400">❖ Ser Mutilado (99%):</strong> você pode conjurar rituais de ${monstruosoElemento} marcados na pele sem a necessidade de fala, gestos e componentes.` : ''}`
                                      : hab.descricao
                                ) }} />

                                {/* Regra 102: escolha 2 perícias para treinar (ou +2 se já treinado) */}
                                {hab.codigoRegra === 102 && !regrasAutomaticasAtivas.has(114) && (
                                  <div className="mt-3 pt-3 border-t border-zinc-800/80 flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                      Perícias Escolhidas (Treinar ou +2):
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {[1, 2].map(slot => {
                                        const atual = poderesExtras[`regra102_pericia_${slot}`] || '';
                                        const outra = poderesExtras[`regra102_pericia_${slot === 1 ? 2 : 1}`] || '';
                                        const listaNomes = Object.keys(periciasHook.pericias || {}).sort((a, b) => a.localeCompare(b, 'pt-BR'));
                                        return (
                                          <CustomSelect
                                            key={slot}
                                            value={atual}
                                            onChange={(val) => {
                                              if (!val) {
                                                setPoderesExtras(prev => {
                                                  const n = { ...prev };
                                                  delete n[`regra102_pericia_${slot}`];
                                                  delete n[`regra102_jatinha_${slot}`];
                                                  return n;
                                                });
                                                return;
                                              }
                                              const jaEraTreinado = (periciasHook.pericias[val]?.treino || 0) >= 5;
                                              setPoderesExtras(prev => ({
                                                ...prev,
                                                [`regra102_pericia_${slot}`]: val,
                                                [`regra102_jatinha_${slot}`]: jaEraTreinado ? 'true' : 'false',
                                              }));
                                            }}
                                            options={[
                                              { value: '', label: `Perícia ${slot}...` },
                                              ...listaNomes.map(nomeP => ({
                                                value: nomeP,
                                                label: nomeP,
                                                disabled: nomeP === outra
                                              }))
                                            ]}
                                            wrapperClassName="w-full"
                                            className="w-full rounded border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200"
                                            portal
                                          />
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Regra 114: escolha 3 perícias para se tornar Expert (ou +10 se já Expert) */}
                                {hab.codigoRegra === 114 && (
                                  <div className="mt-3 pt-3 border-t border-zinc-800/80 flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                      Perícias Escolhidas (Expert ou +10):
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                      {[1, 2, 3].map(slot => {
                                        const atual = poderesExtras[`regra114_pericia_${slot}`] || '';
                                        const outras = [1, 2, 3].filter(s => s !== slot).map(s => poderesExtras[`regra114_pericia_${s}`]).filter(Boolean);
                                        const listaNomes = Object.keys(periciasHook.pericias || {}).sort((a, b) => a.localeCompare(b, 'pt-BR'));
                                        return (
                                          <CustomSelect
                                            key={slot}
                                            value={atual}
                                            onChange={(val) => {
                                              if (!val) {
                                                setPoderesExtras(prev => {
                                                  const n = { ...prev };
                                                  delete n[`regra114_pericia_${slot}`];
                                                  delete n[`regra114_jaexpert_${slot}`];
                                                  return n;
                                                });
                                                return;
                                              }
                                              const jaEraExpert = (periciasHook.pericias[val]?.treino || 0) >= 15;
                                              setPoderesExtras(prev => ({
                                                ...prev,
                                                [`regra114_pericia_${slot}`]: val,
                                                [`regra114_jaexpert_${slot}`]: jaEraExpert ? 'true' : 'false',
                                              }));
                                            }}
                                            options={[
                                              { value: '', label: `Perícia ${slot}...` },
                                              ...listaNomes.map(nomeP => ({
                                                value: nomeP,
                                                label: nomeP,
                                                disabled: outras.includes(nomeP)
                                              }))
                                            ]}
                                            wrapperClassName="w-full"
                                            className="w-full rounded border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200"
                                            portal
                                          />
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* 🔥 Afinidade: texto puro */}
                                {hab.afinidade && (
                                  <div className={`mt-2 text-sm leading-relaxed transition-opacity duration-300 ${hab.afinidadeAtiva ? 'text-zinc-300 opacity-100' : 'text-zinc-500 opacity-40'}`}>
                                    {hab.afinidadeAtiva && hab.afinidadeAdquiridaKey && (
                                      <div className="flex justify-end mb-2">
                                        <span className="text-[0.65rem] uppercase tracking-widest text-zinc-500 font-semibold bg-zinc-800/50 px-2 py-0.5 rounded">
                                          {String(hab.afinidadeAdquiridaKey).startsWith('extra_dedo_decepado') ? 'DEDO DECEPADO' : (String(hab.afinidadeAdquiridaKey).startsWith('extra_') ? 'Transcender Extra' : (
                                            (parseInt(String(hab.afinidadeAdquiridaKey), 10) >= 1000) ? 
                                            `Transcender ${parseInt(String(hab.afinidadeAdquiridaKey), 10) - 1000}%` :
                                            `Transcender ${parseInt(String(hab.afinidadeAdquiridaKey), 10)}%`
                                          ))}
                                        </span>
                                      </div>
                                    )}
                                    <p>
                                      <strong className={hab.afinidadeAtiva ? 'text-zinc-100' : 'text-zinc-400'}>Afinidade:</strong> {hab.afinidade}
                                    </p>
                                    {hab.afinidadeAtiva && hab.afinidadeAdquiridaKey && (
                                      <div className="mt-2 flex justify-end">
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            poderesHook.removerPoder(hab.afinidadeAdquiridaKey as number | string);
                                          }}
                                          className="text-[10px] font-bold uppercase tracking-wider text-green-500/70 transition hover:text-green-400"
                                        >
                                          Remover
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="mt-3 text-[0.6rem] uppercase tracking-wider text-zinc-600">Fonte: {hab.fonte || 'NÃO DEFINIDA'}</div>

                                {hab.subPoder && (
                                  <div className="mt-4 rounded-r border-l-2 border-amber-500 bg-zinc-900/80 p-3">
                                    <div className="mb-1.5 flex items-center justify-between">
                                      <span className="text-sm font-bold text-zinc-100">{hab.subPoder.nome}</span>
                                      {hab.subPoder.extra && <span className="rounded border border-zinc-700 bg-zinc-950 px-1.5 py-0.5 text-xs font-bold text-amber-400">{hab.subPoder.extra}</span>}
                                    </div>
                                    <div className="text-xs text-zinc-400">{hab.subPoder.descricao}</div>
                                  </div>
                                )}

                                {hab.limiteCirculos && (
                                  <div className="mt-4 rounded-r border-l-2 border-zinc-400 bg-zinc-900/80 p-3">
                                    <div className="mb-2 text-sm font-bold text-zinc-100">Rituais:</div>
                                    <div className="flex flex-wrap gap-2">
                                      {([['1° Círculo', hab.limiteCirculos.c1], ['2° Círculo', hab.limiteCirculos.c2], ['3° Círculo', hab.limiteCirculos.c3], ['4° Círculo', hab.limiteCirculos.c4]] as const).map(([r,q]) => (
                                        <span key={r} className={`rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs ${q > 0 ? 'text-zinc-100' : 'text-zinc-600'}`}>{r}: <strong>{q}</strong></span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {hab.preRequisitos && (
                                  <div className="mt-3 inline-block rounded bg-amber-400/5 px-2.5 py-1.5 text-xs italic text-amber-400">
                                    <strong>Pré-requisitos:</strong> {hab.preRequisitos}
                                  </div>
                                )}

                                {(!hab.isSlotVazio && (hab.id.startsWith('escolha_nex_') || hab.id.startsWith('escolha_extra_') || hab.id === 'extra_regra32' || hab.id === 'escolha_extra_possuido_trilha_65')) && (
                                  <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-zinc-800/50">
                                    <button onClick={(e) => { e.stopPropagation(); const nivel = extrairKeyDoId(hab.id); if (nivel !== null) { setNexPoderEditando(nivel); setNomeEditando(hab.nome); setDescricaoEditando(hab.descricao); setAfinidadeEditando(hab.afinidade || ''); } }}
                                      className="text-xs px-3 py-1.5 rounded bg-zinc-900 border border-zinc-700 hover:border-yellow-700 hover:bg-yellow-900/20 text-zinc-300 hover:text-yellow-400 transition-colors"
                                    >Editar</button>
                                    <button onClick={(e) => { 
                                      e.stopPropagation(); 
                                      const nivel = extrairKeyDoId(hab.id); 
                                      if (nivel !== null) {
                                        const escolhido = poderesEscolhidos[nivel as any];
                                        if (escolhido) {
                                          const nomePoder = escolhido.nome.toLowerCase();
                                          const isResistir = nomePoder.startsWith('resistir a ');
                                          const baseName = nomePoder.startsWith('aprender ritual (') ? 'aprender ritual' : (isResistir ? 'resistir a <elemento>' : nomePoder);
                                          const isParanormal = poderesParanormaisMap.has(baseName) || baseName === 'aprender ritual';
                                          
                                          // A penalidade de sanidade é atualizada automaticamente pelo useStatus

                                          if (baseName === 'aprender ritual') {
                                            const ra = rituaisHook.rituaisAprendidos.find(r => r.origem === `poder_57_${nivel}` || r.origem === `poder_57_combate_${nivel}`);
                                            if (ra) rituaisHook.esquecerRitual(ra.origem);
                                          }
                                        }
                                        removerPoder(nivel); 
                                      }
                                    }}
                                      className="text-xs text-green-500 hover:text-green-400 bg-green-950/30 hover:bg-green-900/50 px-3 py-1.5 rounded border border-green-900/50 transition-colors"
                                    >Remover</button>
                                  </div>
                                )}
                              </div>
                            </Collapse>
                          </div>
                        );
                        }; // Fim renderHab

                        if (categoria === 'paranormais') {
                          const grouped = itensDaCategoria.reduce((acc, hab) => {
                             const el = hab.isSlotVazio ? 'Disponível' : (hab.elemento || 'Sem Elemento');
                             if (!acc[el]) acc[el] = [];
                             acc[el].push(hab);
                             return acc;
                          }, {} as Record<string, typeof itensDaCategoria>);
                          
                          const order = ['Sangue', 'Morte', 'Conhecimento', 'Energia', 'Medo', 'Sem Elemento', 'Disponível'];
                          const getOrder = (e: string) => {
                             for (let i=0; i<order.length; i++) {
                               if (e.toLowerCase().includes(order[i].toLowerCase())) return i;
                             }
                             return 99;
                          };
                          const sortedKeys = Object.keys(grouped).sort((a,b) => getOrder(a) - getOrder(b));

                          return sortedKeys.map(el => (
                            <div key={el} className="flex flex-col gap-2.5">
                              <div className={`flex items-center gap-3 ${el !== sortedKeys[0] ? 'mt-3 mb-1' : 'mb-1'}`}>
                                <span className="h-2 w-2 rounded-full" style={{ background: el === 'Sem Elemento' || el === 'Disponível' ? '#52525b' : obterCorBadge(el) }}></span>
                                <span className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-zinc-500">{el}</span>
                                <div className="flex-1 border-t border-zinc-800/50" />
                              </div>
                              {grouped[el].map(hab => renderHab(hab))}
                            </div>
                          ));
                        }

                        return itensDaCategoria.map(hab => renderHab(hab));
                      })()}
                    </div>
                  </div>
                );
              })}

              {habilidadesFiltradas.length === 0 && (
                <div className="mt-5 text-center italic text-zinc-600">Nenhuma habilidade encontrada.</div>
              )}
              {regras['nex_experiencia'] && (
                <div className="mt-4 border-t border-zinc-800 pt-4">
                  <ProgressaoNEXPanel />
                </div>
              )}
            </div>
          </div>
        )}

        {abaDireita === 'rituais' && (() => {
          // 1. Calcular slots vazios de Poder "Aprender Ritual"
          const slotsPoderPendentesRaw = Object.entries(poderesEscolhidos)
            .filter(([nexStr, poder]) => poder.nome.trim().toLowerCase() === 'aprender ritual')
            .map(([nexStr]) => nexStr);
            
          // Filtra os que já foram pegos
          const slotsPoderPendentesList = [];
          for (const chave of slotsPoderPendentesRaw) {
             const pego = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === `poder_57_${chave}`);
             if (!pego) {
                const isExtra = chave.startsWith('extra_');
                const nivelNum = isExtra ? effectiveNex : parseInt(chave, 10);
                let c = 1;
                if (nivelNum >= 85) c = 4;
                else if (nivelNum >= 55) c = 3;
                else if (nivelNum >= 25) c = 2;
                slotsPoderPendentesList.push({ chave, isExtra, nex: nivelNum, maxCirculo: c, isOcultista: false });
             }
          }

          // 2. Calcular slots vazios de Ocultista
          const slotsOcultistaPendentesList: { index: number, nex: number, maxCirculo: number, isOcultista: boolean }[] = [];
          if (classe === 'Ocultista') {
            const todosSlots: { index: number, nex: number, maxCirculo: number }[] = [];
            if (nivel >= 1) {
              todosSlots.push({ index: 1, nex: 5, maxCirculo: 1 });
              todosSlots.push({ index: 2, nex: 5, maxCirculo: 1 });
              todosSlots.push({ index: 3, nex: 5, maxCirculo: 1 });
            }
            for (let lvl = 2; lvl <= nivel; lvl++) {
              let c = 1;
              if (lvl >= 17) c = 4;
              else if (lvl >= 11) c = 3;
              else if (lvl >= 5) c = 2;
              const nexEquiv = lvl === 20 ? 99 : lvl * 5;
              todosSlots.push({ index: todosSlots.length + 1, nex: nexEquiv, maxCirculo: c });
            }
            
            // Filtra os que já foram pegos
            for (const slot of todosSlots) {
              const pego = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === `ocultista_${slot.index}`);
              if (!pego) {
                slotsOcultistaPendentesList.push({ ...slot, isOcultista: true });
              }
            }
          }

          // 2.5 Calcular slot de Origem/Poder (Regra 16)
          const slotsOrigemPendentesList: { chave?: string, index: number, nex: number, maxCirculo: number, isOcultista: boolean, isOrigem?: boolean }[] = [];
          if (regrasAutomaticasAtivas.has(16)) {
            const pego = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'origem_16');
            if (!pego) {
              slotsOrigemPendentesList.push({ chave: 'origem_16', index: 999, nex: 0, maxCirculo: 1, isOcultista: false, isOrigem: true });
            }
          }

          // 2.6 Calcular slots de Regra 61
          const slotsRegra61PendentesList: { chave?: string, index: number, nex: number, maxCirculo: number, isOcultista: boolean, isRegra61?: boolean }[] = [];
          if (regrasAutomaticasAtivas.has(61)) {
            const oc = periciasHook.pericias['Ocultismo'];
            if (oc && oc.treino > 0) {
              const pego1 = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'regra_61_1');
              if (!pego1) slotsRegra61PendentesList.push({ chave: 'regra_61_1', index: 901, nex: effectiveNex, maxCirculo: 1, isOcultista: false, isRegra61: true });
              
              if (oc.treino >= 10) {
                const pego2 = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'regra_61_2');
                if (!pego2) slotsRegra61PendentesList.push({ chave: 'regra_61_2', index: 902, nex: effectiveNex, maxCirculo: 2, isOcultista: false, isRegra61: true });
              }
              
              if (oc.treino >= 15) {
                const pego3 = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'regra_61_3');
                if (!pego3) slotsRegra61PendentesList.push({ chave: 'regra_61_3', index: 903, nex: effectiveNex, maxCirculo: 3, isOcultista: false, isRegra61: true });
              }
            }
          }

          // 2.7 Calcular slots de Regra 62
          const slotsRegra62PendentesList: { chave?: string, index: number, nex: number, maxCirculo: number, isOcultista: boolean, isRegra62?: boolean }[] = [];
          if (regrasAutomaticasAtivas.has(62)) {
            const int = atributos['INT'] || 0;
            if (int > 0) {
              let maxC = 1;
              if (rituaisHook.rituaisAprendidos) {
                for (const r of rituaisHook.rituaisAprendidos) {
                  const base = rituaisHook.rituais.find(br => br.Codigo_Ritual === r.codigo_ritual);
                  if (base && base.Circulo_Ritual > maxC) maxC = base.Circulo_Ritual;
                }
              }
              for (let i = 1; i <= int; i++) {
                const pego = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === `regra_62_${i}`);
                if (!pego) slotsRegra62PendentesList.push({ chave: `regra_62_${i}`, index: 910 + i, nex: effectiveNex, maxCirculo: maxC, isOcultista: false, isRegra62: true });
              }
            }
          }

          // 2.8 Calcular slots de Graduado (Trilha 13)
          const slotsGraduadoPendentesList: { chave?: string, index: number, nex: number, maxCirculo: number, isOcultista: boolean, isGraduado?: boolean }[] = [];
          
          // Saber Ampliado (10%): 1 ritual de 1º círculo + 1 ritual a cada novo círculo que desbloqueia (2º, 3º, 4º)
          const isGraduado10 = (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 13 && (regras['nex_experiencia'] ? nivel >= 2 : effectiveNex >= 10)) || (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 13 && (regras['nex_experiencia'] ? nivel >= 10 : effectiveNex >= 50));
          if (isGraduado10) {
            // 1º Círculo (10%)
            const pego1 = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'graduado_10_1' || r.origem === 'graduado_10_c');
            if (!pego1) slotsGraduadoPendentesList.push({ chave: 'graduado_10_1', index: 951, nex: 10, maxCirculo: 1, isOcultista: true, isGraduado: true });

            // 2º Círculo (25% / Nível 5)
            if (regras['nex_experiencia'] ? nivel >= 5 : effectiveNex >= 25) {
              const pego2 = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'graduado_10_2');
              if (!pego2) slotsGraduadoPendentesList.push({ chave: 'graduado_10_2', index: 952, nex: 25, maxCirculo: 2, isOcultista: true, isGraduado: true });
            }

            // 3º Círculo (55% / Nível 11)
            if (regras['nex_experiencia'] ? nivel >= 11 : effectiveNex >= 55) {
              const pego3 = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'graduado_10_3');
              if (!pego3) slotsGraduadoPendentesList.push({ chave: 'graduado_10_3', index: 953, nex: 55, maxCirculo: 3, isOcultista: true, isGraduado: true });
            }

            // 4º Círculo (85% / Nível 17)
            if (regras['nex_experiencia'] ? nivel >= 17 : effectiveNex >= 85) {
              const pego4 = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'graduado_10_4');
              if (!pego4) slotsGraduadoPendentesList.push({ chave: 'graduado_10_4', index: 954, nex: 85, maxCirculo: 4, isOcultista: true, isGraduado: true });
            }
          }

          // Grimório Ritualístico (40%): INT rituais de 1º ou 2º círculos + 1 ritual a cada novo círculo (3º e 4º)
          const isGraduado40 = (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 13 && (regras['nex_experiencia'] ? nivel >= 8 : effectiveNex >= 40));
          if (isGraduado40) {
            const intVal = (atributosFinais?.INT !== undefined ? atributosFinais.INT : (atributos?.INT || 0));
            // Slots base: INT rituais de 1º ou 2º círculos
            if (intVal > 0) {
              for (let i = 1; i <= intVal; i++) {
                const pego = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === `graduado_40_${i}` || r.origem === `graduado_40_base_${i}`);
                if (!pego) {
                  slotsGraduadoPendentesList.push({ chave: `graduado_40_${i}`, index: 960 + i, nex: 40, maxCirculo: 2, isOcultista: true, isGraduado: true });
                }
              }
            }

            // +1 ritual de 3º círculo (55% / Nível 11)
            if (regras['nex_experiencia'] ? nivel >= 11 : effectiveNex >= 55) {
              const pegoC3 = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'graduado_40_c3');
              if (!pegoC3) {
                slotsGraduadoPendentesList.push({ chave: 'graduado_40_c3', index: 980, nex: 55, maxCirculo: 3, isOcultista: true, isGraduado: true });
              }
            }

            // +1 ritual de 4º círculo (85% / Nível 17)
            if (regras['nex_experiencia'] ? nivel >= 17 : effectiveNex >= 85) {
              const pegoC4 = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'graduado_40_c4');
              if (!pegoC4) {
                slotsGraduadoPendentesList.push({ chave: 'graduado_40_c4', index: 981, nex: 85, maxCirculo: 4, isOcultista: true, isGraduado: true });
              }
            }
          }

          // 2.9 Calcular slots de Adepto ao Oculto (Trilha 32)
          const slotsAdeptoPendentesList: { chave?: string, index: number, nex: number, maxCirculo: number, isOcultista: boolean, isAdepto?: boolean, isRecusado?: boolean }[] = [];
          if (temAdepto10) {
            const adeptoRecusados = (poderesExtras['adepto_recusados'] || '').split(',').map(s => s.trim()).filter(Boolean);
            const adeptoExcluidos = (poderesExtras['adepto_excluidos'] || '').split(',').map(s => s.trim()).filter(Boolean);
            const isVersatilidade32 = trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 32;
            const patamaresDisponiveis = isVersatilidade32 ? [55, 65, 75, 85, 95] : [15, 25, 35, 45, 55, 65, 75, 85, 95];
            
            patamaresDisponiveis.forEach(patamar => {
              if (effectiveNex >= patamar) {
                const chave = `adepto_${patamar}`;
                const jaAprendeu = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === chave);
                const excluido = adeptoExcluidos.includes(String(patamar));
                if (!jaAprendeu && !excluido) {
                  const nivelDoPatamar = calcularNivel(patamar);
                  let maxC = 1;
                  for (let c = 3; c >= 1; c--) {
                    if (verificarAcessoCirculo(c, nivelDoPatamar, classe).atende) {
                      maxC = c;
                      break;
                    }
                  }
                  const recusado = adeptoRecusados.includes(String(patamar));
                  slotsAdeptoPendentesList.push({
                    chave,
                    index: 1000 + patamar,
                    nex: patamar,
                    maxCirculo: maxC,
                    isOcultista: false,
                    isAdepto: true,
                    isRecusado: recusado
                  });
                }
              }
            });

            if (temAdepto99) {
              const chave99 = 'adepto_99';
              const jaAprendeu99 = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === chave99);
              if (!jaAprendeu99) {
                slotsAdeptoPendentesList.push({
                  chave: chave99,
                  index: 1099,
                  nex: 99,
                  maxCirculo: 4,
                  isOcultista: false,
                  isAdepto: true,
                  isRecusado: false
                });
              }
            }
          }

          // 3. Desbloqueio Cronológico por Círculo
          // Slots Trilha Servente (Trilha 43)
          const slotsServentePendentesList: any[] = [];
          if (temServente10) {
            // 10%: Dois slots de 1° círculo do elemento primário da criatura
            [1, 2].forEach(slotIdx => {
              const chave = `servente_10_${slotIdx}`;
              const jaAprendeu = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === chave);
              if (!jaAprendeu) {
                slotsServentePendentesList.push({
                  chave,
                  index: 4010 + slotIdx,
                  nex: 10,
                  circuloFixo: 1,
                  maxCirculo: 1,
                  isOcultista: false,
                  isServente: true,
                  elementoFiltro: serventeElementoPrimario,
                  labelDesc: `Ato de Devoção (1º Círculo - ${serventeElementoPrimario})`
                });
              }
            });

            // 40%: Mais um slot de ritual de qualquer círculo conhecido
            if (temServente40) {
              const chave = 'servente_40';
              const jaAprendeu = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === chave);
              if (!jaAprendeu) {
                const maxC = effectiveNex >= 85 ? 4 : (effectiveNex >= 55 ? 3 : 2);
                slotsServentePendentesList.push({
                  chave,
                  index: 4040,
                  nex: 40,
                  maxCirculo: maxC,
                  isOcultista: false,
                  isServente: true,
                  labelDesc: `Ajuda Macabra (Até ${maxC}º Círculo)`
                });
              }
            }

            // 65%: Mais um slot de ritual de qualquer círculo conhecido
            if (temServente65) {
              const chave = 'servente_65';
              const jaAprendeu = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === chave);
              if (!jaAprendeu) {
                const maxC = effectiveNex >= 85 ? 4 : 3;
                slotsServentePendentesList.push({
                  chave,
                  index: 4065,
                  nex: 65,
                  maxCirculo: maxC,
                  isOcultista: false,
                  isServente: true,
                  labelDesc: `Poder Compartilhado (Até ${maxC}º Círculo)`
                });
              }
            }

            // 99%: Mais um slot de ritual de qualquer círculo conhecido
            if (temServente99) {
              const chave = 'servente_99';
              const jaAprendeu = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === chave);
              if (!jaAprendeu) {
                slotsServentePendentesList.push({
                  chave,
                  index: 4099,
                  nex: 99,
                  maxCirculo: 4,
                  isOcultista: false,
                  isServente: true,
                  labelDesc: 'Encarnação Terrível (Até 4º Círculo)'
                });
              }
            }
          }

          const slotsMonstruosoPendentesList: any[] = [];
          if (temMonstruoso99 && monstruosoElemento === 'Conhecimento') {
            const chaveMonstruoso = 'monstruoso_99_conhecimento';
            const jaAprendeuMonstruoso = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === chaveMonstruoso);
            if (!jaAprendeuMonstruoso) {
              slotsMonstruosoPendentesList.push({
                chave: chaveMonstruoso,
                index: 2099,
                nex: 99,
                maxCirculo: 4,
                isOcultista: false,
                isMonstruoso: true,
              });
            }
          }
          if (temMonstruosoOcult99) {
            const chaveMonstOcult = `monstruoso_ocult_99_${monstruosoElemento.toLowerCase()}`;
            const jaAprendeuOcult99 = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === chaveMonstOcult);
            if (!jaAprendeuOcult99) {
              slotsMonstruosoPendentesList.push({
                chave: chaveMonstOcult,
                index: 3099,
                nex: 99,
                maxCirculo: 4,
                isOcultista: false,
                isMonstruosoOcult: true,
                elementoFiltro: monstruosoElemento,
              });
            }
          }

          const allRitualSlots = [...slotsPoderPendentesList, ...slotsOcultistaPendentesList, ...slotsOrigemPendentesList, ...slotsRegra61PendentesList, ...slotsRegra62PendentesList, ...slotsGraduadoPendentesList, ...slotsAdeptoPendentesList, ...slotsMonstruosoPendentesList, ...slotsServentePendentesList];
          const sortedSlots = allRitualSlots.sort((a, b) => {
             if (a.nex !== b.nex) return a.nex - b.nex;
             if (a.isOcultista && !b.isOcultista) return -1;
             if (!a.isOcultista && b.isOcultista) return 1;
             if (a.isOcultista && b.isOcultista) return (a as any).index - (b as any).index;
             return 0;
          });

          const visibleRitualSlots = [];
          const circlesSeen = new Set<number>();
          const slotsParaSubAba = sortedSlots.filter(s => {
             const isGrimorio = (s as any).chave?.startsWith('graduado_40');
             return subAbaRituais === 'grimorio' ? isGrimorio : !isGrimorio;
          });
          for (const slot of slotsParaSubAba) {
             if ((slot as any).isAdepto || (slot as any).isMonstruoso || (slot as any).isMonstruosoOcult) {
                visibleRitualSlots.push(slot);
             } else if (!circlesSeen.has(slot.maxCirculo)) {
                visibleRitualSlots.push(slot);
                circlesSeen.add(slot.maxCirculo);
             }
          }

          const slotsPoderPendentes = visibleRitualSlots.filter(s => !s.isOcultista).map(s => (s as any).chave);
          const slotsOcultistaPendentesFinal = visibleRitualSlots.filter(s => s.isOcultista).map(s => ({ index: (s as any).index, nex: s.nex, maxCirculo: s.maxCirculo }));

          const hasEmptySlots = slotsPoderPendentes.length > 0 || slotsOcultistaPendentesFinal.length > 0;
          const hasAnyRitual = (rituaisHook.rituaisAprendidos && rituaisHook.rituaisAprendidos.length > 0) || hasEmptySlots;

          return (
            <div className="flex flex-1 min-h-0 flex-col">
              <div className="mb-5 flex items-center justify-between gap-4">
                <span className="text-sm font-bold text-zinc-400">Rituais Aprendidos ({rituaisHook.rituaisAprendidos?.length || 0})</span>
              </div>

              {(isGraduado40 || (rituaisHook.rituaisAprendidos || []).some(r => r.origem?.startsWith('graduado_40'))) && (
                <div className="mb-4 flex flex-nowrap overflow-x-auto gap-x-1 border-b border-zinc-800 custom-scrollbar pb-1">
                  <button
                    onClick={() => setSubAbaRituais('rituais')}
                    className={`shrink-0 px-3 py-2 text-[10px] md:text-[11px] 2xl:text-xs font-bold uppercase tracking-wide transition whitespace-nowrap text-center ${
                      subAbaRituais === 'rituais'
                        ? 'border-b-2 border-green-800 text-zinc-100'
                        : 'border-b-2 border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Rituais ({(rituaisHook.rituaisAprendidos || []).filter(r => !r.origem?.startsWith('graduado_40')).length})
                  </button>
                  <button
                    onClick={() => setSubAbaRituais('grimorio')}
                    className={`shrink-0 px-3 py-2 text-[10px] md:text-[11px] 2xl:text-xs font-bold uppercase tracking-wide transition whitespace-nowrap text-center ${
                      subAbaRituais === 'grimorio'
                        ? 'border-b-2 border-green-800 text-zinc-100'
                        : 'border-b-2 border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Grimório ({(rituaisHook.rituaisAprendidos || []).filter(r => r.origem?.startsWith('graduado_40')).length})
                  </button>
                </div>
              )}

              <div className="mb-5 flex items-center gap-4">
                <InputOtimizado value={filtroRituais} onChange={setFiltroRituais}
                  placeholder="Filtrar rituais..."
                  className="flex-1 border-b border-zinc-700 bg-transparent py-2 text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-green-700"
                />
                <button onClick={() => setModalRituaisExtraAberto(true)} className="whitespace-nowrap rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-200 transition hover:border-green-800 hover:bg-green-950/40">+ Adicionar</button>
              </div>

              <div className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1 min-h-0 custom-scrollbar">
                {rituaisHook.loading && (
                  <div className="mt-5 text-center italic text-zinc-600">Carregando banco de rituais...</div>
                )}
                {rituaisHook.error && (
                  <div className="mt-5 text-center italic text-red-500">Erro: {rituaisHook.error}</div>
                )}
                {!rituaisHook.loading && !hasAnyRitual && (
                  <div className="mt-10 text-center text-zinc-500">
                    <p className="text-sm">Você ainda não aprendeu nenhum ritual.</p>
                  </div>
                )}



                {/* Agrupamento por Círculo usando Rituais Aprendidos */}
              {[1, 2, 3, 4].map(circulo => {
                const rituaisAprendidosNesteCirculo = (rituaisHook.rituaisAprendidos || [])
                  .map(ra => {
                    const base = rituaisHook.rituais.find(r => r.Codigo_Ritual === ra.codigo_ritual);
                    return base ? { ...base, Origem: ra.origem, ElementoEscolhidoPermanente: ra.elemento_escolhido, customNome: ra.customNome, customDesc: ra.customDesc, customProps: ra.customProps, learnedNome: ra.nome, Fonte: ra.fonte || base.Fonte } : null;
                  })
                  .filter(r => {
                    if (!r || r.Circulo_Ritual !== circulo) return false;
                    const isGrimorio = r.Origem?.startsWith('graduado_40');
                    const hasGrimorioActive = isGraduado40 || (rituaisHook.rituaisAprendidos || []).some(ra => ra.origem?.startsWith('graduado_40'));
                    return (hasGrimorioActive && subAbaRituais === 'grimorio') ? isGrimorio : !isGrimorio;
                  })
                  .sort((a, b) => {
                    if (!a || !b) return 0;
                    return sortPorElementoENome(
                      { el: a.ElementoEscolhidoPermanente || a.Elemento_Ritual, nm: a.customNome || a.Nome_Ritual },
                      { el: b.ElementoEscolhidoPermanente || b.Elemento_Ritual, nm: b.customNome || b.Nome_Ritual },
                      obj => obj?.el,
                      obj => obj?.nm
                    );
                  });

                // Aplica filtro de pesquisa de rituais
                const rituaisAprendidosNesteCirculoFiltrados = rituaisAprendidosNesteCirculo.filter(r => {
                  if (!r) return false;
                  if (!filtroRituais.trim()) return true;
                  const search = filtroRituais.toLowerCase();
                  return (r.customNome || r.Nome_Ritual).toLowerCase().includes(search);
                });

                // Slots vazios pertencentes a este círculo
                const slotsVaziosNesteCirculo = visibleRitualSlots.filter(s => s.maxCirculo === circulo);

                if (rituaisAprendidosNesteCirculoFiltrados.length === 0 && slotsVaziosNesteCirculo.length === 0) return null;

                return (
                  <div key={circulo} className="mb-4">
                    {/* Header do grupo — mesma estética dos poderes */}
                    <div className="mb-2 flex items-center gap-3">
                      <span className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-zinc-400">{circulo}° Círculo</span>
                      <div className="flex-1 border-t border-zinc-800" />
                    </div>

                    <div className="flex flex-col gap-2.5">
                      {/* Slots Vazios do Círculo */}
                      {slotsVaziosNesteCirculo.map((slot, idx) => {
                        if (slot.isOcultista) {
                            return (
                              <div
                                  key={`vazio_ocultista_${(slot as any).index}_${idx}`}
                                  onClick={() => {
                                    const chave = (slot as any).chave;
                                    setEscolhendoRitualPlaceholder({
                                      origem: chave || `ocultista_${(slot as any).index}`,
                                      nex: slot.nex
                                    });
                                  }}
                                  className="group flex w-full cursor-pointer flex-col overflow-hidden rounded border-2 border-dashed border-zinc-700 border-l-zinc-600 border-l-4 bg-zinc-900/40 transition hover:border-green-800 hover:bg-zinc-900/80"
                                  style={{ borderLeftStyle: 'solid' }}
                                >
                                  <div className="flex items-center justify-between gap-3 bg-zinc-800/40 px-4 py-3 transition group-hover:bg-zinc-800/60">
                                    <div className="flex flex-col items-start gap-0.5 text-left">
                                      <span className="text-sm font-bold text-zinc-400 group-hover:text-zinc-300">Escolher Ritual</span>
                                      <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-400">
                                        {(slot as any).chave?.startsWith('graduado_10') ? 'Saber Ampliado (Trilha)' : ((slot as any).chave?.startsWith('graduado_40') ? 'Grimório Ritualístico' : `Ocultista (${regras['nex_experiencia'] ? `Nível ${calcularNivel(slot.nex)}` : `NEX ${slot.nex}%`})`)}
                                      </span>
                                    </div>
                                    <span className="whitespace-nowrap rounded bg-green-900/40 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-green-400 transition group-hover:bg-green-900/60 group-hover:text-green-300">+ Adicionar</span>
                                  </div>
                                </div>
                          );
                        } else if ((slot as any).isAdepto) {
                            const chave = (slot as any).chave;
                            const is99 = chave === 'adepto_99';
                            const nexSlot = (slot as any).nex;
                            const isRecusado = (slot as any).isRecusado;

                            if (isRecusado) {
                              return (
                                <div
                                  key={`recusado_adepto_${chave}_${idx}`}
                                  className="flex w-full items-center justify-between rounded border border-zinc-800 bg-zinc-900/30 px-4 py-2.5 transition"
                                >
                                  <div className="flex flex-col items-start gap-0.5 text-left">
                                    <span className="text-xs font-semibold text-zinc-400">Ritual Recusado</span>
                                    <span className="text-[0.65rem] text-zinc-600">
                                      Adepto ao Oculto ({regras['nex_experiencia'] ? `Nível ${calcularNivel(nexSlot)}` : `NEX ${nexSlot}%`})
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPoderesExtras(prev => {
                                          const current = (prev['adepto_recusados'] || '').split(',').map(s => s.trim()).filter(Boolean);
                                          const next = current.filter(p => p !== String(nexSlot));
                                          return { ...prev, adepto_recusados: next.join(',') };
                                        });
                                      }}
                                      className="rounded border border-zinc-800 bg-zinc-900/50 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 hover:border-green-800 hover:text-green-400 transition"
                                    >
                                      Desfazer
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPoderesExtras(prev => {
                                          const curEx = (prev['adepto_excluidos'] || '').split(',').map(s => s.trim()).filter(Boolean);
                                          if (!curEx.includes(String(nexSlot))) curEx.push(String(nexSlot));
                                          return { ...prev, adepto_excluidos: curEx.join(',') };
                                        });
                                      }}
                                      className="rounded border border-red-900/40 bg-red-950/20 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-red-400/80 hover:border-red-700 hover:text-red-300 transition"
                                    >
                                      Excluir
                                    </button>
                                  </div>
                                </div>
                              );
                            }

                            const labelSlot = is99 
                              ? (regras['nex_experiencia'] ? `Adepto ao Oculto (Nível 20 - 4º Círculo)` : `Adepto ao Oculto (NEX 99% - 4º Círculo)`)
                              : `Adepto ao Oculto (${regras['nex_experiencia'] ? `Nível ${calcularNivel(nexSlot)}` : `NEX ${nexSlot}%`})`;

                            return (
                              <div
                                key={`adepto_${chave}_${idx}`}
                                onClick={() => setEscolhendoRitualPlaceholder({ origem: chave, nex: nexSlot, maxCirculo: slot.maxCirculo })}
                                className="group flex w-full cursor-pointer flex-col overflow-hidden rounded border-2 border-dashed border-zinc-700 border-l-green-800 border-l-4 bg-zinc-900/40 transition hover:border-green-800 hover:bg-zinc-900/80"
                                style={{ borderLeftStyle: 'solid' }}
                              >
                                <div className="flex items-center justify-between gap-3 bg-zinc-800/40 px-4 py-3 transition group-hover:bg-zinc-800/60">
                                  <div className="flex flex-col items-start gap-0.5 text-left">
                                    <span className="text-sm font-bold text-zinc-400 group-hover:text-zinc-300">Escolher Ritual</span>
                                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-400">
                                      {labelSlot}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {!is99 && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setPoderesExtras(prev => {
                                            const current = (prev['adepto_recusados'] || '').split(',').map(s => s.trim()).filter(Boolean);
                                            if (!current.includes(String(nexSlot))) {
                                              current.push(String(nexSlot));
                                            }
                                            return { ...prev, adepto_recusados: current.join(',') };
                                          });
                                        }}
                                        className="rounded border border-zinc-700/80 bg-zinc-900/50 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 hover:border-red-900/60 hover:text-red-400 transition"
                                      >
                                        Recusar
                                      </button>
                                    )}
                                    <span className="whitespace-nowrap rounded bg-green-900/40 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-green-400 transition group-hover:bg-green-900/60 group-hover:text-green-300">+ Adicionar</span>
                                  </div>
                                </div>
                              </div>
                            );
                        } else if ((slot as any).isServente) {
                          const chave = (slot as any).chave;
                          const elem = (slot as any).elementoFiltro;
                          const corBorder = elem === 'Sangue' ? 'border-l-red-600 hover:border-red-600' :
                                            elem === 'Medo' ? 'border-l-zinc-200 hover:border-zinc-100' :
                                            elem === 'Morte' ? 'border-l-zinc-400 hover:border-zinc-400' :
                                            elem === 'Conhecimento' ? 'border-l-yellow-600 hover:border-yellow-600' :
                                            elem === 'Energia' ? 'border-l-purple-600 hover:border-purple-600' :
                                            'border-l-green-600 hover:border-green-600';
                          return (
                            <div
                              key={`servente_${chave}_${idx}`}
                              onClick={() => setEscolhendoRitualPlaceholder({
                                origem: chave,
                                nex: slot.nex,
                                circuloFixo: (slot as any).circuloFixo,
                                maxCirculo: slot.maxCirculo,
                                elementoFiltro: elem
                              })}
                              className={`group flex w-full cursor-pointer flex-col overflow-hidden rounded border-2 border-dashed border-zinc-700 ${corBorder} border-l-4 bg-zinc-900/40 transition hover:bg-zinc-900/80`}
                              style={{ borderLeftStyle: 'solid' }}
                            >
                              <div className="flex items-center justify-between gap-3 bg-zinc-800/40 px-4 py-3 transition group-hover:bg-zinc-800/60">
                                <div className="flex flex-col items-start gap-0.5 text-left">
                                  <span className="text-sm font-bold text-zinc-400 group-hover:text-zinc-300">Escolher Ritual</span>
                                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400">
                                    Servente - {(slot as any).labelDesc || 'Ritual'}
                                  </span>
                                </div>
                                <span className="whitespace-nowrap rounded bg-green-900/40 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-green-400 transition group-hover:bg-green-900/60 group-hover:text-green-300">+ Adicionar</span>
                              </div>
                            </div>
                          );
                        } else if ((slot as any).isMonstruosoOcult) {
                          const chave = (slot as any).chave;
                          const elem = (slot as any).elementoFiltro || monstruosoElemento;
                          const corBorder = elem === 'Sangue' ? 'border-l-red-600 hover:border-red-600' :
                                            elem === 'Morte' ? 'border-l-zinc-400 hover:border-zinc-400' :
                                            elem === 'Conhecimento' ? 'border-l-yellow-600 hover:border-yellow-600' :
                                            'border-l-purple-600 hover:border-purple-600';
                          return (
                            <div
                              key={`monstruoso_ocult_${chave}_${idx}`}
                              onClick={() => setEscolhendoRitualPlaceholder({ origem: chave, nex: 99, maxCirculo: 4, elementoFiltro: elem })}
                              className={`group flex w-full cursor-pointer flex-col overflow-hidden rounded border-2 border-dashed border-zinc-700 ${corBorder} border-l-4 bg-zinc-900/40 transition hover:bg-zinc-900/80`}
                              style={{ borderLeftStyle: 'solid' }}
                            >
                              <div className="flex items-center justify-between gap-3 bg-zinc-800/40 px-4 py-3 transition group-hover:bg-zinc-800/60">
                                <div className="flex flex-col items-start gap-0.5 text-left">
                                  <span className="text-sm font-bold text-zinc-400 group-hover:text-zinc-300">Escolher Ritual</span>
                                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400">
                                    Monstruoso ({elem} 99% - até 4º Círculo)
                                  </span>
                                </div>
                                <span className="whitespace-nowrap rounded bg-green-900/40 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-green-400 transition group-hover:bg-green-900/60 group-hover:text-green-300">+ Adicionar</span>
                              </div>
                            </div>
                          );
                        } else if ((slot as any).isMonstruoso) {
                          const chave = (slot as any).chave;
                          return (
                            <div
                              key={`monstruoso_${chave}_${idx}`}
                              onClick={() => setEscolhendoRitualPlaceholder({ origem: chave, nex: 99, maxCirculo: 4, circuloFixo: 4, elementoFiltro: 'Conhecimento' })}
                              className="group flex w-full cursor-pointer flex-col overflow-hidden rounded border-2 border-dashed border-zinc-700 border-l-yellow-600 border-l-4 bg-zinc-900/40 transition hover:border-yellow-600 hover:bg-zinc-900/80"
                              style={{ borderLeftStyle: 'solid' }}
                            >
                              <div className="flex items-center justify-between gap-3 bg-zinc-800/40 px-4 py-3 transition group-hover:bg-zinc-800/60">
                                <div className="flex flex-col items-start gap-0.5 text-left">
                                  <span className="text-sm font-bold text-zinc-400 group-hover:text-zinc-300">Escolher Ritual</span>
                                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-yellow-500 group-hover:text-yellow-400">
                                    Monstruoso (Conhecimento 99% - 4º Círculo)
                                  </span>
                                </div>
                                <span className="whitespace-nowrap rounded bg-yellow-900/40 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-yellow-400 transition group-hover:bg-yellow-900/60 group-hover:text-yellow-300">+ Adicionar</span>
                              </div>
                            </div>
                          );
                        } else {
                            const chave = (slot as any).chave;
                            const isOrigemSlot = (slot as any).isOrigem;
                            const isRegra61 = (slot as any).isRegra61;
                            const isRegra62 = (slot as any).isRegra62;
                            const isExtra = chave?.startsWith('extra_');
                            const nivelNum = isOrigemSlot ? 0 : (isExtra ? nex : parseInt(chave || '0', 10));
                            const nivelParaLabel = (isRegra61 || isRegra62) ? (slot as any).nex : nivelNum;
                            const labelNex = isOrigemSlot ? 'Origem' : (isRegra61 ? `Recompensa Racional (${regras['nex_experiencia'] ? `Nível ${calcularNivel(nivelParaLabel)}` : `NEX ${nivelParaLabel}%`})` : (isRegra62 ? `Recompensa Racional, Afinidade (${regras['nex_experiencia'] ? `Nível ${calcularNivel(nivelParaLabel)}` : `NEX ${nivelParaLabel}%`})` : (regras['nex_experiencia'] ? `Poder Nível ${calcularNivel(nivelParaLabel)}` : `Poder NEX ${nivelParaLabel}%`)));
                            return (
                              <div
                              key={`vazio_poder_${chave}_${idx}`}
                              onClick={() => setEscolhendoRitualPlaceholder({ origem: isOrigemSlot || isRegra61 || isRegra62 ? chave : `poder_57_${chave}`, nex: isOrigemSlot || isRegra61 || isRegra62 ? 0 : (isExtra ? nex : nivelNum), ...(isOrigemSlot || isRegra61 || isRegra62 ? { maxCirculo: chave === 'regra_61_3' ? 3 : chave === 'regra_61_2' ? 2 : chave?.startsWith('regra_62_') ? (nex >= 55 ? 3 : nex >= 25 ? 2 : 1) : 1 } : {}) })}
                              className="group flex w-full cursor-pointer flex-col overflow-hidden rounded border-2 border-dashed border-zinc-700 border-l-zinc-600 border-l-4 bg-zinc-900/40 transition hover:border-green-800 hover:bg-zinc-900/80"
                              style={{ borderLeftStyle: 'solid' }}
                            >
                              <div className="flex items-center justify-between gap-3 bg-zinc-800/40 px-4 py-3 transition group-hover:bg-zinc-800/60">
                                <div className="flex flex-col items-start gap-0.5 text-left">
                                  <span className="text-sm font-bold text-zinc-400 group-hover:text-zinc-300">Escolher Ritual</span>
                                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-400">
                                    {labelNex}
                                  </span>
                                </div>
                                <span className="whitespace-nowrap rounded bg-green-900/40 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-green-400 transition group-hover:bg-green-900/60 group-hover:text-green-300">+ Adicionar</span>
                              </div>
                            </div>
                          );
                        }
                      })}
                      {(() => {
                          const ritualsByElement = {};
                          rituaisAprendidosNesteCirculoFiltrados.forEach(ritual => {
                            if (!ritual) return;
                            const isLista = ritual.Elemento_Ritual.toLowerCase() === 'lista' || ritual.Elemento_Ritual.toLowerCase() === 'varia';
                            const elementoCustom = ritual.customProps?.['normal']?.Elemento_Ritual || ritual.customProps?.['discente']?.Elemento_Ritual || ritual.customProps?.['verdadeiro']?.Elemento_Ritual;
                          const elementoEscolhido = elementoCustom || (isLista ? (ritual.ElementoEscolhidoPermanente || 'Sangue') : ritual.Elemento_Ritual);
                            
                            let finalElemento = elementoEscolhido;
                            if (elementoEscolhido.toLowerCase().includes(' e ')) {
                                finalElemento = elementoEscolhido;
                            }
                            
                            if (!ritualsByElement[finalElemento]) ritualsByElement[finalElemento] = [];
                            ritualsByElement[finalElemento].push(ritual);
                          });

                                                    return Object.keys(ritualsByElement).sort((a, b) => {
                            const order = ['sangue', 'morte', 'conhecimento', 'energia', 'medo'];
                            const getOrder = (el) => {
                              const lower = el.toLowerCase();
                              for (let i = 0; i < order.length; i++) {
                                if (lower.includes(order[i])) return i;
                              }
                              return 999;
                            };
                            const idxA = getOrder(a);
                            const idxB = getOrder(b);
                            if (idxA !== idxB) return idxA - idxB;
                            return a.localeCompare(b);
                          }).map(elemento => {
                            const ritualsOfElement = ritualsByElement[elemento];
                            const hasAntena = armasHook?.armasInventario?.some(a => a.arma.Nome_Item?.trim().toLowerCase() === 'a antena');
                            const atrParaDT = temAdepto40
                              ? (poderesExtras['adepto_atributo_40'] === 'AGI' ? 'AGI' : 'VIG')
                              : (regrasAutomaticasAtivas.has(116)
                              ? 'FOR'
                              : regrasAutomaticasAtivas.has(117)
                              ? 'VIG'
                              : regrasAutomaticasAtivas.has(118)
                              ? 'INT'
                              : regrasAutomaticasAtivas.has(119)
                              ? 'AGI'
                              : 'PRE');

                            let bonusDtMonstruoso = 0;
                            if (
                              (regrasAutomaticasAtivas.has(124) && elemento.toLowerCase() === 'sangue') ||
                              (regrasAutomaticasAtivas.has(125) && elemento.toLowerCase() === 'morte') ||
                              (regrasAutomaticasAtivas.has(126) && elemento.toLowerCase() === 'conhecimento') ||
                              (regrasAutomaticasAtivas.has(127) && elemento.toLowerCase() === 'energia')
                            ) {
                              bonusDtMonstruoso = 2;
                            }
                            const temEspecialistaElemento = Object.values(poderesEscolhidos).some(p => {
                              const nomeLower = (p.nome || '').toLowerCase();
                              return (
                                (nomeLower.includes('especialista em elemento') || p.codigoRegra === 79 || (p as any).codigo_poder === 79) &&
                                (p.elemento?.toLowerCase() === elemento.toLowerCase() || nomeLower.includes(elemento.toLowerCase()))
                              );
                            });
                            const bonusDtEspecialista = temEspecialistaElemento ? 2 : 0;
                            const baseDT = 10 + (atributosFinais[atrParaDT] || 0) + nivel + (hasAntena ? 3 : 0) + (bonusMaldicoes?.bonusDT || 0) + bonusDtMonstruoso + bonusDtEspecialista;
                            
                            return (
                              <div key={elemento} className="mt-2 mb-2 flex flex-col gap-2.5">
                                <div className="flex items-center gap-3 mb-1 mt-1">
                                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: obterCorBadge(elemento) || '#52525b' }}></span>
                                  <span className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-zinc-500">{elemento}</span>
                                  <div className="flex-1 border-t border-zinc-800/50"></div>
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500" title={`10 + ${atrParaDT} + Nível${bonusDtMonstruoso ? ' + 2 (Tatuagem Ritualística)' : ''}${bonusDtEspecialista ? ' + 2 (Especialista em Elemento)' : ''}`}>DT {baseDT}</span>
                                </div>
                                <div className="flex flex-col gap-2.5">
                                {ritualsOfElement.map(ritual => {
                        if (!ritual) return null;
                        
                        // O código único na interface do usuário agora é uma combinação do código do ritual e a origem (para suportar o mesmo ritual pego mais de uma vez, caso aconteça)
                        const chaveUnica = `${ritual.Codigo_Ritual}_${ritual.Origem}`;
                        const expandido = rituaisExpandidos.includes(chaveUnica as any);
                        const versao: VersaoRitual = versaoRitual[chaveUnica] || 'normal';

                        const isLista = ritual.Elemento_Ritual.toLowerCase() === 'lista' || ritual.Elemento_Ritual.toLowerCase() === 'varia';
                        // Usa a escolha permanente feita na hora de aprender
                        const elementoCustom = ritual.customProps?.['normal']?.Elemento_Ritual || ritual.customProps?.['discente']?.Elemento_Ritual || ritual.customProps?.['verdadeiro']?.Elemento_Ritual;
                          const elementoEscolhido = elementoCustom || (isLista ? (ritual.ElementoEscolhidoPermanente || 'Sangue') : ritual.Elemento_Ritual);

                        const corElemento = obterCorBadge(elementoEscolhido);
                        const corPrimaria = obterCorElementoPrimario(elementoEscolhido);
                        const corTextoElemento = obterCorTexto(elementoEscolhido);
                        const simboloImg = rituaisHook.getSimboloUrl ? rituaisHook.getSimboloUrl(ritual.Codigo_Ritual, elementoEscolhido) : '';

                        // Valores dinâmicos baseados na versão
                        const isOrigemConjuracao = Boolean(ritual.Origem?.startsWith('maldicao_conjuracao_'));
                        const temConjuracaoNoItem = (itensHook?.itensInventario || []).some(i => {
                          const nomeItem = (i.item.Nome_Item || '').toLowerCase();
                          const grupoItem = (i.item.Grupo_Item || '').toLowerCase();
                          const reqEquip = nomeItem.includes('vestimenta') || nomeItem.includes('amuleto sagrado') || grupoItem === 'proteções' || grupoItem === 'protecoes';
                          const ativo = reqEquip ? Boolean(i.equipado) : true;
                          return ativo && Array.isArray(i.maldicoes) && i.maldicoes.includes(24) && (i.maldicoes_elementos?.[24] || '').trim().toLowerCase() === (ritual.Nome_Ritual || '').trim().toLowerCase();
                        });

                        const peOriginal = ritual.customProps?.[versao]?.PE_Ritual || obterValorVersao(ritual.PE_Ritual, versao, ritual.Tem_Discente, ritual.Tem_Verdadeiro);
                        const alcance = ritual.customProps?.[versao]?.Alcance_Ritual || obterValorVersao(ritual.Alcance_Ritual, versao, ritual.Tem_Discente, ritual.Tem_Verdadeiro);
                        const area = ritual.customProps?.[versao]?.Area_Ritual || obterValorVersao(ritual.Area_Ritual, versao, ritual.Tem_Discente, ritual.Tem_Verdadeiro);
                        const alvo = ritual.customProps?.[versao]?.Alvo_Ritual || obterValorVersao(ritual.Alvo_Ritual, versao, ritual.Tem_Discente, ritual.Tem_Verdadeiro);
                        let peValor = parseInt(String(peOriginal).replace(/\D+/g, ''), 10);
                        if (!isNaN(peValor)) {
                          if (regrasAutomaticasAtivas.has(34)) {
                            const temDesconto34 = Object.values(poderesEscolhidos).some(p => p.codigoRegra === 34 && p.elemento === elementoEscolhido);
                            if (temDesconto34) peValor -= 1;
                          }
                          if (regrasAutomaticasAtivas.has(35)) {
                            const desconto35 = Object.values(poderesEscolhidos).filter(p => p.codigoRegra === 35 && p.elemento === (ritual.customNome || ritual.Nome_Ritual)).length;
                            peValor -= desconto35;
                          }
                          if (!isOrigemConjuracao && temConjuracaoNoItem) {
                            peValor -= 1;
                          }
                          // Monstruoso Ocultista (Regra 125 - Morte 65%): Cicatrização se o personagem já o conhecia
                          if (regrasAutomaticasAtivas.has(125) && Number(ritual.Codigo_Ritual) === 13) {
                            const jaTinhaAntes = (rituaisHook.rituaisAprendidos || []).filter(r => Number(r.codigo_ritual) === 13).length > 1;
                            if (jaTinhaAntes) {
                              peValor -= 1;
                            }
                          }
                          // Tatuagem Ritualística (-1 PE)
                          const temTatuagem = temMonstruosoOcult40 || Object.values(poderesEscolhidos).some(p => p.codigoRegra === 89 || (p as any).codigo_poder === 89 || p.nome?.toLowerCase().trim() === 'tatuagem ritualística');
                          if (temTatuagem) {
                            const alcanceLower = (alcance || '').toLowerCase();
                            const alvoLower = (alvo || '').toLowerCase();
                            const isPessoalAlvoVoce = alcanceLower.includes('pessoal') && alvoLower.includes('você');
                            const isElementoMonstruoso = (regrasAutomaticasAtivas.has(120) && elementoEscolhido === 'Sangue')
                              || (regrasAutomaticasAtivas.has(121) && elementoEscolhido === 'Morte')
                              || (regrasAutomaticasAtivas.has(122) && elementoEscolhido === 'Conhecimento')
                              || (regrasAutomaticasAtivas.has(123) && elementoEscolhido === 'Energia');

                            if (isPessoalAlvoVoce || isElementoMonstruoso) {
                              peValor -= 1;
                            }
                          }
                          peValor = Math.max(1, peValor);
                        }
                        const pe = isNaN(peValor) ? peOriginal : String(peOriginal).replace(/\d+/, peValor.toString());
                        const duracao = ritual.customProps?.[versao]?.Duracao_Ritual || obterValorVersao(ritual.Duracao_Ritual, versao, ritual.Tem_Discente, ritual.Tem_Verdadeiro);
                        let execucao = ritual.customProps?.[versao]?.Execucao_Ritual || obterValorVersao(ritual.Execucao_Ritual, versao, ritual.Tem_Discente, ritual.Tem_Verdadeiro);


                        const efeito = ritual.customProps?.[versao]?.Efeito_Ritual || obterValorVersao(ritual.Efeito_Ritual, versao, ritual.Tem_Discente, ritual.Tem_Verdadeiro);
                        const resistencia = ritual.customProps?.[versao]?.Resistencia_Ritual || obterValorVersao(ritual.Resistencia_Ritual, versao, ritual.Tem_Discente, ritual.Tem_Verdadeiro);
                        const dados = ritual.customProps?.[versao]?.Dados_Ritual || obterValorVersao(ritual.Dados_Ritual, versao, ritual.Tem_Discente, ritual.Tem_Verdadeiro);

                        // Opções de versão disponíveis
                        const reqNormal = verificarAcessoCirculo(ritual.Circulo_Ritual, nivel, classe);
                        const versoesDisponiveis: { value: VersaoRitual; label: string; disabled?: boolean; title?: string }[] = [
                          { 
                            value: 'normal', 
                            label: 'Normal',
                            disabled: !reqNormal.atende
                          },
                        ];
                        if (ritual.Tem_Discente) {
                          const req = verificarRequisitoRitual(ritual.Requisito_Discente, nivel, classe, afinidadeAtiva, afinidadeEscolhida, ritual.Elemento_Ritual);
                          versoesDisponiveis.push({ 
                            value: 'discente', 
                            label: 'Discente',
                            disabled: !req.atende
                          });
                        }
                        if (ritual.Tem_Verdadeiro) {
                          const req = verificarRequisitoRitual(ritual.Requisito_Verdadeiro, nivel, classe, afinidadeAtiva, afinidadeEscolhida, ritual.Elemento_Ritual);
                          versoesDisponiveis.push({ 
                            value: 'verdadeiro', 
                            label: 'Verdadeiro',
                            disabled: !req.atende
                          });
                        }

                        return (
                          <div key={chaveUnica} className="overflow-hidden rounded-r border-l-4 bg-zinc-900/70" style={{ borderLeftColor: corPrimaria }}>

                            {/* ══════ CABEÇALHO (sempre visível) ══════ */}
                            <div
                              onClick={() =>
                                setRituaisExpandidos(prev =>
                                  prev.includes(chaveUnica as any)
                                    ? prev.filter(id => id !== chaveUnica)
                                    : [...prev, chaveUnica as any]
                                )
                              }
                              className="flex cursor-pointer items-center justify-between gap-2 bg-zinc-800/60 px-4 py-3 transition hover:bg-zinc-700/50"
                            >
                              <div className="flex items-center">
                                {simboloImg && (
                                  <>
                                    <div
                                      className="overflow-hidden shrink-0 flex items-center justify-center"
                                      style={{
                                        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                                        width: expandido ? '0px' : '64px',
                                        height: '64px',
                                        marginTop: '-6px',
                                        marginBottom: '-6px',
                                        opacity: expandido ? 0 : 1,
                                      }}
                                    >
                                      <img
                                        src={simboloImg}
                                        loading="lazy"
                                        alt=""
                                        className="h-16 w-16 object-contain drop-shadow-md max-w-none"
                                      />
                                    </div>
                                    <div
                                      className="shrink-0 bg-white/20 rounded-full"
                                      style={{
                                        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                                        width: expandido ? '0px' : '1px',
                                        height: '36px',
                                        marginLeft: expandido ? '0px' : '10px',
                                        marginRight: expandido ? '0px' : '10px',
                                        opacity: expandido ? 0 : 1,
                                      }}
                                    />
                                  </>
                                )}
                                <div className="flex flex-col gap-1 justify-center py-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-zinc-100">{ritual.customNome || (ritual.learnedNome && ritual.learnedNome !== ritual.Nome_Ritual ? ritual.learnedNome : (ritual.Origem === 'trilha_conduite' ? `${ritual.Nome_Ritual} (Conduíte)` : (ritual.Origem === 'trilha_flagelador' ? `${ritual.Nome_Ritual} (Flagelador)` : (ritual.Origem === 'trilha_graduado' ? `${ritual.Nome_Ritual} (Graduado)` : (ritual.Origem === 'trilha_viajante_das_sombras' ? `${ritual.Nome_Ritual} (Viajante das Sombras)` : (ritual.Origem?.startsWith('servente_') ? `${ritual.Nome_Ritual} (Servente)` : (ritual.Origem?.startsWith('adepto_') ? `${ritual.Nome_Ritual} (Adepto)` : (ritual.Origem?.startsWith('trilha_monstruoso_99_') || ritual.Origem === 'monstruoso_99_conhecimento' || ritual.Origem?.startsWith('monstruoso_ocult_99_') ? `${ritual.Nome_Ritual} (Monstruoso)` : ritual.Nome_Ritual))))))))}</span>
                                    <span className="rounded bg-blue-950/30 px-1.5 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-900/50">
                                      {pe} PE
                                    </span>
                                  </div>
                                  {/* Dados abaixo do título — todas as versões, ativa acesa */}
                                  {ritual.Dados_Ritual && (() => {
                                    const partesDados = ritual.Dados_Ritual.split('/').map(p => p.trim());
                                    const normal = partesDados[0];
                                    if (partesDados.length === 1 && normal) {
                                      return <span className="text-sm font-bold text-zinc-100">{normal}</span>;
                                    }
                                    const preenchidas = partesDados.map(p => p || normal);
                                    if (!preenchidas.some(p => p)) return null;
                                    let ativo = 0;
                                    if (versao === 'discente') ativo = 1;
                                    if (versao === 'verdadeiro') {
                                      ativo = (ritual.Tem_Discente && ritual.Tem_Verdadeiro) ? 2 : 1;
                                    }
                                    return (
                                      <div className="flex items-center gap-2">
                                        {preenchidas.map((parte, idx) => (
                                          <React.Fragment key={idx}>
                                            {idx > 0 && <span className="text-xs text-zinc-700">›</span>}
                                            <span
                                              className={`text-sm font-bold transition-all duration-300 ${idx === ativo ? 'text-zinc-100' : 'text-zinc-600'}`}
                                            >
                                              {parte}
                                            </span>
                                          </React.Fragment>
                                        ))}
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>

                              <div className={`flex flex-col justify-between shrink-0 ml-2 ${simboloImg ? 'items-end pb-1 pt-0 mt-[-4px]' : 'items-end pb-1 pt-0 mt-[-4px]'}`}>
                                {/* Badge do elemento */}
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 uppercase tracking-wider leading-tight ${
                                    (() => {
                                      const elStr = elementoEscolhido.toLowerCase();
                                      if (elStr.includes('medo')) return 'bg-zinc-200/80 text-zinc-950 px-1';
                                      if (elStr.includes('sangue')) return 'text-red-500';
                                      if (elStr.includes('morte')) return 'bg-black/50 text-white px-1';
                                      if (elStr.includes('conhecimento')) return 'text-yellow-500';
                                      if (elStr.includes('energia')) return 'text-purple-500';
                                      return 'text-zinc-400';
                                    })()
                                  }`}
                                >
                                  <span className="text-[9px] font-bold">{elementoEscolhido}</span>
                                  <span className="text-[11px] font-black">{ritual.Circulo_Ritual}</span>
                                </span>

                                <div className={`flex items-center gap-2 ${simboloImg ? 'mt-auto' : 'mt-2'}`}>
                                  {(isOrigemConjuracao || temConjuracaoNoItem) && (
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-yellow-500/90 bg-yellow-950/30 border border-yellow-800/40 px-1.5 py-0.5 rounded">
                                      Conjuração
                                    </span>
                                  )}
                                  {/* Seta */}
                                  <span className="text-xs text-zinc-600 ml-1">{expandido ? '▲' : '▼'}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* ══════ CONTEÚDO EXPANDIDO ══════ */}
                            <Collapse isOpen={expandido}>
                              <div className="border-t border-zinc-800 px-4 py-4 text-left text-sm leading-relaxed text-zinc-400">
                                
                                <div className="flex flex-row items-center justify-between gap-4">
                                  <div className="flex flex-col flex-1 min-w-0">
                                    
                                    {/* Dropdowns de configurações (Elemento e Versão) */}
                                    {(isLista || versoesDisponiveis.length > 1) && (
                                      <div className="mb-4 flex flex-wrap items-center justify-between border-b border-zinc-800/50 pb-3">
                                        <div className="flex items-center gap-5">
                                          {/* Dropdown de Versão */}
                                          {versoesDisponiveis.length > 1 && (
                                            <div className="flex items-center gap-2">
                                              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-600">Versão:</span>
                                              <CustomSelect
                                                value={versao}
                                                onChange={(val) => {
                                                  setVersaoRitual(prev => ({
                                                    ...prev,
                                                    [chaveUnica]: val as VersaoRitual,
                                                  }));
                                                }}
                                                wrapperClassName="w-[120px]"
                                                className="cursor-pointer rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs font-bold text-zinc-200 outline-none transition hover:bg-zinc-800 focus:border-green-700"
                                                options={versoesDisponiveis.map(v => ({ value: v.value, label: v.label, disabled: v.disabled }))}
                                              />
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Campos de metadados — só mostram se têm valor */}
                                    <div className="mb-4 flex flex-col gap-1">
                                      {execucao && (
                                        <div className="text-xs">
                                          <span className="font-bold text-zinc-300">Execução: </span>
                                          <span className="text-zinc-400">{execucao}</span>
                                        </div>
                                      )}
                                      {alcance && (
                                        <div className="text-xs">
                                          <span className="font-bold text-zinc-300">Alcance: </span>
                                          <span className="text-zinc-400">{alcance}</span>
                                        </div>
                                      )}
                                      {area && (
                                        <div className="text-xs">
                                          <span className="font-bold text-zinc-300">Área: </span>
                                          <span className="text-zinc-400">{area}</span>
                                        </div>
                                      )}
                                      {alvo && (
                                        <div className="text-xs">
                                          <span className="font-bold text-zinc-300">Alvo: </span>
                                          <span className="text-zinc-400">{alvo}</span>
                                        </div>
                                      )}
                                      {duracao && (
                                        <div className="text-xs">
                                          <span className="font-bold text-zinc-300">Duração: </span>
                                          <span className="text-zinc-400">{duracao}</span>
                                        </div>
                                      )}
                                      {efeito && (
                                        <div className="text-xs">
                                          <span className="font-bold text-zinc-300">Efeito: </span>
                                          <span className="text-zinc-400">{efeito}</span>
                                        </div>
                                      )}
                                      {resistencia && (
                                        <div className="text-xs">
                                          <span className="font-bold text-zinc-300">Resistência: </span>
                                          <span className="text-zinc-400">{resistencia}</span>
                                        </div>
                                      )}
                                      {dados && (
                                        <div className="text-xs">
                                          <span className="font-bold text-zinc-300">Dados: </span>
                                          <span className="text-zinc-400">{dados}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Símbolo do Ritual Centralizado Verticalmente */}
                                  {simboloImg && (
                                    <img
                                      src={simboloImg}
                                      alt=""
                                      className="w-32 h-32 sm:w-40 sm:h-40 mr-2 sm:mr-6 object-contain shrink-0 drop-shadow-lg"
                                    />
                                  )}
                                </div>

                              </div>
                            </Collapse>
                            <Collapse isOpen={expandido}>
                              <div className="px-4 pb-4 text-left text-sm leading-relaxed text-zinc-400">
                                {/* Descrição formatada com versões dimmed */}
                                <div className="text-sm leading-relaxed text-zinc-400">
                                  {(() => {
                                    let currentScope = 'normal';
                                    return (ritual.customDesc || ritual.Descricao_Ritual).split('\n').map((linha, i) => {
                                      const linhaLower = linha.trim().toLowerCase();
                                      const isHeaderDiscente = linhaLower.startsWith('*discente') || linhaLower.startsWith('discente');
                                      const isHeaderVerdadeiro = linhaLower.startsWith('*verdadeiro') || linhaLower.startsWith('verdadeiro');

                                      if (isHeaderDiscente) currentScope = 'discente';
                                      if (isHeaderVerdadeiro) currentScope = 'verdadeiro';

                                      let dimmed = false;
                                      if (currentScope === 'discente' && versao !== 'discente') dimmed = true;
                                      if (currentScope === 'verdadeiro' && versao !== 'verdadeiro') dimmed = true;

                                      return (
                                        <span
                                          key={i}
                                          className={`block ${dimmed ? 'opacity-50' : ''} ${currentScope !== 'normal' && !dimmed ? 'text-zinc-300' : ''}`}
                                          style={{ transition: 'opacity 0.2s ease' }}
                                          dangerouslySetInnerHTML={{ __html: formatarDescricao(linha) }}
                                        />
                                      );
                                    });
                                  })()}
                                </div>

                                <div className="mt-3 text-[0.6rem] uppercase tracking-wider text-zinc-600">Fonte: {ritual.Fonte || 'NÃO DEFINIDA'}</div>

                                <div className="mt-4 flex justify-end gap-2 border-t border-zinc-800/50 pt-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRitualEditandoOrigem(ritual.Origem);
                                      setRitualNomeEditando(ritual.customNome || ritual.Nome_Ritual);
                                      setRitualDescricaoEditando(ritual.customDesc || ritual.Descricao_Ritual);
                                      setRitualPropsEditando(ritual.customProps || {});
                                      setRitualVersaoEditando('normal');
                                    }}
                                    className="rounded bg-zinc-800 border border-zinc-700 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-zinc-300 transition hover:bg-zinc-700 hover:text-zinc-100"
                                  >Editar</button>
                                  {!ritual.Origem.startsWith('trilha_') && !ritual.Origem.startsWith('maldicao_conjuracao_') && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (ritual.Origem.startsWith('poder_57_')) {
                                          const nivel = parseInt(ritual.Origem.replace('poder_57_', '').replace('combate_', ''), 10);
                                          const poderExistente = poderesEscolhidos[nivel];
                                          if (poderExistente && poderExistente.nome.toLowerCase().startsWith('aprender ritual (')) {
                                            const ppBase = poderesParanormais.find(p => p.Nome.toLowerCase() === 'aprender ritual');
                                            if (ppBase) {
                                              poderesHook.escolherPoder(nivel, {
                                                codigo_poder: 57,
                                                Nome: 'Aprender Ritual',
                                                Descricao: ppBase?.Descricao || '',
                                                PreRequisitos: ppBase?.PreRequisitos || '',
                                                Afinidade: ppBase?.Afinidade,
                                                Elemento: ppBase?.Elemento,
                                                Fonte: ppBase?.Fonte,
                                                PreRequisitosAfinidade: ppBase?.PreRequisitosAfinidade
                                              } as any);
                                            }
                                          }
                                        }

                                        if (Number(ritual.Codigo_Ritual) === 3 && isLamina) {
                                          const baseRitual = (rituaisHook.rituais || []).find(r => Number(r.Codigo_Ritual) === 3);
                                          if (baseRitual) {
                                            const elementoEscolhido = poderesExtras.lamina_elemento || ritual.ElementoEscolhidoPermanente || ritual.Elemento_Ritual || 'Sangue';
                                            rituaisHook.atualizarRituaisAprendidos(prev => [
                                              ...prev.filter(r => r.origem !== ritual.Origem && r.origem !== 'trilha_lamina_paranormal'),
                                              {
                                                codigo_ritual: 3,
                                                nome: `${baseRitual.Nome_Ritual} (Lâmina Paranormal)`,
                                                origem: 'trilha_lamina_paranormal',
                                                circulo: baseRitual.Circulo_Ritual,
                                                elemento: baseRitual.Elemento_Ritual,
                                                elemento_escolhido: elementoEscolhido
                                              }
                                            ]);
                                            return;
                                          }
                                        }

                                        rituaisHook.esquecerRitual(ritual.Origem);
                                      }}
                                      className="rounded bg-green-900/30 border border-green-800 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-green-500 transition hover:bg-green-900/50 hover:text-green-400"
                                    >Remover</button>
                                  )}
                                </div>

                              </div>
                            </Collapse>
                          </div>
                        );
                      })}
                                </div>
                              </div>
                            );
                          });
                        })()}
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
          );
        })()}
        {abaDireita === 'inventario' && <InventarioPanel />}
        {abaDireita === 'descricao' && <div className="mt-5 text-center italic text-zinc-600">Conteúdo de Descrição</div>}

        {abaDireita === 'regras' && (
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Regras Opcionais</h4>
            <RegraCheckbox
              nome="nex_experiencia"
              titulo="NEX & Experiência"
              descricao="O nível de experiência substitui o NEX em Benefícios por NEX, como pré-requisitos de habilidades de classe (exceto poderes paranormais) e em efeitos de origens e habilidades baseados em NEX. 1 nível equivale a 5% de NEX."
            />
              <RegraCheckbox
                nome="media_dano"
                titulo="Cálculo de Média de Dano"
                descricao="Exibe uma seção retrátil nos blocos de ataque com a média matemática do dano causado pelas armas no combate."
              />
            <RegraCheckbox
              nome="sem_sanidade"
              titulo="Jogando sem Sanidade"
              descricao="Personagens não recebem mais PE ou SAN. Em vez disso, recebem Pontos de Determinação (PD) de acordo com sua classe."
            />
            <RegraCheckbox
              nome="reter_ritual"
              titulo="Reter Ritual"
              descricao="Retida. Quando conjura um ritual com duração cena, pode mudar a duração para retida como ação livre ou reação. Você retém os PE, reduzindo eles do seu valor atual e máximo. Enquanto você mantiver os PE retidos, o ritual permanecerá funcionando. Você está usando suas energias naturais e sobrenaturais para abrir sua comunicação com o Outro Lado e manter o fluxo a partir dela aberto. Entretanto, sempre que reter um ritual, você perde 1 SAN — manter seu pedido para o Outro Lado cobra seu preço."
            />
            <RegraCheckbox
              nome="contagem_municao"
              titulo="Contagem de Munição"
              descricao="A regra de munição, explicada na página 59, foi desenvolvida para simular ação cinematográfica e para agilizar o jogo, evitando que jogadores gastem tempo contando cada bala disparada. Se o seu grupo preferir uma abordagem mais realista — e não se importar com um pouco de “contabilidade” — pode usar contagem de munição concreta, e não abstrata. Fonte: OPRPG, p. 174."
            />
          </div>
        )}
      </div>

      {/* Informações de restrição para Lâmina Paranormal */}
      {(() => {
        const amaldicoarExistente = (rituaisHook.rituaisAprendidos || []).find((r: any) => Number(r.codigo_ritual) === 3);
        const elementoLaminaRestrito = poderesExtras.lamina_elemento || amaldicoarExistente?.elemento_escolhido || amaldicoarExistente?.customProps?.normal?.Elemento_Ritual;
        const elementosPermitidosMap: Record<number, string[]> = {};
        if (isLamina && elementoLaminaRestrito) {
          elementosPermitidosMap[3] = [elementoLaminaRestrito];
        }

        const idsFiltradosParaAprendizado = (rituaisHook.rituaisAprendidos || []).filter((r: any) => {
          if (Number(r.codigo_ritual) === 3 && isLamina) {
            const temNormal = (rituaisHook.rituaisAprendidos || []).some((x: any) => Number(x.codigo_ritual) === 3 && x.origem !== 'trilha_lamina_paranormal');
            if (!temNormal) return false;
          }
          return true;
        }).map((r: any) => r.codigo_ritual);

        return (
          <>
            {/* Modal de seleção de rituais EXTRAS para qualquer círculo */}
            {modalRituaisExtraAberto && (
              <ModalRituaisExtra
                getSimboloUrl={rituaisHook.getSimboloUrl || (() => '')}
                rituais={rituaisHook.rituais || []}
                rituaisAprendidosIds={idsFiltradosParaAprendizado}
                elementosPermitidosPorRitual={elementosPermitidosMap}
                onClose={() => setModalRituaisExtraAberto(false)}
                onSelect={(ritual, elementoVaria) => {
                  const origemExtra = `extra_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                  let propsLamina: any = undefined;
                  let elementoFinal = elementoVaria;
                  if (Number(ritual.Codigo_Ritual) === 3 && isLamina) {
                    elementoFinal = elementoLaminaRestrito || 'Sangue';
                    propsLamina = {
                      normal: { Execucao_Ritual: 'Movimento (+1 PE)' },
                      discente: { Execucao_Ritual: 'Movimento (+1 PE)' },
                      verdadeiro: { Execucao_Ritual: 'Movimento (+1 PE)' }
                    };
                    rituaisHook.esquecerRitual('trilha_lamina_paranormal');
                  }
                  
                  rituaisHook.aprenderRitual({
                    codigo_ritual: ritual.Codigo_Ritual,
                    origem: origemExtra,
                    elemento_escolhido: elementoFinal,
                    circulo: ritual.Circulo_Ritual,
                    customNome: ritual.Nome_Ritual,
                    customDesc: ritual.Descricao_Ritual,
                    ...(propsLamina ? { customProps: propsLamina } : {}),
                  });
                  
                  setModalRituaisExtraAberto(false);
                }}
              />
            )}

            {/* Modal de seleção de rituais para os slots */}
            {escolhendoRitualPlaceholder && (
              <ModalRituais
                rituais={rituaisHook.rituais || []}
                circuloFixo={escolhendoRitualPlaceholder.circuloFixo}
                elementoFiltro={escolhendoRitualPlaceholder.elementoFiltro}
                limiteCirculo={
                  escolhendoRitualPlaceholder.maxCirculo
                    ? escolhendoRitualPlaceholder.maxCirculo
                    : escolhendoRitualPlaceholder.nex 
                    ? (classe === 'Ocultista' 
                        ? (escolhendoRitualPlaceholder.nex >= 85 ? 4 : escolhendoRitualPlaceholder.nex >= 55 ? 3 : escolhendoRitualPlaceholder.nex >= 25 ? 2 : 1)
                        : (escolhendoRitualPlaceholder.nex >= 75 ? 3 : escolhendoRitualPlaceholder.nex >= 45 ? 2 : 1))
                    : (nex >= 85 ? 4 : nex >= 55 ? 3 : nex >= 25 ? 2 : 1)
                }
                rituaisAprendidosIds={idsFiltradosParaAprendizado}
                elementosPermitidosPorRitual={elementosPermitidosMap}
                onClose={() => setEscolhendoRitualPlaceholder(null)}
                onSelect={(ritual, elementoVaria) => {
                  const origem = escolhendoRitualPlaceholder.origem;
                  let propsLamina: any = undefined;
                  let elementoFinal = elementoVaria;
                  if (Number(ritual.Codigo_Ritual) === 3 && isLamina) {
                    elementoFinal = elementoLaminaRestrito || 'Sangue';
                    propsLamina = {
                      normal: { Execucao_Ritual: 'Movimento (+1 PE)' },
                      discente: { Execucao_Ritual: 'Movimento (+1 PE)' },
                      verdadeiro: { Execucao_Ritual: 'Movimento (+1 PE)' }
                    };
                    rituaisHook.esquecerRitual('trilha_lamina_paranormal');
                  }
                  
                  rituaisHook.aprenderRitual({
                    codigo_ritual: ritual.Codigo_Ritual,
                    origem: origem,
                    elemento_escolhido: elementoFinal,
                    ...(propsLamina ? { customProps: propsLamina } : {}),
                  });

                  if (origem.startsWith('poder_57_')) {
                    const chave = origem.replace('poder_57_', '').replace('combate_', '');
                    const chaveNum = parseInt(chave, 10);
                    const key = isNaN(chaveNum) ? chave : chaveNum;
                    const poderAtual = poderesEscolhidos[key];
                    if (poderAtual) {
                      const baseNameStr = poderAtual.nome.toLowerCase().trim();
                      const baseName = baseNameStr.startsWith('aprender ritual (') ? 'aprender ritual' : (baseNameStr.startsWith('resistir a ') ? 'resistir a <elemento>' : baseNameStr);
                      const ppBase = poderesParanormais.find(p => p.Nome.toLowerCase() === baseName);
                      if (ppBase) {
                        poderesHook.escolherPoder(key as number, {
                          codigo_poder: 57,
                          Nome: `Aprender Ritual (${ritual.Nome_Ritual})`,
                          Descricao: poderAtual.descricao,
                          PreRequisitos: poderAtual.preRequisitos,
                          Afinidade: poderAtual.afinidade,
                          Elemento: elementoFinal || ritual.Elemento_Ritual,
                          Fonte: poderAtual.fonte || ppBase.Fonte,
                          PreRequisitosAfinidade: ppBase.PreRequisitosAfinidade
                        } as any);
                      }
                    }
                  }
                  
                  setEscolhendoRitualPlaceholder(null);
                }}
              />
            )}
          </>
        );
      })()}

      {/* Modal para Edição Inline de Ritual */}
      {(() => {
        if (!ritualEditandoOrigem) return null;
        const ritualEditando = rituaisHook.rituaisAprendidos.find(r => r.origem === ritualEditandoOrigem);
        const ritualBase = ritualEditando ? rituaisHook.rituais.find(r => r.Codigo_Ritual === ritualEditando.codigo_ritual) : null;
        if (!ritualBase) return null;

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 backdrop-blur-sm bg-black/60 transition-opacity" onClick={() => setRitualEditandoOrigem(null)} />
            
            <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-zinc-800 bg-[#0a0a0a] shadow-[0_0_40px_rgba(0,0,0,0.8)] ring-1 ring-white/5 flex flex-col max-h-[90vh]">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
              
              <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/50 p-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">PERSONALIZAR RITUAL</h3>
                  <p className="text-xs text-zinc-400">Edite os detalhes visuais</p>
                </div>
                <button
                  onClick={() => setRitualEditandoOrigem(null)}
                  className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar flex flex-col gap-5">
                <section className="flex flex-col gap-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Nome Personalizado</h4>
                  <InputOtimizado
                    value={ritualNomeEditando}
                    onChange={setRitualNomeEditando}
                    placeholder="Ex: Definhar, mas roxo..."
                    className="w-full rounded border border-zinc-800/80 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-200 focus:border-green-700/50 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-green-700/50"
                  />
                </section>

                {(ritualBase.Tem_Discente || ritualBase.Tem_Verdadeiro) && (
                  <section className="flex flex-col gap-3 border-t border-zinc-800/50 pt-5">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Propriedades Específicas por Versão</h4>
                    <CustomSelect
                      value={ritualVersaoEditando}
                      onChange={(val) => setRitualVersaoEditando(val as any)}
                      wrapperClassName="w-40"
                      className="rounded border border-zinc-800/80 bg-zinc-900/50 px-3 py-2 text-sm font-bold text-zinc-200 focus:border-green-700/50 focus:outline-none w-full"
                      options={[
                        { value: 'normal', label: 'Normal' },
                        ...(ritualBase.Tem_Discente ? [{ value: 'discente', label: 'Discente' }] : []),
                        ...(ritualBase.Tem_Verdadeiro ? [{ value: 'verdadeiro', label: 'Verdadeiro' }] : [])
                      ]}
                    />
                  </section>
                )}

                <section className="flex flex-col gap-3 border-t border-zinc-800/50 pt-5">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Sobrescrever Propriedades</h4>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { key: 'Elemento_Ritual', label: 'Elemento' },
                      { key: 'Execucao_Ritual', label: 'Execução' },
                    { key: 'PE_Ritual', label: 'Custo' },
                    { key: 'Alcance_Ritual', label: 'Alcance' },
                    { key: 'Area_Ritual', label: 'Área' },
                    { key: 'Alvo_Ritual', label: 'Alvo' },
                    { key: 'Duracao_Ritual', label: 'Duração' },
                    { key: 'Resistencia_Ritual', label: 'Resistência' },
                    { key: 'Dados_Ritual', label: 'Dados' },
                  ].map(prop => {
                    const valorBase = (ritualBase as any)[prop.key];
                    const valorCalculado = obterValorVersao(valorBase, ritualVersaoEditando, ritualBase.Tem_Discente, ritualBase.Tem_Verdadeiro);
                    const currentValue = (ritualPropsEditando?.[ritualVersaoEditando] as any)?.[prop.key] || '';
                    
                    let opts = null;
                                          if (prop.key === 'Elemento_Ritual') opts = ['Sangue', 'Morte', 'Energia', 'Conhecimento', 'Medo'];
                      if (prop.key === 'Elemento_Ritual') opts = ['Sangue', 'Morte', 'Energia', 'Conhecimento', 'Medo'];
                      if (prop.key === 'Execucao_Ritual') opts = ['Padrão', 'Movimento', 'Movimento (+1 PE)', 'Livre', 'Reação', 'Completa'];
                    if (prop.key === 'Alcance_Ritual') opts = ['Pessoal', 'Toque', 'Curto', 'Médio', 'Longo', 'Extremo', 'Ilimitado'];
                    if (prop.key === 'Resistencia_Ritual') opts = ['Nenhuma', 'Fortitude', 'Reflexos', 'Vontade', 'Fortitude reduz à metade', 'Reflexos reduz à metade', 'Vontade reduz à metade', 'Fortitude anula', 'Reflexos anula', 'Vontade anula'];
                    if (prop.key === 'Duracao_Ritual') opts = ['Instantânea', '1 rodada', 'Cena', 'Sustentada', 'Sustentada (1 rodada)', '1 dia'];
                    
                    
                    if (opts && currentValue && !opts.includes(currentValue)) {
                      opts = [currentValue, ...opts];
                    }

                    return (
                      <div key={prop.key} className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{prop.label}</label>
                        {opts ? (
                          <CustomSelect
                            value={currentValue}
                            onChange={(val) => setRitualPropsEditando(prev => ({ ...prev, [ritualVersaoEditando]: { ...(prev?.[ritualVersaoEditando] || {}), [prop.key]: val } }))}
                            options={opts}
                            placeholder={valorCalculado ? String(valorCalculado) : 'Padrão'}
                            className="w-full rounded border border-zinc-800/80 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-200 focus:border-green-700/50 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-green-700/50"
                          />
                        ) : (
                          <InputOtimizado
                            value={currentValue}
                            onChange={(val) => setRitualPropsEditando(prev => ({ ...prev, [ritualVersaoEditando]: { ...(prev?.[ritualVersaoEditando] || {}), [prop.key]: val } }))}
                            placeholder={valorCalculado ? String(valorCalculado) : 'Padrão'}
                            className="w-full rounded border border-zinc-800/80 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-200 focus:border-green-700/50 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-green-700/50"
                          />
                        )}
                      </div>
                    );
                  })}
                  </div>
                </section>

                <section className="flex flex-col gap-3 flex-1 min-h-[150px] border-t border-zinc-800/50 pt-5">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Descrição Personalizada</h4>
                  <div className="overflow-hidden rounded border border-zinc-800/80 bg-zinc-900/30 flex flex-col flex-1">
                    <ToolbarFormato editorRef={ritualEditorRef as any} />
                    <div
                      ref={(el) => {
                        ritualEditorRef.current = el;
                        if (el && !el.dataset.initialized) {
                          el.innerHTML = ritualDescricaoEditando;
                          el.dataset.initialized = 'true';
                        }
                      }}
                      contentEditable
                      onBlur={(e) => setRitualDescricaoEditando(e.currentTarget.innerHTML)}
                      className="min-h-[200px] w-full p-3 text-sm leading-relaxed text-zinc-300 focus:outline-none flex-1 overflow-y-auto custom-scrollbar"
                    />
                  </div>
                </section>
              </div>

              <div className="border-t border-zinc-800/80 bg-zinc-900/30 p-4 flex justify-end gap-3 shrink-0">
                <button
                  onClick={() => setRitualEditandoOrigem(null)}
                  className="rounded-lg border border-zinc-800/80 bg-zinc-900 px-4 py-2 text-sm font-bold text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    const finalDesc = ritualEditorRef.current?.innerHTML || ritualDescricaoEditando;
                    rituaisHook.editarRitual(ritualEditandoOrigem, ritualNomeEditando, finalDesc, ritualPropsEditando);
                    setRitualEditandoOrigem(null);
                  }}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-green-500"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      {modalTrilhasAberto && (
        <ModalTrilhas onClose={() => setModalTrilhasAberto(false)} />
      )}
      {modalVersatilidadeAberto && (
        <ModalTrilhas onClose={() => setModalVersatilidadeAberto(false)} modoVersatilidade={true} />
      )}
      {editandoTrilha && (
        <ModalEditarTrilha onClose={() => setEditandoTrilha(false)} />
      )}
      {editandoVersatilidade && (
        <ModalEditarTrilha onClose={() => setEditandoVersatilidade(false)} isVersatilidade={true} />
      )}
      {modalTrilhaPossuido65Aberto && (
        <ModalHabilidadeTrilhaExtra
          isOpen={true}
          onClose={() => setModalTrilhaPossuido65Aberto(false)}
          nexAtual={effectiveNex}
          apenas10={true}
          trilhaIdIgnorar={23}
          tituloCustom="Escolher 10% Trilha"
          onSelect={(habilidade) => {
            poderesHook.escolherPoderExtra(
              {
                Codigo_Poder: -1,
                Nome: habilidade.nome,
                Descricao: habilidade.descricao,
                Tipo: habilidade.tipo,
                PreRequisitos: habilidade.preRequisitos,
                Fonte: habilidade.fonte,
                Codigo_Regra: null,
                Elemento: null,
                Afinidade: null,
                Custo: null,
                Acao: null,
                Alcance: null,
                Alvo_Area: null,
                Duracao: null,
                Poder_Substituido: null
              } as any,
              undefined,
              undefined,
              'extra_possuido_trilha_65'
            );
            setModalTrilhaPossuido65Aberto(false);
          }}
        />
      )}
      {modalTrilhaExtraAberto && (
        <ModalHabilidadeTrilhaExtra
          isOpen={true}
          onClose={() => setModalTrilhaExtraAberto(false)}
          nexAtual={effectiveNex}
          onSelect={(habilidade) => {
            poderesHook.escolherPoderExtra(
              {
                Codigo_Poder: -1,
                Nome: habilidade.nome,
                Descricao: habilidade.descricao,
                Tipo: habilidade.tipo,
                PreRequisitos: habilidade.preRequisitos,
                Fonte: habilidade.fonte,
                Codigo_Regra: null,
                Elemento: null,
                Afinidade: null,
                Custo: null,
                Acao: null,
                Alcance: null,
                Alvo_Area: null,
                Duracao: null,
                Poder_Substituido: null
              } as any,
              undefined,
              undefined,
              'extra_regra37'
            );
            setModalTrilhaExtraAberto(false);
          }}
        />
      )}
      {modalExtraAberto && (
      <ModalPoderesExtra
        isOpen={modalExtraAberto}
        onClose={() => setModalExtraAberto(false)}
        poderesGerais={listaPoderesUtilidade}
        poderesParanormais={poderesParanormais}
        trilhas={trilhasHook.trilhas}
        onEscolher={(poder, elemento, periciaId) => {
          const nomePericia = periciaId ? periciasHook.nomesPericias[periciaId] : undefined;
          poderesHook.escolherPoderExtra(poder, elemento, nomePericia);
        }}
      />
      )}
      {modalPoderOutraClasseAberto && (
      <ModalPoderOutraClasse
        isOpen={modalPoderOutraClasseAberto}
        onClose={() => setModalPoderOutraClasseAberto(false)}
        categoriaPermitida={categoriaDiletante}
      />
      )}
      {modalPoderOutraOrigemAberto && (
      <ModalPoderOutraOrigem
        isOpen={modalPoderOutraOrigemAberto}
        onClose={() => setModalPoderOutraOrigemAberto(false)}
      />
      )}
    </div>
  );
};

// ============================================================
// COMPONENTE INTERNO: CHECKBOX DE REGRA OPCIONAL
// ============================================================
export const AbasPanel = React.memo(AbasPanelInner);

function RegraCheckbox({ nome, titulo, descricao }: { nome: string; titulo: string; descricao: string }) {
  const { regras, toggleRegra } = useRPG();
  const ativa = !!regras[nome];

  return (
    <div className="rounded-r border-l-4 border-zinc-700 bg-zinc-950/60 transition hover:bg-zinc-900/80">
      <div className="flex items-start gap-4 px-4 py-3.5">
        <input
          type="checkbox"
          checked={ativa}
          onChange={() => toggleRegra(nome)}
          className="mt-0.5 accent-green-600"
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-bold text-zinc-100">{titulo}</span>
          <p className="text-xs leading-relaxed text-zinc-500">{descricao}</p>
        </div>
      </div>
    </div>
  );
}
