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
function normalizarPoder(item: Record<string, unknown>): Poder {
  const primeiro = (...chaves: string[]) => {
    for (const chave of chaves) {
      const valor = item[chave];
      if (valor !== undefined && valor !== null) return valor;
    }
    return undefined;
  };

  return {
    codigo_poder: Number(primeiro('Codigo_Poder', 'codigo_poder') ?? 0),
    Nome: String(primeiro('Nome', 'nome') ?? ''),
    Descricao: String(primeiro('Descrição', 'descrição', 'Descricao', 'descricao') ?? ''),
    Classe: String(primeiro('Classe', 'classe') ?? ''),
    Tipo: String(primeiro('Tipo', 'tipo') ?? ''),
    PreRequisitos: String(
      primeiro('Pre-Requisitos', 'pre-requisitos', 'Pre_Requisitos', 'pre_requisitos', 'Requisitos', 'requisitos') ?? ''
    ),
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
    let cancelled = false;

    async function carregar() {
      if (!classe) {
        setPoderesClasse([]);
        return;
      }

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
    let cancelled = false;

    async function carregar() {
      if (classe !== 'Combatente') {
        setPoderClasse(null);
        return;
      }

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

export function usePoderesFiltrados(
  listaPoderesUtilidade: Poder[],
  abaModal: 'classe' | 'gerais' | 'combate',
  classe: ClasseRPG
) {
  return useMemo(() => {
    return listaPoderesUtilidade
      .filter(p => {
        const classePoder = p.Classe?.toLowerCase() || '';
        const tipoPoder = p.Tipo?.toLowerCase() || '';

        // Aba Utilidade: SÓ Utilidade da classe
        if (abaModal === 'classe') {
          return classePoder === classe?.toLowerCase() && tipoPoder === 'utilidade';
        }

        // Aba Combate: SÓ Combate da classe
        if (abaModal === 'combate') {
          return classePoder === classe?.toLowerCase() && tipoPoder === 'combate';
        }

        // Aba Gerais: SÓ Gerais (de qualquer classe)
        if (abaModal === 'gerais') {
          return classePoder.includes('geral') || tipoPoder.includes('geral') || classePoder === 'todos';
        }

        return false;
      })
      .sort((a, b) => a.Nome.localeCompare(b.Nome));
  }, [listaPoderesUtilidade, abaModal, classe]);
}