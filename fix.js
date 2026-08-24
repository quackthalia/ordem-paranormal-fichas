const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // Add CustomSelect import if needed
    if (content.includes('<CustomSelect') && !content.includes('import { CustomSelect }')) {
        content = content.replace("import { InputOtimizado } from './InputOtimizado';", "import { InputOtimizado } from './InputOtimizado';\nimport { CustomSelect } from './CustomSelect';");
        content = content.replace("import { Collapse } from './Collapse';", "import { Collapse } from './Collapse';\nimport { CustomSelect } from './CustomSelect';");
        if (!content.includes('import { CustomSelect }')) {
             content = content.replace('import type', "import { CustomSelect } from './CustomSelect';\nimport type");
        }
    }

    // Add Collapse import if needed
    if (content.includes('<Collapse') && !content.includes('import { Collapse }')) {
        content = content.replace('import type', "import { Collapse } from './Collapse';\nimport type");
        if (!content.includes('import { Collapse }')) {
             content = content.replace("import { CustomSelect } from './CustomSelect';", "import { CustomSelect } from './CustomSelect';\nimport { Collapse } from './Collapse';");
        }
    }

    // ModalPoderes.tsx collapse fix
    if (filePath.includes('ModalPoderes.tsx')) {
        const target = `<div
            className={\`text-xs text-zinc-400 mt-1 leading-relaxed \${estaExpandido ? 'whitespace-pre-wrap' : 'line-clamp-2'}\`}
            dangerouslySetInnerHTML={{ __html: formatarDescricao(poder.Descricao) }}
          />`;
        const replacement = `<Collapse isOpen={estaExpandido} previewHeight=\"4.5em\">
            <div
              className=\"text-xs text-zinc-400 mt-1 leading-relaxed whitespace-pre-wrap\"
              dangerouslySetInnerHTML={{ __html: formatarDescricao(poder.Descricao) }}
            />
          </Collapse>`;
        content = content.replace(target, replacement);
    }

    // ModalRituais.tsx collapse fix
    if (filePath.includes('ModalRituais.tsx') || filePath.includes('ModalRituaisExtra.tsx')) {
        const target = `{!expandido && (
                    <div className=\"px-3 pb-3\">
                      <div className=\"text-xs text-zinc-400 leading-relaxed line-clamp-3\">
                        {ritual.Descricao_Ritual.replace(/\\n/g, ' ')}
                      </div>
                    </div>
                  )}

                  {expandido && (
                    <div className=\"px-3 pb-3 border-t border-zinc-800/50 pt-2 mt-1\">
                      <div className=\"mb-4 flex flex-col gap-1\">
                        <div className=\"text-xs\"><span className=\"font-bold text-zinc-500\">Execução: </span><span className=\"text-zinc-300\">{ritual.Execucao_Ritual?.split('/')[0].trim()}</span></div>
                        <div className=\"text-xs\"><span className=\"font-bold text-zinc-500\">Alcance: </span><span className=\"text-zinc-300\">{ritual.Alcance_Ritual?.split('/')[0].trim()}</span></div>
                        <div className=\"text-xs\"><span className=\"font-bold text-zinc-500\">Área: </span><span className=\"text-zinc-300\">{ritual.Area_Ritual?.split('/')[0].trim()}</span></div>
                        <div className=\"text-xs\"><span className=\"font-bold text-zinc-500\">Alvo: </span><span className=\"text-zinc-300\">{ritual.Alvo_Ritual?.split('/')[0].trim()}</span></div>
                        <div className=\"text-xs\"><span className=\"font-bold text-zinc-500\">Duração: </span><span className=\"text-zinc-300\">{ritual.Duracao_Ritual?.split('/')[0].trim()}</span></div>
                        {ritual.Efeito_Ritual && <div className=\"text-xs\"><span className=\"font-bold text-zinc-500\">Efeito: </span><span className=\"text-zinc-300\">{ritual.Efeito_Ritual.split('/')[0].trim()}</span></div>}
                        <div className=\"text-xs\"><span className=\"font-bold text-zinc-500\">Resistência: </span><span className=\"text-zinc-300\">{ritual.Resistencia_Ritual?.split('/')[0].trim()}</span></div>
                      </div>
                      <div className=\"text-xs leading-relaxed text-zinc-400\">
                        {ritual.Descricao_Ritual.split('\\n').map((linha, i) => (
                          <span key={i} className=\"block mb-1\" dangerouslySetInnerHTML={{ __html: formatarDescricao(linha) }} />
                        ))}
                      </div>
                    </div>
                  )}`;
        const replacement = `<Collapse isOpen={expandido} previewHeight=\"4.5em\">
                    <div className=\"px-3 pb-3 border-t border-zinc-800/50 pt-2 mt-1\">
                      <div className=\"mb-4 flex flex-col gap-1\">
                        <div className=\"text-xs\"><span className=\"font-bold text-zinc-500\">Execução: </span><span className=\"text-zinc-300\">{ritual.Execucao_Ritual?.split('/')[0].trim()}</span></div>
                        <div className=\"text-xs\"><span className=\"font-bold text-zinc-500\">Alcance: </span><span className=\"text-zinc-300\">{ritual.Alcance_Ritual?.split('/')[0].trim()}</span></div>
                        <div className=\"text-xs\"><span className=\"font-bold text-zinc-500\">Área: </span><span className=\"text-zinc-300\">{ritual.Area_Ritual?.split('/')[0].trim()}</span></div>
                        <div className=\"text-xs\"><span className=\"font-bold text-zinc-500\">Alvo: </span><span className=\"text-zinc-300\">{ritual.Alvo_Ritual?.split('/')[0].trim()}</span></div>
                        <div className=\"text-xs\"><span className=\"font-bold text-zinc-500\">Duração: </span><span className=\"text-zinc-300\">{ritual.Duracao_Ritual?.split('/')[0].trim()}</span></div>
                        {ritual.Efeito_Ritual && <div className=\"text-xs\"><span className=\"font-bold text-zinc-500\">Efeito: </span><span className=\"text-zinc-300\">{ritual.Efeito_Ritual.split('/')[0].trim()}</span></div>}
                        <div className=\"text-xs\"><span className=\"font-bold text-zinc-500\">Resistência: </span><span className=\"text-zinc-300\">{ritual.Resistencia_Ritual?.split('/')[0].trim()}</span></div>
                      </div>
                      <div className=\"text-xs leading-relaxed text-zinc-400\">
                        {ritual.Descricao_Ritual.split('\\n').map((linha, i) => (
                          <span key={i} className=\"block mb-1\" dangerouslySetInnerHTML={{ __html: formatarDescricao(linha) }} />
                        ))}
                      </div>
                    </div>
                  </Collapse>`;
        content = content.replace(target, replacement);

        const target2 = `{!expandido && (
                    <div className=\"px-3 pb-3\">
                      <div className=\"text-xs text-zinc-400 leading-relaxed line-clamp-3\">
                        {ritual.Descricao_Ritual.replace(/\\n/g, ' ')}
                      </div>
                    </div>
                  )}

                  {expandido && (
                    <div className=\"px-3 pb-3 border-t border-zinc-800/50 pt-2 mt-1\">
                      <div className=\"mb-4 flex flex-col gap-1\">
                        {ritual.Execucao_Ritual && <div className=\"text-xs\"><span className=\"font-bold text-zinc-500\">Execução: </span><span className=\"text-zinc-300\">{ritual.Execucao_Ritual}</span></div>}
                        {ritual.Alcance_Ritual && <div className=\"text-xs\"><span className=\"font-bold text-zinc-500\">Alcance: </span><span className=\"text-zinc-300\">{ritual.Alcance_Ritual}</span></div>}
                        {ritual.Area_Ritual && <div className=\"text-xs\"><span className=\"font-bold text-zinc-500\">Área: </span><span className=\"text-zinc-300\">{ritual.Area_Ritual}</span></div>}
                        {ritual.Alvo_Ritual && <div className=\"text-xs\"><span className=\"font-bold text-zinc-500\">Alvo: </span><span className=\"text-zinc-300\">{ritual.Alvo_Ritual}</span></div>}
                        {ritual.Duracao_Ritual && <div className=\"text-xs\"><span className=\"font-bold text-zinc-500\">Duração: </span><span className=\"text-zinc-300\">{ritual.Duracao_Ritual}</span></div>}
                        {ritual.Resistencia_Ritual && <div className=\"text-xs\"><span className=\"font-bold text-zinc-500\">Resistência: </span><span className=\"text-zinc-300\">{ritual.Resistencia_Ritual}</span></div>}
                      </div>
                      <div className=\"text-xs leading-relaxed text-zinc-400\">
                        {ritual.Descricao_Ritual.split('\\n').map((linha, i) => (
                          <span key={i} className=\"block mb-1\" dangerouslySetInnerHTML={{ __html: formatarDescricao(linha) }} />
                        ))}
                      </div>
                    </div>
                  )}`;
        const replacement2 = `<Collapse isOpen={expandido} previewHeight=\"4.5em\">
                    <div className=\"px-3 pb-3 border-t border-zinc-800/50 pt-2 mt-1\">
                      <div className=\"mb-4 flex flex-col gap-1\">
                        {ritual.Execucao_Ritual && <div className=\"text-xs\"><span className=\"font-bold text-zinc-500\">Execução: </span><span className=\"text-zinc-300\">{ritual.Execucao_Ritual}</span></div>}
                        {ritual.Alcance_Ritual && <div className=\"text-xs\"><span className=\"font-bold text-zinc-500\">Alcance: </span><span className=\"text-zinc-300\">{ritual.Alcance_Ritual}</span></div>}
                        {ritual.Area_Ritual && <div className=\"text-xs\"><span className=\"font-bold text-zinc-500\">Área: </span><span className=\"text-zinc-300\">{ritual.Area_Ritual}</span></div>}
                        {ritual.Alvo_Ritual && <div className=\"text-xs\"><span className=\"font-bold text-zinc-500\">Alvo: </span><span className=\"text-zinc-300\">{ritual.Alvo_Ritual}</span></div>}
                        {ritual.Duracao_Ritual && <div className=\"text-xs\"><span className=\"font-bold text-zinc-500\">Duração: </span><span className=\"text-zinc-300\">{ritual.Duracao_Ritual}</span></div>}
                        {ritual.Resistencia_Ritual && <div className=\"text-xs\"><span className=\"font-bold text-zinc-500\">Resistência: </span><span className=\"text-zinc-300\">{ritual.Resistencia_Ritual}</span></div>}
                      </div>
                      <div className=\"text-xs leading-relaxed text-zinc-400\">
                        {ritual.Descricao_Ritual.split('\\n').map((linha, i) => (
                          <span key={i} className=\"block mb-1\" dangerouslySetInnerHTML={{ __html: formatarDescricao(linha) }} />
                        ))}
                      </div>
                    </div>
                  </Collapse>`;
        content = content.replace(target2, replacement2);
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log('Fixed', filePath);
    }
}

const files = [
    'src/components/ModalPoderOutraClasse.tsx',
    'src/components/ModalPoderOutraOrigem.tsx',
    'src/components/ModalPoderes.tsx',
    'src/components/ModalPoderesExtra.tsx',
    'src/components/ModalRituais.tsx',
    'src/components/ModalRituaisExtra.tsx',
    'src/components/ModalHabilidadeTrilhaExtra.tsx',
    'src/components/ModalTrilhas.tsx'
];

files.forEach(fixFile);
console.log('Done!');
