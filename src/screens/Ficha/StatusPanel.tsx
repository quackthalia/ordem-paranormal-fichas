import React from 'react';
import { useRPG } from '../../context/RPGContext';
import { NEX_OPTIONS } from '../../utils/rpgRules';

export const StatusPanel: React.FC = () => {
  const {
    status,
    nex,
    setNex,
    bloquearLetras,
    deslocM, setDeslocM,
    deslocQ, setDeslocQ,
  } = useRPG();

  const {
    pvAtual, pvMax, setPvMax,
    sanAtual, sanMax, setSanMax,
    peAtual, peMax, setPeMax,
    peTurno,
    hasPvTemp, setHasPvTemp,
    pvTempAtual, setPvTempAtual, pvTempMax, setPvTempMax,
    hasPeTemp, setHasPeTemp,
    peTempAtual, setPeTempAtual, peTempMax, setPeTempMax,
    alterarStatus,
  } = status;

  return (
    <div>
      {/* LINHA: NEX + PE/TURNO + DESLOCAMENTO */}
      <div className="mb-8 flex items-start justify-between border-b border-zinc-800 pb-5">
        {/* NEX */}
        <div className="flex flex-col items-center gap-1.5">
          <select
            value={nex}
            onChange={(e) => setNex(Number(e.target.value))}
            className="cursor-pointer appearance-none rounded border border-zinc-600 bg-zinc-900 px-3 py-2 text-center text-lg font-bold text-zinc-100 transition hover:border-red-700"
          >
            {NEX_OPTIONS.map(n => (
              <option key={n} value={n}>{n}%</option>
            ))}
          </select>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">NEX</span>
        </div>

        {/* PE/TURNO */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="min-w-14 rounded border border-zinc-600 px-4 py-2 text-center text-lg font-bold">
            {peTurno}
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">PE/Turno</span>
        </div>

        {/* DESLOCAMENTO */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center rounded border border-zinc-600 px-2.5 py-2 text-lg font-bold">
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
        {/* VIDA */}
        <BarraStatus
          titulo="Vida"
          corBarra="border-red-700 bg-red-950/40"
          corTempClasses="border-red-500 bg-red-950/20"
          valorAtual={pvAtual}
          valorMax={pvMax}
          setValorMax={setPvMax}
          alterarStatus={(qtd) => alterarStatus('pv', qtd)}
          bloquearLetras={bloquearLetras}
          hasTemp={hasPvTemp}
          setHasTemp={setHasPvTemp}
          tempAtual={pvTempAtual}
          setTempAtual={setPvTempAtual}
          tempMax={pvTempMax}
          setTempMax={setPvTempMax}
        />

        {/* SANIDADE */}
        <BarraStatus
          titulo="Sanidade"
          corBarra="border-zinc-300 bg-zinc-800/60"
          valorAtual={sanAtual}
          valorMax={sanMax}
          setValorMax={setSanMax}
          alterarStatus={(qtd) => alterarStatus('san', qtd)}
          bloquearLetras={bloquearLetras}
        />

        {/* ESFORÇO */}
        <BarraStatus
          titulo="Esforço"
          corBarra="border-amber-600 bg-amber-950/40"
          corTempClasses="border-amber-400 bg-amber-950/20"
          valorAtual={peAtual}
          valorMax={peMax}
          setValorMax={setPeMax}
          alterarStatus={(qtd) => alterarStatus('pe', qtd)}
          bloquearLetras={bloquearLetras}
          hasTemp={hasPeTemp}
          setHasTemp={setHasPeTemp}
          tempAtual={peTempAtual}
          setTempAtual={setPeTempAtual}
          tempMax={peTempMax}
          setTempMax={setPeTempMax}
        />
      </div>
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
            <span className="text-lg font-bold">{valorAtual}</span>
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
