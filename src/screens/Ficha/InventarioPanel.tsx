import { useState, useEffect } from 'react';
import { useRPG } from '../../context/RPGContext';
import type { Patente, LimiteCredito } from '../../hooks/useInventario';
import { ModalArmas, formatarCritico } from './ModalArmas';
import type { ArmaInventario, ProtecaoInventario, ItemGeralInventario } from '../../types';
import { ModalProtecoes } from './ModalProtecoes';
import { ModalItens } from './ModalItens';
import { ModalEditarProtecao } from '../../components/ModalEditarProtecao';
import { ModalEditarItem } from '../../components/ModalEditarItem';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToWindowEdges, restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import type { Modifier } from '@dnd-kit/core';
import { ModalMunicoes } from './ModalMunicoes';
import { ModalEditarArma } from '../../components/ModalEditarArma';

import { formatarTexto } from '../../utils/formatters';
const restrictToTopAndVerticalAxis: Modifier = ({ transform, activeNodeRect }) => {
  if (!activeNodeRect) {
    return { ...transform, x: 0 };
  }
  const scrollContainer = document.getElementById('inventario-scroll-container');
  let minY = -activeNodeRect.top; // Fallback para o topo da janela
  if (scrollContainer) {
    const scrollRect = scrollContainer.getBoundingClientRect();
    minY = scrollRect.top - activeNodeRect.top;
  }
  return {
    ...transform,
    x: 0,
    y: Math.max(minY, transform.y),
  };
};


interface SortableItemGeralProps {
  item: ItemGeralInventario;
  isExpanded: boolean;
  toggleExpandir: (id: string) => void;
  removerItem: (id: string) => void;
  stringDT: string | null;
  onEditar?: () => void;
}

function SortableItemGeral({ item, isExpanded, toggleExpandir, removerItem, stringDT, onEditar }: SortableItemGeralProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, data: { type: 'item' } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded border border-l-4 border-l-red-700 transition-colors w-full relative ${isDragging ? 'border-red-500 bg-zinc-900 shadow-xl scale-[1.02]' : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900/60'}`}
    >
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
          onClick={() => toggleExpandir(item.id)}
        >
          <div className="flex flex-col gap-1 flex-1 min-w-0 justify-center">
            <span className="font-bold text-sm text-zinc-100 truncate leading-none mt-0.5">{item.item.Nome_Item}</span>
            {stringDT && (
              <div className="flex items-center gap-4 text-xs text-zinc-300 mt-0.5">
                <span><span className="font-bold text-red-400">DT:</span> {stringDT}</span>
              </div>
            )}
          </div>
          <span className="w-5 text-center text-zinc-500 text-xs flex-shrink-0">{isExpanded ? '▲' : '▼'}</span>
        </div>
      </div>
      
      {isExpanded && (
        <div className="border-t border-zinc-800 px-3 py-3 text-xs bg-zinc-950/80 flex flex-col gap-2 relative z-10" onClick={e => e.stopPropagation()}>
          <div className="flex flex-col gap-1 mt-1">
            <span><span className="text-red-400 font-bold">Categoria:</span> {item.item.Categoria_Item}</span>
            <span><span className="text-red-400 font-bold">Espaços:</span> {item.item.Espacos_Itens}</span>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <p className="text-zinc-400 text-xs leading-relaxed whitespace-pre-wrap">{formatarTexto(item.item.Desc_Item)}</p>
          </div>
          {item.item.Fonte_Item && (
            <div className="mt-2 pt-2 border-t border-zinc-800/50">
              <span className="text-[10px] uppercase tracking-wider text-zinc-600">Fonte: {item.item.Fonte_Item}</span>
            </div>
          )}
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-800/50">
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removerItem(item.id);
                }}
                className="rounded bg-red-900/40 border border-red-800/50 px-3 py-1 text-xs font-bold uppercase text-red-400 transition hover:bg-red-800 hover:text-red-100"
              >
                Remover Item
              </button>
              {onEditar && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditar();
                  }}
                  className="rounded bg-zinc-800 border border-zinc-700 px-3 py-1 text-xs font-bold uppercase text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
                >
                  Editar Item
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function InventarioPanel() {
  const { inventarioHook, atributosFinais, regrasAutomaticasAtivas, armasHook, municoesHook, protecoesHook, itensHook, status } = useRPG();
  const {
    prestigio, setPrestigio,
    patente, setPatenteManual,
    credito, setCreditoOverride,
    limitesItens, setLimiteItemCategoria
  } = inventarioHook;

  const [modalArmasAberto, setModalArmasAberto] = useState(false);
  const [modalMunicoesAberto, setModalMunicoesAberto] = useState(false);
  const [modalProtecoesAberto, setModalProtecoesAberto] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('Armas');
  const [modalItensAberto, setModalItensAberto] = useState(false);
  const [abaItensAberta, setAbaItensAberta] = useState<string>('');
  const [buscaItem, setBuscaItem] = useState('');
  const [municaoFiltroNome, setMunicaoFiltroNome] = useState<string | undefined>(undefined);
  const [municaoFiltroCategoria, setMunicaoFiltroCategoria] = useState<string | undefined>(undefined);
  const [municaoTargetArmaId, setMunicaoTargetArmaId] = useState<string | undefined>(undefined);
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});
  const [armaEditandoId, setArmaEditandoId] = useState<string | null>(null);
  const [protecaoEditandoId, setProtecaoEditandoId] = useState<string | null>(null);
  const [itemEditandoId, setItemEditandoId] = useState<string | null>(null);
  const [activeDragItem, setActiveDragItem] = useState<{ id: string, type: 'arma' | 'municao' | 'protecao' | 'item', name?: string } | null>(null);

  const cargaMaxima = 5 + (atributosFinais.FOR * 5) + (regrasAutomaticasAtivas.has(23) ? 5 : 0) + (regrasAutomaticasAtivas.has(43) ? atributosFinais.INT : 0);
  
  const cargaAtual = (armasHook?.cargaArmas || 0) + (municoesHook?.cargaMunicoes || 0) + (protecoesHook?.cargaProtecoes || 0) + (itensHook?.cargaItens || 0);
  
  const noInventario = [0, 0, 0, 0];
  const countArmas = armasHook?.contagemPorCategoria || [0, 0, 0, 0];
  const countMunicoes = municoesHook?.contagemPorCategoria || [0, 0, 0, 0];
  const countProtecoes = protecoesHook?.contagemPorCategoria || [0, 0, 0, 0];
  const countItens = itensHook?.contagemPorCategoria || [0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    noInventario[i] = countArmas[i] + countMunicoes[i] + countProtecoes[i] + countItens[i];
  }

  useEffect(() => {
    (window as any)._inventarioPanelSetters = {
      setMunicaoTargetArmaId,
      setMunicaoFiltroNome,
      setMunicaoFiltroCategoria,
      setModalMunicoesAberto,
    };
    return () => {
      delete (window as any)._inventarioPanelSetters;
    };
  }, []);

  const patentesDisponiveis: Patente[] = ['Recruta', 'Operador', 'Agente Especial', 'Oficial de Operações', 'Agente de Elite'];
  const creditosDisponiveis: LimiteCredito[] = ['Baixo', 'Médio', 'Alto', 'Ilimitado'];

  const toggleExpandir = (id: string) => {
    setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const calcularDT = (dtItem: string | null): string | null => {
    if (!dtItem) return null;
    
    if (dtItem.includes('/')) {
      return dtItem.split('/').map(part => calcularDT(part.trim())).join(' / ');
    }

    let pericia = '';
    let val = dtItem.trim();
    
    if (val.includes(',')) {
      const parts = val.split(',');
      val = parts.pop()!.trim();
      pericia = parts.join(',').trim();
    }

    let calculado: string | number = 0;
    const isAtributo = ['FOR', 'AGI', 'INT', 'PRE', 'VIG'].includes(val.toUpperCase());
    
    if (isAtributo) {
      calculado = 10 + status.peTurno + (atributosFinais[val.toUpperCase() as keyof typeof atributosFinais] || 0);
    } else {
      const numVal = Number(val);
      calculado = isNaN(numVal) ? val : numVal;
    }
    
    if (pericia) {
      return `${pericia} ${calculado}`;
    }
    return `${calculado}`;
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
    const type = active.data?.current?.type;
    let name = 'Item';
    if (type === 'municao') {
      const m = municoesHook?.municoesInventario.find(x => x.id === active.id);
      if (m) name = m.municao.Nome_Item;
    } else if (type === 'arma') {
      const a = armasHook?.armasInventario.find(x => x.id === active.id);
      if (a) name = a.arma.Nome_Item;
    } else if (type === 'protecao') {
      const p = protecoesHook?.protecoesInventario.find(x => x.id === active.id);
      if (p) name = p.protecao.Nome_Protecao;
    } else if (type === 'item') {
      const i = itensHook?.itensInventario.find(x => x.id === active.id);
      if (i) name = i.item.Nome_Item;
    }
    setActiveDragItem({ id: active.id, type, name });
  };

  const handleDragEnd = (event: any) => {
    setActiveDragItem(null);
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const armaActive = armasHook?.armasInventario.find(a => a.id === active.id);
      const municaoActive = municoesHook?.municoesInventario.find(m => m.id === active.id);
      const protecaoActive = protecoesHook?.protecoesInventario.find(p => p.id === active.id);
      
      const armaOver = armasHook?.armasInventario.find(a => a.id === over.id);
      const municaoOver = municoesHook?.municoesInventario.find(m => m.id === over.id);
      const protecaoOver = protecoesHook?.protecoesInventario.find(p => p.id === over.id);

      const isMunicao = !!municaoActive;
      const isProtecao = !!protecaoActive;
      const isArmaOver = !!armaOver;
      const isMunicaoOver = !!municaoOver;
      const isProtecaoOver = !!protecaoOver;

      if (isMunicao) {
        if (isArmaOver && armaOver && municaoActive) {
          // Tenta acoplar
          const compativeis = municoesHook?.getMunicoesCompativeis(armaOver.arma.Nome_Item, armaOver.arma.Categoria_Item) || [];
          if (compativeis.some(c => c.Nome_Item === municaoActive.municao.Nome_Item)) {
            armasHook?.acoplarMunicao(armaOver.id, municaoActive.id);
          } else {
            alert(`Munição "${municaoActive.municao.Nome_Item}" é incompatível com a arma "${armaOver.arma.Nome_Item}".`);
          }
        } else if (isMunicaoOver) {
          // reordenar munição
          const oldIndex = (municoesHook?.municoesInventario || []).findIndex(x => x.id === active.id);
          const newIndex = (municoesHook?.municoesInventario || []).findIndex(x => x.id === over.id);
          if (oldIndex !== -1 && newIndex !== -1 && municoesHook?.reordenarMunicoes) {
            municoesHook.reordenarMunicoes(oldIndex, newIndex);
          }
        }
      } else if (isProtecao) {
        if (isProtecaoOver) {
          const oldIndex = (protecoesHook?.protecoesInventario || []).findIndex(x => x.id === active.id);
          const newIndex = (protecoesHook?.protecoesInventario || []).findIndex(x => x.id === over.id);
          if (oldIndex !== -1 && newIndex !== -1 && protecoesHook?.reordenarProtecoes) {
            protecoesHook.reordenarProtecoes(oldIndex, newIndex);
          }
        }
      } else if (armaActive) {
        // reordenar arma
        if (isArmaOver) {
          const oldIndex = (armasHook?.armasInventario || []).findIndex(x => x.id === active.id);
          const newIndex = (armasHook?.armasInventario || []).findIndex(x => x.id === over.id);
          if (oldIndex !== -1 && newIndex !== -1 && armasHook?.reordenarArmas) {
            armasHook.reordenarArmas(oldIndex, newIndex);
          }
        }
      }
    }
  };

  const armasExibidas = (armasHook?.armasInventario || []).filter((item: ArmaInventario) => {
    if (buscaItem && !item.arma.Nome_Item.toLowerCase().includes(buscaItem.toLowerCase())) return false;
    return true;
  });

  const municoesSoltas = (municoesHook?.municoesInventario || []).filter(minv => {
    // É solta se não estiver acoplada a nenhuma arma
    const acoplada = armasHook?.armasInventario.some(a => a.municoesAcopladas?.includes(minv.id));
    if (acoplada) return false;
    if (buscaItem && !minv.municao.Nome_Item.toLowerCase().includes(buscaItem.toLowerCase())) return false;
    return true;
  });

  const municoesGeral = (municoesHook?.municoesInventario || []).filter(minv => {
    if (buscaItem && !minv.municao.Nome_Item.toLowerCase().includes(buscaItem.toLowerCase())) return false;
    return true;
  });

  const protecoesGeral = (protecoesHook?.protecoesInventario || []).filter(pinv => {
    if (buscaItem && !pinv.protecao.Nome_Protecao.toLowerCase().includes(buscaItem.toLowerCase())) return false;
    return true;
  });

  const itensGeral = (itensHook?.itensInventario || []).filter(iinv => {
    if (buscaItem && !iinv.item.Nome_Item.toLowerCase().includes(buscaItem.toLowerCase())) return false;
    if (categoriaFiltro !== 'Geral' && iinv.item.Grupo_Item.trim() !== categoriaFiltro) return false;
    return true;
  });

  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden gap-2 p-2 font-sans text-zinc-300 w-full">
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
      <div className="flex flex-col flex-1 min-h-0 gap-3 mt-2">
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
          <button
            onClick={() => setCategoriaFiltro('Munições')}
            title="Munições"
            className={`w-12 h-12 flex items-center justify-center rounded-t text-2xl transition border-b-2 ${
              categoriaFiltro === 'Munições' 
                ? 'bg-zinc-900 text-red-400 border-b-red-500' 
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50 border-b-transparent'
            }`}
          >
            🔫
          </button>
          <button
            onClick={() => setCategoriaFiltro('Proteções')}
            title="Proteções"
            className={`w-12 h-12 flex items-center justify-center rounded-t text-2xl transition border-b-2 ${
              categoriaFiltro === 'Proteções' 
                ? 'bg-zinc-900 text-red-400 border-b-red-500' 
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50 border-b-transparent'
            }`}
          >
            🛡️
          </button>
          <button
            onClick={() => setCategoriaFiltro('Acessórios')}
            title="Acessórios"
            className={`w-12 h-12 flex items-center justify-center rounded-t text-2xl transition border-b-2 ${
              categoriaFiltro === 'Acessórios' 
                ? 'bg-zinc-900 text-red-400 border-b-red-500' 
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50 border-b-transparent'
            }`}
          >
            🧰
          </button>
          <button
            onClick={() => setCategoriaFiltro('Explosivos')}
            title="Explosivos"
            className={`w-12 h-12 flex items-center justify-center rounded-t text-2xl transition border-b-2 ${
              categoriaFiltro === 'Explosivos' 
                ? 'bg-zinc-900 text-red-400 border-b-red-500' 
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50 border-b-transparent'
            }`}
          >
            💣
          </button>
          <button
            onClick={() => setCategoriaFiltro('Itens Operacionais')}
            title="Itens Operacionais"
            className={`w-12 h-12 flex items-center justify-center rounded-t text-2xl transition border-b-2 ${
              categoriaFiltro === 'Itens Operacionais' 
                ? 'bg-zinc-900 text-red-400 border-b-red-500' 
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50 border-b-transparent'
            }`}
          >
            🔦
          </button>
          <button
            onClick={() => setCategoriaFiltro('Medicamento')}
            title="Medicamento"
            className={`w-12 h-12 flex items-center justify-center rounded-t text-2xl transition border-b-2 ${
              categoriaFiltro === 'Medicamento' 
                ? 'bg-zinc-900 text-red-400 border-b-red-500' 
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50 border-b-transparent'
            }`}
          >
            💊
          </button>
          <button
            onClick={() => setCategoriaFiltro('Itens Paranormais')}
            title="Itens Paranormais"
            className={`w-12 h-12 flex items-center justify-center rounded-t text-2xl transition border-b-2 ${
              categoriaFiltro === 'Itens Paranormais' 
                ? 'bg-zinc-900 text-red-400 border-b-red-500' 
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50 border-b-transparent'
            }`}
          >
            👁️
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
          {categoriaFiltro === 'Munições' && (
            <button
              onClick={() => {
                setMunicaoFiltroNome(undefined);
                setMunicaoFiltroCategoria(undefined);
                setMunicaoTargetArmaId(undefined);
                setModalMunicoesAberto(true);
              }}
              className="bg-green-700 hover:bg-green-600 text-white px-4 py-1.5 rounded font-bold text-sm transition"
            >
              + Adicionar
            </button>
          )}
          {categoriaFiltro === 'Proteções' && (
            <button
              onClick={() => setModalProtecoesAberto(true)}
              className="bg-green-700 hover:bg-green-600 text-white px-4 py-1.5 rounded font-bold text-sm transition"
            >
              + Adicionar
            </button>
          )}
          {itensHook?.gruposUnicos.includes(categoriaFiltro) && (
            <button
              onClick={() => {
                setAbaItensAberta(categoriaFiltro);
                setModalItensAberto(true);
              }}
              className="bg-green-700 hover:bg-green-600 text-white px-4 py-1.5 rounded font-bold text-sm transition"
            >
              + Adicionar
            </button>
          )}
        </div>

        {/* Corpo principal: Lista */}
        <div id="inventario-scroll-container" className="flex-1 flex flex-col gap-2 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
          <DndContext 
            sensors={sensores}
            collisionDetection={closestCenter}
            modifiers={[restrictToTopAndVerticalAxis]}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {(categoriaFiltro === 'Armas' || categoriaFiltro === 'Geral') && (
              <>
              {categoriaFiltro === 'Geral' && armasExibidas.length > 0 && (
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1 mt-2 border-b border-zinc-800 pb-1">Armas</h3>
              )}
              
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
                    onEditar={() => setArmaEditandoId(item.id)}
                  />
                ))}
              </SortableContext>
              
              {categoriaFiltro === 'Armas' && armasExibidas.length === 0 && (
                <p className="text-center text-zinc-600 text-sm py-4">Nenhuma arma no inventário.</p>
              )}
              
              {categoriaFiltro === 'Geral' && armasExibidas.length === 0 && municoesSoltas.length === 0 && (
                <p className="text-center text-zinc-600 text-sm py-4">Inventário vazio.</p>
              )}

              {categoriaFiltro === 'Geral' && municoesSoltas.length > 0 && (
                <>
                  <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1 mt-2 border-b border-zinc-800 pb-1">Munições Soltas</h3>
                  <SortableContext items={municoesSoltas.map(m => m.id)} strategy={verticalListSortingStrategy}>
                    {municoesSoltas.map(item => (
                      <SortableMunicaoItem 
                        key={item.id} 
                        item={item} 
                        isExpanded={!!expandidos[item.id]}
                        toggleExpandir={toggleExpandir}
                        removerMunicao={municoesHook?.removerMunicao || (() => {})} 
                        armaAcopladaNome={armasHook?.armasInventario.find(a => a.municoesAcopladas?.includes(item.id))?.arma.Nome_Item}
                      />
                    ))}
                  </SortableContext>
                </>
              )}
              </>
            )}

            {categoriaFiltro === 'Munições' && (
              <>
                <SortableContext items={municoesGeral.map(m => m.id)} strategy={verticalListSortingStrategy}>
                  {municoesGeral.map(item => (
                    <SortableMunicaoItem 
                      key={item.id} 
                      item={item} 
                      isExpanded={!!expandidos[item.id]}
                      toggleExpandir={toggleExpandir}
                      removerMunicao={municoesHook?.removerMunicao || (() => {})} 
                      armaAcopladaNome={armasHook?.armasInventario.find(a => a.municoesAcopladas?.includes(item.id))?.arma.Nome_Item}
                    />
                  ))}
                </SortableContext>

                {municoesGeral.length === 0 && (
                  <p className="text-center text-zinc-600 text-sm py-4">Nenhuma munição no inventário.</p>
                )}
              </>
            )}

            {(categoriaFiltro === 'Proteções' || categoriaFiltro === 'Geral') && (
              <>
                {categoriaFiltro === 'Geral' && protecoesGeral.length > 0 && (
                  <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1 mt-2 border-b border-zinc-800 pb-1">Proteções</h3>
                )}
                <SortableContext items={protecoesGeral.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  {protecoesGeral.map(item => (
                    <SortableProtecaoItem
                      key={item.id}
                      item={item}
                      isExpanded={!!expandidos[item.id]}
                      toggleExpandir={toggleExpandir}
                      removerProtecao={protecoesHook?.removerProtecao || (() => {})}
                      onEditar={() => setProtecaoEditandoId(item.id)}
                    />
                  ))}
                </SortableContext>
                {categoriaFiltro === 'Proteções' && protecoesGeral.length === 0 && (
                  <p className="text-center text-zinc-600 text-sm py-4">Nenhuma proteção no inventário.</p>
                )}
              </>
            )}

            {(itensHook?.gruposUnicos.includes(categoriaFiltro) || categoriaFiltro === 'Geral') && (
              <>
                {categoriaFiltro === 'Geral' && itensGeral.length > 0 && (
                  <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1 mt-2 border-b border-zinc-800 pb-1">Outros Itens</h3>
                )}
                <SortableContext items={itensGeral.map(i => i.id)} strategy={verticalListSortingStrategy}>
                  {itensGeral.map(item => (
                    <SortableItemGeral 
                      key={item.id} 
                      item={item} 
                      isExpanded={!!expandidos[item.id]}
                      toggleExpandir={(id) => setExpandidos(prev => ({ ...prev, [id]: !prev[id] }))}
                      stringDT={calcularDT(item.item.Dt_Item)}
                      removerItem={itensHook?.removerItem || (() => {})} 
                      onEditar={() => setItemEditandoId(item.id)}
                    />
                  ))}
                </SortableContext>
                {itensGeral.length === 0 && categoriaFiltro !== 'Geral' && (
                  <p className="text-center text-zinc-600 text-sm py-4">
                    {categoriaFiltro === 'Acessórios' ? 'Nenhum acessório no inventário.' :
                     categoriaFiltro === 'Explosivos' ? 'Nenhum explosivo no inventário.' :
                     categoriaFiltro === 'Itens Operacionais' ? 'Nenhum item operacional no inventário.' :
                     categoriaFiltro === 'Medicamento' ? 'Nenhum medicamento no inventário.' :
                     categoriaFiltro === 'Itens Paranormais' ? 'Nenhum item paranormal no inventário.' :
                     `Nenhum item no inventário.`}
                  </p>
                )}
              </>
            )}

            <DragOverlay>
              {activeDragItem ? (
                <div className="rounded border border-zinc-700 bg-zinc-900 p-3 shadow-2xl opacity-90 cursor-grabbing flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-zinc-800 text-zinc-400">
                    {activeDragItem.type === 'municao' ? 'M' : activeDragItem.type === 'protecao' ? 'P' : activeDragItem.type === 'item' ? 'I' : 'A'}
                  </div>
                  <span className="font-bold text-zinc-100 text-sm">{activeDragItem.name}</span>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {categoriaFiltro !== 'Armas' && categoriaFiltro !== 'Geral' && categoriaFiltro !== 'Munições' && categoriaFiltro !== 'Proteções' && !itensHook?.gruposUnicos.includes(categoriaFiltro) && (
            <p className="text-center text-zinc-600 text-sm py-8">Esta categoria ainda não possui itens implementados.</p>
          )}
        </div>
      </div>

      <ModalArmas
        aberto={modalArmasAberto}
        onFechar={() => setModalArmasAberto(false)}
      />
      {modalMunicoesAberto && (
        <ModalMunicoes
          onFechar={() => setModalMunicoesAberto(false)}
          armaFiltroNome={municaoFiltroNome}
          armaFiltroCategoria={municaoFiltroCategoria}
          onSelect={municao => {
            const idGerado = municoesHook?.adicionarMunicao(municao);
            if (idGerado && municaoTargetArmaId) {
              armasHook?.acoplarMunicao(municaoTargetArmaId, idGerado);
            }
            setModalMunicoesAberto(false);
          }}
        />
      )}

      {armaEditandoId && (
        <ModalEditarArma
          armaInventario={armasHook?.armasInventario.find(a => a.id === armaEditandoId)!}
          onSave={(novosDados) => {
            armasHook?.editarArma(armaEditandoId, novosDados);
          }}
          onClose={() => setArmaEditandoId(null)}
        />
      )}

      <ModalProtecoes
        aberto={modalProtecoesAberto}
        onFechar={() => setModalProtecoesAberto(false)}
      />
      <ModalItens
        aberto={modalItensAberto}
        onFechar={() => setModalItensAberto(false)}
        grupoAba={abaItensAberta}
      />

      {protecaoEditandoId && (
        <ModalEditarProtecao
          protecao={protecoesHook?.protecoesInventario.find(p => p.id === protecaoEditandoId)!}
          onSave={(id, novosDados) => {
            protecoesHook?.editarProtecao(id, novosDados);
          }}
          onClose={() => setProtecaoEditandoId(null)}
        />
      )}

      {itemEditandoId && (
        <ModalEditarItem
          itemInventario={itensHook?.itensInventario.find(i => i.id === itemEditandoId)!}
          onSave={(novosDados) => {
            itensHook?.editarItem(itemEditandoId, novosDados);
          }}
          onClose={() => setItemEditandoId(null)}
        />
      )}
    </div>
  );
}

function SortableArmaItem({
  item,
  isExpanded,
  toggleExpandir,
  stringDT,
  removerArma,
  onEditar
}: {
  item: ArmaInventario;
  isExpanded: boolean;
  toggleExpandir: (id: string) => void;
  stringDT: string | null;
  removerArma: (id: string) => void;
  onEditar?: () => void;
}) {
  const { id, arma } = item;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, data: { type: 'arma' } });

  const { municoesHook, armasHook, proficiencias } = useRPG();
  const hasProficiencia = proficiencias.includes(arma.Proficiencia);

  const municoesAcopladasList = (item.municoesAcopladas || []).map(mid => {
    return municoesHook?.municoesInventario.find(m => m.id === mid);
  }).filter(Boolean) as any[];

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded border border-l-4 border-l-red-700 transition-colors ${isDragging ? 'border-red-500 bg-zinc-900 shadow-xl scale-[1.02]' : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900/60'}`}
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
          <div className="flex flex-col gap-1 flex-1 min-w-0 justify-center">
            <span className="font-bold text-sm text-zinc-100 truncate leading-none mt-0.5">{arma.Nome_Item}</span>
            <div className="flex items-center gap-4 text-xs text-zinc-300 mt-0.5">
              <span><span className="font-bold text-red-400">Dado:</span> {arma.Dano_Arma}</span>
              <span><span className="font-bold text-zinc-400">Crítico:</span> {formatarCritico(arma.Critico_Arma, arma.Multiplicador_Arma)}</span>
              {stringDT && <span><span className="font-bold text-red-400">DT:</span> {stringDT}</span>}
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            {arma['Agil?'] && (
              <span className="relative group cursor-help">
                <span className="text-sm text-yellow-400">⚡</span>
                <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block w-52 p-2 bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded z-50 text-center shadow-lg pointer-events-none">
                  Permite que você aplique sua Agilidade em vez de sua Força em testes de ataque e rolagens de dano.
                </span>
              </span>
            )}
            {arma['Automatica?'] && (
              <span className="relative group cursor-help">
                <span className="text-sm text-blue-400">🔄</span>
                <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block w-52 p-2 bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded z-50 text-center shadow-lg pointer-events-none">
                  Pode disparar tiros únicos ou rajadas (-1d20 no ataque, +1 dado de dano).
                </span>
              </span>
            )}
            {!hasProficiencia && (
              <span className="relative group cursor-help">
                <span className="text-sm text-red-500">⚠️</span>
                <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block w-52 p-2 bg-zinc-800 border border-red-700/50 text-xs text-red-200 rounded z-50 text-center shadow-lg pointer-events-none">
                  Se você atacar com uma arma com a qual não seja proficiente, sofre -2d20 nos testes de ataque.
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
          </div>
          
          <div className="flex flex-col gap-1 mt-1">
            <p className="text-zinc-400 text-xs leading-relaxed whitespace-pre-wrap">{formatarTexto(arma.Descricao_Item)}</p>
          </div>
          
          {arma.Fonte_Arma && (
            <div className="mt-2 pt-2 border-t border-zinc-800/50">
              <span className="text-[10px] uppercase tracking-wider text-zinc-600">Fonte: {arma.Fonte_Arma}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-800/50">
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditar?.();
                }}
                className="rounded bg-zinc-800 border border-zinc-700 px-3 py-1 text-xs font-bold uppercase tracking-wider text-zinc-300 transition hover:bg-zinc-700 hover:text-zinc-100"
              >
                Editar Arma
              </button>
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

            {(() => {
              const compativeis = municoesHook?.getMunicoesCompativeis(arma.Nome_Item, arma.Categoria_Item) || [];
              const precisaMunicao = (arma.Capacidade_Municao !== null && arma.Capacidade_Municao > 0) || compativeis.length > 0;
              
              if (!precisaMunicao) return null;

              return (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (compativeis.length === 1) {
                      const idM = municoesHook?.adicionarMunicao(compativeis[0]);
                      if (idM) armasHook?.acoplarMunicao(id, idM);
                    } else {
                      // Múltiplas compatíveis, precisa abrir o modal
                      const invPanelSetters = (window as any)._inventarioPanelSetters;
                      if (invPanelSetters) {
                        invPanelSetters.setMunicaoTargetArmaId(id);
                        invPanelSetters.setMunicaoFiltroNome(arma.Nome_Item);
                        invPanelSetters.setMunicaoFiltroCategoria(arma.Categoria_Item);
                        invPanelSetters.setModalMunicoesAberto(true);
                      }
                    }
                  }}
                  title="Adicionar Munição"
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold hover:bg-zinc-700 hover:text-white transition"
                >
                  +
                </button>
              );
            })()}
          </div>
        </div>
      )}

      {/* Munições Acopladas (renderizadas abaixo do bloco da arma, grudadas) */}
      {municoesAcopladasList.length > 0 && (
        <div className="flex flex-col border-t border-zinc-800 bg-zinc-950/40">
          {municoesAcopladasList.map(minv => (
            <div key={minv.id} className="flex items-center justify-between p-2 pl-8 border-b border-zinc-800/50 last:border-0 group">
              <div className="flex items-center gap-2">
                <span className="text-zinc-600">↳</span>
                <span className="text-sm font-bold text-zinc-300">{minv.municao.Nome_Item}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  armasHook?.desacoplarMunicao(id, minv.id);
                  municoesHook?.removerMunicao(minv.id);
                }}
                title="Remover Munição"
                className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition px-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SortableMunicaoItem({
  item,
  isExpanded,
  toggleExpandir,
  removerMunicao,
  armaAcopladaNome
}: {
  item: any; // MunicaoInventario
  isExpanded: boolean;
  toggleExpandir: (id: string) => void;
  removerMunicao: (id: string) => void;
  armaAcopladaNome?: string;
}) {
  const { id, municao } = item;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, data: { type: 'municao' } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded border border-l-4 border-l-orange-600 transition-colors ${isDragging ? 'border-red-500 bg-zinc-900 shadow-xl scale-[1.02]' : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900/60'}`}
    >
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

        {/* Clicável para expandir */}
        <div 
          className="flex-1 flex items-center justify-between min-w-0 pr-2 cursor-pointer"
          onClick={() => toggleExpandir(id)}
        >
          <div className="flex flex-col gap-1 min-w-0 justify-center">
            <span className="font-bold text-zinc-100 text-sm truncate leading-none mt-0.5">{municao.Nome_Item}</span>
            <span className="text-xs text-zinc-500 truncate mt-0.5">
              {armaAcopladaNome ? (
                <>Em: <span className="font-bold text-zinc-400">{armaAcopladaNome}</span></>
              ) : (
                municao.Tipo_Arma
              )}
            </span>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="w-5 text-center text-zinc-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
          </div>
        </div>
      </div>

      {/* Bloco expandido */}
      {isExpanded && (
        <div className="border-t border-zinc-800 px-3 py-3 text-xs flex flex-col gap-2 bg-zinc-950/80">
          <div className="flex flex-col gap-1 text-xs text-zinc-300">
            <span><span className="text-red-400 font-bold">Categoria:</span> {municao.Categoria_Item}</span>
            <span><span className="text-red-400 font-bold">Espaços:</span> {municao['Espaços_Item']}</span>
          </div>
          
          <div className="flex flex-col gap-1 mt-1">
            <p className="text-zinc-400 text-xs leading-relaxed">{formatarTexto(municao.Descricao_Item)}</p>
          </div>
          
          <div className="flex justify-between mt-3 pt-3 border-t border-zinc-800/50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                removerMunicao(id);
              }}
              className="rounded bg-red-900/40 border border-red-800/50 px-3 py-1 text-xs font-bold uppercase text-red-400 transition hover:bg-red-800 hover:text-red-100"
            >
              Remover Munição
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SortableProtecaoItem({
  item,
  isExpanded,
  toggleExpandir,
  removerProtecao,
  onEditar
}: {
  item: ProtecaoInventario;
  isExpanded: boolean;
  toggleExpandir: (id: string) => void;
  removerProtecao: (id: string) => void;
  onEditar?: () => void;
}) {
  const { id, protecao } = item;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data: { type: 'protecao' } });
  
  const { proficiencias } = useRPG();
  const hasProficiencia = proficiencias.includes(protecao.Proficiencia);

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded border border-l-4 border-l-blue-700 transition-colors ${
        isDragging ? 'border-blue-500 bg-zinc-900 shadow-xl scale-[1.02]' : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900/60'
      }`}
    >
      <div className="flex items-center gap-1 p-3">
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
          <div className="flex flex-col gap-1 flex-1 min-w-0 justify-center">
            <span className="font-bold text-sm text-zinc-100 truncate leading-none mt-0.5">{protecao.Nome_Protecao}</span>
            <div className="flex items-center gap-4 text-xs text-zinc-300 mt-0.5">
              <span><span className="font-bold text-blue-400">Defesa</span> {String(protecao.Defesa_Protecao).startsWith('+') ? protecao.Defesa_Protecao : `+${protecao.Defesa_Protecao}`}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {!hasProficiencia && (
              <span className="relative group cursor-help">
                <span className="text-sm text-red-500">⚠️</span>
                <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block w-52 p-2 bg-zinc-800 border border-red-700/50 text-xs text-red-200 rounded z-50 text-center shadow-lg pointer-events-none">
                  Se você usar uma proteção com a qual não seja proficiente, sofre -2d20 em testes baseados em Força ou Agilidade.
                </span>
              </span>
            )}
            <span className="w-5 text-center text-zinc-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-zinc-800 px-3 py-3 text-xs flex flex-col gap-2 bg-zinc-950/80">
          <div className="flex flex-col gap-1 text-xs text-zinc-300">
            <span><span className="text-blue-400 font-bold">Categoria:</span> {protecao.Categoria_Protecao}</span>
            <span><span className="text-blue-400 font-bold">Espaços:</span> {protecao.Espacos_Protecao}</span>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <div
              className="text-zinc-400 text-xs leading-relaxed"
              dangerouslySetInnerHTML={{ __html: protecao.Descricao_Protecao || '' }}
            />
          </div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-800/50">
            <div className="flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onEditar?.(); }}
                className="rounded bg-zinc-800 border border-zinc-700 px-3 py-1 text-xs font-bold uppercase tracking-wider text-zinc-300 transition hover:bg-zinc-700 hover:text-zinc-100"
              >
                Editar Proteção
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); removerProtecao(id); }}
                className="rounded bg-red-900/40 border border-red-800/50 px-3 py-1 text-xs font-bold uppercase text-red-400 transition hover:bg-red-800 hover:text-red-100"
              >
                Remover Proteção
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
