import { useState, useEffect, useMemo } from 'react';
import { useRPG } from '../../context/RPGContext';
import type { Patente, LimiteCredito } from '../../hooks/useInventario';
import { ModalArmas, formatarCritico } from './ModalArmas';
import type { ArmaInventario, ProtecaoInventario, ItemGeralInventario, MunicaoInventario, ItemAmaldicoadoInventario } from '../../types';
import { ModalProtecoes } from './ModalProtecoes';
import { ModalItens } from './ModalItens';
import { ModalMunicoes } from './ModalMunicoes';
import { ModalItensAmaldicoados } from './ModalItensAmaldicoados';
import { ModalUnificadoItens } from './ModalUnificadoItens';
import { ModalEditarProtecao } from '../../components/ModalEditarProtecao';
import { ModalEditarItem } from '../../components/ModalEditarItem';
import { ModalEditarMunicao } from '../../components/ModalEditarMunicao';
import { ModalEditarItemAmaldicoado } from '../../components/ModalEditarItemAmaldicoado';
import { CustomSelect } from '../../components/CustomSelect';
import { Collapse } from '../../components/Collapse';
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
import { ModalGranadas } from './ModalGranadas';
import { ModalAntena } from './ModalAntena';
import { ModalEditarArma } from '../../components/ModalEditarArma';
import { SortableItemAmaldicoado } from '../../components/SortableItemAmaldicoado';

import { formatarTexto } from '../../utils/formatters';
import { calcularCategoriaFinal } from '../../utils/rpgRules';

  

const CORES_ELEMENTOS_INV: Record<string, string> = {
  sangue: '#b31717',
  conhecimento: '#b07902',
  energia: '#af27d9',
  morte: '#000000',
  medo: '#ffffff',
  outros: '#888888',
};

function obterCorBadgeInv(elemento: string): string {
  if (!elemento) return '#666';
  const elementoStr = elemento.toLowerCase();
  return CORES_ELEMENTOS_INV[elementoStr] || '#666';
}

const getCorElementoBarra = (elemento: string) => {
  const e = elemento.toLowerCase();
  if (e.includes('sangue')) return 'bg-red-900/50';
  if (e.includes('morte')) return 'bg-zinc-700';
  if (e.includes('energia')) return 'bg-purple-900/50';
  if (e.includes('conhec')) return 'bg-yellow-900/50';
  if (e.includes('medo')) return 'bg-white/50';
  return 'bg-zinc-800';
};

    const getCorElementoTexto = (elemento: string) => {
    const e = elemento.toLowerCase();
    if (e.includes('sangue')) return 'text-red-500';
    if (e.includes('morte')) return 'text-zinc-400 font-bold';
    if (e.includes('energia')) return 'text-purple-500';
    if (e.includes('conhec')) return 'text-yellow-500';
    if (e.includes('medo')) return 'text-white';
    return 'text-zinc-400';
  };

  const getBadgeElemento = (elemento: string) => {
    if (!elemento) return 'bg-zinc-900 text-zinc-400';
    const e = elemento.toLowerCase();
    if (e.includes('morte')) return 'bg-black/50 text-white';
    if (e.includes('medo')) return 'bg-zinc-200/80 text-zinc-950';
    if (e.includes('sangue')) return 'bg-red-950/20 text-red-500';
    if (e.includes('energia')) return 'bg-purple-950/20 text-purple-500';
    if (e.includes('conhec')) return 'bg-yellow-950/20 text-yellow-500';
    if (e.includes('varia') || e.includes('lista')) return 'bg-blue-950/20 text-blue-500';
    return 'bg-zinc-900 text-zinc-400';
  };

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
  isOverlay?: boolean;
}

const calcularEspacosFinais = (espacoBase: number | string, modificacoesIds?: number[], todasModificacoes?: any[], isRegra43Ativa?: boolean) => {
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

function SortableItemGeral({ item, isExpanded, toggleExpandir, removerItem, stringDT, onEditar, toggleEquipado, isOverlay }: SortableItemGeralProps) {
  const { maldicoesHook, modificacoesHook, regrasAutomaticasAtivas } = useRPG();
  
  const getCorElemento = (elemento: string) => {
    const e = elemento.trim().toLowerCase();
    if (e === 'morte') return 'text-zinc-400 border-zinc-600 bg-zinc-900/50';
    if (e === 'sangue') return 'text-red-400 border-red-800 bg-red-950/30';
    if (e === 'energia') return 'text-purple-400 border-purple-800 bg-purple-950/30';
    if (e.includes('conhec')) return 'text-amber-400 border-amber-800 bg-amber-950/30';
    if (e === 'medo') return 'text-white border-white/50 bg-white/10';
    return 'text-zinc-400 border-zinc-700 bg-zinc-800';
  };

  const [expandirMods, setExpandirMods] = useState(false);
    const [expandirMalds, setExpandirMalds] = useState(false);
  const modsAtuais = (Array.isArray(item.modificacoes) ? item.modificacoes : []).map(id => modificacoesHook.modificacoes.find(m => m.Codigo_Modif === id)).filter(Boolean) as any[];
    const maldicoesAtuais = (Array.isArray(item.maldicoes) ? item.maldicoes : []).map(id => maldicoesHook?.maldicoes.find(m => m.Codigo_Mald === id)).filter(Boolean) as any[];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, data: { type: 'item' } });

  const style = isOverlay ? {} : {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      className={`rounded border border-l-4 border-l-green-700 transition-colors w-full relative ${
        isOverlay ? 'border-green-500 bg-zinc-900 shadow-2xl scale-[1.02] opacity-90 cursor-grabbing' :
        isDragging ? 'border-zinc-800 bg-zinc-950/60 opacity-40' : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900/60'
      }`}
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
              <span className="text-xs text-zinc-400 font-medium truncate">Categoria {calcularCategoriaFinal(item.item.Categoria_Item, item.modificacoes, modificacoesHook.modificacoes, false, item.maldicoes, maldicoesHook?.maldicoes)}</span>
            )}
            

            {stringDT && (
              <div className="flex items-center gap-4 text-xs text-zinc-300 mt-0.5">
                <span><span className="font-bold text-green-400">DT:</span> {stringDT}</span>
              </div>
            )}
            {(modsAtuais.length > 0 || maldicoesAtuais.length > 0) && (
                <div className="flex items-center mt-1 min-w-0">
                  <span className="text-[11px] text-zinc-400 truncate italic">
                    {modsAtuais.length > 0 && modsAtuais.map(m => m.Nome_Modif).join(' • ')}
                    {modsAtuais.length > 0 && maldicoesAtuais.length > 0 && <span> • </span>}
                    {maldicoesAtuais.map((m: any, i: number) => {
                        const cor = getCorElementoTexto(m.Elemento_Mald);
                        return (
                          <span key={m.Codigo_Mald}>
                            {i > 0 && <span> • </span>}
                            <span className={cor}>{m.Nome_Mald}</span>
                          </span>
                        )
                    })}
                  </span>
                </div>
              )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {(item.item.Nome_Item.toLowerCase().includes('vestimenta') || 
            item.item.Nome_Item.toLowerCase().includes('amuleto sagrado') || 
            item.item.Grupo_Item?.toLowerCase() === 'proteções' ||
            item.item.Grupo_Item?.toLowerCase() === 'protecoes') && (
            <input
              type="checkbox"
              checked={!!item.equipado}
              onPointerDown={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                toggleEquipado(item.id);
              }}
              className="w-3.5 h-3.5 cursor-pointer accent-green-600 flex-shrink-0"
              title={item.equipado ? "Desequipar item" : "Equipar item"}
            />
          )}
          <div onClick={() => toggleExpandir(item.id)} className="w-5 text-center text-zinc-500 text-xs flex-shrink-0 cursor-pointer">{isExpanded ? '▲' : '▼'}</div>
        </div>
      </div>
      
      <Collapse isOpen={isExpanded} className={isDragging ? 'hidden' : ''}>
        <div className="border-t border-zinc-800 px-3 py-3 text-xs bg-zinc-950/80 flex flex-col gap-2 relative z-10" onClick={e => e.stopPropagation()}>
          <div className="flex flex-col gap-1 mt-1">
            <span><span className="text-green-400 font-bold">Categoria:</span> {calcularCategoriaFinal(item.item.Categoria_Item, item.modificacoes, modificacoesHook.modificacoes, false, item.maldicoes, maldicoesHook?.maldicoes)}</span>
            <span><span className="text-green-400 font-bold">Espaços:</span> {calcularEspacosFinais(item.item.Espacos_Itens, item.modificacoes, modificacoesHook.modificacoes, regrasAutomaticasAtivas?.has(43))}</span>

              {((Array.isArray(item.maldicoes) ? item.maldicoes : []).length > 0) && (
              <div className="mt-3">
                <div 
                  className="flex items-center gap-2 cursor-pointer group py-1.5 px-2 -mx-2 rounded hover:bg-zinc-800/40 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setExpandirMalds(!expandirMalds); }}
                >
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">Maldições</span>
                  <div className="h-px bg-zinc-800 flex-1 group-hover:bg-zinc-700 transition-colors"></div>
                  <svg className={`w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-transform duration-200 ${expandirMalds ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
                <Collapse isOpen={expandirMalds}>
                  <div className="flex flex-col gap-2 pt-2 pb-1">
                    {(Array.isArray(item.maldicoes) ? item.maldicoes : []).map((id: number) => {
                      const m = maldicoesHook?.maldicoes.find((x: any) => x.Codigo_Mald === id);
                      if (!m) return null;
                      const corTexto = getCorElementoTexto ? getCorElementoTexto(m.Elemento_Mald) : 'text-zinc-400';
                      return (
                        <div key={m.Codigo_Mald} className="flex flex-col gap-0.5">
                          <div className="flex gap-1 items-center">
                            <span className={`text-xs font-bold ${corTexto}`}>{m.Nome_Mald}</span>
                            <span className={`rounded px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${getBadgeElemento(m.Elemento_Mald)}`}>{m.Elemento_Mald}</span>
                          </div>
                          {m.Descricao_Mald && (
                            <p className="text-[11px] text-zinc-400 leading-relaxed whitespace-pre-wrap">{formatarTexto(m.Descricao_Mald)}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Collapse>
              </div>
            )}
            {modsAtuais.length > 0 && (
              <div className="mt-3">
                <div 
                  className="flex items-center gap-2 cursor-pointer group py-1.5 px-2 -mx-2 rounded hover:bg-zinc-800/40 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setExpandirMods(!expandirMods); }}
                >
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">Modificações</span>
                  <div className="h-px bg-zinc-800 flex-1 group-hover:bg-zinc-700 transition-colors"></div>
                  <svg className={`w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-transform duration-200 ${expandirMods ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
                <Collapse isOpen={expandirMods}>
                  <div className="flex flex-col gap-2 pt-2 pb-1">
                    {modsAtuais.map(m => (
                      <div key={m.Codigo_Modif} className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-zinc-200">{m.Nome_Modif}</span>
                        <p className="text-[11px] text-zinc-400 leading-relaxed whitespace-pre-wrap">{formatarTexto(m.Descricao_Modif || '')}</p>
                      </div>
                    ))}
                  </div>
                </Collapse>
              </div>
            )}

            

            

          </div>
          <div className="flex flex-col gap-1 mt-3 pt-3 border-t border-zinc-800/50">
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
                className="text-xs text-green-500 hover:text-green-400 bg-green-950/30 hover:bg-green-900/50 px-3 py-1.5 rounded border border-green-900/50 transition-colors"
              >
                Remover
              </button>
            )}
          </div>
        </div>
      </Collapse>
    </div>
  );
}

const getBadgeClasses = (minv: any) => {
  if (!minv.isRitual) return 'bg-green-950/40 border-green-900/50';
  const e = (minv.elemento || '').trim().toLowerCase();
  if (e === 'sangue') return 'border-red-900 bg-red-950/40';
  if (e === 'morte') return 'border-zinc-700 bg-black/60';
  if (e === 'conhecimento') return 'border-yellow-900 bg-yellow-950/40';
  if (e === 'energia') return 'border-purple-900 bg-purple-950/40';
  if (e === 'medo') return 'border-zinc-500 bg-zinc-200/90';
  return 'bg-green-950/40 border-green-900/50';
};
const getBadgeTextClasses = (minv: any) => {
  if (!minv.isRitual) return 'text-green-400';
  const e = (minv.elemento || '').trim().toLowerCase();
  if (e === 'sangue') return 'text-red-500';
  if (e === 'morte') return 'text-zinc-100';
  if (e === 'conhecimento') return 'text-yellow-500';
  if (e === 'energia') return 'text-purple-500';
  if (e === 'medo') return 'text-zinc-950';
  return 'text-green-400';
};
const getBadgeCloseClasses = (minv: any) => {
  if (!minv.isRitual) return 'text-green-600 hover:text-red-400 hover:bg-green-900/50';
  const e = (minv.elemento || '').trim().toLowerCase();
  if (e === 'sangue') return 'text-red-700 hover:text-red-400 hover:bg-red-900/50';
  if (e === 'morte') return 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/50';
  if (e === 'conhecimento') return 'text-yellow-700 hover:text-yellow-400 hover:bg-yellow-900/50';
  if (e === 'energia') return 'text-purple-700 hover:text-purple-400 hover:bg-purple-900/50';
  if (e === 'medo') return 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-400/50';
  return 'text-green-600 hover:text-red-400 hover:bg-green-900/50';
};



export function InventarioPanel() {
  const { maldicoesHook, inventarioHook, atributosFinais, regrasAutomaticasAtivas, armasHook, municoesHook, protecoesHook, itensHook, itensAmaldicoadosHook, toggleVestimentaGeral, status, modificacoesHook, proficienciasTotais, rituaisHook, poderesHook, poderesExtras, regras, nivel, trilhasHook, nex } = useRPG();
  const effectiveNex = regras["nex_experiencia"] ? nivel * 5 : nex;
  const isAniquilador = trilhasHook.trilhaSelecionada?.Codigo_Trilha === 1;
  const armaFavId = isAniquilador ? poderesExtras["aniquilador_arma_favorita"] : null;
  const descontoFavorita = isAniquilador && armaFavId ? (effectiveNex >= 99 ? 3 : (effectiveNex >= 40 ? 2 : 1)) : 0;

  useEffect(() => {
    const handler = (e: any) => {
      const { poder, elemento, poderId } = e.detail;
        const str = window.localStorage.getItem('dedoDecepadoAguardando');
        if (str) {
          try {
            const item = JSON.parse(str);
            itensAmaldicoadosHook.adicionarItem({ 
              ...item, 
              Nome_Ama: `Dedo Decepado (${(poder.Nome || poder.Nome_Poder).replace('<Elemento>', elemento || 'Varia')})`, 
              Elemento_Ama: elemento || 'Varia',
              dedoDecepadoPoderId: poderId
            });
        } catch (err) {}
        window.localStorage.removeItem('dedoDecepadoAguardando');
      }
    };
    window.addEventListener('dedoDecepadoSelecionado', handler);
    return () => window.removeEventListener('dedoDecepadoSelecionado', handler);
  }, [itensAmaldicoadosHook]);
  const {
    prestigio, setPrestigio,
    patente, setPatenteManual,
    credito, setCreditoOverride,
    limitesItens, setLimiteItemCategoria
  } = inventarioHook;

  const [modalArmasAberto, setModalArmasAberto] = useState(false);
  const [modalMunicoesAberto, setModalMunicoesAberto] = useState(false);
  const [modalProteçõesAberto, setModalProtecoesAberto] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('Armas');
  const [modalItensAberto, setModalItensAberto] = useState(false);
  const [modalItensAmaldicoadosAberto, setModalItensAmaldicoadosAberto] = useState(false);
  const [modalUnificadoAberto, setModalUnificadoAberto] = useState(false);
  const [abaItensAberta, setAbaItensAberta] = useState<string>('');
  const [buscaItem, setBuscaItem] = useState('');
  const [municaoFiltroNome, setMunicaoFiltroNome] = useState<string | undefined>(undefined);
  const [municaoFiltroCategoria, setMunicaoFiltroCategoria] = useState<string | undefined>(undefined);
  const [municaoTargetArmaId, setMunicaoTargetArmaId] = useState<string | undefined>(undefined);
  const [modalGranadasAberto, setModalGranadasAberto] = useState(false);
    const [modalAntenaAberto, setModalAntenaAberto] = useState(false);
    const [antenaTargetArmaId, setAntenaTargetArmaId] = useState<string | undefined>(undefined);
  const [flechaExplosivaPendente, setFlechaExplosivaPendente] = useState<any>(null);
  const [granadaTargetArmaId, setGranadaTargetArmaId] = useState<string | undefined>(undefined);
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    setExpandidos({});
  }, [categoriaFiltro]);

  const [armaEditandoId, setArmaEditandoId] = useState<string | null>(null);
  const [creatingItemCategory, setCreatingItemCategory] = useState<string | null>(null);
  const [escolhaCriacaoAberta, setEscolhaCriacaoAberta] = useState<string | null>(null);
  const [protecaoEditandoId, setProtecaoEditandoId] = useState<string | null>(null);

  const [editingItem, setEditingItem] = useState<{ id: string, tipo: 'arma' | 'protecao' | 'item' | 'municao' | 'amaldicoado' } | null>(null);
  const [editingItemAmaldicoado, setEditingItemAmaldicoado] = useState<ItemAmaldicoadoInventario | null>(null);
  const [activeDragItem, setActiveDragItem] = useState<{ id: string, type: 'arma' | 'municao' | 'protecao' | 'item' | 'amaldicoado', name?: string, fullItem?: any, stringDT?: string | null } | null>(null);

  const getArmaParaEditar = () => editingItem?.tipo === 'arma' ? armasHook.armasInventario.find(i => i.id === editingItem.id) : null;
  const getProtecaoParaEditar = () => editingItem?.tipo === 'protecao' ? protecoesHook.protecoesInventario.find(i => i.id === editingItem.id) : null;
  const getItemParaEditar = () => editingItem?.tipo === 'item' ? itensHook.itensInventario.find(i => i.id === editingItem.id) : null;
  const getMunicaoParaEditar = () => editingItem?.tipo === 'municao' ? municoesHook.municoesInventario.find(i => i.id === editingItem.id) : null;
  const getItemAmaldicoadoParaEditar = () => editingItem?.tipo === 'amaldicoado' ? itensAmaldicoadosHook.itensAmaldicoadosInventario.find(i => i.id === editingItem.id) : null;
  const getSoqueiraComoArmaParaEditar = () => null;

  const cargaMaxima = 5 + (atributosFinais.FOR * 5) + (regrasAutomaticasAtivas.has(23) ? 5 : 0) + (regrasAutomaticasAtivas.has(43) ? atributosFinais.INT : 0);
  
  const cargaAtual = useMemo(() => {
    let total = 0;
    armasHook?.armasInventario.forEach(i => {
      if (i.arma.isDuplaObsessivaCompanion) return;
      total += calcularEspacosFinais(i.arma['Espaços_Item'], i.modificacoes, modificacoesHook.modificacoes, regrasAutomaticasAtivas.has(43));
    });
    municoesHook?.municoesInventario.forEach(i => total += calcularEspacosFinais(i.municao['Espaços_Item'], i.modificacoes, modificacoesHook.modificacoes, regrasAutomaticasAtivas.has(43)));
    protecoesHook?.protecoesInventario.forEach(i => total += calcularEspacosFinais(i.protecao.Espacos_Protecao, i.modificacoes, modificacoesHook.modificacoes, regrasAutomaticasAtivas.has(43)));
    itensHook?.itensInventario.forEach(i => total += calcularEspacosFinais(i.item.Espacos_Itens, i.modificacoes, modificacoesHook.modificacoes, regrasAutomaticasAtivas.has(43)));
    return total;
  }, [armasHook?.armasInventario, municoesHook?.municoesInventario, protecoesHook?.protecoesInventario, itensHook?.itensInventario, modificacoesHook.modificacoes]);
  
      const noInventario = [0, 0, 0, 0];
    
    const getCatIndex = (catStr: string) => {
      const c = catStr.trim().toUpperCase();
      if (c === 'I' || c === '1') return 0;
      if (c === 'II' || c === '2') return 1;
      if (c === 'III' || c === '3') return 2;
      if (c === 'IV' || c === '4') return 3;
      return -1;
    };

    const modsAll = modificacoesHook?.modificacoes || [];
    const maldsAll = maldicoesHook?.maldicoes || [];

    armasHook?.armasInventario?.forEach(a => {
      if (a.arma.isDuplaObsessivaCompanion) return;
      const cat = calcularCategoriaFinal(a.arma.Categoria_Item, a.modificacoes, modsAll, a.arma.Codigo_Arma === 71 ? true : a.arma.Nome_Item, a.maldicoes, maldsAll, a.id === armaFavId ? descontoFavorita : 0);
      const idx = getCatIndex(cat);
      if (idx !== -1) noInventario[idx]++;
    });

    municoesHook?.municoesInventario?.forEach(m => {
      const cat = calcularCategoriaFinal(m.municao.Categoria_Item, m.modificacoes, modsAll, false, m.maldicoes, maldsAll);
      const idx = getCatIndex(cat);
      if (idx !== -1) noInventario[idx]++;
    });

    protecoesHook?.protecoesInventario?.forEach(p => {
      const cat = calcularCategoriaFinal(p.protecao.Categoria_Protecao, p.modificacoes, modsAll, false, p.maldicoes, maldsAll);
      const idx = getCatIndex(cat);
      if (idx !== -1) noInventario[idx]++;
    });

    itensHook?.itensInventario?.forEach(i => {
      const cat = calcularCategoriaFinal(i.item.Categoria_Item, i.modificacoes, modsAll, false, i.maldicoes, maldsAll);
      const idx = getCatIndex(cat);
      if (idx !== -1) noInventario[idx]++;
    });

    itensAmaldicoadosHook?.itensAmaldicoadosInventario?.forEach(ia => {
      const cat = calcularCategoriaFinal(ia.item.Categoria_Ama, undefined, [], false, undefined, []);
      const idx = getCatIndex(cat);
      if (idx !== -1) noInventario[idx]++;
    });

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
      calculado = 10 + (status?.peTurno || 0) + (atributosFinais[val.toUpperCase() as keyof typeof atributosFinais] || 0);
    } else {
      const numVal = Number(val);
        if (isNaN(numVal) || val.toLowerCase().includes('veja') || val.toLowerCase().includes('texto') || val.trim() === '') {
          calculado = '-';
        } else {
          calculado = numVal;
        }
    }
    
    if (isExplosivo && regrasAutomaticasAtivas.has(29) && typeof calculado === 'number') {
      calculado += atributosFinais.INT;
    }
    
    if (calculado === '-') return '-';
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
    if (event.active && expandidos[event.active.id]) {
      setExpandidos(prev => ({ ...prev, [event.active.id]: false }));
    }
    const { active } = event;
    
    const type = active.data?.current?.type;
    let name = 'Item';
    let fullItem = null;
    let stringDT = null;
    
    if (type === 'municao') {
      fullItem = municoesHook?.municoesInventario.find(x => x.id === active.id);
      if (fullItem) name = fullItem.municao.Nome_Item;
    } else if (type === 'arma') {
      fullItem = armasHook?.armasInventario.find(x => x.id === active.id);
      if (fullItem) {
        name = fullItem.arma.Nome_Item;
        stringDT = calcularDT(fullItem.arma.dt_item, fullItem.arma.Categoria_Item?.toLowerCase().includes('explosivos') || fullItem.arma.Nome_Item?.toLowerCase().includes('explosivo'));
      }
    } else if (type === 'protecao') {
      fullItem = protecoesHook?.protecoesInventario.find(x => x.id === active.id);
      if (fullItem) name = fullItem.protecao.Nome_Protecao;
    } else if (type === 'item') {
      fullItem = itensHook?.itensInventario.find(x => x.id === active.id);
      if (fullItem) name = fullItem.item.Nome_Item;
    } else if (type === 'amaldicoado') {
      fullItem = itensAmaldicoadosHook?.itensAmaldicoadosInventario.find(x => x.id === active.id);
      if (fullItem) name = fullItem.item.Nome_Ama;
    }
    
    setActiveDragItem({ id: active.id, type, name, fullItem, stringDT });
  };

  const handleDragEnd = (event: any) => {
    setActiveDragItem(null);
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const armaActive = armasHook?.armasInventario.find(a => a.id === active.id);
      const municaoActive = municoesHook?.municoesInventario.find(m => m.id === active.id);
      const protecaoActive = protecoesHook?.protecoesInventario.find(p => p.id === active.id);
      const itemAmaldicoadoActive = itensAmaldicoadosHook?.itensAmaldicoadosInventario.find(p => p.id === active.id);
      
      const armaOver = armasHook?.armasInventario.find(a => a.id === over.id);
      const municaoOver = municoesHook?.municoesInventario.find(m => m.id === over.id);
      const protecaoOver = protecoesHook?.protecoesInventario.find(p => p.id === over.id);
      const itemAmaldicoadoOver = itensAmaldicoadosHook?.itensAmaldicoadosInventario.find(p => p.id === over.id);

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
          if (oldIndex !== -1 && newIndex !== -1 && protecoesHook?.reordenarProteções) {
            protecoesHook.reordenarProteções(oldIndex, newIndex);
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
        if (itemAmaldicoadoActive && itemAmaldicoadoOver) {
          const oldIndex = (itensAmaldicoadosHook?.itensAmaldicoadosInventario || []).findIndex(x => x.id === active.id);
          const newIndex = (itensAmaldicoadosHook?.itensAmaldicoadosInventario || []).findIndex(x => x.id === over.id);
          if (oldIndex !== -1 && newIndex !== -1 && itensAmaldicoadosHook?.reordenarItens) {
            itensAmaldicoadosHook.reordenarItens(oldIndex, newIndex);
          }
          return;
        }
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

  let armasExibidas = [...(armasHook?.armasInventario || [])].filter(a => a.id !== 'coronhada-virtual' && a.id !== 'ataque-desarmado-virtual');
  armasExibidas = armasExibidas.filter((item: ArmaInventario) => {
    if (buscaItem && !item.arma.Nome_Item.toLowerCase().includes(buscaItem.toLowerCase())) return false;
    return true;
  });
  
  const armasNormaisExibidas = armasExibidas.filter(i => !i.arma.isAmaldicoada);
  const armasAmaldicoadasExibidas = armasExibidas.filter(i => i.arma.isAmaldicoada);
  

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

  const itensAmaldicoadosGeral = (itensAmaldicoadosHook?.itensAmaldicoadosInventario || []).filter(iinv => {
    if (buscaItem && !iinv.item.Nome_Ama.toLowerCase().includes(buscaItem.toLowerCase())) return false;
    return true;
  });

  const itensGeral = (itensHook?.itensInventario || []).filter(iinv => {
    if (buscaItem && !iinv.item.Nome_Item.toLowerCase().includes(buscaItem.toLowerCase())) return false;
    if (categoriaFiltro === 'Itens Operacionais') {
      if (iinv.item.Grupo_Item.trim() !== 'Itens Operacionais' && iinv.item.Grupo_Item.trim() !== 'Recursos') return false;
    } else if (categoriaFiltro !== 'Geral' && iinv.item.Grupo_Item.trim() !== categoriaFiltro) return false;
    return true;
  });

  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden gap-2 p-2 font-sans text-zinc-300 w-full">
      {/* LINHA 1: Prestígio + Patente */}
      <div className="flex items-end gap-4 pr-2">
        <div className="flex flex-col gap-1">
          <label className="text-[0.65rem] font-semibold uppercase tracking-widest text-zinc-500">Prestígio</label>
          <input
            type="number"
            min="0"
            value={prestigio}
            onChange={(e) => setPrestigio(Number(e.target.value))}
            className="w-16 rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-center text-sm font-bold text-zinc-100 outline-none transition focus:border-green-700"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <label className="text-[0.65rem] font-semibold uppercase tracking-widest text-zinc-500">Patente</label>
          <CustomSelect
            value={patente}
            onChange={(val) => setPatenteManual(val as Patente)}
            wrapperClassName="w-full"
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-center text-sm font-bold text-zinc-100 outline-none transition focus:border-green-700"
            options={patentesDisponiveis.map(p => ({ value: p, label: p }))}
          />
        </div>
      </div>

      {/* LINHA 2: Crédito + Carga */}
      <div className="flex items-end gap-4 pr-2">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <label className="text-[0.65rem] font-semibold uppercase tracking-widest text-zinc-500">Crédito</label>
          <CustomSelect
            value={credito}
            onChange={(val) => setCreditoOverride(val as LimiteCredito)}
            wrapperClassName="w-full"
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-center text-sm font-bold text-zinc-100 outline-none transition focus:border-green-700"
            options={creditosDisponiveis.map(c => ({ value: c, label: c }))}
          />
        </div>
        <div className="flex flex-col gap-1 w-24">
          <label className="text-[0.65rem] font-semibold uppercase tracking-widest text-zinc-500">Carga</label>
          <div className="flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 justify-center">
            <span className={`text-sm font-bold ${cargaAtual > cargaMaxima ? 'text-red-400' : 'text-zinc-100'}`}>{cargaAtual}</span>
            <span className="text-zinc-600 text-xs">/</span>
            <span className="text-sm font-bold text-zinc-500">{cargaMaxima}</span>
          </div>
        </div>
      </div>

      {/* LINHA 3: Limite + Em Uso */}
      <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 items-center mt-2 pr-2">
        <label className="text-[0.65rem] font-semibold uppercase tracking-widest text-zinc-500 text-right">Limite</label>
        <div className="flex gap-1 min-w-0">
          {limitesItens.map((limite, index) => (
            <input
              key={`limite-${index}`}
              type="number"
              min="0"
              value={limite}
              onChange={(e) => setLimiteItemCategoria(index, Number(e.target.value))}
              className="flex-1 min-w-0 rounded border border-zinc-700 bg-zinc-900 py-1.5 text-center text-sm font-bold text-zinc-100 outline-none transition focus:border-green-700"
            />
          ))}
        </div>
        <label className="text-[0.65rem] font-semibold uppercase tracking-widest text-zinc-500 text-right">Em uso</label>
        <div className="flex gap-1 min-w-0">
          {noInventario.map((qtd: number, index: number) => (
            <div
              key={`inventario-${index}`}
              className={`flex-1 min-w-0 rounded border py-1.5 flex items-center justify-center text-sm font-bold ${
                qtd > limitesItens[index]
                  ? 'border-red-800/60 bg-red-950/30 text-red-400'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-500'
              }`}
            >
              {qtd}
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-zinc-800 my-1" />

      {/* Seção de Inventário */}
      <div className="flex flex-col flex-1 min-h-0 gap-3 mt-2">
        {/* Abas de Categoria */}
        <div className="flex gap-2 mb-4 border-b border-zinc-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setCategoriaFiltro('Geral')}
            title="Geral"
            className={`w-12 h-12 flex items-center justify-center rounded-t text-2xl transition border-b-2 ${
              categoriaFiltro === 'Geral' 
                ? 'bg-zinc-900 text-green-400 border-b-green-500' 
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
                ? 'bg-zinc-900 text-green-400 border-b-green-500' 
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50 border-b-transparent'
            }`}
          >
            <img 
              src="/gun-icon.png" 
              alt="Armas" 
              className="w-8 h-8 object-contain mix-blend-screen"
            />
          </button>
          <button
            onClick={() => setCategoriaFiltro('Munições')}
            title="Munições"
            className={`w-12 h-12 flex items-center justify-center rounded-t text-2xl transition border-b-2 ${
              categoriaFiltro === 'Munições' 
                ? 'bg-zinc-900 text-green-400 border-b-green-500' 
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
                ? 'bg-zinc-900 text-green-400 border-b-green-500' 
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
                ? 'bg-zinc-900 text-green-400 border-b-green-500' 
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
                ? 'bg-zinc-900 text-green-400 border-b-green-500' 
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50 border-b-transparent'
            }`}
          >
            💣
          </button>
          <button
            onClick={() => setCategoriaFiltro('Itens Operacionais')}
            title="Itens Operacionais / Recursos"
            className={`w-12 h-12 flex items-center justify-center rounded-t text-2xl transition border-b-2 ${
              categoriaFiltro === 'Itens Operacionais' 
                ? 'bg-zinc-900 text-green-400 border-b-green-500' 
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50 border-b-transparent'
            }`}
          >
            🔦
          </button>
          <button
            onClick={() => setCategoriaFiltro('Medicamentos')}
            title="Medicamentos"
            className={`w-12 h-12 flex items-center justify-center rounded-t text-2xl transition border-b-2 ${
              categoriaFiltro === 'Medicamentos' 
                ? 'bg-zinc-900 text-green-400 border-b-green-500' 
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
                ? 'bg-zinc-900 text-green-400 border-b-green-500' 
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50 border-b-transparent'
            }`}
          >
            👁️
          </button>
        
          <button
            onClick={() => setCategoriaFiltro('Amaldiçoados')}
            title="Amaldiçoados"
            className={`w-12 h-12 flex items-center justify-center rounded-t text-2xl transition border-b-2 ${
              categoriaFiltro === 'Amaldiçoados' 
                ? 'bg-zinc-900 text-purple-400 border-b-purple-500' 
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50 border-b-transparent'
            }`}
          >
            💀
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
          {categoriaFiltro !== 'Geral' && (
            <button
              onClick={() => {
                if (categoriaFiltro === 'Amaldiçoados') {
                  setEscolhaCriacaoAberta(categoriaFiltro);
                } else {
                  setCreatingItemCategory(categoriaFiltro);
                }
              }}
              className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded font-bold text-[11px] uppercase tracking-wider ml-2 transition"
            >
              Criar
            </button>
          )}
          {categoriaFiltro === 'Geral' && (
            <button
              onClick={() => setModalUnificadoAberto(true)}
              className="bg-green-700 hover:bg-green-600 text-white px-4 py-1.5 rounded font-bold text-sm ml-2 transition"
            >
              + Adicionar
            </button>
          )}
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
          {(itensHook?.gruposUnicos.includes(categoriaFiltro) || categoriaFiltro === 'Itens Operacionais') && (
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
          {categoriaFiltro === 'Amaldiçoados' && (
            <button
              onClick={() => setModalItensAmaldicoadosAberto(true)}
              className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-1.5 rounded font-bold text-sm transition"
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
              {categoriaFiltro === 'Geral' && armasNormaisExibidas.length > 0 && (
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 mt-2 border-b border-zinc-800/50 pb-1 ml-1">Armas</h3>
              )}
              
              <SortableContext 
                  items={armasNormaisExibidas.map(a => a.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {armasNormaisExibidas.map((item: ArmaInventario) => (
                    <SortableArmaItem
                      key={item.id}
                      item={item}
                      isExpanded={!!expandidos[item.id]}
                      toggleExpandir={toggleExpandir}
                      stringDT={calcularDT(item.arma.dt_item, item.arma.Categoria_Item?.toLowerCase().includes('explosivos') || item.arma.Nome_Item?.toLowerCase().includes('explosivo'))}
                      removerArma={armasHook?.removerArma || (() => {})}
                        onEditar={() => setArmaEditandoId(item.id)}
                        onAddMunicao={() => {
                          if (item.arma.Nome_Item?.trim().toLowerCase() === 'a antena') {
                            setAntenaTargetArmaId(item.id); setModalAntenaAberto(true);
                          } else if (item.arma.Nome_Item?.toLowerCase().includes('lançador de granadas') || item.arma.Nome_Item?.toLowerCase().includes('lancador de granadas')) {
                            setGranadaTargetArmaId(item.id);
                            setModalGranadasAberto(true);
                          } else {
                            setMunicaoTargetArmaId(item.id);
                            setMunicaoFiltroNome(item.arma.Nome_Item);
                            setMunicaoFiltroCategoria(item.arma.Categoria_Item);
                            setModalUnificadoAberto(true);
                          }
                        }}
                      />
                  ))}
                </SortableContext>
              
              {categoriaFiltro === 'Armas' && armasNormaisExibidas.length === 0 && (
                <p className="text-center text-zinc-600 text-sm py-4">Nenhuma arma no inventário.</p>
              )}
              
              {categoriaFiltro === 'Geral' && armasNormaisExibidas.length === 0 && municoesSoltas.length === 0 && protecoesGeral.length === 0 && itensGeral.length === 0 && armasAmaldicoadasExibidas.length === 0 && (itensAmaldicoadosHook?.itensAmaldicoadosInventario?.length || 0) === 0 && (
                <p className="text-center text-zinc-600 text-sm py-4">Inventário vazio.</p>
              )}

              {categoriaFiltro === 'Geral' && municoesSoltas.length > 0 && (
                <>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 mt-2 border-b border-zinc-800/50 pb-1 ml-1">Munições Soltas</h3>
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
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 mt-2 border-b border-zinc-800/50 pb-1 ml-1">Proteções</h3>
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

            {(itensHook?.gruposUnicos.includes(categoriaFiltro) || categoriaFiltro === 'Geral' || categoriaFiltro === 'Itens Operacionais') && (
              <>
                {categoriaFiltro === 'Geral' || categoriaFiltro === 'Itens Operacionais' ? (
                  Array.from(new Set(itensGeral.map(i => i.item.Grupo_Item.trim()))).sort().map(grupo => {
                    const itensDoGrupo = itensGeral.filter(i => i.item.Grupo_Item.trim() === grupo);
                    if (itensDoGrupo.length === 0) return null;
                    return (
                      <div key={grupo} className="flex flex-col gap-2">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 mt-2 border-b border-zinc-800/50 pb-1 ml-1">{grupo}</h3>
                        <SortableContext items={itensDoGrupo.map(i => i.id)} strategy={verticalListSortingStrategy}>
                          {itensDoGrupo.map(item => (
                            <SortableItemGeral 
                              key={item.id} 
                              item={item} 
                              isExpanded={!!expandidos[item.id]}
                              toggleExpandir={(id) => setExpandidos(prev => ({ ...prev, [id]: !prev[id] }))}
                              stringDT={calcularDT(item.item.Dt_Item, item.item.Grupo_Item?.toLowerCase().includes('explosivos'))}
                              removerItem={itensHook?.removerItem || (() => {})}
                              onEditar={() => {
                                setEditingItem({ id: item.id, tipo: 'item' });
                              }}
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
                          onEditar={() => {
                            setEditingItem({ id: item.id, tipo: 'item' });
                          }}
                          toggleEquipado={itensHook?.toggleEquipado || (() => {})}
                        />
                      ))}
                    </SortableContext>
                    {itensGeral.length === 0 && (
                      <p className="text-center text-zinc-600 text-sm py-4">
                        {categoriaFiltro === 'Acessórios' ? 'Nenhum acessório no inventário.' :
                         categoriaFiltro === 'Explosivos' ? 'Nenhum explosivo no inventário.' :
                         categoriaFiltro === 'Itens Operacionais' ? 'Nenhum item operacional ou recurso no inventário.' :
                         categoriaFiltro === 'Medicamentos' ? 'Nenhum medicamento no inventário.' :
                         categoriaFiltro === 'Itens Paranormais' ? 'Nenhum item paranormal no inventário.' :
                         `Nenhum item no inventário.`}
                      </p>
                    )}
                  </>
                )}
              </>
            )}

            {(categoriaFiltro === 'Amaldiçoados' || categoriaFiltro === 'Geral') && ((itensAmaldicoadosHook?.itensAmaldicoadosInventario?.length || 0) > 0 || armasAmaldicoadasExibidas.length > 0) && (
                  <>
                  {['Sangue', 'Morte', 'Conhecimento', 'Energia', 'Medo', 'Outros'].map(elemento => {
                    const armasNesteElemento = armasAmaldicoadasExibidas.filter(a => {
                      const e = (a.arma.Elemento_Arma || '').toLowerCase();
                      if (elemento === 'Outros') return !e || !['sangue', 'morte', 'conhecimento', 'energia', 'medo'].some(el => e.includes(el));
                      return e.includes(elemento.toLowerCase());
                    });
                    
                    const itensNesteElemento = (itensAmaldicoadosHook?.itensAmaldicoadosInventario || []).filter(i => {
                      const e = (i.item.Elemento_Ama || '').toLowerCase();
                      const matchBusca = buscaItem.trim() === '' || i.item.Nome_Ama.toLowerCase().includes(buscaItem.toLowerCase());
                      if (!matchBusca) return false;
                      if (elemento === 'Outros') return !e || !['sangue', 'morte', 'conhecimento', 'energia', 'medo'].some(el => e.includes(el));
                      return e.includes(elemento.toLowerCase());
                    });

                    if (armasNesteElemento.length === 0 && itensNesteElemento.length === 0) return null;

                    return (
                      <div key={elemento} className="mb-4">
                        <div className="flex items-center gap-3 mb-2 mt-3">
                            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: obterCorBadgeInv(elemento) || '#52525b' }}></span>
                            <span className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-zinc-500">{elemento}</span>
                            <div className="flex-1 border-t border-zinc-800/50"></div>
                          </div>
                        
                        {armasNesteElemento.length > 0 && (
                          <div className="mb-2">
                            <SortableContext items={armasNesteElemento.map(a => a.id)} strategy={verticalListSortingStrategy}>
                              {armasNesteElemento.map((item: ArmaInventario) => (
                                <SortableArmaItem
                                  key={item.id}
                                  item={item}
                                  isExpanded={!!expandidos[item.id]}
                                  toggleExpandir={toggleExpandir}
                                  stringDT={calcularDT(item.arma.dt_item, item.arma.Categoria_Item?.toLowerCase().includes('explosivos') || item.arma.Nome_Item?.toLowerCase().includes('explosivo'))}
                                  removerArma={armasHook?.removerArma || (() => {})}
                                  onEditar={() => setArmaEditandoId(item.id)}
                                  onAddMunicao={() => {
                                    if (item.arma.Nome_Item?.trim().toLowerCase() === 'a antena') {
                                      setAntenaTargetArmaId(item.id); setModalAntenaAberto(true);
                                    } else if (item.arma.Nome_Item?.toLowerCase().includes('lançador de granadas') || item.arma.Nome_Item?.toLowerCase().includes('lancador de granadas')) {
                                      setGranadaTargetArmaId(item.id);
                                      setModalGranadasAberto(true);
                                    } else {
                                      setMunicaoTargetArmaId(item.id);
                                      setMunicaoFiltroNome(item.arma.Nome_Item);
                                      setMunicaoFiltroCategoria(item.arma.Categoria_Item);
                                      setModalUnificadoAberto(true);
                                    }
                                  }}
                                />
                              ))}
                            </SortableContext>
                          </div>
                        )}

                        {itensNesteElemento.length > 0 && (
                          <div className="mb-2">
                            <SortableContext items={itensNesteElemento.map(i => i.id)} strategy={verticalListSortingStrategy}>
                              {itensNesteElemento.map(item => (
                                <SortableItemAmaldicoado
                                  key={item.id}
                                  item={item}
                                  isExpanded={!!expandidos[item.id]}
                                  toggleExpandir={toggleExpandir}
                                  removerItem={(id) => {
                                      const itemToRemove = itensAmaldicoadosHook?.itensAmaldicoados.find(i => i.id === id);
                                      if (itemToRemove && itemToRemove.item.dedoDecepadoPoderId) {
                                        poderesHook.removerPoder(itemToRemove.item.dedoDecepadoPoderId);
                                      }
                                      if (itensAmaldicoadosHook?.removerItem) itensAmaldicoadosHook.removerItem(id);
                                    }}
                                  onEditar={() => setEditingItemAmaldicoado(item)}
                                  stringDT={null}
                                  toggleEquipado={(id) => toggleVestimentaGeral(id, true)}
                                />
                              ))}
                            </SortableContext>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {categoriaFiltro === 'Amaldiçoados' && (itensAmaldicoadosHook?.itensAmaldicoadosInventario?.length || 0) === 0 && armasAmaldicoadasExibidas.length === 0 && (
                    <p className="text-center text-zinc-600 text-sm py-4">Nenhum item ou arma amaldiçoada no inventário.</p>
                  )}
                  </>
                )}

            <DragOverlay>
              {activeDragItem?.fullItem ? (
                <div className="w-full">
                  {activeDragItem.type === 'arma' && <SortableArmaItem item={activeDragItem.fullItem} isExpanded={!!expandidos[activeDragItem.id]} toggleExpandir={() => {}} removerArma={() => {}} stringDT={activeDragItem.stringDT || null} isOverlay onAddMunicao={() => {}} />}
                  {activeDragItem.type === 'protecao' && <SortableProtecaoItem item={activeDragItem.fullItem} isExpanded={!!expandidos[activeDragItem.id]} toggleExpandir={() => {}} removerProtecao={() => {}} toggleEquipado={() => {}} isOverlay />}
                  {activeDragItem.type === 'item' && <SortableItemGeral item={activeDragItem.fullItem} isExpanded={!!expandidos[activeDragItem.id]} toggleExpandir={() => {}} removerItem={() => {}} stringDT={null} toggleEquipado={() => {}} isOverlay />}
                  {activeDragItem.type === 'municao' && <SortableMunicaoItem id={activeDragItem.id} item={activeDragItem.fullItem} isExpanded={!!expandidos[activeDragItem.id]} toggleExpandir={() => {}} removerItem={() => {}} isOverlay />}
                  {activeDragItem.type === 'amaldicoado' && <SortableItemAmaldicoado item={activeDragItem.fullItem} isExpanded={!!expandidos[activeDragItem.id]} toggleExpandir={() => {}} removerItem={() => {}} stringDT={null} toggleEquipado={() => {}} isOverlay />}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {categoriaFiltro !== 'Armas' && categoriaFiltro !== 'Geral' && categoriaFiltro !== 'Munições' && categoriaFiltro !== 'Proteções' && categoriaFiltro !== 'Amaldiçoados' && !itensHook?.gruposUnicos.includes(categoriaFiltro) && (
            <p className="text-center text-zinc-600 text-sm py-8">Esta categoria ainda não possui itens implementados.</p>
          )}
        </div>
      </div>

      
      

      
      
      {/* Modal de Escolha para Amaldiçoados e Operacionais */}
      {escolhaCriacaoAberta && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setEscolhaCriacaoAberta(null)}>
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-lg p-6 max-w-sm w-full flex flex-col gap-4 shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
            <div className="flex justify-between items-center">
              <h3 className="text-zinc-100 font-display uppercase tracking-wider text-lg">O que deseja criar?</h3>
              <button onClick={() => setEscolhaCriacaoAberta(null)} className="text-zinc-500 hover:text-zinc-300 text-xl">&times;</button>
            </div>
            {escolhaCriacaoAberta === 'Amaldiçoados' && (
              <div className="flex flex-col gap-2">
                <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); setEscolhaCriacaoAberta(null); setTimeout(() => setCreatingItemCategory('ItemAmaldiçoado'), 0); }} className="bg-zinc-900 border border-zinc-800 hover:border-purple-500 hover:bg-zinc-800 p-3 rounded text-zinc-300 font-bold transition">Item Amaldiçoado</button>
                <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); setEscolhaCriacaoAberta(null); setTimeout(() => setCreatingItemCategory('ArmaAmaldiçoada'), 0); }} className="bg-zinc-900 border border-zinc-800 hover:border-purple-500 hover:bg-zinc-800 p-3 rounded text-zinc-300 font-bold transition">Arma Amaldiçoada</button>
              </div>
            )}
            
          </div>
        </div>
      )}

      {/* Modais de Criação */}
      {creatingItemCategory === 'Armas' && (
        <ModalEditarArma
          armaInventario={{
            id: 'NEW',
            modificacoes: [], maldicoes: [], maldicoes_elementos: {},
            arma: {
              Codigo_Arma: -1, Nome_Item: 'Nova Arma', Descricao_Item: '', Tipo_Arma: 'Corpo a Corpo', Categoria_Item: '0', Dano_Arma: '1d4', Critico_Arma: 20, Multiplicador_Arma: 2, Alcance_Item: 'Curto', Empunhadura_Arma: 'Uma Mão', Tipo_Dano_Arma: 'Impacto', 'Espaços_Item': 1, Proficiencia: 'Armas Simples'
            }
          }}
          onSave={(dados, mods, malds, maldEls) => {
            armasHook.adicionarArma({ ...dados, Codigo_Arma: -1, Espaços_Item: Number(dados['Espaços_Item'] || 1) } as any, mods, malds, maldEls);
            setCreatingItemCategory(null);
          }}
          onClose={() => setCreatingItemCategory(null)}
        />
      )}
      {creatingItemCategory === 'ArmaAmaldiçoada' && (
        <ModalEditarArma
          armaInventario={{
            id: 'NEW',
            modificacoes: [], maldicoes: [], maldicoes_elementos: {},
            arma: {
              Codigo_Arma: -1, Nome_Item: 'Nova Arma Amaldiçoada', Descricao_Item: '', Tipo_Arma: 'Corpo a Corpo', Categoria_Item: '0', Dano_Arma: '1d4', Critico_Arma: 20, Multiplicador_Arma: 2, Alcance_Item: 'Curto', Empunhadura_Arma: 'Uma Mão', Tipo_Dano_Arma: 'Impacto', 'Espaços_Item': 1, Proficiencia: 'Armas Simples', isAmaldicoada: true
            }
          }}
          onSave={(dados, mods, malds, maldEls) => {
            armasHook.adicionarArma({ ...dados, Codigo_Arma: -1, Espaços_Item: Number(dados['Espaços_Item'] || 1), isAmaldicoada: true } as any, mods, malds, maldEls);
            setCreatingItemCategory(null);
          }}
          onClose={() => setCreatingItemCategory(null)}
        />
      )}
      {creatingItemCategory === 'Proteções' && (
        <ModalEditarProtecao protecao={{
            id: 'NEW',
            modificacoes: [], maldicoes: [],
            protecao: {
              Codigo_Protecao: -1, Nome_Protecao: 'Nova Proteção', Descricao_Protecao: '',
              Defesa_Protecao: 1, Categoria_Protecao: '0', Espacos_Protecao: 1,
              Proficiencia: 'Proteções Leves'
            }
          }}
          onSave={(dados, mods, malds, maldEls) => {
            protecoesHook.adicionarProtecao({ ...dados, Codigo_Protecao: -1, Espacos_Protecao: Number(dados.Espacos_Protecao || 1) } as any, mods, malds, maldEls as any);
            setCreatingItemCategory(null);
          }}
          onClose={() => setCreatingItemCategory(null)}
        />
      )}
      {creatingItemCategory === 'Munições' && (
        <ModalEditarMunicao itemInventario={{
            id: 'NEW',
            modificacoes: [], maldicoes: [],
            municao: {
              Codigo_Municao: -1, Nome_Item: 'Nova Munição', Descricao_Item: '',
              Tipo_Arma: 'Balas Longas', Categoria_Item: '0', Espaços_Item: 1
            } as any
          }}
          onSave={(dados, mods, malds, maldEls) => {
            municoesHook.adicionarMunicao({ ...dados, Codigo_Municao: -1, Espaços_Item: Number(dados['Espaços_Item'] || 1) } as any, mods, malds, maldEls as any);
            setCreatingItemCategory(null);
          }}
          onClose={() => setCreatingItemCategory(null)}
        />
      )}
      {creatingItemCategory === 'ItemAmaldiçoado' && (
        <ModalEditarItemAmaldicoado itemInventario={{
            id: 'NEW',
            item: {
              Codigo_Ama: -1, Nome_Ama: 'Novo Item Amaldiçoado', Desc_Ama: '',
              Elemento_Ama: 'Sangue', Categoria_Ama: 'II'
            }
          }}
          onSave={(dados) => {
            itensAmaldicoadosHook.adicionarItem({ ...dados, Codigo_Ama: -1 } as any);
            setCreatingItemCategory(null);
          }}
          onClose={() => setCreatingItemCategory(null)}
        />
      )}
      {(creatingItemCategory && !['Armas', 'ArmaAmaldiçoada', 'Proteções', 'Munições', 'ItemAmaldiçoado'].includes(creatingItemCategory)) && (
        <ModalEditarItem
          itemInventario={{
            id: 'NEW',
            modificacoes: [], maldicoes: [],
            item: {
              Codigo_Item: -1, Nome_Item: 'Novo Item', Descricao_Item: '',
              Categoria_Item: '0', Espacos_Itens: 1, Grupo_Item: creatingItemCategory
            }
          }}
          onSave={(dados, mods, malds, maldEls) => {
            itensHook.adicionarItem({ ...dados, Codigo_Item: -1, Espacos_Itens: Number(dados.Espacos_Itens || 1), Grupo_Item: creatingItemCategory } as any, mods, malds, maldEls as any);
            setCreatingItemCategory(null);
          }}
          onClose={() => setCreatingItemCategory(null)}
        />
      )}

      <ModalUnificadoItens 
        aberto={modalUnificadoAberto} 
        onFechar={() => setModalUnificadoAberto(false)} 
        defaultAba={categoriaFiltro} 
      />
      <ModalArmas aberto={modalArmasAberto} onFechar={() => setModalArmasAberto(false)} />
      <ModalProtecoes aberto={modalProteçõesAberto} onFechar={() => setModalProtecoesAberto(false)} />
      <ModalItens aberto={modalItensAberto} onFechar={() => setModalItensAberto(false)} grupoAba={abaItensAberta} />
      <ModalItensAmaldicoados aberto={modalItensAmaldicoadosAberto} fechar={() => setModalItensAmaldicoadosAberto(false)} />
      {modalMunicoesAberto && (
        <ModalMunicoes
          aberto={modalMunicoesAberto}
          fechar={() => setModalMunicoesAberto(false)}
          armaFiltroNome={municaoFiltroNome}
          armaFiltroCategoria={municaoFiltroCategoria}
          onSelect={municao => {
            if (municao.Codigo_Municao === 67) {
              setFlechaExplosivaPendente(municao);
              setModalGranadasAberto(true);
              setModalMunicoesAberto(false);
              return;
            }
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
          onSave={(dadosEditados, modificacoes, maldicoes, maldicoesElementos) => {
            armasHook?.editarArma(armaEditandoId, dadosEditados, modificacoes, maldicoes, maldicoesElementos);
          }}
          onClose={() => setArmaEditandoId(null)}
        />
      )}

      {editingItemAmaldicoado && itensAmaldicoadosHook && (
        <ModalEditarItemAmaldicoado
          itemInventario={editingItemAmaldicoado}
          onSave={(novosDados) => itensAmaldicoadosHook.editarItem(editingItemAmaldicoado.id, novosDados)}
          onClose={() => setEditingItemAmaldicoado(null)}
        />
      )}

      
      
      
      

      {protecaoEditandoId && (
        <ModalEditarProtecao
          protecao={protecoesHook?.protecoesInventario.find(p => p.id === protecaoEditandoId)!}
          onSave={(id, dadosEditados, modificacoes, maldicoes, maldicoesElementos) => {
            protecoesHook?.editarProtecao(protecaoEditandoId, dadosEditados, modificacoes, maldicoes, maldicoesElementos);
          }}
          onClose={() => setProtecaoEditandoId(null)}
        />
      )}

      {editingItem?.tipo === 'item' && getItemParaEditar() && (
        <ModalEditarItem
          itemInventario={getItemParaEditar()!}
          onSave={(dadosEditados, modificacoes, maldicoes, maldicoesElementos) => {
            itensHook.editarItem(editingItem.id, dadosEditados, modificacoes, maldicoes, maldicoesElementos);
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

      
      {modalAntenaAberto && (
        <ModalAntena
          onFechar={() => setModalAntenaAberto(false)}
          onSelect={(nome, elemento) => {
             if (antenaTargetArmaId) {
                const armaInv = armasHook?.armasInventario.find(a => a.id === antenaTargetArmaId);
                if (armaInv?.municoesAcopladas) {
                   armaInv.municoesAcopladas.forEach(m => armasHook?.desacoplarMunicao(antenaTargetArmaId, m));
                }
                armasHook?.acoplarMunicao(antenaTargetArmaId, 'RITUAL_' + elemento + '_' + nome);
             }
             setModalAntenaAberto(false);
          }}
        />
      )}

      {/* Modal Granadas */}
      {modalGranadasAberto && (
        <ModalGranadas
          onFechar={() => {
            setModalGranadasAberto(false);
            setFlechaExplosivaPendente(null);
          }}
          onSelect={(granada) => {
            if (flechaExplosivaPendente) {
              const flechaComGranada = {
                ...flechaExplosivaPendente,
                Nome_Item: `${flechaExplosivaPendente.Nome_Item} (${granada.Nome_Item})`,
                Categoria_Item: flechaExplosivaPendente.Categoria_Item + " + " + granada.Categoria_Item,
                granada_dano: granada.Dano_Item,
                granada_dt: granada.Dt_Item,
              };
              const newId = municoesHook?.adicionarMunicao(flechaComGranada);
              if (municaoTargetArmaId && newId) {
                armasHook?.acoplarMunicao(municaoTargetArmaId, newId);
              }
              setFlechaExplosivaPendente(null);
              setModalGranadasAberto(false);
              return;
            }

            const newId = itensHook?.adicionarItem(granada);
            if (granadaTargetArmaId && newId) {
               armasHook?.acoplarMunicao(granadaTargetArmaId, newId);
            }
            setModalGranadasAberto(false);
          }}
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
    onEditar,
    onAddMunicao,
    isOverlay
  }: {
  item: ArmaInventario;
  isExpanded: boolean;
  toggleExpandir: (id: string) => void;
  stringDT: string | null;
  removerArma: (id: string) => void;
    onEditar?: () => void;
    onAddMunicao?: () => void;
    isOverlay?: boolean;
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

  const { municoesHook, armasHook, proficienciasTotais, modificacoesHook, maldicoesHook, atributosFinais, status, regrasAutomaticasAtivas, regras, itensHook } = useRPG();
  const hasProficiencia = proficienciasTotais.includes(arma.Proficiencia);
  const [expandirMods, setExpandirMods] = useState(false);
    const [expandirMalds, setExpandirMalds] = useState(false);

  const modsAtuais = (Array.isArray(item.modificacoes) ? item.modificacoes : []).map(id => modificacoesHook.modificacoes.find(m => m.Codigo_Modif === id)).filter(Boolean) as any[];
    const maldicoesAtuais = (Array.isArray(item.maldicoes) ? item.maldicoes : []).map(id => maldicoesHook?.maldicoes.find(m => m.Codigo_Mald === id)).filter(Boolean) as any[];

  const municoesAcopladasList = (item.municoesAcopladas || []).map(mid => {
      if (typeof mid === 'string' && mid.startsWith('RITUAL_')) {
        const match = mid.match(/^RITUAL_([^_]+)_(.*)$/);
        if (match) {
           return { id: mid, municao: { Nome_Item: match[2] }, isRitual: true, elemento: match[1] };
        }
        return { id: mid, municao: { Nome_Item: mid.substring(7) }, isRitual: true };
      }
    let m = municoesHook?.municoesInventario.find(m => m.id === mid);
    if (m) return m;
    let i = itensHook?.itensInventario.find(i => i.id === mid);
    if (i) return { id: i.id, municao: i.item, qtd: i.qtd };
    return null;
  }).filter(Boolean) as any[];

  const isLancadorGranadas = arma.Nome_Item?.toLowerCase().includes('lançador de granadas') || arma.Nome_Item?.toLowerCase().includes('lancador de granadas');
  let granadaAcoplada: any = null;
  if (isLancadorGranadas && item.municoesAcopladas && item.municoesAcopladas.length > 0) {
    const mid = item.municoesAcopladas[0];
    const itemInv = itensHook?.itensInventario.find((i: any) => String(i.id) === String(mid));
    if (itemInv) granadaAcoplada = itemInv.item;
  }

  const calcularEstatisticasFinaisArma = () => {
      let dano = arma.Dano_Arma || '';
      if (arma.Nome_Item?.toLowerCase().includes('arcabuz dos moretti')) dano = 'Veja Texto';
      
    let espacos = calcularEspacosFinais(arma['Espaços_Item'], item.modificacoes, modificacoesHook.modificacoes, regrasAutomaticasAtivas?.has(43));
    let automatica = !!arma['Automatica?'];
    let critico = Number(arma.Critico_Arma || 20);
    let alcance = arma.Alcance_Item || '';
    let multiplicador = Number(arma.Multiplicador_Arma || 2);
    let danoSecundario = arma.Dano_Secundario || '';
    let dtGranada: string | null = null;
    
    if (isLancadorGranadas && granadaAcoplada) {
      const p = granadaAcoplada.Dano_Item?.split(',') || [];
      dano = p[0]?.trim() || '-';
      
      
      const dtItem = granadaAcoplada.Dt_Item;
      if (dtItem) {
        let val = dtItem.trim();
        let periciaStr = '';
        if (val.includes(',')) {
          const arr = val.split(',');
          val = arr.pop()!.trim();
          periciaStr = arr.join(',').trim();
        }
        let calc: string | number = 0;
        if (['FOR','AGI','INT','PRE','VIG'].includes(val.toUpperCase())) {
          calc = 10 + (atributosFinais[val.toUpperCase() as keyof typeof atributosFinais] || 0);
        } else {
          calc = Number(val);
          if (isNaN(calc)) calc = '-';
        }
        dtGranada = calc === '-' ? '-' : `${calc}${periciaStr ? ` (${periciaStr})` : ''}`;
      } else {
        dtGranada = '-';
      }
    }

    if (regrasAutomaticasAtivas?.has(86) && (arma.Tipo_Arma?.toLowerCase() === 'corpo a corpo' || arma.Tipo_Arma?.toLowerCase() === 'corpo-a-corpo') && arma.Nome_Item !== 'Ataque Desarmado') {
      dano = dano.replace(/(\d+)d(\d+)/gi, (match, p1, p2) => `${Number(p1) + 1}d${p2}`);
    }

    // Mods da arma
    for (const mod of modsAtuais) {
      const nome = mod.Nome_Modif.trim().toLowerCase();
      if (nome === 'calibre grosso') {
        dano = dano.replace(/(\d+)d(\d+)/gi, (match, p1, p2) => `${Number(p1) + 1}d${p2}`);
      }

      if (nome === 'ferrolho automático') {
        automatica = true;
      }
      if (nome === 'mira laser' || nome === 'perigosa') {
        critico -= 2;
      }
      if (nome === 'mira telescopica' || nome === 'mira telescópica') {
        const ord = ['Curto', 'Medio', 'Longo', 'Extremo', 'Ilimitado'];
        const idx = ord.indexOf(alcance);
        if (idx !== -1 && idx < ord.length - 1) {
          alcance = ord[idx + 1];
        }
      }
    }

    
      // Maldições da arma
      for (const mald of maldicoesAtuais) {
        const nomeM = mald.Nome_Mald.trim().toLowerCase();
        if (nomeM === 'erosiva') {
          danoSecundario = danoSecundario ? `${danoSecundario} + 1d8` : '+1d8';
        }
        if (nomeM === 'lancinante') {
          danoSecundario = danoSecundario ? `${danoSecundario} + 1d8*` : '+1d8*';
        }
        if (nomeM === 'predadora') {
          const margem = 21 - critico;
          critico = 21 - (margem * 2);
          const ord = ['Curto', 'Medio', 'Longo', 'Extremo', 'Ilimitado'];
          const idx = ord.indexOf(alcance);
          if (idx !== -1 && idx < ord.length - 1) {
            alcance = ord[idx + 1];
          }
        }
        if (nomeM === 'empuxo') {
          const ord = ['Curto', 'Medio', 'Longo', 'Extremo', 'Ilimitado'];
          if (!alcance) {
            alcance = 'Curto';
          } else {
            const idx = ord.indexOf(alcance);
            if (idx !== -1 && idx < ord.length - 1) {
              alcance = ord[idx + 1];
            }
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

    return { dano, espacos, automatica, critico, alcance, multiplicador, danoSecundario, dtGranada };
  };

  const stats = calcularEstatisticasFinaisArma();

  const style = isOverlay ? {} : {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.4 : 1,
  };

  let corBordaLeft = 'border-l-green-700';
  if (arma.isAmaldicoada && arma.Elemento_Arma) {
    const elStr = String(arma.Elemento_Arma).toLowerCase();
    corBordaLeft = elStr.includes('medo') ? 'border-l-zinc-200' :
                   elStr.includes('sangue') ? 'border-l-red-600' :
                   elStr.includes('morte') ? 'border-l-black' :
                   elStr.includes('energia') ? 'border-l-purple-600' :
                   elStr.includes('conhec') ? 'border-l-yellow-600' :
                   'border-l-zinc-600';
  }

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      className={`rounded border border-l-4 ${corBordaLeft} transition-colors ${
        isOverlay ? 'border-green-500 bg-zinc-900 shadow-2xl scale-[1.02] opacity-90 cursor-grabbing' : 
        isDragging ? 'border-zinc-800 bg-zinc-950/60 opacity-40' : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900/60'
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
            <span className="font-bold text-sm text-zinc-100 truncate leading-none mt-0.5 flex items-center gap-2">
  {arma.Nome_Item}
  {arma.isAmaldicoada && arma.Elemento_Arma && (
    <span className={`text-[10px] font-bold rounded-sm truncate uppercase tracking-wider w-fit ${
      arma.Elemento_Arma.toLowerCase().includes('medo') ? 'bg-zinc-200/80 text-zinc-950 px-1' :
      arma.Elemento_Arma.toLowerCase().includes('sangue') ? 'text-red-500' :
      arma.Elemento_Arma.toLowerCase().includes('morte') ? 'bg-black/50 text-white px-1' :
      arma.Elemento_Arma.toLowerCase().includes('conhecimento') ? 'text-yellow-500' :
      arma.Elemento_Arma.toLowerCase().includes('energia') ? 'text-purple-500' :
      'text-zinc-400'
    }`}>
      {arma.Elemento_Arma}
    </span>
  )}
</span>


            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-300 mt-0.5">
              <span><span className="font-bold text-green-400">Dano:</span> {stats.dano}{stats.danoSecundario ? (stats.danoSecundario.trim().startsWith('+') ? stats.danoSecundario.trim() : '+' + stats.danoSecundario.trim()) : ''}</span>
              {isLancadorGranadas ? (
                  <span><span className="font-bold text-green-400">DT:</span> {stats.dtGranada || '-'}</span>
                ) : (
                  <span><span className="font-bold text-zinc-400">Crítico:</span> {formatarCritico(stats.critico, stats.multiplicador)}</span>
                )}
              
              {arma.Resistencia_Item && <span><span className="font-bold text-zinc-400">Resistência:</span> {arma.Resistencia_Item}</span>}
            </div>
            {(modsAtuais.length > 0 || maldicoesAtuais.length > 0) && (
                <div className="flex items-center mt-1 min-w-0">
                  <span className="text-[11px] text-zinc-400 truncate italic">
                    {modsAtuais.length > 0 && modsAtuais.map(m => m.Nome_Modif).join(' • ')}
                    {modsAtuais.length > 0 && maldicoesAtuais.length > 0 && <span> • </span>}
                    {maldicoesAtuais.map((m: any, i: number) => {
                        const cor = getCorElementoTexto(m.Elemento_Mald);
                        return (
                          <span key={m.Codigo_Mald}>
                            {i > 0 && <span> • </span>}
                            <span className={cor}>{m.Nome_Mald}</span>
                          </span>
                        )
                    })}
                  </span>
                </div>
              )}
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            {regras?.['contagem_municao'] && arma.Capacidade_Municao != null && (
              <span className="relative group/mun cursor-help flex items-center">
                <span className="flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
                      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                      <line x1="12" y1="18" x2="12" y2="18.01"></line>
                      <line x1="8" y1="18" x2="8" y2="18.01"></line>
                      <line x1="16" y1="18" x2="16" y2="18.01"></line>
                      <line x1="8" y1="14" x2="8" y2="14.01"></line>
                      <line x1="12" y1="14" x2="12" y2="14.01"></line>
                      <line x1="16" y1="14" x2="16" y2="14.01"></line>
                      <line x1="8" y1="10" x2="8" y2="10.01"></line>
                      <line x1="12" y1="10" x2="12" y2="10.01"></line>
                      <line x1="16" y1="10" x2="16" y2="10.01"></line>
                    </svg>
                    <span className="text-[11px] font-bold text-zinc-300">{arma.Capacidade_Municao}</span>
                  </span>
                <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 opacity-0 invisible group-hover/mun:opacity-100 group-hover/mun:visible transition-all duration-300 group-hover/mun:delay-500 delay-0 w-32 p-1.5 bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded z-50 text-center shadow-lg pointer-events-none">
                  Capacidade de Munição
                </span>
              </span>
            )}
            {(arma['Improvisada?'] || modsAtuais.some(m => m?.Nome_Modif?.trim().toLowerCase() === 'apocalíptica' || m?.Nome_Modif?.trim().toLowerCase() === 'apocaliptica')) && (
                <span className="relative group/imp cursor-help">
                  <span className="text-sm text-orange-400">🔨</span>
                  <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 opacity-0 invisible group-hover/imp:opacity-100 group-hover/imp:visible transition-all duration-300 group-hover/imp:delay-500 delay-0 w-52 p-2 bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded z-50 text-center shadow-lg pointer-events-none">
                    Arma improvisada: Sofre -1d20 em testes de ataque com essa arma.
                  </span>
                </span>
              )}
              {arma['Agil?'] && (
              <span className="relative group/agil cursor-help">
                <span className="text-sm text-yellow-400">⚡</span>
                <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 opacity-0 invisible group-hover/agil:opacity-100 group-hover/agil:visible transition-all duration-300 group-hover/agil:delay-500 delay-0 w-52 p-2 bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded z-50 text-center shadow-lg pointer-events-none">
                  Permite que você aplique sua Agilidade em vez de sua Força em testes de ataque e rolagens de dano.
                </span>
              </span>
            )}
            {stats.automatica && (
              <span className="relative group/auto cursor-help">
                <span className="text-sm text-blue-400">🔄</span>
                <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 opacity-0 invisible group-hover/auto:opacity-100 group-hover/auto:visible transition-all duration-300 group-hover/auto:delay-500 delay-0 w-52 p-2 bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded z-50 text-center shadow-lg pointer-events-none">
                  Pode disparar rajadas. Quando dispara uma rajada, você sofre -1d20 no teste de ataque, mas causa 1 dado de dano adicional do mesmo tipo.
                </span>
              </span>
            )}
            {!hasProficiencia && (
              <span className="relative group/prof cursor-help">
                <span className="text-sm text-red-500">⚠️</span>
                <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 opacity-0 invisible group-hover/prof:opacity-100 group-hover/prof:visible transition-all duration-300 group-hover/prof:delay-500 delay-0 w-52 p-2 bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded z-50 text-center shadow-lg pointer-events-none">
                  Você não possui proficiência com esta arma, recebendo -2d20 em testes de ataque com ela.
                </span>
              </span>
            )}
            <span className="w-5 text-center text-zinc-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
          </div>
        </div>
      </div>
      
      <Collapse isOpen={isExpanded} className={isDragging ? 'hidden' : ''}>

        <div className="border-t border-zinc-800 px-3 py-3 text-xs flex flex-col gap-2 bg-zinc-950/80">
          <div>
            <span className="font-bold text-zinc-200">{arma.Proficiencia}</span>
            <span className="text-zinc-600"> — </span>
            <span className="italic text-zinc-400">{arma.Tipo_Arma}</span>
          </div>
          <div className="flex flex-col gap-1 text-xs text-zinc-300">
            <span><span className="text-green-400 font-bold">Categoria:</span> {calcularCategoriaFinal(arma.Categoria_Item, item.modificacoes, modificacoesHook.modificacoes, arma.Codigo_Arma === 71 ? true : arma.Nome_Item, item.maldicoes, maldicoesHook?.maldicoes, item.id === armaFavId ? descontoFavorita : 0)}</span>
            {stats.alcance && <span><span className="text-green-400 font-bold">Alcance:</span> {stats.alcance}</span>}
            <span><span className="text-green-400 font-bold">Tipo:</span> {municoesAcopladasList[0]?.municao?.Codigo_Municao === 63 ? 'Impacto' : arma.Tipo_Dano_Arma}</span>
              {municoesAcopladasList[0]?.municao?.Codigo_Municao === 67 && municoesAcopladasList[0]?.municao?.granada_dano && (
                <span><span className="text-green-400 font-bold">Explosivo:</span> {municoesAcopladasList[0].municao.granada_dano} (DT {municoesAcopladasList[0].municao.granada_dt || '-'})</span>
              )}
              {isLancadorGranadas && granadaAcoplada && (
                <span><span className="text-green-400 font-bold">Granada:</span> {granadaAcoplada.Nome_Item}</span>
              )}
            <span><span className="text-green-400 font-bold">Espaços:</span> {stats.espacos}</span>
            {modsAtuais.length > 0 && (
              <div className="mt-3">
                <div 
                  className="flex items-center gap-2 cursor-pointer group py-1.5 px-2 -mx-2 rounded hover:bg-zinc-800/40 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setExpandirMods(!expandirMods); }}
                >
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">Modificações</span>
                  <div className="h-px bg-zinc-800 flex-1 group-hover:bg-zinc-700 transition-colors"></div>
                  <svg className={`w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-transform duration-200 ${expandirMods ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
                <Collapse isOpen={expandirMods}>
                  <div className="flex flex-col gap-2 pt-2 pb-1">
                    {modsAtuais.map(m => (
                      <div key={m.Codigo_Modif} className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-zinc-200">{m.Nome_Modif}</span>
                        <p className="text-[11px] text-zinc-400 leading-relaxed whitespace-pre-wrap">{formatarTexto(m.Descricao_Modif || '')}</p>
                      </div>
                    ))}
                  </div>
                </Collapse>
              </div>
            )}
            {((Array.isArray(item.maldicoes) ? item.maldicoes : []).length > 0) && (
              <div className="mt-3">
                <div 
                  className="flex items-center gap-2 cursor-pointer group py-1.5 px-2 -mx-2 rounded hover:bg-zinc-800/40 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setExpandirMalds(!expandirMalds); }}
                >
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">Maldições</span>
                  <div className="h-px bg-zinc-800 flex-1 group-hover:bg-zinc-700 transition-colors"></div>
                  <svg className={`w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-transform duration-200 ${expandirMalds ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
                <Collapse isOpen={expandirMalds}>
                  <div className="flex flex-col gap-2 pt-2 pb-1">
                    {(Array.isArray(item.maldicoes) ? item.maldicoes : []).map((id: number) => {
                      const m = maldicoesHook?.maldicoes.find((x: any) => x.Codigo_Mald === id);
                      if (!m) return null;
                      const corTexto = getCorElementoTexto ? getCorElementoTexto(m.Elemento_Mald) : 'text-zinc-400';
                      return (
                        <div key={m.Codigo_Mald} className="flex flex-col gap-0.5">
                          <div className="flex gap-1 items-center">
                            <span className={`text-xs font-bold ${corTexto}`}>{m.Nome_Mald}</span>
                            <span className={`rounded px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${getBadgeElemento(m.Elemento_Mald)}`}>{m.Elemento_Mald}</span>
                          </div>
                          {m.Descricao_Mald && (
                            <p className="text-[11px] text-zinc-400 leading-relaxed whitespace-pre-wrap">{formatarTexto(m.Descricao_Mald)}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Collapse>
              </div>
            )}

            

          </div>
          
          <div className="flex flex-col gap-1 mt-3 pt-3 border-t border-zinc-800/50">

          
            <p className="text-zinc-400 text-xs leading-relaxed whitespace-pre-wrap">{formatarTexto(arma.Descricao_Item)}</p>

          
          </div>

          
          {arma.Fonte_Arma && (

          
            <div className="mt-2 pt-2 border-t border-zinc-800/50">

          
              <span className="text-[10px] uppercase tracking-wider text-zinc-600">Fonte: {arma.Fonte_Arma}</span>

          
            </div>

          
          )}
          
          <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-zinc-800/50">
            {id !== 'coronhada-virtual' && (
                <>
                  {(((arma.Tipo_Arma?.toLowerCase() !== 'corpo a corpo' && arma.Tipo_Arma?.toLowerCase() !== 'corpo-a-corpo') || arma.Nome_Item?.trim().toLowerCase() === 'a antena' || arma.Nome_Item?.trim().toLowerCase() === 'a antena\r') && arma.Tipo_Arma && !(arma.Nome_Item?.toLowerCase().includes('arcabuz dos moretti') || arma.Nome_Item?.toLowerCase().includes('fuzil alheio'))) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (arma.Nome_Item?.trim().toLowerCase() === 'a antena' || arma.Nome_Item?.toLowerCase().includes('lançador de granadas') || arma.Nome_Item?.toLowerCase().includes('lancador de granadas')) {
                          onAddMunicao?.();
                        } else {
                          const compativeis = municoesHook?.getMunicoesCompativeis?.(arma.Nome_Item, arma.Categoria_Item) || [];
                          if (compativeis.length === 1) {
                            const idM = municoesHook?.adicionarMunicao(compativeis[0]);
                            if (idM) armasHook?.acoplarMunicao(id, idM);
                          } else if (onAddMunicao) {
                            onAddMunicao();
                          }
                        }
                      }}
                      className={`text-xs px-3 py-1.5 rounded bg-zinc-900 border transition-colors ${
                        (arma.Nome_Item?.toLowerCase().includes('lançador de granadas') || arma.Nome_Item?.toLowerCase().includes('lancador de granadas'))
                          ? 'border-zinc-700 hover:border-orange-700 hover:bg-orange-900/20 text-zinc-300 hover:text-orange-400'
                          : 'border-zinc-700 hover:border-blue-700 hover:bg-blue-900/20 text-zinc-300 hover:text-blue-400'
                      }`}
                    >
                      {arma.Nome_Item?.trim() === 'A Antena' ? '+ Ritual' : ((arma.Nome_Item?.toLowerCase().includes('lançador de granadas') || arma.Nome_Item?.toLowerCase().includes('lancador de granadas')) ? '+ Granada' : '+ Munição')}
                    </button>
                  )}
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
                  className="text-xs text-green-500 hover:text-green-400 bg-green-950/30 hover:bg-green-900/50 px-3 py-1.5 rounded border border-green-900/50 transition-colors"
                >
                  Remover
                </button>
              </>
            )}
          </div>
        </div>
      
              {municoesAcopladasList.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-3 pt-3 pb-1 border-t border-zinc-800/50 bg-zinc-900/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{municoesAcopladasList[0]?.isRitual ? 'Ritual:' : 'Munições:'}</span>
            {municoesAcopladasList.map(minv => (
              <div key={minv.id} className={`flex items-center gap-1 border rounded-full pl-2 pr-1 py-0.5 group ${getBadgeClasses(minv)}`}>
                <span className={`text-[11px] ${getBadgeTextClasses(minv)} truncate max-w-[150px]`}>{minv.municao.Nome_Item}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    armasHook?.desacoplarMunicao(item.id, minv.id);
                    municoesHook?.removerMunicao(minv.id);
                  }}
                  title="Remover Munição"
                  className={`flex items-center justify-center w-4 h-4 rounded-full transition-colors ${getBadgeCloseClasses(minv)}`}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        </Collapse>
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
  isOverlay?: boolean;
}

function SortableMunicaoItem({ id, item, isExpanded, toggleExpandir, removerItem, onEditar, isOverlay }: SortableMunicaoItemProps) {
  const { municao } = item;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data: { type: 'municao' } });

  const { modificacoesHook, maldicoesHook, armasHook, regrasAutomaticasAtivas, regras } = useRPG();
  const [expandirMods, setExpandirMods] = useState(false);
  const [expandirMalds, setExpandirMalds] = useState(false);
  const modsAtuais = (Array.isArray(item.modificacoes) ? item.modificacoes : []).map(id => modificacoesHook.modificacoes.find(m => m.Codigo_Modif === id)).filter(Boolean) as any[];
  const maldicoesAtuais = (Array.isArray(item.maldicoes) ? item.maldicoes : []).map(id => maldicoesHook?.maldicoes.find(m => m.Codigo_Mald === id)).filter(Boolean) as any[];

  let armaNome = '';
  let armaPos = 0;
  let armaTotal = 0;
  armasHook?.armasInventario.forEach(a => {
    if (a.municoesAcopladas && a.municoesAcopladas.includes(id)) {
      armaNome = a.arma.Nome_Item;
      armaTotal = a.municoesAcopladas.length;
      armaPos = a.municoesAcopladas.indexOf(id) + 1;
    }
  });

  const modsNames = [...modsAtuais.map(m => m.Nome_Modif), ...maldicoesAtuais.map(m => m.Nome_Mald)];
  const modifiersText = modsNames.length > 0 ? ` (${modsNames.join(', ')})` : '';
  const displayName = `${municao.Nome_Item}${modifiersText}`;

  const style = isOverlay ? {} : {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      className={`rounded border border-l-4 border-l-green-700 transition-colors ${
        isOverlay ? 'border-green-500 bg-zinc-900 shadow-2xl scale-[1.02] opacity-90 cursor-grabbing' :
        isDragging ? 'border-zinc-800 bg-zinc-950/60 opacity-40' : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900/60'
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
          className="flex-1 flex items-center justify-between min-w-0 pr-2 cursor-pointer"
          onClick={() => toggleExpandir(id)}
        >
          <div className="flex flex-col gap-1 min-w-0 justify-center">
            <div className="flex flex-col gap-0.5">
                <span className="font-bold text-zinc-100 text-sm truncate leading-none mt-0.5" title={displayName}>{displayName}</span>
                {armaNome && (
                  <span className="text-[10px] font-bold text-green-500/80 uppercase tracking-wider">
                    Em: {armaNome} [{armaPos}/{armaTotal}]
                  </span>
                )}
              </div>
            <div className="flex items-center gap-4 text-xs text-zinc-300 mt-0.5">
              <span><span className="font-bold text-zinc-400">Categoria:</span> {calcularCategoriaFinal(municao.Categoria_Item, item.modificacoes, modificacoesHook.modificacoes, false, item.maldicoes, maldicoesHook?.maldicoes)}</span>
              {regras?.['contagem_municao'] && municao.contagem_municao && (
                <span><span className="font-bold text-zinc-400">Quantidade:</span> {municao.contagem_municao}</span>
              )}
            </div>
            {(modsAtuais.length > 0 || maldicoesAtuais.length > 0) && (
                <div className="flex items-center mt-1 min-w-0">
                  <span className="text-[11px] text-zinc-400 truncate italic">
                    {modsAtuais.length > 0 && modsAtuais.map(m => m.Nome_Modif).join(' • ')}
                    {modsAtuais.length > 0 && maldicoesAtuais.length > 0 && <span> • </span>}
                    {maldicoesAtuais.map((m: any, i: number) => {
                        const cor = getCorElementoTexto(m.Elemento_Mald);
                        return (
                          <span key={m.Codigo_Mald}>
                            {i > 0 && <span> • </span>}
                            <span className={cor}>{m.Nome_Mald}</span>
                          </span>
                        )
                    })}
                  </span>
                </div>
              )}

            
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <div onClick={() => toggleExpandir(id)} className="w-5 text-center text-zinc-500 text-xs flex-shrink-0 cursor-pointer">{isExpanded ? '▲' : '▼'}</div>
          </div>
        </div>
      </div>

      <Collapse isOpen={isExpanded} className={isDragging ? 'hidden' : ''}>

        <div className="border-t border-zinc-800 px-3 py-3 text-xs flex flex-col gap-2 bg-zinc-950/80">
          <div className="flex flex-col gap-1 text-xs text-zinc-300">
            <span><span className="text-zinc-400 font-bold">Categoria:</span> {calcularCategoriaFinal(municao.Categoria_Item, item.modificacoes, modificacoesHook.modificacoes, false, item.maldicoes, maldicoesHook?.maldicoes)}</span>
            <span><span className="text-zinc-400 font-bold">Espaços:</span> {calcularEspacosFinais(municao['Espaços_Item'], item.modificacoes, modificacoesHook.modificacoes, regrasAutomaticasAtivas.has(43))}</span>

              {((Array.isArray(item.maldicoes) ? item.maldicoes : []).length > 0) && (
              <div className="mt-3">
                <div 
                  className="flex items-center gap-2 cursor-pointer group py-1.5 px-2 -mx-2 rounded hover:bg-zinc-800/40 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setExpandirMalds(!expandirMalds); }}
                >
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">Maldições</span>
                  <div className="h-px bg-zinc-800 flex-1 group-hover:bg-zinc-700 transition-colors"></div>
                  <svg className={`w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-transform duration-200 ${expandirMalds ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
                <Collapse isOpen={expandirMalds}>
                  <div className="flex flex-col gap-2 pt-2 pb-1">
                    {(Array.isArray(item.maldicoes) ? item.maldicoes : []).map((id: number) => {
                      const m = maldicoesHook?.maldicoes.find((x: any) => x.Codigo_Mald === id);
                      if (!m) return null;
                      const corTexto = getCorElementoTexto ? getCorElementoTexto(m.Elemento_Mald) : 'text-zinc-400';
                      return (
                        <div key={m.Codigo_Mald} className="flex flex-col gap-0.5">
                          <div className="flex gap-1 items-center">
                            <span className={`text-xs font-bold ${corTexto}`}>{m.Nome_Mald}</span>
                            <span className={`rounded px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${getBadgeElemento(m.Elemento_Mald)}`}>{m.Elemento_Mald}</span>
                          </div>
                          {m.Descricao_Mald && (
                            <p className="text-[11px] text-zinc-400 leading-relaxed whitespace-pre-wrap">{formatarTexto(m.Descricao_Mald)}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Collapse>
              </div>
            )}
            {modsAtuais.length > 0 && (
              <div className="mt-3">
                <div 
                  className="flex items-center gap-2 cursor-pointer group py-1.5 px-2 -mx-2 rounded hover:bg-zinc-800/40 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setExpandirMods(!expandirMods); }}
                >
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">Modificações</span>
                  <div className="h-px bg-zinc-800 flex-1 group-hover:bg-zinc-700 transition-colors"></div>
                  <svg className={`w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-transform duration-200 ${expandirMods ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
                <Collapse isOpen={expandirMods}>
                  <div className="flex flex-col gap-2 pt-2 pb-1">
                    {modsAtuais.map(m => (
                      <div key={m.Codigo_Modif} className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-zinc-200">{m.Nome_Modif}</span>
                        <p className="text-[11px] text-zinc-400 leading-relaxed whitespace-pre-wrap">{formatarTexto(m.Descricao_Modif || '')}</p>
                      </div>
                    ))}
                  </div>
                </Collapse>
              
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-1 mt-3 pt-3 border-t border-zinc-800/50">
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
              className="text-xs text-green-500 hover:text-green-400 bg-green-950/30 hover:bg-green-900/50 px-3 py-1.5 rounded border border-green-900/50 transition-colors"
            >
              Remover
            </button>
          </div>
        </div>
      
      </Collapse>
    </div>
  );
}

function SortableProtecaoItem({
  item,
  isExpanded,
  toggleExpandir,
  removerProtecao,
  onEditar,
  toggleEquipado,
  isOverlay
}: {
  item: ProtecaoInventario;
  isExpanded: boolean;
  toggleExpandir: (id: string) => void;
  removerProtecao: (id: string) => void;
  onEditar?: () => void;
  toggleEquipado: (id: string) => void;
  isOverlay?: boolean;
}) {
  const { id, protecao, equipado } = item;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data: { type: 'protecao' } });
  const { proficienciasTotais, modificacoesHook, maldicoesHook, regrasAutomaticasAtivas, rituaisHook } = useRPG();
  const hasProficiencia = protecao.Proficiencia === 'Nenhuma' || proficienciasTotais.includes(protecao.Proficiencia);
  const [expandirMods, setExpandirMods] = useState(false);
    const [expandirMalds, setExpandirMalds] = useState(false);

  const modsAtuais = (Array.isArray(item.modificacoes) ? item.modificacoes : []).map(id => modificacoesHook.modificacoes.find(m => m.Codigo_Modif === id)).filter(Boolean) as any[];
    const maldicoesAtuais = (Array.isArray(item.maldicoes) ? item.maldicoes : []).map(id => maldicoesHook?.maldicoes.find(m => m.Codigo_Mald === id)).filter(Boolean) as any[];

  const style = isOverlay ? {} : {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      className={`rounded border border-l-4 border-l-blue-700 transition-colors ${
        isOverlay ? 'border-blue-500 bg-zinc-900 shadow-2xl scale-[1.02] opacity-90 cursor-grabbing' :
        isDragging ? 'border-zinc-800 bg-zinc-950/60 opacity-40' : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900/60'
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
                  const extraDefMod = modsAtuais.some(m => m?.Nome_Modif?.trim().toLowerCase() === 'reforçada') ? 2 : 0;
                  const extraDefMald = maldicoesAtuais.reduce((acc, m) => {
                    const nome = m?.Nome_Mald?.trim().toLowerCase();
                    if (nome === 'cinética') return acc + 2;
                    if (nome === 'letárgica') return acc + 2;
                    if (nome === 'defesa') return acc + 5;
                    return acc;
                  }, 0);
                  const extraDef = extraDefMod + extraDefMald;
                  const defVal = Number(String(protecao.Defesa_Protecao || '0').replace(/[^0-9.-]+/g, ''));
                  const total = (isNaN(defVal) ? 0 : defVal) + extraDef;
                  return total >= 0 ? `+${total}` : `${total}`;
                })()
              }</span>
            </div>
            {(modsAtuais.length > 0 || maldicoesAtuais.length > 0) && (
                <div className="flex items-center mt-1 min-w-0">
                  <span className="text-[11px] text-zinc-400 truncate italic">
                    {modsAtuais.length > 0 && modsAtuais.map(m => m.Nome_Modif).join(' • ')}
                    {modsAtuais.length > 0 && maldicoesAtuais.length > 0 && <span> • </span>}
                    {maldicoesAtuais.map((m: any, i: number) => {
                        const cor = getCorElementoTexto(m.Elemento_Mald);
                        return (
                          <span key={m.Codigo_Mald}>
                            {i > 0 && <span> • </span>}
                            <span className={cor}>{m.Nome_Mald}</span>
                          </span>
                        )
                    })}
                  </span>
                </div>
              )}

            
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              toggleEquipado(id);
            }}
            className={`w-4 h-4 rounded flex items-center justify-center border transition-colors cursor-pointer ${
              equipado 
                ? 'bg-zinc-700 border-zinc-500 text-zinc-100' 
                : 'bg-zinc-900 border-zinc-700 text-transparent hover:border-zinc-500'
            }`}
            title={equipado ? "Desequipar" : "Equipar proteção"}
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="2.5 6 5 8.5 9.5 3.5" />
            </svg>
          </button>
          {!hasProficiencia && (
            <span className="relative group/prof cursor-help">
              <span className="text-sm text-red-500">⚠️</span>
              <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 opacity-0 invisible group-hover/prof:opacity-100 group-hover/prof:visible transition-all duration-300 group-hover/prof:delay-500 delay-0 w-52 p-2 bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded z-50 text-center shadow-lg pointer-events-none">
                Se você usar uma proteção com a qual não seja proficiente, sofre -2d20 em testes baseados em Força ou Agilidade.
              </span>
            </span>
          )}
          <div onClick={() => toggleExpandir(id)} className="w-5 text-center text-zinc-500 text-xs cursor-pointer">{isExpanded ? '▲' : '▼'}</div>
        </div>
      </div>

      <Collapse isOpen={isExpanded} className={isDragging ? 'hidden' : ''}>

        <div className="border-t border-zinc-800 px-3 py-3 text-xs flex flex-col gap-2 bg-zinc-950/80">
          <div className="flex flex-col gap-1 text-xs text-zinc-300">
            <span><span className="text-blue-400 font-bold">Proficiência:</span> {protecao.Proficiencia}</span>
            <span><span className="text-blue-400 font-bold">Categoria:</span> {calcularCategoriaFinal(protecao.Categoria_Protecao, item.modificacoes, modificacoesHook.modificacoes, false, item.maldicoes, maldicoesHook?.maldicoes)}</span>
            <span><span className="text-blue-400 font-bold">Espaços:</span> {calcularEspacosFinais(protecao.Espacos_Protecao, item.modificacoes, modificacoesHook.modificacoes, regrasAutomaticasAtivas.has(43))}</span>

              {((Array.isArray(item.maldicoes) ? item.maldicoes : []).length > 0) && (
              <div className="mt-3">
                <div 
                  className="flex items-center gap-2 cursor-pointer group py-1.5 px-2 -mx-2 rounded hover:bg-zinc-800/40 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setExpandirMalds(!expandirMalds); }}
                >
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">Maldições</span>
                  <div className="h-px bg-zinc-800 flex-1 group-hover:bg-zinc-700 transition-colors"></div>
                  <svg className={`w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-transform duration-200 ${expandirMalds ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
                <Collapse isOpen={expandirMalds}>
                  <div className="flex flex-col gap-2 pt-2 pb-1">
                    {(Array.isArray(item.maldicoes) ? item.maldicoes : []).map((id: number) => {
                      const m = maldicoesHook?.maldicoes.find((x: any) => x.Codigo_Mald === id);
                      if (!m) return null;
                      const corTexto = getCorElementoTexto ? getCorElementoTexto(m.Elemento_Mald) : 'text-zinc-400';
                      return (
                        <div key={m.Codigo_Mald} className="flex flex-col gap-0.5">
                          <div className="flex gap-1 items-center">
                            <span className={`text-xs font-bold ${corTexto}`}>{m.Nome_Mald}</span>
                            <span className={`rounded px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${getBadgeElemento(m.Elemento_Mald)}`}>{m.Elemento_Mald}</span>
                          </div>
                          {m.Descricao_Mald && (
                            <p className="text-[11px] text-zinc-400 leading-relaxed whitespace-pre-wrap">{formatarTexto(m.Descricao_Mald)}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Collapse>
              </div>
            )}

            {modsAtuais.length > 0 && (
              <div className="mt-3">
                <div 
                  className="flex items-center gap-2 cursor-pointer group py-1.5 px-2 -mx-2 rounded hover:bg-zinc-800/40 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setExpandirMods(!expandirMods); }}
                >
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">Modificações</span>
                  <div className="h-px bg-zinc-800 flex-1 group-hover:bg-zinc-700 transition-colors"></div>
                  <svg className={`w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-transform duration-200 ${expandirMods ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
                <Collapse isOpen={expandirMods}>
                  <div className="flex flex-col gap-2 pt-2 pb-1">
                    {modsAtuais.map(m => (
                      <div key={m.Codigo_Modif} className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-zinc-200">{m.Nome_Modif}</span>
                        <p className="text-[11px] text-zinc-400 leading-relaxed whitespace-pre-wrap">{formatarTexto(m.Descricao_Modif || '')}</p>
                      </div>
                    ))}
                  </div>
                </Collapse>
              
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 mt-3 pt-3 border-t border-zinc-800/50">
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
              className="text-xs text-green-500 hover:text-green-400 bg-green-950/30 hover:bg-green-900/50 px-3 py-1.5 rounded border border-green-900/50 transition-colors"
            >
              Remover
            </button>
          </div>
        </div>
      
      </Collapse>



    </div>
  );

}