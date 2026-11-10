import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../services/supabase';
import type { Modificacao } from '../types';

export function useModificacoes() {
  const [modificacoes, setModificacoes] = useState<Modificacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function carregar() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from('Modificações').select('*');
      if (cancelled) return;
      if (error) {
        console.error('Erro ao buscar modificações:', error);
        setError(error.message);
      } else if (data) {
        const lista = data as Modificacao[];
        if (!lista.some(m => m.Codigo_Modif === 35 || m.Nome_Modif.trim().toLowerCase() === 'aprimorada')) {
          lista.push({
            Codigo_Modif: 35,
            Categoria_Modif: 'Itens Operacionais',
            Nome_Modif: 'Aprimorada',
            Descricao_Modif: 'Esta é uma modificação para a mochila militar. Aumenta a capacidade de carga fornecida em 5 espaços (em vez de 2).',
            'Multiplica?': null,
            Efeito: 'Aumenta a capacidade de carga fornecida para 5 espaços.'
          });
        }
        setModificacoes(lista);
      }
      setLoading(false);
    }
    carregar();
    return () => { cancelled = true; };
  }, []);

  // Helper function to find modifications by their IDs
  const getModificacoesByIds = useCallback((ids?: number[]) => {
    if (!ids || ids.length === 0) return [];
    return modificacoes.filter(m => ids.includes(m.Codigo_Modif));
  }, [modificacoes]);

  return useMemo(() => ({
    modificacoes,
    loading,
    error,
    getModificacoesByIds
  }), [modificacoes, loading, error, getModificacoesByIds]);
}
