import React, { useState, useEffect } from 'react';
import type { ProtecaoInventario } from '../types';
import { ToolbarFormato } from './ToolbarFormato';

interface ModalEditarProtecaoProps {
  protecao: ProtecaoInventario | null;
  onClose: () => void;
  onSave: (id: string, novosDados: any) => void;
}

export function ModalEditarProtecao({ protecao, onClose, onSave }: ModalEditarProtecaoProps) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [proficiencia, setProficiencia] = useState('');
  const [defesa, setDefesa] = useState('');
  const [espacos, setEspacos] = useState(0);
  const [categoria, setCategoria] = useState('');

  useEffect(() => {
    if (protecao) {
      setNome(protecao.protecao.Nome_Protecao || '');
      setDescricao(protecao.protecao.Descricao_Protecao || '');
      setProficiencia(protecao.protecao.Proficiencia || 'Proteções Leves');
      setDefesa(String(protecao.protecao.Defesa_Protecao || ''));
      setEspacos(Number(protecao.protecao.Espacos_Protecao || 0));
      setCategoria(protecao.protecao.Categoria_Protecao || 'I');
    }
  }, [protecao]);

  if (!protecao) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="w-full max-w-2xl rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 p-4">
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            Editar Proteção
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar">
          {/* Nome */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-zinc-300">Nome da Proteção</label>
            <input
              type="text"
              className="w-full rounded bg-zinc-950 border border-zinc-700 p-2 text-zinc-100 focus:border-red-500 focus:outline-none"
              value={nome}
              onChange={e => setNome(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-zinc-300">Proficiência</label>
              <select
                className="w-full rounded bg-zinc-950 border border-zinc-700 p-2 text-zinc-100 focus:border-red-500 focus:outline-none"
                value={proficiencia}
                onChange={e => setProficiencia(e.target.value)}
              >
                <option value="Proteções Leves">Proteções Leves</option>
                <option value="Proteções Pesadas">Proteções Pesadas</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-zinc-300">Categoria</label>
              <select
                className="w-full rounded bg-zinc-950 border border-zinc-700 p-2 text-zinc-100 focus:border-red-500 focus:outline-none"
                value={categoria}
                onChange={e => setCategoria(e.target.value)}
              >
                <option value="0">0</option>
                <option value="I">I</option>
                <option value="II">II</option>
                <option value="III">III</option>
                <option value="IV">IV</option>
              </select>
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-semibold text-zinc-300">Defesa</label>
              <input
                type="text"
                className="w-full rounded bg-zinc-950 border border-zinc-700 p-2 text-zinc-100 focus:border-red-500 focus:outline-none"
                value={defesa}
                onChange={e => setDefesa(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-zinc-300">Espaço</label>
              <input
                type="number"
                min="0"
                step="0.5"
                className="w-full rounded bg-zinc-950 border border-zinc-700 p-2 text-zinc-100 focus:border-red-500 focus:outline-none"
                value={espacos}
                onChange={e => setEspacos(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-zinc-300">Descrição</label>
            <div className="rounded border border-zinc-700 bg-zinc-950 focus-within:border-red-500 transition-colors">
              <ToolbarFormato value={descricao} onChange={setDescricao} />
              <textarea
                className="w-full min-h-[120px] bg-transparent p-3 text-zinc-100 focus:outline-none resize-y"
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                placeholder="Detalhes, efeitos passivos, etc..."
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-zinc-800 bg-zinc-900 p-4">
          <button
            onClick={() => {
              onSave(protecao.id, {
                Nome_Protecao: nome,
                Descricao_Protecao: descricao,
                Proficiencia: proficiencia,
                Defesa_Protecao: defesa,
                Espacos_Protecao: espacos,
                Categoria_Protecao: categoria
              });
              onClose();
            }}
            className="rounded bg-red-700 px-6 py-2 font-bold text-white transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
