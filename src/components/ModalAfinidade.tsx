import React from 'react';


interface ModalAfinidadeProps {
  onEscolher: (elemento: string) => void;
  onClose?: () => void; // Optional because initially it might be forced
  forcarEscolha?: boolean;
}

const ELEMENTOS = ['Sangue', 'Morte', 'Conhecimento', 'Energia'];

const CORES_ELEMENTOS: Record<string, string> = {
  sangue: '#991b1b',
  morte: '#18181b', // or gray/zinc
  conhecimento: '#ca8a04',
  energia: '#7e22ce'
};

export const ModalAfinidade: React.FC<ModalAfinidadeProps> = ({
  onEscolher,
  onClose,
  forcarEscolha = false
}) => {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-5 backdrop-blur-sm">
      <div className="flex w-full max-w-md flex-col rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50">
        
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between border-b border-zinc-800 p-5 bg-zinc-950 rounded-t-lg">
          <div className="flex flex-col">
            <h3 className="font-display m-0 text-lg uppercase tracking-wide text-zinc-100">
              Escolher Afinidade
            </h3>
            <span className="text-xs text-zinc-500 mt-1">
              Você alcançou 50% de NEX. Escolha seu elemento de afinidade.
            </span>
          </div>
          {!forcarEscolha && onClose && (
            <button
              onClick={onClose}
              className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100"
            >
              &times;
            </button>
          )}
        </div>

        {/* CONTEÚDO */}
        <div className="p-6">
          <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
            Sua afinidade só será ativada na próxima vez que você <strong>transcender</strong> (escolher um poder paranormal).
            Até lá, sua conexão com o elemento permanece dormente.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {ELEMENTOS.map(elem => {
              const corBase = CORES_ELEMENTOS[elem.toLowerCase()] || '#888';
              return (
                <button
                  key={elem}
                  onClick={() => onEscolher(elem)}
                  className="group relative flex h-24 flex-col items-center justify-center overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950 transition hover:-translate-y-1 hover:shadow-lg"
                  style={{
                    boxShadow: `0 0 0 0 ${corBase}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = corBase;
                    e.currentTarget.style.boxShadow = `0 4px 20px -5px ${corBase}80`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#3f3f46'; // zinc-700
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div 
                    className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-10"
                    style={{ backgroundColor: corBase }}
                  />
                  <span className="font-display z-10 text-lg uppercase tracking-widest text-zinc-300 group-hover:text-zinc-100">
                    {elem}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
