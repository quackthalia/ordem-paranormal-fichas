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
      <div className="flex flex-col gap-3 mt-2">
        {/* Barra superior de busca e botão adicionar */}
        <div className="flex gap-2">
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

        {/* Corpo principal: Lista + Botões Laterais */}
        <div className="flex items-start flex-1 min-h-[400px]">
          {/* Lista de itens (esquerda) */}
          <div className="flex-1 flex flex-col gap-2 min-w-0 pr-4">
            {categoriaFiltro === 'Armas' && (
              <>
            {armasExibidas.map((item: ArmaInventario) => {
              const { id, arma } = item;
              const isExpanded = expandidos[id];
              const stringDT = calcularDT(arma.dt_item);

              return (
                <div key={id} className="overflow-hidden rounded-r border-l-4 border-l-purple-700 bg-zinc-950/60 transition hover:bg-zinc-900/60">
                  {/* Bloco fechado */}
                  <div
                    className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3"
                    onClick={() => toggleExpandir(id)}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex items-center gap-1.5 rounded bg-purple-900/40 text-purple-300 px-2 py-0.5 uppercase tracking-wider leading-tight">
                          <span className="text-[10px] font-bold">{arma.Dano_Arma}</span>
                        </span>
                        <span className="text-sm font-bold text-zinc-100">{arma.Nome_Item}</span>
                        
                        {arma['Agil?'] && (
                          <span className="relative group cursor-help flex-shrink-0" title="Ágil">
                            <span className="text-xs text-yellow-400">⚡</span>
                          </span>
                        )}
                        {arma['Automatica?'] && (
                          <span className="relative group cursor-help flex-shrink-0" title="Automática">
                            <span className="text-xs text-blue-400">🔄</span>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-zinc-400 text-xs font-bold bg-zinc-900 px-2 py-1 rounded">
                        Crítico: {formatarCritico(arma.Critico_Arma, arma.Multiplicador_Arma)}
                      </span>
                      <span className="text-purple-500 font-bold">✓</span>
                      <span className="w-5 text-center text-zinc-600">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  
                  {/* Bloco expandido */}
                  {isExpanded && (
                    <div className="border-t border-zinc-800 px-4 py-4 text-xs flex flex-col gap-2 bg-zinc-950/80">
                      <div>
                        <span className="font-bold text-zinc-200">{arma.Proficiencia}</span>
                        <span className="text-zinc-600"> — </span>
                        <span className="italic text-zinc-400">{arma.Tipo_Arma}</span>
                        <span className="text-zinc-600"> — </span>
                        <span className="italic text-zinc-400">{arma.Empunhadura_Arma}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-zinc-300">
                        <span><span className="text-purple-400 font-bold">Categoria:</span> {arma.Categoria_Item}</span>
                        {arma.Alcance_Item && <span><span className="text-purple-400 font-bold">Alcance:</span> {arma.Alcance_Item}</span>}
                        <span><span className="text-purple-400 font-bold">Tipo:</span> {arma.Tipo_Dano_Arma}</span>
                        <span><span className="text-purple-400 font-bold">Espaços:</span> {arma['Espaços_Item']}</span>
                        {stringDT && <span><span className="text-purple-400 font-bold">{stringDT}</span></span>}
                      </div>
                      
                      <div className="flex flex-col gap-1 mt-1">
                        {arma['Agil?'] && (
                          <p className="text-zinc-500 leading-relaxed"><span className="text-yellow-400">⚡ Ágil:</span> Permite que você aplique sua Agilidade em vez de sua Força em testes de ataque e rolagens de dano realizadas com ela.</p>
                        )}
                        {arma['Automatica?'] && (
                          <p className="text-zinc-500 leading-relaxed"><span className="text-blue-400">🔄 Automática:</span> Pode disparar tiros únicos ou rajadas. Na rajada, você sofre -1d20 no ataque, mas causa 1 dado de dano adicional.</p>
                        )}
                        <p className="text-zinc-500 mt-1 leading-relaxed">{arma.Descricao_Item}</p>
                      </div>
                      
                      <div className="flex justify-between mt-3 pt-3 border-t border-zinc-800/50">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            armasHook.removerArma(id);
                          }}
                          className="rounded bg-red-900/40 border border-red-800/50 px-4 py-1.5 text-xs font-bold uppercase text-red-400 transition hover:bg-red-800 hover:text-red-100"
                        >
                          Remover Arma
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {categoriaFiltro === 'Armas' && armasExibidas.length === 0 && (
              <p className="text-center text-zinc-600 text-sm py-4">Nenhuma arma no inventário.</p>
            )}
            </>
          )}

          {categoriaFiltro !== 'Armas' && (
            <p className="text-center text-zinc-600 text-sm py-8">Esta categoria ainda não possui itens implementados.</p>
          )}
          </div>

          {/* Sidebar de botões de categoria (direita) em formato de ABAS */}
          <div className="flex flex-col w-14 shrink-0 border-l border-zinc-800 -mr-2 bg-zinc-950/50 rounded-r-lg overflow-hidden self-stretch">
            <button
              onClick={() => setCategoriaFiltro('Geral')}
              title="Geral"
              className={`w-full h-14 border-b border-zinc-800 flex items-center justify-center text-2xl transition ${
                categoriaFiltro === 'Geral' 
                  ? 'bg-zinc-900 text-purple-400 border-l-2 border-l-purple-500' 
                  : 'bg-transparent text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50 border-l-2 border-l-transparent'
              }`}
            >
              🎒
            </button>
            <button
              onClick={() => setCategoriaFiltro('Armas')}
              title="Armas"
              className={`w-full h-14 border-b border-zinc-800 flex items-center justify-center text-2xl transition ${
                categoriaFiltro === 'Armas' 
                  ? 'bg-zinc-900 text-purple-400 border-l-2 border-l-purple-500' 
                  : 'bg-transparent text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50 border-l-2 border-l-transparent'
              }`}
            >
              🗡️
            </button>
            {/* Espaços para categorias futuras */}
            <button className="w-full h-14 border-b border-zinc-800/50 flex items-center justify-center text-2xl text-zinc-700/50 cursor-not-allowed bg-transparent border-l-2 border-l-transparent" title="Equipamentos (Em breve)">👕</button>
            <button className="w-full h-14 border-b border-zinc-800/50 flex items-center justify-center text-2xl text-zinc-700/50 cursor-not-allowed bg-transparent border-l-2 border-l-transparent" title="Proteções (Em breve)">🛡️</button>
            <button className="w-full h-14 border-b border-zinc-800/50 flex items-center justify-center text-2xl text-zinc-700/50 cursor-not-allowed bg-transparent border-l-2 border-l-transparent" title="Itens Operacionais (Em breve)">💊</button>
          </div>
        </div>
      </div>

      <ModalArmas
        aberto={modalArmasAberto}
        onFechar={() => setModalArmasAberto(false)}
      />
    </div>
  );
}
