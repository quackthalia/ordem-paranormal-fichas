const fs = require('fs');
const file = 'src/components/ModalTrilhas.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add state
content = content.replace(
  'const [escolhendoElementoLamina, setEscolhendoElementoLamina] = React.useState<number | null>(null);',
  'const [escolhendoElementoLamina, setEscolhendoElementoLamina] = React.useState<number | null>(null);\n  const [escolhendoPericiaAgenteSecreto, setEscolhendoPericiaAgenteSecreto] = React.useState<number | null>(null);'
);

const handlerToInsert = `
    if (trilha.Codigo_Trilha === 16) {
      setEscolhendoPericiaAgenteSecreto(trilha.Codigo_Trilha);
      return;
    }
`;
content = content.replace(
  /prosseguirEscolha\(trilha\);\s*\};\s*const prosseguirEscolhaLamina/,
  `prosseguirEscolha(trilha);\n    };\n\n    const prosseguirEscolhaAgenteSecreto = (trilha: Trilha, pericia: string) => {\n      setPoderesExtras(prev => ({ ...prev, agente_secreto_pericia: pericia }));\n      prosseguirEscolha(trilha);\n    };\n\n    const prosseguirEscolhaLamina`
);
content = content.replace(
  /if \(trilha\.Codigo_Trilha === 15\) \{/,
  handlerToInsert + '\n    if (trilha.Codigo_Trilha === 15) {'
);

const renderToInsert = `
                    {escolhendoPericiaAgenteSecreto === trilha.Codigo_Trilha ? (
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] uppercase font-bold text-zinc-500 text-center">Perícia de Agente Secreto</span>
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); prosseguirEscolhaAgenteSecreto(trilha, 'Diplomacia'); }}
                            className="rounded px-2 py-1 text-[10px] font-bold uppercase transition border border-zinc-700 hover:scale-105 text-zinc-300 hover:bg-zinc-800"
                          >
                            Diplomacia
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); prosseguirEscolhaAgenteSecreto(trilha, 'Enganação'); }}
                            className="rounded px-2 py-1 text-[10px] font-bold uppercase transition border border-zinc-700 hover:scale-105 text-zinc-300 hover:bg-zinc-800"
                          >
                            Enganação
                          </button>
                        </div>
                      </div>
                    ) : escolhendoElementoLamina === trilha.Codigo_Trilha ? (
`;

content = content.replace(
  /\{escolhendoElementoLamina === trilha\.Codigo_Trilha \? \(/,
  renderToInsert.trim()
);

fs.writeFileSync(file, content);
