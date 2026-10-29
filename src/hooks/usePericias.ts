import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../services/supabase';
import type { PericiasMap, AtributoKey, ClasseRPG, Atributos, PoderesEscolhidos, Origem } from '../types';
import { calcularLimitesPericias } from '../utils/rpgRules';

interface UsePericiasReturn {
  pericias: PericiasMap;
  periciasStatus: PericiasMap;
  setPericiasStatus: React.Dispatch<React.SetStateAction<PericiasMap>>;
  nomesPericias: Record<number, string>;
  loading: boolean;
  error: string | null;
  handleMudarPericia: (nome: string, campo: 'treino' | 'outros' | 'atributo', valor: number | AtributoKey) => void;
  limites: { maxTreinadas: number; maxUpgrades: number };
  totais: { totalTreinadasUsadas: number; totalUpgradesGastos: number };
  periciasGratis: string[];
  regrasAtivas: boolean;
  jaTinhaProfissao33: boolean;
  setJaTinhaProfissao33: React.Dispatch<React.SetStateAction<boolean>>;
  avaliouRegra33: boolean;
  setAvaliouRegra33: React.Dispatch<React.SetStateAction<boolean>>;
  jaTinhaPericiaPoder: Record<string, boolean>;
  setJaTinhaPericiaPoder: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  avaliouPericiaPoder: Record<string, boolean>;
  setAvaliouPericiaPoder: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  debugRegra33: { avaliou: boolean, evalJaTinha: boolean };
  bonusRegra40: Record<string, number>;
  bonusVestimentas: Record<string, number>;
  bonusAtributoDinamico: Record<string, number>;
  profissoes: { nome: string; treino: number; outros: number }[];
  setProfissoes: React.Dispatch<React.SetStateAction<{ nome: string; treino: number; outros: number }[]>>;
  resetarPericias: () => void;
  marcarPericiasCarregadas: () => void;
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
  bonusVestimentas?: Record<string, number>,
  expertsGratis: string[] = [],
  atributosFinais?: Atributos,
  inexistirAgiCount: number = 0
): UsePericiasReturn {
  const [pericias, setPericias] = useState<PericiasMap>({});
  const [nomesPericias, setNomesPericias] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jaTinhaProfissao33, setJaTinhaProfissao33] = useState<boolean>(false);
  const [avaliouRegra33, setAvaliouRegra33] = useState<boolean>(false);
  const [profissoes, setProfissoes] = useState<{ nome: string; treino: number; outros: number }[]>([]);

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
  const expertsRef = useRef<string[]>([]);
  const justLoadedPericiasRef = useRef(false);

  const resetarPericias = useCallback(() => {
    gratisRef.current = [];
    veteranasRef.current = [];
    expertsRef.current = [];
    justLoadedPericiasRef.current = false;
    setJaTinhaProfissao33(false);
    setAvaliouRegra33(false);
    setJaTinhaPericiaPoder({});
    setAvaliouPericiaPoder({});
    setProfissoes([]);
    setPericias(prev => {
      const limpo: PericiasMap = {};
      Object.entries(prev).forEach(([nome, p]) => {
        limpo[nome] = { ...p, treino: 0, outros: 0 };
      });
      return limpo;
    });
  }, []);

  const marcarPericiasCarregadas = useCallback(() => {
    justLoadedPericiasRef.current = true;
  }, []);

  useEffect(() => {
    if (Object.keys(pericias).length === 0) return; // Aguarda carregar

    if (justLoadedPericiasRef.current) {
      justLoadedPericiasRef.current = false;
      gratisRef.current = periciasGratis;
      veteranasRef.current = veteranasGratis;
      expertsRef.current = expertsGratis;
      return;
    }

    const velhasGratis = gratisRef.current;
    const velhasVeteranas = veteranasRef.current;
    const velhasExperts = expertsRef.current;

    // Checa se houve mudança real nas listas (comparação de conteúdo)
    const mudouGratis = velhasGratis.length !== periciasGratis.length || !velhasGratis.every((v, i) => v === periciasGratis[i]);
    const mudouVeteranas = velhasVeteranas.length !== veteranasGratis.length || !velhasVeteranas.every((v, i) => v === veteranasGratis[i]);
    const mudouExperts = velhasExperts.length !== expertsGratis.length || !velhasExperts.every((v, i) => v === expertsGratis[i]);

    if (!mudouGratis && !mudouVeteranas && !mudouExperts) return;

    gratisRef.current = periciasGratis;
    veteranasRef.current = veteranasGratis;
    expertsRef.current = expertsGratis;

    setPericias(prev => {
      let mudou = false;
      const novo = { ...prev };
      
      // Destreina as que saíram da lista de grátis
      velhasGratis.forEach(nome => {
        if (!periciasGratis.includes(nome) && !veteranasGratis.includes(nome) && !expertsGratis.includes(nome) && novo[nome] && novo[nome].treino > 0) {
          novo[nome] = { ...novo[nome], treino: 0 };
          mudou = true;
        }
      });

      // Destreina as veteranas que saíram da lista
      velhasVeteranas.forEach(nome => {
        if (!veteranasGratis.includes(nome) && !expertsGratis.includes(nome) && novo[nome] && novo[nome].treino > 0) {
          if (nome === 'Religião') {
             // Preserva o valor de Religião (não cai para zero). Se saiu de veteranasGratis, passará a custar 1 ponto de upgrade.
             // Isso conserta o bug do Exorcista 40% (Já era Veterano) deletando o treino do jogador.
          } else {
             novo[nome] = { ...novo[nome], treino: periciasGratis.includes(nome) ? 5 : 0 };
             mudou = true;
          }
        }
      });

      // Destreina as experts que saíram da lista
      velhasExperts.forEach(nome => {
        if (!expertsGratis.includes(nome) && novo[nome] && novo[nome].treino > 0) {
          const fallback = veteranasGratis.includes(nome) ? 10 : (periciasGratis.includes(nome) ? 5 : 0);
          novo[nome] = { ...novo[nome], treino: fallback };
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

      expertsGratis.forEach(nome => {
        if (novo[nome] && novo[nome].treino < 15) {
          novo[nome] = { ...novo[nome], treino: 15 };
          mudou = true;
        }
      });

      return mudou ? novo : prev;
    });
  }, [periciasGratis, veteranasGratis, expertsGratis, pericias]);

  const limites = useMemo(() => {
    const lim = calcularLimitesPericias(classe, nivel, atributos);
    let extra = 0;
    if (codigoPerRegra === 1 || codigoPerRegra === 3) extra = 1;
    if (codigoPerRegra === 2) extra = 2;
    if (codigoPerRegra === 4) extra = 5;
    if (codigoPerRegra === 5) extra = 3;
    if (regrasAutomaticasAtivas?.has(9)) extra += 1;
    
    return {
      ...lim,
      maxTreinadas: lim.maxTreinadas + extra
    };
  }, [classe, nivel, atributos, codigoPerRegra]);

  const totais = useMemo(() => {
    let totalTreinadasUsadas = 0;
    let totalUpgradesGastos = 0;

    Object.entries(pericias).forEach(([nome, dados]) => {
      // Ignora per�cias marcadas como 'isLivre' (Modo Livre)
      if (dados.isLivre) return;

      if (nome === 'Profissão' && profissoes.length > 0) return;

      if (dados.treino >= 5 && !periciasGratis.includes(nome) && !veteranasGratis.includes(nome) && !expertsGratis.includes(nome)) {
        totalTreinadasUsadas += 1;
      }
      if (dados.treino === 10) {
        if (!veteranasGratis.includes(nome) && !expertsGratis.includes(nome)) totalUpgradesGastos += 1;
      } else if (dados.treino === 15) {
        if (!expertsGratis.includes(nome)) {
          totalUpgradesGastos += veteranasGratis.includes(nome) ? 1 : 2;
        }
      }
    });

    profissoes.forEach(prof => {
      const isTrilhaProf = (prof as any).origem === 'trilha' || (prof as any).origem === 'trilha65';
      if (prof.treino >= 5 && !isTrilhaProf) totalTreinadasUsadas += 1;
      if (prof.treino === 10) totalUpgradesGastos += 1;
      else if (prof.treino === 15) totalUpgradesGastos += 2;
    });

    return { totalTreinadasUsadas, totalUpgradesGastos };
  }, [pericias, periciasGratis, profissoes, veteranasGratis, expertsGratis]);

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

          // Não deixa diminuir grau de perícias veteranas grátis
          if (novoValor < 10 && veteranasGratis.includes(nome)) {
            return prev;
          }

          // Não deixa diminuir grau de perícias experts grátis
          if (novoValor < 15 && expertsGratis.includes(nome)) {
            return prev;
          }

          // Nível mínimo para aumentar grau
          if (novoValor === 10 && nivel < 7) return prev;
          if (novoValor === 15 && nivel < 14 && !expertsGratis.includes(nome)) return prev;

          // Simula para verificar limites
          const simuladas = {
            ...prev,
            [nome]: { ...periciaAtual, treino: novoValor, isLivre: false },
          };

          let simTreinadas = 0;
          let simUpgrades = 0;

          Object.entries(simuladas).forEach(([n, d]) => {
            if (d.isLivre) return;
            if (n === 'Profissão' && profissoes.length > 0) return;
            if (d.treino >= 5 && !periciasGratis.includes(n) && !veteranasGratis.includes(n) && !expertsGratis.includes(n)) simTreinadas += 1;
            if (d.treino === 10) {
              if (!veteranasGratis.includes(n) && !expertsGratis.includes(n)) simUpgrades += 1;
            } else if (d.treino === 15) {
              if (!expertsGratis.includes(n)) {
                simUpgrades += veteranasGratis.includes(n) ? 1 : 2;
              }
            }
          });

          profissoes.forEach(prof => {
            const isTrilhaProf = (prof as any).origem === 'trilha' || (prof as any).origem === 'trilha65';
            if (prof.treino >= 5 && !isTrilhaProf) simTreinadas += 1;
            if (prof.treino === 10) simUpgrades += 1;
            else if (prof.treino === 15) simUpgrades += 2;
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
          [nome]: { 
             ...periciaAtual, 
             [campo]: Number(valor),
             isLivre: !regrasAtivas // Marca como livre se as regras estiverem desativadas!
          },
        };
      });
    },
    [regrasAtivas, periciasGratis, veteranasGratis, expertsGratis, nivel, limites, profissoes]
  );

  // Bônus dinâmico por atributo da perícia (Regras 100, 106, 112, 113, 114, 115)
  const bonusAtributoDinamico = useMemo(() => {
    const mapa: Record<string, number> = {};
    if (!regrasAutomaticasAtivas) return mapa;
    const tem100 = regrasAutomaticasAtivas.has(100);
    const tem106 = regrasAutomaticasAtivas.has(106);
    const tem112 = regrasAutomaticasAtivas.has(112);
    const tem113 = regrasAutomaticasAtivas.has(113);
    const tem114 = regrasAutomaticasAtivas.has(114);
    const tem115 = regrasAutomaticasAtivas.has(115);

    if (!tem100 && !tem106 && !tem112 && !tem113 && !tem114 && !tem115) return mapa;

    const atrRef = atributosFinais || atributos;

    Object.entries(pericias).forEach(([nome, dados]) => {
      let b = 0;
      if (tem106 && dados.atributo === 'INT' && inexistirAgiCount > 0) {
        b += inexistirAgiCount * 2;
      }
      // Regra 100 (Sangue 10%) e 112 (Sangue 99%, substitui a 100): soma FOR nas perícias que usam FOR (inclusive se o atributo foi trocado)
      if ((tem100 || tem112) && dados.atributo === 'FOR') {
        b += atrRef.FOR;
      }
      if (tem113 && dados.atributo === 'VIG') {
        b += atrRef.VIG;
      }
      if (tem114 && dados.atributo === 'INT') {
        b += atrRef.INT;
      }
      if (tem115 && dados.atributo === 'AGI') {
        b += atrRef.AGI;
      }
      if (b !== 0) {
        mapa[nome] = b;
      }
    });

    return mapa;
  }, [pericias, regrasAutomaticasAtivas, atributosFinais, atributos, inexistirAgiCount]);

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

    // Bônus dinâmico por atributo (Regras 106, 112, 113, 114, 115)
    if (Object.keys(bonusAtributoDinamico).length > 0) {
      Object.entries(bonusAtributoDinamico).forEach(([nome, bonus]) => {
        if (novas[nome]) {
          novas[nome] = {
            ...novas[nome],
            outros: (novas[nome].outros || 0) + bonus
          };
        }
      });
    }

    return novas;
  }, [pericias, bonusRegra40, bonusVestimentas, bonusAtributoDinamico]);

  return useMemo(() => ({ 
    pericias: periciasComBonus, 
    periciasStatus: pericias,
    setPericiasStatus: setPericias,
    nomesPericias, 
    loading, 
    error, 
    handleMudarPericia, 
    limites, 
    totais,
    periciasGratis,
    regrasAtivas,
    jaTinhaProfissao33,
    setJaTinhaProfissao33,
    avaliouRegra33,
    setAvaliouRegra33,
    jaTinhaPericiaPoder,
    setJaTinhaPericiaPoder,
    avaliouPericiaPoder,
    setAvaliouPericiaPoder,
    debugRegra33: { avaliou: avaliouRegra33, evalJaTinha: jaTinhaProfissao33 },
    bonusRegra40,
    bonusVestimentas: bonusVestimentas || {},
    bonusAtributoDinamico,
    profissoes,
    setProfissoes,
    resetarPericias,
    marcarPericiasCarregadas
  }), [
    periciasComBonus,
    pericias,
    nomesPericias,
    loading,
    error,
    handleMudarPericia,
    limites,
    totais,
    periciasGratis,
    regrasAtivas,
    jaTinhaProfissao33,
    avaliouRegra33,
    jaTinhaPericiaPoder,
    avaliouPericiaPoder,
    bonusRegra40,
    bonusVestimentas,
    bonusAtributoDinamico,
    profissoes,
    resetarPericias,
    marcarPericiasCarregadas
  ]);
}