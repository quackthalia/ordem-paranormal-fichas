import type { Atributos, ClasseRPG, LimiteCirculos } from '../types';

export const CORES_ELEMENTOS: Record<string, string> = {
  sangue: '#991b1b',
  morte: '#18181b', // or gray/zinc
  conhecimento: '#ca8a04',
  energia: '#7e22ce'
};

export function obterElementoOpressor(elemento: string): string {
  const map: Record<string, string> = {
    sangue: 'Morte',
    morte: 'Energia',
    energia: 'Conhecimento',
    conhecimento: 'Sangue'
  };
  return map[elemento.toLowerCase()] || 'Medo';
}

/** Valores de NEX disponíveis nos seletores */
export const NEX_OPTIONS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99];

/** Calcula o nível a partir do NEX (99% → 20) */
export function calcularNivel(nex: number): number {
  return nex === 99 ? 20 : Math.floor(nex / 5);
}

/** Pontos de atributo que você ganha conforme o NEX */
export function pontosIniciaisPorNex(nex: number): number {
  let pts = 4;
  if (nex >= 20) pts += 1;
  if (nex >= 50) pts += 1;
  if (nex >= 80) pts += 1;
  if (nex >= 95) pts += 1;
  return pts;
}

/** Cap máximo de um atributo (NEX 5 = 3, resto = 5) */
export function capMaximoAtributo(nex: number): number {
  return nex === 5 ? 3 : 5;
}

/** Calcula PV, PE, SAN e PE/TURNO */
export function calcularStatusBase(
  classe: ClasseRPG,
  atributos: Atributos,
  nivel: number,
  regrasAtivas?: Set<number>
): { pvMax: number; peMax: number; sanMax: number; peTurno: number } {
  let pvMax = 0, peMax = 0, sanMax = 0;

  const temRegra = (r: number) => regrasAtivas?.has(r) ?? false;

  // Se a origem/poder possui a Regra 1, a sanidade inicial é reduzida pela metade.
  const redSanidade = temRegra(1) ? 0.5 : 1;

  if (temRegra(26)) {
    pvMax = (24 + atributos.VIG) + ((nivel - 1) * (6 + atributos.VIG));
    if (classe === 'Combatente') {
      peMax = (2 + atributos.PRE) + ((nivel - 1) * (2 + atributos.PRE));
      sanMax = Math.floor(12 * redSanidade) + ((nivel - 1) * 3);
    } else if (classe === 'Especialista') {
      peMax = (3 + atributos.PRE) + ((nivel - 1) * (3 + atributos.PRE));
      sanMax = Math.floor(16 * redSanidade) + ((nivel - 1) * 4);
    } else if (classe === 'Ocultista') {
      peMax = (4 + atributos.PRE) + ((nivel - 1) * (4 + atributos.PRE));
      sanMax = Math.floor(20 * redSanidade) + ((nivel - 1) * 5);
    }
  } else {
    if (classe === 'Combatente') {
      pvMax = (20 + atributos.VIG) + ((nivel - 1) * (4 + atributos.VIG));
      peMax = (2 + atributos.PRE) + ((nivel - 1) * (2 + atributos.PRE));
      sanMax = Math.floor(12 * redSanidade) + ((nivel - 1) * 3);
    } else if (classe === 'Especialista') {
      pvMax = (16 + atributos.VIG) + ((nivel - 1) * (3 + atributos.VIG));
      peMax = (3 + atributos.PRE) + ((nivel - 1) * (3 + atributos.PRE));
      sanMax = Math.floor(16 * redSanidade) + ((nivel - 1) * 4);
    } else if (classe === 'Ocultista') {
      pvMax = (12 + atributos.VIG) + ((nivel - 1) * (2 + atributos.VIG));
      peMax = (4 + atributos.PRE) + ((nivel - 1) * (4 + atributos.PRE));
      sanMax = Math.floor(20 * redSanidade) + ((nivel - 1) * 5);
    }
  }

  // Regra 2: +1 PV por nível de NEX
  if (temRegra(2)) {
    pvMax += nivel;
  }

  // Regra 10: +5 PV fixos
  if (temRegra(10)) {
    pvMax += 5;
  }

  let peTurno = nivel;

  // Regra 6: +1 PE a cada NEX ímpar (níveis 1, 3, 5...), +1 Limite de PE/turno
  if (temRegra(6)) {
    peMax += Math.ceil(nivel / 2);
    peTurno += 1;
  }

  // Regra 7: +1 de Sanidade para cada 5% de NEX (ou seja, +1 por nível)
  if (temRegra(7)) {
    sanMax += nivel;
  }

  // Regra 24: +1 PE por nível de NEX
  if (temRegra(24)) {
    peMax += nivel;
  }

  // Regra 14: Diminui os PE iniciais em 1/3 (fica com 2/3)
  if (temRegra(14)) {
    peMax = Math.floor(peMax * (2 / 3));
  }

  return { pvMax, peMax, sanMax, peTurno };
}

/** Ataque Especial (Combatente) */
export function calcularBonusAtaqueEspecial(nex: number): string {
  if (nex >= 85) return '5 PE, +20';
  if (nex >= 55) return '4 PE, +15';
  if (nex >= 25) return '3 PE, +10';
  return '2 PE, +5';
}

/** Perito (Especialista) */
export function calcularBonusPerito(nex: number): string {
  if (nex >= 85) return '5 PE, +1d12';
  if (nex >= 55) return '4 PE, +1d10';
  if (nex >= 25) return '3 PE, +1d8';
  return '2 PE, +1d6';
}

/** Engenhosidade (Especialista) */
export function calcularBonusEngenhosidade(nex: number): string {
  if (nex >= 75) return '4 PE, Veterano';
  return '2 PE, Expert';
}

/** Total de Rituais (Ocultista) */
export function calcularTotalRituais(nex: number): string {
  if (nex >= 99) return '22 Rituais';
  if (nex >= 95) return '21 Rituais';
  if (nex >= 90) return '20 Rituais';
  if (nex >= 85) return '19 Rituais';
  if (nex >= 60) return '14 Rituais';
  if (nex >= 55) return '13 Rituais';
  if (nex >= 30) return '8 Rituais';
  if (nex >= 25) return '7 Rituais';
  if (nex >= 10) return '4 Rituais';
  return '3 Rituais';
}

/** Limite de círculos (Ocultista) */
export function obterLimiteCirculos(nex: number): LimiteCirculos {
  if (nex >= 99) return { c1: 6, c2: 6, c3: 6, c4: 4 };
  if (nex >= 95) return { c1: 6, c2: 6, c3: 6, c4: 3 };
  if (nex >= 90) return { c1: 6, c2: 6, c3: 6, c4: 2 };
  if (nex >= 85) return { c1: 6, c2: 6, c3: 6, c4: 1 };
  if (nex >= 60) return { c1: 6, c2: 6, c3: 2, c4: 0 };
  if (nex >= 55) return { c1: 6, c2: 6, c3: 1, c4: 0 };
  if (nex >= 30) return { c1: 6, c2: 2, c3: 0, c4: 0 };
  if (nex >= 25) return { c1: 6, c2: 1, c3: 0, c4: 0 };
  if (nex >= 10) return { c1: 4, c2: 0, c3: 0, c4: 0 };
  return { c1: 3, c2: 0, c3: 0, c4: 0 };
}

/** Calcula PD (Pontos de Determinação) — regra Jogando sem Sanidade */
export function calcularPD(
  classe: ClasseRPG,
  atributos: Atributos,
  nivel: number,
  regrasAtivas?: Set<number>
): number {
  const pre = atributos.PRE;
  let pd = 0;

  if (classe === 'Combatente') {
    pd = (6 + pre) + ((nivel - 1) * (3 + pre));
  } else if (classe === 'Especialista') {
    pd = (8 + pre) + ((nivel - 1) * (4 + pre));
  } else if (classe === 'Ocultista') {
    pd = (10 + pre) + ((nivel - 1) * (5 + pre));
  }

  // Regra 14: Diminui os PE (e PD) iniciais em 1/3 (fica com 2/3)
  if (regrasAtivas?.has(14)) {
    pd = Math.floor(pd * (2 / 3));
  }

  return pd;
}

/** Limites de perícias por classe/nex */
export function calcularLimitesPericias(
  classe: ClasseRPG,
  nex: number,
  atributos: Atributos
): { maxTreinadas: number; maxUpgrades: number } {
  let maxTreinadas = 0, maxUpgrades = 0;

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

  return { maxTreinadas, maxUpgrades };
}

/** Proficiências iniciais da classe */
export function proficienciasIniciais(classe: ClasseRPG): string[] {
  if (classe === 'Combatente') return ['Armas Simples', 'Armas Táticas', 'Proteções Leves'];
  if (classe === 'Especialista') return ['Armas Simples', 'Proteções Leves'];
  if (classe === 'Ocultista') return ['Armas Simples'];
  return [];
}

export const ORDEM_ELEMENTOS = ['Sangue', 'Morte', 'Conhecimento', 'Energia', 'Medo'];

export function compararElementos(a: string | undefined | null, b: string | undefined | null): number {
  const getIndex = (elem: string | undefined | null) => {
    if (!elem) return 99; // Sem elemento vai para o final
    const lower = elem.toLowerCase();
    const idx = ORDEM_ELEMENTOS.findIndex(e => e.toLowerCase() === lower);
    return idx === -1 ? 99 : idx;
  };

  const idxA = getIndex(a);
  const idxB = getIndex(b);

  if (idxA !== idxB) {
    return idxA - idxB;
  }
  return 0;
}

export function sortPorElementoENome<T>(
  a: T, 
  b: T, 
  getElemento: (obj: T) => string | undefined | null, 
  getNome: (obj: T) => string | undefined | null
): number {
  const cmp = compararElementos(getElemento(a), getElemento(b));
  if (cmp !== 0) return cmp;
  const nomeA = getNome(a) || '';
  const nomeB = getNome(b) || '';
  return nomeA.localeCompare(nomeB, 'pt-BR');
}

/** Cor da badge (Proteções/Resistências) */
export function obterCorBadge(texto: string): string {
  const txt = texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  if (txt.includes('sangue')) return '#CD0000';
  if (txt.includes('morte')) return '#363636';
  if (txt.includes('conhecimento')) return '#FFC125';
  if (txt.includes('energia')) return '#BF3EFF';
  if (txt.includes('medo')) return '#E8E8E8';
  if (txt.includes('balistico') || txt.includes('corte') || txt.includes('impacto') || txt.includes('perfuracao')) return '#B5B5B5';
  if (txt.includes('calor')) return '#FF4500';
  if (txt.includes('frio')) return '#98F5FF';
  if (txt.includes('eletricidade')) return '#FFFF00';
  if (txt.includes('quimico')) return '#00EE00';
  if (txt.includes('mental') || txt.includes('mentais')) return '#436EEE';
  if (txt.includes('arma') && txt.includes('simples')) return '#BCD2EE';
  if (txt.includes('arma') && txt.includes('tatica')) return '#A2B5CD';
  if (txt.includes('arma') && txt.includes('pesada')) return '#6E7B8B';
  if (txt.includes('leve')) return '#9BCD9B';
  if (txt.includes('pesada')) return '#698B69';
  return '#a1a1aa';
}

/** Verifica se atende requisito de ritual (Ex: Requer 3º círculo, Afinidade com Morte) */
export function verificarRequisitoRitual(
  requisito: string,
  nex: number,
  classe: string | null,
  afinidadeAtiva: boolean,
  afinidadeEscolhida: string | null,
  elementoRitual: string
): { atende: boolean; motivo?: string } {
  if (!requisito || requisito.trim() === '') return { atende: true };

  const reqLower = requisito.toLowerCase();
  const motivos: string[] = [];
  
  // 1. Checar Afinidade
  if (reqLower.includes('afinidade')) {
    let elementoExigido = elementoRitual;
    if (reqLower.includes('sangue')) elementoExigido = 'Sangue';
    else if (reqLower.includes('morte')) elementoExigido = 'Morte';
    else if (reqLower.includes('energia')) elementoExigido = 'Energia';
    else if (reqLower.includes('conhecimento')) elementoExigido = 'Conhecimento';

    if (!afinidadeAtiva || afinidadeEscolhida?.toLowerCase() !== elementoExigido.toLowerCase()) {
      motivos.push(`afinidade com ${elementoExigido}`);
    }
  }

  // 2. Checar Círculo
  // Usamos c.*rculo porque no Supabase algumas palavras vêm com erro de encoding (ex: "Crculo")
  const circuloMatch = reqLower.match(/(\d+)[º°o]?\s*c.*rculo/);
  if (circuloMatch) {
    const circuloExigido = parseInt(circuloMatch[1], 10);
    const acesso = verificarAcessoCirculo(circuloExigido, nex, classe);
    if (!acesso.atende) {
      motivos.push(acesso.motivo!);
    }
  }

  if (motivos.length > 0) {
    return { atende: false, motivo: `Requer ${motivos.join(' e ')}` };
  }

  return { atende: true };
}

export function verificarAcessoCirculo(circuloExigido: number, nex: number, classe: string | null): { atende: boolean; motivo?: string } {
  let nexReqs = [5, 25, 55, 85]; // Ocultista
  if (classe !== 'Ocultista') {
    nexReqs = [5, 45, 75, 999]; // Especialista/Combatente
  }

  let acessoCirculo = 1;
  if (nex >= nexReqs[3]) acessoCirculo = 4;
  else if (nex >= nexReqs[2]) acessoCirculo = 3;
  else if (nex >= nexReqs[1]) acessoCirculo = 2;

  if (acessoCirculo < circuloExigido) {
    const nexExigido = nexReqs[circuloExigido - 1];
    const nexText = nexExigido === 999 ? 'Inacessível' : `NEX ${nexExigido}%`;
    return { atende: false, motivo: `acesso ao ${circuloExigido}º Círculo (${nexText} para ${classe || 'sua classe'})` };
  }
  return { atende: true };
}