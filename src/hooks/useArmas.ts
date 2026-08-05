import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import type { Arma, ArmaInventario } from '../types';

export function useArmas() {
  const [armas, setArmas] = useState<Arma[]>([]);
  const [armasInventario, setArmasInventario] = useState<ArmaInventario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from('Armas').select('*');
      if (error) {
        setError(error.message);
      } else if (data) {
        setArmas(data as Arma[]);
      }
      setLoading(false);
    }
    carregar();
  }, []);

  const adicionarArma = (arma: Arma) => {
    setArmasInventario(prev => [...prev, { id: crypto.randomUUID(), arma }]);
  };

  const removerArma = (id: string) => {
    setArmasInventario(prev => prev.filter(item => item.id !== id));
  };

  const cargaArmas = useMemo(() => {
    return armasInventario.reduce((acc, item) => acc + (item.arma['Espaços_Item'] || 0), 0);
  }, [armasInventario]);

  const contagemPorCategoria = useMemo(() => {
    let counts = [0, 0, 0, 0];
    armasInventario.forEach(item => {
      const cat = item.arma.Categoria_Item;
      if (cat === '0') counts[0]++;
      else if (cat === 'I') counts[1]++;
      else if (cat === 'II') counts[2]++;
      else if (cat === 'III') counts[3]++;
    });
    return counts;
  }, [armasInventario]);

  return { armas, armasInventario, adicionarArma, removerArma, cargaArmas, contagemPorCategoria, loading, error };
}
