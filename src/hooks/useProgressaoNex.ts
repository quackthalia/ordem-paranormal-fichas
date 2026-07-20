import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export interface ProgressaoNexItem {
  Codigo_Progrecao: number;
  Nex_Progrecao: string; // Ex: '25%'
  Desc_Progrecao: string;
  Elemento_Progrecao: string;
}

export function useProgressaoNex() {
  const [itensProgressao, setItensProgressao] = useState<ProgressaoNexItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const { data, error } = await supabase
          .from('Progressão NEX')
          .select('*')
          .order('Codigo_Progrecao', { ascending: true });

        if (error) {
          console.error("Erro ao buscar Progressão NEX do Supabase:", error);
          if (isMounted) setLoading(false);
          return;
        }

        if (data && isMounted) {
          setItensProgressao(data as ProgressaoNexItem[]);
          setLoading(false);
        }
      } catch (err) {
        console.error("Erro ao carregar progressão de NEX:", err);
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { itensProgressao, loading };
}
