import React, { useState, useEffect } from 'react';
import { InputOtimizado } from './InputOtimizado';
import { Collapse } from './Collapse';
import type { Ritual } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (ritualNome: string) => void;
  rituaisNomes?: string[];
  rituaisAprendidos?: any[];
  rituaisDb?: Ritual[];
}

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
    const partes = elementoStr.split(' e ').map(p => p.trim());
    return CORES_ELEMENTOS[partes[0]] || '#666';
  }
  return CORES_ELEMENTOS[elementoStr] || '#666';
}

function formatarDescricao(texto: string): string {
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

export const ModalEscolherRitualAprendido: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  rituaisNomes = [], 
  rituaisAprendidos = [], 
  rituaisDb = [] 
}) => {
  const [busca, setBusca] = useState('');
  const [expandidos, setExpandidos] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = 'unset'; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build full ritual objects from rituaisAprendidos
  const rituaisCompletos = React.useMemo(() => {
    if (rituaisAprendidos.length > 0 && rituaisDb.length > 0) {
      return rituaisAprendidos.map((ra: any) => {
        const dbRitual = rituaisDb.find(rt => rt.Codigo_Ritual === ra.codigo_ritual);
        if (dbRitual) {
          return {
            ...dbRitual,
            Nome_Ritual: ra.customNome || dbRitual.Nome_Ritual,
            idAprendido: ra.codigo_ritual // Para a key do loop
          };
        }
        return null;
      }).filter(Boolean) as (Ritual & { idAprendido: number })[];
    }
    // Fallback if we only have names (old compatibility)
    return rituaisNomes.map((nome, idx) => ({
      Codigo_Ritual: -idx,
      idAprendido: -idx,
      Nome_Ritual: nome,
      Elemento_Ritual: 'Varia',
      Circulo_Ritual: 1,
      Descricao_Ritual: 'Detalhes do ritual indisponíveis.',
      Execucao_Ritual: '',
      Alcance_Ritual: '',
      Alvo_Ritual: '',
      Area_Ritual: '',
      Duracao_Ritual: '',
      Resistencia_Ritual: ''
    } as Ritual & { idAprendido: number }));
  }, [rituaisAprendidos, rituaisDb, rituaisNomes]);

  const rituaisFiltrados = rituaisCompletos.filter(ritual => 
    ritual.Nome_Ritual.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans" onClick={onClose}>
      <div 
        className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex flex-col border-b border-zinc-800 p-5 pb-4 bg-zinc-900/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg uppercase tracking-wide text-zinc-100">
                ESCOLHER RITUAL
              </h2>
              <p className="mt-1 text-xs text-zinc-400">Selecione um ritual para este poder.</p>
            </div>
            <button onClick={onClose} className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100">&times;</button>
          </div>

          <InputOtimizado
            value={busca}
            onChange={setBusca}
            placeholder="Buscar ritual..."
            className="flex-1 rounded border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-green-700 w-full"
          />
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {rituaisFiltrados.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-4 italic">Nenhum ritual encontrado.</p>
          ) : (
            <div className="flex flex-col md:flex-row gap-3 items-start">
              <div className="flex flex-col gap-3 w-full flex-1 min-w-[200px]">
                {rituaisFiltrados.filter((_, i) => i % 2 === 0).map(ritual => renderRitualCard(ritual))}
              </div>
              <div className="flex flex-col gap-3 w-full flex-1 min-w-[200px]">
                {rituaisFiltrados.filter((_, i) => i % 2 !== 0).map(ritual => renderRitualCard(ritual))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );

  function renderRitualCard(ritual: Ritual & { idAprendido: number }) {
    const expandido = expandidos.includes(ritual.idAprendido);
    const corElemento = obterCorBadge(ritual.Elemento_Ritual);

    return (
      <div 
        key={ritual.idAprendido} 
        onClick={() => setExpandidos(prev => prev.includes(ritual.idAprendido) ? prev.filter(id => id !== ritual.idAprendido) : [...prev, ritual.idAprendido])} 
        className="bg-zinc-900/40 border border-zinc-800 rounded hover:border-green-500/50 hover:bg-zinc-900/80 group flex flex-col border-l-4 overflow-hidden transition-all duration-300 ease-in-out cursor-pointer" 
        style={{ borderLeftColor: corElemento }}
      >
        <div className="flex items-start justify-between gap-3 p-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded uppercase tracking-wider leading-tight">
                {(() => {
                  const elStr = ritual.Elemento_Ritual;
                  const isDuplo = elStr.includes(' e ');
                  if (isDuplo) {
                    const [p1, p2] = elStr.split(' e ').map(p => p.trim());
                    const c1 = (() => {
                      const l1 = p1.toLowerCase();
                      if(l1.includes('sangue')) return 'text-red-500';
                      if(l1.includes('conhecimento')) return 'text-yellow-500';
                      if(l1.includes('energia')) return 'text-purple-500';
                      if(l1.includes('morte')) return 'text-white bg-black px-1 rounded';
                      if(l1.includes('medo')) return 'text-zinc-950 bg-zinc-200 px-1 rounded';
                      return 'text-zinc-400';
                    })();
                    
                    const c2 = (() => {
                      const l2 = p2.toLowerCase();
                      if(l2.includes('sangue')) return 'text-red-500';
                      if(l2.includes('conhecimento')) return 'text-yellow-500';
                      if(l2.includes('energia')) return 'text-purple-500';
                      if(l2.includes('morte')) return 'text-white bg-black px-1 rounded';
                      if(l2.includes('medo')) return 'text-zinc-950 bg-zinc-200 px-1 rounded';
                      return 'text-zinc-400';
                    })();
                    
                    return (
                      <>
                        <span className={`text-[9px] font-bold \${c1}`}>{p1} <span className="text-zinc-400 font-normal lowercase">e</span></span>
                        <span className={`text-[9px] font-bold \${c2}`}>{p2}</span>
                        <span className={`text-[11px] font-black \${c2}`}>{ritual.Circulo_Ritual}</span>
                      </>
                    );
                  }
                  
                  const c1 = (() => {
                    const l1 = elStr.toLowerCase();
                    if(l1.includes('sangue')) return 'text-red-500';
                    if(l1.includes('conhecimento')) return 'text-yellow-500';
                    if(l1.includes('energia')) return 'text-purple-500';
                    if(l1.includes('morte')) return 'text-white bg-black px-1 rounded';
                    if(l1.includes('medo')) return 'text-zinc-950 bg-zinc-200 px-1 rounded';
                    return 'text-zinc-400';
                  })();
                  
                  return (
                    <>
                      <span className={`text-[9px] font-bold \${c1}`}>{elStr}</span>
                      <span className={`text-[11px] font-black \${c1}`}>{ritual.Circulo_Ritual}</span>
                    </>
                  );
                })()}
              </span>
              <span className="font-bold text-zinc-200 group-hover:text-green-400 transition text-sm">{ritual.Nome_Ritual}</span>
            </div>
          </div>
          <span className="text-zinc-500 text-xs mt-1">{expandido ? '▲' : '▼'}</span>
        </div>

        <div className="px-3 pb-3">
          <Collapse isOpen={expandido}>
            <div className="mb-3 flex flex-col gap-1 border-b border-zinc-800 pb-3">
              {ritual.Execucao_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Execução: </span><span className="text-zinc-300">{ritual.Execucao_Ritual?.split('/')[0].trim()}</span></div>}
              {ritual.Alcance_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Alcance: </span><span className="text-zinc-300">{ritual.Alcance_Ritual?.split('/')[0].trim()}</span></div>}
              {ritual.Area_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Área: </span><span className="text-zinc-300">{ritual.Area_Ritual?.split('/')[0].trim()}</span></div>}
              {ritual.Alvo_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Alvo: </span><span className="text-zinc-300">{ritual.Alvo_Ritual?.split('/')[0].trim()}</span></div>}
              {ritual.Duracao_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Duração: </span><span className="text-zinc-300">{ritual.Duracao_Ritual?.split('/')[0].trim()}</span></div>}
              {ritual.Efeito_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Efeito: </span><span className="text-zinc-300">{ritual.Efeito_Ritual.split('/')[0].trim()}</span></div>}
              {ritual.Resistencia_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500">Resistência: </span><span className="text-zinc-300">{ritual.Resistencia_Ritual?.split('/')[0].trim()}</span></div>}
            </div>
          </Collapse>
          <Collapse isOpen={expandido} previewHeight="90px">
            <div className="text-xs leading-relaxed text-zinc-400">
              {ritual.Descricao_Ritual.split('\n').map((linha, idx) => (
                <span key={idx} className="block mb-1" dangerouslySetInnerHTML={{ __html: formatarDescricao(linha) }} />
              ))}
            </div>
            {ritual.Fonte && (
              <div className="mt-2 text-[10px] uppercase tracking-wider text-zinc-600">
                Fonte: {ritual.Fonte}
              </div>
            )}
          </Collapse>
        </div>
        
        <div className="flex flex-nowrap overflow-hidden transition-all duration-300 ease-in-out items-center justify-end gap-2 mt-auto text-[11px] border-t border-zinc-800 p-3 pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(ritual.Nome_Ritual);
            }}
            className="px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-[10px] uppercase tracking-wider ml-auto"
          >
            Selecionar
          </button>
        </div>
      </div>
    );
  }
};
