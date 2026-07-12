import React, { useRef, useEffect } from 'react';
import { useRPG } from '../../context/RPGContext';
import { StatusPanel } from './StatusPanel';
import { PericiasTable } from './PericiasTable';
import { AbasPanel } from './AbasPanel';
import { ModalPoderes } from '../../components/ModalPoderes';
import { obterCorBadge } from '../../utils/rpgRules';

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
    <div className="w-full px-2 md:px-5">
      <h2 className="font-display mb-10 text-center text-2xl uppercase tracking-[0.2em] text-zinc-100">
        Ficha de <span className="text-red-500">{classe}</span>
      </h2>

      <div className="flex w-full flex-wrap justify-between gap-5">
        {/* COLUNA ESQUERDA: Atributos + Status + Defesa + Proteções */}
        <div className="min-w-[340px] flex-[1_1_30%]">
          <AtributosFicha />
          <StatusPanel />
          <DefesaPanel />
          <ProtecoesPanel />
        </div>

        {/* COLUNA MEIO: Perícias */}
        <div className="min-w-[340px] flex-[1_1_32%]">
          <PericiasTable />
        </div>

        {/* COLUNA DIREITA: Abas (Combate, Habilidades, Rituais...) */}
        <div className="min-w-[340px] flex-[1_1_34%]">
          <AbasPanel />
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
  const { defesaTotal, defEquip, setDefEquip, defOutros, setDefOutros, bloquearLetras, periciasHook, atributos } = useRPG();

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
            <input
              type="number"
              onKeyDown={bloquearLetras}
              value={defEquip || ''}
              placeholder="0"
              title="Defesa de equipamento"
              onChange={e => setDefEquip(Math.max(0, Number(e.target.value)))}
              className="w-10 border-b border-zinc-600 bg-transparent text-center font-bold text-zinc-100 outline-none focus:border-red-600"
            />
            +
            <input
              type="number"
              onKeyDown={bloquearLetras}
              value={defOutros || ''}
              placeholder="0"
              title="Outros bônus de defesa"
              onChange={e => setDefOutros(Math.max(0, Number(e.target.value)))}
              className="w-10 border-b border-zinc-600 bg-transparent text-center font-bold text-zinc-100 outline-none focus:border-red-600"
            />
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
  } = useRPG();

  return (
    <div className="mt-6 flex w-full flex-col gap-5">
      <BadgeBlock titulo="Proteção" itens={protecoes} setItens={setProtecoes} />
      <BadgeBlock titulo="Resistências" itens={resistencias} setItens={setResistencias} />
      <BadgeBlock titulo="Proficiências" itens={proficiencias} setItens={setProficiencias} />
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
}: {
  titulo: string;
  itens: string[];
  setItens: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [inputValue, setInputValue] = React.useState('');

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2.5">
        <span className="min-w-28 text-xs font-bold uppercase tracking-wider text-zinc-500">{titulo}</span>
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
      {itens.length > 0 && (
        <div className="flex flex-wrap gap-2 pl-[124px]">
          {itens.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 rounded border bg-zinc-900 px-2 py-1 text-sm text-zinc-100"
              style={{ borderColor: obterCorBadge(item) }}
            >
              <span>{item}</span>
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
