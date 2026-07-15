import React, { useState, useMemo } from 'react';
import type { Ritual, ClasseRPG } from '../types';
import { sortPorElementoENome } from '../utils/rpgRules';

interface ModalRituaisProps {
  rituais: Ritual[];
  onClose: () => void;
  onSelect: (ritual: Ritual, elemento?: string) => void;
  limiteCirculo: number;
  rituaisAprendidosIds?: number[];
}

const ELEMENTOS = ['Sangue', 'Conhecimento', 'Energia', 'Morte', 'Medo', 'Varia'];
const BANNED_RITUAIS = [10, 17, 49, 53, 64, 116];

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
  if (!elemento) return '#666';
  const elementoStr = elemento.toLowerCase();
  if (elementoStr.includes(' e ')) {
    const partes = elementoStr.split(' e ');
    const cor1 = CORES_ELEMENTOS[partes[0].trim()] || '#666';
    const cor2 = CORES_ELEMENTOS[partes[1].trim()] || '#666';
    return `linear-gradient(135deg, ${cor1} 50%, ${cor2} 50%)`;
  }
  return CORES_ELEMENTOS[elementoStr] || '#666';
}

function obterCorTexto(elemento: string): string {
  if (!elemento) return '#ffffff';
  const e = elemento.toLowerCase();
  if (e.includes(' e ')) return '#ffffff';
  if (e === 'medo' || e === 'conhecimento') return '#000000';
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

export const ModalRituais: React.FC<ModalRituaisProps> = ({
  rituais,
  onClose,
  onSelect,
  limiteCirculo,
  rituaisAprendidosIds = [],
}) => {
  const [abaElemento, setAbaElemento] = useState<string | null>(null);
  const [abaCirculo, setAbaCirculo] = useState<number | null>(null);
  
  // Estado para elementos Varia temporários de cada ritual (se expandido/selecionando)
  const [elementosVaria, setElementosVaria] = useState<Record<number, string>>({});
  const [expandidos, setExpandidos] = useState<number[]>([]);
  const [busca, setBusca] = useState('');

  // Filtragem
  const listaFiltrada = useMemo(() => {
    return rituais.filter(r => {
      // Regra 1: Banidos ou já aprendidos
      if (BANNED_RITUAIS.includes(r.Codigo_Ritual)) return false;
      if (rituaisAprendidosIds.includes(r.Codigo_Ritual)) return false;
      
      // Regra 2: Limite de Círculo (ou inferior)
      if (r.Circulo_Ritual > limiteCirculo) return false;
      
      // Regra 3: Elemento Selecionado
      if (abaElemento) {
        const isVaria = r.Elemento_Ritual.toLowerCase() === 'lista' || r.Elemento_Ritual.toLowerCase() === 'varia';
        if (abaElemento === 'Varia') {
          if (!isVaria) return false;
        } else {
          // Se for filtro ex: Sangue. Um ritual de Lista NÃO aparece em Sangue, ele só aparece em Varia.
          if (isVaria || !r.Elemento_Ritual.toLowerCase().includes(abaElemento.toLowerCase())) return false;
        }
      }
      
      // Regra 4: Círculo Selecionado
      if (abaCirculo !== null) {
        if (r.Circulo_Ritual !== abaCirculo) return false;
      }
      
      // Regra 5: Busca por nome
      if (busca.trim()) {
        const lower = busca.toLowerCase();
        if (!r.Nome_Ritual.toLowerCase().includes(lower)) return false;
      }

      return true;
    }).sort((a, b) => sortPorElementoENome(a, b, r => r?.Elemento_Ritual, r => r?.Nome_Ritual));
  }, [rituais, abaElemento, abaCirculo, limiteCirculo, rituaisAprendidosIds, busca]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-5">
      <div className="flex h-[80vh] w-full max-w-4xl flex-col rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col border-b border-zinc-800 p-5 pb-4 bg-zinc-950 rounded-t-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <h3 className="font-display m-0 text-lg uppercase tracking-wide text-zinc-100">
                Aprender Ritual
              </h3>
              <span className="text-xs text-zinc-500 mt-1">Selecione um ritual de até {limiteCirculo}º Círculo</span>
            </div>
            <button
              onClick={onClose}
              className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100"
            >
              &times;
            </button>
          </div>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar ritual..."
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-red-700"
          />
        </div>

        {/* FILTROS (Abas Principais - Elementos) */}
        <div className="flex flex-wrap border-b border-zinc-800 bg-zinc-950">
          <button
            onClick={() => setAbaElemento(null)}
            className={`min-w-[70px] flex-1 px-1 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
              abaElemento === null
                ? 'border-b-2 border-red-900 bg-zinc-900 text-zinc-100'
                : 'border-b-2 border-transparent text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'
            }`}
          >
            Todos
          </button>
          {ELEMENTOS.map(elem => {
            const ativo = abaElemento === elem;
            return (
              <button
                key={elem}
                onClick={() => setAbaElemento(elem)}
                className={`min-w-[70px] flex-1 px-1 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                  ativo
                    ? 'border-b-2 bg-zinc-900 text-zinc-100'
                    : 'border-b-2 border-transparent text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'
                }`}
                style={{
                  borderBottomColor: ativo ? (CORES_ELEMENTOS[elem.toLowerCase()] || '#888') : 'transparent',
                }}
              >
                {elem}
              </button>
            );
          })}
        </div>

        {/* FILTROS (Abas Secundárias - Círculos) */}
        <div className="flex gap-2 border-b border-zinc-800 bg-zinc-900 px-4 py-2">
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
            if (c > limiteCirculo) return null; // Não mostra filtros de círculos acima do permitido
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
                      {ritual.Dados_Ritual && (
                        <span className="text-sm font-bold text-amber-400">{ritual.Dados_Ritual.split('/')[0].trim()}</span>
                      )}
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
                    <div className="border-t border-zinc-800/50 px-4 py-4">
                      <div className="mb-4 flex flex-col gap-1">
                        <div className="text-xs"><span className="font-bold text-zinc-300">Execução: </span><span className="text-zinc-400">{ritual.Execucao_Ritual}</span></div>
                        <div className="text-xs"><span className="font-bold text-zinc-300">Alcance: </span><span className="text-zinc-400">{ritual.Alcance_Ritual}</span></div>
                        <div className="text-xs"><span className="font-bold text-zinc-300">Área: </span><span className="text-zinc-400">{ritual.Area_Ritual}</span></div>
                        <div className="text-xs"><span className="font-bold text-zinc-300">Alvo: </span><span className="text-zinc-400">{ritual.Alvo_Ritual}</span></div>
                        <div className="text-xs"><span className="font-bold text-zinc-300">Duração: </span><span className="text-zinc-400">{ritual.Duracao_Ritual}</span></div>
                        {ritual.Efeito_Ritual && <div className="text-xs"><span className="font-bold text-zinc-300">Efeito: </span><span className="text-zinc-400">{ritual.Efeito_Ritual}</span></div>}
                        <div className="text-xs"><span className="font-bold text-zinc-300">Resistência: </span><span className="text-zinc-400">{ritual.Resistencia_Ritual}</span></div>
                      </div>
                      <div className="text-sm leading-relaxed text-zinc-400">
                        {ritual.Descricao_Ritual.split('\n').map((linha, i) => (
                          <span key={i} className="block" dangerouslySetInnerHTML={{ __html: formatarDescricao(linha) }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {listaFiltrada.length === 0 && (
              <div className="mt-10 text-center italic text-zinc-600">Nenhum ritual atende aos filtros.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
