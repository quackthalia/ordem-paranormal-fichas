import React, { useState, useRef } from 'react';
import type { ArmaInventario, Arma } from '../types';
import { InputOtimizado } from './InputOtimizado';
import { ToolbarFormato } from './ToolbarFormato';

export function ModalEditarArma({
  armaInventario,
  onSave,
  onClose,
}: {
  armaInventario: ArmaInventario;
  onSave: (novosDados: Partial<Arma>) => void;
  onClose: () => void;
}) {
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const { arma } = armaInventario;

  const [nome, setNome] = useState(arma.Nome_Item || '');
  const [descricao, setDescricao] = useState(arma.Descricao_Item || '');
  const [dano, setDano] = useState(arma.Dano_Arma || '');
  const [critico, setCritico] = useState(arma.Critico_Arma?.toString() || '');
  const [multiplicador, setMultiplicador] = useState(arma.Multiplicador_Arma?.toString() || '');
  const [alcance, setAlcance] = useState(arma.Alcance_Item || '');
  const [categoria, setCategoria] = useState(arma.Categoria_Item || '');
  const [espacos, setEspacos] = useState(arma['Espaços_Item']?.toString() || '');
  const [dt, setDt] = useState(arma.dt_item || '');

  const [proficiencia, setProficiencia] = useState(arma.Proficiencia || 'Armas Simples');
  const [tipoArma, setTipoArma] = useState(arma.Tipo_Arma || 'Corpo a Corpo');
  const [empunhadura, setEmpunhadura] = useState(arma.Empunhadura_Arma || 'Uma Mão');
  const [tipoDano, setTipoDano] = useState(arma.Tipo_Dano_Arma || 'Corte');

  const editorDesc = useRef<HTMLDivElement | null>(null);

  const handleSalvar = () => {
    onSave({
      Nome_Item: nome,
      Descricao_Item: editorDesc.current?.innerHTML || descricao,
      Dano_Arma: dano,
      Critico_Arma: Number(critico) || 20,
      Multiplicador_Arma: Number(multiplicador) || 2,
      Alcance_Item: alcance,
      Categoria_Item: categoria,
      'Espaços_Item': Number(espacos) || 0,
      dt_item: dt,
      Proficiencia: proficiencia,
      Tipo_Arma: tipoArma,
      Empunhadura_Arma: empunhadura,
      Tipo_Dano_Arma: tipoDano,
    });
    onClose();
  };

  const InputLabel = ({ label }: { label: string }) => (
    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1 block">
      {label}
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-5" onClick={onClose}>
      <div 
        className="flex h-full max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-5 py-4">
          <h2 className="font-display text-lg uppercase tracking-wide text-zinc-100">
            Editar Arma
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-red-500 transition"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar flex flex-col gap-4">
          
          <div className="rounded border border-zinc-800 bg-zinc-950 p-4">
            <h3 className="font-bold text-red-500 mb-2 border-b border-zinc-800 pb-2">Informações da Arma</h3>
            <div className="flex flex-col gap-2">
              
              <InputLabel label="Nome da Arma" />
              <InputOtimizado
                value={nome}
                onChange={setNome}
                className="w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-100 outline-none focus:border-red-700 transition"
              />
            </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <InputLabel label="Proficiência" />
                  <select
                    value={proficiencia}
                    onChange={(e) => setProficiencia(e.target.value)}
                    className="w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-100 outline-none focus:border-red-700 transition"
                  >
                    <option value="Armas Simples">Armas Simples</option>
                    <option value="Armas Táticas">Armas Táticas</option>
                    <option value="Armas Pesadas">Armas Pesadas</option>
                  </select>
                </div>

                <div>
                  <InputLabel label="Tipo da Arma" />
                  <select
                    value={tipoArma}
                    onChange={(e) => setTipoArma(e.target.value)}
                    className="w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-100 outline-none focus:border-red-700 transition"
                  >
                    <option value="Corpo a Corpo">Corpo a Corpo</option>
                    <option value="Arma de Disparo">Arma de Disparo</option>
                    <option value="Arma de Fogo">Arma de Fogo</option>
                    <option value="Arma de Arremesso">Arma de Arremesso</option>
                  </select>
                </div>

                <div>
                  <InputLabel label="Empunhadura" />
                  <select
                    value={empunhadura}
                    onChange={(e) => setEmpunhadura(e.target.value)}
                    className="w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-100 outline-none focus:border-red-700 transition"
                  >
                    <option value="Leve">Leve</option>
                    <option value="Uma Mão">Uma Mão</option>
                    <option value="Duas Mãos">Duas Mãos</option>
                    <option value="Uma Mão/Duas Mãos">Uma Mão/Duas Mãos</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div>
                  <InputLabel label="Tipo de Dano" />
                  <select
                    value={tipoDano}
                    onChange={(e) => setTipoDano(e.target.value)}
                    className="w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-100 outline-none focus:border-red-700 transition"
                  >
                    <option value="Corte">Corte</option>
                    <option value="Perfuração">Perfuração</option>
                    <option value="Impacto">Impacto</option>
                    <option value="Balístico">Balístico</option>
                    <option value="Fogo">Fogo</option>
                    <option value="Frio">Frio</option>
                    <option value="Químico">Químico</option>
                    <option value="Eletricidade">Eletricidade</option>
                    <option value="Morte">Morte</option>
                    <option value="Sangue">Sangue</option>
                    <option value="Energia">Energia</option>
                    <option value="Conhecimento">Conhecimento</option>
                    <option value="Medo">Medo</option>
                  </select>
                </div>

                <div>
                  <InputLabel label="Dano" />
                  <InputOtimizado
                    value={dano}
                    onChange={setDano}
                    placeholder="Ex: 1d8"
                    className="w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-100 outline-none focus:border-red-700 transition"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <InputLabel label="Crítico (Margem)" />
                    <InputOtimizado
                      value={critico}
                      onChange={setCritico}
                      placeholder="Ex: 19"
                      className="w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-100 outline-none focus:border-red-700 transition"
                    />
                  </div>
                  <div className="flex-1">
                    <InputLabel label="Multiplicador" />
                    <InputOtimizado
                      value={multiplicador}
                      onChange={setMultiplicador}
                      placeholder="Ex: 2"
                      className="w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-100 outline-none focus:border-red-700 transition"
                    />
                  </div>
                </div>

                <div>
                  <InputLabel label="Alcance" />
                  <InputOtimizado
                    value={alcance}
                    onChange={setAlcance}
                    placeholder="Ex: Curto, 10m"
                    className="w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-100 outline-none focus:border-red-700 transition"
                  />
                </div>
                
                <div>
                  <InputLabel label="DT (Opcional)" />
                  <InputOtimizado
                    value={dt}
                    onChange={setDt}
                    placeholder="Ex: AGI, FOR, ou DT 20"
                    className="w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-100 outline-none focus:border-red-700 transition"
                  />
                </div>

                <div>
                  <InputLabel label="Categoria" />
                  <InputOtimizado
                    value={categoria}
                    onChange={setCategoria}
                    placeholder="Ex: I, II, 0"
                    className="w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-100 outline-none focus:border-red-700 transition"
                  />
                </div>

                <div>
                  <InputLabel label="Espaços" />
                  <InputOtimizado
                    value={espacos}
                    onChange={setEspacos}
                    placeholder="Ex: 1, 2"
                    className="w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-sm text-zinc-100 outline-none focus:border-red-700 transition"
                  />
                </div>
              </div>

            <div className="mt-2">
              <InputLabel label="Descrição" />
              <div>
                <ToolbarFormato editorRef={editorDesc as any} />
                <div
                  ref={(el) => {
                    editorDesc.current = el;
                    if (el && !el.dataset.initialized) {
                      el.innerHTML = descricao;
                      el.dataset.initialized = 'true';
                    }
                  }}
                  contentEditable
                  onBlur={(e) => setDescricao(e.currentTarget.innerHTML)}
                  className="min-h-[60px] rounded-b border border-zinc-700 bg-zinc-950 p-2.5 text-sm text-zinc-300 outline-none focus:border-red-700"
                />
              </div>
            </div>

          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-zinc-800 bg-zinc-900/50 p-4">
          <button
            onClick={onClose}
            className="rounded border border-zinc-700 px-5 py-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            className="rounded bg-red-700 px-5 py-2 text-xs font-bold uppercase tracking-wider text-zinc-100 shadow hover:bg-red-600"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
