import { useState } from 'react';
import { useRPG } from '../../context/RPGContext';
import type { Patente, LimiteCredito } from '../../hooks/useInventario';
import { ModalArmas, formatarCritico } from './ModalArmas';
import type { ArmaInventario } from '../../types';

export function InventarioPanel() {
  const { inventarioHook, atributosFinais, regrasAutomaticasAtivas, armasHook, status } = useRPG();
  const {
    prestigio, setPrestigio,
    patente, setPatenteManual,
    credito, setCreditoOverride,
    limitesItens, setLimiteItemCategoria
  } = inventarioHook;

  const [modalArmasAberto, setModalArmasAberto] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState<'Geral' | 'Armas'>('Armas');
  const [buscaItem, setBuscaItem] = useState('');
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});

  const cargaMaxima = 5 + (atributosFinais.FOR * 5) + (regrasAutomaticasAtivas.has(23) ? 5 : 0) + (regrasAutomaticasAtivas.has(43) ? atributosFinais.INT : 0);
  const cargaAtual = armasHook?.cargaArmas || 0;
  const noInventario = armasHook?.contagemPorCategoria || [0, 0, 0, 0];

  const patentesDisponiveis: Patente[] = ['Recruta', 'Operador', 'Agente Especial', 'Oficial de Operações', 'Agente de Elite'];
  const creditosDisponiveis: LimiteCredito[] = ['Baixo', 'Médio', 'Alto', 'Ilimitado'];

  const toggleExpandir = (id: string) => {
    setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const calcularDT = (dtItem: string | null) => {
    if (!dtItem) return null;
    const parts = dtItem.split(',');
    if (parts.length !== 2) return null;
    const pericia = parts[0].trim();
    const val = parts[1].trim();

    let calculado = 0;
    if (val === 'FOR' || val === 'AGI' || val === 'INT' || val === 'PRE' || val === 'VIG') {
      calculado = 10 + status.peTurno + (atributosFinais[val as keyof typeof atributosFinais] || 0);
    } else {
      calculado = Number(val) || 0;
    }
    
    return `DT: ${pericia}, ${calculado}`;
  };

  const armasExibidas = (armasHook?.armasInventario || []).filter((item: ArmaInventario) => {
    if (buscaItem && !item.arma.Nome_Item.toLowerCase().includes(buscaItem.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-2 p-2 font-sans text-zinc-300 w-full">
      {/* LINHA 1: Prestígio e Patente */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold uppercase tracking-wider text-zinc-400">Pontos de Prestígio</label>
          <input
            type="number"
            min="0"
            value={prestigio}
            onChange={(e) => setPrestigio(Number(e.target.value))}
            className="w-16 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-center text-lg font-bold text-zinc-100 outline-none transition focus:border-red-800"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold uppercase tracking-wider text-zinc-400">Patente</label>
          <select
            value={patente}
            onChange={(e) => setPatenteManual(e.target.value as Patente)}
            className="w-48 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-center text-sm font-bold text-zinc-100 outline-none transition focus:border-red-800"
          >
            {patentesDisponiveis.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* LINHA 2: Limites de Itens */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-bold uppercase tracking-wider text-zinc-400 w-32">Limite de Itens</label>
        <div className="flex gap-2">
          {limitesItens.map((limite, index) => (
            <input
              key={`limite-${index}`}
              type="number"
              min="0"
              value={limite}
              onChange={(e) => setLimiteItemCategoria(index, Number(e.target.value))}
              className="w-12 rounded border border-zinc-700 bg-zinc-900 py-1 text-center text-lg font-bold text-zinc-100 outline-none transition focus:border-red-800"
            />
          ))}
        </div>
      </div>

      {/* LINHA 3: No Inventário */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-bold uppercase tracking-wider text-zinc-400 w-32">No Inventário</label>
        <div className="flex gap-2">
          {noInventario.map((qtd: number, index: number) => (
            <div
              key={`inventario-${index}`}
              className="w-12 rounded border border-zinc-800 bg-zinc-950 py-1 flex items-center justify-center text-lg font-bold text-zinc-500 cursor-not-allowed"
            >
              {qtd}
            </div>
          ))}
        </div>
      </div>

      {/* LINHA 4: Limite de Crédito e Carga Máxima */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold uppercase tracking-wider text-zinc-400 w-32">Limite de Crédito</label>
          <select
            value={credito}
            onChange={(e) => setCreditoOverride(e.target.value as LimiteCredito)}
            className="w-32 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-center text-sm font-bold text-zinc-100 outline-none transition focus:border-red-800"
          >
            {creditosDisponiveis.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold uppercase tracking-wider text-zinc-400">Carga Máx.</label>
          <div className="flex gap-2">
            <div className="w-12 rounded border border-zinc-700 bg-zinc-900 py-1 flex items-center justify-center text-lg font-bold text-zinc-100">
              {cargaAtual}
            </div>
            <div className="w-12 rounded border border-zinc-800 bg-zinc-950 py-1 flex items-center justify-center text-lg font-bold text-zinc-500">
              {cargaMaxima}
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-zinc-800 my-2" />

      {/* Seção de Inventário */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex items-center gap-4">
          <div className="flex bg-zinc-900 rounded p-1">
            <button
              onClick={() => setCategoriaFiltro('Geral')}
              className={`px-4 py-1 rounded text-sm font-bold transition ${categoriaFiltro === 'Geral' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Geral
            </button>
            <button
              onClick={() => setCategoriaFiltro('Armas')}
              className={`px-4 py-1 rounded text-sm font-bold transition ${categoriaFiltro === 'Armas' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Armas
            </button>
          </div>
          
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Buscar no inventário..."
              value={buscaItem}
              onChange={(e) => setBuscaItem(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-purple-500"
            />
            {categoriaFiltro === 'Armas' && (
              <button
                onClick={() => setModalArmasAberto(true)}
                className="bg-green-700 hover:bg-green-600 text-white px-4 py-1.5 rounded font-bold text-sm transition"
              >
                + Adicionar
              </button>
            )}
          </div>
        </div>

        {categoriaFiltro === 'Armas' && (
          <div className="flex flex-col gap-2">
            {armasExibidas.map((item: ArmaInventario) => {
              const { id, arma } = item;
              const isExpanded = expandidos[id];
              const stringDT = calcularDT(arma.dt_item);

              return (
                <div key={id} className="bg-zinc-950 border border-zinc-800 rounded p-3 flex flex-col gap-2">
                  <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleExpandir(id)}>
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-500 text-xs w-4 text-center">{(isExpanded ? '▼' : '▶')}</span>
                      <span className="font-bold text-zinc-100">{arma.Nome_Item}</span>
                      
                      <span className="text-purple-400 text-sm font-bold border border-purple-900/50 bg-purple-900/20 px-2 py-0.5 rounded">
                        Dano: {arma.Dano_Arma}
                      </span>
                      <span className="text-zinc-300 text-sm font-bold border border-zinc-800 bg-zinc-900 px-2 py-0.5 rounded">
                        Crítico: {formatarCritico(arma.Critico_Arma, arma.Multiplicador_Arma)}
                      </span>
                      
                      {arma['Agil?'] && (
                        <span className="relative group cursor-help ml-1">
                          ⚡
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-zinc-800 text-xs text-zinc-300 rounded z-10 text-center shadow-lg pointer-events-none">
                            Permite que você aplique sua Agilidade em vez de sua Força em testes de ataque e rolagens de dano realizadas com ela.
                          </span>
                        </span>
                      )}
                      {arma['Automatica?'] && (
                        <span className="relative group cursor-help ml-1">
                          🔄
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-zinc-800 text-xs text-zinc-300 rounded z-10 text-center shadow-lg pointer-events-none">
                            Pode disparar tiros únicos, usando a regra normal, ou rajadas. Quando dispara uma rajada, você sofre -1d20 no teste de ataque, mas causa 1 dado de dano adicional do mesmo tipo.
                          </span>
                        </span>
                      )}
                    </div>
                    
                    <span className="text-purple-500 mr-2 text-lg">✓</span>
                  </div>
                  
                  {isExpanded && (
                    <div className="pt-2 mt-2 border-t border-zinc-800 text-sm flex flex-col gap-2">
                      <div>
                        <span className="font-bold text-zinc-200">{arma.Proficiencia}</span> <span className="text-zinc-500">—</span> <span className="italic text-zinc-400">{arma.Tipo_Arma}</span> <span className="text-zinc-500">—</span> <span className="italic text-zinc-400">{arma.Empunhadura_Arma}</span>
                      </div>
                      <div className="flex gap-4">
                        <span><span className="text-emerald-400 font-bold">Categoria:</span> <span className="text-zinc-300">{arma.Categoria_Item}</span></span>
                        {arma.Alcance_Item && <span><span className="text-emerald-400 font-bold">Alcance:</span> <span className="text-zinc-300">{arma.Alcance_Item}</span></span>}
                        <span><span className="text-emerald-400 font-bold">Tipo:</span> <span className="text-zinc-300">{arma.Tipo_Dano_Arma}</span></span>
                      </div>
                      <div className="flex gap-4">
                        <span><span className="text-emerald-400 font-bold">Espaços:</span> <span className="text-zinc-300">{arma['Espaços_Item']}</span></span>
                        {stringDT && <span><span className="text-purple-400 font-bold">{stringDT}</span></span>}
                      </div>
                      <div className="text-zinc-400 mt-1">{arma.Descricao_Item}</div>
                      
                      <div className="flex justify-between mt-2 pt-2 border-t border-zinc-800/50">
                        <button
                          onClick={() => armasHook.removerArma(id)}
                          className="text-red-500 hover:text-red-400 font-bold text-xs px-2 py-1 border border-red-900/50 hover:bg-red-900/20 rounded transition"
                        >
                          Remover
                        </button>
                        <button
                          className="text-zinc-400 hover:text-zinc-300 font-bold text-xs px-2 py-1 border border-zinc-700 hover:bg-zinc-800 rounded transition"
                        >
                          Editar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ModalArmas
        aberto={modalArmasAberto}
        onFechar={() => setModalArmasAberto(false)}
      />
    </div>
  );
}
