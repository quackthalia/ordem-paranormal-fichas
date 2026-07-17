import React, { useState, useMemo } from 'react';
import type { Ritual } from '../types';
import { sortPorElementoENome } from '../utils/rpgRules';

// Cores e utilitários replicados do sistema principal
const CORES_ELEMENTOS: Record<string, string> = {
  sangue: '#b31717',
  conhecimento: '#b07902',
  energia: '#af27d9',
  morte: '#000000',
  medo: '#ffffff',
  varia: '#888888',
  lista: '#888888',
};

function obterCorBadge(elemento: string): string {
  return CORES_ELEMENTOS[elemento?.toLowerCase()] || '#666';
}

function obterCorTexto(elemento: string): string {
  const e = elemento?.toLowerCase();
  if (e === 'medo') return '#000000';
  return '#ffffff';
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
  resultado = resultado.replace(/\n/g, '<br />');
  return resultado;
}

interface ModalRituaisExtraProps {
  rituais: Ritual[];
  rituaisAprendidosIds: number[];
  onClose: () => void;
  onSelect: (ritual: Ritual, elementoVaria?: string) => void;
}

export const ModalRituaisExtra: React.FC<ModalRituaisExtraProps> = ({
  rituais,
  rituaisAprendidosIds,
  onClose,
  onSelect
}) => {
  const [abaElemento, setAbaElemento] = useState<string | null>(null);
  const [abaCirculo, setAbaCirculo] = useState<number | null>(null);
  const [expandidos, setExpandidos] = useState<number[]>([]);
  const [elementosVaria, setElementosVaria] = useState<Record<number, string>>({});
  const [busca, setBusca] = useState('');

  const listaFiltrada = useMemo(() => {
    // Para Rituais Extras, não limitamos aos rituais já aprendidos, pois a pessoa pode querer adicionar um ritual extra
    // repetido? De qualquer forma, o sistema original previne. Vou manter:
    // let filtrada = rituais.filter(r => !rituaisAprendidosIds.includes(r.Codigo_Ritual));
    // MAS espera, como a chave de RitualAprendido usa a "origem", você PODE ter o mesmo ritual duas vezes.
    // Deixarei todos disponíveis.
    let filtrada = rituais;

    if (abaElemento) {
      filtrada = filtrada.filter(r => {
        const e = r.Elemento_Ritual.toLowerCase();
        return e === abaElemento.toLowerCase() || e === 'lista' || e === 'varia';
      });
    }

    if (abaCirculo) {
      filtrada = filtrada.filter(r => r.Circulo_Ritual === abaCirculo);
    }

    if (busca.trim()) {
      const lower = busca.toLowerCase();
      filtrada = filtrada.filter(r => r.Nome_Ritual.toLowerCase().includes(lower));
    }

    return filtrada.sort((a, b) => {
      if (a.Circulo_Ritual !== b.Circulo_Ritual) return a.Circulo_Ritual - b.Circulo_Ritual;
      return sortPorElementoENome(a, b, r => r.Elemento_Ritual, r => r.Nome_Ritual);
    });
  }, [rituais, abaElemento, abaCirculo, busca]);

  const elementos = ['Sangue', 'Morte', 'Conhecimento', 'Energia', 'Medo'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex flex-col border-b border-zinc-800 p-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg uppercase tracking-wide text-zinc-100">
                ESCOLHER RITUAL EXTRA
              </h3>
              <p className="mt-1 text-xs text-zinc-400">Adicione qualquer ritual independente de círculo ou limite.</p>
            </div>
            <button onClick={onClose} className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100">&times;</button>
          </div>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar ritual pelo nome..."
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-red-700"
          />
        </div>

        {/* FILTROS DE ELEMENTO E CÍRCULO */}
        <div className="flex flex-col border-b border-zinc-800 bg-zinc-950">
          <div className="flex flex-wrap gap-1 border-b border-zinc-800/50 bg-zinc-950/80 px-3 py-2">
            <button
              onClick={() => setAbaElemento(null)}
              className={`rounded px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-wider transition ${
                abaElemento === null
                  ? 'bg-red-900/40 text-red-300 border border-red-800'
                  : 'bg-zinc-800/60 text-zinc-500 border border-zinc-700 hover:text-zinc-300'
              }`}
            >
              Todos Elementos
            </button>
            {elementos.map(elem => {
              const ativo = abaElemento === elem;
              return (
                <button
                  key={elem}
                  onClick={() => setAbaElemento(elem)}
                  className={`rounded px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-wider transition border ${
                    ativo
                      ? 'border-zinc-600 text-zinc-100'
                      : 'border-zinc-700 text-zinc-500 hover:text-zinc-300'
                  }`}
                  style={{
                    backgroundColor: ativo ? obterCorBadge(elem) : 'transparent',
                    color: ativo ? obterCorTexto(elem) : undefined,
                  }}
                >
                  {elem}
                </button>
              );
            })}
          </div>
          
          <div className="flex gap-2 bg-zinc-900 px-4 py-2">
            <button
              onClick={() => setAbaCirculo(null)}
              className={`rounded px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider transition border ${
                abaCirculo === null
                  ? 'border-zinc-500 bg-zinc-800 text-zinc-100'
                  : 'border-zinc-700 bg-zinc-950/50 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Todos
            </button>
            {[1, 2, 3, 4].map(c => {
              const ativo = abaCirculo === c;
              return (
                <button
                  key={c}
                  onClick={() => setAbaCirculo(c)}
                  className={`rounded px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider transition border ${
                    ativo
                      ? 'border-zinc-500 bg-zinc-800 text-zinc-100'
                      : 'border-zinc-700 bg-zinc-950/50 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {c}º Círculo
                </button>
              );
            })}
          </div>
        </div>

        {/* LISTA DE RITUAIS */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex flex-col gap-3">
            {listaFiltrada.map(ritual => {
              const codigo = ritual.Codigo_Ritual;
              const expandido = expandidos.includes(codigo);
              const isVaria = ritual.Elemento_Ritual.toLowerCase() === 'lista' || ritual.Elemento_Ritual.toLowerCase() === 'varia';
              const elementoSendoEscolhido = isVaria ? (elementosVaria[codigo] || 'Sangue') : ritual.Elemento_Ritual;
              const corElemento = obterCorBadge(elementoSendoEscolhido);
              const corTextoElemento = obterCorTexto(elementoSendoEscolhido);

              return (
                <div key={codigo} className="overflow-hidden rounded-r border-l-4 bg-zinc-950/60 transition hover:bg-zinc-900/60" style={{ borderLeftColor: corElemento }}>
                  <div
                    onClick={() => setExpandidos(prev => prev.includes(codigo) ? prev.filter(id => id !== codigo) : [...prev, codigo])}
                    className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 uppercase tracking-wider leading-tight"
                          style={{ background: corElemento, color: corTextoElemento }}
                        >
                          <span className="text-[9px] font-bold">{elementoSendoEscolhido}</span>
                          <span className="text-[11px] font-black">{ritual.Circulo_Ritual}</span>
                        </span>
                        <span className="text-sm font-bold text-zinc-100">{ritual.Nome_Ritual}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {isVaria && (
                        <div onClick={e => e.stopPropagation()} className="flex flex-col items-end gap-1">
                          <span className="text-[0.55rem] uppercase tracking-wider text-zinc-500 font-bold">Definir Elemento:</span>
                          <select
                            value={elementosVaria[codigo] || 'Sangue'}
                            onChange={e => setElementosVaria(prev => ({ ...prev, [codigo]: e.target.value }))}
                            className="cursor-pointer rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs font-bold text-zinc-200 outline-none focus:border-red-700"
                          >
                            <option value="Sangue">Sangue</option>
                            <option value="Conhecimento">Conhecimento</option>
                            <option value="Energia">Energia</option>
                            <option value="Morte">Morte</option>
                          </select>
                        </div>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(ritual, isVaria ? (elementosVaria[codigo] || 'Sangue') : undefined);
                        }}
                        className="rounded bg-red-700 px-4 py-1.5 text-xs font-bold uppercase text-zinc-100 transition hover:bg-red-600"
                      >
                        Aprender
                      </button>
                      <span className="w-5 text-center text-zinc-600">{expandido ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {expandido && (
                    <div className="border-t border-zinc-800/50 bg-zinc-900/40 px-5 py-4 text-left">
                      <div className="mb-4 grid grid-cols-2 gap-3 text-xs md:grid-cols-3 lg:grid-cols-4">
                        {ritual.Execucao_Ritual && <div><strong className="text-zinc-500">Execução:</strong> <span className="text-zinc-300">{ritual.Execucao_Ritual}</span></div>}
                        {ritual.Alcance_Ritual && <div><strong className="text-zinc-500">Alcance:</strong> <span className="text-zinc-300">{ritual.Alcance_Ritual}</span></div>}
                        {ritual.Alvo_Ritual && <div><strong className="text-zinc-500">Alvo:</strong> <span className="text-zinc-300">{ritual.Alvo_Ritual}</span></div>}
                        {ritual.Area_Ritual && <div><strong className="text-zinc-500">Área:</strong> <span className="text-zinc-300">{ritual.Area_Ritual}</span></div>}
                        {ritual.Duracao_Ritual && <div><strong className="text-zinc-500">Duração:</strong> <span className="text-zinc-300">{ritual.Duracao_Ritual}</span></div>}
                        {ritual.Resistencia_Ritual && <div><strong className="text-zinc-500">Resistência:</strong> <span className="text-zinc-300">{ritual.Resistencia_Ritual}</span></div>}
                      </div>

                      <div className="text-sm leading-relaxed text-zinc-400" dangerouslySetInnerHTML={{ __html: formatarDescricao(ritual.Descricao_Ritual) }} />
                    </div>
                  )}
                </div>
              );
            })}

            {listaFiltrada.length === 0 && (
              <div className="py-10 text-center text-zinc-500">
                Nenhum ritual encontrado.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
