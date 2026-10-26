import React, { useState } from 'react';
import { useRPG } from '../context/RPGContext';
import { InputOtimizado } from './InputOtimizado';
import type { Origem } from '../types';
import { Collapse } from './Collapse';
import { CustomSelect } from './CustomSelect';

interface ModalMudarOrigemProps {
  onClose: () => void;
}

export const ModalMudarOrigem: React.FC<ModalMudarOrigemProps> = ({ onClose }) => {
  const { origensHook } = useRPG();
  const {
    origens,
    origensExpandidas,
    toggleOrigemExpandida,
    selecionarOrigem,
    nomePericia,
  } = origensHook;

  const [busca, setBusca] = useState('');
  const [filtroFonte, setFiltroFonte] = useState<string>('Todas');
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(false);
  const [escolhasRegra6, setEscolhasRegra6] = useState<Record<number, 'p2' | 'pesp'>>({});
  const [escolhendoElementoPara, setEscolhendoElementoPara] = React.useState<number | null>(null);

  const origensFiltradas = origens.filter(o => {
    if (busca && !o.Nome.toLowerCase().includes(busca.toLowerCase()) && !(o.Nome_Poder && o.Nome_Poder.toLowerCase().includes(busca.toLowerCase()))) return false;
    if (filtroFonte !== 'Todas') {
      const fonte = (o.Fonte || '').trim().toLowerCase();
      if (filtroFonte === 'Homebrew') {
        if (fonte !== 'homebrew' && fonte !== 'hb') return false;
      } else if (filtroFonte === 'AS') {
        if (fonte !== 'as' && fonte !== 'a.s.' && fonte !== 'a.s' && !fonte.includes('sobreviv') && !fonte.includes('arquivo') && !fonte.includes('aurora') && !fonte.includes('aniquila')) return false;
      } else {
        if (fonte !== filtroFonte.toLowerCase()) return false;
      }
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans" onClick={onClose}>
      <div className="flex w-full max-w-2xl h-[80vh] flex-col gap-4 rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display text-lg uppercase tracking-wide text-zinc-100">
            Mudar Origem (Teste)
          </h3>
          <button onClick={onClose} className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100">&times;</button>
        </div>

        <div className="flex items-stretch gap-2">
          <InputOtimizado
            value={busca}
            onChange={setBusca}
            placeholder="Buscar origem ou poder..."
            className="flex-1"
          />
          <button
            onClick={() => setMostrarFiltrosAvancados(!mostrarFiltrosAvancados)}
            className={`rounded border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition ${
              mostrarFiltrosAvancados || filtroFonte !== 'Todas'
                ? 'border-green-800 bg-green-900/40 text-green-300'
                : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            Filtros
          </button>
        </div>
        <Collapse isOpen={mostrarFiltrosAvancados} className="z-50">
          <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-zinc-800/80 mt-1">
            <div className="flex flex-col gap-1 w-full sm:w-auto flex-1 min-w-[120px]">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Fonte</label>
              <CustomSelect
                value={filtroFonte}
                onChange={setFiltroFonte}
                options={[
                  { value: 'Todas', label: 'Todas' },
                  { value: 'OPRPG', label: 'OPRPG' },
                  { value: 'SaH', label: 'SaH' },
                  { value: 'AS', label: 'AS' },
                  { value: 'Homebrew', label: 'Homebrew' }
                ]}
                wrapperClassName="w-full"
              />
            </div>
          </div>
        </Collapse>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2">
          {origensFiltradas.map((origem) => {
            const estaExpandida = origensExpandidas.includes(origem.Codigo_Origem);
            const nomeP1 = nomePericia(origem.Pericia_Treinada_1);
            const nomeP2 = nomePericia(origem.Pericia_Treinada_2);
            let nomePEsp = null;
            if (origem.Pericia_Treinada_Especial) {
              nomePEsp = nomePericia(origem.Pericia_Treinada_Especial as any);
            }

            return (
              <div key={origem.Codigo_Origem} className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden shrink-0">
                <div 
                  onClick={() => toggleOrigemExpandida(origem.Codigo_Origem)}
                  className="flex cursor-pointer items-center justify-between bg-zinc-900 p-4 transition hover:bg-zinc-800/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-display text-lg uppercase tracking-wide text-zinc-100">{origem.Nome}</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {origem.Codigo_Per_Regra !== 6 && (
                      escolhendoElementoPara === origem.Codigo_Origem ? (
                        <div className="flex flex-wrap gap-1 items-center bg-zinc-950 p-1.5 rounded border border-zinc-800">
                          <span className="text-[0.55rem] text-zinc-500 uppercase font-bold px-1 hidden sm:inline">Elemento:</span>
                          {['Sangue', 'Morte', 'Conhecimento', 'Energia'].map(elem => {
                            return (
                              <button
                                key={elem}
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setEscolhendoElementoPara(null); 
                                  selecionarOrigem(origem, undefined, elem);
                                  onClose();
                                }}
                                className={`rounded px-1.5 py-0.5 text-[0.55rem] font-bold uppercase transition border border-zinc-700 hover:scale-105 ${
                                  elem === 'Sangue' ? 'text-red-500 bg-transparent' :
                                  elem === 'Morte' ? 'bg-black/50 text-white px-2' :
                                  elem === 'Conhecimento' ? 'text-yellow-500 bg-transparent' :
                                  'text-purple-500 bg-transparent'
                                }`}
                              >
                                {elem}
                              </button>
                            );
                          })}
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEscolhendoElementoPara(null); }}
                            className="rounded px-2 py-0.5 text-[0.55rem] font-bold uppercase transition border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (origem.Codigo_Regra === 18) {
                              setEscolhendoElementoPara(origem.Codigo_Origem);
                              return;
                            }
                            selecionarOrigem(origem);
                            onClose();
                          }}
                          className="rounded-md bg-green-700 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-100 transition hover:bg-green-600"
                        >
                          Selecionar
                        </button>
                      )
                    )}
                    <span className="text-xl font-light text-zinc-500">{estaExpandida ? '−' : '+'}</span>
                  </div>
                </div>

                <Collapse isOpen={estaExpandida}>
                  <div className="border-t border-zinc-800 p-4">
                    <div className="mb-4 text-sm text-zinc-400">
                      {origem.Descricao_Origem?.split('\n').map((linha, i) => (
                        <p key={i} className="mb-2 last:mb-0">{linha}</p>
                      ))}
                    </div>

                    <div className="mb-4 flex flex-col gap-2 rounded bg-zinc-950 p-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">Perícias Treinadas</div>
                      
                      {origem.Codigo_Per_Regra === 1 && origem.Pericia_Treinada_Especial ? (
                        <div className="text-sm font-bold text-zinc-300">Escolha duas perícias entre: {nomeP1}, {nomeP2} e {nomePEsp}.</div>
                      ) : origem.Pericia_Treinada_Especial && ![1].includes(origem.Codigo_Per_Regra || 0) ? (
                        <div className="text-sm font-bold text-zinc-300">{nomeP1}, {nomeP2} e {nomePEsp}</div>
                      ) : (
                        <div className="text-sm font-bold text-zinc-300">{nomeP1} e {nomeP2}</div>
                      )}
                    </div>

                    {origem.Nome_Poder && (
                      <div className="mb-4">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Poder da Origem:</span>
                          <span className="text-sm font-bold text-zinc-100">{origem.Nome_Poder}</span>
                        </div>
                        <div className="text-sm text-zinc-400">{origem.Descricao_Poder}</div>
                      </div>
                    )}


                    

                    {origem.Codigo_Per_Regra === 6 && (
                      <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-4">
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-sm text-zinc-300">
                            <input
                              type="radio"
                              name={`origem-${origem.Codigo_Origem}-pericia`}
                              checked={escolhasRegra6[origem.Codigo_Origem] === 'p2'}
                              onChange={() => setEscolhasRegra6(prev => ({ ...prev, [origem.Codigo_Origem]: 'p2' }))}
                              className="text-green-500 focus:ring-green-500 focus:ring-offset-zinc-900"
                            />
                            {nomeP2}
                          </label>
                          <label className="flex items-center gap-2 text-sm text-zinc-300">
                            <input
                              type="radio"
                              name={`origem-${origem.Codigo_Origem}-pericia`}
                              checked={escolhasRegra6[origem.Codigo_Origem] === 'pesp'}
                              onChange={() => setEscolhasRegra6(prev => ({ ...prev, [origem.Codigo_Origem]: 'pesp' }))}
                              className="text-green-500 focus:ring-green-500 focus:ring-offset-zinc-900"
                            />
                            {nomePEsp}
                          </label>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (origem.Codigo_Regra === 18) {
                              setEscolhendoElementoPara(origem.Codigo_Origem);
                              return;
                            }
                            selecionarOrigem(origem, escolhasRegra6[origem.Codigo_Origem]);
                            onClose();
                          }}
                          disabled={!escolhasRegra6[origem.Codigo_Origem]}
                          className={`rounded-md px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-100 transition ${!escolhasRegra6[origem.Codigo_Origem] ? 'bg-zinc-700 opacity-50 cursor-not-allowed' : 'bg-green-700 hover:bg-green-600'}`}
                        >
                          Confirmar Origem
                        </button>
                      </div>
                    )}
                  </div>
                </Collapse>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
