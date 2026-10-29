import type { AgenteSalvo } from '../types';

const LOCAL_STORAGE_KEY = 'ordem_paranormal_agentes_v1';

export function formatarDataRegistro(date: Date = new Date()): string {
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = String(date.getFullYear()).slice(-2);
  return `${dia}/${mes}/${ano}`;
}

export function gerarIdAgente(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `agente_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializarFicha(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rpg: any,
  overrides?: {
    id?: string;
    criadoEm?: string;
    dataRegistro?: string;
    nomePersonagem?: string;
    nomeJogador?: string;
    fotoPersonagem?: string;
  }
): AgenteSalvo {
  const agoraIso = new Date().toISOString();
  const id = overrides?.id || rpg.agenteId || gerarIdAgente();
  const criadoEm = overrides?.criadoEm || rpg.agenteCriadoEm || agoraIso;
  const dataRegistro =
    overrides?.dataRegistro ||
    rpg.agenteDataRegistro ||
    formatarDataRegistro(new Date(criadoEm));

  const nomePersonagem =
    overrides?.nomePersonagem !== undefined
      ? overrides.nomePersonagem
      : rpg.nomePersonagem || rpg.nomeEditando || '';
  const nomeJogador =
    overrides?.nomeJogador !== undefined
      ? overrides.nomeJogador
      : rpg.nomeJogador || '';
  const fotoPersonagem =
    overrides?.fotoPersonagem !== undefined
      ? overrides.fotoPersonagem
      : rpg.fotoPersonagem || '';

  return {
    id,
    criadoEm,
    atualizadoEm: agoraIso,
    dataRegistro,

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
    nomePersonagem,
    nomeJogador,
    fotoPersonagem,
    nomeEditando: nomePersonagem,

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
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function aplicarFichaNoContexto(data: any, rpg: any) {
  const temRegra83NoSave =
    data.origemSelecionada?.Codigo_Regra === 83 ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.values(data.poderesEscolhidos || {}).some((p: any) => p?.codigoRegra === 83);

  if (data.id !== undefined) rpg.setAgenteId?.(data.id);
  if (data.criadoEm !== undefined) rpg.setAgenteCriadoEm?.(data.criadoEm);
  if (data.dataRegistro !== undefined) rpg.setAgenteDataRegistro?.(data.dataRegistro);

  rpg.setClasse(data.classe ?? null);
  if (data.rawNex !== undefined) {
    rpg.setNex(data.rawNex);
  } else if (data.nex !== undefined) {
    rpg.setNex(temRegra83NoSave ? Math.max(0, data.nex - 5) : data.nex);
  } else {
    rpg.setNex(5);
  }

  rpg.setAtributos(data.atributos ?? { FOR: 1, AGI: 1, INT: 1, PRE: 1, VIG: 1 });
  rpg.setBonusAtributos(data.bonusAtributos ?? { FOR: 0, AGI: 0, INT: 0, PRE: 0, VIG: 0 });
  rpg.setDefEquip(data.defEquip ?? 0);
  rpg.setDefOutros(data.defOutros ?? 0);
  rpg.setBloqueioData(data.bloqueioData ?? { base: 0, bonusVig: false });
  rpg.setProtecoes(data.protecoes ?? []);
  rpg.setSentidos(data.sentidos ?? []);
  rpg.setImunidades(data.imunidades ?? []);
  rpg.setVulnerabilidades(data.vulnerabilidades ?? []);
  rpg.setResistencias(data.resistencias ?? []);
  rpg.setProficiencias(data.proficiencias ?? []);
  rpg.setRegrasAtivas(data.regrasAtivas ?? true);
  rpg.setRegrasAtivasAtributos?.(data.regrasAtivasAtributos ?? true);
  rpg.setSkillCombatente1(data.skillCombatente1 ?? '');
  rpg.setSkillCombatente2(data.skillCombatente2 ?? '');
  rpg.setDeslocM(data.deslocM ?? 9);
  rpg.setDeslocQ(data.deslocQ ?? 6);
  rpg.setBonusDadosCondicionais(data.bonusDadosCondicionais ?? '');
  rpg.setBonusDadosAtivos(data.bonusDadosAtivos ?? '');

  if (data.rawNivel !== undefined) {
    rpg.setNivel(data.rawNivel);
  } else if (data.nivel !== undefined) {
    rpg.setNivel(temRegra83NoSave ? Math.max(1, data.nivel - 1) : data.nivel);
  } else {
    rpg.setNivel(1);
  }

  rpg.setVersaoRitual(data.versaoRitual ?? {});
  rpg.setElementoRitual(data.elementoRitual ?? {});
  rpg.setAfinidadeEscolhida(data.afinidadeEscolhida ?? null);
  rpg.setPoderesExtras(data.poderesExtras ?? {});
  rpg.setProgressaoNexRecusados(data.progressaoNexRecusados ?? []);
  rpg.setProgressaoNexEditados(data.progressaoNexEditados ?? {});
  rpg.setElementoRegra18(data.elementoRegra18 ?? null);
  rpg.setEscolhaRegra53(data.escolhaRegra53 ?? null);

  const nomeFinal = data.nomePersonagem ?? data.nomeEditando ?? '';
  rpg.setNomePersonagem?.(nomeFinal);
  rpg.setNomeEditando?.(nomeFinal);
  rpg.setNomeJogador?.(data.nomeJogador ?? '');
  rpg.setFotoPersonagem?.(data.fotoPersonagem ?? '');

  if (rpg.setRegras) {
    rpg.setRegras(data.regras ?? {});
  }

  if (data.status) {
    rpg.status.marcarStatusCarregado?.();
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

  if (data.periciasStatus !== undefined && Object.keys(data.periciasStatus).length > 0) {
    rpg.periciasHook.marcarPericiasCarregadas?.();
    rpg.periciasHook.setPericiasStatus?.(data.periciasStatus);
  }
  rpg.periciasHook.setJaTinhaProfissao33?.(data.jaTinhaProfissao33 ?? false);
  rpg.periciasHook.setAvaliouRegra33?.(data.avaliouRegra33 ?? false);
  rpg.periciasHook.setJaTinhaPericiaPoder?.(data.jaTinhaPericiaPoder ?? {});
  rpg.periciasHook.setAvaliouPericiaPoder?.(data.avaliouPericiaPoder ?? {});
  rpg.periciasHook.setProfissoes?.(data.profissoes ?? []);

  rpg.poderesHook.setPoderesEscolhidos?.(data.poderesEscolhidos ?? {});
  rpg.origensHook.setOrigemSelecionada?.(data.origemSelecionada ?? null);

  const rituaisSalvos = data.rituaisAprendidos ?? [];
  if (rpg.rituaisHook.setRituaisAprendidos) {
    rpg.rituaisHook.setRituaisAprendidos(rituaisSalvos);
  } else if (rpg.rituaisHook.atualizarRituaisAprendidos) {
    rpg.rituaisHook.atualizarRituaisAprendidos(() => rituaisSalvos);
  }

  rpg.inventarioHook?.setPrestigio?.(data.prestigio ?? 0);
  rpg.inventarioHook?.setCreditoOverride?.(data.creditoOverride ?? null);
  rpg.inventarioHook?.setLimitesItensOverride?.(data.limitesItensOverride ?? null);

  rpg.armasHook.setArmasInventario?.(data.armasInventario ?? []);
  rpg.protecoesHook.setProtecoesInventario?.(data.protecoesInventario ?? []);
  rpg.municoesHook.setMunicoesInventario?.(data.municoesInventario ?? []);
  rpg.itensHook.setItensInventario?.(data.itensInventario ?? []);
  rpg.itensAmaldicoadosHook.setItensAmaldicoadosInventario?.(data.itensAmaldicoadosInventario ?? []);

  rpg.trilhasHook.setTrilhaSelecionada?.(data.trilhaSelecionada ?? null);
  rpg.trilhasHook.setVersatilidadeSelecionada?.(data.versatilidadeSelecionada ?? null);
}

// ============================================================
// ARMAZENAMENTO LOCAL (PASTA ./agentes + FALLBACK LOCALSTORAGE)
// ============================================================

function lerCacheLocal(): AgenteSalvo[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function salvarCacheLocal(agentes: AgenteSalvo[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(agentes));
  } catch (err) {
    console.warn('Não foi possível salvar no localStorage:', err);
  }
}

export async function listarAgentesLocais(): Promise<AgenteSalvo[]> {
  try {
    const resp = await fetch('/api/agentes');
    if (resp.ok) {
      const lista = await resp.json();
      if (Array.isArray(lista)) {
        salvarCacheLocal(lista);
        return lista;
      }
    }
  } catch {
    // Fallback para cache local caso fora do servidor de dev
  }
  return lerCacheLocal();
}

export async function salvarAgenteLocal(agente: AgenteSalvo): Promise<void> {
  // Atualiza cache local imediatamente
  const atuais = lerCacheLocal();
  const idx = atuais.findIndex(a => a.id === agente.id);
  if (idx >= 0) {
    atuais[idx] = agente;
  } else {
    atuais.unshift(agente);
  }
  salvarCacheLocal(atuais);

  // Salva fisicamente na pasta ./agentes via API local
  try {
    await fetch('/api/agentes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agente),
    });
  } catch {
    // Silencioso caso rode sem backend (mantido no localStorage)
  }
}

export async function excluirAgenteLocal(id: string): Promise<void> {
  const atuais = lerCacheLocal().filter(a => a.id !== id);
  salvarCacheLocal(atuais);

  try {
    await fetch(`/api/agentes?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  } catch {
    // Silencioso
  }
}

// ============================================================
// EXPORTAR / IMPORTAR ARQUIVO JSON AVULSO
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportarFicha(rpg: any, dadosDiretos?: AgenteSalvo) {
  const data = dadosDiretos || serializarFicha(rpg);
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const slugNome = (data.nomePersonagem || 'agente')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_|_$/g, '');
  a.download = `ficha_${slugNome || 'ordem_paranormal'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function importarFicha(event: React.ChangeEvent<HTMLInputElement>, rpg: any) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target?.result as string);
      if (!data.id) data.id = gerarIdAgente();
      if (!data.criadoEm) data.criadoEm = new Date().toISOString();
      if (!data.dataRegistro) data.dataRegistro = formatarDataRegistro();

      aplicarFichaNoContexto(data, rpg);
      await salvarAgenteLocal(data);
      await rpg.recarregarAgentes?.();
    } catch (err) {
      alert('Erro ao carregar o arquivo da ficha. ' + String(err));
    }
  };
  reader.readAsText(file);
}

// ============================================================
// UTILITÁRIO PARA REDIMENSIONAR FOTO DE UPLOAD
// ============================================================
export function comprimirImagemParaAvatar(file: File, maxDim = 480): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler arquivo de imagem'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(String(reader.result || ''));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result || ''));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/webp', 0.86));
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  });
}
