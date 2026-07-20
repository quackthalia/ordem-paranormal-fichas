import React from 'react';
import { useRPG } from '../../context/RPGContext';
import { useProgressaoNex } from '../../hooks/useProgressaoNex';

export const ProgressaoNEXPanel: React.FC = () => {
  const { nex, regras, progressaoNexRecusados, setProgressaoNexRecusados, afinidadeEscolhida, setAfinidadeEscolhida, setNexModalAberto } = useRPG();
  const { itensProgressao, loading } = useProgressaoNex();

  if (!regras['nex_experiencia']) {
    return <div className="text-zinc-500 italic p-4">A regra de Progressão de NEX não está ativa.</div>;
  }

  if (loading) {
    return <div className="text-zinc-500 p-4">Carregando progressão...</div>;
  }

  // Elementos disponíveis para escolha em NEX 50
  const elementos = ['Sangue', 'Morte', 'Conhecimento', 'Energia'];

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
      <h2 className="text-xl font-display uppercase text-red-500 mb-2 border-b border-red-900 pb-2">
        Progressão de NEX
      </h2>
      
      {itensProgressao.map(item => {
        const nexPatamar = parseInt(item.Nex_Progrecao.replace('%', ''), 10);
        const elementoDaLinha = item.Elemento_Progrecao?.trim();
        
        // Se o jogador não alcançou o NEX, não mostra
        if (nex < nexPatamar) return null;

        // Se é uma progressão de elemento (60, 75, 90), só mostra se for do elemento escolhido
        if (elementoDaLinha && afinidadeEscolhida && elementoDaLinha.toLowerCase() !== afinidadeEscolhida.toLowerCase()) {
          return null; // Oculta progressões de outros elementos
        }

        const is50 = nexPatamar === 50;
        const recusou = progressaoNexRecusados.includes(nexPatamar);
        const podeTranscender = [25, 35, 50, 75, 90].includes(nexPatamar); // 60 ganha automático

        return (
          <div key={`${item.Codigo_Progrecao}`} className="border border-zinc-700 bg-zinc-950 rounded p-4 mb-2">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                NEX {item.Nex_Progrecao}
                {elementoDaLinha && <span className="text-xs uppercase bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">{elementoDaLinha}</span>}
              </h3>
            </div>
            
            <div className="text-sm text-zinc-300 leading-relaxed space-y-2 mb-4">
              {item.Desc_Progrecao.split('\n').map((linha, idx) => (
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
                  {elementos.map(el => (
                    <option key={el} value={el}>{el}</option>
                  ))}
                </select>
              </div>
            )}

            {/* BOTÕES DE TRANSCENDER / RECUSAR */}
            {podeTranscender && (
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
                  <span className="text-xs italic text-zinc-500">Você recusou transcender neste nível.</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

function formatarDescricaoProg(texto: string) {
  let t = texto.replace(/_(.*?)_/g, '<em class="text-zinc-500 italic">$1</em>');
  t = t.replace(/\*(.*?)\*/g, '<strong class="text-zinc-100">$1</strong>');
  return t;
}
