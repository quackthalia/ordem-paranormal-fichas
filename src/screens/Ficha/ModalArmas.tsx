import { useState, useMemo } from 'react';
import { useRPG } from '../../context/RPGContext';
import type { Arma } from '../../types';

export function formatarCritico(critico: number, multiplicador: number): string {
  if (critico === 20 && multiplicador === 2) return 'x2';
  if (critico !== 20 && multiplicador === 2) return `${critico}`;
  if (critico === 20 && multiplicador !== 2) return `x${multiplicador}`;
  return `${critico}/x${multiplicador}`;
}

interface ModalArmasProps {
  aberto: boolean;
  onFechar: () => void;
}

export function ModalArmas({ aberto, onFechar }: ModalArmasProps) {
  const { armasHook } = useRPG();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<string>('Todas');
  const [expandidos, setExpandidos] = useState<number[]>([]);

  if (!aberto) return null;

  const toggleExpandir = (id: number) => {
    setExpandidos(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filtros = [
    { label: 'Todas', valor: 'Todas' },
    { label: 'Simples', valor: 'Armas Simples' },
    { label: 'Táticas', valor: 'Armas Táticas' },
    { label: 'Pesadas', valor: 'Armas Pesadas' },
  ];

  const armasFiltradas = armasHook.armas.filter((arma: Arma) => {
    if (filtro !== 'Todas' && arma.Proficiencia !== filtro) return false;
    if (busca && !arma.Nome_Item.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onFechar}>
      <div className="flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex flex-col border-b border-zinc-800 p-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg uppercase tracking-wide text-zinc-100">
                ADICIONAR ARMA
              </h3>
              <p className="mt-1 text-xs text-zinc-400">Selecione uma arma para adicionar ao inventário.</p>
            </div>
            <button onClick={onFechar} className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100">&times;</button>
          </div>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar arma pelo nome..."
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-red-700"
          />
        </div>

        {/* Filtros de proficiência */}
        <div className="flex flex-wrap gap-1 border-b border-zinc-800 bg-zinc-950/80 px-3 py-2">
          {filtros.map(f => {
            const ativo = filtro === f.valor;
            return (
              <button
                key={f.valor}
                onClick={() => setFiltro(f.valor)}
                className={`rounded px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-wider transition border ${
                  ativo
                    ? 'bg-red-900/40 text-red-300 border-red-800'
                    : 'bg-zinc-800/60 text-zinc-500 border-zinc-700 hover:text-zinc-300'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Lista de armas */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-2">
          {armasFiltradas.map((arma: Arma) => {
            const isExpanded = expandidos.includes(arma.Codigo_Arma);
            const critico = formatarCritico(arma.Critico_Arma, arma.Multiplicador_Arma);
            return (
              <div key={arma.Codigo_Arma} className="rounded border border-zinc-800 border-l-4 border-l-red-700 bg-zinc-950/60 transition hover:bg-zinc-900/60">
                {/* Bloco fechado */}
                <div
                  className="flex cursor-pointer items-center justify-between gap-3 p-3"
                  onClick={() => toggleExpandir(arma.Codigo_Arma)}
                >
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <span className="font-bold text-sm text-zinc-100 truncate">{arma.Nome_Item}</span>
                    
                    <div className="flex items-center gap-4 text-xs text-zinc-300">
                      <span>
                        <span className="font-bold text-red-400">Dado:</span> {arma.Dano_Arma}
                      </span>
                      {critico && (
                        <span>
                          <span className="font-bold text-zinc-400">Crítico:</span> {critico}
                        </span>
                      )}
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        armasHook.adicionarArma(arma);
                        onFechar();
                      }}
                      className="rounded bg-red-700 px-3 py-1.5 text-xs font-bold uppercase text-zinc-100 transition hover:bg-red-600"
                    >
                      Adicionar
                    </button>
                    <span className="w-5 text-center text-zinc-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
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
                      <p className="text-zinc-400 text-xs leading-relaxed">{arma.Descricao_Item}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          </div>
          {armasFiltradas.length === 0 && (
            <p className="text-center text-zinc-600 text-sm py-8">Nenhuma arma encontrada.</p>
          )}
        </div>
      </div>
    </div>
  );
}
