import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { Poder, ClasseRPG, PoderesEscolhidos } from '../types';

interface UsePoderesReturn {
  poderesClasse: Poder[];
  listaPoderesUtilidade: Poder[];
  poderesEscolhidos: PoderesEscolhidos;
  setPoderesEscolhidos: React.Dispatch<React.SetStateAction<PoderesEscolhidos>>;
  poderClasse: Poder | null;
  loading: boolean;
  error: string | null;
  escolherPoder: (nex: number, poder: Poder) => void;
  removerPoder: (nex: number) => void;
  editarPoder: (nex: number, nome: string, descricao: string) => void;
}

/** Normaliza colunas do Supabase (resolve o problema das variações de nome) */
function normalizarPoder(item: Record<string, any>): Poder {
  return {
    codigo_poder: item.Codigo_Poder ?? item.codigo_poder ?? 0,
    Nome: item.Nome ?? item.nome ?? '',
    Descricao: item.Descrição ?? item.descrição ?? item.Descricao ?? item.descricao ?? '',
    Classe: item.Classe ?? item.classe ?? '',
    Tipo: item.Tipo ?? item.tipo ?? '',
    PreRequisitos:
      item['Pre-Requisitos'] ??
      item['pre-requisitos'] ??
      item.Pre_Requisitos ??
      item.pre_requisitos ??
      item.Requisitos ??
      item.requisitos ??
      '',
  };
}

export function usePoderes(classe: ClasseRPG): UsePoderesReturn {
  const [poderesClasse, setPoderesClasse] = useState<Poder[]>([]);
  const [listaPoderesUtilidade, setListaPoderesUtilidade] = useState<Poder[]>([]);
  const [poderClasse, setPoderClasse] = useState<Poder | null>(null);
  const [poderesEscolhidos, setPoderesEscolhidos] = useState<PoderesEscolhidos>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Busca poderes da classe selecionada
  useEffect(() => {
    if (!classe) {
      setPoderesClasse([]);
      return;
    }

    let cancelled = false;

    async function carregar() {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('Poderes')
        .select('*')
        .eq('Classe', classe);

      if (cancelled) return;

      if (err) {
        console.error('Erro ao buscar poderes da classe:', err);
        setError(err.message);
      }

      if (data) {
        setPoderesClasse(data.map(normalizarPoder));
      }

      setLoading(false);
    }

    carregar();
    return () => { cancelled = true; };
  }, [classe]);

  // 2. Busca TODOS os poderes (para o modal de escolha)
  useEffect(() => {
    let cancelled = false;

    async function carregar() {
      const { data, error: err } = await supabase.from('Poderes').select('*');

      if (cancelled) return;

      if (err) {
        console.error('Erro ao buscar poderes:', err);
        setError(err.message);
      } else if (data) {
        setListaPoderesUtilidade(data.map(normalizarPoder));
      }
    }

    carregar();
    return () => { cancelled = true; };
  }, []);

  // 3. Busca o poder específico do Combatente (Codigo_Poder = 179)
  useEffect(() => {
    if (classe !== 'Combatente') {
      setPoderClasse(null);
      return;
    }

    let cancelled = false;

    async function carregar() {
      const { data, error: err } = await supabase
        .from('Poderes')
        .select('*')
        .eq('Codigo_Poder', 179)
        .single();

      if (cancelled) return;

      if (!err && data) {
        setPoderClasse(normalizarPoder(data));
      }
    }

    carregar();
    return () => { cancelled = true; };
  }, [classe]);

  const escolherPoder = useCallback((nex: number, poder: Poder) => {
    setPoderesEscolhidos(prev => ({
      ...prev,
      [nex]: { nome: poder.Nome, descricao: poder.Descricao, preRequisitos: poder.PreRequisitos },
    }));
  }, []);

  const removerPoder = useCallback((nex: number) => {
    setPoderesEscolhidos(prev => {
      const novo = { ...prev };
      delete novo[nex];
      return novo;
    });
  }, []);

  const editarPoder = useCallback((nex: number, nome: string, descricao: string) => {
    setPoderesEscolhidos(prev => ({
      ...prev,
      [nex]: { ...prev[nex], nome, descricao },
    }));
  }, []);

  return {
    poderesClasse,
    listaPoderesUtilidade,
    poderesEscolhidos,
    setPoderesEscolhidos,
    poderClasse,
    loading,
    error,
    escolherPoder,
    removerPoder,
    editarPoder,
  };
}

/** Hook separado para filtrar e memoizar a lista do modal */
export function usePoderesFiltrados(
  listaPoderesUtilidade: Poder[],
  abaModal: 'classe' | 'gerais',
  classe: ClasseRPG
) {
  return useMemo(() => {
    return listaPoderesUtilidade
      .filter(p => {
        const classePoder = p.Classe?.toLowerCase() || '';
        const tipoPoder = p.Tipo?.toLowerCase() || '';

        if (abaModal === 'classe') {
          return (
            classePoder === classe?.toLowerCase() &&
            classePoder !== 'geral' &&
            classePoder !== 'gerais' &&
            tipoPoder === 'utilidade'
          );
        }

        return classePoder.includes('geral') || tipoPoder.includes('geral') || classePoder === 'todos';
      })
      .sort((a, b) => a.Nome.localeCompare(b.Nome));
  }, [listaPoderesUtilidade, abaModal, classe]);
}