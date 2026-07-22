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
  const { atributos, setAtributos, bonusAtributos, setBonusAtributos, bloquearLetras } = useRPG();

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
            value={atributos[nome]}
            onChange={(e) => setAtributos({ ...atributos, [nome]: Number(e.target.value) })}
            className="-mt-0.5 w-full bg-transparent text-center text-2xl font-bold text-zinc-100 outline-none"
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
  const { defesaTotal, defEquip, setDefEquip, defOutros, setDefOutros, bloquearLetras, periciasHook, atributos, regrasAutomaticasAtivas } = useRPG();

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
      const total = 10 + atributos.AGI + pericias[nomeReflexos].treino + pericias[nomeReflexos].outros;
      setEsquiva(total);
    }
  }, [periciasHook, atributos]);

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
                  // REGRA 4 e 12: +2 na defesa
                  const defOutrosBonusRegra = (regrasAutomaticasAtivas.has(4) || regrasAutomaticasAtivas.has(12)) ? 2 : 0;
                  return defOutros + defOutrosBonusRegra || '';
                })()}
                placeholder="0"
                title="Outros bônus de defesa"
                onChange={e => {
                  const valDigitado = Math.max(0, Number(e.target.value));
                  const defOutrosBonusRegra = (regrasAutomaticasAtivas.has(4) || regrasAutomaticasAtivas.has(12)) ? 2 : 0;
                  setDefOutros(Math.max(0, valDigitado - defOutrosBonusRegra));
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
    regrasAutomaticasAtivas, atributos, poderesHook, rituaisHook, periciasHook
  } = useRPG();
  const [mostrarOutros, setMostrarOutros] = React.useState(false);

  const resistenciasExtras = [];
  
  // REGRA 5: Resistência Mental +INT
  if (regrasAutomaticasAtivas.has(5)) {
    resistenciasExtras.push(`Mental ${atributos.INT}`);
  }
  // REGRA 9: Dano 2
  if (regrasAutomaticasAtivas.has(9)) {
    resistenciasExtras.push('Dano 2');
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

  // REGRA 18: Resistência 10 ao elemento escolhido
  // O menu de escolha será exibido logo antes da lista de resistências
  const { elementoRegra18, setElementoRegra18 } = useRPG();
  if (regrasAutomaticasAtivas.has(18) && elementoRegra18) {
    resistenciasExtras.push(`${elementoRegra18} 10`);
  }

  // REGRA 17: Adiciona "Armas Pesadas" em Proficiências
  const proficienciasExtras = [];
  if (regrasAutomaticasAtivas.has(17)) {
    proficienciasExtras.push('Armas Pesadas');
  }

  return (
    <div className="mt-6 flex w-full flex-col gap-5">
      <BadgeBlock titulo="Proteção" itens={protecoes} setItens={setProtecoes} />

      {/* Regra 18: Seletor de Elemento */}
      {regrasAutomaticasAtivas.has(18) && (
        <div className="flex flex-col gap-1 -mt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Escolha o Elemento (Regra 18):</span>
          <select 
            value={elementoRegra18 || ''} 
            onChange={e => setElementoRegra18(e.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm font-bold text-zinc-300 outline-none hover:border-red-900 focus:border-red-600 focus:bg-black"
          >
            <option value="" disabled>Selecione um elemento...</option>
            <option value="Conhecimento">Conhecimento</option>
            <option value="Energia">Energia</option>
            <option value="Morte">Morte</option>
            <option value="Sangue">Sangue</option>
            <option value="Medo">Medo</option>
          </select>
        </div>
      )}

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
          <BadgeBlock titulo="Imunidades" itens={imunidades} setItens={setImunidades} />
          <BadgeBlock titulo="Sentidos" itens={sentidos} setItens={setSentidos} />
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
      {(itens.length > 0 || itensExtras.length > 0) && (
        <div className="flex flex-wrap gap-2 pl-[154px]">
          {itensExtras.map((item, i) => (
            <div
              key={`extra-${i}`}
              className="flex items-center gap-1.5 rounded border bg-zinc-900 px-2 py-1 text-sm text-zinc-100 max-w-full"
              style={{ borderColor: obterCorBadge(item) }}
              title="Fornecido por uma Regra (não pode ser apagado, mas você pode adicionar outros selos para somar)"
            >
              <span className="break-all">{item}</span>
            </div>
          ))}
          {itens.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 rounded border bg-zinc-900 px-2 py-1 text-sm text-zinc-100 max-w-full"
              style={{ borderColor: obterCorBadge(item) }}
            >
              <span className="break-all">{item}</span>
              <button
                onClick={() => setItens(itens.filter((_, j) => j !== i))}
                className="px-0.5 text-zinc-500 transition hover:text-red-500"
                title="Remover"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
