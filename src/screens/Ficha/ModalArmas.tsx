import { useState } from 'react';
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
  const [expandidos, setExpandidos] = useState<Record<number, boolean>>({});

  if (!aberto) return null;

  const toggleExpandir = (id: number) => {
    setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const armasFiltradas = armasHook.armas.filter((arma: Arma) => {
    if (filtro !== 'Todas' && arma.Proficiencia !== filtro) return false;
    if (busca && !arma.Nome_Item.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700/800 w-full max-w-2xl rounded shadow-lg flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-zinc-100">Adicionar Arma</h2>
          <button onClick={onFechar} className="text-zinc-400 hover:text-zinc-100 text-lg">✕</button>
        </div>

        <div className="p-4 flex flex-col gap-3">
          <input
            type="text"
            placeholder="Buscar arma..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 outline-none focus:border-purple-500"
          />
          <div className="flex gap-2 flex-wrap">
          {[
            { label: 'Todas', valor: 'Todas' },
            { label: 'Simples', valor: 'Armas Simples' },
            { label: 'Táticas', valor: 'Armas Táticas' },
            { label: 'Pesadas', valor: 'Armas Pesadas' },
          ].map(f => (
              <button
                key={f.valor}
                onClick={() => setFiltro(f.valor)}
                className={`px-3 py-1 rounded text-sm font-bold transition ${filtro === f.valor ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {armasFiltradas.map((arma: Arma) => {
            const isExpanded = expandidos[arma.Codigo_Arma];
            return (
              <div key={arma.Codigo_Arma} className="bg-zinc-950 border border-zinc-800 rounded p-3 flex flex-col gap-2">
                <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleExpandir(arma.Codigo_Arma)}>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500 text-xs">{(isExpanded ? '▼' : '▶')}</span>
                    <span className="font-bold text-zinc-100">{arma.Nome_Item}</span>
                    
                    <span className="text-purple-400 text-sm font-bold border border-purple-900/50 bg-purple-900/20 px-2 py-0.5 rounded">Dano: {arma.Dano_Arma}</span>
                    <span className="text-zinc-300 text-sm font-bold border border-zinc-800 bg-zinc-900 px-2 py-0.5 rounded">Crítico: {formatarCritico(arma.Critico_Arma, arma.Multiplicador_Arma)}</span>
                    
                    {arma['Agil?'] && (
                      <span className="relative group cursor-help ml-1">
                        ⚡
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-zinc-800 text-xs text-zinc-300 rounded z-10 text-center shadow-lg pointer-events-none">
                          Permite que você aplique sua Agilidade em vez de sua Força em testes de ataque e rolagens de dano realizadas com ela.
                        </span>
                      </span>
                    )}
                    {arma['Automatica?'] && (
                      <span className="relative group cursor-help ml-1">
                        🔄
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-zinc-800 text-xs text-zinc-300 rounded z-10 text-center shadow-lg pointer-events-none">
                          Pode disparar tiros únicos, usando a regra normal, ou rajadas. Quando dispara uma rajada, você sofre -1d20 no teste de ataque, mas causa 1 dado de dano adicional do mesmo tipo.
                        </span>
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      armasHook.adicionarArma(arma);
                      onFechar();
                    }}
                    className="text-green-500 hover:text-green-400 font-bold text-sm px-2 py-1 border border-green-900/50 hover:bg-green-900/20 rounded transition"
                  >
                    + Adicionar
                  </button>
                </div>
                
                {isExpanded && (
                  <div className="pt-2 mt-2 border-t border-zinc-800 text-sm flex flex-col gap-1">
                    <div>
                      <span className="font-bold text-zinc-200">{arma.Proficiencia}</span> <span className="text-zinc-500">—</span> <span className="italic text-zinc-400">{arma.Tipo_Arma}</span> <span className="text-zinc-500">—</span> <span className="italic text-zinc-400">{arma.Empunhadura_Arma}</span>
                    </div>
                    <div className="flex gap-4">
                      <span><span className="text-emerald-400 font-bold">Categoria:</span> <span className="text-zinc-300">{arma.Categoria_Item}</span></span>
                      {arma.Alcance_Item && <span><span className="text-emerald-400 font-bold">Alcance:</span> <span className="text-zinc-300">{arma.Alcance_Item}</span></span>}
                      <span><span className="text-emerald-400 font-bold">Tipo:</span> <span className="text-zinc-300">{arma.Tipo_Dano_Arma}</span></span>
                      <span><span className="text-emerald-400 font-bold">Espaços:</span> <span className="text-zinc-300">{arma['Espaços_Item']}</span></span>
                    </div>
                    <div className="text-zinc-400 mt-1">{arma.Descricao_Item}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
