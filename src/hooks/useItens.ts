import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import type { ItemGeral, ItemGeralInventario } from '../types';

export function useItens() {
  const [itens, setItens] = useState<ItemGeral[]>([]);
  const [itensInventario, setItensInventario] = useState<ItemGeralInventario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from('Itens').select('*');
      if (error) {
        setError(error.message);
      } else if (data) {
        setItens(data as ItemGeral[]);
      }
      setLoading(false);
    }
    carregar();
  }, []);

  const adicionarItem = (item: ItemGeral) => {
    const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    setItensInventario(prev => [...prev, { id: newId, item }]);
  };

  const removerItem = (id: string) => {
    setItensInventario(prev => prev.filter(item => item.id !== id));
  };

  const reordenarItens = (oldIndex: number, newIndex: number) => {
    setItensInventario(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(oldIndex, 1);
      result.splice(newIndex, 0, removed);
      return result;
    });
  };

  const editarItem = (id: string, novosDados: Partial<ItemGeral>) => {
    setItensInventario(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          item: { ...item.item, ...novosDados }
        };
      }
      return item;
    }));
  };

  const cargaItens = useMemo(() => {
    return itensInventario.reduce((acc, obj) => {
      let esp = obj.item.Espacos_Itens;
      if (typeof esp === 'string') {
        esp = esp.replace(',', '.').replace(/[^0-9.-]+/g, '');
      }
      const val = Number(esp);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
  }, [itensInventario]);

  const gruposUnicos = useMemo(() => {
    const grupos = new Set<string>();
    itens.forEach(item => {
      if (item.Grupo_Item) {
        grupos.add(item.Grupo_Item.trim());
      }
    });
    return Array.from(grupos).sort();
  }, [itens]);

  const contagemPorCategoria = useMemo(() => {
    const contagem = [0, 0, 0, 0];
    itensInventario.forEach(obj => {
      const cat = String(obj.item.Categoria_Item).trim().toUpperCase();
      if (cat === 'I' || cat === '1') contagem[1]++;
      else if (cat === 'II' || cat === '2') contagem[2]++;
      else if (cat === 'III' || cat === '3') contagem[3]++;
      else if (cat === '0' || cat === 'O') contagem[0]++;
    });
    return contagem;
  }, [itensInventario]);

  return { 
    itens, 
    itensInventario, 
    adicionarItem, 
    removerItem, 
    reordenarItens, 
    editarItem, 
    cargaItens, 
    contagemPorCategoria,
    gruposUnicos,
    loading, 
    error 
  };
}
