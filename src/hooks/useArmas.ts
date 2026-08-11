import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import type { Arma, ArmaInventario } from '../types';

export function useArmas() {
  const [armas, setArmas] = useState<Arma[]>([]);
  const [armasInventario, setArmasInventario] = useState<ArmaInventario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function carregar() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from('Armas').select('*');
      if (cancelled) return;
      if (error) {
        setError(error.message);
      } else if (data) {
        setArmas(data as Arma[]);
      }
      setLoading(false);
    }
    carregar();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setArmasInventario(prev => {
      const armasDeFogo = prev.filter(a => a.id !== 'coronhada-virtual' && a.arma.Tipo_Arma?.toLowerCase().includes('fogo'));
      const coronhadaIndex = prev.findIndex(a => a.id === 'coronhada-virtual');
      const hasCoronhada = coronhadaIndex !== -1;

      if (armasDeFogo.length > 0) {
        const temDuasMaos = armasDeFogo.some(a => a.arma.Empunhadura_Arma?.toLowerCase().includes('duas'));
        const temUmaMao = armasDeFogo.some(a => !a.arma.Empunhadura_Arma?.toLowerCase().includes('duas'));
        
        let danoCoronhada = '1d4';
        let empunhadura = 'Uma Mão';
        
        if (temDuasMaos && temUmaMao) {
          danoCoronhada = '1d4/1d6';
          empunhadura = 'Uma/Duas Mãos';
        } else if (temDuasMaos) {
          danoCoronhada = '1d6';
          empunhadura = 'Duas Mãos';
        }

        if (!hasCoronhada) {
          const coronhadaVirtual: ArmaInventario = {
            id: 'coronhada-virtual',
            arma: {
              Codigo_Arma: -1,
              Nome_Item: 'Coronhada',
              Descricao_Item: 'Você pode usar uma arma de fogo como uma arma corpo a corpo.',
              Proficiencia: 'Armas Simples',
              Tipo_Arma: 'Corpo a Corpo',
              Empunhadura_Arma: empunhadura,
              Dano_Arma: danoCoronhada,
              Critico_Arma: 20,
              Multiplicador_Arma: 2,
              Tipo_Dano_Arma: 'Impacto',
              Alcance_Item: null,
              Categoria_Item: '0',
              'Espaços_Item': 0,
              'Agil?': false,
              Capacidade_Municao: null,
              dt_item: null,
              'Automatica?': false,
              Fonte_Arma: 'Sistema'
            },
            modificacoes: [],
            municoesAcopladas: []
          };
          return [...prev, coronhadaVirtual];
        } else {
          const coronhada = prev[coronhadaIndex];
          if (coronhada.arma.Dano_Arma !== danoCoronhada) {
            const next = [...prev];
            next[coronhadaIndex] = {
              ...coronhada,
              arma: { ...coronhada.arma, Dano_Arma: danoCoronhada, Empunhadura_Arma: empunhadura }
            };
            return next;
          }
        }
      } else if (hasCoronhada) {
        return prev.filter(a => a.id !== 'coronhada-virtual');
      }
      return prev;
    });
  }, [armasInventario.map(a => `${a.id}-${a.arma.Dano_Arma}-${a.arma.Tipo_Arma}-${a.arma.Empunhadura_Arma}`).join(',')]);

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

  const acoplarMunicao = (idArma: string, idMunicao: string) => {
    setArmasInventario(prev => prev.map(item => {
      if (item.id === idArma) {
        return {
          ...item,
          municoesAcopladas: [...(item.municoesAcopladas || []), idMunicao]
        };
      }
      return item;
    }));
  };

  const desacoplarMunicao = (idArma: string, idMunicao: string) => {
    setArmasInventario(prev => prev.map(item => {
      if (item.id === idArma && item.municoesAcopladas) {
        return {
          ...item,
          municoesAcopladas: item.municoesAcopladas.filter(m => m !== idMunicao)
        };
      }
      return item;
    }));
  };

  const editarArma = (idArma: string, novosDados: Partial<Arma>, novasModificacoes?: number[]) => {
    setArmasInventario(prev => prev.map(item => {
      if (item.id === idArma) {
        const ret: ArmaInventario = {
          ...item,
          arma: { ...item.arma, ...novosDados }
        };
        if (novasModificacoes !== undefined) {
          ret.modificacoes = novasModificacoes;
        }
        return ret;
      }
      return item;
    }));
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

  return { armas, armasInventario,    adicionarArma,
    removerArma,
    reordenarArmas,
    acoplarMunicao,
    desacoplarMunicao,
    editarArma,
    cargaArmas,
    contagemPorCategoria,
    loading, error };
}
