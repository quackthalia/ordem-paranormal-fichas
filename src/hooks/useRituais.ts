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

export function useRituais(): UseRituaisReturn {
  const [rituais, setRituais] = useState<Ritual[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function carregar() {
      setLoading(true);
      setError(null);

      // 🧪 Para teste, puxando apenas o ritual de Codigo_Ritual = 1
      const { data, error: err } = await supabase
        .from('Rituais')
        .select('*')
        .eq('Codigo_Ritual', 1);

      if (cancelled) return;

      if (err) {
        console.error('❌ Erro ao carregar rituais:', err);
        setError(err.message);
      }

      if (data) {
        const normalizados = data.map(normalizarRitual);
        console.log('🔮 Rituais carregados:', normalizados.length);
        setRituais(normalizados);
      }

      setLoading(false);
    }

    carregar();
    return () => { cancelled = true; };
  }, []);

  return { rituais, loading, error };
}
