export function exportarFicha(rpg: any) {
  const data = {
    // Context State
    classe: rpg.classe,
    nex: rpg.rawNex ?? rpg.nex,
    rawNex: rpg.rawNex ?? rpg.nex,
    atributos: rpg.atributos,
    bonusAtributos: rpg.bonusAtributos,
    defEquip: rpg.defEquip,
    defOutros: rpg.defOutros,
    bloqueioData: rpg.bloqueioData,
    protecoes: rpg.protecoes,
    sentidos: rpg.sentidos,
    imunidades: rpg.imunidades,
    vulnerabilidades: rpg.vulnerabilidades,
    resistencias: rpg.resistencias,
    proficiencias: rpg.proficiencias,
    regrasAtivas: rpg.regrasAtivas,
    regrasAtivasAtributos: rpg.regrasAtivasAtributos,
    skillCombatente1: rpg.skillCombatente1,
    skillCombatente2: rpg.skillCombatente2,
    deslocM: rpg.deslocM,
    deslocQ: rpg.deslocQ,
    bonusDadosCondicionais: rpg.bonusDadosCondicionais,
    bonusDadosAtivos: rpg.bonusDadosAtivos,
    regras: rpg.regras,
    nivel: rpg.rawNivel ?? rpg.nivel,
    rawNivel: rpg.rawNivel ?? rpg.nivel,
    versaoRitual: rpg.versaoRitual,
    elementoRitual: rpg.elementoRitual,
    afinidadeEscolhida: rpg.afinidadeEscolhida,
    poderesExtras: rpg.poderesExtras,
    progressaoNexRecusados: rpg.progressaoNexRecusados,
    progressaoNexEditados: rpg.progressaoNexEditados,
    elementoRegra18: rpg.elementoRegra18,
    escolhaRegra53: rpg.escolhaRegra53,
    nomePersonagem: rpg.nomePersonagem || rpg.nomeEditando || '',
    nomeJogador: rpg.nomeJogador || '',
    nomeEditando: rpg.nomePersonagem || rpg.nomeEditando || '',

    // Status Hook
    status: {
      pvAtual: rpg.status.pvAtual,
      pvMax: rpg.status.pvMax,
      sanAtual: rpg.status.sanAtual,
      sanMax: rpg.status.sanMax,
      peAtual: rpg.status.peAtual,
      peMax: rpg.status.peMax,
      pdAtual: rpg.status.pdAtual,
      ppAtual: rpg.status.ppAtual,
      pdMax: rpg.status.pdMax,
      hasPdTemp: rpg.status.hasPdTemp,
      pdTempAtual: rpg.status.pdTempAtual,
      pdTempMax: rpg.status.pdTempMax,
      hasPvTemp: rpg.status.hasPvTemp,
      pvTempAtual: rpg.status.pvTempAtual,
      pvTempMax: rpg.status.pvTempMax,
      hasPeTemp: rpg.status.hasPeTemp,
      peTempAtual: rpg.status.peTempAtual,
      peTempMax: rpg.status.peTempMax,
    },

    // Outros Hooks
    periciasStatus: rpg.periciasHook.periciasStatus,
    jaTinhaProfissao33: rpg.periciasHook.jaTinhaProfissao33,
    avaliouRegra33: rpg.periciasHook.avaliouRegra33,
    jaTinhaPericiaPoder: rpg.periciasHook.jaTinhaPericiaPoder,
    avaliouPericiaPoder: rpg.periciasHook.avaliouPericiaPoder,
    profissoes: rpg.periciasHook.profissoes,
    poderesEscolhidos: rpg.poderesHook.poderesEscolhidos,
    origemSelecionada: rpg.origensHook.origemSelecionada,
    rituaisAprendidos: rpg.rituaisHook.rituaisAprendidos,

    // Inventario & Prestigio
    prestigio: rpg.inventarioHook?.prestigio,
    creditoOverride: rpg.inventarioHook?.creditoOverride,
    limitesItensOverride: rpg.inventarioHook?.limitesItensOverride,
    armasInventario: rpg.armasHook.armasInventario,
    protecoesInventario: rpg.protecoesHook.protecoesInventario,
    municoesInventario: rpg.municoesHook.municoesInventario,
    itensInventario: rpg.itensHook.itensInventario,
    itensAmaldicoadosInventario: rpg.itensAmaldicoadosHook.itensAmaldicoadosInventario,

    // Trilhas
    trilhaSelecionada: rpg.trilhasHook.trilhaSelecionada,
    versatilidadeSelecionada: rpg.trilhasHook.versatilidadeSelecionada,
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ficha_ordem_paranormal.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importarFicha(event: React.ChangeEvent<HTMLInputElement>, rpg: any) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string);

      const temRegra83NoSave =
        data.origemSelecionada?.Codigo_Regra === 83 ||
        Object.values(data.poderesEscolhidos || {}).some((p: any) => p?.codigoRegra === 83);

      if (data.classe !== undefined) rpg.setClasse(data.classe);
      if (data.rawNex !== undefined) {
        rpg.setNex(data.rawNex);
      } else if (data.nex !== undefined) {
        rpg.setNex(temRegra83NoSave ? Math.max(0, data.nex - 5) : data.nex);
      }
      if (data.atributos !== undefined) rpg.setAtributos(data.atributos);
      if (data.bonusAtributos !== undefined) rpg.setBonusAtributos(data.bonusAtributos);
      if (data.defEquip !== undefined) rpg.setDefEquip(data.defEquip);
      if (data.defOutros !== undefined) rpg.setDefOutros(data.defOutros);
      if (data.bloqueioData !== undefined) rpg.setBloqueioData(data.bloqueioData);
      if (data.protecoes !== undefined) rpg.setProtecoes(data.protecoes);
      if (data.sentidos !== undefined) rpg.setSentidos(data.sentidos);
      if (data.imunidades !== undefined) rpg.setImunidades(data.imunidades);
      if (data.vulnerabilidades !== undefined) rpg.setVulnerabilidades(data.vulnerabilidades);
      if (data.resistencias !== undefined) rpg.setResistencias(data.resistencias);
      if (data.proficiencias !== undefined) rpg.setProficiencias(data.proficiencias);
      if (data.regrasAtivas !== undefined) rpg.setRegrasAtivas(data.regrasAtivas);
      if (data.regrasAtivasAtributos !== undefined) rpg.setRegrasAtivasAtributos?.(data.regrasAtivasAtributos);
      if (data.skillCombatente1 !== undefined) rpg.setSkillCombatente1(data.skillCombatente1);
      if (data.skillCombatente2 !== undefined) rpg.setSkillCombatente2(data.skillCombatente2);
      if (data.deslocM !== undefined) rpg.setDeslocM(data.deslocM);
      if (data.deslocQ !== undefined) rpg.setDeslocQ(data.deslocQ);
      if (data.bonusDadosCondicionais !== undefined) rpg.setBonusDadosCondicionais(data.bonusDadosCondicionais);
      if (data.bonusDadosAtivos !== undefined) rpg.setBonusDadosAtivos(data.bonusDadosAtivos);
      if (data.rawNivel !== undefined) {
        rpg.setNivel(data.rawNivel);
      } else if (data.nivel !== undefined) {
        rpg.setNivel(temRegra83NoSave ? Math.max(1, data.nivel - 1) : data.nivel);
      }
      if (data.versaoRitual !== undefined) rpg.setVersaoRitual(data.versaoRitual);
      if (data.elementoRitual !== undefined) rpg.setElementoRitual(data.elementoRitual);
      if (data.afinidadeEscolhida !== undefined) rpg.setAfinidadeEscolhida(data.afinidadeEscolhida);
      if (data.poderesExtras !== undefined) rpg.setPoderesExtras(data.poderesExtras);
      if (data.progressaoNexRecusados !== undefined) rpg.setProgressaoNexRecusados(data.progressaoNexRecusados);
      if (data.progressaoNexEditados !== undefined) rpg.setProgressaoNexEditados(data.progressaoNexEditados);
      if (data.elementoRegra18 !== undefined) rpg.setElementoRegra18(data.elementoRegra18);
      if (data.escolhaRegra53 !== undefined) rpg.setEscolhaRegra53(data.escolhaRegra53);
      if (data.nomePersonagem !== undefined) {
        rpg.setNomePersonagem?.(data.nomePersonagem);
      } else if (data.nomeEditando !== undefined) {
        rpg.setNomePersonagem?.(data.nomeEditando);
      }
      if (data.nomeJogador !== undefined) {
        rpg.setNomeJogador?.(data.nomeJogador);
      }

      if (data.regras !== undefined && rpg.setRegras) {
        rpg.setRegras(data.regras);
      }

      if (data.status) {
        if (data.status.pvAtual !== undefined) rpg.status.setPvAtual(data.status.pvAtual);
        if (data.status.pvMax !== undefined) rpg.status.setPvMax(data.status.pvMax);
        if (data.status.sanAtual !== undefined) rpg.status.setSanAtual(data.status.sanAtual);
        if (data.status.sanMax !== undefined) rpg.status.setSanMax(data.status.sanMax);
        if (data.status.peAtual !== undefined) rpg.status.setPeAtual(data.status.peAtual);
        if (data.status.peMax !== undefined) rpg.status.setPeMax(data.status.peMax);
        if (data.status.pdAtual !== undefined) rpg.status.setPdAtual(data.status.pdAtual);
        if (data.status.ppAtual !== undefined) rpg.status.setPpAtual(data.status.ppAtual);
        if (data.status.pdMax !== undefined) rpg.status.setPdMax(data.status.pdMax);
        if (data.status.hasPdTemp !== undefined) rpg.status.setHasPdTemp(data.status.hasPdTemp);
        if (data.status.pdTempAtual !== undefined) rpg.status.setPdTempAtual(data.status.pdTempAtual);
        if (data.status.pdTempMax !== undefined) rpg.status.setPdTempMax(data.status.pdTempMax);
        if (data.status.hasPvTemp !== undefined) rpg.status.setHasPvTemp(data.status.hasPvTemp);
        if (data.status.pvTempAtual !== undefined) rpg.status.setPvTempAtual(data.status.pvTempAtual);
        if (data.status.pvTempMax !== undefined) rpg.status.setPvTempMax(data.status.pvTempMax);
        if (data.status.hasPeTemp !== undefined) rpg.status.setHasPeTemp(data.status.hasPeTemp);
        if (data.status.peTempAtual !== undefined) rpg.status.setPeTempAtual(data.status.peTempAtual);
        if (data.status.peTempMax !== undefined) rpg.status.setPeTempMax(data.status.peTempMax);
      }

      if (data.periciasStatus !== undefined) rpg.periciasHook.setPericiasStatus?.(data.periciasStatus);
      if (data.jaTinhaProfissao33 !== undefined) rpg.periciasHook.setJaTinhaProfissao33?.(data.jaTinhaProfissao33);
      if (data.avaliouRegra33 !== undefined) rpg.periciasHook.setAvaliouRegra33?.(data.avaliouRegra33);
      if (data.jaTinhaPericiaPoder !== undefined) rpg.periciasHook.setJaTinhaPericiaPoder?.(data.jaTinhaPericiaPoder);
      if (data.avaliouPericiaPoder !== undefined) rpg.periciasHook.setAvaliouPericiaPoder?.(data.avaliouPericiaPoder);
      if (data.profissoes !== undefined) rpg.periciasHook.setProfissoes?.(data.profissoes);
      if (data.poderesEscolhidos !== undefined) rpg.poderesHook.setPoderesEscolhidos?.(data.poderesEscolhidos);
      if (data.origemSelecionada !== undefined) rpg.origensHook.setOrigemSelecionada?.(data.origemSelecionada);
      if (data.rituaisAprendidos !== undefined) {
        if (rpg.rituaisHook.setRituaisAprendidos) rpg.rituaisHook.setRituaisAprendidos(data.rituaisAprendidos);
        else if (rpg.rituaisHook.atualizarRituaisAprendidos) rpg.rituaisHook.atualizarRituaisAprendidos(() => data.rituaisAprendidos);
      }

      if (data.prestigio !== undefined) rpg.inventarioHook?.setPrestigio?.(data.prestigio);
      if (data.creditoOverride !== undefined) rpg.inventarioHook?.setCreditoOverride?.(data.creditoOverride);
      if (data.limitesItensOverride !== undefined) rpg.inventarioHook?.setLimitesItensOverride?.(data.limitesItensOverride);

      if (data.armasInventario !== undefined) rpg.armasHook.setArmasInventario?.(data.armasInventario);
      if (data.protecoesInventario !== undefined) rpg.protecoesHook.setProtecoesInventario?.(data.protecoesInventario);
      if (data.municoesInventario !== undefined) rpg.municoesHook.setMunicoesInventario?.(data.municoesInventario);
      if (data.itensInventario !== undefined) rpg.itensHook.setItensInventario?.(data.itensInventario);
      if (data.itensAmaldicoadosInventario !== undefined) rpg.itensAmaldicoadosHook.setItensAmaldicoadosInventario?.(data.itensAmaldicoadosInventario);

      if (data.trilhaSelecionada !== undefined) rpg.trilhasHook.setTrilhaSelecionada?.(data.trilhaSelecionada);
      if (data.versatilidadeSelecionada !== undefined) rpg.trilhasHook.setVersatilidadeSelecionada?.(data.versatilidadeSelecionada);

      alert('Ficha carregada com sucesso!');
    } catch (err) {
      alert('Erro ao carregar o arquivo da ficha. ' + String(err));
    }
  };
  reader.readAsText(file);
}
