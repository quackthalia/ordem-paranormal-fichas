import React, { useState, useMemo } from 'react';
import { useRPG } from '../../context/RPGContext';
import { ModalArmas } from './ModalArmas';
import { ModalProtecoes } from './ModalProtecoes';
import { ModalMunicoes } from './ModalMunicoes';
import { ModalItens } from './ModalItens';
import { ModalItensAmaldicoados } from './ModalItensAmaldicoados';

interface ModalUnificadoItensProps {
  aberto: boolean;
  onFechar: () => void;
  defaultAba?: string;
}

export const ModalUnificadoItens: React.FC<ModalUnificadoItensProps> = ({
  aberto,
  onFechar,
  defaultAba = 'Geral'
}) => {
  const { itensHook } = useRPG();
    const gruposUnicos = itensHook?.gruposUnicos || ['Itens Operacionais', 'Acessórios', 'Explosivos'];
    const baseOrder = ['Armas', 'Munições', 'Proteções', 'Acessórios', 'Explosivos', 'Itens Operacionais', 'Medicamentos', 'Itens Paranormais', 'Amaldiçoados'];
    const allTabs = [...baseOrder];
    gruposUnicos?.forEach((g: string) => {
      if (g !== 'Recursos' && !baseOrder.includes(g)) {
        allTabs.push(g);
      }
    });

    const [abaAtual, setAbaAtual] = useState<string>(
      (defaultAba === 'Geral' || defaultAba === 'Itens Gerais') ? 'Armas' : defaultAba
    );

  React.useEffect(() => {
    if (aberto) {
      document.body.style.overflow = 'hidden';
      if (defaultAba === 'Geral') {
          setAbaAtual('Armas');
        } else if (defaultAba === 'Amaldiçoados') {
        setAbaAtual('Amaldiçoados');
      } else {
        setAbaAtual(defaultAba);
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [aberto, defaultAba]);

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans" onClick={onFechar}>
      <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
        
        {/* Cabeçalho Unificado com Abas */}
        <div className="flex flex-col border-b border-zinc-800 p-5 pb-0 bg-zinc-900/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-lg uppercase tracking-wide text-zinc-100">
                ADICIONAR AO INVENTÁRIO
              </h3>
              <p className="mt-1 text-xs text-zinc-400">Navegue pelas abas abaixo para encontrar o que deseja adicionar.</p>
            </div>
            <button onClick={onFechar} className="border-none bg-transparent text-2xl text-zinc-500 transition hover:text-zinc-100">&times;</button>
          </div>
          
          {/* Abas */}
          <div className="flex flex-nowrap overflow-x-auto border-b border-zinc-800 custom-scrollbar scroll-smooth snap-x">
            {allTabs.map((aba) => (
              <button
                key={aba}
                onClick={() => setAbaAtual(aba)}
                className={`snap-start shrink-0 px-5 py-3 text-[10px] font-bold uppercase tracking-wider transition whitespace-nowrap ${
                  abaAtual === aba
                    ? 'border-b-2 border-green-500 bg-zinc-900 text-green-400'
                    : 'border-b-2 border-transparent text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'
                }`}
              >
                {aba}
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo Dinâmico */}
        <div className="flex-1 min-h-0 relative">
          {abaAtual === 'Armas' && <ModalArmas aberto={true} onFechar={onFechar} isEmbedded />}
          {abaAtual === 'Munições' && <ModalMunicoes aberto={true} onFechar={onFechar} isEmbedded />}
          {abaAtual === 'Proteções' && <ModalProtecoes aberto={true} onFechar={onFechar} isEmbedded />}
          {gruposUnicos.includes(abaAtual) && <ModalItens aberto={true} onFechar={onFechar} isEmbedded grupoAba={abaAtual} />}
          {abaAtual === 'Amaldiçoados' && <ModalItensAmaldicoados aberto={true} fechar={onFechar} isEmbedded />}
        </div>
      </div>
    </div>
  );
};
