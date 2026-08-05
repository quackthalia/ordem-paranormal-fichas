import { useState } from 'react';
import { useRPG } from '../../context/RPGContext';
import type { Municao } from '../../types';

interface ModalMunicoesProps {
  onFechar: () => void;
  // Se for passado armaFiltro, exibe apenas as compatíveis
  armaFiltroNome?: string;
  armaFiltroCategoria?: string;
  onSelect?: (municao: Municao) => void;
}

export function ModalMunicoes({ onFechar, armaFiltroNome, armaFiltroCategoria, onSelect }: ModalMunicoesProps) {
  const { municoesHook } = useRPG();
  const [busca, setBusca] = useState('');

  // Filtra de acordo com o contexto (todas, ou apenas compatíveis com uma arma específica)
  const municoesDisponiveis = (armaFiltroNome && armaFiltroCategoria)
    ? municoesHook.getMunicoesCompativeis(armaFiltroNome, armaFiltroCategoria)
    : (municoesHook.municoes || []);

  const municoesFiltradas = municoesDisponiveis.filter(m => {
    if (busca && !m.Nome_Item.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onFechar}>
      <div 
        className="flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col border-b border-zinc-800 p-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg uppercase tracking-wide text-zinc-100">
                {armaFiltroNome ? `MUNIÇÕES PARA ${armaFiltroNome.toUpperCase()}` : 'ADICIONAR MUNIÇÃO'}
              </h3>
              <p className="mt-1 text-xs text-zinc-400">Selecione uma munição para adicionar ao inventário.</p>
            </div>
            <button onClick={onFechar} className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100">&times;</button>
          </div>
          
          <input
            type="text"
            placeholder="Buscar munição..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none transition focus:border-red-800"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 custom-scrollbar">
          {municoesFiltradas.length === 0 ? (
            <div className="text-center text-zinc-500 italic p-4">Nenhuma munição encontrada.</div>
          ) : (
            municoesFiltradas.map((municao) => (
              <div key={municao.Codigo_Municao} className="rounded border border-zinc-800 bg-zinc-950/80 p-3 hover:border-zinc-700 transition">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <span className="font-bold text-zinc-100 text-sm truncate">{municao.Nome_Item}</span>
                    <span className="text-xs text-zinc-500">{municao.Tipo_Arma}</span>
                    <span className="text-xs text-zinc-400 mt-1 leading-relaxed">{municao.Descricao_Item}</span>
                    <div className="flex gap-4 text-xs mt-2 text-zinc-500 font-bold uppercase tracking-wider">
                      <span>Categoria: <span className="text-red-400">{municao.Categoria_Item}</span></span>
                      <span>Espaços: <span className="text-red-400">{municao['Espaços_Item']}</span></span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (onSelect) {
                        onSelect(municao);
                      } else {
                        municoesHook.adicionarMunicao(municao);
                        onFechar();
                      }
                    }}
                    className="rounded bg-red-700 px-3 py-1.5 text-xs font-bold uppercase text-zinc-100 transition hover:bg-red-600 flex-shrink-0"
                  >
                    Selecionar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
