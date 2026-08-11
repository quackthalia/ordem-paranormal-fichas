import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";

export interface ProgressaoNexItem {
  Codigo_Progrecao: number;
  Nex_Progrecao: string;
  Desc_Progrecao: string;
  Elemento_Progrecao?: string | null;
}

export function useProgressaoNex() {
  const [itensProgressao, setItensProgressao] = useState<ProgressaoNexItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchProgressao() {
      try {
        // TABELA NO SUPABASE: Progressão NEX
        const { data, error } = await supabase
          .from("Progressão NEX")
          .select("*")
          .order("Codigo_Progrecao", { ascending: true });

        if (cancelled) return;
        if (error) {
          console.error("Erro ao buscar Progressão NEX:", error);
        } else if (data) {
          setItensProgressao(data as ProgressaoNexItem[]);
        }
      } catch (err) {
        if (!cancelled) console.error("Exceção ao buscar Progressão NEX:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProgressao();
    return () => { cancelled = true; };
  }, []);

  return { itensProgressao, loading };
}
