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
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans" onClick={!forcarEscolha && onClose ? onClose : undefined}>
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        
        {/* CABEÇALHO */}
        <div className="flex flex-col border-b border-zinc-800 p-5 pb-4 bg-zinc-900/50">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg uppercase tracking-wide text-zinc-100">
              Escolher Afinidade
            </h3>
            {!forcarEscolha && onClose && (
              <button
                onClick={onClose}
                className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100"
              >
                &times;
              </button>
            )}
          </div>
          <span className="mt-1 text-xs text-zinc-400">
            Você alcançou 50% de NEX. Escolha seu elemento de afinidade.
          </span>
        </div>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed min-h-[3.2em]">
            Sua afinidade só será ativada na próxima vez que você <strong>transcender</strong> (escolher um poder paranormal).
            Até lá, sua conexão com o elemento permanece dormente.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ELEMENTOS.map(elem => {
              const corBase = CORES_ELEMENTOS[elem.toLowerCase()] || '#888';
              return (
                <button
                  key={elem}
                  onClick={() => onEscolher(elem)}
                  className="group relative flex h-16 flex-col items-center justify-center overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950 transition hover:-translate-y-1 hover:shadow-lg"
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
