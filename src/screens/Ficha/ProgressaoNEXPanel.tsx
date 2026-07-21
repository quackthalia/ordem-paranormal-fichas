import React, { useState, useRef } from 'react';
import { useRPG } from '../../context/RPGContext';
import { ToolbarFormato } from '../../components/ToolbarFormato';
import { obterCorBadge } from '../../utils/rpgRules';
import { useProgressaoNex, type ProgressaoNexItem } from '../../hooks/useProgressaoNex';

function obterCorTexto(elemento: string): string {
  if (!elemento) return '#ffffff';
  const e = elemento.toLowerCase();
  if (e === 'medo') return '#000000';
  if (e === 'conhecimento') return '#000000';
  return '#ffffff';
}

export const ProgressaoNEXPanel: React.FC = () => {
  const { nex, regras } = useRPG();
  const { itensProgressao, loading } = useProgressaoNex();

  if (!regras['nex_experiencia']) {
    return <div className="text-zinc-500 italic p-4">A regra de Progressão de NEX não está ativa.</div>;
  }

  if (loading) {
    return <div className="text-zinc-500 p-4">Carregando progressão...</div>;
  }

  return (
    <div className="flex h-full flex-col gap-2.5 overflow-y-auto pr-2 custom-scrollbar">
      <h2 className="text-xl font-display uppercase text-red-500 mb-2 border-b border-red-900 pb-2">
        Progressão de NEX
      </h2>
      
      {itensProgressao.map(item => {
        const nexPatamar = parseInt(item.Nex_Progrecao.replace('%', ''), 10);
        if (nex < nexPatamar) return null;
        return <ProgressaoBlock key={item.Codigo_Progrecao} item={item} nexPatamar={nexPatamar} />;
      })}
    </div>
  );
};

const ProgressaoBlock = ({ item, nexPatamar }: { item: ProgressaoNexItem, nexPatamar: number }) => {
  const { 
    progressaoNexRecusados, 
    setProgressaoNexRecusados, 
    afinidadeEscolhida, 
    setAfinidadeEscolhida, 
    setNexModalAberto,
    poderesHook,
    progressaoNexEditados,
    setProgressaoNexEditados
  } = useRPG();
  
  const [expandido, setExpandido] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  const elementoDaLinha = item.Elemento_Progrecao?.trim();

  // Ocultar se for progressão de elemento diferente do escolhido (60, 75, 90)
  if (elementoDaLinha && afinidadeEscolhida && elementoDaLinha.toLowerCase() !== afinidadeEscolhida.toLowerCase()) {
    return null; 
  }

  const chaveTranscender = nexPatamar + 1000;
  const is50 = nexPatamar === 50;
  const recusou = progressaoNexRecusados.includes(nexPatamar);
  const podeTranscender = [25, 35, 50, 75, 90].includes(nexPatamar);
  const temPoderEscolhido = !!poderesHook.poderesEscolhidos[chaveTranscender];
  const poder = poderesHook.poderesEscolhidos[chaveTranscender];

  const handleEditClick = () => {
    setEditText(progressaoNexEditados[item.Codigo_Progrecao] || item.Desc_Progrecao);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const finalHtml = editorRef.current?.innerHTML || editText;
    setProgressaoNexEditados(prev => ({ ...prev, [item.Codigo_Progrecao]: finalHtml }));
    setIsEditing(false);
  };

  const handleResetEdit = () => {
    setProgressaoNexEditados(prev => {
      const { [item.Codigo_Progrecao]: _, ...rest } = prev;
      return rest;
    });
    setIsEditing(false);
  };

  // Texto que será exibido (editado ou original)
  const textoParaExibir = progressaoNexEditados[item.Codigo_Progrecao] || item.Desc_Progrecao;

  return (
    <div className="overflow-hidden rounded-r border-l-4 border-red-800 bg-zinc-900/50">
      <div 
        className="flex cursor-pointer items-center justify-between gap-3 bg-zinc-800/40 px-4 py-3 transition hover:bg-zinc-700/50"
        onClick={() => setExpandido(!expandido)}
      >
        <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
          NEX {item.Nex_Progrecao}
          {elementoDaLinha && (
            <span 
              className="text-[10px] uppercase px-2 py-0.5 rounded"
              style={{ backgroundColor: obterCorBadge(elementoDaLinha), color: obterCorTexto(elementoDaLinha) }}
            >
              {elementoDaLinha}
            </span>
          )}
        </h3>
        <span className="text-xs text-zinc-600">{expandido ? '▲' : '▼'}</span>
      </div>
      
      {expandido && (
        <div className="p-4 text-sm text-zinc-400">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Descrição</span>
            {!isEditing && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleEditClick(); }}
                className="rounded bg-zinc-800 border border-zinc-700 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-zinc-300 transition hover:bg-zinc-700 hover:text-zinc-100"
              >
                Editar
              </button>
            )}
          </div>

          {/* MODAL DE EDIÇÃO DE TEXTO */}
          {isEditing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-5" onClick={(e) => e.stopPropagation()}>
              <div className="flex w-full max-w-2xl flex-col gap-4 rounded-lg border border-zinc-700 bg-zinc-900 p-6 shadow-2xl shadow-black/50" onClick={e => e.stopPropagation()}>
                <h3 className="font-display border-b border-zinc-800 pb-2.5 text-left text-lg uppercase tracking-wide text-zinc-100">
                  Editar Texto <span className="text-red-500">(NEX {item.Nex_Progrecao})</span>
                </h3>

                <div className="flex flex-col gap-1.5 text-left">
                  <div>
                    <ToolbarFormato editorRef={editorRef as any} />
                    <div
                      ref={(el) => {
                        editorRef.current = el;
                        if (el && !el.dataset.initialized) {
                          el.innerHTML = editText;
                          el.dataset.initialized = 'true';
                        }
                      }}
                      contentEditable
                      onBlur={(e) => setEditText(e.currentTarget.innerHTML)}
                      className="min-h-48 overflow-y-auto rounded-b border border-zinc-700 bg-zinc-950 p-3 text-left text-sm leading-relaxed text-zinc-100 outline-none focus:border-red-700"
                    />
                  </div>
                </div>

                <div className="mt-2 flex justify-end gap-2.5">
                  {progressaoNexEditados[item.Codigo_Progrecao] && (
                    <button 
                      onClick={handleResetEdit}
                      className="rounded border border-red-900/50 bg-red-950/30 px-4 py-2 text-sm font-bold text-red-500 transition hover:bg-red-900/50 hover:text-red-300 mr-auto"
                    >
                      Restaurar Original
                    </button>
                  )}
                  <button
                    onClick={() => setIsEditing(false)}
                    className="rounded border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:bg-zinc-700"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="rounded bg-red-700 px-4 py-2 text-sm font-bold text-zinc-100 transition hover:bg-red-600"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="text-zinc-300 leading-relaxed space-y-2 mb-4">
            {textoParaExibir.split('\n').map((linha: string, idx: number) => (
              <p key={idx} dangerouslySetInnerHTML={{ __html: formatarDescricaoProg(linha) }} />
            ))}
          </div>





          {/* ESCOLHIDO / EDITAR PODER */}
          {temPoderEscolhido && (
            <div className="mb-4 bg-zinc-900 p-3 rounded border border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-400 italic">Você transcendeu. O poder escolhido está listado na aba <strong>Habilidades</strong>.</span>
            </div>
          )}

          {/* BOTÕES DE TRANSCENDER / RECUSAR */}
          {podeTranscender && !temPoderEscolhido && (
            <div className="flex gap-3 border-t border-zinc-800 pt-3 mt-2">
              {!recusou ? (
                <>
                  <button 
                    onClick={() => setNexModalAberto(chaveTranscender)}
                    className="bg-purple-900 hover:bg-purple-800 text-purple-100 text-xs font-bold uppercase px-4 py-2 rounded transition"
                  >
                    Transcender
                  </button>
                  <button 
                    onClick={() => setProgressaoNexRecusados(prev => [...prev, nexPatamar])}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-bold uppercase px-4 py-2 rounded transition"
                  >
                    Recusar
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3 w-full">
                  <span className="text-xs italic text-zinc-500 flex-1">Você recusou transcender neste nível.</span>
                  <button 
                    onClick={() => setProgressaoNexRecusados(prev => prev.filter(n => n !== nexPatamar))}
                    className="text-xs text-zinc-400 hover:text-zinc-100 transition border border-zinc-700 px-3 py-1 rounded"
                  >
                    Desfazer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function formatarDescricaoProg(texto: string) {
  let t = texto.replace(/_(.*?)_/g, '<em class="text-zinc-500 italic">$1</em>');
  t = t.replace(/\*(.*?)\*/g, '<strong class="text-zinc-100">$1</strong>');
  return t;
}
