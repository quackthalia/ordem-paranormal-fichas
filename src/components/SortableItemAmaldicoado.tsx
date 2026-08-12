import { useState } from 'react';
import { useRPG } from '../context/RPGContext';
import type { ItemAmaldicoadoInventario } from '../types';
import { formatarTexto } from '../utils/formatters';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemAmaldicoadoProps {
  item: ItemAmaldicoadoInventario;
  isExpanded: boolean;
  toggleExpandir: (id: string) => void;
  removerItem: (id: string) => void;
  stringDT: string | null;
  onEditar?: () => void;
  toggleEquipado: (id: string) => void;
}

export function SortableItemAmaldicoado({ item, isExpanded, toggleExpandir, removerItem, stringDT, onEditar, toggleEquipado }: SortableItemAmaldicoadoProps) {
  const { modificacoesHook } = useRPG();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, data: { type: 'amaldicoado' } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.4 : 1,
  };

  let corBordaLeft = 'border-l-zinc-600';
  if (item.item.Elemento_Ama) {
    const elStr = item.item.Elemento_Ama.toLowerCase();
    corBordaLeft = elStr.includes('medo') ? 'border-l-zinc-200' :
                   elStr.includes('sangue') ? 'border-l-red-600' :
                   elStr.includes('morte') ? 'border-l-black' :
                   elStr.includes('conhecimento') ? 'border-l-yellow-600' :
                   elStr.includes('energia') ? 'border-l-purple-600' : 'border-l-zinc-600';
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded border border-l-4 ${corBordaLeft} transition-colors w-full relative ${isDragging ? 'border-zinc-500 bg-zinc-900 shadow-xl scale-[1.02]' : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900/60'}`}
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
          onClick={() => toggleExpandir(item.id)}
        >
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <span className="font-bold text-sm text-zinc-100 truncate leading-none mt-0.5">{item.item.Nome_Ama}</span>

            {stringDT && (
              <div className="flex items-center gap-4 text-xs text-zinc-300 mt-0.5">
                <span><span className="font-bold text-green-400">DT:</span> {stringDT}</span>
              </div>
            )}
            
            <div className="flex items-center min-w-0">
              <span className="text-[11px] text-zinc-400 truncate italic">
                Categoria {item.item.Categoria_Ama}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {item.item.Elemento_Ama ? (() => {
              const elStr = item.item.Elemento_Ama.toLowerCase();
              const corText = elStr.includes('medo') ? 'bg-zinc-200/80 text-zinc-950 px-1' :
                              elStr.includes('sangue') ? 'text-red-500' :
                              elStr.includes('morte') ? 'bg-black/50 text-white px-1' :
                              elStr.includes('conhecimento') ? 'text-yellow-500' :
                              elStr.includes('energia') ? 'text-purple-500' : 'text-zinc-400';
              return (
                <span className={`text-[10px] font-bold rounded-sm truncate uppercase tracking-wider w-fit ${corText}`}>
                  {item.item.Elemento_Ama}
                </span>
              );
          })() : <span className="text-[10px] font-bold text-zinc-500 truncate uppercase tracking-wider">Sem Elemento</span>}

          {(item.item['Vestimenta?']?.toLowerCase() === 'true') && (
            <input
              type="checkbox"
              checked={!!item.equipado}
              onPointerDown={(e) => e.stopPropagation()}
              onChange={() => toggleEquipado(item.id)}
              className="w-5 h-5 cursor-pointer accent-green-600"
              title={item.equipado ? "Desequipar" : "Equipar item"}
            />
          )}
          <div onClick={() => toggleExpandir(item.id)} className="w-5 text-center text-zinc-500 text-xs flex-shrink-0 cursor-pointer">{isExpanded ? '▲' : '▼'}</div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="border-t border-zinc-800 px-3 py-3 text-xs bg-zinc-950/80 flex flex-col gap-2 relative z-10" onClick={e => e.stopPropagation()}>
          <div className="flex flex-col gap-1 mt-1">
            <span><span className="text-green-400 font-bold">Categoria:</span> {item.item.Categoria_Ama}</span>
            <span><span className="text-green-400 font-bold">Espaços:</span> {item.item.Espacos_Ama}</span>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <p className="text-zinc-400 text-xs leading-relaxed whitespace-pre-wrap">{formatarTexto(item.item.Desc_Ama)}</p>
          </div>
          


          {item.item.Fonte_Ama && (
            <div className="mt-2 pt-2 border-t border-zinc-800/50">
              <span className="text-[10px] uppercase tracking-wider text-zinc-600">Fonte: {item.item.Fonte_Ama}</span>
            </div>
          )}
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
                removerItem(item.id);
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
