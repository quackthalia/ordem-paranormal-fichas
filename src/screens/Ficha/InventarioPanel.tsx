import { useState } from 'react';
import { useRPG } from '../../context/RPGContext';
import type { Patente, LimiteCredito } from '../../hooks/useInventario';
import { ModalArmas, formatarCritico } from './ModalArmas';
import type { ArmaInventario } from '../../types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

  const sensores = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    const { active } = event;
    if (active && expandidos[active.id]) {
      setExpandidos(prev => ({ ...prev, [active.id]: false }));
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = (armasHook?.armasInventario || []).findIndex(x => x.id === active.id);
      const newIndex = (armasHook?.armasInventario || []).findIndex(x => x.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1 && armasHook?.reordenarArmas) {
        armasHook.reordenarArmas(oldIndex, newIndex);
      }
    }
  };

  const armasExibidas = (armasHook?.armasInventario || []).filter((item: ArmaInventario) => {
    if (buscaItem && !item.arma.Nome_Item.toLowerCase().includes(buscaItem.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden gap-2 p-2 font-sans text-zinc-300 w-full">
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
        {/* Abas de Categoria */}
        <div className="flex gap-2 mb-4 border-b border-zinc-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setCategoriaFiltro('Geral')}
            title="Geral"
            className={`w-12 h-12 flex items-center justify-center rounded-t text-2xl transition border-b-2 ${
              categoriaFiltro === 'Geral' 
                ? 'bg-zinc-900 text-red-400 border-b-red-500' 
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50 border-b-transparent'
            }`}
          >
            🎒
          </button>
          <button
            onClick={() => setCategoriaFiltro('Armas')}
            title="Armas"
            className={`w-12 h-12 flex items-center justify-center rounded-t text-2xl transition border-b-2 ${
              categoriaFiltro === 'Armas' 
                ? 'bg-zinc-900 text-red-400 border-b-red-500' 
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50 border-b-transparent'
            }`}
          >
            ⚔️
          </button>
        </div>

        {/* Filtros e Busca */}
        <div className="flex gap-2 mb-4">
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

        {/* Corpo principal: Lista */}
        <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
          {(categoriaFiltro === 'Armas' || categoriaFiltro === 'Geral') && (
            <>
            {categoriaFiltro === 'Geral' && armasExibidas.length > 0 && (
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1 mt-2 border-b border-zinc-800 pb-1">Armas</h3>
            )}
            
            <DndContext 
              sensors={sensores}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={armasExibidas.map(a => a.id)}
                strategy={verticalListSortingStrategy}
              >
                {armasExibidas.map((item: ArmaInventario) => (
                  <SortableArmaItem
                    key={item.id}
                    item={item}
                    isExpanded={!!expandidos[item.id]}
                    toggleExpandir={toggleExpandir}
                    stringDT={calcularDT(item.arma.dt_item)}
                    removerArma={armasHook?.removerArma || (() => {})}
                  />
                ))}
              </SortableContext>
            </DndContext>
            
            {categoriaFiltro === 'Armas' && armasExibidas.length === 0 && (
              <p className="text-center text-zinc-600 text-sm py-4">Nenhuma arma no inventário.</p>
            )}
            
            {categoriaFiltro === 'Geral' && armasExibidas.length === 0 && (
              <p className="text-center text-zinc-600 text-sm py-4">Inventário vazio.</p>
            )}
            </>
          )}

          {categoriaFiltro !== 'Armas' && categoriaFiltro !== 'Geral' && (
            <p className="text-center text-zinc-600 text-sm py-8">Esta categoria ainda não possui itens implementados.</p>
          )}
        </div>
      </div>

      <ModalArmas
        aberto={modalArmasAberto}
        onFechar={() => setModalArmasAberto(false)}
      />
    </div>
  );
}

function SortableArmaItem({
  item,
  isExpanded,
  toggleExpandir,
  stringDT,
  removerArma
}: {
  item: ArmaInventario;
  isExpanded: boolean;
  toggleExpandir: (id: string) => void;
  stringDT: string | null;
  removerArma: (id: string) => void;
}) {
  const { id, arma } = item;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded border border-l-4 border-l-red-700 transition ${isDragging ? 'border-red-500 bg-zinc-900 shadow-xl scale-[1.02]' : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900/60'}`}
    >
      {/* Bloco fechado */}
      <div className="flex items-center gap-1 p-3">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-300 p-2 flex-shrink-0 flex items-center justify-center rounded hover:bg-zinc-800"
          title="Arrastar para reordenar"
        >
          <svg width="14" height="20" viewBox="0 0 14 20" fill="currentColor">
            <path d="M4 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm6 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-6 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm6 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-6 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm6 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
          </svg>
        </div>
        
        <div 
          className="flex-1 flex cursor-pointer items-center justify-between gap-3 min-w-0"
          onClick={() => toggleExpandir(id)}
        >
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <span className="font-bold text-sm text-zinc-100 truncate">{arma.Nome_Item}</span>
            <div className="flex items-center gap-4 text-xs text-zinc-300">
              <span><span className="font-bold text-red-400">Dado:</span> {arma.Dano_Arma}</span>
              <span><span className="font-bold text-zinc-400">Crítico:</span> {formatarCritico(arma.Critico_Arma, arma.Multiplicador_Arma)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            {arma['Agil?'] && (
              <span className="relative group cursor-help" title="Ágil">
                <span className="text-sm text-yellow-400">⚡</span>
                <span className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-52 p-2 bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded z-50 text-center shadow-lg pointer-events-none">
                  Permite que você aplique sua Agilidade em vez de sua Força em testes de ataque e rolagens de dano.
                </span>
              </span>
            )}
            {arma['Automatica?'] && (
              <span className="relative group cursor-help" title="Automática">
                <span className="text-sm text-blue-400">🔄</span>
                <span className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-52 p-2 bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded z-50 text-center shadow-lg pointer-events-none">
                  Pode disparar tiros únicos ou rajadas (-1d20 no ataque, +1 dado de dano).
                </span>
              </span>
            )}
            <span className="w-5 text-center text-zinc-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
          </div>
        </div>
      </div>
      
      {/* Bloco expandido */}
      {isExpanded && (
        <div className="border-t border-zinc-800 px-3 py-3 text-xs flex flex-col gap-2 bg-zinc-950/80">
          <div>
            <span className="font-bold text-zinc-200">{arma.Proficiencia}</span>
            <span className="text-zinc-600"> — </span>
            <span className="italic text-zinc-400">{arma.Tipo_Arma}</span>
            <span className="text-zinc-600"> — </span>
            <span className="italic text-zinc-400">{arma.Empunhadura_Arma}</span>
          </div>
          <div className="flex flex-col gap-1 text-xs text-zinc-300">
            <span><span className="text-red-400 font-bold">Categoria:</span> {arma.Categoria_Item}</span>
            {arma.Alcance_Item && <span><span className="text-red-400 font-bold">Alcance:</span> {arma.Alcance_Item}</span>}
            <span><span className="text-red-400 font-bold">Tipo:</span> {arma.Tipo_Dano_Arma}</span>
            <span><span className="text-red-400 font-bold">Espaços:</span> {arma['Espaços_Item']}</span>
            {stringDT && <span><span className="text-red-400 font-bold">{stringDT}</span></span>}
          </div>
          
          <div className="flex flex-col gap-1 mt-1">
            <p className="text-zinc-400 text-xs leading-relaxed">{arma.Descricao_Item}</p>
          </div>
          
          <div className="flex justify-between mt-3 pt-3 border-t border-zinc-800/50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                removerArma(id);
              }}
              className="rounded bg-red-900/40 border border-red-800/50 px-3 py-1 text-xs font-bold uppercase text-red-400 transition hover:bg-red-800 hover:text-red-100"
            >
              Remover Arma
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
