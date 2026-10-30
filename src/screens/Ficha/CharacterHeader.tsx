import React, { useState, useEffect, useRef } from 'react';
import { useRPG } from '../../context/RPGContext';
import { comprimirImagemParaAvatar } from '../../utils/saveLoad';

export const CharacterHeader: React.FC = React.memo(() => {
  const rpg = useRPG();
  const {
    classe,
    origensHook,
    nomePersonagem,
    setNomePersonagem,
    nomeJogador,
    setNomeJogador,
    fotoPersonagem,
    setFotoPersonagem,
  } = rpg;
  const origemNome = origensHook.origemSelecionada?.Nome || '';

  const [localNomePersonagem, setLocalNomePersonagem] = useState(nomePersonagem || '');
  const [localNomeJogador, setLocalNomeJogador] = useState(nomeJogador || '');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalNomePersonagem(nomePersonagem || '');
  }, [nomePersonagem]);

  useEffect(() => {
    setLocalNomeJogador(nomeJogador || '');
  }, [nomeJogador]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (localNomePersonagem !== (nomePersonagem || '')) {
        setNomePersonagem(localNomePersonagem);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [localNomePersonagem, nomePersonagem, setNomePersonagem]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (localNomeJogador !== (nomeJogador || '')) {
        setNomeJogador(localNomeJogador);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [localNomeJogador, nomeJogador, setNomeJogador]);

  const handleTrocarFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await comprimirImagemParaAvatar(file);
      setFotoPersonagem(dataUrl);
    } catch {
      // ignora erro
    }
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  return (
    <div className="flex w-full items-end gap-5 mb-4">
      {/* Avatar do Personagem (clicável para trocar foto) */}
      <div
        onClick={() => avatarInputRef.current?.click()}
        title="Clique para alterar a foto do agente"
        className="h-16 w-16 shrink-0 overflow-hidden rounded bg-zinc-800 border border-zinc-700 shadow-md flex items-center justify-center relative group cursor-pointer"
      >
        {fotoPersonagem ? (
          <img
            src={fotoPersonagem}
            alt={nomePersonagem || 'Avatar'}
            className="object-cover w-full h-full transition group-hover:opacity-75"
          />
        ) : (
          <svg
            className="h-9 w-9 text-zinc-600 transition group-hover:text-zinc-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        )}
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          onChange={handleTrocarFoto}
          className="hidden"
        />
      </div>

      {/* Info Grid */}
      <div className="flex flex-1 gap-10">
        {/* Left Column: Personagem & Origem */}
        <div className="flex flex-1 flex-col gap-2">
          {/* Personagem */}
          <div className="flex items-end">
            <span className="w-24 text-[0.6rem] font-bold uppercase tracking-widest text-zinc-400 shrink-0 pb-1">
              Personagem
            </span>
            <input
              type="text"
              placeholder="Nome"
              value={localNomePersonagem}
              onChange={e => setLocalNomePersonagem(e.target.value)}
              onBlur={() => setNomePersonagem(localNomePersonagem)}
              className="flex-1 border-b border-zinc-700 bg-transparent py-0.5 text-sm font-bold text-white outline-none transition focus:border-green-500"
            />
          </div>
          {/* Origem */}
          <div className="flex items-end">
            <span className="w-24 text-[0.6rem] font-bold uppercase tracking-widest text-zinc-400 shrink-0 pb-1">
              Origem
            </span>
            <input
              key={`origem-${origemNome}`}
              type="text"
              defaultValue={origemNome}
              placeholder="Sua Origem"
              className="flex-1 border-b border-zinc-700 bg-transparent py-0.5 text-sm font-bold text-white outline-none transition focus:border-green-500"
            />
          </div>
        </div>

        {/* Right Column: Jogador & Classe */}
        <div className="flex flex-1 flex-col gap-2">
          {/* Jogador */}
          <div className="flex items-end">
            <span className="w-20 text-[0.6rem] font-bold uppercase tracking-widest text-zinc-400 shrink-0 pb-1">
              Jogador
            </span>
            <input
              type="text"
              placeholder="Seu Nome"
              value={localNomeJogador}
              onChange={e => setLocalNomeJogador(e.target.value)}
              onBlur={() => setNomeJogador(localNomeJogador)}
              className="flex-1 border-b border-zinc-700 bg-transparent py-0.5 text-sm font-bold text-white outline-none transition focus:border-green-500"
            />
          </div>
          {/* Classe */}
          <div className="flex items-end">
            <span className="w-20 text-[0.6rem] font-bold uppercase tracking-widest text-zinc-400 shrink-0 pb-1">
              Classe
            </span>
            <input
              key={`classe-${classe || ''}`}
              type="text"
              defaultValue={classe || ''}
              placeholder="Sua Classe"
              className="flex-1 border-b border-zinc-700 bg-transparent py-0.5 text-sm font-bold text-white outline-none transition focus:border-green-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
});
