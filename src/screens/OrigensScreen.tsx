import React from 'react';
import { useRPG } from '../context/RPGContext';

export const OrigensScreen: React.FC = () => {
  const { setTelaAtual, origensHook } = useRPG();
  const {
    origens,
    grupos,
    origensExpandidas,
    toggleOrigemExpandida,
    loading,
    error,
    selecionarOrigem,
    nomePericia,
  } = origensHook;

  const [escolhasRegra6, setEscolhasRegra6] = React.useState<Record<number, 'p2' | 'pesp'>>({});
  const [busca, setBusca] = React.useState('');
  const [grupoAtivo, setGrupoAtivo] = React.useState<number | 'todos'>('todos');

  if (loading) {
    return <div className="mx-auto max-w-4xl text-zinc-400">Carregando origens...</div>;
  }
  if (error) {
    return <div className="mx-auto max-w-4xl text-red-500">Erro: {error}</div>;
  }

  const origensFiltradas = origens.filter(o => {
    const matchBusca = o.Nome.toLowerCase().includes(busca.toLowerCase()) || 
      (o.Nome_Poder && o.Nome_Poder.toLowerCase().includes(busca.toLowerCase()));
    
    const matchGrupo = grupoAtivo === 'todos' || o.Codigo_Grupo === grupoAtivo;

    return matchBusca && matchGrupo;
  });

  return (
    <div className="mx-auto w-full max-w-4xl">
      <h1 className="font-display mb-2 text-3xl uppercase tracking-wide text-zinc-100">
        Escolha sua Origem
      </h1>
      <p className="mb-4 border-b border-zinc-800 pb-4 text-sm uppercase tracking-widest text-red-600">
        Passo 2 — Quem você era antes do Paranormal
      </p>

      {/* Abas de Grupos */}
      {grupos.length > 0 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setGrupoAtivo('todos')}
            className={`whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition ${
              grupoAtivo === 'todos'
                ? 'bg-red-700 text-white shadow-md shadow-red-900/50'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
            }`}
          >
            Todos
          </button>
          {grupos.map(g => (
            <button
              key={g.Codigo_Grupo}
              onClick={() => setGrupoAtivo(g.Codigo_Grupo)}
              className={`whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition ${
                grupoAtivo === g.Codigo_Grupo
                  ? 'bg-red-700 text-white shadow-md shadow-red-900/50'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
              }`}
            >
              {g.Nome_Grupo}
            </button>
          ))}
        </div>
      )}

      <div className="mb-8">
        <input
          type="text"
          placeholder="Buscar origem ou poder..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        />
      </div>

      <div className="mb-8 flex flex-col gap-3">
        {origensFiltradas.length === 0 && (
          <div className="text-center text-zinc-500 py-4">Nenhuma origem encontrada.</div>
        )}
        {origensFiltradas.map(origem => {
          const estaExpandida = origensExpandidas.includes(origem.Codigo_Origem);

          return (
            <div
              key={origem.Codigo_Origem}
              className="overflow-hidden rounded-r-lg border-l-4 border-red-800 bg-zinc-900/60 transition hover:bg-zinc-900"
            >
              {/* CABEÇALHO */}
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <button
                  onClick={() => toggleOrigemExpandida(origem.Codigo_Origem)}
                  className="flex flex-1 items-center gap-3 bg-transparent text-left"
                >
                  <span className={`text-xs text-zinc-600 transition-transform ${estaExpandida ? 'rotate-180' : ''}`}>▼</span>
                  <span className="text-lg font-bold text-zinc-100">{origem.Nome}</span>
                </button>
                
                {origem.Codigo_Per_Regra === 6 && estaExpandida ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-400">Escolha uma perícia abaixo primeiro</span>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      selecionarOrigem(origem, escolhasRegra6[origem.Codigo_Origem] || 'p2');
                      setTelaAtual('classe');
                    }}
                    disabled={origem.Codigo_Per_Regra === 6 && !escolhasRegra6[origem.Codigo_Origem]}
                    className={`rounded-md px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-100 transition ${origem.Codigo_Per_Regra === 6 && !escolhasRegra6[origem.Codigo_Origem] ? 'bg-zinc-700 opacity-50 cursor-not-allowed' : 'bg-red-700 hover:bg-red-600'}`}
                  >
                    Escolher
                  </button>
                )}
              </div>

              {/* CONTEÚDO EXPANSÍVEL */}
              {estaExpandida && (
                <div className="border-t border-zinc-800 px-5 pb-5 pt-4 text-left leading-relaxed text-zinc-400">
                  <p className="mb-3">{origem.Descricao}</p>
                  
                  {origem.Codigo_Per_Regra === 6 ? (
                    <div className="mb-4 rounded-md border border-zinc-700 bg-zinc-800 p-4">
                      <strong className="text-zinc-200 block mb-2">Perícias treinadas.</strong>
                      <p className="mb-3 text-sm text-zinc-400">
                        Sua origem treina automaticamente <strong className="text-zinc-300">{nomePericia(origem.Pericia_Treinada_1)}</strong>. 
                        Escolha a sua segunda perícia treinada:
                      </p>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name={`regra6_${origem.Codigo_Origem}`}
                            checked={escolhasRegra6[origem.Codigo_Origem] === 'p2'}
                            onChange={() => setEscolhasRegra6(prev => ({ ...prev, [origem.Codigo_Origem]: 'p2' }))}
                            className="text-red-600 focus:ring-red-500 bg-zinc-900 border-zinc-700"
                          />
                          <span>{nomePericia(origem.Pericia_Treinada_2)}</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name={`regra6_${origem.Codigo_Origem}`}
                            checked={escolhasRegra6[origem.Codigo_Origem] === 'pesp'}
                            onChange={() => setEscolhasRegra6(prev => ({ ...prev, [origem.Codigo_Origem]: 'pesp' }))}
                            className="text-red-600 focus:ring-red-500 bg-zinc-900 border-zinc-700"
                          />
                          <span>{nomePericia(origem.Pericia_Treinada_Especial as any)}</span>
                        </label>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selecionarOrigem(origem, escolhasRegra6[origem.Codigo_Origem]);
                            setTelaAtual('classe');
                          }}
                          disabled={!escolhasRegra6[origem.Codigo_Origem]}
                          className={`rounded-md px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-100 transition ${!escolhasRegra6[origem.Codigo_Origem] ? 'bg-zinc-700 opacity-50 cursor-not-allowed' : 'bg-red-700 hover:bg-red-600'}`}
                        >
                          Escolher Origem
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mb-3">
                      <strong className="text-zinc-200">Perícias treinadas. </strong>
                      {origem.Codigo_Per_Regra === 1 && origem.Pericia_Treinada_Especial ? (
                        <>{nomePericia(origem.Pericia_Treinada_1)} e {origem.Pericia_Treinada_Especial}.</>
                      ) : origem.Pericia_Treinada_Especial && ![1].includes(origem.Codigo_Per_Regra || 0) ? (
                        <>{origem.Pericia_Treinada_Especial}.</>
                      ) : (
                        <>{nomePericia(origem.Pericia_Treinada_1)} e {nomePericia(origem.Pericia_Treinada_2)}.</>
                      )}
                    </p>
                  )}

                  <p>
                    <strong className="text-red-500">{origem.Nome_Poder}. </strong>
                    {origem.Descricao_Poder}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setTelaAtual('atributos')}
        className="rounded-md border border-zinc-700 bg-zinc-800 px-6 py-3 font-bold text-zinc-300 transition hover:bg-zinc-700"
      >
        ◀ Voltar
      </button>
    </div>
  );
};
