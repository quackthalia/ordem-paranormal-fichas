import { useState } from 'react';
import { useRPG } from '../context/RPGContext';
import type { ItemAmaldicoadoInventario } from '../types';
import { formatarTexto } from '../utils/formatters';
import { Collapse } from './Collapse';
import { CustomSelect } from './CustomSelect';
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
  isOverlay?: boolean;
}


function obterValorVersao(
  campo: string,
  versao: string,
  temDiscente: boolean,
  temVerdadeiro: boolean
): string {
  if (!campo || versao === 'normal') {
    if (campo && campo.includes('/')) return campo.split('/')[0].trim();
    return campo || '';
  }
  const partes = campo.split('/').map(p => p.trim());
  const normal = partes[0];
  if (partes.length === 1) return normal;
  if (versao === 'discente') return partes[1] || normal;
  if (versao === 'verdadeiro') {
    if (temDiscente && temVerdadeiro) return partes[2] || normal;
    return partes[1] || normal;
  }
  return normal;
}

export function SortableItemAmaldicoado({ item, isExpanded, toggleExpandir, removerItem, stringDT, onEditar, toggleEquipado, isOverlay }: SortableItemAmaldicoadoProps) {
  const { modificacoesHook, rituaisHook, itensAmaldicoadosHook, versaoRitual, setVersaoRitual, temMonstruoso99, monstruosoElemento } = useRPG();
  const [ritualExpandido, setRitualExpandido] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, data: { type: 'amaldicoado' } });

  const style = isOverlay ? {} : {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.4 : 1,
  };

  let corBordaLeft = 'border-l-zinc-600';
  if (item.item.Elemento_Ama) {
    const elStr = String(item.item.Elemento_Ama).toLowerCase();
    corBordaLeft = elStr.includes('medo') ? 'border-l-zinc-200' :
                   elStr.includes('sangue') ? 'border-l-red-600' :
                   elStr.includes('morte') ? 'border-l-black' :
                   elStr.includes('conhecimento') ? 'border-l-yellow-600' :
                   elStr.includes('energia') ? 'border-l-purple-600' : 
                   (elStr.includes('varia') || elStr.includes('vária')) ? 'border-l-green-600' : 'border-l-zinc-600';
  }

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      className={`rounded border border-l-4 ${corBordaLeft} transition-colors w-full relative ${
        isOverlay ? 'border-zinc-500 bg-zinc-900 shadow-2xl scale-[1.02] opacity-90 cursor-grabbing' :
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
          className="flex-1 flex cursor-pointer items-start pt-0.5 justify-between gap-3 min-w-0"
          onClick={() => toggleExpandir(item.id)}
        >
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <span className="font-bold text-sm text-zinc-100 truncate leading-none mt-0.5">
              {item.item.Nome_Ama}
              {item.item.Nome_Ama === 'Selos Paranormais' && item.item.ritualSeloKey ? (() => {
                 const ritualA = rituaisHook.rituaisAprendidos.find(r => `${r.codigo_ritual}_${r.origem}` === item.item.ritualSeloKey);
                 if (!ritualA) return '';
                 const base = rituaisHook.rituais.find(b => b.Codigo_Ritual == ritualA.codigo_ritual);
                 return ` (${ritualA.customNome || (base ? base.Nome_Ritual : '')})`;
              })() : ''}
            </span>

            {stringDT && (
              <div className="flex items-center gap-4 text-xs text-zinc-300 mt-0.5">
                <span><span className="font-bold text-green-400">DT:</span> {stringDT}</span>
              </div>
            )}
            
            <div className="flex items-center min-w-0">
              <span className="text-[11px] text-zinc-400 truncate">
                Categoria {item.item.Categoria_Ama}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 mt-0.5">
          {item.item.Elemento_Ama ? (() => {
              const elStr = String(item.item.Elemento_Ama).toLowerCase();
              const corText = elStr.includes('medo') ? 'bg-zinc-200/80 text-zinc-950 px-1' :
                              elStr.includes('sangue') ? 'text-red-500' :
                              elStr.includes('morte') ? 'bg-black/50 text-white px-1' :
                              elStr.includes('conhecimento') ? 'text-yellow-500' :
                              elStr.includes('energia') ? 'text-purple-500' : 
                              'text-zinc-400';
              return (
                <span className={`text-[10px] font-bold rounded-sm truncate uppercase tracking-wider w-fit ${corText}`}>
                  {item.item.Elemento_Ama}
                </span>
              );
          })() : <span className="text-[10px] font-bold text-zinc-300 bg-zinc-700/50 px-1 rounded-sm truncate uppercase tracking-wider">Sem Elemento</span>}

          {(String(item.item['Vestimenta?']).toLowerCase() === 'true') && (() => {
            const elStr = String(item.item.Elemento_Ama || '').toLowerCase();
            const checkedColor = elStr.includes('medo') ? 'bg-white border-zinc-400 text-zinc-950' :
                                 elStr.includes('sangue') ? 'bg-red-700 border-zinc-700 text-white' :
                                 elStr.includes('morte') ? 'bg-black border-zinc-700 text-white' :
                                 elStr.includes('conhecimento') ? 'bg-yellow-600 border-zinc-700 text-white' :
                                 elStr.includes('energia') ? 'bg-purple-600 border-zinc-700 text-white' : 
                                  'bg-zinc-700 border-zinc-700 text-white';
            const desabilitadoMonstruoso = temMonstruoso99 && monstruosoElemento === 'Energia';

            return (
              <button
                disabled={desabilitadoMonstruoso}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!desabilitadoMonstruoso) toggleEquipado(item.id);
                }}
                className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                  desabilitadoMonstruoso
                    ? 'opacity-40 cursor-not-allowed bg-zinc-900 border-zinc-800 text-transparent'
                    : item.equipado 
                      ? `${checkedColor} cursor-pointer` 
                      : 'bg-zinc-900 border-zinc-700 text-transparent hover:border-zinc-500 cursor-pointer'
                }`}
                title={desabilitadoMonstruoso ? "Monstruoso de Energia (99%) não pode equipar vestimentas." : (item.equipado ? "Desequipar" : "Equipar item")}
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="2.5 6 5 8.5 9.5 3.5" />
                </svg>
              </button>
            );
          })()}
          <div onClick={() => toggleExpandir(item.id)} className="w-5 flex justify-center text-zinc-500 flex-shrink-0 cursor-pointer group-hover:text-zinc-300 transition-colors">
            <svg className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
          </div>
        </div>
      </div>
      
      <Collapse isOpen={isExpanded} className={isDragging ? 'hidden' : ''}>
        <div className="border-t border-zinc-800 px-3 py-3 text-xs bg-zinc-950/80 flex flex-col gap-2 relative z-10" onClick={e => e.stopPropagation()}>
          <div className="flex flex-col gap-1 mt-1">
            <span><span className="text-green-400 font-bold">Categoria:</span> {item.item.Categoria_Ama}</span>
            <span><span className="text-green-400 font-bold">Espaços:</span> {item.item.Espacos_Ama}</span>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <p className="text-zinc-400 text-xs leading-relaxed whitespace-pre-wrap">{formatarTexto(item.item.Desc_Ama)}</p>
          </div>
          



          {item.item.Nome_Ama === 'Selos Paranormais' && (
            <div className="mt-3 bg-zinc-950/60 border border-zinc-800 rounded p-3 flex flex-col gap-3 relative" onClick={e => e.stopPropagation()}>
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest absolute -top-2.5 left-3 bg-zinc-900 px-1 border border-zinc-800 rounded-sm">
                Ritual Armazenado
              </div>
              
              <CustomSelect
                value={item.item.ritualSeloKey || ''}
                onChange={(val) => {
                    if (!val) {
                      itensAmaldicoadosHook.editarItem(item.id, { ritualSeloKey: undefined, Categoria_Ama: 'Varia', Elemento_Ama: 'Varia' });
                      return;
                    }
                    const ritualA = rituaisHook.rituaisAprendidos.find(r => `${r.codigo_ritual}_${r.origem}` === val);
                    if (ritualA) {
                      const base = rituaisHook.rituais.find(b => b.Codigo_Ritual == ritualA.codigo_ritual);
                      if (base) {
                        const circulosMap: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' };
                        itensAmaldicoadosHook.editarItem(item.id, { 
                          ritualSeloKey: val,
                          Categoria_Ama: circulosMap[base.Circulo_Ritual] || 'Varia',
                          Elemento_Ama: base.Elemento_Ritual === 'Varia' || base.Elemento_Ritual === 'Lista' ? (ritualA.elemento_escolhido || 'Sangue') : base.Elemento_Ritual
                        });
                      }
                    }
                  }}
                  options={[
                  { value: '', label: 'Nenhum ritual selecionado' },
                  ...rituaisHook.rituaisAprendidos.map(r => {
                    const base = rituaisHook.rituais.find(b => b.Codigo_Ritual == r.codigo_ritual);
                    return {
                      value: `${r.codigo_ritual}_${r.origem}`,
                      label: r.customNome || (base ? base.Nome_Ritual : 'Ritual Desconhecido')
                    };
                  })
                ]}
                placeholder="Selecione um ritual..."
                className="w-full text-xs"
                wrapperClassName="w-full mt-1"
              />

              {item.item.ritualSeloKey && (() => {
                const ritualA = rituaisHook.rituaisAprendidos.find(r => `${r.codigo_ritual}_${r.origem}` === item.item.ritualSeloKey);
                if (!ritualA) return null;
                const base = rituaisHook.rituais.find(b => b.Codigo_Ritual == ritualA.codigo_ritual);
                if (!base) return null;
                
                const versao = versaoRitual[item.item.ritualSeloKey as any] || 'normal';
                const optionsVersao = [ { value: 'normal', label: 'Normal' } ];
                if (base.Tem_Discente) optionsVersao.push({ value: 'discente', label: 'Discente' });
                if (base.Tem_Verdadeiro) optionsVersao.push({ value: 'verdadeiro', label: 'Verdadeiro' });

                const pe = obterValorVersao(base.PE_Ritual, versao as any, base.Tem_Discente, base.Tem_Verdadeiro);
                const alcance = ritualA.customProps?.[versao]?.Alcance_Ritual ?? obterValorVersao(base.Alcance_Ritual, versao as any, base.Tem_Discente, base.Tem_Verdadeiro);
                const alvo = ritualA.customProps?.[versao]?.Alvo_Ritual ?? obterValorVersao(base.Alvo_Ritual, versao as any, base.Tem_Discente, base.Tem_Verdadeiro);
                const duracao = ritualA.customProps?.[versao]?.Duracao_Ritual ?? obterValorVersao(base.Duracao_Ritual, versao as any, base.Tem_Discente, base.Tem_Verdadeiro);
                const exec = ritualA.customProps?.[versao]?.Execucao_Ritual ?? obterValorVersao(base.Execucao_Ritual, versao as any, base.Tem_Discente, base.Tem_Verdadeiro);
                const resist = ritualA.customProps?.[versao]?.Resistencia_Ritual ?? obterValorVersao(base.Resistencia_Ritual, versao as any, base.Tem_Discente, base.Tem_Verdadeiro);
                const efeito = ritualA.customProps?.[versao]?.Efeito_Ritual ?? obterValorVersao(base.Efeito_Ritual, versao as any, base.Tem_Discente, base.Tem_Verdadeiro);

                return (
                  <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-zinc-800/50">
                    <div 
                      className="flex items-center gap-2 mb-1 cursor-pointer select-none group"
                      onClick={() => setRitualExpandido(!ritualExpandido)}
                    >
                      <h4 className="font-bold text-[15px] text-zinc-100 group-hover:text-green-400 transition-colors">{ritualA.customNome || base.Nome_Ritual}</h4>
                      {(() => {
                        const elementoStrOriginal = base.Elemento_Ritual === 'Varia' || base.Elemento_Ritual === 'Lista' ? (ritualA.elemento_escolhido || 'Sangue') : base.Elemento_Ritual;
                        const elStr = String(elementoStrOriginal).toLowerCase();
                        const corText = elStr.includes('medo') ? 'bg-zinc-200/80 text-zinc-950 px-1' :
                                        elStr.includes('sangue') ? 'text-red-500' :
                                        elStr.includes('morte') ? 'bg-black/50 text-white px-1' :
                                        elStr.includes('conhecimento') ? 'text-yellow-500' :
                                        elStr.includes('energia') ? 'text-purple-500' : 
                                        'text-zinc-400';
                        return (
                          <span className={`text-[10px] font-bold rounded-sm truncate uppercase tracking-wider w-fit ${corText}`}>
                            {elementoStrOriginal}
                          </span>
                        );
                      })()}
                      <span className="ml-auto text-zinc-500">
                        <svg className={`w-4 h-4 transition-transform duration-200 ${ritualExpandido ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center bg-zinc-900 rounded p-1.5 border border-zinc-800">
                       <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider ml-1">Custo: <span className="text-zinc-300">{pe}</span></span>
                       {optionsVersao.length > 1 && (
                         <CustomSelect
                           value={versao}
                           onChange={(v) => setVersaoRitual(prev => ({...prev, [item.item.ritualSeloKey as string]: v as any}))}
                           options={optionsVersao}
                           hideIcon
                           wrapperClassName="!min-w-[100px]"
                           className="text-[10px] py-1 min-h-0 bg-transparent border-none text-zinc-400 font-bold uppercase tracking-wider text-right cursor-pointer hover:text-green-400 focus:text-green-400"
                         />
                       )}
                    </div>

                    <Collapse isOpen={ritualExpandido}>
                      <div className="flex flex-col gap-2 mt-2">
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px]">
                      {exec && exec !== 'Nenhum' && <div><span className="text-zinc-500 font-bold">EXEC.:</span> <span className="text-zinc-300">{exec}</span></div>}
                      {alcance && alcance !== 'Nenhum' && <div><span className="text-zinc-500 font-bold">ALCANCE:</span> <span className="text-zinc-300">{alcance}</span></div>}
                      {alvo && alvo !== 'Nenhum' && <div><span className="text-zinc-500 font-bold">ALVO:</span> <span className="text-zinc-300">{alvo}</span></div>}
                      {duracao && duracao !== 'Nenhum' && <div><span className="text-zinc-500 font-bold">DURAÇÃO:</span> <span className="text-zinc-300">{duracao}</span></div>}
                      {efeito && efeito !== 'Nenhum' && <div className="col-span-2"><span className="text-zinc-500 font-bold">EFEITO:</span> <span className="text-zinc-300">{efeito}</span></div>}
                      {resist && resist !== 'Nenhum' && <div className="col-span-2"><span className="text-zinc-500 font-bold">RESIST.:</span> <span className="text-zinc-300">{resist}</span></div>}
                    </div>

                    <div className="text-xs text-zinc-400 bg-zinc-900 p-2.5 rounded border border-zinc-800 leading-relaxed mt-1">
                      {(() => {
                        let currentScope = 'normal';
                        const desc = ritualA.customDesc || base.Descricao_Ritual;
                        if (!desc) return null;
                        return desc.split('\n').map((linha, i) => {
                          const linhaLower = linha.trim().toLowerCase();
                          const isHeaderDiscente = linhaLower.startsWith('*discente') || linhaLower.startsWith('discente');
                          const isHeaderVerdadeiro = linhaLower.startsWith('*verdadeiro') || linhaLower.startsWith('verdadeiro');

                          if (isHeaderDiscente) currentScope = 'discente';
                          if (isHeaderVerdadeiro) currentScope = 'verdadeiro';

                          let dimmed = false;
                          if (currentScope === 'discente' && versao !== 'discente') dimmed = true;
                          if (currentScope === 'verdadeiro' && versao !== 'verdadeiro') dimmed = true;

                          return (
                            <span
                              key={i}
                              className={`block ${dimmed ? 'opacity-50' : ''} ${currentScope !== 'normal' && !dimmed ? 'text-zinc-300' : ''}`}
                              style={{ transition: 'opacity 0.2s ease' }}
                              dangerouslySetInnerHTML={{ __html: formatarDescricao(linha) }}
                            />
                          );
                        });
                      })()}
                    </div>
                      </div>
                    </Collapse>
                  </div>
                );
              })()}
            </div>
          )}
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

function formatarDescricao(texto: string): string {
  if (!texto) return '';
  let resultado = texto;
  if (!resultado.includes('<') && !resultado.includes('&')) {
    resultado = resultado
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    resultado = resultado.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    resultado = resultado.replace(/_(.*?)_/g, '<em>$1</em>');
  }
  return resultado;
}
