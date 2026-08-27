import type { 
  ArmaInventario, 
  ProtecaoInventario, 
  ItemGeralInventario, 
  MunicaoInventario,
  Maldicao,
  Atributos
} from '../types';

export interface MaldicoesBonusGlobais {
  pv: number;
  pe: number;
  defesa: number;
  deslocamento: number; // in meters
  pericias: Record<string, number>;
  resistenciasExtras: string[];
  atributos: Partial<Atributos>;
  bonusDT: number;
}

export function calcularBonusMaldicoes(
  armas: ArmaInventario[],
  protecoes: ProtecaoInventario[],
  itens: ItemGeralInventario[],
  municoes: MunicaoInventario[],
  todasMaldicoes: Maldicao[]
): MaldicoesBonusGlobais {
  let pv = 0;
  let pe = 0;
  let defesa = 0;
  let deslocamento = 0;
  let bonusDT = 0;
  const pericias: Record<string, number> = {};
  const resistenciasExtras: string[] = [];
  const atributos: Partial<Atributos> = {
    forca: 0,
    agilidade: 0,
    intelecto: 0,
    vigor: 0,
    presenca: 0
  };

  if (!todasMaldicoes || todasMaldicoes.length === 0) {
    return { pv, pe, defesa, deslocamento, pericias, resistenciasExtras, atributos, bonusDT };
  }

  const allMaldicoes: { id: number, elem?: string }[] = [];

  armas.forEach(a => {
    if (a.maldicoes) a.maldicoes.forEach(m => allMaldicoes.push({ id: m, elem: a.maldicoes_elementos?.[m] }));
  });
  protecoes.forEach(p => {
    if (p.equipado && p.maldicoes) p.maldicoes.forEach(m => allMaldicoes.push({ id: m, elem: p.maldicoes_elementos?.[m] }));
  });
  itens.forEach(i => {
    if (i.maldicoes) i.maldicoes.forEach(m => allMaldicoes.push({ id: m, elem: i.maldicoes_elementos?.[m] }));
  });
  municoes.forEach(m => {
    if (m.maldicoes) m.maldicoes.forEach(m => allMaldicoes.push({ id: m, elem: m.maldicoes_elementos?.[m] }));
  });

  for (const { id, elem } of allMaldicoes) {
    const mald = todasMaldicoes.find(m => m.Codigo_Mald === id);
    if (!mald) continue;

    // Proteção Elemental
    if (id === 35 && elem) {
      resistenciasExtras.push(elem + ' 10');
    }

    // Sombria
    if (id === 15) {
      pericias['Furtividade'] = (pericias['Furtividade'] || 0) + 5;
    }
    // Lépida
    else if (id === 17) {
      pericias['Atletismo'] = (pericias['Atletismo'] || 0) + 10;
      deslocamento += 3;
    }
    // Carisma
    else if (id === 23) {
      atributos.presenca = (atributos.presenca || 0) + 1;
    }
    // Sagacidade
    else if (id === 27) {
      atributos.intelecto = (atributos.intelecto || 0) + 1;
    }
    // Destreza
    else if (id === 29) {
      atributos.agilidade = (atributos.agilidade || 0) + 1;
    }
    // Disposição
    else if (id === 32) {
      atributos.vigor = (atributos.vigor || 0) + 1;
    }
    // Pujança
    else if (id === 33) {
      atributos.forca = (atributos.forca || 0) + 1;
    }
    // Esforço Adicional
    else if (id === 31) {
      pe += 5;
    }
    // Vitalidade
    else if (id === 34) {
      pv += 15;
    }
    // Potência
    else if (id === 30) {
      bonusDT += 1;
    }
    // Cinética
    else if (id === 16) {
      defesa += 2;
      resistenciasExtras.push('Dano 2 (ou 5 se pesada)');
    }
    // Letárgica
    else if (id === 19) {
      defesa += 2;
    }
    // Defesa
    else if (id === 28) {
      defesa += 5;
    }
    // Profética
    else if (id === 14) {
      resistenciasExtras.push('Conhecimento 10');
    }
    // Voltaica
    else if (id === 18) {
      resistenciasExtras.push('Energia 10');
    }
    // Repulsiva
    else if (id === 20) {
      resistenciasExtras.push('Morte 10');
    }
    // Regenerativa
    else if (id === 21) {
      resistenciasExtras.push('Sangue 10');
    }
    // Escudo Mental
    else if (id === 25) {
      resistenciasExtras.push('Mental 10');
    }
  }

  return { pv, pe, defesa, deslocamento, pericias, resistenciasExtras, atributos, bonusDT };
}
