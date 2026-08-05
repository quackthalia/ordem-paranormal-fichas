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
    const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    setArmasInventario(prev => [...prev, { id: newId, arma }]);
  };

  const removerArma = (id: string) => {
    setArmasInventario(prev => prev.filter(item => item.id !== id));
  };

  const reordenarArmas = (oldIndex: number, newIndex: number) => {
    setArmasInventario(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(oldIndex, 1);
      result.splice(newIndex, 0, removed);
      return result;
    });
  };

  const cargaArmas = useMemo(() => {
    return armasInventario.reduce((acc, item) => {
      let esp = item.arma['Espaços_Item'];
      if (typeof esp === 'string') {
        esp = esp.replace(',', '.').replace(/[^0-9.-]+/g, '');
      }
      const val = Number(esp);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
  }, [armasInventario]);

  const contagemPorCategoria = useMemo(() => {
    let counts = [0, 0, 0, 0];
    armasInventario.forEach(item => {
      const cat = String(item.arma.Categoria_Item).trim();
      if (cat === 'I') counts[0]++;
      else if (cat === 'II') counts[1]++;
      else if (cat === 'III') counts[2]++;
      else if (cat === 'IV') counts[3]++;
    });
    return counts;
  }, [armasInventario]);

  return { armas, armasInventario, adicionarArma, removerArma, reordenarArmas, cargaArmas, contagemPorCategoria, loading, error };
}
