import type { ItemAmaldicoadoInventario, ItemGeralInventario } from '../types';

export interface VestimentasBonus {
  pv: number;
  pe: number;
  defesa: number;
  deslocamento: number; // in meters
  pericias: Record<string, number>;
  resistenciasExtras: string[];
  vulnerabilidadesExtras: string[];
}

/**
 * Bônus de perícia dos itens gerais (Vestimenta, Amuleto Sagrado e Utensílio).
 * - Vestimenta e Amuleto Sagrado só contam se estiverem equipados.
 * - O bônus é +2 (ou +5 se a perícia estiver marcada com * pela modificação Aprimorado).
 * - As perícias vêm do nome do item, ex.: "Vestimenta (Atletismo)" ou "Utensílio (Ciências*, Tecnologia)".
 * - O Amuleto Sagrado dá +2 em Religião e Vontade por padrão.
 */
export function calcularBonusPericiasItensGerais(
  itensInventario: ItemGeralInventario[]
): Record<string, number> {
  const total: Record<string, number> = {};

  for (const inv of itensInventario || []) {
    const nome = String(inv.item.Nome_Item || '');
    const nomeLower = nome.toLowerCase();
    const isAmuleto = nomeLower.includes('amuleto sagrado');
    const isVestimenta = nomeLower.includes('vestimenta');
    const isUtensilio = nomeLower.includes('utensílio') || nomeLower.includes('utensilio');
    const isGrimorio = nomeLower.includes('grimório') || nomeLower.includes('grimorio') || Number(inv.item.Codigo_Item) === 9999;
    if (!isAmuleto && !isVestimenta && !isUtensilio && !isGrimorio) continue;
    if ((isAmuleto || isVestimenta) && !inv.equipado) continue;

    const doItem: Record<string, number> = {};
    if (isAmuleto) {
      doItem['Religião'] = 2;
      doItem['Vontade'] = 2;
    }

    const match = nome.match(/\((.*?)\)/);
    if (match) {
      match[1].split(',').forEach(parte => {
        const aprimorada = parte.includes('*');
        const pericia = parte.replace('*', '').trim();
        if (!pericia) return;
        const valor = aprimorada ? 5 : 2;
        doItem[pericia] = Math.max(doItem[pericia] || 0, valor);
      });
    }

    Object.entries(doItem).forEach(([pericia, valor]) => {
      total[pericia] = (total[pericia] || 0) + valor;
    });
  }

  return total;
}

export function calcularBonusVestimentas(
  itensAmaldicoadosInventario: ItemAmaldicoadoInventario[],
  itensGeraisInventario: ItemGeralInventario[] = []
): VestimentasBonus {
  let pv = 0;
  let pe = 0;
  let defesa = 0;
  let deslocamento = 0;
  const pericias: Record<string, number> = { ...calcularBonusPericiasItensGerais(itensGeraisInventario) };
  const resistenciasExtras: string[] = [];
  const vulnerabilidadesExtras: string[] = [];

  const equipadas = itensAmaldicoadosInventario.filter(
    i => i.equipado && i.item['Vestimenta?']?.toLowerCase() === 'true'
  );

  for (const inv of equipadas) {
    const id = inv.item.Codigo_Item_Ama;

    // Casaco de Lodo
    if (id === 7) {
      resistenciasExtras.push('Corte 5', 'Impacto 5', 'Morte 5', 'Perfuração 5');
      vulnerabilidadesExtras.push('Balístico', 'Energia');
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

  return { pv, pe, defesa, deslocamento, pericias, resistenciasExtras, vulnerabilidadesExtras };
}
