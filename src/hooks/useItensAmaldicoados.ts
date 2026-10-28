import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { ItemAmaldicoado, ItemAmaldicoadoInventario } from '../types';
import { calcularCategoriaFinal } from '../utils/rpgRules';

export function useItensAmaldicoados() {
  const [itens, setItens] = useState<ItemAmaldicoado[]>([]);
  const [armasAmaldicoadas, setArmasAmaldicoadas] = useState<any[]>([]);
  const [itensAmaldicoadosInventario, setItensAmaldicoadosInventario] = useState<ItemAmaldicoadoInventario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function carregar() {
      setError(null);
      const [resItens, resArmas] = await Promise.all([
        supabase.from('Itens Amaldiçoados').select('*'),
        supabase.from('Armas Amaldiçoadas').select('*')
      ]);
      if (cancelled) return;
      if (resItens.error) {
        setError(resItens.error.message);
      } else if (resItens.data) {
        setItens(resItens.data as ItemAmaldicoado[]);
      }
      if (resArmas.data) {
        setArmasAmaldicoadas(resArmas.data);
      }
      setLoading(false);
    }
    carregar();
    return () => { cancelled = true; };
  }, []);

  const adicionarItem = useCallback((item: ItemAmaldicoado) => {
    const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    setItensAmaldicoadosInventario(prev => [...prev, { id: newId, item }]);
  }, []);

  const removerItem = useCallback((id: string) => {
    setItensAmaldicoadosInventario(prev => prev.filter(i => i.id !== id));
  }, []);

  const reordenarItens = useCallback((oldIndex: number, newIndex: number) => {
    setItensAmaldicoadosInventario(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(oldIndex, 1);
      result.splice(newIndex, 0, removed);
      return result;
    });
  }, []);

  const editarItem = useCallback((id: string, novosDados: Partial<ItemAmaldicoado>) => {
    setItensAmaldicoadosInventario(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          item: { ...item.item, ...novosDados }
        };
      }
      return item;
    }));
  }, []);

  const toggleEquipadoSimples = useCallback((id: string, overrideValue?: boolean) => {
    setItensAmaldicoadosInventario(prev => prev.map(i => {
      if (i.id === id) {
        return { ...i, equipado: overrideValue !== undefined ? overrideValue : !i.equipado };
      }
      return i;
    }));
  }, []);

  const contagemPorCategoria = useMemo(() => {
    const contagem = [0, 0, 0, 0];
    itensAmaldicoadosInventario.forEach(obj => {
      const catFinal = calcularCategoriaFinal(obj.item.Categoria_Ama, undefined, []);
      const catStr = String(catFinal).trim().toUpperCase();
      if (catStr === 'I' || catStr === '1') contagem[0]++;
      else if (catStr === 'II' || catStr === '2') contagem[1]++;
      else if (catStr === 'III' || catStr === '3') contagem[2]++;
      else if (catStr === 'IV' || catStr === '4') contagem[3]++;
    });
    return contagem;
  }, [itensAmaldicoadosInventario]);

  return useMemo(() => ({ 
    itens, 
    armasAmaldicoadas,
    itensAmaldicoadosInventario,
    setItensAmaldicoadosInventario,
    adicionarItem, 
    removerItem, 
    reordenarItens, 
    editarItem,
    toggleEquipadoSimples,
    contagemPorCategoria,
    loading, 
    error 
  }), [
    itens,
    armasAmaldicoadas,
    itensAmaldicoadosInventario,
    adicionarItem,
    removerItem,
    reordenarItens,
    editarItem,
    toggleEquipadoSimples,
    contagemPorCategoria,
    loading,
    error
  ]);
}
