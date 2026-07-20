import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import Papa from 'papaparse';

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
        // Tenta buscar do Supabase primeiro
        const { data, error } = await supabase
          .from('Progressão NEX')
          .select('*')
          .order('Codigo_Progrecao', { ascending: true });

        // Se retornar dados válidos e não vazio
        if (!error && data && data.length > 0) {
          if (isMounted) {
            setItensProgressao(data as ProgressaoNexItem[]);
            setLoading(false);
          }
          return;
        }

        // Se deu erro ou vazio, faz fallback pro CSV local!
        console.warn("Supabase não retornou dados para Progressão NEX (RLS ativo ou tabela não encontrada?). Usando fallback CSV...");
        
        const response = await fetch('/progressao_nex.csv');
        const csvText = await response.text();

        Papa.parse<ProgressaoNexItem>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (isMounted) {
              setItensProgressao(results.data as ProgressaoNexItem[]);
              setLoading(false);
            }
          },
        });
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
