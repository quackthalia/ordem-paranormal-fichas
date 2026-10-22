import React, { useRef, useEffect } from 'react';
import { useRPG } from '../../context/RPGContext';
import { CustomSelect } from '../../components/CustomSelect';
import { Collapse } from '../../components/Collapse';
import { NEX_OPTIONS, capMaximoAtributo } from '../../utils/rpgRules';
import { StatusPanel } from './StatusPanel';
import { PericiasTable } from './PericiasTable';
import { AbasPanel } from './AbasPanel';
import { ModalPoderes } from '../../components/ModalPoderes';
import { obterCorBadge } from '../../utils/rpgRules';
import { CharacterHeader } from './CharacterHeader';
import { BonusCondicionaisPanel } from './BonusCondicionaisPanel';
import { MatrixBackground } from './MatrixBackground';

export const FichaScreen: React.FC = () => {
  const {
    trilhasHook, bonusTrilhasAtributos,
    rituaisHook,
    nex,
    nivel,
    regras,
    classe,
    setBonusAtributos,
    setTelaAtual,
    status,
    setSkillCombatente1,
    setSkillCombatente2,
    nexModalAberto,
    nexPoderEditando,
    afinidadeAtiva,
    afinidadeEscolhida,
    itensHook,
    poderesExtras,
    setPoderesExtras,
    temMonstruoso99,
    monstruosoElemento,
    regrasAutomaticasAtivas
  } = useRPG();

    const effectiveNex = regras["nex_experiencia"] ? nivel * 5 : nex;

  useEffect(() => {
    const temConduite99 = (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 11 && (regras['nex_experiencia'] ? nivel >= 20 : effectiveNex >= 99)) || (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 11 && (regras['nex_experiencia'] ? nivel >= 10 : effectiveNex >= 50));
    const jaTemCanalizarMedo = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'trilha_conduite' || r.codigo_ritual === 10);

    if (temConduite99 && !jaTemCanalizarMedo) {
      const baseRitual = (rituaisHook.rituais || []).find(r => r.Codigo_Ritual === 10);
      if (baseRitual) {
        rituaisHook.aprenderRitual({
          codigo_ritual: 10,
          nome: `${baseRitual.Nome_Ritual} (Conduíte)`,
          origem: 'trilha_conduite',
          circulo: baseRitual.Circulo_Ritual,
          elemento: baseRitual.Elemento_Ritual
        });
      }
    } else if (!temConduite99 && (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'trilha_conduite')) {
      rituaisHook.esquecerRitual('trilha_conduite');
    }

    const temFlagelador99 = (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 12 && (regras['nex_experiencia'] ? nivel >= 20 : effectiveNex >= 99)) || (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 12 && (regras['nex_experiencia'] ? nivel >= 10 : effectiveNex >= 50));
    const jaTemMedoTangivel = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'trilha_flagelador' || r.codigo_ritual === 53);

    if (temFlagelador99 && !jaTemMedoTangivel) {
      const baseRitual = (rituaisHook.rituais || []).find(r => r.Codigo_Ritual === 53);
      if (baseRitual) {
        rituaisHook.aprenderRitual({
          codigo_ritual: 53,
          nome: `${baseRitual.Nome_Ritual} (Flagelador)`,
          origem: 'trilha_flagelador',
          circulo: baseRitual.Circulo_Ritual,
          elemento: baseRitual.Elemento_Ritual
        });
      }
    } else if (!temFlagelador99 && (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'trilha_flagelador')) {
      rituaisHook.esquecerRitual('trilha_flagelador');
    }

    // TRILHA 13: GRADUADO
    const temGraduado99 = (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 13 && (regras['nex_experiencia'] ? nivel >= 20 : effectiveNex >= 99)) || (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 13 && (regras['nex_experiencia'] ? nivel >= 10 : effectiveNex >= 50));
    const jaTemConhecendoMedo = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'trilha_graduado' || r.codigo_ritual === 17);

    if (temGraduado99 && !jaTemConhecendoMedo) {
      const baseRitual = (rituaisHook.rituais || []).find(r => r.Codigo_Ritual === 17);
      if (baseRitual) {
        rituaisHook.aprenderRitual({
          codigo_ritual: 17,
          nome: `${baseRitual.Nome_Ritual} (Graduado)`,
          origem: 'trilha_graduado',
          circulo: baseRitual.Circulo_Ritual,
          elemento: baseRitual.Elemento_Ritual
        });
      }
    } else if (!temGraduado99 && (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'trilha_graduado')) {
      rituaisHook.esquecerRitual('trilha_graduado');
    }

    const temGraduado40 = (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 13 && (regras['nex_experiencia'] ? nivel >= 8 : effectiveNex >= 40));

    // TRILHA 14: INTUITIVO
    const temIntuitivo99 = (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 14 && (regras['nex_experiencia'] ? nivel >= 20 : effectiveNex >= 99)) || (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 14 && (regras['nex_experiencia'] ? nivel >= 10 : effectiveNex >= 50));
    const jaTemPresencaMedo = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'trilha_intuitivo' || r.codigo_ritual === 64);

    if (temIntuitivo99 && !jaTemPresencaMedo) {
      const baseRitual = (rituaisHook.rituais || []).find(r => r.Codigo_Ritual === 64);
      if (baseRitual) {
        rituaisHook.aprenderRitual({
          codigo_ritual: 64,
          nome: `${baseRitual.Nome_Ritual} (Intuitivo)`,
          origem: 'trilha_intuitivo',
          circulo: baseRitual.Circulo_Ritual,
          elemento: baseRitual.Elemento_Ritual
        });
      }
    } else if (!temIntuitivo99 && (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'trilha_intuitivo')) {
      rituaisHook.esquecerRitual('trilha_intuitivo');
    }

    // TRILHA 15: LÂMINA PARANORMAL
    const temLamina10 = (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 15 && (regras['nex_experiencia'] ? nivel >= 2 : effectiveNex >= 10)) || (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 15 && (regras['nex_experiencia'] ? nivel >= 10 : effectiveNex >= 50));
    const jaTemAmaldicoarArmaTrilha = (rituaisHook.rituaisAprendidos || []).find((r: any) => Number(r.codigo_ritual) === 3 && r.origem === 'trilha_lamina_paranormal');
    const jaTemAmaldicoarArmaNormal = (rituaisHook.rituaisAprendidos || []).find((r: any) => Number(r.codigo_ritual) === 3 && r.origem !== 'trilha_lamina_paranormal');

    if (temLamina10 && !jaTemAmaldicoarArmaTrilha && !jaTemAmaldicoarArmaNormal) {
      const baseRitual = (rituaisHook.rituais || []).find(r => Number(r.Codigo_Ritual) === 3);
      if (baseRitual) {
        rituaisHook.aprenderRitual({
          codigo_ritual: 3,
          nome: `${baseRitual.Nome_Ritual} (Lâmina Paranormal)`,
          origem: 'trilha_lamina_paranormal',
          circulo: baseRitual.Circulo_Ritual,
          elemento: baseRitual.Elemento_Ritual,
          elemento_escolhido: poderesExtras.lamina_elemento || 'Sangue'
        });
      }
    } else if (temLamina10 && jaTemAmaldicoarArmaNormal) {
       // Já tem o ritual por outra fonte: a cópia da trilha some e o ritual existente vira Movimento (+1 PE)
       if (jaTemAmaldicoarArmaTrilha) {
         rituaisHook.esquecerRitual('trilha_lamina_paranormal');
       }
       if (jaTemAmaldicoarArmaNormal.elemento_escolhido && poderesExtras.lamina_elemento !== jaTemAmaldicoarArmaNormal.elemento_escolhido) {
         setPoderesExtras(prev => ({ ...prev, lamina_elemento: jaTemAmaldicoarArmaNormal.elemento_escolhido }));
       }
       if (!jaTemAmaldicoarArmaNormal.customProps?.normal?.Execucao_Ritual?.includes('Movimento')) {
         const existingProps = jaTemAmaldicoarArmaNormal.customProps || {};
         rituaisHook.editarRitual(jaTemAmaldicoarArmaNormal.origem, jaTemAmaldicoarArmaNormal.customNome, jaTemAmaldicoarArmaNormal.customDesc, {
             ...existingProps,
             normal: { ...(existingProps.normal || {}), Execucao_Ritual: 'Movimento (+1 PE)' },
             discente: { ...(existingProps.discente || {}), Execucao_Ritual: 'Movimento (+1 PE)' },
             verdadeiro: { ...(existingProps.verdadeiro || {}), Execucao_Ritual: 'Movimento (+1 PE)' }
         });
       }
    } else if (!temLamina10) {
      if (jaTemAmaldicoarArmaTrilha) {
        rituaisHook.esquecerRitual('trilha_lamina_paranormal');
      }
      if (jaTemAmaldicoarArmaNormal && jaTemAmaldicoarArmaNormal.customProps?.normal?.Execucao_Ritual?.includes('Movimento')) {
        const existingProps = jaTemAmaldicoarArmaNormal.customProps || {};
        const { Execucao_Ritual: _e1, ...normalRest } = existingProps.normal || {};
        const { Execucao_Ritual: _e2, ...discenteRest } = existingProps.discente || {};
        const { Execucao_Ritual: _e3, ...verdadeiroRest } = existingProps.verdadeiro || {};
        rituaisHook.editarRitual(jaTemAmaldicoarArmaNormal.origem, jaTemAmaldicoarArmaNormal.customNome, jaTemAmaldicoarArmaNormal.customDesc, {
          ...existingProps,
          normal: normalRest,
          discente: discenteRest,
          verdadeiro: verdadeiroRest
        });
      }
    }

    const temLamina99 = (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 15 && (regras['nex_experiencia'] ? nivel >= 20 : effectiveNex >= 99)) || (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 15 && (regras['nex_experiencia'] ? nivel >= 10 : effectiveNex >= 50));
    const jaTemLaminaMedo = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'trilha_lamina_paranormal_99' || r.codigo_ritual === 49);

    if (temLamina99 && !jaTemLaminaMedo) {
      const baseRitual = (rituaisHook.rituais || []).find(r => r.Codigo_Ritual === 49);
      if (baseRitual) {
        rituaisHook.aprenderRitual({
          codigo_ritual: 49,
          nome: `${baseRitual.Nome_Ritual} (Lâmina Paranormal)`,
          origem: 'trilha_lamina_paranormal_99',
          circulo: baseRitual.Circulo_Ritual,
          elemento: baseRitual.Elemento_Ritual
        });
      }
    } else if (!temLamina99 && (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'trilha_lamina_paranormal_99')) {
      rituaisHook.esquecerRitual('trilha_lamina_paranormal_99');
    }

    // TRILHA 29: ILUSIONISTA
    const temIlusionista10 = (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 29 && (regras['nex_experiencia'] ? nivel >= 2 : effectiveNex >= 10)) || (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 29 && (regras['nex_experiencia'] ? nivel >= 10 : effectiveNex >= 50));
    const jaTemTecerIlusaoTrilha = (rituaisHook.rituaisAprendidos || []).find((r: any) => Number(r.codigo_ritual) === 70 && r.origem === 'trilha_ilusionista');
    const jaTemTecerIlusaoNormal = (rituaisHook.rituaisAprendidos || []).find((r: any) => Number(r.codigo_ritual) === 70 && r.origem !== 'trilha_ilusionista');

    if (temIlusionista10 && !jaTemTecerIlusaoTrilha && !jaTemTecerIlusaoNormal) {
      const baseRitual = (rituaisHook.rituais || []).find(r => Number(r.Codigo_Ritual) === 70);
      if (baseRitual) {
        rituaisHook.aprenderRitual({
          codigo_ritual: 70,
          nome: `${baseRitual.Nome_Ritual} (Ilusionista)`,
          origem: 'trilha_ilusionista',
          circulo: baseRitual.Circulo_Ritual,
          elemento: baseRitual.Elemento_Ritual
        });
      }
    } else if (temIlusionista10 && jaTemTecerIlusaoNormal) {
       if (jaTemTecerIlusaoTrilha) {
         rituaisHook.esquecerRitual('trilha_ilusionista');
       }
       const baseRitual = (rituaisHook.rituais || []).find(r => Number(r.Codigo_Ritual) === 70);
       const nomeBase = baseRitual ? baseRitual.Nome_Ritual : 'Tecer Ilusão';
       const nomeComIlusionista = `${nomeBase} (Ilusionista)`;
       const nomeAtual = jaTemTecerIlusaoNormal.customNome || jaTemTecerIlusaoNormal.nome || '';
       const precisaAjustarNome = !nomeAtual.includes('(Ilusionista)');
       if (!jaTemTecerIlusaoNormal.customProps?.normal?.Execucao_Ritual?.includes('Movimento') || precisaAjustarNome) {
         const existingProps = jaTemTecerIlusaoNormal.customProps || {};
         rituaisHook.editarRitual(jaTemTecerIlusaoNormal.origem, nomeComIlusionista, jaTemTecerIlusaoNormal.customDesc, {
             ...existingProps,
             normal: { ...(existingProps.normal || {}), Execucao_Ritual: 'Movimento (+1 PE)' },
             discente: { ...(existingProps.discente || {}), Execucao_Ritual: 'Movimento (+1 PE)' },
             verdadeiro: { ...(existingProps.verdadeiro || {}), Execucao_Ritual: 'Movimento (+1 PE)' }
         });
       }
    } else if (!temIlusionista10) {
      if (jaTemTecerIlusaoTrilha) {
        rituaisHook.esquecerRitual('trilha_ilusionista');
      }
      if (jaTemTecerIlusaoNormal) {
        const existingProps = jaTemTecerIlusaoNormal.customProps || {};
        const { Execucao_Ritual: _e1, ...normalRest } = existingProps.normal || {};
        const { Execucao_Ritual: _e2, ...discenteRest } = existingProps.discente || {};
        const { Execucao_Ritual: _e3, ...verdadeiroRest } = existingProps.verdadeiro || {};
        const nomeAtual = jaTemTecerIlusaoNormal.customNome || jaTemTecerIlusaoNormal.nome || '';
        const precisaRemoverIlusionista = nomeAtual.includes('(Ilusionista)');
        const nomeLimpo = precisaRemoverIlusionista ? nomeAtual.replace(/\s*\(Ilusionista\)/gi, '').trim() : jaTemTecerIlusaoNormal.customNome;
        if (existingProps.normal?.Execucao_Ritual?.includes('Movimento') || precisaRemoverIlusionista) {
          rituaisHook.editarRitual(jaTemTecerIlusaoNormal.origem, nomeLimpo, jaTemTecerIlusaoNormal.customDesc, {
            ...existingProps,
            normal: normalRest,
            discente: discenteRest,
            verdadeiro: verdadeiroRest
          });
        }
      }
    }

    // TRILHA 44: VIAJANTE DAS SOMBRAS
    const temViajanteDasSombras99 = (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 44 && (regras['nex_experiencia'] ? nivel >= 20 : effectiveNex >= 99));
    const jaTemControlarSombras = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'trilha_viajante_das_sombras' || r.codigo_ritual === 116);

    if (temViajanteDasSombras99 && !jaTemControlarSombras) {
      const baseRitual = (rituaisHook.rituais || []).find(r => r.Codigo_Ritual === 116);
      if (baseRitual) {
        rituaisHook.aprenderRitual({
          codigo_ritual: 116,
          nome: `${baseRitual.Nome_Ritual} (Viajante das Sombras)`,
          origem: 'trilha_viajante_das_sombras',
          circulo: baseRitual.Circulo_Ritual,
          elemento: baseRitual.Elemento_Ritual
        });
      }
    } else if (!temViajanteDasSombras99 && (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'trilha_viajante_das_sombras')) {
      rituaisHook.esquecerRitual('trilha_viajante_das_sombras');
    }

    // TRILHA 18: MONSTRUOSO (99%)
    const isSangue99 = temMonstruoso99 && monstruosoElemento === 'Sangue';
    const jaTemFormaMonstruosa = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'trilha_monstruoso_99_sangue' || r.codigo_ritual === 44);
    if (isSangue99 && !jaTemFormaMonstruosa) {
      const baseRitual = (rituaisHook.rituais || []).find(r => r.Codigo_Ritual === 44);
      if (baseRitual) {
        rituaisHook.aprenderRitual({
          codigo_ritual: 44,
          nome: `${baseRitual.Nome_Ritual} (Monstruoso)`,
          origem: 'trilha_monstruoso_99_sangue',
          circulo: baseRitual.Circulo_Ritual,
          elemento: baseRitual.Elemento_Ritual
        });
      }
    } else if (!isSangue99 && (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'trilha_monstruoso_99_sangue')) {
      rituaisHook.esquecerRitual('trilha_monstruoso_99_sangue');
    }

    const isMorte99 = temMonstruoso99 && monstruosoElemento === 'Morte';
    const jaTemFimInevitavel = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'trilha_monstruoso_99_morte' || r.codigo_ritual === 42);
    if (isMorte99 && !jaTemFimInevitavel) {
      const baseRitual = (rituaisHook.rituais || []).find(r => r.Codigo_Ritual === 42);
      if (baseRitual) {
        rituaisHook.aprenderRitual({
          codigo_ritual: 42,
          nome: `${baseRitual.Nome_Ritual} (Monstruoso)`,
          origem: 'trilha_monstruoso_99_morte',
          circulo: baseRitual.Circulo_Ritual,
          elemento: baseRitual.Elemento_Ritual
        });
      }
    } else if (!isMorte99 && (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'trilha_monstruoso_99_morte')) {
      rituaisHook.esquecerRitual('trilha_monstruoso_99_morte');
    }

    const isEnergia99 = temMonstruoso99 && monstruosoElemento === 'Energia';
    const jaTemDeflagracao = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'trilha_monstruoso_99_energia' || r.codigo_ritual === 27);
    if (isEnergia99 && !jaTemDeflagracao) {
      const baseRitual = (rituaisHook.rituais || []).find(r => r.Codigo_Ritual === 27);
      if (baseRitual) {
        rituaisHook.aprenderRitual({
          codigo_ritual: 27,
          nome: `${baseRitual.Nome_Ritual} (Monstruoso)`,
          origem: 'trilha_monstruoso_99_energia',
          circulo: baseRitual.Circulo_Ritual,
          elemento: baseRitual.Elemento_Ritual
        });
      }
    } else if (!isEnergia99 && (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'trilha_monstruoso_99_energia')) {
      rituaisHook.esquecerRitual('trilha_monstruoso_99_energia');
    }

    const isConhecimento99 = temMonstruoso99 && monstruosoElemento === 'Conhecimento';
    if (!isConhecimento99 && (rituaisHook.rituaisAprendidos || []).some(r => r.origem === 'monstruoso_99_conhecimento')) {
      rituaisHook.esquecerRitual('monstruoso_99_conhecimento');
    }

    // REGRAS 112, 113, 114, 115: Rituais automáticos dos poderes de 99% (Monstruoso Especialista)
    const rituaisRegras112_115 = [
      { regra: 112, codigo: 80, origem: 'regra_112_vinculo_sangue' },
      { regra: 113, codigo: 33, origem: 'regra_113_distorcao_temporal' },
      { regra: 114, codigo: 21, origem: 'regra_114_controle_mental' },
      { regra: 115, codigo: 72, origem: 'regra_115_teletransporte' },
    ];
    rituaisRegras112_115.forEach(({ regra, codigo, origem }) => {
      const temRegra = regrasAutomaticasAtivas.has(regra);
      const jaTem = (rituaisHook.rituaisAprendidos || []).some(r => r.origem === origem || r.codigo_ritual === codigo);
      if (temRegra && !jaTem) {
        const baseRitual = (rituaisHook.rituais || []).find(r => r.Codigo_Ritual === codigo);
        if (baseRitual) {
          rituaisHook.aprenderRitual({
            codigo_ritual: codigo,
            nome: `${baseRitual.Nome_Ritual} (Monstruoso)`,
            origem,
            circulo: baseRitual.Circulo_Ritual,
            elemento: baseRitual.Elemento_Ritual
          });
        }
      } else if (!temRegra && (rituaisHook.rituaisAprendidos || []).some(r => r.origem === origem)) {
        rituaisHook.esquecerRitual(origem);
      }
    });

    // MALDIÇÃO CONJURAÇÃO (Código 24 - Acessórios)
    if (rituaisHook.rituais && rituaisHook.rituais.length > 0 && itensHook.itensInventario) {
      const activeConjuracaoOrigins = new Set<string>();
      itensHook.itensInventario.forEach(i => {
        const nomeItem = (i.item.Nome_Item || '').toLowerCase();
        const grupoItem = (i.item.Grupo_Item || '').toLowerCase();
        const requerEquipar = nomeItem.includes('vestimenta') || nomeItem.includes('amuleto sagrado') || grupoItem === 'proteções' || grupoItem === 'protecoes';
        const estaAtivo = requerEquipar ? Boolean(i.equipado) : true;
        const ritualNomeMald = i.maldicoes_elementos?.[24];
        if (estaAtivo && Array.isArray(i.maldicoes) && i.maldicoes.includes(24) && ritualNomeMald) {
          const baseRitual = rituaisHook.rituais.find(r => r.Nome_Ritual.trim().toLowerCase() === ritualNomeMald.trim().toLowerCase());
          if (baseRitual) {
            const originKey = `maldicao_conjuracao_${i.id}`;
            const jaConhecePorOutraOrigem = (rituaisHook.rituaisAprendidos || []).some(
              r => r.codigo_ritual === baseRitual.Codigo_Ritual && !r.origem?.startsWith('maldicao_conjuracao_')
            );
            if (!jaConhecePorOutraOrigem) {
              activeConjuracaoOrigins.add(originKey);
              const jaInjetado = (rituaisHook.rituaisAprendidos || []).find(r => r.origem === originKey);
              if (!jaInjetado) {
                rituaisHook.aprenderRitual({
                  codigo_ritual: baseRitual.Codigo_Ritual,
                  nome: baseRitual.Nome_Ritual,
                  origem: originKey,
                  circulo: baseRitual.Circulo_Ritual,
                  elemento: baseRitual.Elemento_Ritual
                });
              } else if (jaInjetado.codigo_ritual !== baseRitual.Codigo_Ritual) {
                rituaisHook.esquecerRitual(originKey);
              }
            }
          }
        }
      });

      (rituaisHook.rituaisAprendidos || []).forEach(r => {
        if (r.origem?.startsWith('maldicao_conjuracao_') && !activeConjuracaoOrigins.has(r.origem)) {
          rituaisHook.esquecerRitual(r.origem);
        }
      });
    }

    const isInventarioLoaded = itensHook.itensInventario !== undefined && itensHook.itensInventario !== null;
    const temAgenteSecreto10 = (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 16 && (regras['nex_experiencia'] ? nivel >= 2 : effectiveNex >= 10));
    if (temAgenteSecreto10 && isInventarioLoaded) {
      const temDocumentos = itensHook.itensInventario.some((i) => i.item.Nome_Item === 'Documentos (Agente Secreto)');
      if (!temDocumentos) {
         itensHook.adicionarItem({
           Codigo_Item: 9998,
           Nome_Item: 'Documentos (Agente Secreto)',
           Categoria_Item: '0',
           Espacos_Itens: '0',
           Desc_Item: 'Fornecem privilégios jurídicos especiais, como acesso a locais restritos, permissão para portar armas de fogo e autoridade investigativa. Pessoas comuns não percebem que são falsos (se aplicável).',
           Grupo_Item: 'Itens Operacionais'
         });
      }
    }

    if (temGraduado40 && isInventarioLoaded) {
      const temGrimorio = itensHook.itensInventario.some((i) => i.item.Nome_Item === 'Grimório Ritualístico');
      if (!temGrimorio) {
         itensHook.adicionarItem({
           Codigo_Item: 9999,
           Nome_Item: 'Grimório Ritualístico',
           Categoria_Item: 'II',
           Espacos_Itens: '1',
           Desc_Item: 'Seu Grimório. Quando o segura, você pode conjurar rituais sem precisar de gestos ou componentes materiais.',
           Grupo_Item: 'Itens Operacionais'
         });
      }
    }
  }, [trilhasHook.trilhaSelecionada, trilhasHook.versatilidadeSelecionada, effectiveNex, nivel, regras, rituaisHook.rituais, rituaisHook.rituaisAprendidos, itensHook.itensInventario, poderesExtras, regrasAutomaticasAtivas]);

  const handleRefazer = () => {
    status.resetarStatus();
    setBonusAtributos({ FOR: 0, AGI: 0, INT: 0, PRE: 0, VIG: 0 });
    setSkillCombatente1('');
    setSkillCombatente2('');
    setTelaAtual('atributos');
  };

  const afinidade = afinidadeAtiva ? afinidadeEscolhida : null;

  return (
    <div className="relative w-full min-h-screen flex flex-col">
      <MatrixBackground afinidade={afinidade} />
      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-col p-4 md:p-6">
      <div className="flex w-full justify-between gap-6 xl:gap-10">
        
        {/* BLOCO ESQUERDO: Header + (Atributos e Perícias) */}
        <div className="flex flex-[2_2_66%] flex-col gap-6">
          <CharacterHeader />
          
          <div className="flex w-full justify-between gap-6 xl:gap-10">
            {/* COLUNA ESQUERDA: Atributos + Status + Defesa + Proteções */}
            <div className="flex flex-1 flex-col gap-5 pb-10">
              <AtributosFicha />
              <StatusPanel />
              <DefesaPanel />
              <ProtecoesPanel />
            </div>

            {/* COLUNA MEIO: Perícias */}
            <div className="flex flex-1 flex-col pb-10">
              <PericiasTable />
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: Abas (Combate, Habilidades, Rituais...) */}
        <div className="relative min-w-[320px] flex-[1_1_34%] self-stretch">
          <div className="absolute inset-0 pb-10 pt-[22px]">
            <AbasPanel />
          </div>
        </div>
      </div>

      <button
        onClick={handleRefazer}
        className="mt-12 w-full rounded-md border border-zinc-800 bg-zinc-900 p-3.5 font-bold uppercase tracking-wider text-zinc-400 transition hover:border-green-900 hover:text-green-500"
      >
        Refazer Personagem
      </button>

      {(nexModalAberto !== null || nexPoderEditando !== null) && <ModalPoderes />}
      </div>
    </div>
  );
};

// ============================================================
// COMPONENTE INTERNO: ATRIBUTOS NA FICHA
// ============================================================
function AtributosFicha() {
  const [opcoesAbertas, setOpcoesAbertas] = React.useState(false);
  const { 
    atributos, setAtributos, bonusAtributos, setBonusAtributos, bloquearLetras, atributosFinais, 
    nex, setNex, regras, regrasAtivasAtributos, setRegrasAtivasAtributos, pontosRestantes, alterarAtributo, nivel,
    trilhasHook, bonusTrilhasAtributos, bonusMaldicoes,
    regrasAutomaticasAtivas, poderesExtras, setPoderesExtras,
    devorarIntCount, necrosarForCount, inexistirAgiCount, queimarVigCount,
    maxDevorarInt, maxNecrosarFor, maxInexistirAgi, maxQueimarVig
  } = useRPG();
  
  const capMaximo = capMaximoAtributo(nivel);

  const renderAtributo = (nome, posClasses) => {
    const bonusTrilhaVal = bonusTrilhasAtributos ? (bonusTrilhasAtributos[nome] || 0) : 0;
    const bonusMaldVal = bonusMaldicoes?.atributos?.[nome] || 0;
    const isGreen = atributosFinais[nome] > (atributos[nome] + bonusAtributos[nome] + bonusTrilhaVal + bonusMaldVal);

    return (
      <div key={nome} className={`absolute flex flex-col items-center justify-center ${posClasses}`}>
          <input
            type="number"
            onKeyDown={bloquearLetras}
            value={atributosFinais[nome]}
            onChange={(e) => {
              const diferenca = atributosFinais[nome] - atributos[nome];
              let numValue = Number(e.target.value);
              if (regrasAtivasAtributos) {
                let baseDesejada = isNaN(numValue) ? atributos[nome] : numValue - diferenca;
                const valorAntigo = atributos[nome];
                if (baseDesejada > valorAntigo) {
                   let cost = 0;
                   let current = valorAntigo;
                   while (current < baseDesejada && current < capMaximo) {
                     current++;
                     cost++;
                     if (cost > pontosRestantes) {
                       current--;
                       break;
                     }
                   }
                   baseDesejada = current;
                } else {
                   if (baseDesejada < 0) baseDesejada = 0;
                }
                setAtributos({ ...atributos, [nome]: baseDesejada });
              } else {
                // Modo Livre: não mexe nos pontos da base, adiciona direto como bônus!
                if (!isNaN(numValue)) {
                   const diferencaSemBonus = atributosFinais[nome] - bonusAtributos[nome];
                   const novoBonus = Math.max(0, numValue - diferencaSemBonus);
                   setBonusAtributos({ ...bonusAtributos, [nome]: novoBonus });
                }
              }
            }}
            className={`relative z-0 w-16 bg-transparent text-center text-[2rem] font-black outline-none ${isGreen ? 'text-green-500' : 'text-zinc-100'}`}
          />
      </div>
    );
  };

  return (
    <div className="mb-6 mt-6 flex flex-col items-center w-full relative">
      <div className="w-full flex justify-between items-start z-10 px-2 md:px-4 mb-4 relative min-h-[40px]">
        <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-lg shadow-lg shadow-black/20">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">NEX:</span>
          {regras['nex_experiencia'] ? (
            <div className="flex items-center w-16">
              <input
                type="number"
                onKeyDown={bloquearLetras}
                value={nex}
                onChange={(e) => setNex(Math.max(0, Math.min(99, Number(e.target.value))))}
                className="w-8 bg-transparent text-center text-sm font-bold text-zinc-100 outline-none"
              />
              <span className="text-sm font-bold text-zinc-500">%</span>
            </div>
          ) : (
            <div className="relative z-50 w-20">
              <CustomSelect
                value={(NEX_OPTIONS.includes(nex) ? nex : Math.max(5, Math.ceil(nex / 5) * 5)).toString()}
                onChange={(val) => setNex(Number(val))}
                options={NEX_OPTIONS.map(n => ({ value: n.toString(), label: n + '%' }))}
                hideIcon={true}
                wrapperClassName="w-full"
                className="w-full bg-transparent border-none text-center text-sm font-bold text-zinc-100 hover:text-green-400 p-0 focus:ring-0 cursor-pointer"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5 absolute right-2 md:right-4 top-0 z-50">
          <button 
            onClick={() => setOpcoesAbertas(!opcoesAbertas)}
            className={`text-zinc-500 hover:text-zinc-300 transition-all flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-lg shadow-lg shadow-black/20 ${opcoesAbertas ? 'text-green-500' : ''}`}
            title="Opções de Atributos"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider">Regras</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${opcoesAbertas ? 'rotate-90' : ''}`}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
          
          <div className={`overflow-hidden transition-all duration-300 ease-in-out origin-top-right ${opcoesAbertas ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="bg-zinc-900/95 border border-zinc-700/50 px-3 py-2 rounded-lg flex flex-col items-end gap-1.5 shadow-lg shadow-black/80">
              <label className="flex cursor-pointer items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-400 font-bold hover:text-zinc-200 transition-colors">
                <input
                  type="checkbox"
                  className="cursor-pointer accent-green-600"
                  checked={regrasAtivasAtributos}
                  onChange={(e) => setRegrasAtivasAtributos(e.target.checked)}
                />
                {regrasAtivasAtributos ? 'Regras Ativas' : 'Modo Livre'}
              </label>
              {regrasAtivasAtributos && (
                <span className={`text-[10px] uppercase tracking-wider font-bold ${pontosRestantes > 0 ? 'text-green-500' : 'text-zinc-500'}`}>
                  Disponível: {pontosRestantes}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-[340px] aspect-square">
        <img src="/images/atributos-bg.png" alt="Atributos" className="w-full h-full object-contain pointer-events-none drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]" />
        
        {renderAtributo('AGI', 'top-[16%] left-[50%] -translate-x-1/2 -translate-y-1/2')}
        {renderAtributo('INT', 'top-[36%] right-[19%] translate-x-1/2 -translate-y-1/2')}
        {renderAtributo('VIG', 'top-[74%] right-[28%] translate-x-1/2 -translate-y-1/2')}
        {renderAtributo('PRE', 'top-[74%] left-[27%] -translate-x-1/2 -translate-y-1/2')}
        {renderAtributo('FOR', 'top-[36%] left-[19%] -translate-x-1/2 -translate-y-1/2')}
      </div>

      <div className="w-full px-2">
        <Collapse isOpen={Boolean(regrasAutomaticasAtivas.has(104))}>
          <div className="pt-2.5">
            <div className="flex flex-col gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 p-2.5 shadow-sm transition hover:border-zinc-700">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-100 truncate">Devorar Intelecto</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={devorarIntCount <= 0}
                    onClick={() => setPoderesExtras(prev => ({ ...prev, devorar_int: String(Math.max(0, devorarIntCount - 1)) }))}
                    className="h-7 w-7 rounded border border-zinc-700/80 bg-zinc-900/80 text-xs font-bold text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-25 disabled:border-zinc-800 disabled:bg-zinc-950 disabled:text-zinc-600 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
                    title="Restaurar 1 ponto de Intelecto"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    disabled={devorarIntCount >= maxDevorarInt}
                    onClick={() => setPoderesExtras(prev => ({ ...prev, devorar_int: String(Math.min(maxDevorarInt, devorarIntCount + 1)) }))}
                    className={`h-7 rounded border px-3 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center ${
                      devorarIntCount >= maxDevorarInt
                        ? 'border-zinc-800 bg-zinc-900/40 text-zinc-600 cursor-not-allowed'
                        : 'border-red-900/60 bg-red-950/30 text-red-400 hover:bg-red-950/60 hover:border-red-700 hover:text-red-300 shadow-[0_0_12px_rgba(185,28,28,0.12)] cursor-pointer'
                    }`}
                    title="Devorar 1 ponto de Intelecto"
                  >
                    Devorar ({devorarIntCount}/{maxDevorarInt})
                  </button>
                </div>
              </div>
              <div className="text-[10px] text-zinc-400 leading-snug">
                +{1 + devorarIntCount}d{regrasAutomaticasAtivas.has(108) ? 8 : 6} Sangue • RD Dano {2 + devorarIntCount * 2} {devorarIntCount > 0 && <span className="text-red-400 font-semibold">(–{devorarIntCount} INT)</span>}
              </div>
            </div>
          </div>
        </Collapse>

        <Collapse isOpen={Boolean(regrasAutomaticasAtivas.has(105))}>
          <div className="pt-2.5">
            <div className="flex flex-col gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 p-2.5 shadow-sm transition hover:border-zinc-700">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-100 truncate">Necrosar Força</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={necrosarForCount <= 0}
                    onClick={() => setPoderesExtras(prev => ({ ...prev, necrosar_for: String(Math.max(0, necrosarForCount - 1)) }))}
                    className="h-7 w-7 rounded border border-zinc-700/80 bg-zinc-900/80 text-xs font-bold text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-25 disabled:border-zinc-800 disabled:bg-zinc-950 disabled:text-zinc-600 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
                    title="Restaurar 1 ponto de Força"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    disabled={necrosarForCount >= maxNecrosarFor}
                    onClick={() => setPoderesExtras(prev => ({ ...prev, necrosar_for: String(Math.min(maxNecrosarFor, necrosarForCount + 1)) }))}
                    className={`h-7 rounded border px-3 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center ${
                      necrosarForCount >= maxNecrosarFor
                        ? 'border-zinc-800 bg-zinc-900/40 text-zinc-600 cursor-not-allowed'
                        : 'border-zinc-700/80 bg-black/60 text-zinc-200 hover:bg-zinc-900 hover:border-zinc-500 hover:text-white shadow-[0_0_12px_rgba(0,0,0,0.3)] cursor-pointer'
                    }`}
                    title="Necrosar 1 ponto de Força"
                  >
                    Necrosar ({necrosarForCount}/{maxNecrosarFor})
                  </button>
                </div>
              </div>
              <div className="text-[10px] text-zinc-400 leading-snug">
                +{1 + necrosarForCount} turno(s) morrendo {necrosarForCount > 0 && <span className="text-zinc-300 font-semibold">(–{necrosarForCount} FOR)</span>}
              </div>
            </div>
          </div>
        </Collapse>

        <Collapse isOpen={Boolean(regrasAutomaticasAtivas.has(106))}>
          <div className="pt-2.5">
            <div className="flex flex-col gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 p-2.5 shadow-sm transition hover:border-zinc-700">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-100 truncate">Inexistir Agilidade</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={inexistirAgiCount <= 0}
                    onClick={() => setPoderesExtras(prev => ({ ...prev, inexistir_agi: String(Math.max(0, inexistirAgiCount - 1)) }))}
                    className="h-7 w-7 rounded border border-zinc-700/80 bg-zinc-900/80 text-xs font-bold text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-25 disabled:border-zinc-800 disabled:bg-zinc-950 disabled:text-zinc-600 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
                    title="Restaurar 1 ponto de Agilidade"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    disabled={inexistirAgiCount >= maxInexistirAgi}
                    onClick={() => setPoderesExtras(prev => ({ ...prev, inexistir_agi: String(Math.min(maxInexistirAgi, inexistirAgiCount + 1)) }))}
                    className={`h-7 rounded border px-3 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center ${
                      inexistirAgiCount >= maxInexistirAgi
                        ? 'border-zinc-800 bg-zinc-900/40 text-zinc-600 cursor-not-allowed'
                        : 'border-yellow-900/60 bg-yellow-950/30 text-yellow-400 hover:bg-yellow-950/60 hover:border-yellow-700 hover:text-yellow-300 shadow-[0_0_12px_rgba(202,138,4,0.12)] cursor-pointer'
                    }`}
                    title="Inexistir 1 ponto de Agilidade"
                  >
                    Inexistir ({inexistirAgiCount}/{maxInexistirAgi})
                  </button>
                </div>
              </div>
              <div className="text-[10px] text-zinc-400 leading-snug">
                +{inexistirAgiCount * 2} em testes de INT {inexistirAgiCount > 0 && <span className="text-yellow-500/90 font-semibold">(–{inexistirAgiCount} AGI)</span>}
              </div>
            </div>
          </div>
        </Collapse>

        <Collapse isOpen={Boolean(regrasAutomaticasAtivas.has(107))}>
          <div className="pt-2.5">
            <div className="flex flex-col gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 p-2.5 shadow-sm transition hover:border-zinc-700">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-100 truncate">Queimar Vigor</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={queimarVigCount <= 0}
                    onClick={() => setPoderesExtras(prev => ({ ...prev, queimar_vig: String(Math.max(0, queimarVigCount - 1)) }))}
                    className="h-7 w-7 rounded border border-zinc-700/80 bg-zinc-900/80 text-xs font-bold text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-25 disabled:border-zinc-800 disabled:bg-zinc-950 disabled:text-zinc-600 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
                    title="Restaurar 1 ponto de Vigor"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    disabled={queimarVigCount >= maxQueimarVig}
                    onClick={() => setPoderesExtras(prev => ({ ...prev, queimar_vig: String(Math.min(maxQueimarVig, queimarVigCount + 1)) }))}
                    className={`h-7 rounded border px-3 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center ${
                      queimarVigCount >= maxQueimarVig
                        ? 'border-zinc-800 bg-zinc-900/40 text-zinc-600 cursor-not-allowed'
                        : 'border-purple-900/60 bg-purple-950/30 text-purple-400 hover:bg-purple-950/60 hover:border-purple-700 hover:text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.12)] cursor-pointer'
                    }`}
                    title="Queimar 1 ponto de Vigor"
                  >
                    Queimar ({queimarVigCount}/{maxQueimarVig})
                  </button>
                </div>
              </div>
              <div className="text-[10px] text-zinc-400 leading-snug">
                +{2 + queimarVigCount * 2} Defesa{queimarVigCount > 0 ? ` • +${queimarVigCount}d4 Ataque` : ''} {queimarVigCount > 0 && <span className="text-purple-400 font-semibold">(–{queimarVigCount} VIG)</span>}
              </div>
            </div>
          </div>
        </Collapse>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTE INTERNO: DEFESA
// ============================================================
function DefesaPanel() {
  const { defesaTotal, defEquip, setDefEquip, defOutros, setDefOutros, bloquearLetras, periciasHook, atributosFinais, regrasAutomaticasAtivas, protecoes, protecoesHook, totalDefesaProtecoes, bonusVestimentas, bonusMaldicoes, trilhasHook, status, regras, nivel, nex, bonusDefesaTrilha34, defOutrosBonusRegra72, defOutrosBonusRegra107 } = useRPG();

  const [bloqueio, setBloqueio] = React.useState(0);
  const [esquiva, setEsquiva] = React.useState(0);
  const bloqueioOverride = useRef(false);
  const esquivaOverride = useRef(false);

  // Auto calcula bloqueio a partir de Fortitude (código 10) e esquiva a partir de Reflexos (código 23)
  useEffect(() => {
    const { pericias, nomesPericias } = periciasHook;

    // Fortitude
    const nomeFortitude = nomesPericias[10];
    if (nomeFortitude && pericias[nomeFortitude] && !bloqueioOverride.current) {
      const bonusBloqueioRegra73 = regrasAutomaticasAtivas.has(73) ? atributosFinais.AGI : 0;
      const total = pericias[nomeFortitude].treino + pericias[nomeFortitude].outros + bonusBloqueioRegra73;
      setBloqueio(total);
    }

    // Reflexos
    const nomeReflexos = nomesPericias[23];
    if (nomeReflexos && pericias[nomeReflexos] && !esquivaOverride.current) {
      const total = defesaTotal + pericias[nomeReflexos].treino + pericias[nomeReflexos].outros;
      setEsquiva(total);
    }
  }, [periciasHook, atributosFinais, defesaTotal, regrasAutomaticasAtivas]);

  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-5 rounded-lg border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg border-2 border-zinc-200 text-2xl font-bold">
          {defesaTotal}
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">Defesa</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-sm text-zinc-300">
            = 10 + AGI +
            <div className="relative flex flex-col items-center">
              <input
                type="number"
                onKeyDown={bloquearLetras}
                value={defEquip || ''}
                placeholder="0"
                title="Defesa de equipamento"
                onChange={e => setDefEquip(Math.max(0, Number(e.target.value)))}
                className="w-10 border-b border-zinc-600 bg-transparent text-center font-bold text-zinc-100 outline-none focus:border-green-600"
              />
              <span className="absolute top-full text-[9px] uppercase tracking-wider text-zinc-500 mt-0.5">Equip.</span>
            </div>
            +
            <div className="relative flex flex-col items-center">
              <input
                type="number"
                onKeyDown={bloquearLetras}
                value={(() => {
                  const defOutrosBonusRegra = (regrasAutomaticasAtivas.has(4) ? 2 : 0) + (regrasAutomaticasAtivas.has(12) ? 2 : 0) + (defOutrosBonusRegra72 || 0) + (defOutrosBonusRegra107 || 0);
                  const temProtecaoPesada = protecoesHook?.protecoesInventario.some(p => p.equipado && p.protecao.Proficiencia?.toLowerCase().includes('pesada')) || false;
                  const bonusRegra21 = (regrasAutomaticasAtivas.has(21) && temProtecaoPesada) ? 2 : 0;
                  const temProtecaoLeve = protecoesHook?.protecoesInventario.some(p => p.equipado && p.protecao.Proficiencia?.toLowerCase().includes('leve')) || false;
                  const bonusRegra25 = (regrasAutomaticasAtivas.has(25) && temProtecaoLeve) ? 2 : 0;
                  const isMachucado = status.pvAtual !== null && status.pvMax > 0 && status.pvAtual <= Math.floor(status.pvMax / 2);
                  const temInquebravel = trilhasHook.trilhaSelecionada?.Codigo_Trilha === 5 && (regras['nex_experiencia'] ? (nivel >= 20) : (nex >= 99));
                  const bonusTrilha5 = (temInquebravel && isMachucado) ? 5 : 0;
                  const bonusDefesa34 = bonusDefesaTrilha34 || 0;
                  return defOutros + defOutrosBonusRegra + bonusRegra21 + bonusRegra25 + bonusTrilha5 + bonusDefesa34 + totalDefesaProtecoes + (bonusVestimentas?.defesa || 0) + (bonusMaldicoes?.defesa || 0) || '';
                })()}
                placeholder="0"
                title="Outros bônus de defesa"
                onChange={e => {
                  const valDigitado = Math.max(0, Number(e.target.value));
                  const defOutrosBonusRegra = (regrasAutomaticasAtivas.has(4) ? 2 : 0) + (regrasAutomaticasAtivas.has(12) ? 2 : 0) + (defOutrosBonusRegra72 || 0) + (defOutrosBonusRegra107 || 0);
                  const temProtecaoPesada = protecoesHook?.protecoesInventario.some(p => p.equipado && p.protecao.Proficiencia?.toLowerCase().includes('pesada')) || false;
                  const bonusRegra21 = (regrasAutomaticasAtivas.has(21) && temProtecaoPesada) ? 2 : 0;
                  const temProtecaoLeve = protecoesHook?.protecoesInventario.some(p => p.equipado && p.protecao.Proficiencia?.toLowerCase().includes('leve')) || false;
                  const bonusRegra25 = (regrasAutomaticasAtivas.has(25) && temProtecaoLeve) ? 2 : 0;
                  const isMachucado = status.pvAtual !== null && status.pvMax > 0 && status.pvAtual <= Math.floor(status.pvMax / 2);
                  const temInquebravel = trilhasHook.trilhaSelecionada?.Codigo_Trilha === 5 && (regras['nex_experiencia'] ? (nivel >= 20) : (nex >= 99));
                  const bonusTrilha5 = (temInquebravel && isMachucado) ? 5 : 0;
                  const bonusDefesa34 = bonusDefesaTrilha34 || 0;
                  setDefOutros(Math.max(0, valDigitado - defOutrosBonusRegra - bonusRegra21 - bonusRegra25 - bonusTrilha5 - bonusDefesa34 - totalDefesaProtecoes));
                }}
                className="w-10 border-b border-zinc-600 bg-transparent text-center font-bold text-zinc-100 outline-none focus:border-green-600"
              />
              <span className="absolute top-full text-[9px] uppercase tracking-wider text-zinc-500 mt-0.5">Outros</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Bloqueio</span>
        <input
          type="number"
          onKeyDown={bloquearLetras}
          value={bloqueio || ''}
          placeholder="0"
          onChange={e => { bloqueioOverride.current = true; setBloqueio(Math.max(0, Number(e.target.value))); }}
          className="mt-1 w-12 border-b border-zinc-600 bg-transparent text-center text-lg font-bold text-zinc-100 outline-none focus:border-green-600"
        />
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Esquiva</span>
        <input
          type="number"
          onKeyDown={bloquearLetras}
          value={esquiva || ''}
          placeholder="0"
          onChange={e => { esquivaOverride.current = true; setEsquiva(Math.max(0, Number(e.target.value))); }}
          className="mt-1 w-12 border-b border-zinc-600 bg-transparent text-center text-lg font-bold text-zinc-100 outline-none focus:border-green-600"
        />
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTE INTERNO: PROTEÇÕES, RESISTÊNCIAS, PROFICIÊNCIAS
// ============================================================
function ProtecoesPanel() {
  const {
    protecoes, setProtecoes,
    resistencias, setResistencias,
    proficiencias, setProficiencias,
    sentidos, setSentidos,
    imunidades, setImunidades,
    vulnerabilidades, setVulnerabilidades,
    regrasAutomaticasAtivas, atributosFinais, poderesHook, rituaisHook, periciasHook, status, poderesExtras,
    protecoesHook, modificacoesHook, bonusVestimentas, bonusMaldicoes, origensHook,
    trilhasHook, regras, nivel, nex,
    temMonstruoso10, temMonstruoso40, temMonstruoso65, temMonstruoso99, monstruosoElemento,
    isMonstruosoAtivo10, isMonstruosoAtivo40, isMonstruosoAtivo65,
    devorarIntCount
  } = useRPG();
  const [mostrarOutros, setMostrarOutros] = React.useState(false);

  const protecoesExtras: string[] = [];
  const resistenciasExtras: string[] = [...(bonusVestimentas?.resistenciasExtras || []), ...(bonusMaldicoes?.resistenciasExtras || [])];
  
  // REGRA 5: Resistência Mental +INT
  if (regrasAutomaticasAtivas.has(5) && atributosFinais.INT > 0) {
    resistenciasExtras.push(`Mental ${atributosFinais.INT}`);
  }
  // REGRA 9, 60 e 104: Resistência a Dano
  let danoResist = 0;
  if (regrasAutomaticasAtivas.has(9)) {
    danoResist += 2;
  }
  if (regrasAutomaticasAtivas.has(104)) {
    danoResist += 2 + (devorarIntCount * 2);
  }
  if (regrasAutomaticasAtivas.has(60)) {
    const machucado = status.pvAtual !== null && status.pvMax > 0 && status.pvAtual <= Math.floor(status.pvMax / 2);
    if (machucado) {
      danoResist += 5;
    }
  }

  // TRILHA 5: Inquebrável (99%) - Resistência a Dano 5 quando machucado
  const temInquebravelTrilha5 = trilhasHook.trilhaSelecionada?.Codigo_Trilha === 5 && (regras['nex_experiencia'] ? (nivel >= 20) : (nex >= 99));
  const isMachucadoTrilha5 = status.pvAtual !== null && status.pvMax > 0 && status.pvAtual <= Math.floor(status.pvMax / 2);
  if (temInquebravelTrilha5 && isMachucadoTrilha5) {
    danoResist += 5;
  }

  if (danoResist > 0) {
    resistenciasExtras.push(`Dano ${danoResist}`);
  }

  // REGRA 63 e 64: Resistência a Morte
  if (regrasAutomaticasAtivas.has(63)) {
    const valorMorte = regrasAutomaticasAtivas.has(64) ? 10 : 5;
    resistenciasExtras.push(`Morte ${valorMorte}`);
  }

  // REGRA 11: Resistência Mental 2 + (+1 pra cada 2 poderes/rituais de Sangue)
  if (regrasAutomaticasAtivas.has(11)) {
    let qtdSangue = 0;
    Object.values(poderesHook.poderesEscolhidos || {}).forEach(poder => {
      if (poder.elemento === 'Sangue') qtdSangue++;
    });
    (rituaisHook.rituaisAprendidos || []).forEach((aprendido: any) => {
      const ritualCompleto = (rituaisHook.rituais || []).find((r: any) => r.Codigo_Ritual === aprendido.codigo_ritual);
      if (ritualCompleto) {
        const isLista = ritualCompleto.Elemento_Ritual?.toLowerCase() === 'lista' || ritualCompleto.Elemento_Ritual?.toLowerCase() === 'varia';
        const elemento = isLista ? (aprendido.elemento_escolhido || 'Sangue') : ritualCompleto.Elemento_Ritual;
        if (elemento === 'Sangue') qtdSangue++;
      }
    });
    const rdMental = 2 + Math.floor(qtdSangue / 2);
    resistenciasExtras.push(`Mental ${rdMental}`);
  }

  // REGRA 15: Resistência Mental igual a metade de Intimidação (Treino + Outros), arredondado pra cima
  if (regrasAutomaticasAtivas.has(15)) {
    const intimida = periciasHook.pericias['Intimidação'];
    if (intimida) {
      const bonus = intimida.treino + intimida.outros;
      const rdMental = Math.ceil(bonus / 2);
      resistenciasExtras.push(`Mental ${rdMental}`);
    }
  }

  // REGRA 18 e 19: Resistência 10 (ou 20) ao elemento escolhido
  const poderesRegra18 = Object.values(poderesHook.poderesEscolhidos || {}).filter(p => p.codigoRegra === 18);
  const elementoRegra18 = poderesRegra18[0]?.elemento || origensHook.origemSelecionada?.elemento_escolhido;

  if (regrasAutomaticasAtivas.has(18) && elementoRegra18) {
    const temAfinidade = regrasAutomaticasAtivas.has(19) || poderesRegra18.length >= 2;
    const valorResistencia = temAfinidade ? 20 : 10;
    resistenciasExtras.push(`${elementoRegra18} ${valorResistencia}`);
  }

  // TRILHA 18: Monstruoso RD
  const rdMonstruoso = temMonstruoso99 ? 20 : (temMonstruoso65 && isMonstruosoAtivo65) ? 15 : (temMonstruoso40 && isMonstruosoAtivo40) ? 10 : (temMonstruoso10 && isMonstruosoAtivo10) ? 5 : 0;
  if (rdMonstruoso > 0) {
    if (monstruosoElemento === 'Sangue') {
      resistenciasExtras.push(`Balístico ${rdMonstruoso}`);
      resistenciasExtras.push(`Sangue ${rdMonstruoso}`);
    } else if (monstruosoElemento === 'Morte') {
      resistenciasExtras.push(`Perfuração ${rdMonstruoso}`);
      if (!temMonstruoso99) {
        resistenciasExtras.push(`Morte ${rdMonstruoso}`);
      }
    } else if (monstruosoElemento === 'Conhecimento') {
      resistenciasExtras.push(`Balístico ${rdMonstruoso}`);
      resistenciasExtras.push(`Conhecimento ${rdMonstruoso}`);
    } else if (monstruosoElemento === 'Energia') {
      resistenciasExtras.push(`Corte ${rdMonstruoso}`);
      resistenciasExtras.push(`Eletricidade ${rdMonstruoso}`);
      resistenciasExtras.push(`Fogo ${rdMonstruoso}`);
      resistenciasExtras.push(`Energia ${rdMonstruoso}`);
      if (temMonstruoso65 && isMonstruosoAtivo65) {
        resistenciasExtras.push(`Químico ${rdMonstruoso}`);
      }
    }
  }

  // REGRA 17: Adiciona "Armas Pesadas" em Proficiências
  const proficienciasExtras = [];
  // REGRA 17: Armas Pesadas
  if (regrasAutomaticasAtivas.has(17)) {
    proficienciasExtras.push('Armas Pesadas');
  }
  // REGRA 20: Proteções Pesadas
  if (regrasAutomaticasAtivas.has(20)) {
    proficienciasExtras.push('Proteções Pesadas');
  }
  // REGRA 27: Armas Táticas (de fogo)
  if (regrasAutomaticasAtivas.has(27)) {
    proficienciasExtras.push('Armas Táticas (de fogo)');
  }
  // REGRA 28: Armas Táticas (corpo a corpo e de disparo)
  if (regrasAutomaticasAtivas.has(28)) {
    proficienciasExtras.push('Armas Táticas (corpo a corpo e de disparo)');
  }
  // REGRA 38: Proteções Leves
  if (regrasAutomaticasAtivas.has(38)) {
    proficienciasExtras.push('Proteções Leves');
  }
  
  // TRILHA 6: Atirador de Elite (10%)
  const effectiveNivel = regras['nex_experiencia'] ? nivel : Math.floor(nex / 5);
  const effectiveNex = regras['nex_experiencia'] ? nivel * 5 : nex;
  const temMiraElite = (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 6 && (regras['nex_experiencia'] ? effectiveNivel >= 2 : effectiveNex >= 10)) || (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 6 && (regras['nex_experiencia'] ? effectiveNivel >= 10 : effectiveNex >= 50));
  if (temMiraElite && !proficiencias.includes('Armas de Fogo (Balas Longas)')) {
    proficienciasExtras.push('Armas de Fogo (Balas Longas)');
  }

  const temProtecaoPesada = protecoesHook?.protecoesInventario.some(p => p.equipado && p.protecao.Proficiencia?.toLowerCase().includes('pesada')) || false;
  let bonusDefesaRegra21 = 0;
  let bonusResistenciaFisica = 0;

  if (regrasAutomaticasAtivas.has(21) && temProtecaoPesada) {
    bonusDefesaRegra21 = 2;
    bonusResistenciaFisica += 2;
  }
  
  // RD nativa de Proteções Equipadas e Modificação: Blindada
  let rdProtecao = 0;
  if (protecoesHook && modificacoesHook) {
    const protecoesEquipadas = protecoesHook.protecoesInventario.filter(p => p.equipado);
    protecoesEquipadas.forEach(p => {
       const isPesada = p.protecao.Proficiencia?.toLowerCase().includes('pesada');
       const temBlindada = p.modificacoes?.some(id => {
         const m = modificacoesHook.modificacoes.find(mod => mod.Codigo_Modif === id);
         return m?.Nome_Modif.trim().toLowerCase() === 'blindada';
       });
       
       if (temBlindada) {
         if (rdProtecao < 5) rdProtecao = 5;
       } else if (isPesada) {
         if (rdProtecao < 2) rdProtecao = 2;
       }
       
       // Preencher protecoesExtras baseado na proficiência do item equipado
       const prof = p.protecao.Proficiencia?.toLowerCase() || '';
       if (prof.includes('leves') && !protecoesExtras.includes('Proteção Leve')) {
         protecoesExtras.push('Proteção Leve');
       } else if (prof.includes('pesadas') && !protecoesExtras.includes('Proteção Pesada')) {
         protecoesExtras.push('Proteção Pesada');
       } else if (prof.includes('escudos') && !protecoesExtras.includes('Escudo (Proteção Pesada)')) {
         protecoesExtras.push('Escudo (Proteção Pesada)');
       }
    });
  }
  bonusResistenciaFisica += rdProtecao;
  
  // REGRA 65: Resistência Física +7
  if (regrasAutomaticasAtivas.has(65)) {
    bonusResistenciaFisica += 7;
  }

  if (bonusResistenciaFisica > 0) {
    resistenciasExtras.push(`Balístico ${bonusResistenciaFisica}`);
    resistenciasExtras.push(`Corte ${bonusResistenciaFisica}`);
    resistenciasExtras.push(`Impacto ${bonusResistenciaFisica}`);
    resistenciasExtras.push(`Perfuração ${bonusResistenciaFisica}`);
  }

  const imunidadesExtras = [...imunidades];
  // TRILHA 14: Intuitivo
  const temIntuitivo10 = (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 14 && (regras['nex_experiencia'] ? effectiveNivel >= 2 : effectiveNex >= 10)) || (trilhasHook.versatilidadeSelecionada?.Codigo_Trilha === 14 && (regras['nex_experiencia'] ? effectiveNivel >= 10 : effectiveNex >= 50));
  const temIntuitivo65 = trilhasHook.trilhaSelecionada?.Codigo_Trilha === 14 && (regras['nex_experiencia'] ? effectiveNivel >= 13 : effectiveNex >= 65);
  if (temIntuitivo10) {
    if (temIntuitivo65) {
      resistenciasExtras.push('Paranormal 15');
      resistenciasExtras.push('Mental 10');
    } else {
      resistenciasExtras.push('Paranormal 5');
    }
  }

  // REGRA 46: Imunidades extras Frio e Calor
  if (regrasAutomaticasAtivas.has(46)) {
    if (!imunidadesExtras.includes('Frio')) imunidadesExtras.push('Frio');
    if (!imunidadesExtras.includes('Calor')) imunidadesExtras.push('Calor');
  }
  // REGRA 48: Imunidade a Desprevenido
  if (regrasAutomaticasAtivas.has(48)) {
    if (!imunidadesExtras.includes('Desprevenido')) imunidadesExtras.push('Desprevenido');
  }
  // REGRA 52: Imunidade a Venenos e Doenças
  if (regrasAutomaticasAtivas.has(52)) {
    if (!imunidadesExtras.includes('Venenos')) imunidadesExtras.push('Venenos');
    if (!imunidadesExtras.includes('Doenças')) imunidadesExtras.push('Doenças');
  }
  // Monstruoso Imunidades
  if (temMonstruoso10 && isMonstruosoAtivo10 && monstruosoElemento === 'Morte') {
    if (!imunidadesExtras.includes('Fatigado')) imunidadesExtras.push('Fatigado');
  }
  if (temMonstruoso40 && isMonstruosoAtivo40 && monstruosoElemento === 'Morte') {
    if (!imunidadesExtras.includes('Fome')) imunidadesExtras.push('Fome');
    if (!imunidadesExtras.includes('Sede')) imunidadesExtras.push('Sede');
  }
  if (temMonstruoso99 && monstruosoElemento === 'Morte') {
    if (!imunidadesExtras.includes('Morte')) imunidadesExtras.push('Morte');
  }
  if (temMonstruoso99 && monstruosoElemento === 'Energia') {
    if (!imunidadesExtras.includes('Paralisia física')) imunidadesExtras.push('Paralisia física');
  }

  const sentidosExtras = [];
  // REGRA 56: Visão no Escuro
  if (regrasAutomaticasAtivas.has(56)) {
    sentidosExtras.push('Visão no Escuro');
  }
  // REGRA 59: Visão no Escuro e Faro
  if (regrasAutomaticasAtivas.has(59)) {
    if (!sentidosExtras.includes('Visão no Escuro')) sentidosExtras.push('Visão no Escuro');
    sentidosExtras.push('Faro');
  }
  // Monstruoso Sentidos
  if (temMonstruoso10 && isMonstruosoAtivo10 && monstruosoElemento === 'Sangue') {
    if (!sentidosExtras.includes('Faro')) sentidosExtras.push('Faro');
  }
  if (temMonstruoso10 && isMonstruosoAtivo10 && monstruosoElemento === 'Conhecimento') {
    if (!sentidosExtras.includes('Visão no Escuro')) sentidosExtras.push('Visão no Escuro');
  }
  if (temMonstruoso99 && monstruosoElemento === 'Conhecimento') {
    if (!sentidosExtras.includes('Percepção às Cegas')) sentidosExtras.push('Percepção às Cegas');
  }

  return (
    <div className="mt-6 flex w-full flex-col gap-5">
      <BadgeBlock titulo="Proteção" itens={protecoes} setItens={setProtecoes} itensExtras={protecoesExtras} />

      <BadgeBlock titulo="Resistências" itens={resistencias} setItens={setResistencias} itensExtras={resistenciasExtras} />
      <BadgeBlock titulo="Proficiências" itens={proficiencias} setItens={setProficiencias} itensExtras={proficienciasExtras} />
      
      <div className="flex flex-col">
        <button 
          onClick={() => setMostrarOutros(!mostrarOutros)}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition w-fit mt-1"
        >
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={`transition-transform duration-200 ${mostrarOutros ? 'rotate-90' : ''}`}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          Outros
        </button>

        <Collapse isOpen={mostrarOutros}>
          <div className="flex flex-col gap-5 pt-4">
            <BadgeBlock titulo="Vulnerabilidades" itens={vulnerabilidades} setItens={setVulnerabilidades} />
            <BadgeBlock titulo="Imunidades" itens={imunidades} setItens={setImunidades} itensExtras={imunidadesExtras} />
            <BadgeBlock titulo="Sentidos" itens={sentidos} setItens={setSentidos} itensExtras={sentidosExtras} />
          </div>
        </Collapse>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTE INTERNO: BADGE (para Proteções, Resistências, etc.)
// ============================================================
function BadgeBlock({
  titulo,
  itens,
  setItens,
  itensExtras = []
}: {
  titulo: string;
  itens: string[];
  setItens: React.Dispatch<React.SetStateAction<string[]>>;
  itensExtras?: string[];
}) {
  const [inputValue, setInputValue] = React.useState('');

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2.5">
        <span className="min-w-36 text-xs font-bold uppercase tracking-wider text-zinc-500">{titulo}</span>
        <input
          type="text"
          value={inputValue}
          placeholder="Digite e aperte Enter..."
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && inputValue.trim()) {
              setItens([...itens, inputValue.trim()]);
              setInputValue('');
            }
          }}
          className="flex-1 border-b border-zinc-800 bg-transparent py-1 text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-green-700"
        />
      </div>
      {(itens.length > 0 || itensExtras.length > 0) && (() => {
        const ordemCustomizada: Record<string, number> = {
          'armas simples': 1,
          'armas táticas': 2,
          'armas táticas (de fogo)': 2,
          'armas táticas (corpo a corpo e de disparo)': 2,
          'armas pesadas': 3,
          'proteções leves': 4,
          'proteções pesadas': 5
        };

        const todosItens = [
          ...itensExtras.map((text, i) => ({ text, isExtra: true, originalIndex: i, id: `extra-${i}` })),
          ...itens.map((text, i) => ({ text, isExtra: false, originalIndex: i, id: `normal-${i}` }))
        ].sort((a, b) => {
          const pesoA = ordemCustomizada[a.text.toLowerCase()] || 99;
          const pesoB = ordemCustomizada[b.text.toLowerCase()] || 99;
          if (pesoA !== pesoB) return pesoA - pesoB;
          return a.text.localeCompare(b.text);
        });

        return (
          <div className="flex flex-wrap gap-2 pl-[154px]">
            {todosItens.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-1.5 rounded border bg-zinc-900 px-2 py-1 text-sm text-zinc-100 max-w-full"
                style={{ borderColor: obterCorBadge(item.text) }}
                title={item.isExtra ? "Fornecido por uma Regra (não pode ser apagado)" : undefined}
              >
                <span className="break-all">{item.text}</span>
                {!item.isExtra && (
                  <button
                    onClick={() => setItens(itens.filter((_, j) => j !== item.originalIndex))}
                    className="px-0.5 text-zinc-500 transition hover:text-green-500"
                    title="Remover"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}
