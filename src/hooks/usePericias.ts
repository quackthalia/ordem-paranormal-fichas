import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../services/supabase';
import type { PericiasMap, AtributoKey, ClasseRPG, Atributos, PoderesEscolhidos, Origem } from '../types';
import { calcularLimitesPericias } from '../utils/rpgRules';

interface UsePericiasReturn {
  pericias: PericiasMap;
  nomesPericias: Record<number, string>;
  loading: boolean;
  error: string | null;
  handleMudarPericia: (nome: string, campo: 'treino' | 'outros' | 'atributo', valor: number | AtributoKey) => void;
  limites: { maxTreinadas: number; maxUpgrades: number };
  totais: { totalTreinadasUsadas: number; totalUpgradesGastos: number };
  periciasGratis: string[];
  regrasAtivas: boolean;
  jaTinhaProfissao33: boolean;
  debugRegra33: { avaliou: boolean, evalJaTinha: boolean };
  bonusRegra40: Record<string, number>;
  bonusVestimentas: Record<string, number>;
}

export function usePericias(
  classe: ClasseRPG,
  nivel: number,
  atributos: Atributos,
  regrasAtivas: boolean, // true = regras aplicadas, false = livre
  periciasGratisBase: string[],
  codigoPerRegra?: number | null,
  veteranasGratis: string[] = [],
  regrasAutomaticasAtivas?: Set<number>,
  poderesEscolhidos?: PoderesEscolhidos,
  origemSelecionada?: Origem | null,
  bonusVestimentas?: Record<string, number>
): UsePericiasReturn {
  const [pericias, setPericias] = useState<PericiasMap>({});
  const [nomesPericias, setNomesPericias] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jaTinhaProfissao33, setJaTinhaProfissao33] = useState<boolean>(false);
  const [avaliouRegra33, setAvaliouRegra33] = useState<boolean>(false);

  const [jaTinhaPericiaPoder, setJaTinhaPericiaPoder] = useState<Record<string, boolean>>({});
  const [avaliouPericiaPoder, setAvaliouPericiaPoder] = useState<Record<string, boolean>>({});

  // Sincroniza a avaliação no momento em que a regra muda (Deriving State during Render)
  const temAgora = regrasAutomaticasAtivas?.has(33);

  if (temAgora && !avaliouRegra33) {
    // Só avalia quando as perícias terminarem de carregar do DB
    if (pericias['Profissão'] && Object.keys(pericias).length > 0) {
      const valorTreino = pericias['Profissão'].treino;
      const jaTinha = valorTreino >= 5 || periciasGratisBase.includes('Profissão');
      
      setJaTinhaProfissao33(jaTinha);
      setAvaliouRegra33(true); // Isso aborta o render atual e reinicia com o valor novo
    }
  } else if (!temAgora && avaliouRegra33) {
    setJaTinhaProfissao33(false);
    setAvaliouRegra33(false);
  }

  const todosPoderesComRegra = useMemo(() => {
    const lista: { idSlot: string, codigoRegra: number, periciaPoder?: number | null, periciaEscolhidaNome?: string }[] = [];
    if (origemSelecionada?.Codigo_Regra) {
      lista.push({
        idSlot: 'origem_poder',
        codigoRegra: origemSelecionada.Codigo_Regra,
        periciaPoder: origemSelecionada.Pericia_Poder
      });
    }
    if (poderesEscolhidos) {
      Object.entries(poderesEscolhidos).forEach(([key, p]) => {
        if (p.codigoRegra) {
          lista.push({ idSlot: key, codigoRegra: p.codigoRegra, periciaPoder: p.periciaPoder, periciaEscolhidaNome: p.periciaEscolhidaNome });
        }
      });
    }
    return lista;
  }, [origemSelecionada, poderesEscolhidos]);

  // Avaliação dinâmica baseada nos poderes escolhidos e origem
  if (todosPoderesComRegra.length > 0 && Object.keys(pericias).length > 0) {
    let mudouPoder = false;
    const novoAvaliou = { ...avaliouPericiaPoder };
    const novoJaTinha = { ...jaTinhaPericiaPoder };

    todosPoderesComRegra.forEach(poder => {
      const { idSlot } = poder;
      const eRegraTreino = [40, 41, 44, 45].includes(poder.codigoRegra);
      if (eRegraTreino && poder.periciaPoder) {
        if (!avaliouPericiaPoder[idSlot]) {
          const nomePericiaRegra = nomesPericias[poder.periciaPoder];
          if (nomePericiaRegra && pericias[nomePericiaRegra]) {
            const valorTreino = pericias[nomePericiaRegra].treino;
            const jaTinha = valorTreino >= 5 || periciasGratisBase.includes(nomePericiaRegra);
            novoJaTinha[idSlot] = jaTinha;
            novoAvaliou[idSlot] = true;
            mudouPoder = true;
          }
        }
      }
    });

    // Limpeza de poderes removidos
    Object.keys(avaliouPericiaPoder).forEach(idSlot => {
      if (!todosPoderesComRegra.some(p => p.idSlot === idSlot)) {
        delete novoAvaliou[idSlot];
        delete novoJaTinha[idSlot];
        mudouPoder = true;
      }
    });

    if (mudouPoder) {
      setJaTinhaPericiaPoder(novoJaTinha);
      setAvaliouPericiaPoder(novoAvaliou);
    }
  }

  const periciasGratis = useMemo(() => {
    const gratis = [...periciasGratisBase];
    // Se a regra 33 está ativa e ele NÃO tinha a perícia antes, dá de graça
    if (regrasAutomaticasAtivas?.has(33) && !jaTinhaProfissao33) {
      gratis.push('Profissão');
    }
    
    
    // Regras 40, 41, 44 e 45 dão treinamento na perícia do poder se o usuário não era treinado
    const regrasTreino = [40, 41, 44, 45];
    if (regrasTreino.some(r => regrasAutomaticasAtivas?.has(r))) {
      todosPoderesComRegra.forEach(poder => {
        const { idSlot } = poder;
        if (regrasTreino.includes(poder.codigoRegra) && poder.periciaPoder) {
          if (avaliouPericiaPoder[idSlot] && !jaTinhaPericiaPoder[idSlot]) {
            const nome = nomesPericias[poder.periciaPoder];
            if (nome && !gratis.includes(nome)) gratis.push(nome);
          }
        }
      });
    }

    return gratis;
  }, [periciasGratisBase, regrasAutomaticasAtivas, jaTinhaProfissao33, todosPoderesComRegra, nomesPericias, avaliouPericiaPoder, jaTinhaPericiaPoder]);

  // Bônus passivo para quem já tinha a perícia (Regras 40, 41, 44, 45) e Bônus de INT (Regra 44)
  // Regra 46 (+2 fixo na perícia do poder)
  // Regra 47 (+3 fixo na perícia do poder)
  const bonusRegra40 = useMemo(() => {
    const bonus: Record<string, number> = {};
    
    // Regras de treinamento/bônus para quem já tinha
    const regrasTreino = [40, 41, 44, 45];
    // Regras de bônus fixo
    const regrasBonusFixo = [46, 47, 49, 50, 52, 55, 56, 57, 58];
    
    if (regrasTreino.some(r => regrasAutomaticasAtivas?.has(r)) || regrasBonusFixo.some(r => regrasAutomaticasAtivas?.has(r))) {
      todosPoderesComRegra.forEach(poder => {
        const { idSlot, codigoRegra, periciaPoder, periciaEscolhidaNome } = poder;
        
        let idPericiaReal = periciaPoder || Number(periciaEscolhidaNome);
        
        // Regra 52: Sangue de Ferro (Afinidade) dá +5 em Fortitude, mas o DB não tem a coluna Pericia_Poder
        if (codigoRegra === 52) {
          idPericiaReal = 10; // 10 é o ID de Fortitude
        }
        
        if (idPericiaReal) {
          const nome = nomesPericias[idPericiaReal];
          if (nome) {
            let valorBonus = 0;
            
            // Regras 40, 41, 44, 45
            if (regrasTreino.includes(codigoRegra)) {
              if (avaliouPericiaPoder[idSlot] && jaTinhaPericiaPoder[idSlot]) {
                valorBonus += 2;
              }
            }
            
            // Regra 46, 49 e 50 (+2 passivo)
            if (codigoRegra === 46 || codigoRegra === 49 || codigoRegra === 50) {
              valorBonus += 2;
            }
            
            // Regra 47 (+3 passivo)
            if (codigoRegra === 47) {
              valorBonus += 3;
            }
            
            // Regra 52 (+5 passivo em Fortitude)
            if (codigoRegra === 52 && nome === 'Fortitude') {
              valorBonus += 5;
            }
            
            if (valorBonus > 0) {
              bonus[nome] = (bonus[nome] || 0) + valorBonus;
            }
          }
        }
        
        // Regra 44 sempre dá +INT em Intuição, independentemente da perícia do poder
        if (codigoRegra === 44) {
          bonus['Intuição'] = (bonus['Intuição'] || 0) + atributos.INT;
        }
        
        // Regra 55: +5 passivo em Diplomacia, Intimidação e Intuição
        if (codigoRegra === 55) {
          bonus['Diplomacia'] = (bonus['Diplomacia'] || 0) + 5;
          bonus['Intimidação'] = (bonus['Intimidação'] || 0) + 5;
          bonus['Intuição'] = (bonus['Intuição'] || 0) + 5;
        }

        // Regra 56: +5 passivo em Percepção
        if (codigoRegra === 56) {
          bonus['Percepção'] = (bonus['Percepção'] || 0) + 5;
        }

        // Regra 57: +5 passivo em Furtividade
        if (codigoRegra === 57) {
          bonus['Furtividade'] = (bonus['Furtividade'] || 0) + 5;
        }

        // Regra 58: +10 passivo em Furtividade
        if (codigoRegra === 58) {
          bonus['Furtividade'] = (bonus['Furtividade'] || 0) + 10;
        }
      });
    }
    return bonus;
  }, [todosPoderesComRegra, regrasAutomaticasAtivas, nomesPericias, avaliouPericiaPoder, jaTinhaPericiaPoder, atributos.INT]);

  // Busca as perícias do banco
  useEffect(() => {
    let cancelled = false;

    async function carregar() {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('Perícias')
        .select('Codigo_Pericia, Nome_Pericia, Atributo_Pericia, Kit, Desc_Pericia');

      if (cancelled) return;

      if (err) {
        console.error('Erro ao buscar perícias:', err);
        setError(err.message);
        setLoading(false);
        return;
      }

      if (data) {
        const objetoPericias: PericiasMap = {};
        const mapaNomes: Record<number, string> = {};

        data.forEach((p: { Codigo_Pericia: number; Nome_Pericia: string; Atributo_Pericia: string; Kit: boolean | string; Desc_Pericia: string }) => {
          objetoPericias[p.Nome_Pericia] = {
            id: p.Codigo_Pericia,
            atributo: (p.Atributo_Pericia as AtributoKey) || 'FOR',
            treino: 0,
            outros: 0,
            kit: p.Kit === true || p.Kit === 'TRUE' || p.Kit === 'true' || p.Kit === '1',
            descricao: p.Desc_Pericia
          };
          mapaNomes[p.Codigo_Pericia] = p.Nome_Pericia;
        });

        setPericias(objetoPericias);
        setNomesPericias(mapaNomes);
      }

      setLoading(false);
    }

    carregar();
    return () => { cancelled = true; };
  }, []);

  const gratisRef = useRef<string[]>([]);
  const veteranasRef = useRef<string[]>([]);

  useEffect(() => {
    if (Object.keys(pericias).length === 0) return; // Aguarda carregar

    const velhasGratis = gratisRef.current;
    const velhasVeteranas = veteranasRef.current;

    // Checa se houve mudança real nas listas (comparação de conteúdo)
    const mudouGratis = velhasGratis.length !== periciasGratis.length || !velhasGratis.every((v, i) => v === periciasGratis[i]);
    const mudouVeteranas = velhasVeteranas.length !== veteranasGratis.length || !velhasVeteranas.every((v, i) => v === veteranasGratis[i]);

    if (!mudouGratis && !mudouVeteranas) return;

    gratisRef.current = periciasGratis;
    veteranasRef.current = veteranasGratis;

    setPericias(prev => {
      let mudou = false;
      const novo = { ...prev };
      
      // Destreina as que saíram da lista de grátis
      velhasGratis.forEach(nome => {
        if (!periciasGratis.includes(nome) && novo[nome] && novo[nome].treino > 0) {
          novo[nome] = { ...novo[nome], treino: 0 };
          mudou = true;
        }
      });

      // Destreina as veteranas que saíram da lista
      velhasVeteranas.forEach(nome => {
        if (!veteranasGratis.includes(nome) && novo[nome] && novo[nome].treino > 0) {
          novo[nome] = { ...novo[nome], treino: 0 };
          mudou = true;
        }
      });

      periciasGratis.forEach(nome => {
        if (novo[nome] && novo[nome].treino < 5) {
          novo[nome] = { ...novo[nome], treino: 5 };
          mudou = true;
        }
      });

      veteranasGratis.forEach(nome => {
        if (novo[nome] && novo[nome].treino < 10) {
          novo[nome] = { ...novo[nome], treino: 10 };
          mudou = true;
        }
      });

      return mudou ? novo : prev;
    });
  }, [periciasGratis, veteranasGratis, pericias]);

  const limites = useMemo(() => {
    const lim = calcularLimitesPericias(classe, nivel, atributos);
    let extra = 0;
    if (codigoPerRegra === 1 || codigoPerRegra === 3) extra = 1;
    if (codigoPerRegra === 2) extra = 2;
    if (codigoPerRegra === 4) extra = 5;
    if (codigoPerRegra === 5) extra = 3;
    
    return {
    bonusVestimentas: bonusVestimentas || {},
      ...lim,
      maxTreinadas: lim.maxTreinadas + extra
    };
  }, [classe, nivel, atributos, codigoPerRegra]);

  const totais = useMemo(() => {
    let totalTreinadasUsadas = 0;
    let totalUpgradesGastos = 0;

    Object.entries(pericias).forEach(([nome, dados]) => {
      if (dados.treino >= 5 && !periciasGratis.includes(nome)) {
        totalTreinadasUsadas += 1;
      }
      if (dados.treino === 10) totalUpgradesGastos += 1;
      else if (dados.treino === 15) totalUpgradesGastos += 2;
    });

    return { totalTreinadasUsadas, totalUpgradesGastos };
  }, [pericias, periciasGratis]);

  const handleMudarPericia = useCallback(
    (nome: string, campo: 'treino' | 'outros' | 'atributo', valor: number | AtributoKey) => {
      setPericias(prev => {
        const periciaAtual = prev[nome];
        if (!periciaAtual) return prev;

        // Se for treino e as regras estiverem ativas, aplica validações
        if (campo === 'treino' && regrasAtivas) {
          const novoValor = Number(valor);

          // Não deixa destreinar perícias grátis
          if (novoValor < 5 && periciasGratis.includes(nome)) {
            return prev;
          }

          // Nível mínimo para aumentar grau
          if (novoValor === 10 && nivel < 7) return prev;
          if (novoValor === 15 && nivel < 14) return prev;

          // Simula para verificar limites
          const simuladas = {
            ...prev,
            [nome]: { ...periciaAtual, treino: novoValor },
          };

          let simTreinadas = 0;
          let simUpgrades = 0;

          Object.entries(simuladas).forEach(([n, d]) => {
            if (d.treino >= 5 && !periciasGratis.includes(n)) simTreinadas += 1;
            if (d.treino === 10) simUpgrades += 1;
            else if (d.treino === 15) simUpgrades += 2;
          });

          if (simTreinadas > limites.maxTreinadas) return prev;
          if (simUpgrades > limites.maxUpgrades) return prev;
        }

        // Aplica a mudança
        if (campo === 'atributo') {
          return {
            ...prev,
            [nome]: { ...periciaAtual, atributo: valor as AtributoKey },
          };
        }

        return {
          ...prev,
          [nome]: { ...periciaAtual, [campo]: Number(valor) },
        };
      });
    },
    [regrasAtivas, periciasGratis, nivel, limites]
  );

  const periciasComBonus = useMemo(() => {
    let novas = { ...pericias };
    
    // Regra 40
    if (Object.keys(bonusRegra40).length > 0) {
      Object.entries(bonusRegra40).forEach(([nome, bonus]) => {
        if (novas[nome]) {
          novas[nome] = {
            ...novas[nome],
            outros: (novas[nome].outros || 0) + bonus
          };
        }
      });
    }

    // Vestimentas
    if (bonusVestimentas && Object.keys(bonusVestimentas).length > 0) {
      Object.entries(bonusVestimentas).forEach(([nome, bonus]) => {
        if (novas[nome]) {
          novas[nome] = {
            ...novas[nome],
            outros: (novas[nome].outros || 0) + bonus
          };
        }
      });
    }

    return novas;
  }, [pericias, bonusRegra40, bonusVestimentas]);

  return { 
    pericias: periciasComBonus, 
    nomesPericias, 
    loading, 
    error, 
    handleMudarPericia, 
    limites, 
    totais,
    periciasGratis,
    regrasAtivas,
    jaTinhaProfissao33,
    debugRegra33: { avaliou: avaliouRegra33, evalJaTinha: jaTinhaProfissao33 },
    bonusRegra40
  };
}