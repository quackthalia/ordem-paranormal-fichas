import type { Atributos, ClasseRPG, LimiteCirculos } from '../types';

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
  nex: number
): { pvMax: number; peMax: number; sanMax: number; peTurno: number } {
  const nivel = calcularNivel(nex);

  let pvMax = 0, peMax = 0, sanMax = 0;

  if (classe === 'Combatente') {
    pvMax = (20 + atributos.VIG) + ((nivel - 1) * (4 + atributos.VIG));
    peMax = (2 + atributos.PRE) + ((nivel - 1) * (2 + atributos.PRE));
    sanMax = 12 + ((nivel - 1) * 3);
  } else if (classe === 'Especialista') {
    pvMax = (16 + atributos.VIG) + ((nivel - 1) * (3 + atributos.VIG));
    peMax = (3 + atributos.PRE) + ((nivel - 1) * (3 + atributos.PRE));
    sanMax = 16 + ((nivel - 1) * 4);
  } else if (classe === 'Ocultista') {
    pvMax = (12 + atributos.VIG) + ((nivel - 1) * (2 + atributos.VIG));
    peMax = (4 + atributos.PRE) + ((nivel - 1) * (4 + atributos.PRE));
    sanMax = 20 + ((nivel - 1) * 5);
  }

  return { pvMax, peMax, sanMax, peTurno: nivel };
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