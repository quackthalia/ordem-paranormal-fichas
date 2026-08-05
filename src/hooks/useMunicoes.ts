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
      const { data, error } = await supabase.from('Munições').select('*');
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
      const tipoMunicao = (m.Tipo_Arma || '').toLowerCase();
      
      const removeAcentos = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/-/g, ' ');
      const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const tipoLimpo = removeAcentos(tipoMunicao);
      const nomeLimpo = removeAcentos(armaNome.toLowerCase());
      const catLimpo = removeAcentos(armaCategoria.toLowerCase());

      // Lidar com a exceção pedida: Combustível (Lança-Chamas) também serve para Lança Nitrogênio
      if (nomeLimpo === 'lanca nitrogenio' && tipoLimpo.includes('lanca chamas')) {
        return true;
      }

      // Usa \b (word boundary) para evitar que "metralhadora" dê match em "submetralhadora"
      try {
        const nomeRegex = new RegExp(`\\b${escapeRegExp(nomeLimpo)}\\b`, 'i');
        if (nomeRegex.test(tipoLimpo)) return true;

        const catRegex = new RegExp(`\\b${escapeRegExp(catLimpo)}\\b`, 'i');
        if (catRegex.test(tipoLimpo)) return true;
      } catch (e) {
        // Fallback caso a regex falhe
        if (tipoLimpo.includes(nomeLimpo) || tipoLimpo.includes(catLimpo)) return true;
      }
      
      return false;
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

  const contagemPorCategoria = useMemo(() => {
    let counts = [0, 0, 0, 0];
    municoesInventario.forEach(item => {
      const cat = String(item.municao.Categoria_Item).trim();
      if (cat === 'I') counts[0]++;
      else if (cat === 'II') counts[1]++;
      else if (cat === 'III') counts[2]++;
      else if (cat === 'IV') counts[3]++;
    });
    return counts;
  }, [municoesInventario]);

  return {
    municoes,
    municoesInventario,
    setMunicoesInventario,
    adicionarMunicao,
    removerMunicao,
    reordenarMunicoes,
    cargaMunicoes,
    contagemPorCategoria,
    getMunicoesCompativeis,
    loading,
    error,
  };
}
