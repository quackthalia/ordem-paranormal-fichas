import { useState, useEffect, useCallback, useRef } from 'react';
import type { Atributos, ClasseRPG } from '../types';
import { calcularStatusBase, calcularPD } from '../utils/rpgRules';

interface UseStatusReturn {
  pvAtual: number;
  pvMax: number;
  sanAtual: number;
  sanMax: number;
  peAtual: number;
  peMax: number;
  peTurno: number;
  pdAtual: number;
  pdMax: number;
  hasPvTemp: boolean;
  hasPeTemp: boolean;
  hasPdTemp: boolean;
  pvTempAtual: number;
  pvTempMax: number;
  peTempAtual: number;
  peTempMax: number;
  pdTempAtual: number;
  pdTempMax: number;
  alterarStatus: (tipo: 'pv' | 'san' | 'pe' | 'pd', qtd: number) => void;
  setPvMax: React.Dispatch<React.SetStateAction<number>>;
  setSanMax: React.Dispatch<React.SetStateAction<number>>;
  setPeMax: React.Dispatch<React.SetStateAction<number>>;
  setPvAtual: React.Dispatch<React.SetStateAction<number | null>>;
  setSanAtual: React.Dispatch<React.SetStateAction<number | null>>;
  setPeAtual: React.Dispatch<React.SetStateAction<number | null>>;
  setPdMax: React.Dispatch<React.SetStateAction<number>>;
  setPdAtual: React.Dispatch<React.SetStateAction<number | null>>;
  setHasPvTemp: React.Dispatch<React.SetStateAction<boolean>>;
  setHasPeTemp: React.Dispatch<React.SetStateAction<boolean>>;
  setHasPdTemp: React.Dispatch<React.SetStateAction<boolean>>;
  setPvTempAtual: React.Dispatch<React.SetStateAction<number>>;
  setPvTempMax: React.Dispatch<React.SetStateAction<number>>;
  setPeTempAtual: React.Dispatch<React.SetStateAction<number>>;
  setPeTempMax: React.Dispatch<React.SetStateAction<number>>;
  setPdTempAtual: React.Dispatch<React.SetStateAction<number>>;
  setPdTempMax: React.Dispatch<React.SetStateAction<number>>;
  resetarStatus: () => void;
}

export function useStatus(
  classe: ClasseRPG,
  nex: number,
  nivel: number,
  atributos: Atributos,
  paranormalPenalty: number = 0,
  codigoRegra?: number | null
): UseStatusReturn {
  // Estados com null = "não inicializado" (melhor que -1)
  const [pvAtual, setPvAtual] = useState<number | null>(null);
  const [sanAtual, setSanAtual] = useState<number | null>(null);
  const [peAtual, setPeAtual] = useState<number | null>(null);
  const [pvMax, setPvMax] = useState(0);
  const [sanMax, setSanMax] = useState(0);
  const [peMax, setPeMax] = useState(0);
  const [pdAtual, setPdAtual] = useState<number | null>(null);
  const [pdMax, setPdMax] = useState(0);

  const [hasPvTemp, setHasPvTemp] = useState(false);
  const [pvTempAtual, setPvTempAtual] = useState(0);
  const [pvTempMax, setPvTempMax] = useState(0);
  const [hasPeTemp, setHasPeTemp] = useState(false);
  const [peTempAtual, setPeTempAtual] = useState(0);
  const [peTempMax, setPeTempMax] = useState(0);
  const [hasPdTemp, setHasPdTemp] = useState(false);
  const [pdTempAtual, setPdTempAtual] = useState(0);
  const [pdTempMax, setPdTempMax] = useState(0);

  const prevCalc = useRef({ pv: 0, san: 0, pe: 0, pd: 0, init: false });

  const baseStatus = calcularStatusBase(classe, atributos, nivel, codigoRegra);
  const calcMaxPv = baseStatus.pvMax;
  const calcMaxPe = baseStatus.peMax;
  const calcMaxSan = Math.max(0, baseStatus.sanMax - paranormalPenalty);
  const peTurno = baseStatus.peTurno;

  const calcMaxPd = Math.max(0, calcularPD(classe, atributos, nivel) - paranormalPenalty);

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
      setPdMax(calcMaxPd);
      setPdAtual(calcMaxPd);

      prevCalc.current = { pv: calcMaxPv, san: calcMaxSan, pe: calcMaxPe, pd: calcMaxPd, init: true };
    } else {
      const deltaPv = calcMaxPv - prevCalc.current.pv;
      const deltaSan = calcMaxSan - prevCalc.current.san;
      const deltaPe = calcMaxPe - prevCalc.current.pe;
      const deltaPd = calcMaxPd - prevCalc.current.pd;

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
      if (deltaPd !== 0) {
        setPdMax(calcMaxPd);
        setPdAtual(prev =>
          prev === null ? calcMaxPd : Math.max(0, prev + deltaPd)
        );
      }

      prevCalc.current = { pv: calcMaxPv, san: calcMaxSan, pe: calcMaxPe, pd: calcMaxPd, init: true };
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
      if (tipo === 'pd')
        setPdAtual(prev => Math.max(0, Math.min(pdMax, (prev ?? 0) + qtd)));
    },
    [pvMax, sanMax, peMax]
  );

  const resetarStatus = useCallback(() => {
    setPvAtual(null);
    setSanAtual(null);
    setPeAtual(null);
    setPdAtual(null);
    setPvMax(0);
    setSanMax(0);
    setPeMax(0);
    setPdMax(0);
    setHasPvTemp(false);
    setHasPeTemp(false);
    setHasPdTemp(false);
    setPvTempAtual(0);
    setPvTempMax(0);
    setPeTempAtual(0);
    setPeTempMax(0);
    setPdTempAtual(0);
    setPdTempMax(0);
    prevCalc.current = { pv: 0, san: 0, pe: 0, pd: 0, init: false };
  }, []);

  return {
    pvAtual: pvAtual ?? 0,
    sanAtual: sanAtual ?? 0,
    peAtual: peAtual ?? 0,
    pdAtual: pdAtual ?? 0,
    pdMax,
    pvMax,
    sanMax,
    peMax,
    peTurno,
    hasPvTemp,
    hasPeTemp,
    hasPdTemp,
    pvTempAtual,
    pvTempMax,
    peTempAtual,
    peTempMax,
    pdTempAtual,
    pdTempMax,
    alterarStatus,
    setPvMax,
    setSanMax,
    setPeMax,
    setPdMax,
    setPvAtual,
    setSanAtual,
    setPeAtual,
    setPdAtual,
    setHasPvTemp,
    setHasPeTemp,
    setHasPdTemp,
    setPvTempAtual,
    setPvTempMax,
    setPeTempAtual,
    setPeTempMax,
    setPdTempAtual,
    setPdTempMax,
    resetarStatus,
  };
}