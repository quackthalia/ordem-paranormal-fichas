import type { ItemAmaldicoadoInventario } from '../types';

export interface VestimentasBonus {
  pv: number;
  pe: number;
  defesa: number;
  deslocamento: number; // in meters
  pericias: Record<string, number>;
  resistenciasExtras: string[];
}

export function calcularBonusVestimentas(
  itensAmaldicoadosInventario: ItemAmaldicoadoInventario[]
): VestimentasBonus {
  let pv = 0;
  let pe = 0;
  let defesa = 0;
  let deslocamento = 0;
  const pericias: Record<string, number> = {};
  const resistenciasExtras: string[] = [];

  const equipadas = itensAmaldicoadosInventario.filter(
    i => i.equipado && i.item['Vestimenta?']?.toLowerCase() === 'true'
  );

  for (const inv of equipadas) {
    const id = inv.item.Codigo_Item_Ama;

    // Casaco de Lodo
    if (id === 7) {
      resistenciasExtras.push('Corte 5', 'Impacto 5', 'Morte 5', 'Perfuração 5', 'Balístico (Vulnerável)', 'Energia (Vulnerável)');
    }
    // Faixas da Vidência
    if (id === 49) {
      pericias['Intimidação'] = (pericias['Intimidação'] || 0) + 2;
    }
    // Joias da Mente
    if (id === 50) {
      pericias['Diplomacia'] = (pericias['Diplomacia'] || 0) + 2;
      resistenciasExtras.push('Mental 10');
    }
    // Elmo do Colosso
    if (id === 51) {
      resistenciasExtras.push('Dano 5');
    }
    // Tênis Lépidos
    if (id === 54) {
      pericias['Atletismo'] = (pericias['Atletismo'] || 0) + 12;
      deslocamento += 3;
    }
    // Máscara do Assassino Regicida
    if (id === 57) {
      pv += 20;
      pe += 10;
      defesa += 10;
    }
    // Proteção Torácica
    if (id === 60) {
      defesa += 10;
    }
    // Máscara do Assassino Sobrevivente
    if (id === 62) {
      resistenciasExtras.push('+2d20 Percepção para armadilhas');
    }
  }

  return { pv, pe, defesa, deslocamento, pericias, resistenciasExtras };
}
