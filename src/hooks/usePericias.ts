import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  periciasGratis: string[];
  regrasAtivas: boolean;
  jaTinhaProfissao33: boolean;
  debugRegra33: { avaliou: boolean, evalJaTinha: boolean };
}

export function usePericias(
  classe: ClasseRPG,
  nex: number,
  atributos: Atributos,
  regrasAtivas: boolean, // true = regras aplicadas, false = livre
  periciasGratisBase: string[],
  codigoPerRegra?: number | null,
  veteranasGratis: string[] = [],
  regrasAutomaticasAtivas?: Set<number>
): UsePericiasReturn {
  const [pericias, setPericias] = useState<PericiasMap>({});
  const [nomesPericias, setNomesPericias] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jaTinhaProfissao33, setJaTinhaProfissao33] = useState<boolean>(false);
  const [avaliouRegra33, setAvaliouRegra33] = useState<boolean>(false);

  // Sincroniza a avaliação no momento em que a regra muda (Deriving State during Render)
  const temAgora = regrasAutomaticasAtivas?.has(33);

  if (temAgora && !avaliouRegra33) {
    // Só avalia quando as perícias terminarem de carregar do DB
    if (pericias['Profissão'] && Object.keys(pericias).length > 0) {
      const valorTreino = pericias['Profissão'].treino;
      const jaTinha = valorTreino >= 5 || periciasGratisBase.includes('Profissão');
      
      setJaTinhaProfissao33(jaTinha);
      setAvaliouRegra33(true); // Isso aborta o render atual e reinicia com o valor novo
    }
  } else if (!temAgora && avaliouRegra33) {
    setJaTinhaProfissao33(false);
    setAvaliouRegra33(false);
  }

  const periciasGratis = useMemo(() => {
    const gratis = [...periciasGratisBase];
    // Se a regra 33 está ativa e ele NÃO tinha a perícia antes, dá de graça
    if (regrasAutomaticasAtivas?.has(33) && !jaTinhaProfissao33) {
      gratis.push('Profissão');
    }
    return gratis;
  }, [periciasGratisBase, regrasAutomaticasAtivas, jaTinhaProfissao33]);

  // Busca as perícias do banco
  useEffect(() => {
    let cancelled = false;

    async function carregar() {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('Perícias')
        .select('Codigo_Pericia, Nome_Pericia, Atributo_Pericia, Kit, Desc_Pericia');

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

        data.forEach((p: { Codigo_Pericia: number; Nome_Pericia: string; Atributo_Pericia: string; Kit: boolean | string; Desc_Pericia: string }) => {
          objetoPericias[p.Nome_Pericia] = {
            id: p.Codigo_Pericia,
            atributo: (p.Atributo_Pericia as AtributoKey) || 'FOR',
            treino: 0,
            outros: 0,
            kit: p.Kit === true || p.Kit === 'TRUE' || p.Kit === 'true' || p.Kit === '1',
            descricao: p.Desc_Pericia
          };
          mapaNomes[p.Codigo_Pericia] = p.Nome_Pericia;
        });

        setPericias(objetoPericias);
        setNomesPericias(mapaNomes);
      }

      setLoading(false);
    }

    carregar();
    return () => { cancelled = true; };
  }, []);

  const gratisRef = useRef<string[]>([]);
  const veteranasRef = useRef<string[]>([]);

  useEffect(() => {
    if (Object.keys(pericias).length === 0) return; // Aguarda carregar

    const velhasGratis = gratisRef.current;
    const velhasVeteranas = veteranasRef.current;

    // Checa se houve mudança real nas listas (comparação de conteúdo)
    const mudouGratis = velhasGratis.length !== periciasGratis.length || !velhasGratis.every((v, i) => v === periciasGratis[i]);
    const mudouVeteranas = velhasVeteranas.length !== veteranasGratis.length || !velhasVeteranas.every((v, i) => v === veteranasGratis[i]);

    if (!mudouGratis && !mudouVeteranas) return;

    gratisRef.current = periciasGratis;
    veteranasRef.current = veteranasGratis;

    setPericias(prev => {
      let mudou = false;
      const novo = { ...prev };
      
      // Destreina as que saíram da lista de grátis
      velhasGratis.forEach(nome => {
        if (!periciasGratis.includes(nome) && novo[nome] && novo[nome].treino > 0) {
          novo[nome] = { ...novo[nome], treino: 0 };
          mudou = true;
        }
      });

      // Destreina as veteranas que saíram da lista
      velhasVeteranas.forEach(nome => {
        if (!veteranasGratis.includes(nome) && novo[nome] && novo[nome].treino > 0) {
          novo[nome] = { ...novo[nome], treino: 0 };
          mudou = true;
        }
      });

      periciasGratis.forEach(nome => {
        if (novo[nome] && novo[nome].treino < 5) {
          novo[nome] = { ...novo[nome], treino: 5 };
          mudou = true;
        }
      });

      veteranasGratis.forEach(nome => {
        if (novo[nome] && novo[nome].treino < 10) {
          novo[nome] = { ...novo[nome], treino: 10 };
          mudou = true;
        }
      });

      return mudou ? novo : prev;
    });
  }, [periciasGratis, veteranasGratis, pericias]);

  const limites = useMemo(() => {
    const lim = calcularLimitesPericias(classe, nex, atributos);
    let extra = 0;
    if (codigoPerRegra === 1 || codigoPerRegra === 3) extra = 1;
    if (codigoPerRegra === 2) extra = 2;
    if (codigoPerRegra === 4) extra = 5;
    if (codigoPerRegra === 5) extra = 3;
    
    return {
      ...lim,
      maxTreinadas: lim.maxTreinadas + extra
    };
  }, [classe, nex, atributos, codigoPerRegra]);

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

  return { 
    pericias, 
    nomesPericias, 
    loading, 
    error, 
    handleMudarPericia, 
    limites, 
    totais,
    periciasGratis,
    regrasAtivas,
    jaTinhaProfissao33,
    debugRegra33: { avaliou: avaliouRegra33, evalJaTinha: jaTinhaProfissao33 }
  };
}