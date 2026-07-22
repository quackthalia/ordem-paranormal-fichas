import { useState, useMemo } from 'react';

export type Patente = 'Recruta' | 'Operador' | 'Agente Especial' | 'Oficial de Operações' | 'Agente de Elite';
export type LimiteCredito = 'Baixo' | 'Médio' | 'Alto' | 'Ilimitado';

export interface UseInventarioReturn {
  prestigio: number;
  setPrestigio: (val: number) => void;
  patente: Patente;
  setPatenteManual: (val: Patente) => void;
  credito: LimiteCredito;
  setCreditoOverride: (val: LimiteCredito | null) => void;
  limitesItens: [number, number, number, number];
  setLimitesItensOverride: (val: [number, number, number, number] | null) => void;
  setLimiteItemCategoria: (index: number, val: number) => void;
}

const NIVEIS_CREDITO: LimiteCredito[] = ['Baixo', 'Médio', 'Alto', 'Ilimitado'];

export function useInventario(codigoRegra?: number | null): UseInventarioReturn {
  const [prestigio, setPrestigioState] = useState<number>(0);
  
  const [patenteOverride, setPatenteOverride] = useState<Patente | null>(null);
  const [creditoOverride, setCreditoOverride] = useState<LimiteCredito | null>(null);
  const [limitesItensOverride, setLimitesItensOverride] = useState<[number, number, number, number] | null>(null);

  // Se alterar o prestígio, reseta os overrides para seguir a tabela natural
  const setPrestigio = (val: number) => {
    setPrestigioState(val);
    setPatenteOverride(null);
    setCreditoOverride(null);
    setLimitesItensOverride(null);
  };

  const valoresBase = useMemo(() => {
    if (prestigio >= 200) return { p: 'Agente de Elite' as Patente, c: 'Ilimitado' as LimiteCredito, l: [3, 3, 3, 2] };
    if (prestigio >= 100) return { p: 'Oficial de Operações' as Patente, c: 'Alto' as LimiteCredito, l: [3, 3, 2, 1] };
    if (prestigio >= 50) return { p: 'Agente Especial' as Patente, c: 'Médio' as LimiteCredito, l: [3, 2, 1, 0] };
    if (prestigio >= 20) return { p: 'Operador' as Patente, c: 'Médio' as LimiteCredito, l: [3, 1, 0, 0] };
    return { p: 'Recruta' as Patente, c: 'Baixo' as LimiteCredito, l: [2, 0, 0, 0] };
  }, [prestigio]);

  const patente = valoresBase.p;

  const setPatenteManual = (novaPatente: Patente) => {
    switch (novaPatente) {
      case 'Recruta': setPrestigio(0); break;
      case 'Operador': setPrestigio(20); break;
      case 'Agente Especial': setPrestigio(50); break;
      case 'Oficial de Operações': setPrestigio(100); break;
      case 'Agente de Elite': setPrestigio(200); break;
    }
  };
  
  let credito = creditoOverride || valoresBase.c;

  // Regra 3: O limite de crédito é sempre um nível acima do normal
  if (codigoRegra === 3 && !creditoOverride) {
    const idx = NIVEIS_CREDITO.indexOf(credito);
    if (idx !== -1 && idx < NIVEIS_CREDITO.length - 1) {
      credito = NIVEIS_CREDITO[idx + 1];
    }
  }

  const limitesItens = (limitesItensOverride || valoresBase.l) as [number, number, number, number];

  const setLimiteItemCategoria = (index: number, val: number) => {
    const novosLimites = [...limitesItens] as [number, number, number, number];
    novosLimites[index] = val;
    setLimitesItensOverride(novosLimites);
  };

  return {
    prestigio,
    setPrestigio,
    patente,
    setPatenteManual,
    credito,
    setCreditoOverride,
    limitesItens,
    setLimitesItensOverride,
    setLimiteItemCategoria,
  };
}
