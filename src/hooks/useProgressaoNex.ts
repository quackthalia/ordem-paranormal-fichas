import { useState, useEffect, useMemo } from "react";
import { supabase } from "../services/supabase";

export interface ProgressaoNexItem {
  Codigo_Progrecao: number;
  Nex_Progrecao: string;
  Desc_Progrecao: string;
  Elemento_Progrecao?: string | null;
}

let cachedProgressaoNex: ProgressaoNexItem[] | null = null;

export function useProgressaoNex() {
  const [itensProgressao, setItensProgressao] = useState<ProgressaoNexItem[]>(cachedProgressaoNex || []);
  const [loading, setLoading] = useState(!cachedProgressaoNex);

  useEffect(() => {
    if (cachedProgressaoNex) {
      setItensProgressao(cachedProgressaoNex);
      setLoading(false);
      return;
    }
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
          cachedProgressaoNex = data as ProgressaoNexItem[];
          setItensProgressao(cachedProgressaoNex);
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

  return useMemo(() => ({ itensProgressao, loading }), [itensProgressao, loading]);
}
