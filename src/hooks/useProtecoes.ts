import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { Protecao, ProtecaoInventario } from '../types';

export function useProtecoes() {
  const [protecoes, setProtecoes] = useState<Protecao[]>([]);
  const [protecoesInventario, setProtecoesInventario] = useState<ProtecaoInventario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function carregar() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from('Proteções').select('*');
      if (cancelled) return;
      if (error) {
        setError(error.message);
      } else if (data) {
        setProtecoes(data as Protecao[]);
      }
      setLoading(false);
    }
    carregar();
    return () => { cancelled = true; };
  }, []);

  const adicionarProtecao = useCallback((protecao: Protecao) => {
    const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    setProtecoesInventario(prev => [...prev, { id: newId, protecao }]);
  }, []);

  const removerProtecao = useCallback((id: string) => {
    setProtecoesInventario(prev => prev.filter(item => item.id !== id));
  }, []);

  const editarProtecao = useCallback((id: string, novosDados: Partial<Protecao>, novasModificacoes?: number[], novasMaldicoes?: number[], novasMaldicoesElementos?: string[]) => {
    setProtecoesInventario(prev => prev.map(item => {
      if (item.id === id) {
        const ret: ProtecaoInventario = { ...item, protecao: { ...item.protecao, ...novosDados } };
        if (novasModificacoes !== undefined) {
          ret.modificacoes = novasModificacoes;
        }
        if (novasMaldicoes !== undefined) {
          ret.maldicoes = novasMaldicoes;
        }
        if (novasMaldicoesElementos !== undefined) {
          ret.maldicoes_elementos = novasMaldicoesElementos;
        }
        return ret;
      }
      return item;
    }));
  }, []);

  const isEscudo = (p: Protecao) => p.Proficiencia?.toLowerCase().includes('escudo') || p.Nome_Protecao?.toLowerCase().includes('escudo');

  const toggleEquipado = useCallback((id: string) => {
    setProtecoesInventario(prev => {
      const alvo = prev.find(i => i.id === id);
      if (!alvo) return prev;

      const vaEquipar = !alvo.equipado;
      if (!vaEquipar) {
        // Desequipar: sempre permite
        return prev.map(i => i.id === id ? { ...i, equipado: false } : i);
      }

      // Equipar: verificar restrições
      const alvoEhEscudo = isEscudo(alvo.protecao);

      return prev.map(i => {
        if (i.id === id) {
          return { ...i, equipado: true };
        }
        // Desequipar itens conflitantes
        if (i.equipado) {
          const iEhEscudo = isEscudo(i.protecao);
          // Se o alvo é escudo, desequipar outros escudos
          if (alvoEhEscudo && iEhEscudo) return { ...i, equipado: false };
          // Se o alvo é armadura (não escudo), desequipar outras armaduras (não escudos)
          if (!alvoEhEscudo && !iEhEscudo) return { ...i, equipado: false };
        }
        return i;
      });
    });
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
    toggleEquipado,
    reordenarProtecoes,
    cargaProtecoes,
    contagemPorCategoria,
    loading,
    error
  };
}
