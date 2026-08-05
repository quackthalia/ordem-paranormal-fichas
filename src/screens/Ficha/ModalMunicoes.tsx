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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onFechar}>
      <div 
        className="w-full max-w-lg rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl overflow-hidden flex flex-col max-h-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-zinc-800 p-4 border-b border-zinc-700 flex justify-between items-center">
          <h2 className="font-bold text-zinc-100 text-lg uppercase tracking-wider">
            {armaFiltroNome ? `Munições para ${armaFiltroNome}` : 'Adicionar Munição'}
          </h2>
          <button onClick={onFechar} className="text-zinc-400 hover:text-white transition">✖</button>
        </div>

        <div className="p-4 border-b border-zinc-800 bg-zinc-950/50">
          <input
            type="text"
            placeholder="Buscar munição..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-red-700 transition"
          />
        </div>

        <div className="overflow-y-auto p-4 flex flex-col gap-3 max-h-[60vh] custom-scrollbar">
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
