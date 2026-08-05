import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { Municao, MunicaoInventario } from '../types';

export function useMunicoes() {
  const [municoes, setMunicoes] = useState<Municao[]>([]);
  const [municoesInventario, setMunicoesInventario] = useState<MunicaoInventario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from('Municoes').select('*');
      if (error) {
        setError(error.message);
      } else if (data) {
        setMunicoes(data as Municao[]);
      }
      setLoading(false);
    }
    carregar();
  }, []);

  const adicionarMunicao = useCallback((municao: Municao) => {
    const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    setMunicoesInventario(prev => [...prev, { id: newId, municao }]);
    return newId; // Retorna o ID gerado para poder ser acoplado à arma logo após ser criado
  }, []);

  const removerMunicao = useCallback((id: string) => {
    setMunicoesInventario(prev => prev.filter(item => item.id !== id));
  }, []);

  const cargaMunicoes = useMemo(() => {
    return municoesInventario.reduce((acc, item) => {
      let esp = item.municao['Espaços_Item'];
      if (typeof esp === 'string') {
        esp = (esp as string).replace(',', '.').replace(/[^0-9.-]+/g, '');
      }
      const val = Number(esp);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
  }, [municoesInventario]);

  // Função utilitária para pegar munições compatíveis com uma arma baseada no Tipo_Arma da munição
  const getMunicoesCompativeis = useCallback((armaNome: string, armaCategoria: string) => {
    return municoes.filter(m => {
      // O CSV tem Tipo_Arma como "Pistóla / Revólver / Submetralhadora"
      // Precisamos checar se o nome da arma ou o tipo da arma está na string da munição.
      const tipoMunicao = (m.Tipo_Arma || '').toLowerCase();
      // "Lança-Chamas" -> "Lança Chamas"
      const nomeLimpo = armaNome.toLowerCase().replace('-', ' ');
      const tipoLimpo = tipoMunicao.replace('-', ' ');
      
      return tipoLimpo.includes(nomeLimpo) || tipoLimpo.includes(armaCategoria.toLowerCase());
    });
  }, [municoes]);

  const reordenarMunicoes = useCallback((oldIndex: number, newIndex: number) => {
    setMunicoesInventario(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(oldIndex, 1);
      result.splice(newIndex, 0, removed);
      return result;
    });
  }, []);

  return {
    municoes,
    municoesInventario,
    setMunicoesInventario,
    adicionarMunicao,
    removerMunicao,
    reordenarMunicoes,
    cargaMunicoes,
    getMunicoesCompativeis,
    loading,
    error,
  };
}
