import { useState, useEffect } from 'react';
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
