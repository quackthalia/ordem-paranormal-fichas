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
  escolherPoder: (nex: number, poder: Poder | PoderParanormal, categoria?: 'utilidade' | 'combate' | 'gerais') => void;
  removerPoder: (nex: number) => void;
  editarPoder: (nex: number, nome: string, descricao: string, afinidade?: string) => void;
}

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
    PreRequisitosAfinidade: (() => {
      const raw = item['Pre_Requisitos_Afinidade'];
      if (raw !== null && raw !== undefined && String(raw).trim() !== '') {
        return String(raw);
      }
      return undefined;
    })(),
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

  useEffect(() => {
    let cancelled = false;
    async function carregar() {
      if (!classe) { setPoderesClasse([]); return; }
      setLoading(true); setError(null);
      const { data, error: err } = await supabase.from('Poderes').select('*').eq('Classe', classe);
      if (cancelled) return;
      if (err) { console.error(err); setError(err.message); }
      if (data) setPoderesClasse(data.map(normalizarPoder));
      setLoading(false);
    }
    carregar();
    return () => { cancelled = true; };
  }, [classe]);

  useEffect(() => {
    let cancelled = false;
    async function carregar() {
      const { data, error: err } = await supabase.from('Poderes').select('*');
      if (cancelled) return;
      if (err) { console.error(err); setError(err.message); }
      else if (data) setListaPoderesUtilidade(data.map(normalizarPoder));
    }
    carregar();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function carregar() {
      console.log('🔍 Buscando PoderesParanormais...');
      const { data, error: err } = await supabase.from('PoderesParanormais').select('*');
      if (cancelled) return;
      if (err) console.error(err);
      else if (data) {
        const normalizados = data.map(normalizarPoderParanormal);
        console.log('🔥 Poderes Paranormais carregados:', normalizados.length);
        normalizados.forEach(p => {
          if (p.PreRequisitosAfinidade) {
            console.log(`⚡ Poder "${p.Nome}" tem PreRequisitosAfinidade: "${p.PreRequisitosAfinidade}"`);
          }
        });
        setPoderesParanormais(normalizados);
      }
    }
    carregar();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function carregar() {
      if (classe !== 'Combatente') { setPoderClasse(null); return; }
      const { data, error: err } = await supabase.from('Poderes').select('*').eq('Codigo_Poder', 179).single();
      if (cancelled) return;
      if (!err && data) setPoderClasse(normalizarPoder(data));
    }
    carregar();
    return () => { cancelled = true; };
  }, [classe]);

  const escolherPoder = useCallback((
    nex: number,
    poder: Poder | PoderParanormal,
    categoria?: 'utilidade' | 'combate' | 'gerais'
  ) => {
    const pp = poder as PoderParanormal;
    const isParanormal = 'Elemento' in pp || 'Afinidade' in pp;
    const catFinal: 'utilidade' | 'combate' | 'gerais' | 'paranormais' = 
      isParanormal ? 'paranormais' : (categoria || 'utilidade');

    setPoderesEscolhidos(prev => ({
      ...prev,
      [nex]: {
        nome: poder.Nome,
        descricao: poder.Descricao,
        preRequisitos: poder.PreRequisitos,
        fonte: (poder as Poder).Fonte || pp.Fonte || '',
        afinidade: pp.Afinidade || '',
        categoria: catFinal,
      },
    }));
  }, []);

  const removerPoder = useCallback((nex: number) => {
    setPoderesEscolhidos(prev => {
      const novo = { ...prev };
      delete novo[nex];
      return novo;
    });
  }, []);

  const editarPoder = useCallback((nex: number, nome: string, descricao: string, afinidade?: string) => {
    setPoderesEscolhidos(prev => ({
      ...prev,
      [nex]: {
        ...prev[nex],
        nome,
        descricao,
        afinidade: afinidade !== undefined ? afinidade : (prev[nex]?.afinidade || ''),
      },
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



export function usePoderesFiltrados(
  listaPoderesUtilidade: Poder[],
  poderesParanormais: PoderParanormal[],
  abaModal: 'classe' | 'gerais' | 'combate' | 'paranormais',
  classe: ClasseRPG,
  poderesEscolhidos: PoderesEscolhidos,
  intelecto: number
) {
  return useMemo(() => {
    // Conta quantas vezes cada poder base foi escolhido
    const contagemEscolhidos: Record<string, number> = {};
    Object.values(poderesEscolhidos).forEach(poder => {
      let nomeBase = poder.nome.trim();
      if (nomeBase.toLowerCase().startsWith('aprender ritual')) {
        nomeBase = 'Aprender Ritual';
      }
      contagemEscolhidos[nomeBase] = (contagemEscolhidos[nomeBase] || 0) + 1;
    });

    const filterFn = (p: Poder | PoderParanormal) => {
      const nomeBase = p.Nome.trim();
      const count = contagemEscolhidos[nomeBase] || 0;

      if (nomeBase === 'Guardião da Tropa') return count < 2;
      if (nomeBase === 'Recuperação Flagelante') return count < 3;
      if (['Transcender', 'Foco em Perícia', '<Habilidade> Aprimorada'].includes(nomeBase)) return true;
      if (nomeBase === 'Aprender Ritual') {
        const limit = Math.max(0, intelecto);
        return count < limit;
      }
      return count < 1;
    };

    if (abaModal === 'paranormais') {
      return [...poderesParanormais]
        .filter(filterFn)
        .sort((a, b) => a.Nome.localeCompare(b.Nome));
    }

    return listaPoderesUtilidade
      .filter(p => {
        const classePoder = (p.Classe || '').toLowerCase();
        const tipoPoder = (p.Tipo || '').toLowerCase();

        let show = false;
        if (abaModal === 'classe') show = classePoder === classe?.toLowerCase() && tipoPoder === 'utilidade';
        else if (abaModal === 'combate') show = tipoPoder === 'combate';
        else if (abaModal === 'gerais') show = tipoPoder === 'geral' || classePoder === 'geral' || classePoder === 'todos';

        if (!show) return false;
        return filterFn(p);
      })
      .sort((a, b) => a.Nome.localeCompare(b.Nome));
  }, [listaPoderesUtilidade, poderesParanormais, abaModal, classe, poderesEscolhidos, intelecto]);
}