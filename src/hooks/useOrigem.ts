import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { Origem, OrigemSelecionada } from '../types';

interface UseOrigemReturn {
  origens: Origem[];
  origemSelecionada: OrigemSelecionada | null;
  setOrigemSelecionada: React.Dispatch<React.SetStateAction<OrigemSelecionada | null>>;
  origensExpandidas: number[];
  toggleOrigemExpandida: (id: number) => void;
  loading: boolean;
  error: string | null;
  selecionarOrigem: (origem: Origem) => void;
  nomePericia: (codigo: number | null) => string | null;
}

export function useOrigem(): UseOrigemReturn {
  const [origens, setOrigens] = useState<Origem[]>([]);
  const [origemSelecionada, setOrigemSelecionada] = useState<OrigemSelecionada | null>(null);
  const [origensExpandidas, setOrigensExpandidas] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nomesPericias, setNomesPericias] = useState<Record<number, string>>({});

  useEffect(() => {
    let cancelled = false;

    async function carregar() {
      setLoading(true);
      setError(null);

      try {
        // Busca origens
        const { data: dataOrigens, error: errOrigens } = await supabase
          .from('Origens')
          .select('*');

        if (cancelled) return;

        if (errOrigens) {
          console.error('Erro ao buscar origens:', errOrigens);
          setError(errOrigens.message);
          return;
        }

        if (dataOrigens) {
          // Ordena A-Z
          setOrigens(dataOrigens.sort((a, b) => a.Nome.localeCompare(b.Nome)));
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
      } catch (err: any) {
        if (!cancelled) {
          console.error('Exceção ao buscar origens:', err);
          setError(err.message || String(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    carregar();
    return () => { cancelled = true; };
  }, []);

  const toggleOrigemExpandida = useCallback((id: number) => {
    setOrigensExpandidas(prev =>
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

  const selecionarOrigem = useCallback(
    (origem: Origem) => {
      const nomeP1 = nomesPericias[origem.Pericia_Treinada_1] || String(origem.Pericia_Treinada_1);
      const nomeP2 = nomesPericias[origem.Pericia_Treinada_2] || String(origem.Pericia_Treinada_2);
      const nomePEsp = origem.Pericia_Treinada_Especial
        ? nomesPericias[origem.Pericia_Treinada_Especial] || String(origem.Pericia_Treinada_Especial)
        : null;

      setOrigemSelecionada({
        ...origem,
        nome_p1: nomeP1,
        nome_p2: nomeP2,
        nome_pesp: nomePEsp,
      });
    },
    [nomesPericias]
  );

  return {
    origens,
    origemSelecionada,
    setOrigemSelecionada,
    origensExpandidas,
    toggleOrigemExpandida,
    loading,
    error,
    selecionarOrigem,
    nomePericia,
  };
}