import React, { useState, useEffect, useRef } from 'react';
import { useRPG } from '../context/RPGContext';
import type { AgenteSalvo } from '../types';
import { exportarFicha, salvarAgenteLocal, normalizarFichaImportada } from '../utils/saveLoad';

export const HubScreen: React.FC = () => {
  const rpg = useRPG();
  const {
    agentesSalvos,
    iniciarNovoAgente,
    abrirAgenteDoHub,
    excluirAgenteDoHub,
    duplicarAgenteDoHub,
    recarregarAgentes,
  } = rpg;

  const [busca, setBusca] = useState('');
  const [menuAbertoId, setMenuAbertoId] = useState<string | null>(null);
  const [confirmandoExclusaoId, setConfirmandoExclusaoId] = useState<string | null>(null);
  const fileImportRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fecharMenuFora = () => setMenuAbertoId(null);
    window.addEventListener('click', fecharMenuFora);
    return () => window.removeEventListener('click', fecharMenuFora);
  }, []);

  const handleImportarJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const data = normalizarFichaImportada(parsed);

      await salvarAgenteLocal(data);
      await recarregarAgentes?.();
    } catch (err) {
      alert('Erro ao importar ficha: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      if (fileImportRef.current) {
        fileImportRef.current.value = '';
      }
    }
  };

  const agentesFiltrados = agentesSalvos.filter(a => {
    if (!busca.trim()) return true;
    const termo = busca.toLowerCase();
    const nome = (a.nomePersonagem || 'Agente Sem Nome').toLowerCase();
    const classe = (a.classe || '').toLowerCase();
    const jogador = (a.nomeJogador || '').toLowerCase();
    return nome.includes(termo) || classe.includes(termo) || jogador.includes(termo);
  });

  return (
    <div className="mx-auto w-full max-w-6xl py-4">
      {/* TOP BAR — Botões Importar JSON e Novo Agente */}
      <div className="mb-8 flex items-center justify-end gap-3">
        <input
          ref={fileImportRef}
          type="file"
          accept=".json"
          onChange={handleImportarJson}
          className="hidden"
        />
        <button
          onClick={() => fileImportRef.current?.click()}
          className="rounded border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-bold text-zinc-200 transition hover:bg-zinc-700 cursor-pointer"
        >
          Importar JSON
        </button>
        <button
          onClick={iniciarNovoAgente}
          className="rounded bg-green-700 px-5 py-2.5 text-sm font-bold text-zinc-100 shadow-md transition hover:bg-green-600 cursor-pointer"
        >
          Novo Agente
        </button>
      </div>

      {/* CONTADOR DE AGENTES */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-100 tracking-wide">
          Agentes: {agentesSalvos.length}
        </h1>
      </div>

      {/* BARRA DE BUSCA */}
      <div className="mb-8 flex w-full items-center gap-3 rounded border border-zinc-800/80 bg-zinc-900/90 px-4 py-3 focus-within:border-green-600 transition">
        <svg
          className="h-5 w-5 shrink-0 text-zinc-200"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Buscar"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none"
        />
        {busca && (
          <button
            onClick={() => setBusca('')}
            className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* GRID DE AGENTES */}
      {agentesSalvos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 px-6 py-16 text-center">
          <p className="mb-2 text-lg font-bold text-zinc-300">
            Nenhum agente registrado ainda
          </p>
          <p className="mb-6 max-w-md text-sm text-zinc-500">
            Clique em &ldquo;Novo Agente&rdquo; para iniciar o passo a passo de criação e registrar seu primeiro agente na Ordem.
          </p>
          <button
            onClick={iniciarNovoAgente}
            className="rounded bg-green-700 px-6 py-2.5 text-sm font-bold text-zinc-100 shadow transition hover:bg-green-600 cursor-pointer"
          >
            + Criar Primeiro Agente
          </button>
        </div>
      ) : agentesFiltrados.length === 0 ? (
        <div className="py-12 text-center text-sm text-zinc-500">
          Nenhum agente encontrado para &ldquo;{busca}&rdquo;.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agentesFiltrados.map(agente => {
            const temFoto = Boolean(agente.fotoPersonagem && agente.fotoPersonagem.trim() !== '');
            const menuAberto = menuAbertoId === agente.id;

            return (
              <div
                key={agente.id}
                className="relative flex min-h-[168px] overflow-visible rounded-md border border-zinc-800/80 bg-zinc-900/80 shadow-lg transition hover:border-zinc-700"
              >
                {/* FOTO DO PERSONAGEM (se houver) */}
                {temFoto && (
                  <div className="w-36 sm:w-40 shrink-0 overflow-hidden rounded-l-md bg-zinc-950">
                    <img
                      src={agente.fotoPersonagem}
                      alt={agente.nomePersonagem || 'Agente'}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                {/* CONTEÚDO DO CARD */}
                <div className="relative flex min-w-0 flex-1 flex-col justify-between p-5">
                  {/* ÍCONE DE ENGRENAGEM (OPÇÕES) */}
                  <div className="absolute top-3 right-3 z-20">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setConfirmandoExclusaoId(null);
                        setMenuAbertoId(menuAberto ? null : agente.id);
                      }}
                      className="rounded p-1 text-zinc-200 transition hover:bg-zinc-800 hover:text-green-400 cursor-pointer"
                      title="Opções do Agente"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                      </svg>
                    </button>

                    {/* DROPDOWN DA ENGRENAGEM */}
                    {menuAberto && (
                      <div
                        onClick={e => e.stopPropagation()}
                        className="absolute right-0 mt-1 w-44 rounded-md border border-zinc-700 bg-zinc-900 py-1.5 shadow-2xl z-30 text-xs"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            duplicarAgenteDoHub(agente);
                            setMenuAbertoId(null);
                          }}
                          className="flex w-full items-center px-3.5 py-2 text-left text-zinc-200 hover:bg-zinc-800 cursor-pointer"
                        >
                          Duplicar Agente
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            exportarFicha(rpg, agente);
                            setMenuAbertoId(null);
                          }}
                          className="flex w-full items-center px-3.5 py-2 text-left text-zinc-200 hover:bg-zinc-800 cursor-pointer"
                        >
                          Exportar JSON
                        </button>
                        <div className="my-1 border-t border-zinc-800" />
                        {confirmandoExclusaoId === agente.id ? (
                          <button
                            type="button"
                            onClick={() => {
                              excluirAgenteDoHub(agente.id);
                              setConfirmandoExclusaoId(null);
                              setMenuAbertoId(null);
                            }}
                            className="flex w-full items-center bg-red-950/60 px-3.5 py-2 text-left font-bold text-red-400 hover:bg-red-900/60 cursor-pointer"
                          >
                            Confirmar Exclusão
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmandoExclusaoId(agente.id)}
                            className="flex w-full items-center px-3.5 py-2 text-left text-red-400 hover:bg-zinc-800 cursor-pointer"
                          >
                            Excluir Agente
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* INFORMAÇÕES DO AGENTE */}
                  <div>
                    <h2
                      className="truncate pr-7 text-xl font-semibold text-zinc-100"
                      title={agente.nomePersonagem || 'Agente Sem Nome'}
                    >
                      {agente.nomePersonagem || 'Agente Sem Nome'}
                    </h2>
                    <p className="mt-0.5 text-sm font-medium text-zinc-200">
                      {agente.classe || 'Sem Classe'}
                    </p>
                    <p className="mt-2.5 text-xs text-zinc-400">
                      Registrado em {agente.dataRegistro || '29/10/26'}
                    </p>
                  </div>

                  {/* BOTÃO ACESSAR FICHA */}
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => abrirAgenteDoHub(agente)}
                      className="rounded bg-green-700 px-3.5 py-1.5 text-xs font-bold text-zinc-100 shadow transition hover:bg-green-600 cursor-pointer"
                    >
                      Acessar Ficha
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
