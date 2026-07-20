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
  escolherPoderExtra: (poder: Poder | PoderParanormal) => void;
  removerPoder: (nex: number | string) => void;
  editarPoder: (nex: number | string, nome: string, descricao: string, afinidade?: string) => void;
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
    Pre_Codigo: primeiro('Pre_Codigo', 'pre_codigo') ? Number(primeiro('Pre_Codigo', 'pre_codigo')) : null,
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
    Fonte: String(primeiro('Fonte_Poder_Paranormal', 'fonte_poder_paranormal', 'fonte', 'Fonte', 'Fonte_Poder', 'fonte_poder', 'livro', 'Livro') ?? ''),
    PreRequisitosAfinidade: (() => {
      const raw = item['Pre_Requisitos_Afinidade'];
      if (raw !== null && raw !== undefined && String(raw).trim() !== '') {
        return String(raw);
      }
      return undefined;
    })(),
    Pre_Codigo: primeiro('Pre_Regra', 'pre_regra', 'Pre_Codigo_Poder_Paranormal', 'pre_codigo_poder_paranormal', 'Pre_Codigo', 'pre_codigo') 
      ? Number(primeiro('Pre_Regra', 'pre_regra', 'Pre_Codigo_Poder_Paranormal', 'pre_codigo_poder_paranormal', 'Pre_Codigo', 'pre_codigo')) 
      : null,
    Pre_Codigo_Afinidade: primeiro('Pre_Regra_Afinidade', 'pre_regra_afinidade', 'Codigo_Regra_Afinidade', 'codigo_regra_afinidade')
      ? Number(primeiro('Pre_Regra_Afinidade', 'pre_regra_afinidade', 'Codigo_Regra_Afinidade', 'codigo_regra_afinidade'))
      : null,
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
      if (!classe) { setPoderClasse(null); return; }
      
      let codigoPoder = 0;
      if (classe === 'Combatente') codigoPoder = 179;
      else if (classe === 'Especialista') codigoPoder = 181;
      else if (classe === 'Ocultista') codigoPoder = 183;
      
      if (codigoPoder === 0) return;

      const { data, error: err } = await supabase.from('Poderes').select('*').eq('Codigo_Poder', codigoPoder).single();
      if (cancelled) return;
      if (!err && data) setPoderClasse(normalizarPoder(data));
    }
    carregar();
    return () => { cancelled = true; };
  }, [classe]);

  const escolherPoder = useCallback((
    nex: number,
    poder: Poder | PoderParanormal,
    categoria?: 'utilidade' | 'combate' | 'gerais' | 'trilha',
    elementoEscolhido?: string,
    periciaEscolhida?: string
  ) => {
    const pp = poder as PoderParanormal;
    const isParanormal = 'Elemento' in pp || 'Afinidade' in pp;
    const catFinal: 'utilidade' | 'combate' | 'gerais' | 'paranormais' | 'trilha' = 
      isParanormal ? 'paranormais' : (categoria || 'utilidade');

    let nomeFinal = poder.Nome;
    if (elementoEscolhido) {
      if (nomeFinal.includes('<Elemento>')) {
        nomeFinal = nomeFinal.replace('<Elemento>', elementoEscolhido);
      } else {
        nomeFinal = `${nomeFinal} (${elementoEscolhido})`;
      }
    }
    
    if (periciaEscolhida) {
      if (nomeFinal.includes('<Perícia>')) {
        nomeFinal = nomeFinal.replace('<Perícia>', periciaEscolhida);
      } else {
        nomeFinal = `${nomeFinal} (${periciaEscolhida})`;
      }
    }

    setPoderesEscolhidos(prev => ({
      ...prev,
      [nex]: {
        nome: nomeFinal,
        descricao: poder.Descricao,
        preRequisitos: poder.PreRequisitos,
        fonte: (poder as Poder).Fonte || (poder as any).fonte || pp.Fonte || '',
        afinidade: pp.Afinidade || '',
        elemento: elementoEscolhido || pp.Elemento || undefined,
        categoria: catFinal,
      },
    }));
  }, []);

  const escolherPoderExtra = useCallback((poder: Poder | PoderParanormal, elementoEscolhido?: string, periciaEscolhida?: string) => {
    const pp = poder as PoderParanormal;
    const isParanormal = 'Elemento' in pp || 'Afinidade' in pp;
    const isTrilha = (poder as Poder).Tipo?.toLowerCase() === 'trilha';
    const catFinal: 'utilidade' | 'combate' | 'gerais' | 'paranormais' | 'trilha' = 
      isParanormal ? 'paranormais' : (isTrilha ? 'trilha' : ((poder as Poder).Tipo?.toLowerCase() === 'geral' ? 'gerais' : 'utilidade'));

    const uniqueId = `extra_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    let nomeFinal = poder.Nome;
    if (elementoEscolhido) {
      if (nomeFinal.includes('<Elemento>')) {
        nomeFinal = nomeFinal.replace('<Elemento>', elementoEscolhido);
      } else {
        nomeFinal = `${nomeFinal} (${elementoEscolhido})`;
      }
    }

    if (periciaEscolhida) {
      if (nomeFinal.includes('<Perícia>')) {
        nomeFinal = nomeFinal.replace('<Perícia>', periciaEscolhida);
      } else {
        nomeFinal = `${nomeFinal} (${periciaEscolhida})`;
      }
    }

    setPoderesEscolhidos(prev => ({
      ...prev,
      [uniqueId]: {
        nome: nomeFinal,
        descricao: poder.Descricao,
        preRequisitos: poder.PreRequisitos,
        fonte: (poder as Poder).Fonte || (poder as any).fonte || pp.Fonte || '',
        afinidade: pp.Afinidade || '',
        elemento: elementoEscolhido || pp.Elemento || undefined,
        categoria: catFinal,
      },
    }));

    if (poder.Nome.toLowerCase() === 'aprender ritual') {
      window.dispatchEvent(new CustomEvent('abrirModalRituais', { detail: { nex: uniqueId } }));
    }
  }, []);

  const removerPoder = useCallback((nex: number | string) => {
    setPoderesEscolhidos(prev => {
      const copy = { ...prev };
      delete copy[nex];
      return copy;
    });
  }, []);

  const editarPoder = useCallback((nex: number | string, nome: string, descricao: string, afinidade?: string) => {
    setPoderesEscolhidos(prev => ({
      ...prev,
      [nex]: { ...prev[nex], nome, descricao, afinidade: afinidade || prev[nex]?.afinidade || '' }
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
    escolherPoderExtra,
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
  intelecto: number,
  afinidadeEscolhida?: string | null,
  afinidadeAtiva?: boolean
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

      // Lógica de Afinidade (se tiver afinidade ativa e o poder for do elemento)
      if (afinidadeAtiva && afinidadeEscolhida && 'Elemento' in p && p.Elemento) {
        if (p.Elemento.toLowerCase() === afinidadeEscolhida.toLowerCase()) {
          return count < 2;
        }
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
        if (!tipoPoder) return false;
        if (abaModal === 'classe' || abaModal === 'combate') {
          show = classePoder === classe?.toLowerCase();
        } else if (abaModal === 'gerais') {
          show = tipoPoder === 'geral' || classePoder === 'geral' || classePoder === 'todos';
        }

        if (!show) return false;
        return filterFn(p);
      })
      .sort((a, b) => a.Nome.localeCompare(b.Nome));
  }, [listaPoderesUtilidade, poderesParanormais, abaModal, classe, poderesEscolhidos, intelecto]);
}