import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../services/supabase';
import type { PericiasMap, AtributoKey, ClasseRPG, Atributos } from '../types';
import { calcularLimitesPericias } from '../utils/rpgRules';

interface UsePericiasReturn {
  pericias: PericiasMap;
  nomesPericias: Record<number, string>;
  loading: boolean;
  error: string | null;
  handleMudarPericia: (nome: string, campo: 'treino' | 'outros' | 'atributo', valor: number | AtributoKey) => void;
  limites: { maxTreinadas: number; maxUpgrades: number };
  totais: { totalTreinadasUsadas: number; totalUpgradesGastos: number };
}

export function usePericias(
  classe: ClasseRPG,
  nex: number,
  atributos: Atributos,
  regrasAtivas: boolean, // true = regras aplicadas, false = livre
  periciasGratis: string[]
): UsePericiasReturn {
  const [pericias, setPericias] = useState<PericiasMap>({});
  const [nomesPericias, setNomesPericias] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gratisAplicadas, setGratisAplicadas] = useState<string[]>([]);

  // Busca as perícias do banco
  useEffect(() => {
    let cancelled = false;

    async function carregar() {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('Perícias')
        .select('Codigo_Pericia, Nome_Pericia, Atributo_Pericia');

      if (cancelled) return;

      if (err) {
        console.error('Erro ao buscar perícias:', err);
        setError(err.message);
        setLoading(false);
        return;
      }

      if (data) {
        const objetoPericias: PericiasMap = {};
        const mapaNomes: Record<number, string> = {};

        data.forEach((p: { Codigo_Pericia: number; Nome_Pericia: string; Atributo_Pericia: string }) => {
          objetoPericias[p.Nome_Pericia] = {
            id: p.Codigo_Pericia,
            atributo: (p.Atributo_Pericia as AtributoKey) || 'FOR',
            treino: 0,
            outros: 0,
          };
          mapaNomes[p.Codigo_Pericia] = p.Nome_Pericia;
        });

        setPericias(objetoPericias);
        setNomesPericias(mapaNomes);
        // Força a re-aplicação das perícias grátis após o carregamento
        setGratisAplicadas([]);
      }

      setLoading(false);
    }

    carregar();
    return () => { cancelled = true; };
  }, []);

  // Aplica treino 5 automaticamente nas perícias grátis (classe/origem)
  // quando a lista muda — padrão "adjust state during render"
  if (gratisAplicadas !== periciasGratis) {
    setGratisAplicadas(periciasGratis);
    setPericias(prev => {
      let mudou = false;
      const novo = { ...prev };
      periciasGratis.forEach(nome => {
        if (novo[nome] && novo[nome].treino < 5) {
          novo[nome] = { ...novo[nome], treino: 5 };
          mudou = true;
        }
      });
      return mudou ? novo : prev;
    });
  }

  const limites = useMemo(
    () => calcularLimitesPericias(classe, nex, atributos),
    [classe, nex, atributos]
  );

  const totais = useMemo(() => {
    let totalTreinadasUsadas = 0;
    let totalUpgradesGastos = 0;

    Object.entries(pericias).forEach(([nome, dados]) => {
      if (dados.treino >= 5 && !periciasGratis.includes(nome)) {
        totalTreinadasUsadas += 1;
      }
      if (dados.treino === 10) totalUpgradesGastos += 1;
      else if (dados.treino === 15) totalUpgradesGastos += 2;
    });

    return { totalTreinadasUsadas, totalUpgradesGastos };
  }, [pericias, periciasGratis]);

  const handleMudarPericia = useCallback(
    (nome: string, campo: 'treino' | 'outros' | 'atributo', valor: number | AtributoKey) => {
      setPericias(prev => {
        const periciaAtual = prev[nome];
        if (!periciaAtual) return prev;

        // Se for treino e as regras estiverem ativas, aplica validações
        if (campo === 'treino' && regrasAtivas) {
          const novoValor = Number(valor);

          // Não deixa destreinar perícias grátis
          if (novoValor < 5 && periciasGratis.includes(nome)) {
            return prev;
          }

          // NEX mínimo para aumentar grau
          if (novoValor === 10 && nex < 35) return prev;
          if (novoValor === 15 && nex < 70) return prev;

          // Simula para verificar limites
          const simuladas = {
            ...prev,
            [nome]: { ...periciaAtual, treino: novoValor },
          };

          let simTreinadas = 0;
          let simUpgrades = 0;

          Object.entries(simuladas).forEach(([n, d]) => {
            if (d.treino >= 5 && !periciasGratis.includes(n)) simTreinadas += 1;
            if (d.treino === 10) simUpgrades += 1;
            else if (d.treino === 15) simUpgrades += 2;
          });

          if (simTreinadas > limites.maxTreinadas) return prev;
          if (simUpgrades > limites.maxUpgrades) return prev;
        }

        // Aplica a mudança
        if (campo === 'atributo') {
          return {
            ...prev,
            [nome]: { ...periciaAtual, atributo: valor as AtributoKey },
          };
        }

        return {
          ...prev,
          [nome]: { ...periciaAtual, [campo]: Number(valor) },
        };
      });
    },
    [regrasAtivas, periciasGratis, nex, limites]
  );

  return { pericias, nomesPericias, loading, error, handleMudarPericia, limites, totais };
}