import { useState, useEffect, useCallback, useRef } from 'react';
import type { Atributos, ClasseRPG } from '../types';
import { calcularStatusBase } from '../utils/rpgRules';

interface UseStatusReturn {
  pvAtual: number;
  pvMax: number;
  sanAtual: number;
  sanMax: number;
  peAtual: number;
  peMax: number;
  peTurno: number;
  hasPvTemp: boolean;
  hasPeTemp: boolean;
  pvTempAtual: number;
  pvTempMax: number;
  peTempAtual: number;
  peTempMax: number;
  alterarStatus: (tipo: 'pv' | 'san' | 'pe', qtd: number) => void;
  setPvMax: React.Dispatch<React.SetStateAction<number>>;
  setSanMax: React.Dispatch<React.SetStateAction<number>>;
  setPeMax: React.Dispatch<React.SetStateAction<number>>;
  setPvAtual: React.Dispatch<React.SetStateAction<number | null>>;
  setSanAtual: React.Dispatch<React.SetStateAction<number | null>>;
  setPeAtual: React.Dispatch<React.SetStateAction<number | null>>;
  setHasPvTemp: React.Dispatch<React.SetStateAction<boolean>>;
  setHasPeTemp: React.Dispatch<React.SetStateAction<boolean>>;
  setPvTempAtual: React.Dispatch<React.SetStateAction<number>>;
  setPvTempMax: React.Dispatch<React.SetStateAction<number>>;
  setPeTempAtual: React.Dispatch<React.SetStateAction<number>>;
  setPeTempMax: React.Dispatch<React.SetStateAction<number>>;
  resetarStatus: () => void;
}

export function useStatus(
  classe: ClasseRPG,
  nex: number,
  atributos: Atributos
): UseStatusReturn {
  // Estados com null = "não inicializado" (melhor que -1)
  const [pvAtual, setPvAtual] = useState<number | null>(null);
  const [sanAtual, setSanAtual] = useState<number | null>(null);
  const [peAtual, setPeAtual] = useState<number | null>(null);
  const [pvMax, setPvMax] = useState(0);
  const [sanMax, setSanMax] = useState(0);
  const [peMax, setPeMax] = useState(0);

  const [hasPvTemp, setHasPvTemp] = useState(false);
  const [pvTempAtual, setPvTempAtual] = useState(0);
  const [pvTempMax, setPvTempMax] = useState(0);
  const [hasPeTemp, setHasPeTemp] = useState(false);
  const [peTempAtual, setPeTempAtual] = useState(0);
  const [peTempMax, setPeTempMax] = useState(0);

  const prevCalc = useRef({ pv: 0, san: 0, pe: 0, init: false });

  const { pvMax: calcMaxPv, peMax: calcMaxPe, sanMax: calcMaxSan, peTurno } =
    calcularStatusBase(classe, atributos, nex);

  // Efeito de sincronização (mesma lógica do original, mas sem -1)
  useEffect(() => {
    if (!classe) return;

    if (!prevCalc.current.init) {
      setPvMax(calcMaxPv);
      setPvAtual(calcMaxPv);
      setSanMax(calcMaxSan);
      setSanAtual(calcMaxSan);
      setPeMax(calcMaxPe);
      setPeAtual(calcMaxPe);

      prevCalc.current = { pv: calcMaxPv, san: calcMaxSan, pe: calcMaxPe, init: true };
    } else {
      const deltaPv = calcMaxPv - prevCalc.current.pv;
      const deltaSan = calcMaxSan - prevCalc.current.san;
      const deltaPe = calcMaxPe - prevCalc.current.pe;

      if (deltaPv !== 0) {
        setPvMax(calcMaxPv);
        setPvAtual(prev =>
          prev === null ? calcMaxPv : Math.max(0, prev + deltaPv)
        );
      }
      if (deltaSan !== 0) {
        setSanMax(calcMaxSan);
        setSanAtual(prev =>
          prev === null ? calcMaxSan : Math.max(0, prev + deltaSan)
        );
      }
      if (deltaPe !== 0) {
        setPeMax(calcMaxPe);
        setPeAtual(prev =>
          prev === null ? calcMaxPe : Math.max(0, prev + deltaPe)
        );
      }

      prevCalc.current = { pv: calcMaxPv, san: calcMaxSan, pe: calcMaxPe, init: true };
    }
  }, [calcMaxPv, calcMaxSan, calcMaxPe, classe]);

  const alterarStatus = useCallback(
    (tipo: 'pv' | 'san' | 'pe', qtd: number) => {
      if (tipo === 'pv')
        setPvAtual(prev => Math.max(0, Math.min(pvMax, (prev ?? 0) + qtd)));
      if (tipo === 'san')
        setSanAtual(prev => Math.max(0, Math.min(sanMax, (prev ?? 0) + qtd)));
      if (tipo === 'pe')
        setPeAtual(prev => Math.max(0, Math.min(peMax, (prev ?? 0) + qtd)));
    },
    [pvMax, sanMax, peMax]
  );

  const resetarStatus = useCallback(() => {
    setPvAtual(null);
    setSanAtual(null);
    setPeAtual(null);
    setPvMax(0);
    setSanMax(0);
    setPeMax(0);
    setHasPvTemp(false);
    setHasPeTemp(false);
    setPvTempAtual(0);
    setPvTempMax(0);
    setPeTempAtual(0);
    setPeTempMax(0);
    prevCalc.current = { pv: 0, san: 0, pe: 0, init: false };
  }, []);

  return {
    pvAtual: pvAtual ?? 0,
    sanAtual: sanAtual ?? 0,
    peAtual: peAtual ?? 0,
    pvMax,
    sanMax,
    peMax,
    peTurno,
    hasPvTemp,
    hasPeTemp,
    pvTempAtual,
    pvTempMax,
    peTempAtual,
    peTempMax,
    alterarStatus,
    setPvMax,
    setSanMax,
    setPeMax,
    setPvAtual,
    setSanAtual,
    setPeAtual,
    setHasPvTemp,
    setHasPeTemp,
    setPvTempAtual,
    setPvTempMax,
    setPeTempAtual,
    setPeTempMax,
    resetarStatus,
  };
}