import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Maldicao } from '../types';

export function useMaldicoes() {
  const [maldicoes, setMaldicoes] = useState<Maldicao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function carregar() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from('Maldições').select('*');
      if (cancelled) return;
      if (error) {
        console.error('Erro ao buscar maldições:', error);
        setError(error.message);
      } else if (data) {
        setMaldicoes(data as Maldicao[]);
      }
      setLoading(false);
    }
    carregar();
    return () => {
      cancelled = true;
    };
  }, []);

  return { maldicoes, loading, error };
}
