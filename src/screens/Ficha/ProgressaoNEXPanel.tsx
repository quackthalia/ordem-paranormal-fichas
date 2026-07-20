import React, { useState } from 'react';
import { useRPG } from '../../context/RPGContext';
import { useProgressaoNex, ProgressaoNexItem } from '../../hooks/useProgressaoNex';

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
    <div className="flex h-full flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
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
    poderesHook
  } = useRPG();
  
  const [expandido, setExpandido] = useState(false);
  const elementoDaLinha = item.Elemento_Progrecao?.trim();

  // Ocultar se for progressão de elemento diferente do escolhido (60, 75, 90)
  if (elementoDaLinha && afinidadeEscolhida && elementoDaLinha.toLowerCase() !== afinidadeEscolhida.toLowerCase()) {
    return null; 
  }

  const is50 = nexPatamar === 50;
  const recusou = progressaoNexRecusados.includes(nexPatamar);
  const podeTranscender = [25, 35, 50, 75, 90].includes(nexPatamar);
  const temPoderEscolhido = !!poderesHook.poderesEscolhidos[nexPatamar];
  const poder = poderesHook.poderesEscolhidos[nexPatamar];

  return (
    <div className="border border-zinc-700 bg-zinc-950 rounded mb-2 overflow-hidden">
      <div 
        className="flex justify-between items-center p-4 cursor-pointer hover:bg-zinc-900 transition"
        onClick={() => setExpandido(!expandido)}
      >
        <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
          NEX {item.Nex_Progrecao}
          {elementoDaLinha && <span className="text-xs uppercase bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">{elementoDaLinha}</span>}
          {temPoderEscolhido && <span className="text-xs uppercase bg-purple-900 text-purple-200 px-2 py-0.5 rounded ml-2 truncate max-w-[150px]">{poder.nome}</span>}
        </h3>
        <span className="text-zinc-500 font-bold">{expandido ? '▼' : '▶'}</span>
      </div>
      
      {expandido && (
        <div className="p-4 pt-0 border-t border-zinc-800 bg-zinc-950/50 mt-2">
          <div className="text-sm text-zinc-300 leading-relaxed space-y-2 mb-4 mt-3">
            {item.Desc_Progrecao.split('\n').map((linha: string, idx: number) => (
              <p key={idx} dangerouslySetInnerHTML={{ __html: formatarDescricaoProg(linha) }} />
            ))}
          </div>

          {/* ESCOLHA DE AFINIDADE EM 50% */}
          {is50 && (
            <div className="mb-4 bg-zinc-900 p-3 rounded border border-zinc-800">
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Escolher Afinidade</label>
              <select 
                className="bg-zinc-950 border border-zinc-700 text-zinc-100 rounded px-3 py-2 w-full sm:w-1/2 outline-none focus:border-red-700"
                value={afinidadeEscolhida || ''}
                onChange={(e) => setAfinidadeEscolhida(e.target.value)}
              >
                <option value="" disabled>Selecione um elemento...</option>
                {['Sangue', 'Morte', 'Conhecimento', 'Energia'].map(el => (
                  <option key={el} value={el}>{el}</option>
                ))}
              </select>
            </div>
          )}

          {/* ESCOLHIDO / EDITAR PODER */}
          {temPoderEscolhido && (
            <div className="mb-4 bg-zinc-900 p-3 rounded border border-zinc-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-purple-400 uppercase">Poder Transcendido</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setNexModalAberto(nexPatamar)}
                    className="text-xs text-zinc-400 hover:text-zinc-100 transition"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => poderesHook.removerPoder(nexPatamar)}
                    className="text-xs text-red-500 hover:text-red-400 transition"
                  >
                    Remover
                  </button>
                </div>
              </div>
              <h4 className="font-bold text-zinc-100">{poder.nome}</h4>
              <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{poder.descricao}</p>
            </div>
          )}

          {/* BOTÕES DE TRANSCENDER / RECUSAR */}
          {podeTranscender && !temPoderEscolhido && (
            <div className="flex gap-3 border-t border-zinc-800 pt-3 mt-2">
              {!recusou ? (
                <>
                  <button 
                    onClick={() => setNexModalAberto(nexPatamar)}
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
