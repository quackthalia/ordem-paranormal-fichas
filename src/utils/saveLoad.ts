export function exportarFicha(rpg: any) {
  const data = {
    // Context State
    classe: rpg.classe,
    nex: rpg.nex,
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
    skillCombatente1: rpg.skillCombatente1,
    skillCombatente2: rpg.skillCombatente2,
    deslocM: rpg.deslocM,
    deslocQ: rpg.deslocQ,
    bonusDadosCondicionais: rpg.bonusDadosCondicionais,
    bonusDadosAtivos: rpg.bonusDadosAtivos,
    regras: rpg.regras,
    nivel: rpg.nivel,
    versaoRitual: rpg.versaoRitual,
    elementoRitual: rpg.elementoRitual,
    afinidadeEscolhida: rpg.afinidadeEscolhida,
    poderesExtras: rpg.poderesExtras,
    progressaoNexRecusados: rpg.progressaoNexRecusados,
    progressaoNexEditados: rpg.progressaoNexEditados,
    elementoRegra18: rpg.elementoRegra18,
    escolhaRegra53: rpg.escolhaRegra53,
    nomeEditando: rpg.nomeEditando,

    // Status Hook
    status: {
      pvAtual: rpg.status.pvAtual,
      pvMax: rpg.status.pvMax,
      sanAtual: rpg.status.sanAtual,
      sanMax: rpg.status.sanMax,
      peAtual: rpg.status.peAtual,
      peMax: rpg.status.peMax,
      pdAtual: rpg.status.pdAtual,
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
    poderesEscolhidos: rpg.poderesHook.poderesEscolhidos,
    origemSelecionada: rpg.origensHook.origemSelecionada,
    poderOrigemEditado: rpg.origensHook.poderOrigemEditado,
    rituaisAprendidos: rpg.rituaisHook.rituaisAprendidos,
    
    // Inventario
    armasInventario: rpg.armasHook.armasInventario,
    protecoesInventario: rpg.protecoesHook.protecoesInventario,
    municoesInventario: rpg.municoesHook.municoesInventario,
    itensInventario: rpg.itensHook.itensInventario,
    itensAmaldicoadosInventario: rpg.itensAmaldicoadosHook.itensAmaldicoadosInventario,
    
    // Modificacoes
    modificacoesAtivas: rpg.modificacoesHook.modificacoesAtivas,

    // Trilhas
    trilhaSelecionada: rpg.trilhasHook.trilhaSelecionada,
    habilidadesTrilhaEditadas: rpg.trilhasHook.habilidadesTrilhaEditadas,
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

      if (data.classe !== undefined) rpg.setClasse(data.classe);
      if (data.nex !== undefined) rpg.setNex(data.nex);
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
      if (data.skillCombatente1 !== undefined) rpg.setSkillCombatente1(data.skillCombatente1);
      if (data.skillCombatente2 !== undefined) rpg.setSkillCombatente2(data.skillCombatente2);
      if (data.deslocM !== undefined) rpg.setDeslocM(data.deslocM);
      if (data.deslocQ !== undefined) rpg.setDeslocQ(data.deslocQ);
      if (data.bonusDadosCondicionais !== undefined) rpg.setBonusDadosCondicionais(data.bonusDadosCondicionais);
      if (data.bonusDadosAtivos !== undefined) rpg.setBonusDadosAtivos(data.bonusDadosAtivos);
      if (data.nivel !== undefined) rpg.setNivel(data.nivel);
      if (data.versaoRitual !== undefined) rpg.setVersaoRitual(data.versaoRitual);
      if (data.elementoRitual !== undefined) rpg.setElementoRitual(data.elementoRitual);
      if (data.afinidadeEscolhida !== undefined) rpg.setAfinidadeEscolhida(data.afinidadeEscolhida);
      if (data.poderesExtras !== undefined) rpg.setPoderesExtras(data.poderesExtras);
      if (data.progressaoNexRecusados !== undefined) rpg.setProgressaoNexRecusados(data.progressaoNexRecusados);
      if (data.progressaoNexEditados !== undefined) rpg.setProgressaoNexEditados(data.progressaoNexEditados);
      if (data.elementoRegra18 !== undefined) rpg.setElementoRegra18(data.elementoRegra18);
      if (data.escolhaRegra53 !== undefined) rpg.setEscolhaRegra53(data.escolhaRegra53);
      if (data.nomeEditando !== undefined) rpg.setNomeEditando(data.nomeEditando);

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

      if (data.periciasStatus !== undefined) rpg.periciasHook.setPericiasStatus(data.periciasStatus);
      if (data.poderesEscolhidos !== undefined) rpg.poderesHook.setPoderesEscolhidos(data.poderesEscolhidos);
      if (data.origemSelecionada !== undefined) rpg.origensHook.setOrigemSelecionada(data.origemSelecionada);
      if (data.poderOrigemEditado !== undefined) rpg.origensHook.setPoderOrigemEditado(data.poderOrigemEditado);
      if (data.rituaisAprendidos !== undefined) rpg.rituaisHook.setRituaisAprendidos(data.rituaisAprendidos);
      
      if (data.armasInventario !== undefined) rpg.armasHook.setArmasInventario(data.armasInventario);
      if (data.protecoesInventario !== undefined) rpg.protecoesHook.setProtecoesInventario(data.protecoesInventario);
      if (data.municoesInventario !== undefined) rpg.municoesHook.setMunicoesInventario(data.municoesInventario);
      if (data.itensInventario !== undefined) rpg.itensHook.setItensInventario(data.itensInventario);
      if (data.itensAmaldicoadosInventario !== undefined) rpg.itensAmaldicoadosHook.setItensAmaldicoadosInventario(data.itensAmaldicoadosInventario);
      
      if (data.modificacoesAtivas !== undefined) rpg.modificacoesHook.setModificacoesAtivas(data.modificacoesAtivas);
      if (data.trilhaSelecionada !== undefined) rpg.trilhasHook.setTrilhaSelecionada(data.trilhaSelecionada);
      if (data.habilidadesTrilhaEditadas !== undefined) rpg.trilhasHook.setHabilidadesTrilhaEditadas(data.habilidadesTrilhaEditadas);

      alert('Ficha carregada com sucesso!');
    } catch (err) {
      alert('Erro ao carregar o arquivo da ficha. ' + String(err));
    }
  };
  reader.readAsText(file);
}
