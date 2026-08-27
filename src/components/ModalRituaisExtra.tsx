import React, { useState, useMemo } from 'react';
import type { Ritual } from '../types';
import { sortPorElementoENome } from '../utils/rpgRules';
import { Collapse } from './Collapse';
import { CustomSelect } from './CustomSelect';

const BANNED_RITUAIS = [10, 17, 49, 53, 64, 116];

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
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const [abaElemento, setAbaElemento] = useState<string | null>(null);
  const [abaCirculo, setAbaCirculo] = useState<number | null>(null);
  const [expandidos, setExpandidos] = useState<number[]>([]);
  const [elementosVaria, setElementosVaria] = useState<Record<number, string>>({});
  const [busca, setBusca] = useState('');

  const listaFiltrada = useMemo(() => {
    let filtrada = rituais.filter(r => !BANNED_RITUAIS.includes(r.Codigo_Ritual));

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans" onClick={onClose}>
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex flex-col border-b border-zinc-800 p-5 pb-4 bg-zinc-900/50">
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
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-green-700"
          />
        </div>

        {/* FILTROS DE ELEMENTO E CÍRCULO */}
        <div className="flex flex-col border-b border-zinc-800 bg-zinc-950">
          <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 bg-zinc-900/90 px-4 py-3">
            <button
              onClick={() => setAbaElemento(null)}
              className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
                abaElemento === null
                  ? 'bg-green-900/40 text-green-300 border border-green-800'
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
                  className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition border ${
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
          
          <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 bg-zinc-900/90 px-4 py-3">
            <button
              onClick={() => setAbaCirculo(null)}
              className={`rounded px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition border ${
                abaCirculo === null
                  ? 'bg-green-900/40 text-green-300 border-green-800'
                  : 'bg-zinc-800/60 text-zinc-500 border-zinc-700 hover:text-zinc-300'
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
                  className={`rounded px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition border ${
                    ativo
                      ? 'bg-green-900/40 text-green-300 border-green-800'
                      : 'bg-zinc-800/60 text-zinc-500 border-zinc-700 hover:text-zinc-300'
                  }`}
                >
                  {c}º Círculo
                </button>
              );
            })}
          </div>
        </div>

        {/* LISTA DE RITUAIS */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="flex flex-col md:flex-row gap-3 items-start">
            <div className="flex flex-col gap-3 w-full md:w-1/2 flex-1 min-w-0">
            {listaFiltrada.filter((_, i) => i % 2 === 0).map(ritual => {
              const codigo = ritual.Codigo_Ritual;
              const expandido = expandidos.includes(codigo);
              const isVaria = ritual.Elemento_Ritual.toLowerCase() === 'lista' || ritual.Elemento_Ritual.toLowerCase() === 'varia';
              const elementoSendoEscolhido = isVaria ? (elementosVaria[codigo] || 'Sangue') : ritual.Elemento_Ritual;
              const corElemento = obterCorBadge(elementoSendoEscolhido);
              const corTextoElemento = obterCorTexto(elementoSendoEscolhido);

              return (
                <div key={codigo} className="bg-zinc-900/40 border border-zinc-800/80 rounded hover:border-green-500/50 hover:bg-zinc-900/80 transition group flex flex-col h-full border-l-4" style={{ borderLeftColor: corElemento }}>
                  <div
                    onClick={() => setExpandidos(prev => prev.includes(codigo) ? prev.filter(id => id !== codigo) : [...prev, codigo])}
                    className="flex cursor-pointer items-start justify-between gap-3 p-3"
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
                        <span className="font-bold text-zinc-200 group-hover:text-green-400 transition text-sm">{ritual.Nome_Ritual}</span>
                      </div>
                    </div>
                    <span className="text-zinc-500 text-xs mt-1">{expandido ? '▲' : '▼'}</span>
                  </div>

                  <div className="px-3 pb-3 cursor-pointer" onClick={() => setExpandidos(prev => prev.includes(codigo) ? prev.filter(id => id !== codigo) : [...prev, codigo])}>
                    <Collapse isOpen={expandido}>
                      <div className="mb-3 flex flex-col gap-1 border-b border-zinc-800/50 pb-3">
                        {ritual.Execucao_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Execução: </span><span className="text-zinc-300">{ritual.Execucao_Ritual}</span></div>}
                        {ritual.Alcance_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Alcance: </span><span className="text-zinc-300">{ritual.Alcance_Ritual}</span></div>}
                        {ritual.Area_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Área: </span><span className="text-zinc-300">{ritual.Area_Ritual}</span></div>}
                        {ritual.Alvo_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Alvo: </span><span className="text-zinc-300">{ritual.Alvo_Ritual}</span></div>}
                        {ritual.Duracao_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Duração: </span><span className="text-zinc-300">{ritual.Duracao_Ritual}</span></div>}
                        {ritual.Resistencia_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Resistência: </span><span className="text-zinc-300">{ritual.Resistencia_Ritual}</span></div>}
                      </div>
                    </Collapse>
                    <Collapse isOpen={expandido} previewHeight="4.5em">
                      <div className="text-xs leading-relaxed text-zinc-400 min-h-[4.5em]">
                        {ritual.Descricao_Ritual.split('\n').map((linha, i) => (
                          <span key={i} className="block mb-1" dangerouslySetInnerHTML={{ __html: formatarDescricao(linha) }} />
                        ))}
                      </div>
                    </Collapse>
                  </div>

                  <div className="flex flex-nowrap overflow-hidden items-center justify-between gap-2 mt-auto text-[11px] border-t border-zinc-800/50 p-3 pt-2">
                    {isVaria ? (
                      <div onClick={e => e.stopPropagation()} className="flex items-center gap-2">
                        <span className="text-[0.60rem] uppercase tracking-wider text-zinc-500 font-bold">Elemento:</span>
                        <CustomSelect
                          value={elementosVaria[codigo] || 'Sangue'}
                          onChange={(val) => setElementosVaria(prev => ({ ...prev, [codigo]: val }))}
                          className="cursor-pointer rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-[10px] font-bold text-zinc-200 outline-none hover:bg-zinc-800 focus:border-green-700"
                          options={[
                            { value: 'Sangue', label: 'Sangue' },
                            { value: 'Conhecimento', label: 'Conhecimento' },
                            { value: 'Energia', label: 'Energia' },
                            { value: 'Morte', label: 'Morte' }
                          ]}
                        />
                      </div>
                    ) : <div />}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(ritual, isVaria ? (elementosVaria[codigo] || 'Sangue') : undefined);
                      }}
                      className="ml-auto shrink-0 px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors active:scale-95"
                    >
                      Aprender
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
            <div className="flex flex-col gap-3 w-full md:w-1/2 flex-1 min-w-0">
              {listaFiltrada.filter((_, i) => i % 2 !== 0).map(ritual => {
                const codigo = ritual.Codigo_Ritual;
                const expandido = expandidos.includes(codigo);
                const isVaria = ritual.Elemento_Ritual.toLowerCase() === 'lista' || ritual.Elemento_Ritual.toLowerCase() === 'varia';
                const elementoSendoEscolhido = isVaria ? (elementosVaria[codigo] || 'Sangue') : ritual.Elemento_Ritual;
                const corElemento = obterCorBadge(elementoSendoEscolhido);
                const corTextoElemento = obterCorTexto(elementoSendoEscolhido);

                return (
                  <div key={codigo} className={`bg-zinc-900/40 border border-zinc-800/80 rounded hover:border-green-500/50 hover:bg-zinc-900/80 transition group flex flex-col border-l-4 `} style={{ borderLeftColor: corElemento }}>
                    <div
                      onClick={() => setExpandidos(prev => prev.includes(codigo) ? prev.filter(id => id !== codigo) : [...prev, codigo])}
                      className="flex cursor-pointer items-start justify-between gap-3 p-3"
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
                          <span className="font-bold text-zinc-200 group-hover:text-green-400 transition text-sm">{ritual.Nome_Ritual}</span>
                        </div>
                      </div>
                      <span className="text-zinc-500 text-xs mt-1">{expandido ? '▲' : '▼'}</span>
                    </div>

                    <div className="px-3 pb-3 cursor-pointer" onClick={() => setExpandidos(prev => prev.includes(codigo) ? prev.filter(id => id !== codigo) : [...prev, codigo])}>
                      <Collapse isOpen={expandido}>
                        <div className="mb-3 flex flex-col gap-1 border-b border-zinc-800/50 pb-3">
                          {ritual.Execucao_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Execução: </span><span className="text-zinc-300">{ritual.Execucao_Ritual}</span></div>}
                          {ritual.Alcance_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Alcance: </span><span className="text-zinc-300">{ritual.Alcance_Ritual}</span></div>}
                          {ritual.Area_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Área: </span><span className="text-zinc-300">{ritual.Area_Ritual}</span></div>}
                          {ritual.Alvo_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Alvo: </span><span className="text-zinc-300">{ritual.Alvo_Ritual}</span></div>}
                          {ritual.Duracao_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Duração: </span><span className="text-zinc-300">{ritual.Duracao_Ritual}</span></div>}
                          {ritual.Resistencia_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Resistência: </span><span className="text-zinc-300">{ritual.Resistencia_Ritual}</span></div>}
                        </div>
                      </Collapse>
                      <Collapse isOpen={expandido} previewHeight="4.5em">
                        <div className="text-xs leading-relaxed text-zinc-400 min-h-[4.5em]">
                          {ritual.Descricao_Ritual.split('\n').map((linha, idx) => (
                            <span key={idx} className="block mb-1" dangerouslySetInnerHTML={{ __html: formatarDescricao(linha) }} />
                          ))}
                        </div>
                      </Collapse>
                    </div>

                    <div className="flex flex-nowrap overflow-hidden items-center justify-between gap-2 mt-auto text-[11px] border-t border-zinc-800/50 p-3 pt-2">
                      {isVaria ? (
                        <div onClick={e => e.stopPropagation()} className="flex items-center gap-2">
                          <span className="text-[0.60rem] uppercase tracking-wider text-zinc-500 font-bold">Elemento:</span>
                          <CustomSelect
                            value={elementosVaria[codigo] || 'Sangue'}
                            onChange={val => setElementosVaria(prev => ({ ...prev, [codigo]: val }))}
                            options={[
                              { value: 'Sangue', label: 'Sangue' },
                              { value: 'Conhecimento', label: 'Conhecimento' },
                              { value: 'Energia', label: 'Energia' },
                              { value: 'Morte', label: 'Morte' }
                            ]}
                            className="px-2 py-1 text-[10px]"
                            wrapperClassName="w-24 relative z-50"
                          />
                        </div>
                      ) : <div />}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(ritual, isVaria ? (elementosVaria[codigo] || 'Sangue') : undefined);
                        }}
                        className="ml-auto shrink-0 px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors active:scale-95"
                      >
                        Aprender
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {listaFiltrada.length === 0 && (
              <div className="col-span-full py-10 text-center text-zinc-500">
                Nenhum ritual encontrado.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
