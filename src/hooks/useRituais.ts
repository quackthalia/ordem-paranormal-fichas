import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Ritual } from '../types';

interface UseRituaisReturn {
  rituais: Ritual[];
  loading: boolean;
  error: string | null;
}

function normalizarRitual(item: Record<string, unknown>): Ritual {
  const str = (val: unknown) => (val !== null && val !== undefined ? String(val) : '');
  const bool = (val: unknown) => val === true || val === 'TRUE' || val === 'true';

  return {
    Codigo_Ritual: Number(item['Codigo_Ritual'] ?? 0),
    Nome_Ritual: str(item['Nome_Ritual']),
    Descricao_Ritual: str(item['Descricao_Ritual']),
    Elemento_Ritual: str(item['Elemento_Ritual']),
    Circulo_Ritual: Number(item['Circulo_Ritual'] ?? 1),
    PE_Ritual: str(item['PE_Ritual']),
    Execucao_Ritual: str(item['Execucao_Ritual']),
    Alcance_Ritual: str(item['Alcance_Ritual']),
    Area_Ritual: str(item['Area_Ritual']),
    Alvo_Ritual: str(item['Alvo_Ritual']),
    Duracao_Ritual: str(item['Duracao_Ritual']),
    Efeito_Ritual: str(item['Efeito_Ritual']),
    Resistencia_Ritual: str(item['Resistencia_Ritual']),
    Dados_Ritual: str(item['Dados_Ritual']),
    Tem_Discente: bool(item['Tem Discente?'] ?? item['Tem_Discente']),
    Tem_Verdadeiro: bool(item['Tem Verdadeiro?'] ?? item['Tem_Verdadeiro']),
    Imagem: str(item['Imagem']),
    Requisito_Discente: str(item['Requisito_Discente']),
    Requisito_Verdadeiro: str(item['Requisito_Verdadeiro']),
  };
}

export function useRituais(): UseRituaisReturn & {
  rituaisAprendidos: import('../types').RitualAprendido[];
  aprenderRitual: (ritual: import('../types').RitualAprendido) => void;
  esquecerRitual: (origem: string) => void;
  editarRitual: (origem: string, customNome?: string, customDesc?: string, customProps?: import('../types').RitualAprendido['customProps']) => void;
  atualizarRituaisAprendidos: (novos: import('../types').RitualAprendido[]) => void;
  simbolosRituais: Map<number, Record<string, string>>;
  getSimboloUrl: (codigo: number, elemento?: string) => string;
} {
  const [rituais, setRituais] = useState<Ritual[]>([]);
  const [simbolosRaw, setSimbolosRaw] = useState<{ codigo: number; urls: Record<string, string> }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 🔥 NOVO ESTADO: Rituais Aprendidos
  const [rituaisAprendidos, setRituaisAprendidos] = useState<import('../types').RitualAprendido[]>([]);

  const simbolosRituais = new Map(simbolosRaw.map(s => [s.codigo, s.urls]));
  const getSimboloUrl = (codigo: number, elemento?: string) => {
    const urls = simbolosRituais.get(codigo);
    if (!urls) return '';
    if (elemento && urls[elemento.trim().toLowerCase()]) return urls[elemento.trim().toLowerCase()];
    console.log('getSimboloUrl:', codigo, elemento, urls); return urls.default;
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchRituais() {
      try {
        setLoading(true);
        const [rituaisRes, simbolosRes] = await Promise.all([
          supabase.from('Rituais').select('*').order('Circulo_Ritual', { ascending: true }),
          supabase.from('Símbolos Rituais').select('Codigo_Ritual, Link_Imagem, Link_Imagem2, Link_Imagem3, Link_Imagem4')
        ]);

        if (rituaisRes.error) throw rituaisRes.error;
        if (simbolosRes.error) throw simbolosRes.error;

        if (!cancelled) {
          const rituaisNormalized = rituaisRes.data.map(normalizarRitual);
          setRituais(rituaisNormalized);

                    const simbolosTransformados = (simbolosRes.data || [])
            .filter(row => row.Link_Imagem)
            .map(row => {
              const processUrl = (url) => {
                if (!url) return '';
                if (url.includes('dropbox.com')) {
                  return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace(/[?&]dl=[01]/, '');
                }
                return url;
              };
              return { 
                codigo: Number(row.Codigo_Ritual), 
                urls: {
                  default: processUrl(row.Link_Imagem),
                  sangue: processUrl(row.Link_Imagem),
                  morte: processUrl(row.Link_Imagem2 || row.Link_Imagem),
                  conhecimento: processUrl(row.Link_Imagem3 || row.Link_Imagem),
                  energia: processUrl(row.Link_Imagem4 || row.Link_Imagem)
                } 
              };
            });
          setSimbolosRaw(simbolosTransformados);
          
          // NOTA: O pre-load agressivo (new Image().src) foi removido pois estava engarrafando a fila de download 
          // do navegador (são ~76 imagens). Agora o navegador só baixa o que realmente aparece na tela, com os links ultra rápidos do CDN.
        }
      } catch (err: any) {
        console.error('Erro ao buscar rituais:', err);
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchRituais();
    return () => { cancelled = true; };
  }, []);

  const aprenderRitual = (ritual: import('../types').RitualAprendido) => {
    setRituaisAprendidos(prev => [...prev, ritual]);
  };

  const esquecerRitual = (origem: string) => {
    setRituaisAprendidos(prev => prev.filter(r => r.origem !== origem));
  };

  const editarRitual = (origem: string, customNome?: string, customDesc?: string, customProps?: import('../types').RitualAprendido['customProps']) => {
    setRituaisAprendidos(prev => prev.map(r => {
      if (r.origem === origem) {
        return {
          ...r,
          customNome: customNome !== undefined ? customNome : r.customNome,
          customDesc: customDesc !== undefined ? customDesc : r.customDesc,
          customProps: customProps !== undefined ? customProps : r.customProps
        };
      }
      return r;
    }));
  };

  return { rituais, loading, error, rituaisAprendidos, aprenderRitual, esquecerRitual, editarRitual, atualizarRituaisAprendidos: setRituaisAprendidos, simbolosRituais, getSimboloUrl };
}
