import { useState, useEffect, useMemo } from 'react';
import { useRPG } from '../../context/RPGContext';
import type { Patente, LimiteCredito } from '../../hooks/useInventario';
import { ModalArmas, formatarCritico } from './ModalArmas';
import type { ArmaInventario, ProtecaoInventario, ItemGeralInventario, MunicaoInventario } from '../../types';
import { ModalProtecoes } from './ModalProtecoes';
import { ModalItens } from './ModalItens';
import { ModalEditarProtecao } from '../../components/ModalEditarProtecao';
import { ModalEditarItem } from '../../components/ModalEditarItem';
import { ModalEditarMunicao } from '../../components/ModalEditarMunicao';
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
import { calcularCategoriaFinal } from '../../utils/rpgRules';
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
  toggleEquipado: (id: string) => void;
}

export const calcularEspacosFinais = (espacoBase: number | string, modificacoesIds?: number[], todasModificacoes?: any[], isRegra43Ativa?: boolean) => {
  let val = Number(String(espacoBase).replace(',', '.').replace(/[^0-9.-]+/g, ''));
  if (isNaN(val)) val = 0;
  
  if (isRegra43Ativa && val === 0.5) {
     val = 0.25;
  }
  
  if (modificacoesIds && modificacoesIds.length > 0 && todasModificacoes) {
    let extra = 0;
    modificacoesIds.forEach(id => {
       const m = todasModificacoes.find(mod => mod.Codigo_Modif === id);
       const nome = m?.Nome_Modif.trim().toLowerCase() || '';
       if (nome === 'discreto' || nome === 'discreta') {
          extra -= 1;
       } else if (nome === 'blindada' || nome === 'reforçada') {
          extra += 1;
       }
    });
    val = Math.max(0, val + extra);
  }
  return val;
};

function SortableItemGeral({ item, isExpanded, toggleExpandir, removerItem, stringDT, onEditar, toggleEquipado }: SortableItemGeralProps) {
  const { modificacoesHook, regrasAutomaticasAtivas } = useRPG();
  const [expandirMods, setExpandirMods] = useState(false);
  const modsAtuais = (item.modificacoes || []).map(id => modificacoesHook.modificacoes.find(m => m.Codigo_Modif === id)).filter(Boolean) as any[];

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
            {!(item.item.Grupo_Item?.toLowerCase().includes('explosivo') || stringDT) && (
              <span className="text-xs text-zinc-400 font-medium">Categoria {calcularCategoriaFinal(item.item.Categoria_Item, item.modificacoes, modificacoesHook.modificacoes)}</span>
            )}
            {stringDT && (
              <div className="flex items-center gap-4 text-xs text-zinc-300 mt-0.5">
                <span><span className="font-bold text-red-400">DT:</span> {stringDT}</span>
              </div>
            )}
            {modsAtuais.length > 0 && (
              <div className="flex items-center mt-1 min-w-0">
                <span className="text-[11px] text-zinc-400 truncate italic">
                  {modsAtuais.map(m => m.Nome_Modif).join(' • ')}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {(item.item.Nome_Item.toLowerCase().includes('vestimenta') || item.item.Nome_Item.toLowerCase().includes('amuleto sagrado')) && (
            <input
              type="checkbox"
              checked={!!item.equipado}
              onPointerDown={(e) => e.stopPropagation()}
              onChange={() => toggleEquipado(item.id)}
              className="w-5 h-5 cursor-pointer accent-red-600"
              title={item.equipado ? "Desequipar" : "Equipar item"}
            />
          )}
          <div onClick={() => toggleExpandir(item.id)} className="w-5 text-center text-zinc-500 text-xs flex-shrink-0 cursor-pointer">{isExpanded ? '▲' : '▼'}</div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="border-t border-zinc-800 px-3 py-3 text-xs bg-zinc-950/80 flex flex-col gap-2 relative z-10" onClick={e => e.stopPropagation()}>
          <div className="flex flex-col gap-1 mt-1">
            <span><span className="text-red-400 font-bold">Categoria:</span> {calcularCategoriaFinal(item.item.Categoria_Item, item.modificacoes, modificacoesHook.modificacoes)}</span>
            <span><span className="text-red-400 font-bold">Espaços:</span> {calcularEspacosFinais(item.item.Espacos_Itens, item.modificacoes, modificacoesHook.modificacoes, regrasAutomaticasAtivas?.has(43))}</span>
            {modsAtuais.length > 0 && (
              <div className="mt-2 border border-zinc-800 rounded bg-zinc-900/50 overflow-hidden">
                <div 
                  className="px-2 py-1.5 bg-zinc-800/40 flex justify-between items-center cursor-pointer hover:bg-zinc-800/60 transition"
                  onClick={(e) => { e.stopPropagation(); setExpandirMods(!expandirMods); }}
                >
                  <div className="flex flex-wrap gap-1 items-center">
                    <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider mr-1">Modificações</span>
                    {!expandirMods && modsAtuais.map(m => (
                      <span key={m.Codigo_Modif} className="px-1.5 py-0.5 rounded bg-zinc-800/60 border border-zinc-700/50 text-[10px] font-bold text-zinc-300 truncate max-w-[120px]">
                        {m.Nome_Modif}
                      </span>
                    ))}
                  </div>
                  <span className="text-zinc-500 text-[10px] ml-2 flex-shrink-0">{expandirMods ? '▲ Ocultar' : '▼ Expandir'}</span>
                </div>
                {expandirMods && (
                  <div className="p-2 flex flex-col gap-2 max-h-[200px] overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {modsAtuais.map(m => (
                      <div key={m.Codigo_Modif} className="flex flex-col gap-0.5 pb-2 border-b border-zinc-800/50 last:border-0 last:pb-0">
                        <span className="text-xs font-bold text-zinc-200">{m.Nome_Modif}</span>
                        <p className="text-[11px] text-zinc-400 leading-relaxed whitespace-pre-wrap">{formatarTexto(m.Descricao_Modif || '')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <p className="text-zinc-400 text-xs leading-relaxed whitespace-pre-wrap">{formatarTexto(item.item.Desc_Item)}</p>
          </div>
          {item.item.Fonte_Item && (
            <div className="mt-2 pt-2 border-t border-zinc-800/50">
              <span className="text-[10px] uppercase tracking-wider text-zinc-600">Fonte: {item.item.Fonte_Item}</span>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-zinc-800/50">
            {onEditar && item.id !== 'coronhada-virtual' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditar();
                }}
                className="text-xs px-3 py-1.5 rounded bg-zinc-900 border border-zinc-700 hover:border-yellow-700 hover:bg-yellow-900/20 text-zinc-300 hover:text-yellow-400 transition-colors"
              >
                Editar
              </button>
            )}
            {item.id !== 'coronhada-virtual' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removerItem(item.id);
                }}
                className="text-xs text-red-500 hover:text-red-400 bg-red-950/30 hover:bg-red-900/50 px-3 py-1.5 rounded border border-red-900/50 transition-colors"
              >
                Remover
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function InventarioPanel() {
  const { inventarioHook, atributosFinais, regrasAutomaticasAtivas, armasHook, municoesHook, protecoesHook, itensHook, status, modificacoesHook, proficienciasTotais } = useRPG();
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

  const [editingItem, setEditingItem] = useState<{ id: string, tipo: 'arma' | 'protecao' | 'item' | 'municao' } | null>(null);
  const [activeDragItem, setActiveDragItem] = useState<{ id: string, type: 'arma' | 'municao' | 'protecao' | 'item', name?: string } | null>(null);

  const getArmaParaEditar = () => editingItem?.tipo === 'arma' ? armasHook.armasInventario.find(i => i.id === editingItem.id) : null;
  const getProtecaoParaEditar = () => editingItem?.tipo === 'protecao' ? protecoesHook.protecoesInventario.find(i => i.id === editingItem.id) : null;
  const getItemParaEditar = () => editingItem?.tipo === 'item' ? itensHook.itensInventario.find(i => i.id === editingItem.id) : null;
  const getMunicaoParaEditar = () => editingItem?.tipo === 'municao' ? municoesHook.municoesInventario.find(i => i.id === editingItem.id) : null;

  const cargaMaxima = 5 + (atributosFinais.FOR * 5) + (regrasAutomaticasAtivas.has(23) ? 5 : 0) + (regrasAutomaticasAtivas.has(43) ? atributosFinais.INT : 0);
  
  const cargaAtual = useMemo(() => {
    let total = 0;
    armasHook?.armasInventario.forEach(i => total += calcularEspacosFinais(i.arma['Espaços_Item'], i.modificacoes, modificacoesHook.modificacoes, regrasAutomaticasAtivas.has(43)));
    municoesHook?.municoesInventario.forEach(i => total += calcularEspacosFinais(i.municao['Espaços_Item'], i.modificacoes, modificacoesHook.modificacoes, regrasAutomaticasAtivas.has(43)));
    protecoesHook?.protecoesInventario.forEach(i => total += calcularEspacosFinais(i.protecao.Espacos_Protecao, i.modificacoes, modificacoesHook.modificacoes, regrasAutomaticasAtivas.has(43)));
    itensHook?.itensInventario.forEach(i => total += calcularEspacosFinais(i.item.Espacos_Itens, i.modificacoes, modificacoesHook.modificacoes, regrasAutomaticasAtivas.has(43)));
    return total;
  }, [armasHook?.armasInventario, municoesHook?.municoesInventario, protecoesHook?.protecoesInventario, itensHook?.itensInventario, modificacoesHook.modificacoes]);
  
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

  const calcularDT = (dtItem: string | null, isExplosivo: boolean = false): string | null => {
    if (!dtItem) return null;
    
    if (dtItem.includes('/')) {
      return dtItem.split('/').map(part => calcularDT(part.trim(), isExplosivo)).join(' / ');
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
    
    if (isExplosivo && regrasAutomaticasAtivas.has(29) && typeof calculado === 'number') {
      calculado += atributosFinais.INT;
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
      } else {
        const itemActive = itensHook?.itensInventario.find(i => i.id === active.id);
        const itemOver = itensHook?.itensInventario.find(i => i.id === over.id);
        if (itemActive && itemOver) {
          const oldIndex = (itensHook?.itensInventario || []).findIndex(x => x.id === active.id);
          const newIndex = (itensHook?.itensInventario || []).findIndex(x => x.id === over.id);
          if (oldIndex !== -1 && newIndex !== -1 && itensHook?.reordenarItens) {
            itensHook.reordenarItens(oldIndex, newIndex);
          }
        }
      }
    }
  };

  let armasExibidas = [...(armasHook?.armasInventario || [])];
  
  const armasDeFogo = armasExibidas.filter(a => a.arma.Tipo_Arma?.toLowerCase().includes('fogo'));
  if (armasDeFogo.length > 0) {
    const temDuasMaos = armasDeFogo.some(a => a.arma.Empunhadura_Arma?.toLowerCase().includes('duas'));
    const danoCoronhada = temDuasMaos ? '1d6' : '1d4';
    
    const coronhadaVirtual: ArmaInventario = {
      id: 'coronhada-virtual',
      arma: {
        codigo_arma: -1,
        Nome_Item: 'Coronhada',
        Desc_Item: 'Você pode usar uma arma de fogo como uma arma corpo a corpo.',
        Proficiencia: 'Armas Simples',
        Tipo_Arma: 'Corpo a Corpo',
        Empunhadura_Arma: temDuasMaos ? 'Duas Mãos' : 'Uma Mão',
        Dano_Arma: danoCoronhada,
        Critico_Arma: 20,
        Multiplicador_Arma: 2,
        Tipo_Dano_Arma: 'Impacto',
        Alcance_Arma: '-',
        Categoria_Item: '0',
        Espacos_Item: 0
      } as any,
      modificacoes: [],
      municoesAcopladas: []
    };
    armasExibidas.push(coronhadaVirtual);
  }

  armasExibidas = armasExibidas.filter((item: ArmaInventario) => {
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
                    stringDT={calcularDT(item.arma.dt_item, item.arma.Categoria_Item?.toLowerCase().includes('explosivos') || item.arma.Nome_Item?.toLowerCase().includes('explosivo'))}
                    removerArma={armasHook?.removerArma || (() => {})}
                    onEditar={() => setArmaEditandoId(item.id)}
                  />
                ))}
              </SortableContext>
              
              {categoriaFiltro === 'Armas' && armasExibidas.length === 0 && (
                <p className="text-center text-zinc-600 text-sm py-4">Nenhuma arma no inventário.</p>
              )}
              
              {categoriaFiltro === 'Geral' && armasExibidas.length === 0 && municoesSoltas.length === 0 && protecoesGeral.length === 0 && itensGeral.length === 0 && (
                <p className="text-center text-zinc-600 text-sm py-4">Inventário vazio.</p>
              )}

              {categoriaFiltro === 'Geral' && municoesSoltas.length > 0 && (
                <>
                  <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1 mt-2 border-b border-zinc-800 pb-1">Munições Soltas</h3>
                  <SortableContext items={municoesSoltas.map(m => m.id)} strategy={verticalListSortingStrategy}>
                    {municoesSoltas.map(item => (
                      <SortableMunicaoItem 
                        key={item.id} 
                        id={item.id}
                        item={item} 
                        isExpanded={!!expandidos[item.id]}
                        toggleExpandir={toggleExpandir}
                        removerItem={municoesHook?.removerMunicao || (() => {})} 
                        onEditar={() => setEditingItem({ id: item.id, tipo: 'municao' })}
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
                      id={item.id}
                      item={item} 
                      isExpanded={!!expandidos[item.id]}
                      toggleExpandir={toggleExpandir}
                      removerItem={municoesHook?.removerMunicao || (() => {})} 
                      onEditar={() => setEditingItem({ id: item.id, tipo: 'municao' })}
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
                      toggleEquipado={protecoesHook?.toggleEquipado || (() => {})}
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
                {categoriaFiltro === 'Geral' ? (
                  Array.from(new Set(itensGeral.map(i => i.item.Grupo_Item.trim()))).sort().map(grupo => {
                    const itensDoGrupo = itensGeral.filter(i => i.item.Grupo_Item.trim() === grupo);
                    if (itensDoGrupo.length === 0) return null;
                    return (
                      <div key={grupo} className="flex flex-col gap-2">
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1 mt-2 border-b border-zinc-800 pb-1">{grupo}</h3>
                        <SortableContext items={itensDoGrupo.map(i => i.id)} strategy={verticalListSortingStrategy}>
                          {itensDoGrupo.map(item => (
                            <SortableItemGeral 
                              key={item.id} 
                              item={item} 
                              isExpanded={!!expandidos[item.id]}
                              toggleExpandir={(id) => setExpandidos(prev => ({ ...prev, [id]: !prev[id] }))}
                              stringDT={calcularDT(item.item.Dt_Item, item.item.Grupo_Item?.toLowerCase().includes('explosivos'))}
                              removerItem={itensHook?.removerItem || (() => {})}
                              onEditar={() => setEditingItem({ id: item.id, tipo: 'item' })}
                              toggleEquipado={itensHook?.toggleEquipado || (() => {})}
                            />
                          ))}
                        </SortableContext>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <SortableContext items={itensGeral.map(i => i.id)} strategy={verticalListSortingStrategy}>
                      {itensGeral.map(item => (
                        <SortableItemGeral 
                          key={item.id} 
                          item={item} 
                          isExpanded={!!expandidos[item.id]}
                          toggleExpandir={(id) => setExpandidos(prev => ({ ...prev, [id]: !prev[id] }))}
                          stringDT={calcularDT(item.item.Dt_Item, item.item.Grupo_Item?.toLowerCase().includes('explosivos'))}
                          removerItem={itensHook?.removerItem || (() => {})}
                          onEditar={() => setEditingItem({ id: item.id, tipo: 'item' })}
                          toggleEquipado={itensHook?.toggleEquipado || (() => {})}
                        />
                      ))}
                    </SortableContext>
                    {itensGeral.length === 0 && (
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
          onSave={(novosDados, modificacoes) => {
            armasHook?.editarArma(armaEditandoId, novosDados, modificacoes);
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
          onSave={(id, novosDados, modificacoes) => {
            protecoesHook?.editarProtecao(id, novosDados, modificacoes);
          }}
          onClose={() => setProtecaoEditandoId(null)}
        />
      )}

      {editingItem?.tipo === 'item' && getItemParaEditar() && (
        <ModalEditarItem
          itemInventario={getItemParaEditar()!}
          onSave={(itemEditado, modificacoes) => {
            itensHook.editarItem(editingItem.id, itemEditado, modificacoes);
            setEditingItem(null);
          }}
          onClose={() => setEditingItem(null)}
        />
      )}

      {editingItem?.tipo === 'municao' && getMunicaoParaEditar() && (
        <ModalEditarMunicao
          itemInventario={getMunicaoParaEditar()!}
          onSave={(municaoEditada, modificacoes) => {
            municoesHook.atualizarMunicao(editingItem.id, { municao: { ...getMunicaoParaEditar()!.municao, ...municaoEditada }, modificacoes });
            setEditingItem(null);
          }}
          onClose={() => setEditingItem(null)}
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

  const { municoesHook, armasHook, proficienciasTotais, modificacoesHook, atributosFinais, status, regrasAutomaticasAtivas } = useRPG();
  const hasProficiencia = proficienciasTotais.includes(arma.Proficiencia);
  const [expandirMods, setExpandirMods] = useState(false);

  const modsAtuais = (item.modificacoes || []).map(id => modificacoesHook.modificacoes.find(m => m.Codigo_Modif === id)).filter(Boolean) as any[];

  const municoesAcopladasList = (item.municoesAcopladas || []).map(mid => {
    return municoesHook?.municoesInventario.find(m => m.id === mid);
  }).filter(Boolean) as any[];

  const calcularEstatisticasFinaisArma = () => {
    let dano = arma.Dano_Arma || '';
    let espacos = calcularEspacosFinais(arma['Espaços_Item'], item.modificacoes, modificacoesHook.modificacoes, regrasAutomaticasAtivas?.has(43));
    let automatica = !!arma['Automatica?'];
    let critico = arma.Critico_Arma || 20;
    let alcance = arma.Alcance_Item || '';
    let multiplicador = arma.Multiplicador_Arma || 2;
    let danoSecundario = arma.Dano_Secundario || '';

    // Mods da arma
    for (const mod of modsAtuais) {
      const nome = mod.Nome_Modif.trim().toLowerCase();
      if (nome === 'calibre grosso') {
        dano = dano.replace(/(\d+)d(\d+)/i, (match, p1, p2) => `${Number(p1) + 1}d${p2}`);
      }

      if (nome === 'ferrolho automático') {
        automatica = true;
      }
      if (nome === 'mira laser' || nome === 'perigosa') {
        critico -= 2;
      }
      if (nome === 'mira telescópica') {
        const ord = ['Curto', 'Médio', 'Longo', 'Extremo', 'Ilimitado'];
        const idx = ord.indexOf(alcance);
        if (idx !== -1 && idx < ord.length - 1) {
          alcance = ord[idx + 1];
        }
      }
    }

    // Mods das munições acopladas
    for (const mun of municoesAcopladasList) {
      const munMods = (mun.modificacoes || []).map((id: number) => modificacoesHook.modificacoes.find(m => m.Codigo_Modif === id)).filter(Boolean) as any[];
      for (const mMod of munMods) {
        const mNome = mMod.Nome_Modif.trim().toLowerCase();
        if (mNome === 'dum dum') {
          multiplicador += 1;
        }
        if (mNome === 'explosiva') {
          danoSecundario = danoSecundario ? `${danoSecundario} + 2d6` : '+2d6';
        }
      }
    }

    return { dano, espacos, automatica, critico, alcance, multiplicador, danoSecundario };
  };

  const stats = calcularEstatisticasFinaisArma();

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
            <span className="font-bold text-sm text-zinc-100 truncate leading-none mt-0.5">{arma.Nome_Item}</span>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-300 mt-0.5">
              <span><span className="font-bold text-red-400">Dado:</span> {stats.dano}</span>
              {stats.danoSecundario && <span><span className="font-bold text-red-400">Secundário:</span> {stats.danoSecundario}</span>}
              <span><span className="font-bold text-zinc-400">Crítico:</span> {formatarCritico(stats.critico, stats.multiplicador)}</span>
              {stringDT && <span><span className="font-bold text-red-400">DT:</span> {stringDT}</span>}
            </div>
            {modsAtuais.length > 0 && (
              <div className="flex items-center mt-1 min-w-0">
                <span className="text-[11px] text-zinc-400 truncate italic">
                  {modsAtuais.map(m => m.Nome_Modif).join(' • ')}
                </span>
              </div>
            )}
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
            {stats.automatica && (
              <span className="relative group cursor-help">
                <span className="text-sm text-blue-400">🔄</span>
                <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block w-52 p-2 bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded z-50 text-center shadow-lg pointer-events-none">
                  Pode disparar rajadas. Quando dispara uma rajada, você sofre -1d20 no teste de ataque, mas causa 1 dado de dano adicional do mesmo tipo.
                </span>
              </span>
            )}
            {!hasProficiencia && (
              <span className="relative group cursor-help">
                <span className="text-sm text-red-500">⚠️</span>
                <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block w-52 p-2 bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded z-50 text-center shadow-lg pointer-events-none">
                  Você não possui proficiência com esta arma, recebendo -2d20 em testes de ataque com ela.
                </span>
              </span>
            )}
            <span className="w-5 text-center text-zinc-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="border-t border-zinc-800 px-3 py-3 text-xs flex flex-col gap-2 bg-zinc-950/80">
          <div>
            <span className="font-bold text-zinc-200">{arma.Proficiencia}</span>
            <span className="text-zinc-600"> — </span>
            <span className="italic text-zinc-400">{arma.Tipo_Arma}</span>
          </div>
          <div className="flex flex-col gap-1 text-xs text-zinc-300">
            <span><span className="text-red-400 font-bold">Categoria:</span> {calcularCategoriaFinal(arma.Categoria_Item, item.modificacoes, modificacoesHook.modificacoes)}</span>
            {stats.alcance && <span><span className="text-red-400 font-bold">Alcance:</span> {stats.alcance}</span>}
            <span><span className="text-red-400 font-bold">Tipo:</span> {arma.Tipo_Dano_Arma}</span>
            {stats.danoSecundario && <span><span className="text-red-400 font-bold">Dano Secundário:</span> {stats.danoSecundario}</span>}
            <span><span className="text-red-400 font-bold">Espaços:</span> {stats.espacos}</span>
            {modsAtuais.length > 0 && (
              <div className="mt-2 border border-zinc-800 rounded bg-zinc-900/50 overflow-hidden">
                <div 
                  className="px-2 py-1.5 bg-zinc-800/40 flex justify-between items-center cursor-pointer hover:bg-zinc-800/60 transition"
                  onClick={(e) => { e.stopPropagation(); setExpandirMods(!expandirMods); }}
                >
                  <div className="flex flex-wrap gap-1 items-center">
                    <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider mr-1">Modificações</span>
                    {!expandirMods && modsAtuais.map(m => (
                      <span key={m.Codigo_Modif} className="px-1.5 py-0.5 rounded bg-zinc-800/60 border border-zinc-700/50 text-[10px] font-bold text-zinc-300 truncate max-w-[120px]">
                        {m.Nome_Modif}
                      </span>
                    ))}
                  </div>
                  <span className="text-zinc-500 text-[10px] ml-2 flex-shrink-0">{expandirMods ? '▲ Ocultar' : '▼ Expandir'}</span>
                </div>
                {expandirMods && (
                  <div className="p-2 flex flex-col gap-2 max-h-[200px] overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {modsAtuais.map(m => (
                      <div key={m.Codigo_Modif} className="flex flex-col gap-0.5 pb-2 border-b border-zinc-800/50 last:border-0 last:pb-0">
                        <span className="text-xs font-bold text-zinc-200">{m.Nome_Modif}</span>
                        <p className="text-[11px] text-zinc-400 leading-relaxed whitespace-pre-wrap">{formatarTexto(m.Descricao_Modif || '')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-1 mt-1">
            <p className="text-zinc-400 text-xs leading-relaxed whitespace-pre-wrap">{formatarTexto(arma.Descricao_Item)}</p>
          </div>
          
          <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-zinc-800/50">
            {id !== 'coronhada-virtual' && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditar?.();
                  }}
                  className="text-xs px-3 py-1.5 rounded bg-zinc-900 border border-zinc-700 hover:border-yellow-700 hover:bg-yellow-900/20 text-zinc-300 hover:text-yellow-400 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removerArma(id);
                  }}
                  className="text-xs text-red-500 hover:text-red-400 bg-red-950/30 hover:bg-red-900/50 px-3 py-1.5 rounded border border-red-900/50 transition-colors"
                >
                  Remover
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface SortableMunicaoItemProps {
  id: string;
  item: MunicaoInventario;
  isExpanded: boolean;
  toggleExpandir: (id: string) => void;
  removerItem: (id: string) => void;
  onEditar?: () => void;
}

function SortableMunicaoItem({ id, item, isExpanded, toggleExpandir, removerItem, onEditar }: SortableMunicaoItemProps) {
  const { municao } = item;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data: { type: 'municao' } });

  const { modificacoesHook, regrasAutomaticasAtivas } = useRPG();
  const [expandirMods, setExpandirMods] = useState(false);
  const modsAtuais = (item.modificacoes || []).map(id => modificacoesHook.modificacoes.find(m => m.Codigo_Modif === id)).filter(Boolean) as any[];

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
          className="flex-1 flex items-center justify-between min-w-0 pr-2 cursor-pointer"
          onClick={() => toggleExpandir(id)}
        >
          <div className="flex flex-col gap-1 min-w-0 justify-center">
            <span className="font-bold text-zinc-100 text-sm truncate leading-none mt-0.5">{municao.Nome_Item}</span>
            <div className="flex items-center gap-4 text-xs text-zinc-300 mt-0.5">
              <span><span className="font-bold text-yellow-400">Categoria:</span> {municao.Categoria_Item}</span>
            </div>
            {modsAtuais.length > 0 && (
              <div className="flex items-center mt-1 min-w-0">
                <span className="text-[11px] text-zinc-400 truncate italic">
                  {modsAtuais.map(m => m.Nome_Modif).join(' • ')}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <div onClick={() => toggleExpandir(id)} className="w-5 text-center text-zinc-500 text-xs flex-shrink-0 cursor-pointer">{isExpanded ? '▲' : '▼'}</div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-zinc-800 px-3 py-3 text-xs flex flex-col gap-2 bg-zinc-950/80">
          <div className="flex flex-col gap-1 text-xs text-zinc-300">
            <span><span className="text-yellow-400 font-bold">Categoria:</span> {calcularCategoriaFinal(municao.Categoria_Item, item.modificacoes, modificacoesHook.modificacoes)}</span>
            <span><span className="text-yellow-400 font-bold">Espaços:</span> {calcularEspacosFinais(municao['Espaços_Item'], item.modificacoes, modificacoesHook.modificacoes, regrasAutomaticasAtivas.has(43))}</span>
            {modsAtuais.length > 0 && (
              <div className="mt-2 border border-zinc-800 rounded bg-zinc-900/50 overflow-hidden">
                <div 
                  className="px-2 py-1.5 bg-zinc-800/40 flex justify-between items-center cursor-pointer hover:bg-zinc-800/60 transition"
                  onClick={(e) => { e.stopPropagation(); setExpandirMods(!expandirMods); }}
                >
                  <div className="flex flex-wrap gap-1 items-center">
                    <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider mr-1">Modificações</span>
                    {!expandirMods && modsAtuais.map(m => (
                      <span key={m.Codigo_Modif} className="px-1.5 py-0.5 rounded bg-zinc-800/60 border border-zinc-700/50 text-[10px] font-bold text-zinc-300 truncate max-w-[120px]">
                        {m.Nome_Modif}
                      </span>
                    ))}
                  </div>
                  <span className="text-zinc-500 text-[10px] ml-2 flex-shrink-0">{expandirMods ? '▲ Ocultar' : '▼ Expandir'}</span>
                </div>
                {expandirMods && (
                  <div className="p-2 flex flex-col gap-2 max-h-[200px] overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {modsAtuais.map(m => (
                      <div key={m.Codigo_Modif} className="flex flex-col gap-0.5 pb-2 border-b border-zinc-800/50 last:border-0 last:pb-0">
                        <span className="text-xs font-bold text-zinc-200">{m.Nome_Modif}</span>
                        <p className="text-[11px] text-zinc-400 leading-relaxed whitespace-pre-wrap">{formatarTexto(m.Descricao_Modif || '')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-1 mt-1">
            <div 
              className="text-zinc-400 text-xs leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: municao.Descricao_Item }}
            />
          </div>
          
          <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-zinc-800/50">
            {onEditar && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEditar();
                }}
                className="text-xs px-3 py-1.5 rounded bg-zinc-900 border border-zinc-700 hover:border-yellow-700 hover:bg-yellow-900/20 text-zinc-300 hover:text-yellow-400 transition-colors"
              >
                Editar
              </button>
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                removerItem(id);
              }}
              className="text-xs text-red-500 hover:text-red-400 bg-red-950/30 hover:bg-red-900/50 px-3 py-1.5 rounded border border-red-900/50 transition-colors"
            >
              Remover
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
  onEditar,
  toggleEquipado
}: {
  item: ProtecaoInventario;
  isExpanded: boolean;
  toggleExpandir: (id: string) => void;
  removerProtecao: (id: string) => void;
  onEditar?: () => void;
  toggleEquipado: (id: string) => void;
}) {
  const { id, protecao, equipado } = item;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data: { type: 'protecao' } });
  const { proficienciasTotais, modificacoesHook, regrasAutomaticasAtivas } = useRPG();
  const hasProficiencia = protecao.Proficiencia === 'Nenhuma' || proficienciasTotais.includes(protecao.Proficiencia);
  const [expandirMods, setExpandirMods] = useState(false);

  const modsAtuais = (item.modificacoes || []).map(id => modificacoesHook.modificacoes.find(m => m.Codigo_Modif === id)).filter(Boolean) as any[];

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
              <span><span className="font-bold text-blue-400">Defesa</span> {
                (() => {
                  const extraDef = modsAtuais.some(m => m?.Nome_Modif?.trim().toLowerCase() === 'reforçada') ? 2 : 0;
                  const defVal = Number(String(protecao.Defesa_Protecao || '0').replace(/[^0-9.-]+/g, ''));
                  const total = (isNaN(defVal) ? 0 : defVal) + extraDef;
                  return total >= 0 ? `+${total}` : `${total}`;
                })()
              }</span>
            </div>
            {modsAtuais.length > 0 && (
              <div className="flex items-center mt-1 min-w-0">
                <span className="text-[11px] text-zinc-400 truncate italic">
                  {modsAtuais.map(m => m.Nome_Modif).join(' • ')}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-shrink-0">
          <input
            type="checkbox"
            checked={!!equipado}
            onPointerDown={(e) => e.stopPropagation()}
            onChange={() => toggleEquipado(id)}
            className="w-5 h-5 cursor-pointer accent-blue-600"
            title={equipado ? "Desequipar" : "Equipar proteção"}
          />
          {!hasProficiencia && (
            <span className="relative group cursor-help">
              <span className="text-sm text-red-500">⚠️</span>
              <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block w-52 p-2 bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded z-50 text-center shadow-lg pointer-events-none">
                Se você usar uma proteção com a qual não seja proficiente, sofre -2d20 em testes baseados em Força ou Agilidade.
              </span>
            </span>
          )}
          <div onClick={() => toggleExpandir(id)} className="w-5 text-center text-zinc-500 text-xs cursor-pointer">{isExpanded ? '▲' : '▼'}</div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-zinc-800 px-3 py-3 text-xs flex flex-col gap-2 bg-zinc-950/80">
          <div className="flex flex-col gap-1 text-xs text-zinc-300">
            <span><span className="text-blue-400 font-bold">Proficiência:</span> {protecao.Proficiencia}</span>
            <span><span className="text-blue-400 font-bold">Categoria:</span> {calcularCategoriaFinal(protecao.Categoria_Protecao, item.modificacoes, modificacoesHook.modificacoes)}</span>
            <span><span className="text-blue-400 font-bold">Espaços:</span> {calcularEspacosFinais(protecao.Espacos_Protecao, item.modificacoes, modificacoesHook.modificacoes, regrasAutomaticasAtivas.has(43))}</span>
            {protecao.Penalidade_Protecao && <span className="flex items-center gap-1" title="Penalidade"><span className="text-sm">🏋️</span> {protecao.Penalidade_Protecao}</span>}
            {modsAtuais.length > 0 && (
              <div className="mt-2 border border-zinc-800 rounded bg-zinc-900/50 overflow-hidden">
                <div 
                  className="px-2 py-1.5 bg-zinc-800/40 flex justify-between items-center cursor-pointer hover:bg-zinc-800/60 transition"
                  onClick={(e) => { e.stopPropagation(); setExpandirMods(!expandirMods); }}
                >
                  <div className="flex flex-wrap gap-1 items-center">
                    <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider mr-1">Modificações</span>
                    {!expandirMods && modsAtuais.map(m => (
                      <span key={m.Codigo_Modif} className="px-1.5 py-0.5 rounded bg-zinc-800/60 border border-zinc-700/50 text-[10px] font-bold text-zinc-300 truncate max-w-[120px]">
                        {m.Nome_Modif}
                      </span>
                    ))}
                  </div>
                  <span className="text-zinc-500 text-[10px] ml-2 flex-shrink-0">{expandirMods ? '▲ Ocultar' : '▼ Expandir'}</span>
                </div>
                {expandirMods && (
                  <div className="p-2 flex flex-col gap-2 max-h-[200px] overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {modsAtuais.map(m => (
                      <div key={m.Codigo_Modif} className="flex flex-col gap-0.5 pb-2 border-b border-zinc-800/50 last:border-0 last:pb-0">
                        <span className="text-xs font-bold text-zinc-200">{m.Nome_Modif}</span>
                        <p className="text-[11px] text-zinc-400 leading-relaxed whitespace-pre-wrap">{formatarTexto(m.Descricao_Modif || '')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <div
              className="text-zinc-400 text-xs leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: protecao.Descricao_Protecao || '' }}
            />
          </div>
          <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-zinc-800/50">
            <button
              onClick={(e) => { e.stopPropagation(); onEditar?.(); }}
              className="text-xs px-3 py-1.5 rounded bg-zinc-900 border border-zinc-700 hover:border-yellow-700 hover:bg-yellow-900/20 text-zinc-300 hover:text-yellow-400 transition-colors"
            >
              Editar
            </button>
            
            <button
              onClick={(e) => { e.stopPropagation(); removerProtecao(id); }}
              className="text-xs text-red-500 hover:text-red-400 bg-red-950/30 hover:bg-red-900/50 px-3 py-1.5 rounded border border-red-900/50 transition-colors"
            >
              Remover
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
