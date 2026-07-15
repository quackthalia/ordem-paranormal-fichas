import React, { useCallback } from 'react';
import { useRPG } from '../../context/RPGContext';
import { NEX_OPTIONS, CORES_ELEMENTOS, obterElementoOpressor } from '../../utils/rpgRules';
import { ModalAfinidade } from '../../components/ModalAfinidade';

const NIVEL_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1);

export const StatusPanel: React.FC = () => {
  const {
    status,
    nex,
    setNex,
    bloquearLetras,
    deslocM, setDeslocM,
    deslocQ, setDeslocQ,
    regras,
    nivel, setNivel,
    nexManual, setNexManual,
    afinidadeEscolhida, setAfinidadeEscolhida,
    afinidadeAtiva,
  } = useRPG();

  const regraNexExperiencia = regras['nex_experiencia'];
  const regraSemSanidade = regras['sem_sanidade'];

  const {
    pvAtual, pvMax, setPvMax, setPvAtual,
    sanAtual, sanMax, setSanMax, setSanAtual,
    peAtual, peMax, setPeMax, setPeAtual,
    pdAtual, pdMax, setPdMax, setPdAtual,
    hasPdTemp, setHasPdTemp,
    pdTempAtual, setPdTempAtual, pdTempMax, setPdTempMax,
    peTurno,
    hasPvTemp, setHasPvTemp,
    pvTempAtual, setPvTempAtual, pvTempMax, setPvTempMax,
    hasPeTemp, setHasPeTemp,
    peTempAtual, setPeTempAtual, peTempMax, setPeTempMax,
    alterarStatus,
  } = status;

  // 🔥 NOVA FUNÇÃO: altera valor atual considerando temporário
  const alterarPvComTemp = useCallback((qtd: number) => {
    if (qtd >= 0) {
      // Cura: vai direto pro PV atual (não afeta temporário)
      setPvAtual(prev => Math.max(0, Math.min(pvMax, (prev ?? 0) + qtd)));
    } else {
      // Dano: primeiro absorve pelo temporário
      let danoRestante = Math.abs(qtd);

      if (hasPvTemp && pvTempAtual > 0) {
        const absorvido = Math.min(pvTempAtual, danoRestante);
        setPvTempAtual(prev => Math.max(0, prev - absorvido));
        danoRestante -= absorvido;
      }

      if (danoRestante > 0) {
        setPvAtual(prev => Math.max(0, Math.min(pvMax, (prev ?? 0) - danoRestante)));
      }
    }
  }, [pvMax, hasPvTemp, pvTempAtual, setPvAtual, setPvTempAtual]);

  // 🔥 NOVA FUNÇÃO: altera PE considerando temporário
  const alterarPeComTemp = useCallback((qtd: number) => {
    if (qtd >= 0) {
      // Recuperação: vai direto pro PE atual
      setPeAtual(prev => Math.max(0, Math.min(peMax, (prev ?? 0) + qtd)));
    } else {
      // Gasto: primeiro absorve pelo temporário
      let danoRestante = Math.abs(qtd);

      if (hasPeTemp && peTempAtual > 0) {
        const absorvido = Math.min(peTempAtual, danoRestante);
        setPeTempAtual(prev => Math.max(0, prev - absorvido));
        danoRestante -= absorvido;
      }

      if (danoRestante > 0) {
        setPeAtual(prev => Math.max(0, Math.min(peMax, (prev ?? 0) - danoRestante)));
      }
    }
  }, [peMax, hasPeTemp, peTempAtual, setPeAtual, setPeTempAtual]);

  return (
    <div>
      {/* LINHA: NEX + PE/TURNO + AFINIDADE + DESLOCAMENTO */}
      <div className="mb-8 flex flex-wrap items-start gap-6 border-b border-zinc-800 pb-5">
        {/* NEX / NÍVEL (regra NEX & EXPERIÊNCIA) */}
        {regraNexExperiencia ? (
          <>
            {/* NEX MANUAL */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center rounded border border-zinc-600 bg-zinc-900 transition hover:border-red-700 focus-within:border-red-700">
                <input
                  type="number"
                  onKeyDown={bloquearLetras}
                  value={nexManual}
                  onChange={(e) => setNexManual(Math.max(0, Number(e.target.value)))}
                  className="w-14 bg-transparent px-3 py-2 text-center text-lg font-bold text-zinc-100 outline-none"
                />
                <span className="pr-2 text-lg font-bold text-zinc-500">%</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">NEX</span>
            </div>

            {/* NÍVEL */}
            <div className="flex flex-col items-center gap-1.5">
              <select
                value={nivel}
                onChange={(e) => setNivel(Number(e.target.value))}
                className="cursor-pointer appearance-none rounded border border-zinc-600 bg-zinc-900 px-3 h-9 text-center text-base font-bold text-zinc-100 transition hover:border-red-700"
              >
                {NIVEL_OPTIONS.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Nível</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <select
              value={nex}
              onChange={(e) => setNex(Number(e.target.value))}
              className="cursor-pointer appearance-none rounded border border-zinc-600 bg-zinc-900 px-3 h-9 text-center text-base font-bold text-zinc-100 transition hover:border-red-700"
            >
              {NEX_OPTIONS.map(n => (
                <option key={n} value={n}>{n}%</option>
              ))}
            </select>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">NEX</span>
          </div>
        )}

        {/* PE/TURNO */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex h-9 min-w-[3.5rem] items-center justify-center rounded border border-zinc-600 px-3 text-base font-bold text-zinc-100">
            {peTurno}
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">PE/Turno</span>
        </div>

        {/* AFINIDADE */}
        {afinidadeAtiva && afinidadeEscolhida && (
          <div className="flex flex-col items-center gap-1.5">
            <div 
              className="group relative flex h-9 cursor-help items-center justify-center rounded border px-3 text-xs font-bold uppercase tracking-wider text-zinc-100 transition"
              style={{
                borderColor: CORES_ELEMENTOS[afinidadeEscolhida.toLowerCase()] || '#888',
                backgroundColor: `${CORES_ELEMENTOS[afinidadeEscolhida.toLowerCase()] || '#888'}40`,
                color: '#ffffff'
              }}
            >
              {afinidadeEscolhida}
              <button 
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-400 opacity-0 transition hover:bg-red-900 hover:text-white group-hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); setAfinidadeEscolhida(null); }}
                title="Trocar Afinidade"
              >
                &#8634;
              </button>
              
              {/* TOOLTIP */}
              <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-72 -translate-x-1/2 rounded border border-zinc-700 bg-zinc-950 p-3 text-left text-xs font-normal text-zinc-300 opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                <div className="mb-2 border-b border-zinc-800 pb-2">
                  <strong className="text-zinc-100">Você está conectado à entidade de {afinidadeEscolhida}</strong>
                </div>
                <ul className="flex list-disc flex-col gap-2 pl-4">
                  <li>Não precisa de componentes ritualísticos para conjurar rituais deste elemento.</li>
                  <li>Pode aprender rituais que exigem afinidade com este elemento.</li>
                  <li>Recebe +2d20 em testes contra efeitos de {afinidadeEscolhida}. Sofre -2d20 em testes contra efeitos de {obterElementoOpressor(afinidadeEscolhida)}.</li>
                  <li>Pode escolher poderes paranormais deste elemento uma segunda vez para receber o benefício listado na linha "Afinidade".</li>
                </ul>
              </div>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Afinidade</span>
          </div>
        )}

        {/* DESLOCAMENTO */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex h-9 items-center justify-center rounded border border-zinc-600 px-2.5 text-base font-bold text-zinc-100">
            <input
              type="number"
              value={deslocM}
              onChange={(e) => {
                const m = Number(e.target.value);
                setDeslocM(m);
                setDeslocQ(Math.floor(m / 1.5));
              }}
              className="w-9 bg-transparent text-center font-bold text-zinc-100 outline-none"
            />
            <span className="text-sm text-zinc-400">m /</span>
            <input
              type="number"
              value={deslocQ}
              onChange={(e) => {
                const q = Number(e.target.value);
                setDeslocQ(q);
                setDeslocM(q * 1.5);
              }}
              className="w-9 bg-transparent text-center font-bold text-zinc-100 outline-none"
            />
            <span className="text-sm text-zinc-400">q</span>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Deslocamento</span>
        </div>
      </div>

      {/* BARRAS DE STATUS */}
      <div className="mb-8 flex flex-col gap-6">
        {/* VIDA — usa a função com temporário */}
        <BarraStatus
          titulo="Vida"
          corBarra="border-red-700 bg-red-950/40"
          corTempClasses="border-red-500 bg-red-950/20"
          valorAtual={pvAtual}
          setValorAtual={setPvAtual as React.Dispatch<React.SetStateAction<number>>}
          valorMax={pvMax}
          setValorMax={setPvMax}
          alterarStatus={alterarPvComTemp} // ← TROCADO
          bloquearLetras={bloquearLetras}
          hasTemp={hasPvTemp}
          setHasTemp={setHasPvTemp}
          tempAtual={pvTempAtual}
          setTempAtual={setPvTempAtual}
          tempMax={pvTempMax}
          setTempMax={setPvTempMax}
        />

        {/* SANIDADE — não tem temporário */}
        {!regraSemSanidade && (
          <BarraStatus
            titulo="Sanidade"
            corBarra="border-zinc-300 bg-zinc-800/60"
            valorAtual={sanAtual}
            setValorAtual={setSanAtual as React.Dispatch<React.SetStateAction<number>>}
            valorMax={sanMax}
            setValorMax={setSanMax}
            alterarStatus={(qtd) => alterarStatus('san', qtd)}
            bloquearLetras={bloquearLetras}
          />
        )}

        {/* ESFORÇO — usa a função com temporário */}
        {!regraSemSanidade && (
          <BarraStatus
            titulo="Esforço"
            corBarra="border-amber-600 bg-amber-950/40"
            corTempClasses="border-amber-400 bg-amber-950/20"
            valorAtual={peAtual}
            setValorAtual={setPeAtual as React.Dispatch<React.SetStateAction<number>>}
            valorMax={peMax}
            setValorMax={setPeMax}
            alterarStatus={alterarPeComTemp}
            bloquearLetras={bloquearLetras}
            hasTemp={hasPeTemp}
            setHasTemp={setHasPeTemp}
            tempAtual={peTempAtual}
            setTempAtual={setPeTempAtual}
            tempMax={peTempMax}
            setTempMax={setPeTempMax}
          />
        )}

        {/* PD (Pontos de Determinação) — regra Jogando sem Sanidade */}
        {regraSemSanidade && (
          <BarraStatus
            titulo="Determinação"
            corBarra="border-purple-500 bg-purple-950/40"
            corTempClasses="border-purple-400 bg-purple-950/20"
            valorAtual={pdAtual}
            setValorAtual={setPdAtual as React.Dispatch<React.SetStateAction<number>>}
            valorMax={pdMax}
            setValorMax={setPdMax}
            alterarStatus={(qtd) => alterarStatus('pd', qtd)}
            bloquearLetras={bloquearLetras}
            hasTemp={hasPdTemp}
            setHasTemp={setHasPdTemp}
            tempAtual={pdTempAtual}
            setTempAtual={setPdTempAtual}
            tempMax={pdTempMax}
            setTempMax={setPdTempMax}
          />
        )}
      </div>

      {nex >= 50 && afinidadeEscolhida === null && (
        <ModalAfinidade 
          onEscolher={setAfinidadeEscolhida}
          forcarEscolha={true}
        />
      )}
    </div>
  );
};

// ============================================================
// COMPONENTE INTERNO: UMA BARRA DE STATUS (PV, SAN ou PE)
// ============================================================
interface BarraStatusProps {
  titulo: string;
  corBarra: string;
  corTempClasses?: string;
  valorAtual: number;
  setValorAtual: React.Dispatch<React.SetStateAction<number>>;
  valorMax: number;
  setValorMax: React.Dispatch<React.SetStateAction<number>>;
  alterarStatus: (qtd: number) => void;
  bloquearLetras: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  hasTemp?: boolean;
  setHasTemp?: React.Dispatch<React.SetStateAction<boolean>>;
  tempAtual?: number;
  setTempAtual?: React.Dispatch<React.SetStateAction<number>>;
  tempMax?: number;
  setTempMax?: React.Dispatch<React.SetStateAction<number>>;
}

const btnSeta =
  'px-2 text-lg font-bold text-zinc-300 transition select-none hover:text-white bg-transparent border-none';

function BarraStatus({
  titulo,
  corBarra,
  corTempClasses,
  valorAtual,
  setValorAtual,
  valorMax,
  setValorMax,
  alterarStatus,
  bloquearLetras,
  hasTemp,
  setHasTemp,
  tempAtual,
  setTempAtual,
  tempMax,
  setTempMax,
}: BarraStatusProps) {
  const percentual = valorMax > 0 ? Math.min(100, (valorAtual / valorMax) * 100) : 0;

  return (
    <div>
      {/* CABEÇALHO */}
      <div className="mb-1.5 flex items-center justify-between">
        <span className="ml-1 text-sm font-bold uppercase tracking-wider text-zinc-400">{titulo}</span>
        {setHasTemp && (
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-zinc-500 transition hover:text-zinc-300">
            <input
              type="checkbox"
              className="accent-red-600"
              checked={hasTemp}
              onChange={(e) => {
                setHasTemp(e.target.checked);
                if (!e.target.checked && setTempAtual && setTempMax) {
                  setTempAtual(0);
                  setTempMax(0);
                }
              }}
            />
            + Temporário
          </label>
        )}
      </div>

      {/* CORPO */}
      <div className="flex gap-2.5">
        <div
          className={`relative flex items-center justify-between overflow-hidden rounded border p-2.5 transition-all ${corBarra} ${hasTemp ? 'flex-[2.5]' : 'flex-1'}`}
        >
          {/* Preenchimento proporcional */}
          <div
            className="absolute inset-y-0 left-0 bg-white/5 transition-all"
            style={{ width: `${percentual}%` }}
          />
          <div className="relative">
            <button onClick={() => alterarStatus(-5)} className={btnSeta} title="-5">«</button>
            <button onClick={() => alterarStatus(-1)} className={btnSeta} title="-1">‹</button>
          </div>
          <div className="relative flex items-center gap-1">
            <input
              type="number"
              onKeyDown={bloquearLetras}
              value={valorAtual}
              onChange={(e) => setValorAtual(Math.max(0, Math.min(valorMax, Number(e.target.value))))}
              className="w-9 bg-transparent text-center text-lg font-bold text-zinc-100 outline-none"
              title={`Editar ${titulo} Atual`}
            />
            <span className="text-lg text-zinc-500">/</span>
            <input
              type="number"
              onKeyDown={bloquearLetras}
              value={valorMax}
              onChange={(e) => setValorMax(Math.max(1, Number(e.target.value)))}
              className="w-11 bg-transparent text-center text-lg font-bold text-zinc-100 outline-none"
              title={`Editar ${titulo} Máxima`}
            />
          </div>
          <div className="relative">
            <button onClick={() => alterarStatus(1)} className={btnSeta} title="+1">›</button>
            <button onClick={() => alterarStatus(5)} className={btnSeta} title="+5">»</button>
          </div>
        </div>

        {/* TEMPORÁRIO */}
        {hasTemp && setTempAtual && setTempMax && (
          <div className={`flex flex-1 items-center justify-center gap-1 rounded border border-dashed p-2.5 ${corTempClasses}`}>
            <input
              type="number"
              onKeyDown={bloquearLetras}
              value={tempAtual}
              onChange={(e) => setTempAtual(Math.max(0, Number(e.target.value)))}
              className="w-9 bg-transparent text-center font-bold text-zinc-100 outline-none"
            />
            <span className="text-zinc-500">/</span>
            <input
              type="number"
              onKeyDown={bloquearLetras}
              value={tempMax}
              onChange={(e) => setTempMax(Math.max(0, Number(e.target.value)))}
              className="w-9 bg-transparent text-center font-bold text-zinc-100 outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}