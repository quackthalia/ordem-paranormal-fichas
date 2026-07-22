import React from 'react';
import { useRPG } from '../../context/RPGContext';
import { Patente, LimiteCredito } from '../../hooks/useInventario';

export function InventarioPanel() {
  const { inventarioHook, atributos } = useRPG();
  const {
    prestigio, setPrestigio,
    patente, setPatenteOverride,
    credito, setCreditoOverride,
    limitesItens, setLimiteItemCategoria
  } = inventarioHook;

  const cargaMaxima = 5 + (atributos.FOR * 5);
  const cargaAtual = 0; // Por enquanto hardcoded
  const noInventario = [0, 0, 0, 0]; // Por enquanto hardcoded

  const patentesDisponiveis: Patente[] = ['Recruta', 'Operador', 'Agente Especial', 'Oficial de Operações', 'Agente de Elite'];
  const creditosDisponiveis: LimiteCredito[] = ['Baixo', 'Médio', 'Alto', 'Ilimitado'];

  return (
    <div className="flex flex-col gap-6 p-4 font-sans">
      {/* LINHA 1: Prestígio e Patente */}
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold uppercase tracking-wider text-zinc-400">Pontos de Prestígio</label>
          <input
            type="number"
            min="0"
            value={prestigio}
            onChange={(e) => setPrestigio(Number(e.target.value))}
            className="w-20 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-center text-lg font-bold text-zinc-100 outline-none transition focus:border-red-800"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold uppercase tracking-wider text-zinc-400">Patente</label>
          <select
            value={patente}
            onChange={(e) => setPatenteOverride(e.target.value as Patente)}
            className="w-48 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-center text-sm font-bold text-zinc-100 outline-none transition focus:border-red-800"
          >
            {patentesDisponiveis.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* LINHA 2 e 3: Limites de Itens e No Inventário */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-6">
          <label className="w-32 text-sm font-bold uppercase tracking-wider text-zinc-400 text-right">Limite de Itens</label>
          <div className="flex gap-2">
            {limitesItens.map((limite, index) => (
              <input
                key={`limite-${index}`}
                type="number"
                min="0"
                value={limite}
                onChange={(e) => setLimiteItemCategoria(index, Number(e.target.value))}
                className="w-14 rounded border border-zinc-700 bg-zinc-900 px-1 py-2 text-center text-lg font-bold text-zinc-100 outline-none transition focus:border-red-800"
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="w-32 text-sm font-bold uppercase tracking-wider text-zinc-400 text-right">No Inventário</label>
          <div className="flex gap-2">
            {noInventario.map((qtd, index) => (
              <div
                key={`inventario-${index}`}
                className="w-14 rounded border border-zinc-800 bg-zinc-950 px-1 py-2 text-center text-lg font-bold text-zinc-500 cursor-not-allowed"
              >
                {qtd}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LINHA 4: Limite de Crédito e Carga Máx */}
      <div className="flex flex-wrap items-center gap-6 pt-2">
        <div className="flex items-center gap-3">
          <label className="w-32 text-sm font-bold uppercase tracking-wider text-zinc-400 text-right">Limite de Crédito</label>
          <select
            value={credito}
            onChange={(e) => setCreditoOverride(e.target.value as LimiteCredito)}
            className="w-32 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-center text-sm font-bold text-zinc-100 outline-none transition focus:border-red-800"
          >
            {creditosDisponiveis.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold uppercase tracking-wider text-zinc-400">Carga Máx.</label>
          <div className="flex gap-2">
            <div className="w-14 rounded border border-zinc-700 bg-zinc-900 px-1 py-2 text-center text-lg font-bold text-zinc-100">
              {cargaAtual}
            </div>
            <div className="w-14 rounded border border-zinc-800 bg-zinc-950 px-1 py-2 text-center text-lg font-bold text-zinc-500">
              {cargaMaxima}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
