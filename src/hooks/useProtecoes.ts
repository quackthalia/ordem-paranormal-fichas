import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { Protecao, ProtecaoInventario } from '../types';

export function useProtecoes() {
  const [protecoes, setProtecoes] = useState<Protecao[]>([]);
  const [protecoesInventario, setProtecoesInventario] = useState<ProtecaoInventario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from('Proteções').select('*');
      console.log('[useProtecoes] data:', data, 'error:', error);
      if (error) {
        setError(error.message);
      } else if (data) {
        setProtecoes(data as Protecao[]);
      }
      setLoading(false);
    }
    carregar();
  }, []);

  const adicionarProtecao = useCallback((protecao: Protecao) => {
    const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    setProtecoesInventario(prev => [...prev, { id: newId, protecao }]);
  }, []);

  const removerProtecao = useCallback((id: string) => {
    setProtecoesInventario(prev => prev.filter(item => item.id !== id));
  }, []);

  const editarProtecao = useCallback((id: string, novosDados: Partial<Protecao>) => {
    setProtecoesInventario(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, protecao: { ...item.protecao, ...novosDados } };
      }
      return item;
    }));
  }, []);

  const reordenarProtecoes = useCallback((oldIndex: number, newIndex: number) => {
    setProtecoesInventario(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(oldIndex, 1);
      result.splice(newIndex, 0, removed);
      return result;
    });
  }, []);

  const cargaProtecoes = useMemo(() => {
    return protecoesInventario.reduce((acc, item) => {
      const espRaw: unknown = item.protecao.Espacos_Protecao;
      let espStr = String(espRaw ?? '').replace(',', '.').replace(/[^0-9.-]+/g, '');
      const val = Number(espStr);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
  }, [protecoesInventario]);

  const contagemPorCategoria = useMemo(() => {
    let counts = [0, 0, 0, 0];
    protecoesInventario.forEach(item => {
      const cat = String(item.protecao.Categoria_Protecao || '').trim();
      if (cat === 'I') counts[0]++;
      else if (cat === 'II') counts[1]++;
      else if (cat === 'III') counts[2]++;
      else if (cat === 'IV') counts[3]++;
    });
    return counts;
  }, [protecoesInventario]);

  return {
    protecoes,
    protecoesInventario,
    adicionarProtecao,
    removerProtecao,
    editarProtecao,
    reordenarProtecoes,
    cargaProtecoes,
    contagemPorCategoria,
    loading,
    error
  };
}
