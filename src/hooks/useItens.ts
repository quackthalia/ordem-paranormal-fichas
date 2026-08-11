import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import type { ItemGeral, ItemGeralInventario } from '../types';

export function useItens(maxVestimentas: number = 2) {
  const [itens, setItens] = useState<ItemGeral[]>([]);
  const [itensInventario, setItensInventario] = useState<ItemGeralInventario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function carregar() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from('Itens').select('*');
      if (cancelled) return;
      if (error) {
        setError(error.message);
      } else if (data) {
        setItens(data as ItemGeral[]);
      }
      setLoading(false);
    }
    carregar();
    return () => { cancelled = true; };
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

  const editarItem = (id: string, novosDados: Partial<ItemGeral>, novasModificacoes?: number[]) => {
    setItensInventario(prev => prev.map(item => {
      if (item.id === id) {
        const ret: ItemGeralInventario = {
          ...item,
          item: { ...item.item, ...novosDados }
        };
        if (novasModificacoes !== undefined) {
          ret.modificacoes = novasModificacoes;
        }
        return ret;
      }
      return item;
    }));
  };

  const toggleEquipado = (id: string) => {
    setItensInventario(prev => {
      const alvo = prev.find(i => i.id === id);
      if (!alvo) return prev;

      const vaEquipar = !alvo.equipado;
      if (!vaEquipar) {
        // Desequipar: sempre permite
        return prev.map(i => i.id === id ? { ...i, equipado: false } : i);
      }

      // Equipar: verificar se já tem 2 vestimentas equipadas
      const nomeItemTarget = alvo.item.Nome_Item.toLowerCase();
      const isVestimenta = nomeItemTarget.includes('vestimenta') || nomeItemTarget.includes('amuleto sagrado');
      
      if (isVestimenta) {
        const vestimentasEquipadas = prev.filter(i => i.id !== id && i.equipado && (i.item.Nome_Item.toLowerCase().includes('vestimenta') || i.item.Nome_Item.toLowerCase().includes('amuleto sagrado')));
        if (vestimentasEquipadas.length >= maxVestimentas) {
          // Desequipar a primeira vestimenta equipada (a mais antiga)
          const idDesEquipar = vestimentasEquipadas[0].id;
          return prev.map(i => {
            if (i.id === id) return { ...i, equipado: true };
            if (i.id === idDesEquipar) return { ...i, equipado: false };
            return i;
          });
        }
      }

      return prev.map(i => i.id === id ? { ...i, equipado: true } : i);
    });
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
      if (cat === 'I' || cat === '1') contagem[0]++;
      else if (cat === 'II' || cat === '2') contagem[1]++;
      else if (cat === 'III' || cat === '3') contagem[2]++;
      else if (cat === 'IV' || cat === '4') contagem[3]++;
      // Categoria '0' (itens de graça/sem categoria) não entra no limite de crédito por categoria.
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
    toggleEquipado,
    cargaItens, 
    contagemPorCategoria,
    gruposUnicos,
    loading, 
    error 
  };
}
