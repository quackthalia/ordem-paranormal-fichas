import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";

export interface ProgressaoNexItem {
  Codigo_Progrecao: number;
  Nex_Progrecao: string; // Ex: '25%'
  Desc_Progrecao: string;
  Elemento_Progrecao: string;
}

export function useProgressaoNex() {
  const [itensProgressao, setItensProgressao] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProgressao() {
      try {
        // TABELA NO SUPABASE: Progreção NEX (com ç)
        const { data, error } = await supabase
          .from("Progreção NEX")
          .select("*")
          .order("Codigo_Progrecao", { ascending: true });

        if (error) {
          console.error("Erro ao buscar Progressão NEX:", error);
        } else if (data) {
          setItensProgressao(data);
        }
      } catch (err) {
        console.error("Exceção ao buscar Progressão NEX:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProgressao();
  }, []);

  return { itensProgressao, loading };
}
