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
    FOR: 0,
    AGI: 0,
    INT: 0,
    VIG: 0,
    PRE: 0
  };

  if (!todasMaldicoes || todasMaldicoes.length === 0) {
    return { pv, pe, defesa, deslocamento, pericias, resistenciasExtras, atributos, bonusDT };
  }

  const allMaldicoes: { id: number, elem?: string, isPesada?: boolean }[] = [];

  armas.forEach(a => {
    if (a.arma.isDuplaObsessivaCompanion) return;
    if (Array.isArray(a.maldicoes)) a.maldicoes.forEach(m => allMaldicoes.push({ id: m, elem: a.maldicoes_elementos?.[m] }));
  });
  protecoes.forEach(p => {
    const isPesada = Boolean(p.protecao.Proficiencia?.toLowerCase().includes('pesada'));
    if (p.equipado && Array.isArray(p.maldicoes)) p.maldicoes.forEach(m => allMaldicoes.push({ id: m, elem: p.maldicoes_elementos?.[m], isPesada }));
  });
  itens.forEach(i => {
    const nomeItem = (i.item.Nome_Item || '').toLowerCase();
    const grupoItem = (i.item.Grupo_Item || '').toLowerCase();
    const requerEquipar = nomeItem.includes('vestimenta') || nomeItem.includes('amuleto sagrado') || grupoItem === 'proteções' || grupoItem === 'protecoes';
    const estaAtivo = requerEquipar ? Boolean(i.equipado) : true;
    if (estaAtivo && Array.isArray(i.maldicoes)) i.maldicoes.forEach(m => allMaldicoes.push({ id: m, elem: i.maldicoes_elementos?.[m] }));
  });
  municoes.forEach(m => {
    if (Array.isArray(m.maldicoes)) m.maldicoes.forEach(mId => allMaldicoes.push({ id: mId, elem: m.maldicoes_elementos?.[mId] }));
  });

  for (let { id, elem, isPesada } of allMaldicoes) {
    id = Number(id);
    const mald = todasMaldicoes.find(m => m.Codigo_Mald === id);
    if (!mald) continue;

    const nome = mald.Nome_Mald.trim().toLowerCase();
    const cat = (mald.Categoria_Mald || '').trim().toLowerCase();

    // Proteção Elemental
    if (nome.includes('proteção elemental') && elem) {
      resistenciasExtras.push(elem + ' 10');
    }

    // Sombria
    if (nome === 'sombria') {
      pericias['Furtividade'] = (pericias['Furtividade'] || 0) + 5;
    }
    // Lépida
    else if (nome === 'lépida' || nome === 'lepida') {
      pericias['Atletismo'] = (pericias['Atletismo'] || 0) + 10;
      deslocamento += 3;
    }
    // Carisma
    else if (nome === 'carisma') {
      atributos.PRE = (atributos.PRE || 0) + 1;
    }
    // Sagacidade
    else if (nome === 'sagacidade') {
      atributos.INT = (atributos.INT || 0) + 1;
    }
    // Destreza
    else if (nome === 'destreza') {
      atributos.AGI = (atributos.AGI || 0) + 1;
    }
    // Disposição
    else if (nome === 'disposição' || nome === 'disposicao') {
      atributos.VIG = (atributos.VIG || 0) + 1;
    }
    // Pujança
    else if (nome === 'pujança' || nome === 'pujanca') {
      atributos.FOR = (atributos.FOR || 0) + 1;
    }
    // Esforço Adicional
    else if (nome === 'esforço adicional' || nome === 'esforco adicional') {
      pe += 5;
    }
    // Vitalidade
    else if (nome === 'vitalidade') {
      pv += 15;
    }
    // Potência
    else if (nome === 'potência' || nome === 'potencia') {
      bonusDT += 1;
    }
    // Cinética (Proteções - Código 16; ignorar Cinética de Armas Código 40)
    else if ((nome === 'cinética' || nome === 'cinetica') && (mald.Codigo_Mald === 16 || cat.includes('prote'))) {
      defesa += 2;
      resistenciasExtras.push(isPesada ? 'Dano 5' : 'Dano 2');
    }
    // Letárgica
    else if (nome === 'letárgica' || nome === 'letargica') {
      defesa += 2;
    }
    // Repulsora (Armas - Código 9)
    else if (nome === 'repulsora') {
      defesa += 2;
    }
    // Defesa
    else if (nome === 'defesa') {
      defesa += 5;
    }
    // Profética
    else if (nome === 'profética' || nome === 'profetica') {
      resistenciasExtras.push('Conhecimento 10');
    }
    // Voltaica
    else if (nome === 'voltaica') {
      resistenciasExtras.push('Energia 10');
    }
    // Repulsiva
    else if (nome === 'repulsiva') {
      resistenciasExtras.push('Morte 10');
    }
    // Regenerativa
    else if (nome === 'regenerativa') {
      resistenciasExtras.push('Sangue 10');
    }
    // Escudo Mental
    else if (nome === 'escudo mental') {
      resistenciasExtras.push('Mental 10');
    }
  }

  return { pv, pe, defesa, deslocamento, pericias, resistenciasExtras, atributos, bonusDT };
}
