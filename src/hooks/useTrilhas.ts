import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { Trilha, TrilhaSelecionada } from '../types';

interface UseTrilhasReturn {
  trilhas: Trilha[];
  trilhaSelecionada: TrilhaSelecionada | null;
  setTrilhaSelecionada: React.Dispatch<React.SetStateAction<TrilhaSelecionada | null>>;
  versatilidadeSelecionada: TrilhaSelecionada | null;
  setVersatilidadeSelecionada: React.Dispatch<React.SetStateAction<TrilhaSelecionada | null>>;
  trilhasExpandidas: number[];
  toggleTrilhaExpandida: (id: number) => void;
  loading: boolean;
  error: string | null;
  selecionarTrilha: (trilha: Trilha) => void;
  selecionarVersatilidade: (trilha: Trilha) => void;
  nomePericia: (codigo: number | null) => string | null;
}

export function useTrilhas(): UseTrilhasReturn {
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [trilhaSelecionada, setTrilhaSelecionada] = useState<TrilhaSelecionada | null>(null);
  const [versatilidadeSelecionada, setVersatilidadeSelecionada] = useState<TrilhaSelecionada | null>(null);
  const [trilhasExpandidas, setTrilhasExpandidas] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nomesPericias, setNomesPericias] = useState<Record<number, string>>({});

  useEffect(() => {
    let cancelled = false;

    async function carregar() {
      setLoading(true);
      setError(null);

      // Busca trilhas
      const { data: dataTrilhas, error: errTrilhas } = await supabase
        .from('Trilhas')
        .select('*');

      if (cancelled) return;

      if (errTrilhas) {
        console.error('Erro ao buscar trilhas:', errTrilhas);
        setError(errTrilhas.message);
        setLoading(false);
        return;
      }

      if (dataTrilhas) {
        // Ordena A-Z
        setTrilhas(dataTrilhas.sort((a, b) => a.Nome_Trilha.localeCompare(b.Nome_Trilha)));
      }

      // Busca nomes das perícias
      const { data: dataPericias } = await supabase
        .from('Perícias')
        .select('Codigo_Pericia, Nome_Pericia');

      if (cancelled) return;

      if (dataPericias) {
        const mapa: Record<number, string> = {};
        dataPericias.forEach((p: { Codigo_Pericia: number; Nome_Pericia: string }) => {
          mapa[p.Codigo_Pericia] = p.Nome_Pericia;
        });
        setNomesPericias(mapa);
      }

      setLoading(false);
    }

    carregar();
    return () => { cancelled = true; };
  }, []);

  const toggleTrilhaExpandida = useCallback((id: number) => {
    setTrilhasExpandidas(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const nomePericia = useCallback(
    (codigo: number | null): string | null => {
      if (codigo === null || codigo === undefined) return null;
      return nomesPericias[codigo] || String(codigo);
    },
    [nomesPericias]
  );

  const selecionarTrilha = useCallback(
    (trilha: Trilha) => {
      const nomeP = nomesPericias[trilha.Perícia_Trilha] || String(trilha.Perícia_Trilha);

      setTrilhaSelecionada({
        ...trilha,
        nome_pericia: nomeP,
      });
    },
    [nomesPericias]
  );

  const selecionarVersatilidade = useCallback(
    (trilha: Trilha) => {
      const nomeP = nomesPericias[trilha.Perícia_Trilha] || String(trilha.Perícia_Trilha);

      setVersatilidadeSelecionada({
        ...trilha,
        nome_pericia: nomeP,
      });
    },
    [nomesPericias]
  );

  return {
    trilhas,
    trilhaSelecionada,
    setTrilhaSelecionada,
    versatilidadeSelecionada,
    setVersatilidadeSelecionada,
    trilhasExpandidas,
    toggleTrilhaExpandida,
    loading,
    error,
    selecionarTrilha,
    selecionarVersatilidade,
    nomePericia,
  };
}
