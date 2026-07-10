import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { Poder, PoderParanormal, ClasseRPG, PoderesEscolhidos } from '../types';

interface UsePoderesReturn {
  poderesClasse: Poder[];
  listaPoderesUtilidade: Poder[];
  poderesParanormais: PoderParanormal[];
  poderesEscolhidos: PoderesEscolhidos;
  setPoderesEscolhidos: React.Dispatch<React.SetStateAction<PoderesEscolhidos>>;
  poderClasse: Poder | null;
  loading: boolean;
  error: string | null;
  escolherPoder: (nex: number, poder: Poder | PoderParanormal) => void;
  removerPoder: (nex: number) => void;
  editarPoder: (nex: number, nome: string, descricao: string) => void;
}

/** Normaliza colunas da tabela Poderes */
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
    Fonte: String(primeiro('Fonte', 'fonte') ?? ''),
  };
}

/** 🔥 Normaliza colunas da tabela PoderesParanormais */
function normalizarPoderParanormal(item: Record<string, unknown>): PoderParanormal {
  const primeiro = (...chaves: string[]) => {
    for (const chave of chaves) {
      const valor = item[chave];
      if (valor !== undefined && valor !== null) return valor;
    }
    return undefined;
  };

  return {
    codigo_poder: Number(primeiro('Codigo_Poder_Paranormal', 'codigo_poder_paranormal') ?? 0),
    Nome: String(primeiro('Nome_Poder_Paranormal', 'nome_poder_paranormal') ?? ''),
    Descricao: String(primeiro('Descricao_Poder_Paranormal', 'descricao_poder_paranormal') ?? ''),
    PreRequisitos: String(
      primeiro('Pre_Requisitos_Poder_Paranormal', 'pre_requisitos_poder_paranormal') ?? ''
    ),
    Afinidade: String(primeiro('Afinidade', 'afinidade') ?? ''),
    Elemento: String(primeiro('Elemento_Poder_Paranormal', 'elemento_poder_paranormal') ?? ''),
    Fonte: String(primeiro('Fonte_Poder_Paranormal', 'fonte_poder_paranormal') ?? ''),
  };
}

export function usePoderes(classe: ClasseRPG): UsePoderesReturn {
  const [poderesClasse, setPoderesClasse] = useState<Poder[]>([]);
  const [listaPoderesUtilidade, setListaPoderesUtilidade] = useState<Poder[]>([]);
  const [poderesParanormais, setPoderesParanormais] = useState<PoderParanormal[]>([]);
  const [poderClasse, setPoderClasse] = useState<Poder | null>(null);
  const [poderesEscolhidos, setPoderesEscolhidos] = useState<PoderesEscolhidos>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Poderes da classe selecionada
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
        const normalizados = data.map(normalizarPoder);
        console.log('📚 Poderes de classe carregados:', normalizados.length);
        setPoderesClasse(normalizados);
      }

      setLoading(false);
    }

    carregar();
    return () => { cancelled = true; };
  }, [classe]);

  // 2. TODOS os poderes (para o modal de escolha)
  useEffect(() => {
    let cancelled = false;

    async function carregar() {
      const { data, error: err } = await supabase.from('Poderes').select('*');

      if (cancelled) return;

      if (err) {
        console.error('Erro ao buscar poderes:', err);
        setError(err.message);
      } else if (data) {
        const normalizados = data.map(normalizarPoder);
        console.log('📚 Todos os poderes carregados:', normalizados.length);
        setListaPoderesUtilidade(normalizados);
      }
    }

    carregar();
    return () => { cancelled = true; };
  }, []);

  // 🔥 3. PODERES PARANORMAIS
  useEffect(() => {
    let cancelled = false;

    async function carregar() {
      console.log('🔍 Buscando PoderesParanormais...');
      const { data, error: err } = await supabase.from('PoderesParanormais').select('*');

      if (cancelled) return;

      if (err) {
        console.error('Erro ao buscar poderes paranormais:', err);
      } else if (data) {
        const normalizados = data.map(normalizarPoderParanormal);
        console.log('🔥 Poderes Paranormais carregados:', normalizados.length, normalizados.map(p => p.Nome));
        setPoderesParanormais(normalizados);
      } else {
        console.warn('⚠️ Nenhum dado retornado de PoderesParanormais');
      }
    }

    carregar();
    return () => { cancelled = true; };
  }, []);

  // 4. Poder específico do Combatente (Codigo_Poder = 179)
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
        const normalizado = normalizarPoder(data);
        console.log('🎯 Poder classe Combatente:', normalizado.Nome);
        setPoderClasse(normalizado);
      }
    }

    carregar();
    return () => { cancelled = true; };
  }, [classe]);

  const escolherPoder = useCallback((nex: number, poder: Poder | PoderParanormal) => {
    console.log('🎯 escolherPoder chamado:', { nex, nome: poder.Nome });
    setPoderesEscolhidos(prev => {
      const novo = {
        ...prev,
        [nex]: {
          nome: poder.Nome,
          descricao: poder.Descricao,
          preRequisitos: poder.PreRequisitos,
          fonte: (poder as Poder).Fonte || (poder as PoderParanormal).Fonte || '',
        },
      };
      return novo;
    });
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
    poderesParanormais,
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

// 🔥 VERSÃO ATUALIZADA: aceita 4 parâmetros
export function usePoderesFiltrados(
  listaPoderesUtilidade: Poder[],
  poderesParanormais: PoderParanormal[],
  abaModal: 'classe' | 'gerais' | 'combate' | 'paranormais',
  classe: ClasseRPG
) {
  return useMemo(() => {
    // 🔥 Aba paranormais: retorna a lista completa de poderes paranormais
    if (abaModal === 'paranormais') {
      const ordenados = [...poderesParanormais].sort((a, b) => a.Nome.localeCompare(b.Nome));
      console.log('👻 Filtrando paranormais:', ordenados.length);
      return ordenados;
    }

    // Outras abas: filtro normal na tabela Poderes
    return listaPoderesUtilidade
      .filter(p => {
        const classePoder = (p.Classe || '').toLowerCase();
        const tipoPoder = (p.Tipo || '').toLowerCase();

        if (abaModal === 'classe') {
          return classePoder === classe?.toLowerCase() && tipoPoder === 'utilidade';
        }
        if (abaModal === 'combate') {
          return tipoPoder === 'combate';
        }
        if (abaModal === 'gerais') {
          return tipoPoder === 'geral' || classePoder === 'geral' || classePoder === 'todos';
        }
        return false;
      })
      .sort((a, b) => a.Nome.localeCompare(b.Nome));
  }, [listaPoderesUtilidade, poderesParanormais, abaModal, classe]);
}