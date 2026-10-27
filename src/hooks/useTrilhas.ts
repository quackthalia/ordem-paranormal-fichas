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
      try {

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

      // Busca Regras Trilhas
      const { data: dataRegras, error: errRegras } = await supabase
        .from('Regras Trilhas')
        .select('*');
      
      if (errRegras) console.error("Erro Regras Trilhas:", errRegras);

      if (dataTrilhas) {
        // Fusão das 3 trilhas de vampiro (48, 49, 50) em uma trilha única (48 - Vontade Vampírica)
        const t48 = dataTrilhas.find(t => t.Codigo_Trilha === 48);
        const t49 = dataTrilhas.find(t => t.Codigo_Trilha === 49);
        const t50 = dataTrilhas.find(t => t.Codigo_Trilha === 50);

        let dataTrilhasProcessadas = dataTrilhas;
        if (t48 && (t49 || t50)) {
          const getCorpoArq = (desc: string | null | undefined, arq: string) => {
            if (!desc) return '';
            const regex = new RegExp('(•\\s*' + arq + ':[\\s\\S]*?)$');
            const m = desc.match(regex);
            return m ? m[1].trim() : '';
          };

          const desc40 = (t48.Descricao_Habilidade_40 || '').split(/•\s*Ancião:/)[0].trim() + '\n\n' +
            getCorpoArq(t48.Descricao_Habilidade_40, 'Ancião') + '\n\n' +
            getCorpoArq(t49?.Descricao_Habilidade_40, 'Bestial') + '\n\n' +
            getCorpoArq(t50?.Descricao_Habilidade_40, 'Encantador');

          const desc65 = (t48.Descricao_Habilidade_65 || '').split(/•\s*Ancião:/)[0].trim() + '\n\n' +
            getCorpoArq(t48.Descricao_Habilidade_65, 'Ancião') + '\n\n' +
            getCorpoArq(t49?.Descricao_Habilidade_65, 'Bestial') + '\n\n' +
            getCorpoArq(t50?.Descricao_Habilidade_65, 'Encantador');

          const desc99 = (t48.Descricao_Habilidade_99 || '').split(/•\s*Ancião:/)[0].trim() + '\n\n' +
            getCorpoArq(t48.Descricao_Habilidade_99, 'Ancião') + '\n\n' +
            getCorpoArq(t49?.Descricao_Habilidade_99, 'Bestial') + '\n\n' +
            getCorpoArq(t50?.Descricao_Habilidade_99, 'Encantador');

          const t48Fundida = {
            ...t48,
            Nome_Trilha: 'Vontade Vampírica',
            Descricao_Habilidade_40: desc40,
            Descricao_Habilidade_65: desc65,
            Descricao_Habilidade_99: desc99
          };

          // Remove 49 e 50 da listagem, mantém 48 unificada
          dataTrilhasProcessadas = dataTrilhas
            .filter(t => t.Codigo_Trilha !== 49 && t.Codigo_Trilha !== 50)
            .map(t => t.Codigo_Trilha === 48 ? t48Fundida : t);
        }

        const trilhasComRegras = dataTrilhasProcessadas.map(t => {
          // Perícia da trilha vem do banco (Monstruoso = Fortitude). O treino em Ocultismo do Monstruoso é uma regra separada (10%).
          const periciaTrilha = t.Perícia_Trilha;
          const regra = dataRegras?.find((r: any) => r.Codigo_Trilha === t.Codigo_Trilha);
          if (regra) {
            return {
              ...t,
              Perícia_Trilha: periciaTrilha,
              Auto_10: regra['Auto_10%'],
              Auto_40: regra['Auto_40%'],
              Auto_65: regra['Auto_65%'],
              Auto_99: regra['Auto_99%'],
            };
          }
          return {
            ...t,
            Perícia_Trilha: periciaTrilha,
          };
        });
        // Ordena A-Z
        setTrilhas(trilhasComRegras.sort((a: any, b: any) => a.Nome_Trilha.localeCompare(b.Nome_Trilha)));
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
        console.error("Erro inesperado no carregar trilhas:", err);
      } finally {
        setLoading(false);
      }
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
      setTrilhasExpandidas(prev => prev.filter(i => i !== trilha.Codigo_Trilha));
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
      setTrilhasExpandidas(prev => prev.filter(i => i !== trilha.Codigo_Trilha + 10000));
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
