import React from 'react';
import { useRPG } from '../../context/RPGContext';
import { InputOtimizado } from '../../components/InputOtimizado';
import { ModalRituais } from '../../components/ModalRituais';
import { ModalRituaisExtra } from '../../components/ModalRituaisExtra';
import { ModalTrilhas } from '../../components/ModalTrilhas';
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
import { ProgressaoNEXPanel } from './ProgressaoNEXPanel';
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

function sanidadePorNivel(classe: string | null): number {
  switch (classe) {
    case 'Especialista': return 3;
    case 'Combatente': return 2;
    case 'Ocultista': return 4;
    default: return 0;
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

export const AbasPanel: React.FC = () => {
  const {
    abaDireita, setAbaDireita,
    classe, nex,
    poderesHook,
    origensHook,
    filtroHabilidades, setFiltroHabilidades,
    habilidadesExpandidas, setHabilidadesExpandidas,
    setNexModalAberto,
    setNexPoderEditando, setNomeEditando, setDescricaoEditando,
    setAbaModalPoderes,
    setTipoModalPoderes,
    regras,
    rituaisHook,
    rituaisExpandidos, setRituaisExpandidos,
    versaoRitual, setVersaoRitual,
    elementoRitual, setElementoRitual,
    status, trilhasHook,
  } = useRPG();

  const [escolhendoRitualPlaceholder, setEscolhendoRitualPlaceholder] = React.useState<{ origem: string, nex?: number } | null>(null);
  const [ritualEditandoOrigem, setRitualEditandoOrigem] = React.useState<string | null>(null);
  const [ritualNomeEditando, setRitualNomeEditando] = React.useState('');
  const [ritualDescricaoEditando, setRitualDescricaoEditando] = React.useState('');
  const [ritualPropsEditando, setRitualPropsEditando] = React.useState<import('../../types').RitualAprendido['customProps']>({});
  const [ritualVersaoEditando, setRitualVersaoEditando] = React.useState<'normal' | 'discente' | 'verdadeiro'>('normal');
  const [modalTrilhasAberto, setModalTrilhasAberto] = React.useState(false);
  const [modalVersatilidadeAberto, setModalVersatilidadeAberto] = React.useState(false);
  const [modalExtraAberto, setModalExtraAberto] = React.useState(false);
  const [modalRituaisExtraAberto, setModalRituaisExtraAberto] = React.useState(false);
  const [filtroRituais, setFiltroRituais] = React.useState('');
  const [editandoTrilha, setEditandoTrilha] = React.useState(false);
  const [editandoVersatilidade, setEditandoVersatilidade] = React.useState(false);
  const ritualEditorRef = React.useRef<HTMLDivElement>(null);

  const { poderClasse, poderesClasse, poderesEscolhidos, poderesParanormais, removerPoder, listaPoderesUtilidade, escolherPoderExtra } = poderesHook;
  const { origemSelecionada } = origensHook;
  const { afinidadeEscolhida, afinidadeAtiva, nivel } = useRPG();
  const effectiveNex = regras['nex_experiencia'] ? (nivel * 5) : nex;

  React.useEffect(() => {
    const handler = (e: any) => {
      setEscolhendoRitualPlaceholder({ origem: `poder_57_${e.detail.nex}`, nex: e.detail.nex });
    };
    window.addEventListener('abrirModalRituais', handler);
    return () => window.removeEventListener('abrirModalRituais', handler);
  }, []);

  const poderesParanormaisMap = React.useMemo(() => {
    const map = new Map<string, typeof poderesParanormais[0]>();
    poderesParanormais.forEach(pp => {
      map.set(pp.Nome.toLowerCase(), pp);
    });
    return map;
  }, [poderesParanormais]);

  React.useEffect(() => {
    let changed = false;
    const novosPoderes = { ...poderesHook.poderesEscolhidos };
    
    if (regras['nex_experiencia']) {
      Object.entries(novosPoderes).forEach(([key, p]) => {
        const keyNum = parseInt(key, 10);
        if (!isNaN(keyNum) && keyNum >= 1000) return; // Ignora slots específicos da Progressão NEX
        
        const nomeBase = p.nome.toLowerCase().startsWith('aprender ritual') ? 'aprender ritual' : p.nome.toLowerCase().trim();
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
      const nomeBase = p.nome.toLowerCase().startsWith('aprender ritual') ? 'aprender ritual' : p.nome.toLowerCase().trim();
      const pp = poderesParanormaisMap.get(nomeBase);
      contagemPoderes[nomeBase] = (contagemPoderes[nomeBase] || 0) + 1;
      
      if (pp) {
        if (!primeiraVez[nomeBase]) {
          primeiraVez[nomeBase] = key;
        } else {
          afinidadesAdquiridas[nomeBase] = key;
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

    // 1.1 Poder Extra da Origem (Regra 1)
    if (origemSelecionada?.Codigo_Regra === 1) {
      const extraKey = 'extra_regra1';
      const escolhido = poderesEscolhidos[extraKey];
      if (escolhido) {
        lista.push({
          id: `escolha_${extraKey}`,
          nome: escolhido.nome,
          descricao: escolhido.descricao,
          tipo: 'Transcender (Origem)',
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
          tipo: 'Transcender (Origem)',
          categoria: 'paranormais',
          isSlotVazio: true,
          nexDoSlot: 0
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
    const patamares = [10, 20, 30, 40, 50, 60, 70, 80, 90, 99];
    patamares.forEach(nivelPatamar => {
      if (effectiveNex >= nivelPatamar) {
        const escolhido = poderesEscolhidos[nivelPatamar];
        if (escolhido) {
          const isAprenderRitual = escolhido.nome.toLowerCase().startsWith('aprender ritual (');
          const nomePoderBase = isAprenderRitual ? 'aprender ritual' : escolhido.nome.toLowerCase();
          const pp = poderesParanormaisMap.get(nomePoderBase);
          
          let elementoDoPoder = pp?.Elemento;
          if (isAprenderRitual) {
            const ra = rituaisHook.rituaisAprendidos?.find(r => r.origem === `poder_57_${nivel}`);
            if (ra) {
              const rBase = rituaisHook.rituais.find(r => r.Codigo_Ritual === ra.codigo_ritual);
              const isLista = rBase?.Elemento_Ritual.toLowerCase() === 'lista' || rBase?.Elemento_Ritual.toLowerCase() === 'varia';
              elementoDoPoder = isLista ? ra.elemento_escolhido : rBase?.Elemento_Ritual;
            }
          }

          let categoria: CategoriaHabilidade;
          if (pp) {
            categoria = 'paranormais';
          } else if (escolhido.tipo?.toLowerCase() === 'geral') {
            categoria = 'gerais';
          } else {
            categoria = 'utilidade';
          }
          const nivelLabel = regras['nex_experiencia'] ? `Nível ${calcularNivel(nivelPatamar)}` : `NEX ${nivelPatamar}%`;
          const tipoLabel = categoria === 'paranormais' ? `Transcender ${nivelPatamar}%` : nivelLabel;
          const afinidadeDoPoder = pp?.Afinidade;
          const afinidadeAtiva = afinidadeDoPoder ? contagemPoderes[nomePoderBase] >= 2 : false;
          const nomeBaseCheck = escolhido.nome.toLowerCase().trim();
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
            lista.push({ id: `escolha_nex_${nivelPatamar}`, nome: escolhido.nome, descricao: escolhido.descricao, tipo: finalTipoLabel, preRequisitos: escolhido.preRequisitos, fonte: escolhido.fonte || pp?.Fonte, elemento: elementoDoPoder, afinidade: afinidadeDoPoder, afinidadeAtiva, afinidadeAdquiridaKey: adqKey, categoria });
          }
        } else {
          const nivelLabel = regras['nex_experiencia'] ? `Nível ${calcularNivel(nivelPatamar)}` : `NEX ${nivelPatamar}%`;
          lista.push({ id: `escolha_nex_${nivelPatamar}`, nome: 'Escolher Poder de Utilidade', descricao: 'Clique no "+" para abrir a lista e selecionar seu poder.', tipo: nivelLabel, isSlotVazio: true, nexDoSlot: nivelPatamar, categoria: 'utilidade' });
        }
      }
    });

    // 4. Combate
    const patamaresCombate = [15, 25, 35, 45, 55, 65, 75, 85, 95];
    patamaresCombate.forEach(nivelPatamar => {
      if (effectiveNex >= nivelPatamar) {
        const escolhido = poderesEscolhidos[nivelPatamar];
        if (escolhido) {
          const isAprenderRitual = escolhido.nome.toLowerCase().startsWith('aprender ritual (');
          const nomePoderBase = isAprenderRitual ? 'aprender ritual' : escolhido.nome.toLowerCase();
          const pp = poderesParanormaisMap.get(nomePoderBase);
          
          let elementoDoPoder = pp?.Elemento;
          if (isAprenderRitual) {
            const ra = rituaisHook.rituaisAprendidos?.find(r => r.origem === `poder_57_${nivel}`);
            if (ra) {
              const rBase = rituaisHook.rituais.find(r => r.Codigo_Ritual === ra.codigo_ritual);
              const isLista = rBase?.Elemento_Ritual.toLowerCase() === 'lista' || rBase?.Elemento_Ritual.toLowerCase() === 'varia';
              elementoDoPoder = isLista ? ra.elemento_escolhido : rBase?.Elemento_Ritual;
            }
          }

          let categoria: CategoriaHabilidade;
          if (pp) {
            categoria = 'paranormais';
          } else if (escolhido.tipo?.toLowerCase() === 'geral') {
            categoria = 'gerais';
          } else {
            categoria = 'combate';
          }
          const nivelLabel = regras['nex_experiencia'] ? `Nível ${calcularNivel(nivelPatamar)}` : `NEX ${nivelPatamar}%`;
          const tipoLabel = categoria === 'paranormais' ? `Transcender ${nivelPatamar}%` : nivelLabel;
          const afinidadeDoPoder = pp?.Afinidade;
          const afinidadeAtiva = afinidadeDoPoder ? contagemPoderes[nomePoderBase] >= 2 : false;
          const nomeBaseCheck = escolhido.nome.toLowerCase().trim();
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
            lista.push({ id: `escolha_nex_combate_${nivelPatamar}`, nome: escolhido.nome, descricao: escolhido.descricao, tipo: finalTipoLabel, preRequisitos: escolhido.preRequisitos, fonte: escolhido.fonte || pp?.Fonte, elemento: elementoDoPoder, afinidade: afinidadeDoPoder, afinidadeAtiva, afinidadeAdquiridaKey: adqKey, categoria });
          }
        } else {
          const nivelLabel = regras['nex_experiencia'] ? `Nível ${calcularNivel(nivelPatamar)}` : `NEX ${nivelPatamar}%`;
          lista.push({ id: `escolha_nex_combate_${nivelPatamar}`, nome: 'Escolher Poder de Combate', descricao: 'Clique no "+" para abrir a lista e selecionar seu poder de combate.', tipo: nivelLabel, isSlotVazio: true, nexDoSlot: nivelPatamar, categoria: 'combate' });
        }
      }
    });

    // 5. Poderes Extras
    Object.keys(poderesEscolhidos).forEach(key => {
      if (String(key).startsWith('extra_') && key !== 'extra_regra1') {
        const escolhido = poderesEscolhidos[key];
        const isAprenderRitual = escolhido.nome.toLowerCase().startsWith('aprender ritual (');
        const nomePoderBase = isAprenderRitual ? 'aprender ritual' : escolhido.nome.toLowerCase();
        const pp = poderesParanormaisMap.get(nomePoderBase);
        
        let elementoDoPoder = pp?.Elemento;
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
        } else if (escolhido.tipo?.toLowerCase() === 'geral') {
          categoria = 'gerais';
        } else {
          categoria = 'utilidade';
        }
        const tipoLabel = categoria === 'paranormais' ? `Transcender Extra` : `Extra`;
        const afinidadeDoPoder = pp?.Afinidade;
        const afinidadeAtiva = afinidadeDoPoder ? contagemPoderes[nomePoderBase] >= 2 : false;
        const nomeBaseCheck = escolhido.nome.toLowerCase().trim();
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
          lista.push({ id: `escolha_extra_${key}`, nome: escolhido.nome, descricao: escolhido.descricao, tipo: finalTipoLabel, preRequisitos: escolhido.preRequisitos, fonte: escolhido.fonte || pp?.Fonte, elemento: elementoDoPoder, afinidade: afinidadeDoPoder, afinidadeAtiva, afinidadeAdquiridaKey: adqKey, categoria });
        }
      }
    });

    // 6. Transcender via Progressão de NEX (Custom)
    const patamaresTranscenderProgressao = [25, 35, 50, 60, 75, 90];
    patamaresTranscenderProgressao.forEach(nivelPatamar => {
      const chave = 1000 + nivelPatamar;
      const escolhido = poderesEscolhidos[chave];
      if (escolhido) {
        const isAprenderRitual = escolhido.nome.toLowerCase().startsWith('aprender ritual (');
        const nomePoderBase = isAprenderRitual ? 'aprender ritual' : escolhido.nome.toLowerCase();
        const pp = poderesParanormaisMap.get(nomePoderBase);
        
        let elementoDoPoder = pp?.Elemento;
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
        const afinidadeDoPoder = pp?.Afinidade;
        const afinidadeAtiva = afinidadeDoPoder ? contagemPoderes[nomePoderBase] >= 2 : false;
        
        const nomeBaseCheck = escolhido.nome.toLowerCase().trim();
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
            categoria: 'paranormais'
          });
        }
      }
    });
    // Desbloqueio Cronológico: Separado por Combate e Utilidade/Trilha
    const slotsVazios = lista.filter(h => h.isSlotVazio && h.nexDoSlot !== undefined);
    if (slotsVazios.length > 0) {
      const vaziosCombate = slotsVazios.filter(h => h.categoria === 'combate');
      const vaziosUtilidade = slotsVazios.filter(h => h.categoria === 'utilidade');
      const vaziosTrilha = slotsVazios.filter(h => h.categoria === 'trilha');
      
      const menorNexCombate = vaziosCombate.length > 0 ? Math.min(...vaziosCombate.map(h => h.nexDoSlot!)) : Infinity;
      const menorNexUtilidade = vaziosUtilidade.length > 0 ? Math.min(...vaziosUtilidade.map(h => h.nexDoSlot!)) : Infinity;
      const menorNexTrilha = vaziosTrilha.length > 0 ? Math.min(...vaziosTrilha.map(h => h.nexDoSlot!)) : Infinity;
      
      lista = lista.filter(h => {
        if (h.isSlotVazio && h.nexDoSlot !== undefined) {
          if (h.categoria === 'combate') {
            return h.nexDoSlot <= menorNexCombate;
          } else if (h.categoria === 'utilidade') {
            return h.nexDoSlot <= menorNexUtilidade;
          } else if (h.categoria === 'trilha') {
            return h.nexDoSlot <= menorNexTrilha;
          }
        }
        return true;
      });
    }

    return lista;
  }, [classe, nex, nivel, origemSelecionada, poderClasse, poderesClasse, poderesEscolhidos, poderesParanormaisMap, rituaisHook.rituaisAprendidos, rituaisHook.rituais, regras, trilhasHook.trilhaSelecionada, trilhasHook.versatilidadeSelecionada]);

  const habilidadesFiltradas = listaHabilidades.filter(hab =>
    hab.nome.toLowerCase().includes(filtroHabilidades.toLowerCase())
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
    <div className="flex flex-col h-full min-h-0 rounded-lg border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="mb-5 flex flex-wrap gap-x-1 gap-y-1 border-b border-zinc-800">
        {(['combate','habilidades','rituais','inventario','descricao','regras'] as const).map(aba => (
          <button key={aba} onClick={() => setAbaDireita(aba)}
            className={`px-1.5 py-2 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
              abaDireita === aba ? 'border-b-2 border-red-800 text-zinc-100' : 'border-b-2 border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >{aba === 'inventario' ? 'Inventário' : aba === 'descricao' ? 'Descrição' : aba === 'regras' ? 'Regras' : aba}</button>
        ))}
      </div>

      <div className="mt-2 flex flex-1 flex-col min-h-0">
        {abaDireita === 'combate' && <div className="mt-5 text-center italic text-zinc-600">Conteúdo de Combate</div>}

        {abaDireita === 'habilidades' && (
          <div className="flex flex-1 flex-col min-h-0">
            <div className="mb-5 flex items-center gap-4">
              <InputOtimizado value={filtroHabilidades} onChange={setFiltroHabilidades}
                placeholder="Filtrar habilidades..."
                className="flex-1 border-b border-zinc-700 bg-transparent py-2 text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-red-700"
              />
              <button onClick={() => setModalExtraAberto(true)} className="whitespace-nowrap rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-200 transition hover:border-red-800 hover:bg-red-950/40">+ Adicionar</button>
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
                      {itensDaCategoria.map(hab => {
                        const estaExpandida = habilidadesExpandidas.includes(hab.id);

                        if (hab.isSlotVazio) {
                          return (
                            <div
                              key={hab.id}
                              onClick={() => {
                                if (hab.categoria === 'trilha') {
                                  if (hab.id === 'escolha_versatilidade') {
                                    setModalVersatilidadeAberto(true);
                                  } else {
                                    setModalTrilhasAberto(true);
                                  }
                                } else if (hab.id === 'escolha_extra_regra1') {
                                  setTipoModalPoderes('utilidade');
                                  setAbaModalPoderes('paranormais');
                                  setNexModalAberto('extra_regra1');
                                } else {
                                  const tipo = hab.id.includes('combate') ? 'combate' : 'utilidade';
                                  setTipoModalPoderes(tipo);
                                  setAbaModalPoderes(tipo === 'combate' ? 'combate' : 'classe');
                                  setNexModalAberto(hab.nexDoSlot ?? (extrairKeyDoId(hab.id) as number));
                                }
                              }}
                              className="group flex w-full cursor-pointer flex-col overflow-hidden rounded border-2 border-dashed border-zinc-700 border-l-zinc-600 border-l-4 bg-zinc-900/40 transition hover:border-red-800 hover:bg-zinc-900/80"
                              style={{ borderLeftStyle: 'solid' }}
                            >
                              <div className="flex items-center justify-between gap-3 bg-zinc-800/40 px-4 py-3 transition group-hover:bg-zinc-800/60">
                                <div className="flex flex-col items-start gap-0.5 text-left">
                                  <span className="text-sm font-bold text-zinc-400 group-hover:text-zinc-300">{hab.nome}</span>
                                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-400">{hab.tipo}</span>
                                </div>
                                <span className="whitespace-nowrap rounded bg-red-900/40 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-red-400 transition group-hover:bg-red-900/60 group-hover:text-red-300">+ Adicionar</span>
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

                          const nexLevels = isVersatilidade ? [10] : [10, 40, 65, 99];
                          
                          return (
                            <div key={hab.id} className="mb-3 overflow-hidden rounded-r border-l-4 border-red-800 bg-zinc-900/50">
                              <div
                                onClick={() => trilhasHook.toggleTrilhaExpandida(isVersatilidade ? t.Codigo_Trilha + 10000 : t.Codigo_Trilha)}
                                className="flex cursor-pointer items-center justify-between gap-3 bg-zinc-800/40 px-4 py-3 transition hover:bg-zinc-700/50"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-zinc-100">{isVersatilidade ? 'Versatilidade' : t.Nome_Trilha}</span>
                                  {!isVersatilidade && (
                                    <span className="text-[10px] uppercase text-zinc-500">
                                      ({t.nome_pericia})
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-zinc-600">
                                    {trilhasHook.trilhasExpandidas.includes(isVersatilidade ? t.Codigo_Trilha + 10000 : t.Codigo_Trilha) ? '▲' : '▼'}
                                  </span>
                                </div>
                              </div>
              
                              {trilhasHook.trilhasExpandidas.includes(isVersatilidade ? t.Codigo_Trilha + 10000 : t.Codigo_Trilha) && (
                                <div className="p-4 text-sm text-zinc-400">
                                  <div
                                    className="mb-4 text-zinc-300"
                                    dangerouslySetInnerHTML={{ __html: formatarDescricao(isVersatilidade ? `Em ${regras['nex_experiencia'] ? 'Nível 10' : 'NEX 50%'}, escolha entre receber um poder de ${classe.toLowerCase()} ou o primeiro poder de uma trilha de ${classe.toLowerCase()} que não a sua.<br/><br/>Trilha Escolhida: <strong>${t.Nome_Trilha}</strong>` : t.Descricao_Trilha) }}
                                  />
              
                                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-red-400 border-b border-zinc-800 pb-1">
                                    {isVersatilidade ? 'Poder da Trilha' : 'Habilidades da Trilha'}
                                  </h4>
              
                                  {nexLevels.map((nexLvl) => {
                                    if (effectiveNex < nexLvl) return null;

                                    const habNameKey = `Nome_Habilidade_${nexLvl}` as keyof typeof t;
                                    const habDescKey = `Descricao_Habilidade_${nexLvl}` as keyof typeof t;
                                    const nomeHab = t[habNameKey] as string;
                                    const descHab = t[habDescKey] as string;
              
                                    if (!nomeHab) return null;
              
                                    const uniqueHabId = `trilha_${isVersatilidade ? 'versatilidade_' : ''}${t.Codigo_Trilha}_hab_${nexLvl}`;
                                    const isHabExpanded = habilidadesExpandidas.includes(uniqueHabId);
              
                                    return (
                                      <div key={nexLvl} className="mb-2 overflow-hidden rounded border border-zinc-800 bg-zinc-900/50">
                                        <div
                                          onClick={() => setHabilidadesExpandidas(prev => prev.includes(uniqueHabId) ? prev.filter(id => id !== uniqueHabId) : [...prev, uniqueHabId])}
                                          className="flex cursor-pointer items-center justify-between px-3 py-2 transition hover:bg-zinc-800"
                                        >
                                          <span className="font-bold text-zinc-200 text-xs">
                                            {regras['nex_experiencia'] ? `Nível ${calcularNivel(nexLvl)}` : `NEX ${nexLvl}%`} - <span className="text-zinc-400">{nomeHab}</span>
                                          </span>
                                          <span className="text-xs text-zinc-600">
                                            {isHabExpanded ? '▲' : '▼'}
                                          </span>
                                        </div>
                                        {isHabExpanded && (
                                          <div
                                            className="px-3 pb-3 pt-1 text-xs text-zinc-400"
                                            dangerouslySetInnerHTML={{ __html: formatarDescricao(descHab) }}
                                          />
                                        )}
                                      </div>
                                    );
                                  })}
                                  {t.Fonte_Trilha && (
                                     <div className="mt-3 flex justify-end">
                                       <span className="text-[10px] uppercase tracking-wider text-zinc-600">Fonte: {t.Fonte_Trilha}</span>
                                     </div>
                                  )}

                                  <div className="mt-4 flex gap-2.5">
                                    {!isVersatilidade && (
                                      <button onClick={(e) => { e.stopPropagation(); setEditandoTrilha(true); }}
                                        className="flex-1 rounded border border-zinc-700 bg-zinc-800 p-2 text-xs font-bold text-zinc-200 transition hover:bg-zinc-700"
                                      >Editar</button>
                                    )}
                                    <button onClick={(e) => { e.stopPropagation(); isVersatilidade ? trilhasHook.setVersatilidadeSelecionada(null) : trilhasHook.setTrilhaSelecionada(null); }}
                                      className="flex-1 rounded border border-red-900/50 bg-red-950/30 p-2 text-xs font-bold text-red-500 transition hover:bg-red-900/50 hover:text-red-300"
                                    >Remover</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        }

                        return (
                          <div key={hab.id}
                            className={`overflow-hidden rounded-r border-l-4 bg-zinc-900/50 ${hab.categoria === 'paranormais' ? 'border-l-0' : 'border-red-800'}`}
                          >
                            {hab.elemento && (
                              <div className="h-0.5 w-full" style={{ background: obterCorBadge(hab.elemento) }} />
                            )}

                            <div onClick={() => {
                              setHabilidadesExpandidas(prev =>
                                prev.includes(hab.id) ? prev.filter(id => id !== hab.id) : [...prev, hab.id]
                              );
                            }}
                              className="flex cursor-pointer items-center justify-between gap-2 bg-zinc-800/40 px-4 py-3 transition hover:bg-zinc-700/50"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-zinc-100">{hab.nome}</span>
                                {hab.extra && <span className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-xs font-bold text-amber-400">{hab.extra}</span>}
                              </div>
                              <div className="flex items-center gap-2.5">
                                <span className="rounded border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[0.65rem] uppercase tracking-wider text-zinc-500">{hab.tipo}</span>
                                <span className="text-xs text-zinc-600">{estaExpandida ? '▲' : '▼'}</span>
                              </div>
                            </div>

                            {estaExpandida && (
                              <div className="px-4 py-4 text-left text-sm leading-relaxed text-zinc-400">
                                {/* 🔥 Badge do elemento ACIMA da descrição — text-[9px] ~ pequeno */}
                                {hab.elemento && (
                                  <div className="mb-3">
                                    <span className="inline-block rounded px-2 py-px text-[9px] font-bold uppercase tracking-wider leading-tight"
                                      style={{ background: obterCorBadge(hab.elemento), color: obterCorTexto(hab.elemento) }}
                                    >{hab.elemento}</span>
                                  </div>
                                )}

                                <div dangerouslySetInnerHTML={{ __html: formatarDescricao(hab.descricao) }} />

                                {/* 🔥 Afinidade: texto puro */}
                                {hab.afinidade && (
                                  <div className={`mt-2 text-sm leading-relaxed transition-opacity duration-300 ${hab.afinidadeAtiva ? 'text-zinc-300 opacity-100' : 'text-zinc-500 opacity-40'}`}>
                                    {hab.afinidadeAtiva && hab.afinidadeAdquiridaKey && (
                                      <div className="flex justify-end mb-2">
                                        <span className="text-[0.65rem] uppercase tracking-widest text-zinc-500 font-semibold bg-zinc-800/50 px-2 py-0.5 rounded">
                                          {String(hab.afinidadeAdquiridaKey).startsWith('extra_') ? 'Transcender Extra' : (
                                            (parseInt(String(hab.afinidadeAdquiridaKey), 10) >= 1000) ? 
                                            `Transcender ${parseInt(String(hab.afinidadeAdquiridaKey), 10) - 1000}%` :
                                            `Transcender ${parseInt(String(hab.afinidadeAdquiridaKey), 10)}%`
                                          )}
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
                                          className="text-[10px] font-bold uppercase tracking-wider text-red-500/70 transition hover:text-red-400"
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

                                {hab.id.startsWith('escolha_nex_') && (
                                  <div className="mt-4 flex gap-2.5">
                                    <button onClick={(e) => { e.stopPropagation(); const nivel = extrairKeyDoId(hab.id); if (nivel !== null) { setNexPoderEditando(nivel); setNomeEditando(hab.nome); setDescricaoEditando(hab.descricao); } }}
                                      className="flex-1 rounded border border-zinc-700 bg-zinc-800 p-2 text-xs font-bold text-zinc-200 transition hover:bg-zinc-700"
                                    >Editar</button>
                                    <button onClick={(e) => { 
                                      e.stopPropagation(); 
                                      const nivel = extrairKeyDoId(hab.id); 
                                      if (nivel !== null) {
                                        const escolhido = poderesEscolhidos[nivel as any];
                                        if (escolhido) {
                                          const nomePoder = escolhido.nome.toLowerCase();
                                          const baseName = nomePoder.startsWith('aprender ritual (') ? 'aprender ritual' : nomePoder;
                                          const isParanormal = poderesParanormaisMap.has(baseName) || baseName === 'aprender ritual';
                                          
                                          if (isParanormal) {
                                            const perda = sanidadePorNivel(classe);
                                            if (regras['sem_sanidade']) {
                                              status.setPdMax(prev => prev + perda);
                                              status.setPdAtual(prev => (prev ?? status.pdMax) + perda);
                                            } else {
                                              status.setSanMax(prev => prev + perda);
                                              status.setSanAtual(prev => (prev ?? status.sanMax) + perda);
                                            }
                                          }

                                          if (baseName === 'aprender ritual') {
                                            const ra = rituaisHook.rituaisAprendidos.find(r => r.origem === `poder_57_${nivel}` || r.origem === `poder_57_combate_${nivel}`);
                                            if (ra) rituaisHook.esquecerRitual(ra.origem);
                                          }
                                        }
                                        removerPoder(nivel); 
                                      }
                                    }}
                                      className="flex-1 rounded border border-red-900 bg-transparent p-2 text-xs font-bold text-red-500 transition hover:bg-red-950/40"
                                    >Remover Poder</button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
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
                const nivelNum = isExtra ? nex : parseInt(chave, 10);
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
            if (nex >= 5) {
              todosSlots.push({ index: 1, nex: 5, maxCirculo: 1 });
              todosSlots.push({ index: 2, nex: 5, maxCirculo: 1 });
              todosSlots.push({ index: 3, nex: 5, maxCirculo: 1 });
            }
            for (let n = 10; n <= nex; n += 5) {
              let c = 1;
              if (n >= 85) c = 4;
              else if (n >= 55) c = 3;
              else if (n >= 25) c = 2;
              todosSlots.push({ index: todosSlots.length + 1, nex: n, maxCirculo: c });
            }
            
            // Filtra os que já foram pegos
            for (const slot of todosSlots) {
              const pego = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === `ocultista_${slot.index}`);
              if (!pego) {
                slotsOcultistaPendentesList.push({ ...slot, isOcultista: true });
              }
            }
          }

          // 3. Desbloqueio Cronológico por Círculo
          const allRitualSlots = [...slotsPoderPendentesList, ...slotsOcultistaPendentesList];
          const sortedSlots = allRitualSlots.sort((a, b) => {
             if (a.nex !== b.nex) return a.nex - b.nex;
             if (a.isOcultista && !b.isOcultista) return -1;
             if (!a.isOcultista && b.isOcultista) return 1;
             if (a.isOcultista && b.isOcultista) return (a as any).index - (b as any).index;
             return 0;
          });

          const visibleRitualSlots = [];
          const circlesSeen = new Set<number>();
          for (const slot of sortedSlots) {
             if (!circlesSeen.has(slot.maxCirculo)) {
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

              <div className="mb-5 flex items-center gap-4">
                <InputOtimizado value={filtroRituais} onChange={setFiltroRituais}
                  placeholder="Filtrar rituais..."
                  className="flex-1 border-b border-zinc-700 bg-transparent py-2 text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-red-700"
                />
                <button onClick={() => setModalRituaisExtraAberto(true)} className="whitespace-nowrap rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-200 transition hover:border-red-800 hover:bg-red-950/40">+ Adicionar</button>
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
                    <p className="text-xs italic mt-2">Transceda e adquira o poder Aprender Ritual para adicionar rituais à sua lista.</p>
                  </div>
                )}



                {/* Agrupamento por Círculo usando Rituais Aprendidos */}
              {[1, 2, 3, 4].map(circulo => {
                const rituaisAprendidosNesteCirculo = (rituaisHook.rituaisAprendidos || [])
                  .map(ra => {
                    const base = rituaisHook.rituais.find(r => r.Codigo_Ritual === ra.codigo_ritual);
                    return base ? { ...base, Origem: ra.origem, ElementoEscolhidoPermanente: ra.elemento_escolhido, customNome: ra.customNome, customDesc: ra.customDesc, customProps: ra.customProps } : null;
                  })
                  .filter(r => r && r.Circulo_Ritual === circulo)
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
                      <span className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-zinc-600">{circulo}° Círculo</span>
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
                                setEscolhendoRitualPlaceholder({ origem: `ocultista_${(slot as any).index}`, nex: slot.nex });
                              }}
                              className="group flex w-full cursor-pointer flex-col overflow-hidden rounded border-2 border-dashed border-zinc-700 border-l-zinc-600 border-l-4 bg-zinc-900/40 transition hover:border-red-800 hover:bg-zinc-900/80"
                              style={{ borderLeftStyle: 'solid' }}
                            >
                              <div className="flex items-center justify-between gap-3 bg-zinc-800/40 px-4 py-3 transition group-hover:bg-zinc-800/60">
                                <div className="flex flex-col items-start gap-0.5 text-left">
                                  <span className="text-sm font-bold text-zinc-400 group-hover:text-zinc-300">Escolher Ritual</span>
                                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-400">
                                    Ocultista ({regras['nex_experiencia'] ? `Nível ${calcularNivel(slot.nex)}` : `NEX ${slot.nex}%`})
                                  </span>
                                </div>
                                <span className="whitespace-nowrap rounded bg-red-900/40 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-red-400 transition group-hover:bg-red-900/60 group-hover:text-red-300">+ Adicionar</span>
                              </div>
                            </div>
                          );
                        } else {
                          const chave = (slot as any).chave;
                          const isExtra = chave.startsWith('extra_');
                          const nivelNum = isExtra ? nex : parseInt(chave, 10);
                          const labelNex = regras['nex_experiencia'] ? `Poder Nível ${calcularNivel(nivelNum)}` : `Poder NEX ${nivelNum}%`;
                          return (
                            <div
                              key={`vazio_poder_${chave}_${idx}`}
                              onClick={() => setEscolhendoRitualPlaceholder({ origem: `poder_57_${chave}`, nex: isExtra ? nex : nivelNum })}
                              className="group flex w-full cursor-pointer flex-col overflow-hidden rounded border-2 border-dashed border-zinc-700 border-l-zinc-600 border-l-4 bg-zinc-900/40 transition hover:border-red-800 hover:bg-zinc-900/80"
                              style={{ borderLeftStyle: 'solid' }}
                            >
                              <div className="flex items-center justify-between gap-3 bg-zinc-800/40 px-4 py-3 transition group-hover:bg-zinc-800/60">
                                <div className="flex flex-col items-start gap-0.5 text-left">
                                  <span className="text-sm font-bold text-zinc-400 group-hover:text-zinc-300">Escolher Ritual</span>
                                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-400">
                                    {labelNex}
                                  </span>
                                </div>
                                <span className="whitespace-nowrap rounded bg-red-900/40 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-red-400 transition group-hover:bg-red-900/60 group-hover:text-red-300">+ Adicionar</span>
                              </div>
                            </div>
                          );
                        }
                      })}
                      {rituaisAprendidosNesteCirculoFiltrados.map(ritual => {
                        if (!ritual) return null;
                        
                        // O código único na interface do usuário agora é uma combinação do código do ritual e a origem (para suportar o mesmo ritual pego mais de uma vez, caso aconteça)
                        const chaveUnica = `${ritual.Codigo_Ritual}_${ritual.Origem}`;
                        const expandido = rituaisExpandidos.includes(chaveUnica as any);
                        const versao: VersaoRitual = versaoRitual[chaveUnica] || 'normal';

                        const isLista = ritual.Elemento_Ritual.toLowerCase() === 'lista' || ritual.Elemento_Ritual.toLowerCase() === 'varia';
                        // Usa a escolha permanente feita na hora de aprender
                        const elementoEscolhido = isLista ? (ritual.ElementoEscolhidoPermanente || 'Sangue') : ritual.Elemento_Ritual;

                        const corElemento = obterCorBadge(elementoEscolhido);
                        const corPrimaria = obterCorElementoPrimario(elementoEscolhido);
                        const corTextoElemento = obterCorTexto(elementoEscolhido);

                        // Valores dinâmicos baseados na versão
                        const pe = ritual.customProps?.[versao]?.PE_Ritual || obterValorVersao(ritual.PE_Ritual, versao, ritual.Tem_Discente, ritual.Tem_Verdadeiro);
                        const alcance = ritual.customProps?.[versao]?.Alcance_Ritual || obterValorVersao(ritual.Alcance_Ritual, versao, ritual.Tem_Discente, ritual.Tem_Verdadeiro);
                        const area = ritual.customProps?.[versao]?.Area_Ritual || obterValorVersao(ritual.Area_Ritual, versao, ritual.Tem_Discente, ritual.Tem_Verdadeiro);
                        const alvo = ritual.customProps?.[versao]?.Alvo_Ritual || obterValorVersao(ritual.Alvo_Ritual, versao, ritual.Tem_Discente, ritual.Tem_Verdadeiro);
                        const duracao = ritual.customProps?.[versao]?.Duracao_Ritual || obterValorVersao(ritual.Duracao_Ritual, versao, ritual.Tem_Discente, ritual.Tem_Verdadeiro);
                        const execucao = ritual.customProps?.[versao]?.Execucao_Ritual || obterValorVersao(ritual.Execucao_Ritual, versao, ritual.Tem_Discente, ritual.Tem_Verdadeiro);
                        const efeito = ritual.customProps?.[versao]?.Efeito_Ritual || obterValorVersao(ritual.Efeito_Ritual, versao, ritual.Tem_Discente, ritual.Tem_Verdadeiro);
                        const resistencia = ritual.customProps?.[versao]?.Resistencia_Ritual || obterValorVersao(ritual.Resistencia_Ritual, versao, ritual.Tem_Discente, ritual.Tem_Verdadeiro);
                        const dados = ritual.customProps?.[versao]?.Dados_Ritual || obterValorVersao(ritual.Dados_Ritual, versao, ritual.Tem_Discente, ritual.Tem_Verdadeiro);

                        // Opções de versão disponíveis
                        const reqNormal = verificarAcessoCirculo(ritual.Circulo_Ritual, nex, classe);
                        const versoesDisponiveis: { value: VersaoRitual; label: string; disabled?: boolean; title?: string }[] = [
                          { 
                            value: 'normal', 
                            label: reqNormal.atende ? 'Normal' : `Normal (${reqNormal.motivo})`,
                            disabled: !reqNormal.atende,
                            title: reqNormal.motivo
                          },
                        ];
                        if (ritual.Tem_Discente) {
                          const req = verificarRequisitoRitual(ritual.Requisito_Discente, nex, classe, afinidadeAtiva, afinidadeEscolhida, ritual.Elemento_Ritual);
                          versoesDisponiveis.push({ 
                            value: 'discente', 
                            label: req.atende ? 'Discente' : `Discente (${req.motivo})`,
                            disabled: !req.atende,
                            title: req.motivo
                          });
                        }
                        if (ritual.Tem_Verdadeiro) {
                          const req = verificarRequisitoRitual(ritual.Requisito_Verdadeiro, nex, classe, afinidadeAtiva, afinidadeEscolhida, ritual.Elemento_Ritual);
                          versoesDisponiveis.push({ 
                            value: 'verdadeiro', 
                            label: req.atende ? 'Verdadeiro' : `Verdadeiro (${req.motivo})`,
                            disabled: !req.atende,
                            title: req.motivo
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
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2.5">
                                  {/* Badge do elemento */}
                                  <span
                                    className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 uppercase tracking-wider leading-tight"
                                    style={{ background: corElemento, color: corTextoElemento }}
                                  >
                                    <span className="text-[9px] font-bold">{elementoEscolhido}</span>
                                    <span className="text-[11px] font-black">{ritual.Circulo_Ritual}</span>
                                  </span>
                                  {/* Nome do ritual */}
                                  <span className="text-sm font-bold text-zinc-100">{ritual.customNome || ritual.Nome_Ritual}</span>
                                </div>
                                {/* Dados abaixo do título — todas as versões, ativa acesa */}
                                {ritual.Dados_Ritual && (() => {
                                  const partesDados = ritual.Dados_Ritual.split('/').map(p => p.trim());
                                  const normal = partesDados[0];

                                  // Só 1 valor = mostra direto
                                  if (partesDados.length === 1 && normal) {
                                    return <span className="text-sm font-bold text-amber-400">{normal}</span>;
                                  }

                                  // Preenche vazios com valor normal (convenção //)
                                  const preenchidas = partesDados.map(p => p || normal);

                                  // Se todos forem vazios, não mostra nada
                                  if (!preenchidas.some(p => p)) return null;

                                  // Índice ativo baseado na versão
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
                                            className={`text-sm font-bold transition-all duration-200 ${idx === ativo ? 'text-amber-400' : 'text-zinc-600'}`}
                                          >
                                            {parte}
                                          </span>
                                        </React.Fragment>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </div>

                              <div className="flex items-center gap-2.5">
                                {/* PE */}
                                <span className="rounded border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-xs font-bold text-blue-400">
                                  {pe} PE
                                </span>
                                {/* Seta */}
                                <span className="text-xs text-zinc-600">{expandido ? '▲' : '▼'}</span>
                              </div>
                            </div>

                            {/* ══════ CONTEÚDO EXPANDIDO ══════ */}
                            {expandido && (
                              <div className="border-t border-zinc-800 px-4 py-4 text-left text-sm leading-relaxed text-zinc-400">

                                {/* Dropdowns de configurações (Elemento e Versão) */}
                                {(isLista || versoesDisponiveis.length > 1) && (
                                  <div className="mb-4 flex flex-wrap items-center justify-between border-b border-zinc-800/50 pb-3">
                                    <div className="flex items-center gap-5">
                                      {/* Dropdown de Versão */}
                                      {versoesDisponiveis.length > 1 && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-600">Versão:</span>
                                          <select
                                            value={versao}
                                            onChange={e => {
                                              e.stopPropagation();
                                              setVersaoRitual(prev => ({
                                                ...prev,
                                                [chaveUnica]: e.target.value as VersaoRitual,
                                              }));
                                            }}
                                            className="cursor-pointer rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs font-bold text-zinc-200 outline-none transition hover:bg-zinc-800 focus:border-red-700"
                                          >
                                            {versoesDisponiveis.map(v => (
                                              <option key={v.value} value={v.value} disabled={v.disabled} title={v.title}>
                                                {v.label}
                                              </option>
                                            ))}
                                          </select>
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
                                          className={`block ${dimmed ? 'opacity-20' : ''} ${currentScope !== 'normal' && !dimmed ? 'text-zinc-300' : ''}`}
                                          style={{ transition: 'opacity 0.2s ease' }}
                                          dangerouslySetInnerHTML={{ __html: formatarDescricao(linha) }}
                                        />
                                      );
                                    });
                                  })()}
                                </div>

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
                                  >
                                    Editar Ritual
                                  </button>
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
                                      rituaisHook.esquecerRitual(ritual.Origem);
                                    }}
                                    className="rounded bg-red-900/30 border border-red-800 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-red-500 transition hover:bg-red-900/50 hover:text-red-400"
                                  >
                                    Esquecer Ritual
                                  </button>
                                </div>

                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
          );
        })()}
        {abaDireita === 'inventario' && <div className="mt-5 text-center italic text-zinc-600">Conteúdo de Inventário</div>}
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
              nome="sem_sanidade"
              titulo="Jogando sem Sanidade"
              descricao="Personagens não recebem mais PE ou SAN. Em vez disso, recebem Pontos de Determinação (PD) de acordo com sua classe."
            />
            <RegraCheckbox
              nome="reter_ritual"
              titulo="Reter Ritual"
              descricao="Retida. Quando conjura um ritual com duração cena, pode mudar a duração para retida como ação livre ou reação. Você retém os PE, reduzindo eles do seu valor atual e máximo. Enquanto você mantiver os PE retidos, o ritual permanecerá funcionando. Você está usando suas energias naturais e sobrenaturais para abrir sua comunicação com o Outro Lado e manter o fluxo a partir dela aberto. Entretanto, sempre que reter um ritual, você perde 1 SAN — manter seu pedido para o Outro Lado cobra seu preço."
            />
          </div>
        )}
      </div>

      {/* Modal de seleção de rituais EXTRAS para qualquer círculo */}
      {modalRituaisExtraAberto && (
        <ModalRituaisExtra
          rituais={rituaisHook.rituais || []}
          rituaisAprendidosIds={(rituaisHook.rituaisAprendidos || []).map((r: any) => r.codigo_ritual)}
          onClose={() => setModalRituaisExtraAberto(false)}
          onSelect={(ritual, elementoVaria) => {
            const origemExtra = `extra_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            
            rituaisHook.aprenderRitual({
              codigo_ritual: ritual.Codigo_Ritual,
              origem: origemExtra,
              elemento_escolhido: elementoVaria,
              customNome: ritual.Nome_Ritual,
              customDesc: ritual.Descricao_Ritual
            });
            
            setModalRituaisExtraAberto(false);
          }}
        />
      )}

      {/* Modal de seleção de rituais para os slots */}
      {escolhendoRitualPlaceholder && (
        <ModalRituais
          rituais={rituaisHook.rituais || []}
          limiteCirculo={
            escolhendoRitualPlaceholder.nex 
              ? (classe === 'Ocultista' 
                  ? (escolhendoRitualPlaceholder.nex >= 85 ? 4 : escolhendoRitualPlaceholder.nex >= 55 ? 3 : escolhendoRitualPlaceholder.nex >= 25 ? 2 : 1)
                  : (escolhendoRitualPlaceholder.nex >= 75 ? 3 : escolhendoRitualPlaceholder.nex >= 45 ? 2 : 1))
              : (nex >= 85 ? 4 : nex >= 55 ? 3 : nex >= 25 ? 2 : 1)
          }
          rituaisAprendidosIds={(rituaisHook.rituaisAprendidos || []).map((r: any) => r.codigo_ritual)}
          onClose={() => setEscolhendoRitualPlaceholder(null)}
          onSelect={(ritual, elementoVaria) => {
            const origem = escolhendoRitualPlaceholder.origem;
            
            rituaisHook.aprenderRitual({
              codigo_ritual: ritual.Codigo_Ritual,
              origem: origem,
              elemento_escolhido: elementoVaria,
            });

            // Se for de poder, atualiza o poder na lista de poderes escolhidos para mostrar o ritual escolhido!
            if (origem.startsWith('poder_57_')) {
              const chave = origem.replace('poder_57_', '').replace('combate_', '');
              // Tenta como número primeiro (slots normais), senão usa a string (extras)
              const chaveNum = parseInt(chave, 10);
              const key = isNaN(chaveNum) ? chave : chaveNum;
              const poderAtual = poderesEscolhidos[key];
              if (poderAtual) {
                const baseName = poderAtual.nome.toLowerCase().startsWith('aprender ritual (') ? 'aprender ritual' : poderAtual.nome.toLowerCase();
                const ppBase = poderesParanormais.find(p => p.Nome.toLowerCase() === baseName);
                if (ppBase) {
                  poderesHook.escolherPoder(key as number, {
                    codigo_poder: 57,
                    Nome: `Aprender Ritual (${ritual.Nome_Ritual})`,
                    Descricao: poderAtual.descricao,
                    PreRequisitos: poderAtual.preRequisitos,
                    Afinidade: poderAtual.afinidade,
                    Elemento: elementoVaria || ritual.Elemento_Ritual,
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

      {/* Modal para Edição Inline de Ritual */}
      {(() => {
        if (!ritualEditandoOrigem) return null;
        const ritualEditando = rituaisHook.rituaisAprendidos.find(r => r.origem === ritualEditandoOrigem);
        const ritualBase = ritualEditando ? rituaisHook.rituais.find(r => r.Codigo_Ritual === ritualEditando.codigo_ritual) : null;
        if (!ritualBase) return null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-md border border-zinc-700 bg-zinc-900 shadow-xl overflow-hidden flex flex-col max-h-full">
              <div className="bg-zinc-800 p-3 border-b border-zinc-700 font-bold text-zinc-200 flex justify-between items-center">
                <span>Personalizar Ritual</span>
              </div>
              <div className="p-4 flex flex-col gap-4 overflow-y-auto">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Nome Personalizado</label>
                  <InputOtimizado
                    value={ritualNomeEditando}
                    onChange={setRitualNomeEditando}
                    placeholder="Ex: Definhar, mas roxo..."
                    className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-red-700 focus:outline-none"
                  />
                </div>

                {(ritualBase.Tem_Discente || ritualBase.Tem_Verdadeiro) && (
                  <div className="flex flex-col gap-1.5 border-t border-zinc-800 pt-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Propriedades Específicas por Versão</label>
                    <select
                      value={ritualVersaoEditando}
                      onChange={(e) => setRitualVersaoEditando(e.target.value as any)}
                      className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm font-bold text-zinc-200 focus:border-red-700 focus:outline-none w-fit"
                    >
                      <option value="normal">Normal</option>
                      {ritualBase.Tem_Discente && <option value="discente">Discente</option>}
                      {ritualBase.Tem_Verdadeiro && <option value="verdadeiro">Verdadeiro</option>}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
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
                  return (
                    <div key={prop.key} className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">{prop.label}</label>
                      <InputOtimizado
                        value={(ritualPropsEditando?.[ritualVersaoEditando] as any)?.[prop.key] || ''}
                        onChange={(val) => setRitualPropsEditando(prev => ({ ...prev, [ritualVersaoEditando]: { ...(prev?.[ritualVersaoEditando] || {}), [prop.key]: val } }))}
                        placeholder={valorCalculado ? String(valorCalculado) : 'Padrão'}
                        className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-red-700 focus:outline-none"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-1.5 flex-1 min-h-[150px]">
                <div className="flex flex-col flex-1">
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
                    className="min-h-[200px] w-full rounded-b border border-zinc-700 bg-zinc-950 p-3 text-sm leading-relaxed text-zinc-300 focus:border-red-700 focus:outline-none flex-1 overflow-y-auto"
                  />
                </div>
              </div>
            </div>
            <div className="bg-zinc-950/50 p-4 border-t border-zinc-800 flex justify-end gap-3 mt-auto">
              <button
                onClick={() => setRitualEditandoOrigem(null)}
                className="rounded border border-zinc-700 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const finalDesc = ritualEditorRef.current?.innerHTML || ritualDescricaoEditando;
                  rituaisHook.editarRitual(ritualEditandoOrigem, ritualNomeEditando, finalDesc, ritualPropsEditando);
                  setRitualEditandoOrigem(null);
                }}
                className="rounded bg-red-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-800"
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
    </div>
  );
};

// ============================================================
// COMPONENTE INTERNO: CHECKBOX DE REGRA OPCIONAL
// ============================================================
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
          className="mt-0.5 accent-red-600"
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-bold text-zinc-100">{titulo}</span>
          <p className="text-xs leading-relaxed text-zinc-500">{descricao}</p>
        </div>
      </div>
    </div>
  );
}