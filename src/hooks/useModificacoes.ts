import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Modificacao } from '../types';

export function useModificacoes() {
  const [modificacoes, setModificacoes] = useState<Modificacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from('Modificações').select('*');
      if (error) {
        console.error('Erro ao buscar modificações:', error);
        setError(error.message);
      } else if (data) {
        setModificacoes(data as Modificacao[]);
      }
      setLoading(false);
    }
    carregar();
  }, []);

  // Helper function to find modifications by their IDs
  const getModificacoesByIds = (ids?: number[]) => {
    if (!ids || ids.length === 0) return [];
    return modificacoes.filter(m => ids.includes(m.Codigo_Modif));
  };

  return {
    modificacoes,
    loading,
    error,
    getModificacoesByIds
  };
}
