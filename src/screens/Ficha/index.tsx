import React, { useRef, useEffect } from 'react';
import { useRPG } from '../../context/RPGContext';
import { StatusPanel } from './StatusPanel';
import { PericiasTable } from './PericiasTable';
import { AbasPanel } from './AbasPanel';
import { ModalPoderes } from '../../components/ModalPoderes';
import { obterCorBadge } from '../../utils/rpgRules';
import { CharacterHeader } from './CharacterHeader';

export const FichaScreen: React.FC = () => {
  const {
    classe,
    setBonusAtributos,
    setTelaAtual,
    status,
    setSkillCombatente1,
    setSkillCombatente2,
    nexModalAberto,
    nexPoderEditando,
  } = useRPG();

  const handleRefazer = () => {
    status.resetarStatus();
    setBonusAtributos({ FOR: 0, AGI: 0, INT: 0, PRE: 0, VIG: 0 });
    setSkillCombatente1('');
    setSkillCombatente2('');
    setTelaAtual('atributos');
  };

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col">
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
        <div className="relative min-w-[320px] flex-[1_1_34%]">
          <div className="absolute inset-0 pb-10 pt-[22px]">
            <AbasPanel />
          </div>
        </div>
      </div>

      <button
        onClick={handleRefazer}
        className="mt-12 w-full rounded-md border border-zinc-800 bg-zinc-900 p-3.5 font-bold uppercase tracking-wider text-zinc-400 transition hover:border-red-900 hover:text-red-500"
      >
        Refazer Personagem
      </button>

      {(nexModalAberto !== null || nexPoderEditando !== null) && <ModalPoderes />}
    </div>
  );
};

// ============================================================
// COMPONENTE INTERNO: ATRIBUTOS NA FICHA
// ============================================================
function AtributosFicha() {
  const { atributos, setAtributos, bonusAtributos, setBonusAtributos, bloquearLetras, atributosFinais } = useRPG();

  return (
    <div className="mb-8 flex flex-wrap justify-center gap-5">
      {(Object.keys(atributos) as Array<keyof typeof atributos>).map(nome => (
        <div
          key={nome}
          className="relative flex h-[72px] w-[72px] flex-col items-center justify-center rounded-full border-2 border-zinc-700 bg-zinc-900/60"
        >
          <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-amber-500 bg-zinc-950" title="Bônus temporário">
            <input
              type="number"
              onKeyDown={bloquearLetras}
              value={bonusAtributos[nome]}
              onChange={(e) =>
                setBonusAtributos({ ...bonusAtributos, [nome]: Math.max(0, Number(e.target.value)) })
              }
              className="w-full bg-transparent text-center text-xs font-bold text-amber-400 outline-none"
            />
          </div>
          <span className="mt-2.5 text-xs font-bold text-zinc-500">{nome}</span>
          <input
            type="number"
            onKeyDown={bloquearLetras}
            value={atributosFinais[nome]}
            onChange={(e) => {
              const diferenca = atributosFinais[nome] - atributos[nome];
              setAtributos({ ...atributos, [nome]: Number(e.target.value) - diferenca });
            }}
            className={`-mt-0.5 w-full bg-transparent text-center text-2xl font-bold outline-none ${atributosFinais[nome] > (atributos[nome] + bonusAtributos[nome]) ? 'text-red-500' : 'text-zinc-100'}`}
          />
        </div>
      ))}
    </div>
  );
}

// ============================================================
// COMPONENTE INTERNO: DEFESA
// ============================================================
function DefesaPanel() {
  const { defesaTotal, defEquip, setDefEquip, defOutros, setDefOutros, bloquearLetras, periciasHook, atributosFinais, regrasAutomaticasAtivas, protecoes, protecoesHook, totalDefesaProtecoes } = useRPG();

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
      const total = pericias[nomeFortitude].treino + pericias[nomeFortitude].outros;
      setBloqueio(total);
    }

    // Reflexos
    const nomeReflexos = nomesPericias[23];
    if (nomeReflexos && pericias[nomeReflexos] && !esquivaOverride.current) {
      const total = defesaTotal + pericias[nomeReflexos].treino + pericias[nomeReflexos].outros;
      setEsquiva(total);
    }
  }, [periciasHook, atributosFinais, defesaTotal]);

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
                className="w-10 border-b border-zinc-600 bg-transparent text-center font-bold text-zinc-100 outline-none focus:border-red-600"
              />
              <span className="absolute top-full text-[9px] uppercase tracking-wider text-zinc-500 mt-0.5">Equip.</span>
            </div>
            +
            <div className="relative flex flex-col items-center">
              <input
                type="number"
                onKeyDown={bloquearLetras}
                value={(() => {
                  const defOutrosBonusRegra = (regrasAutomaticasAtivas.has(4) ? 2 : 0) + (regrasAutomaticasAtivas.has(12) ? 2 : 0);
                  const temProtecaoPesada = protecoesHook?.protecoesInventario.some(p => p.equipado && p.protecao.Proficiencia?.toLowerCase().includes('pesada')) || false;
                  const bonusRegra21 = (regrasAutomaticasAtivas.has(21) && temProtecaoPesada) ? 2 : 0;
                  const temProtecaoLeve = protecoesHook?.protecoesInventario.some(p => p.equipado && p.protecao.Proficiencia?.toLowerCase().includes('leve')) || false;
                  const bonusRegra25 = (regrasAutomaticasAtivas.has(25) && temProtecaoLeve) ? 2 : 0;
                  return defOutros + defOutrosBonusRegra + bonusRegra21 + bonusRegra25 + totalDefesaProtecoes || '';
                })()}
                placeholder="0"
                title="Outros bônus de defesa"
                onChange={e => {
                  const valDigitado = Math.max(0, Number(e.target.value));
                  const defOutrosBonusRegra = (regrasAutomaticasAtivas.has(4) ? 2 : 0) + (regrasAutomaticasAtivas.has(12) ? 2 : 0);
                  const temProtecaoPesada = protecoesHook?.protecoesInventario.some(p => p.equipado && p.protecao.Proficiencia?.toLowerCase().includes('pesada')) || false;
                  const bonusRegra21 = (regrasAutomaticasAtivas.has(21) && temProtecaoPesada) ? 2 : 0;
                  const temProtecaoLeve = protecoesHook?.protecoesInventario.some(p => p.equipado && p.protecao.Proficiencia?.toLowerCase().includes('leve')) || false;
                  const bonusRegra25 = (regrasAutomaticasAtivas.has(25) && temProtecaoLeve) ? 2 : 0;
                  setDefOutros(Math.max(0, valDigitado - defOutrosBonusRegra - bonusRegra21 - bonusRegra25 - totalDefesaProtecoes));
                }}
                className="w-10 border-b border-zinc-600 bg-transparent text-center font-bold text-zinc-100 outline-none focus:border-red-600"
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
          className="mt-1 w-12 border-b border-zinc-600 bg-transparent text-center text-lg font-bold text-zinc-100 outline-none focus:border-red-600"
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
          className="mt-1 w-12 border-b border-zinc-600 bg-transparent text-center text-lg font-bold text-zinc-100 outline-none focus:border-red-600"
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
    regrasAutomaticasAtivas, atributosFinais, poderesHook, rituaisHook, periciasHook, status,
    protecoesHook, modificacoesHook
  } = useRPG();
  const [mostrarOutros, setMostrarOutros] = React.useState(false);

  const protecoesExtras: string[] = [];
  const resistenciasExtras: string[] = [];
  
  // REGRA 5: Resistência Mental +INT
  if (regrasAutomaticasAtivas.has(5) && atributosFinais.INT > 0) {
    resistenciasExtras.push(`Mental ${atributosFinais.INT}`);
  }
  // REGRA 9 e 60: Resistência a Dano
  let danoResist = 0;
  if (regrasAutomaticasAtivas.has(9)) {
    danoResist += 2;
  }
  if (regrasAutomaticasAtivas.has(60)) {
    const machucado = status.pvAtual !== null && status.pvMax > 0 && status.pvAtual <= Math.floor(status.pvMax / 2);
    if (machucado) {
      danoResist += 5;
    }
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
  const elementoRegra18 = poderesRegra18[0]?.elemento;

  if (regrasAutomaticasAtivas.has(18) && elementoRegra18) {
    const temAfinidade = regrasAutomaticasAtivas.has(19) || poderesRegra18.length >= 2;
    const valorResistencia = temAfinidade ? 20 : 10;
    resistenciasExtras.push(`${elementoRegra18} ${valorResistencia}`);
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

  return (
    <div className="mt-6 flex w-full flex-col gap-5">
      <BadgeBlock titulo="Proteção" itens={protecoes} setItens={setProtecoes} itensExtras={protecoesExtras} />

      <BadgeBlock titulo="Resistências" itens={resistencias} setItens={setResistencias} itensExtras={resistenciasExtras} />
      <BadgeBlock titulo="Proficiências" itens={proficiencias} setItens={setProficiencias} itensExtras={proficienciasExtras} />
      
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

      {mostrarOutros && (
        <div className="flex flex-col gap-5">
          <BadgeBlock titulo="Vulnerabilidades" itens={vulnerabilidades} setItens={setVulnerabilidades} />
          <BadgeBlock titulo="Imunidades" itens={imunidades} setItens={setImunidades} itensExtras={imunidadesExtras} />
          <BadgeBlock titulo="Sentidos" itens={sentidos} setItens={setSentidos} itensExtras={sentidosExtras} />
        </div>
      )}
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
          className="flex-1 border-b border-zinc-800 bg-transparent py-1 text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-red-700"
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
                    className="px-0.5 text-zinc-500 transition hover:text-red-500"
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
