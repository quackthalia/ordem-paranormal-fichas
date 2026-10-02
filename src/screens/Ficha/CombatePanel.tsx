import React from 'react';
import { useRPG } from '../../context/RPGContext';
import type { ArmaInventario } from '../../types';
import { Collapse } from '../../components/Collapse';
import { ModalMunicoes } from './ModalMunicoes';
import { ModalGranadas } from './ModalGranadas';
import { ModalAntena } from './ModalAntena';
import { CustomSelect } from '../../components/CustomSelect';

const ATRIBUTO_OPTIONS = [
  { label: 'FOR', value: 'FOR' },
  { label: 'AGI', value: 'AGI' },
  { label: 'INT', value: 'INT' },
  { label: 'PRE', value: 'PRE' },
  { label: 'VIG', value: 'VIG' }
];

function calcularDanoMedio(danoStr: string, multCritico: number): { normal: number, critico: number } {
  if (!danoStr || danoStr.trim() === '-' || danoStr.trim() === '') {
    return { normal: 0, critico: 0 };
  }
  
  // Remove colchetes de tipos (ex: 1d8[Sangue]) para o cálculo
  const strClean = danoStr.replace(/\[.*?\]/g, '');
  const normalized = strClean.toLowerCase().replace(/\s/g, '').replace(/-/g, '+-');
  const parts = normalized.split('+');
  let avgNormal = 0;
  let sumMaxMult = 0;
  let extraMax = 0;
  let flatBonus = 0;
  let firstDie = true;
  for (const part of parts) {
    if (!part) continue;
    const match = part.match(/^(-?)(\d+)d(\d+)(\*?)$/);
    if (match) {
      const sign = match[1] === '-' ? -1 : 1;
      const count = parseInt(match[2], 10);
      const faces = parseInt(match[3], 10);
      const hasStar = match[4] === '*';
      const lowAvg = Math.floor(faces / 2);
      avgNormal += sign * (count * lowAvg);
      
      if (firstDie || hasStar) {
        sumMaxMult += sign * (count * faces);
      } else {
        extraMax += sign * (count * faces);
      }
      firstDie = false;
    } else {
      const val = parseInt(part, 10);
      if (!isNaN(val)) {
        flatBonus += val;
      }
    }
  }
  const normal = Math.max(0, avgNormal + flatBonus);
  const factor = multCritico >= 2 ? multCritico / 2 : 1;
  const critico = Math.max(0, Math.floor(factor * sumMaxMult) + extraMax + flatBonus);
  return { normal, critico };
}

function parseDanoString(danoStr: string, tipoDanoBase: string, tipoSecundario?: string) {
  if (!danoStr || danoStr.trim() === '-' || danoStr.trim() === '') return [];
  
  // Separa por + ou - mantendo o sinal. Ex: 1d8+1d6*[Sangue]+2
  const regex = /([+-]?\s*\d+d\d+\*?(?:\[.*?\])?)|([+-]?\s*\d+(?:\[.*?\])?)/gi;
  const matches = danoStr.match(regex);
  if (!matches) return [{ label: 'Dado', valor: danoStr, tipo: tipoDanoBase }];

  const parsed: { label: string, valor: string, tipo: string }[] = [];
  const flatBonuses: Record<string, number> = {};

  let diceCount = 0;
  matches.forEach((m, i) => {
    let val = m.replace(/\s/g, ''); // Limpa os espacos
    let tipo = tipoDanoBase;
    
    if (val.toLowerCase().includes('d')) {
      if (diceCount === 1 && tipoSecundario) {
        tipo = tipoSecundario;
      }
      diceCount++;
    }

    // Extrai tipo se houver [Tipo]
    const typeMatch = val.match(/\[(.*?)\]/);
    if (typeMatch) {
      tipo = typeMatch[1];
      val = val.replace(/\[.*?\]/, '');
    }

    const valorFinal = (i > 0 && !val.startsWith('+') && !val.startsWith('-')) ? `+${val}` : val;

    if (valorFinal.toLowerCase().includes('d')) {
      if (i === 0) parsed.push({ label: 'Dado', valor: valorFinal, tipo });
      else parsed.push({ label: 'Dado Bônus', valor: valorFinal, tipo });
    } else {
      const num = parseInt(valorFinal, 10);
      if (!isNaN(num)) {
        flatBonuses[tipo] = (flatBonuses[tipo] || 0) + num;
      }
    }
  });

  Object.entries(flatBonuses).forEach(([tipo, total]) => {
    if (total !== 0) {
      const sign = total > 0 ? '+' : '';
      parsed.push({ label: 'Dano Bônus', valor: `${sign}${total}`, tipo });
    }
  });

  return parsed;
}

interface ArmaCombateCardProps {
  armaInv: ArmaInventario;
  estaExpandida: boolean;
  toggleExpandir: () => void;
  modificacoesHook: any;
  maldicoesHook: any;
}

const ArmaCombateCard: React.FC<ArmaCombateCardProps> = ({ armaInv, estaExpandida, toggleExpandir, modificacoesHook, maldicoesHook, onAddMunicao, municoesHook, itensHook, armasHook }) => {
  const { atributosFinais, proficienciasTotais, regrasAutomaticasAtivas, status, regras, trilhasHook, poderesExtras, nivel, nex } = useRPG();
  const effectiveNex = regras['nex_experiencia'] ? (nivel * 5) : nex;
  const isAniquilador = trilhasHook.trilhaSelecionada?.Codigo_Trilha === 1;
  const armaFavId = isAniquilador ? poderesExtras["aniquilador_arma_favorita"] : null;
  const isArmaFavorita = armaInv.id === armaFavId;
  const aniquiladorNivel99 = isAniquilador && isArmaFavorita && effectiveNex >= 99;
  const [mostrarDanoMedio, setMostrarDanoMedio] = React.useState(false);
  const [mostrarStatsGrupo, setMostrarStatsGrupo] = React.useState(false);
  
  const { arma, modificacoes, maldicoes } = armaInv;
  const armaBase = armasHook?.armas?.find((a: any) => a.Codigo_Arma === arma.Codigo_Arma || a.Nome_Item === arma.Nome_Item);
  const codigoGrupoFinal = arma.Codigo_Grupo ?? armaBase?.Codigo_Grupo;
  const grupoArma = armasHook?.gruposArmas?.find((g: any) => String(g.Codigo_Grupo) === String(codigoGrupoFinal));
  const numMaldicoes = Array.isArray(maldicoes) ? maldicoes.length : 0;
  const finalRD = grupoArma?.RD_Grupo != null ? Number(grupoArma.RD_Grupo) + (numMaldicoes * 10) : null;
  const finalPV = grupoArma?.PV_Grupo != null ? Number(grupoArma.PV_Grupo) + (numMaldicoes * 10) : null;
  const temGrupoStats = finalRD != null || finalPV != null;
  const municoesAcopladasList = (armaInv.municoesAcopladas || []).map(mid => {
    if (mid.startsWith('RITUAL_')) {
        const match = mid.match(/^RITUAL_([^_]+)_(.*)$/);
        if (match) {
           return { id: mid, municao: { Nome_Item: match[2] }, isRitual: true, elemento: match[1] };
        }
        return { id: mid, municao: { Nome_Item: mid.substring(7) }, isRitual: true };
      }
      let m = municoesHook?.municoesInventario.find((x: any) => x.id === mid);
    if (m) return m;
    let i = itensHook?.itensInventario.find((x: any) => x.id === mid);
    if (i) return { id: i.id, municao: i.item, qtd: i.qtd };
    return null;
  }).filter(Boolean) as any[];
  
  const activeAmmo = municoesAcopladasList.length > 0 ? municoesAcopladasList[0] : null;
    const ammoMods = activeAmmo && Array.isArray(activeAmmo.modificacoes) ? activeAmmo.modificacoes : [];
    const ammoMalds = activeAmmo && Array.isArray(activeAmmo.maldicoes) ? activeAmmo.maldicoes : [];
    
    const modsSafe = [...(Array.isArray(modificacoes) ? modificacoes : []), ...ammoMods];
    const maldsSafe = [...(Array.isArray(maldicoes) ? maldicoes : []), ...ammoMalds];
  
  const modsAtivas = modsSafe.map(id => modificacoesHook.modificacoes.find((m: any) => m.Codigo_Modif === id)).filter(Boolean);
  const maldicoesAtivas = maldsSafe.map(id => maldicoesHook.maldicoes.find((m: any) => m.Codigo_Mald === id)).filter(Boolean);

  const isPontaria = ['arremesso', 'disparo', 'fogo'].some(t => arma.Tipo_Arma?.toLowerCase().includes(t));
  const pericia = isPontaria ? 'Pontaria' : 'Luta';
  const isAgil = arma['Agil?'] || isPontaria;
  const hasProficiencia = proficienciasTotais.includes(arma.Proficiencia);
  let automatica = false;
  modsAtivas.forEach(m => {
    if (!m) return;
    const nome = m.Nome_Modif?.toLowerCase() || '';
    if (nome.includes('automátic') || nome.includes('automatica')) {
      automatica = true;
    }
  });
  const defaultAtributo = isAgil ? 'AGI' : 'FOR';

  const [atributoDano, setAtributoDano] = React.useState(defaultAtributo);
  const [danoIdx, setDanoIdx] = React.useState(0);

  let extrasStr = '';
  let critico = Number(arma.Critico_Arma || 20);
  if (aniquiladorNivel99) critico -= 2;
  let multCrit = Number(arma.Multiplicador_Arma || 2);
  let alcance = arma.Alcance_Item || 'Corpo a Corpo';
  
  modsAtivas.forEach(m => {
    if (!m) return;
    const desc = m.Descricao_Modif || '';
    const nome = m.Nome_Modif?.toLowerCase() || '';
    if (nome === 'mira laser' || nome === 'perigosa') critico -= 2;
    if (nome === 'dum dum') multCrit += 1;
    if (nome === 'mira telescópica' || nome === 'mira telescopica') {
      const ord = ['Curto', 'Medio', 'Longo', 'Extremo', 'Ilimitado'];
      const idx = ord.indexOf(alcance);
      if (idx !== -1 && idx < ord.length - 1) alcance = ord[idx + 1];
    }
    if (desc.toLowerCase().includes('+2 em rolagens de dano') || desc.toLowerCase().includes('+2 rolagens de dano') || desc.toLowerCase().includes('+2 no dano') || nome.includes('cruel')) {
       extrasStr += `+2`;
    }
    const match = (nome !== 'dum dum' && nome !== 'calibre grosso') ? desc.match(/\+\s*(\d+d\d+\*?)/i) : null;
    if (match) {
      extrasStr += `+${match[1]}`;
    }
  });

  maldicoesAtivas.forEach(m => {
    if (!m) return;
    const desc = m.Descricao_Mald || '';
    const nomeM = m.Nome_Mald?.trim().toLowerCase() || '';
    if (nomeM === 'predadora') {
      const margemBase = 21 - Number(arma.Critico_Arma || 20);
      critico -= margemBase;
      const ord = ['Curto', 'Medio', 'Longo', 'Extremo', 'Ilimitado'];
      const idx = ord.indexOf(alcance);
      if (idx !== -1 && idx < ord.length - 1) alcance = ord[idx + 1];
    }
    if (nomeM === 'empuxo') {
      const ord = ['Curto', 'Medio', 'Longo', 'Extremo', 'Ilimitado'];
      if (!alcance || alcance.toLowerCase() === 'corpo a corpo') alcance = 'Curto';
      else {
        const idx = ord.indexOf(alcance);
        if (idx !== -1 && idx < ord.length - 1) alcance = ord[idx + 1];
      }
    }
    const match = desc.match(/\+\s*(\d+d\d+\*?)/i);
    if (match) {
      let elemento = m.Elemento_Mald || 'Paranormal';
      if (elemento.toLowerCase() === 'varia' || elemento.toLowerCase() === 'variável') {
         elemento = armaInv.maldicoes_elementos?.[m.Codigo_Mald] || elemento;
      }
      extrasStr += `+${match[1]}[${elemento}]`;
    }
  });

  // Calcula bônus de atributo para o DANO
  let bonusDanoAtributo = 0;
  const isFogoDisparo = ['fogo', 'disparo'].some(t => arma.Tipo_Arma?.toLowerCase().includes(t));
  const isArcoComposto = arma.Nome_Item?.trim().toLowerCase() === 'arco composto';
  if (isArcoComposto) {
    bonusDanoAtributo = (atributosFinais.FOR || 0);
  } else if (!isFogoDisparo) {
    if (atributoDano === 'FOR') {
      bonusDanoAtributo = (atributosFinais.FOR || 0);
    } else if (atributoDano === 'AGI' && isAgil) {
      bonusDanoAtributo = (atributosFinais.AGI || 0);
    }
  }

  if (bonusDanoAtributo > 0) {
    extrasStr += `+${bonusDanoAtributo}`;
  } else if (bonusDanoAtributo < 0) {
    extrasStr += `${bonusDanoAtributo}`;
  }

  
  const isLancadorGranadas = arma.Nome_Item?.toLowerCase().includes('lançador de granadas') || arma.Nome_Item?.toLowerCase().includes('lancador de granadas');
  let granadaAcoplada: any = null;
  if (isLancadorGranadas && armaInv.municoesAcopladas && armaInv.municoesAcopladas.length > 0) {
    const mid = armaInv.municoesAcopladas[0];
    const itemInv = itensHook?.itensInventario.find((i: any) => i.id === mid);
    if (itemInv) granadaAcoplada = itemInv.item;
  }

  // ── Tipo de Dano: respeita o separador | para armas multi-forma (ex: Gancho do Bisão) ──
  // O currentDanoIdx é calculado abaixo, mas precisamos de uma referência antecipada
  // para resolver o tipo de dano. Usamos o danoIdx diretamente aqui.
  let rawTipoDano = arma.Tipo_Dano_Arma || 'Físico';
  // Se o tipo de dano tem |, vamos resolver depois que currentDanoIdx existir.
  // Por agora, guardamos as formas separadas.
  const _tipoDanoForms = rawTipoDano.includes('|') ? rawTipoDano.split('|').map(s => s.trim()) : null;

  let tipoBase = rawTipoDano;
  let tipoSecundario = rawTipoDano;

  // Será recalculado após currentDanoIdx ser definido
  function _resolverTipoDano(idx: number) {
    let td = _tipoDanoForms ? (_tipoDanoForms[idx] || _tipoDanoForms[0]) : rawTipoDano;
    let tb = td;
    let ts = td;
    if (td.includes('/')) {
      const parts = td.split('/');
      tb = parts[0].trim();
      ts = parts[1].trim();
    } else if (arma.Elemento_Arma) {
      ts = arma.Elemento_Arma.trim();
    }
    if (td.toLowerCase().replace(/\s/g, '') === 'perfuração/sangue') {
      tb = 'Perfuração';
      ts = 'Sangue';
    }
    if (activeAmmo && activeAmmo.municao?.Codigo_Municao === 63) {
      tb = 'Impacto';
      ts = 'Impacto';
    }
    tipoBase = tb;
    tipoSecundario = ts;
  }

  let rawDano = arma.Dano_Arma || '';
  
  if (isLancadorGranadas && granadaAcoplada) {
    const p = granadaAcoplada.Dano_Item?.split(',') || [];
    rawDano = p[0]?.trim() || '-';
  }

  let dtGranada = '-';
  if (isLancadorGranadas && granadaAcoplada) {
    const dtItem = granadaAcoplada.Dt_Item;
    if (dtItem) {
      let val = dtItem.trim();
      let periciaStr = '';
      if (val.includes(',')) {
        const arr = val.split(',');
        val = arr.pop()!.trim();
        periciaStr = arr.join(',').trim();
      }
      let calc: string | number = 0;
      if (['FOR','AGI','INT','PRE','VIG'].includes(val.toUpperCase())) {
        calc = 10 + (status?.peTurno || 0) + (atributosFinais[val.toUpperCase() as keyof typeof atributosFinais] || 0);
      } else {
        const num = Number(val);
          if (isNaN(num) || val.toLowerCase().includes('veja') || val.toLowerCase().includes('texto') || val.trim() === '') {
            calc = '-';
          } else {
            calc = num;
          }
      }
      dtGranada = calc === '-' ? '-' : (periciaStr ? `${periciaStr} ${calc}` : `${calc}`);
      if (!dtGranada) dtGranada = '-';
    }
  }
  
  modsAtivas.forEach(m => {
    if (m?.Nome_Modif?.trim().toLowerCase() === 'calibre grosso') {
       rawDano = rawDano.replace(/(\d+)d(\d+)/gi, (match, p1, p2) => `${Number(p1) + 1}d${p2}`);
    }
  });

  if (regrasAutomaticasAtivas?.has(86) && (arma.Tipo_Arma?.toLowerCase() === 'corpo a corpo' || arma.Tipo_Arma?.toLowerCase() === 'corpo-a-corpo') && armaInv.id !== 'ataque-desarmado-virtual') {
    rawDano = rawDano.replace(/(\d+)d(\d+)/gi, (match, p1, p2) => `${Number(p1) + 1}d${p2}`);
  }

  const danoOptions = rawDano.includes('|') ? rawDano.split('|').map(s => s.trim()) : (rawDano.includes('/') ? rawDano.split('/').map(s => s.trim()) : [rawDano]);
  const currentDanoIdx = danoIdx >= danoOptions.length ? 0 : danoIdx;
  const danoSelecionado = danoOptions[currentDanoIdx];

  // Resolve o tipo de dano baseado na forma selecionada (respeita |)
  _resolverTipoDano(currentDanoIdx);

  // Se é lançador de granadas, sobrescreve o tipo
  if (isLancadorGranadas && granadaAcoplada) {
    const p = granadaAcoplada.Dano_Item?.split(',') || [];
    if (p.length > 1) {
      const gTipo = p[1].trim();
      tipoBase = gTipo;
      tipoSecundario = gTipo;
    }
  }

  let danoSelecionadoEditado = danoSelecionado;
  if (aniquiladorNivel99 && danoSelecionadoEditado) {
    danoSelecionadoEditado = danoSelecionadoEditado.replace(/(\d+)d(\d+)/gi, (m, p1, p2) => `${Number(p1) + 1}d${p2}`);
  }
  const danoStrFull = danoSelecionadoEditado ? danoSelecionadoEditado + extrasStr : extrasStr;
  const parsedDano = parseDanoString(danoStrFull, tipoBase, tipoSecundario);

  // ── Dano Secundário: respeita o separador | para armas multi-forma ──
  const rawDanoSec = arma.Dano_Secundario || '';
  let danoSecStr = rawDanoSec;
  if (rawDanoSec.includes('|')) {
    const secForms = rawDanoSec.split('|').map(s => s.trim());
    danoSecStr = secForms[currentDanoIdx] || '';
  }
  if (danoSecStr && danoSecStr.trim() !== '' && danoSecStr.trim() !== '-') {
    parsedDano.push({ label: 'Dano Secundário', valor: danoSecStr, tipo: tipoSecundario });
  }
  const danoSecFull = danoSecStr && danoSecStr.trim() !== '' && danoSecStr !== '-' ? danoSecStr + extrasStr : '';
  parsedDano.sort((a, b) => {
      const aDice = a.valor.toLowerCase().includes('d');
      const bDice = b.valor.toLowerCase().includes('d');
      if (aDice && !bDice) return -1;
      if (!aDice && bDice) return 1;
      return 0;
    });

    const danoHeader = parsedDano
      .map((p, i) => {
      let v = p.valor;
      if (i > 0 && !v.startsWith('+') && !v.startsWith('-')) v = '+' + v;
      return v;
    })
    .join('');

  const danoMedioPrincipal = arma.Nome_Item === 'Arcabuz dos Moretti' ? { normal: 'Veja Texto', critico: 'Veja Texto' } as any : calcularDanoMedio(danoStrFull, multCrit);
  const danoMedioSecundario = danoSecFull ? calcularDanoMedio(danoSecFull, multCrit) : null;

  let bonusAtaque = 0;
    if (arma.Nome_Item?.trim().toLowerCase().includes('enraivecido') || arma.Nome_Item?.trim().toLowerCase().includes('arcabuz dos moretti')) {
      bonusAtaque += 2;
    }
    // Bônus de ataque vem apenas de modificações (como Certeira, Alongada, etc.)
  modsAtivas.forEach(m => {
    if (!m) return;
    const desc = m.Descricao_Modif?.toLowerCase() || '';
    const nome = m.Nome_Modif?.toLowerCase() || '';
    if (desc.includes('+2 em testes de ataque') || desc.includes('+2 nas rolagens de ataque') || nome.includes('certeira') || nome.includes('alongad')) {
      bonusAtaque += 2;
    }
  });
  
  const bonusAtaqueStr = bonusAtaque >= 0 ? `+${bonusAtaque}` : `${bonusAtaque}`;

  const getCorElementoTexto = (el: string) => {
    const e = el?.toLowerCase() || '';
    if (e.includes('sangue')) return 'text-red-500';
    if (e.includes('morte')) return 'text-zinc-400 font-bold';
    if (e.includes('energia')) return 'text-purple-500';
    if (e.includes('conhec')) return 'text-yellow-500';
    if (e.includes('medo')) return 'text-white';
    if (e.includes('varia') || e.includes('lista')) return 'text-blue-500';
    return 'text-zinc-400';
  };

  return (
    <div className="bg-zinc-950/60 border border-zinc-800 border-l-4 border-l-green-700 rounded p-3 hover:bg-zinc-900/60 hover:border-zinc-700 hover:border-l-green-600 transition-all flex flex-col">
      {/* CABEÇALHO */}
      <div 
        className="flex items-start justify-between cursor-pointer select-none"
        onClick={toggleExpandir}
      >
        <div className="flex flex-col gap-1 w-full min-w-0 pr-3">
          <div className="flex items-center gap-1 min-w-0">
            <span className="font-bold text-sm text-zinc-100 truncate">{arma.Nome_Item}{isArmaFavorita ? ' (Arma Favorita)' : ''}</span>
            
            {(arma['Improvisada?'] || modsAtivas.some((m: any) => m?.Nome_Modif?.trim().toLowerCase() === 'apocalíptica' || m?.Nome_Modif?.trim().toLowerCase() === 'apocaliptica')) && (
                <span className="relative group/imp cursor-help">
                  <span className="text-sm text-orange-400">🔨</span>
                  <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 opacity-0 invisible group-hover/imp:opacity-100 group-hover/imp:visible transition-all duration-300 group-hover/imp:delay-500 delay-0 w-52 p-2 bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded z-50 text-center shadow-lg pointer-events-none">
                    Arma improvisada: Sofre -1d20 em testes de ataque com essa arma.
                  </span>
                </span>
              )}
              {arma['Agil?'] && (
              <span className="relative group/agil cursor-help">
                <span className="text-sm text-yellow-400">⚡</span>
                <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 opacity-0 invisible group-hover/agil:opacity-100 group-hover/agil:visible transition-all duration-300 group-hover/agil:delay-500 delay-0 w-52 p-2 bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded z-50 text-center shadow-lg pointer-events-none">
                  Permite que você aplique sua Agilidade em vez de sua Força em testes de ataque e rolagens de dano.
                </span>
              </span>
            )}
            {automatica && (
              <span className="relative group/auto cursor-help">
                <span className="text-sm text-blue-400">🔄</span>
                <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 opacity-0 invisible group-hover/auto:opacity-100 group-hover/auto:visible transition-all duration-300 group-hover/auto:delay-500 delay-0 w-52 p-2 bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded z-50 text-center shadow-lg pointer-events-none">
                  Pode disparar rajadas. Quando dispara uma rajada, você sofre -1d20 no teste de ataque, mas causa 1 dado de dano adicional do mesmo tipo.
                </span>
              </span>
            )}
            {!hasProficiencia && (
              <span className="relative group/prof cursor-help">
                <span className="text-sm text-red-500">⚠️</span>
                <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 opacity-0 invisible group-hover/prof:opacity-100 group-hover/prof:visible transition-all duration-300 group-hover/prof:delay-500 delay-0 w-52 p-2 bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded z-50 text-center shadow-lg pointer-events-none">
                  Você não possui proficiência com esta arma, recebendo -2d20 em testes de ataque com ela.
                </span>
              </span>
            )}

            {danoOptions.length > 1 && (
              <div className="flex items-center flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <CustomSelect
                  value={danoSelecionado}
                  onChange={(val) => setDanoIdx(danoOptions.indexOf(val as string))}
                  options={danoOptions.map((o, i) => {
                      // Extrai nomes de formas do Especial_Arma (ex: "versão (Desamparado) e a versão (Conectado)")
                      const especial = arma.Especial_Arma || '';
                      const formMatches = especial.match(/vers[ãa]o\s*\(([^)]+)\)/gi);
                      let label = o;
                      if (formMatches && formMatches[i]) {
                        const nameMatch = formMatches[i].match(/\(([^)]+)\)/);
                        if (nameMatch) label = nameMatch[1];
                      }
                      return { label: `(${label})`, value: o };
                    })}
                  className="!p-0 !min-h-0 !border-transparent !bg-transparent text-sm text-zinc-400 font-bold hover:!text-white transition-colors"
                  hideIcon={true}
                  wrapperClassName="w-fit"
                />
              </div>
            )}
          </div>
          <span className="text-xs text-zinc-400">
            <span className="font-bold text-green-400">Dano:</span> {danoHeader.replace(/\[.*?\]/g, '') || '-'} 
            <span className="mx-2 text-zinc-700">|</span>
            {isLancadorGranadas ? (
                <><span className="font-bold text-green-400">DT:</span> {dtGranada}</>
              ) : (
                <>
                  <span className="font-bold text-green-400">Crítico:</span> {critico}/x{multCrit}
                  
                  {arma.Resistencia_Item && String(arma.Resistencia_Item).trim() !== '-' && (
                    <>
                      <span className="mx-2 text-zinc-700">|</span>
                      <span className="font-bold text-zinc-400">Resistência:</span> {arma.Resistencia_Item}
                    </>
                  )}
                </>
              )}
              
            </span>
          {(modsAtivas.length > 0 || maldicoesAtivas.length > 0) && (
            <div className="flex items-center mt-0.5 min-w-0">
              <span className="text-[11px] text-zinc-400 truncate italic">
                {modsAtivas.length > 0 && modsAtivas.map((m: any) => m!.Nome_Modif).join(' • ')}
                {modsAtivas.length > 0 && maldicoesAtivas.length > 0 && <span> • </span>}
                {maldicoesAtivas.map((m: any, i: number) => {
                    let el = m!.Elemento_Mald;
                    if (el?.toLowerCase().includes('varia') || el?.toLowerCase().includes('lista')) {
                      el = armaInv.maldicoes_elementos?.[m!.Codigo_Mald] || el;
                    }
                    const cor = getCorElementoTexto(el);
                    return (
                      <span key={m!.Codigo_Mald}>
                        {i > 0 && <span> • </span>}
                        <span className={cor}>{m!.Nome_Mald}</span>
                      </span>
                    )
                })}
              </span>
            </div>
          )}
        </div>
        <span className={`text-xs text-zinc-600 transition-transform mt-0.5 flex-shrink-0 ${estaExpandida ? 'rotate-180' : ''}`}>▼</span>
      </div>

      <Collapse isOpen={estaExpandida}>
        <div className="mt-3 pt-3 border-t border-zinc-800/50 flex flex-col gap-2 relative z-10 text-xs">
          
          {/* MUNIÇÃO ACOPLADA */}
          {(((arma.Tipo_Arma?.toLowerCase() !== 'corpo a corpo' && arma.Tipo_Arma?.toLowerCase() !== 'corpo-a-corpo') || arma.Nome_Item?.trim().toLowerCase() === 'a antena' || arma.Nome_Item?.trim().toLowerCase() === 'a antena\r') && arma.Tipo_Arma && !(arma.Nome_Item?.toLowerCase().includes('arcabuz dos moretti') || arma.Nome_Item?.toLowerCase().includes('fuzil alheio'))) && (
            <div className="flex items-center gap-x-2 gap-y-1 mb-1 flex-wrap">
              <span className="text-zinc-300">
                <span className="font-bold text-green-400">{municoesAcopladasList[0]?.isRitual ? 'Ritual:' : 'Munição:'}</span>{' '}
                {municoesAcopladasList.length > 0 ? (
                  <span className={`${municoesAcopladasList[0].isRitual ? getCorElementoMunicao(municoesAcopladasList[0].elemento) : 'text-zinc-300'} inline-flex items-center`}>
                      {municoesAcopladasList[0].municao.Nome_Item}
                    {municoesAcopladasList.length > 1 && (
                      <span className="ml-1 text-zinc-400 font-bold bg-zinc-800/80 px-1 rounded-sm text-[9px]">
                        +{municoesAcopladasList.length - 1}
                      </span>
                    )}
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        armasHook?.desacoplarMunicao(armaInv.id, municoesAcopladasList[0].id); 
                        municoesHook?.removerMunicao(municoesAcopladasList[0].id); 
                      }} 
                      className="text-zinc-500 hover:text-zinc-300 ml-1.5 px-0.5 rounded transition-colors text-[10px]" 
                      title="Remover Munição Atual"
                    >✕</button>
                  </span>
                ) : (
                  <span className="text-zinc-500">-</span>
                )}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (arma.Nome_Item?.trim().toLowerCase() === 'a antena' || arma.Nome_Item?.toLowerCase().includes('lançador de granadas') || arma.Nome_Item?.toLowerCase().includes('lancador de granadas')) {
                    onAddMunicao?.();
                  } else {
                    const compativeis = municoesHook?.getMunicoesCompativeis?.(arma.Nome_Item, arma.Categoria_Item) || [];
                    if (compativeis.length === 1) {
                      const idM = municoesHook?.adicionarMunicao(compativeis[0]);
                      if (idM) armasHook?.acoplarMunicao(armaInv.id, idM);
                    } else if (onAddMunicao) {
                      onAddMunicao();
                    }
                  }
                }}
                className="ml-1 w-4 h-4 inline-flex items-center justify-center rounded bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-green-400 hover:border-green-700 transition-colors"
                title="Acoplar Munição/Granada"
              >
                +
              </button>
            
                {activeAmmo?.municao?.granada_dano && (
                  <span className="text-zinc-300 w-full">
                    <span className="font-bold text-green-400">Explosivo:</span> {activeAmmo.municao.granada_dano} (DT {activeAmmo.municao.granada_dt || '-'})
                  </span>
                )}
              </div>
          )}

          
          {/* 1. DANO EXPLICADO NO TOPO */}
          {parsedDano.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-1">
              {parsedDano.map((pd, index) => (
                <span key={index} className="text-zinc-300">
                  <span className="font-bold text-green-400 capitalize">{pd.label.toLowerCase()}:</span> {pd.valor} <span className="text-zinc-500 text-[10px] ml-1">({pd.tipo})</span>
                </span>
              ))}
            </div>
          )}

          {/* 2. STATS DA ARMA ESPALHADAS (GRID) */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-2 mt-1 border-t border-zinc-800/50">
            <span className="text-zinc-300"><span className="font-bold text-green-400">Ataque Bônus:</span> {bonusAtaqueStr}</span>
            <span className="text-zinc-300"><span className="font-bold text-green-400">Perícia:</span> {pericia}</span>
            {arma.Alcance_Item && arma.Alcance_Item.trim() !== '-' && (
              <span className="text-zinc-300"><span className="font-bold text-green-400">Alcance:</span> {alcance}</span>
            )}
            <div className="flex items-center gap-1 text-zinc-300">
              <span className="font-bold text-green-400">Atributo:</span>
              <CustomSelect
                value={atributoDano}
                onChange={setAtributoDano}
                options={ATRIBUTO_OPTIONS}
                className="!p-0 !min-h-0 !border-transparent !bg-transparent text-xs text-zinc-300 font-bold hover:!text-white transition-colors"
                wrapperClassName="w-fit"
                hideIcon={true}
              />
            </div>
          </div>



          {/* 4. MÉDIA DE DANO ESCONDIDA */}
          {regras['media_dano'] && (
            <>
            <button
              onClick={() => setMostrarDanoMedio(!mostrarDanoMedio)}
              className="mt-2 pt-2 border-t border-zinc-800/50 flex w-fit items-center gap-1 text-[0.65rem] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <span className={`transition-transform ${mostrarDanoMedio ? 'rotate-180' : ''}`}>▼</span>
              Média de Dano
            </button>
            
            <Collapse isOpen={mostrarDanoMedio}>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
                <span className="text-zinc-300"><span className="font-bold text-green-400">Normal (x1/x2/x3):</span> {danoMedioPrincipal.normal} / {danoMedioPrincipal.normal * 2} / {danoMedioPrincipal.normal * 3}</span>
                {!isLancadorGranadas && (<span className="text-zinc-300"><span className="font-bold text-green-400">Média Crítica:</span> <span className="font-bold">{danoMedioPrincipal.critico}</span></span>)}
                
                {danoMedioSecundario && (
                  <>
                    <span className="text-zinc-300 mt-1"><span className="font-bold text-green-400">Sec. (x1/x2/x3):</span> {danoMedioSecundario.normal} / {danoMedioSecundario.normal * 2} / {danoMedioSecundario.normal * 3}</span>
                    {!isLancadorGranadas && (<span className="text-zinc-300 mt-1"><span className="font-bold text-green-400">Sec. Crítica:</span> <span className="font-bold">{danoMedioSecundario.critico}</span></span>)}
                  </>
                )}
              </div>
            </Collapse>
            </>
          )}

            {temGrupoStats && (
              <>
                <button
                  onClick={() => setMostrarStatsGrupo(!mostrarStatsGrupo)}
                  className="mt-2 pt-2 border-t border-zinc-800/50 flex w-fit items-center gap-1 text-[0.65rem] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <span className={`transition-transform ${mostrarStatsGrupo ? 'rotate-180' : ''}`}>▼</span>
                  Estatísticas
                </button>
                <Collapse isOpen={mostrarStatsGrupo}>
                  <div className="flex items-center gap-4 mt-1">
                    {finalRD != null && <span className="text-zinc-300"><span className="font-bold text-green-400">RD:</span> {finalRD}</span>}
                    {finalPV != null && <span className="text-zinc-300"><span className="font-bold text-green-400">PV:</span> {finalPV}</span>}
                  </div>
                </Collapse>
              </>
            )}
  
          </div>
        </Collapse>
      </div>
    );
  };

const getCorElementoMunicao = (elemento?: string) => {
  if (!elemento) return 'text-zinc-300';
  const e = elemento.trim().toLowerCase();
  if (e === 'sangue') return 'text-red-500';
  if (e === 'morte') return 'text-zinc-100 bg-black/60 px-1 rounded';
  if (e === 'conhecimento') return 'text-yellow-500';
  if (e === 'energia') return 'text-purple-500';
  if (e === 'medo') return 'text-zinc-950 bg-zinc-200/90 px-1 rounded';
  return 'text-zinc-300';
};

export const CombatePanel: React.FC = () => {
  const [modalMunicoesAberto, setModalMunicoesAberto] = React.useState(false);
  const [municaoTargetArmaId, setMunicaoTargetArmaId] = React.useState<string | undefined>(undefined);
  const [municaoFiltroNome, setMunicaoFiltroNome] = React.useState<string | undefined>(undefined);
  const [municaoFiltroCategoria, setMunicaoFiltroCategoria] = React.useState<string | undefined>(undefined);
  const [modalGranadasAberto, setModalGranadasAberto] = React.useState(false);
  const [modalAntenaAberto, setModalAntenaAberto] = React.useState(false);
  const [antenaTargetArmaId, setAntenaTargetArmaId] = React.useState<string | undefined>(undefined);
  const [granadaTargetArmaId, setGranadaTargetArmaId] = React.useState<string | undefined>(undefined);
  const [expandidos, setExpandidos] = React.useState<Record<string, boolean>>({});

  const toggleExpandir = (id: string) => {
    setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const { armasHook, modificacoesHook, maldicoesHook, itensHook, regrasAutomaticasAtivas, municoesHook, rituaisHook } = useRPG();
  let armas = [...(armasHook?.armasInventario || [])];

  const soqueira = itensHook?.itensInventario.find(i => i.item.Nome_Item.toLowerCase().includes('soqueira'));
  if (soqueira) {
    const desarmadoIndex = armas.findIndex(a => a.id === 'ataque-desarmado-virtual');
    if (desarmadoIndex !== -1) {
      const desarmado = armas[desarmadoIndex];
      armas[desarmadoIndex] = {
        ...desarmado,
        arma: {
          ...desarmado.arma,
          Dano_Arma: (regrasAutomaticasAtivas?.has(86) ? desarmado.arma.Dano_Arma.replace(/(\d+)d(\d+)/gi, (m, p1, p2) => `${Number(p1) + 1}d${p2}`) : desarmado.arma.Dano_Arma) + '+1'
        },
        modificacoes: soqueira.modificacoes || [],
        maldicoes: soqueira.maldicoes || [],
        maldicoes_elementos: soqueira.maldicoes_elementos || {}
      };
    }
  }

  // Sort Duplas Obsessivas together, hide Punhos Enraivecidos
  armas = armas.filter(a => !(a.arma.Nome_Item?.trim().toLowerCase().includes('enraivecido')) || a.id === 'ataque-desarmado-virtual').sort((a, b) => {
    if (a.arma.Nome_Item?.includes('Dupla Obsessiva') && b.arma.Nome_Item?.includes('Dupla Obsessiva')) return a.arma.Nome_Item.localeCompare(b.arma.Nome_Item);
    return 0; // maintain original order for others
  });
  const armasCorpoACorpo = armas.filter(a => a.arma.Tipo_Arma?.toLowerCase() === 'corpo a corpo' || a.arma.Tipo_Arma?.toLowerCase() === 'corpo-a-corpo');
  const armasFogo = armas.filter(a => a.arma.Tipo_Arma?.toLowerCase() !== 'corpo a corpo' && a.arma.Tipo_Arma?.toLowerCase() !== 'corpo-a-corpo');

  if (armas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-500">
        <svg className="mb-3 h-10 w-10 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14.5 17.5L3 6m0 0l2-2 11.5 11.5m-11.5-11.5l2 2m9.5 9.5l2 2m-2-2l2-2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p>Seu inventário de armas está vazio.</p>
        <p className="text-xs">Adicione armas no inventário para ver seus atributos de combate aqui.</p>
      </div>
    );
  }

  const renderWeaponList = (lista: ArmaInventario[], titulo: string) => {
    if (lista.length === 0) return null;
    return (
      <div className="flex flex-col gap-2">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1 mt-2 mb-1 border-b border-zinc-800/50 pb-1">{titulo}</h3>
        {lista.map((armaInv: ArmaInventario) => (
          <ArmaCombateCard 
            key={armaInv.id} 
            armaInv={armaInv} 
            estaExpandida={!!expandidos[armaInv.id]} 
            toggleExpandir={() => toggleExpandir(armaInv.id)} 
            modificacoesHook={modificacoesHook}
            maldicoesHook={maldicoesHook}
              armasHook={armasHook}
              municoesHook={municoesHook}
              itensHook={itensHook}
              onAddMunicao={() => {
                if (armaInv.arma.Nome_Item?.trim().toLowerCase() === 'a antena') {
                    setAntenaTargetArmaId(armaInv.id);
                    setModalAntenaAberto(true);
                  } else if (armaInv.arma.Nome_Item?.toLowerCase().includes('lançador de granadas') || armaInv.arma.Nome_Item?.toLowerCase().includes('lancador de granadas')) {
                  setGranadaTargetArmaId(armaInv.id);
                  setModalGranadasAberto(true);
                } else {
                  setMunicaoTargetArmaId(armaInv.id);
                  setMunicaoFiltroNome(armaInv.arma.Nome_Item);
                  setMunicaoFiltroCategoria(armaInv.arma.Categoria_Item);
                  setModalMunicoesAberto(true);
                }
              }}
            />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-2">
      {renderWeaponList(armasCorpoACorpo, 'Ataques Corpo a Corpo')}
      {renderWeaponList(armasFogo, 'Ataques à Distância')}
      {modalMunicoesAberto && (
        <ModalMunicoes
          onFechar={() => setModalMunicoesAberto(false)}
          armaFiltroNome={municaoFiltroNome}
          armaFiltroCategoria={municaoFiltroCategoria}
          onSelect={municao => {
            const idGerado = municoesHook?.adicionarMunicao(municao);
            if (idGerado && municaoTargetArmaId) {
              armasHook?.acoplarMunicao(municaoTargetArmaId, idGerado);
            }
            setModalMunicoesAberto(false);
          }}
        />
      )}
      
      {modalAntenaAberto && (
        <ModalAntena
          onFechar={() => setModalAntenaAberto(false)}
          onSelect={(nome, elemento) => {
             if (antenaTargetArmaId) {
                const armaInv = armasHook?.armasInventario.find(a => a.id === antenaTargetArmaId);
                if (armaInv?.municoesAcopladas) {
                   armaInv.municoesAcopladas.forEach(m => armasHook?.desacoplarMunicao(antenaTargetArmaId, m));
                }
                armasHook?.acoplarMunicao(antenaTargetArmaId, 'RITUAL_' + elemento + '_' + nome);
             }
             setModalAntenaAberto(false);
          }}
        />
      )}

      {modalGranadasAberto && (
        <ModalGranadas
          onFechar={() => setModalGranadasAberto(false)}
          onSelect={(granada) => {
            const newId = itensHook?.adicionarItem(granada);
            if (granadaTargetArmaId && newId) {
              armasHook?.acoplarMunicao(granadaTargetArmaId, newId);
            }
            setModalGranadasAberto(false);
          }}
        />
      )}
    </div>
  );
};
