const fs = require('fs');

function processFile(path) {
  let code = fs.readFileSync(path, 'utf8');

  // Imports
  if (!code.includes('import { Collapse }')) {
    code = code.replace(/import \{ CustomSelect \} from '\.\/CustomSelect';/, "import { CustomSelect } from './CustomSelect';\nimport { Collapse } from './Collapse';");
  }

  // Remove h-full
  code = code.replace(/group flex flex-col h-full/g, 'group flex flex-col');
  
  // ModalPoderesExtra specific fixes
  if (path.includes('ModalPoderesExtra')) {
    // 1. Grid to Masonry
    // We will extract the two .map blocks and rebuild the grid.
    const trilhasMapRegex = /\{abaPrincipal === 'trilhas' && trilhasFiltradas\.map\(trilha => \{([\s\S]*?)\}\)\}/;
    const trilhasMapMatch = code.match(trilhasMapRegex);
    const poderesMapRegex = /\{abaPrincipal !== 'trilhas' && listaFiltrada\.map\(poder => \{([\s\S]*?)\}\)\}/;
    const poderesMapMatch = code.match(poderesMapRegex);

    if (trilhasMapMatch && poderesMapMatch) {
      const renderTrilha = const renderTrilha = (trilha) => {\n\\n};;
      const renderPoder = const renderPoder = (poder) => {\n\\n};;

      const newGrid = 
          {(() => {
            \
            \

            return (
              <div className="flex flex-col md:flex-row gap-3 items-start">
                <div className="flex flex-col gap-3 w-full flex-1 min-w-[200px]">
                  {abaPrincipal === 'trilhas' && trilhasFiltradas.filter((_, i) => i % 2 === 0).map(renderTrilha)}
                  {abaPrincipal !== 'trilhas' && listaFiltrada.filter((_, i) => i % 2 === 0).map(renderPoder)}
                </div>
                <div className="flex flex-col gap-3 w-full flex-1 min-w-[200px]">
                  {abaPrincipal === 'trilhas' && trilhasFiltradas.filter((_, i) => i % 2 !== 0).map(renderTrilha)}
                  {abaPrincipal !== 'trilhas' && listaFiltrada.filter((_, i) => i % 2 !== 0).map(renderPoder)}
                </div>
              </div>
            );
          })()}
      ;

      code = code.replace(/<div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">[\s\S]*?\{abaPrincipal !== 'trilhas' && listaFiltrada\.length === 0 && \(/, newGrid + "\n          {abaPrincipal !== 'trilhas' && listaFiltrada.length === 0 && (");
    }
    
    // Collapse fixes
    // Trilhas collapse: 
    code = code.replace(/\{estaExpandido && \(\s*<div className="border-t border-zinc-800 px-5 py-4 text-left">([\s\S]*?)<\/div>\s*\)\}/g, 
      '<Collapse isOpen={estaExpandido}>\n                  <div className="border-t border-zinc-800 px-5 py-4 text-left"></div>\n                </Collapse>');
      
    // Poderes collapse:
    // Need to wrap the description and the extra info.
    // Description currently is:
    // <div \n className={	ext-[11px] text-zinc-400 mt-1 leading-relaxed }\n dangerouslySetInnerHTML={{ __html: formatarDescricao(poder.Descricao) }} \n />
    code = code.replace(/<div\s+className=\{\	ext-\[11px\] text-zinc-400 mt-1 leading-relaxed \$\{estaExpandido \? 'whitespace-pre-wrap' : 'line-clamp-2'\}\\}\s+dangerouslySetInnerHTML=\{\{ __html: formatarDescricao\(poder\.Descricao\) \}\}\s+\/>/, 
      '<Collapse isOpen={estaExpandido} previewHeight="4.5em">\n                      <div className="text-[11px] text-zinc-400 mt-1 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatarDescricao(poder.Descricao) }} />\n                    </Collapse>');

    // But wait, the extra info should be inside the collapse too!
    // Or we just put the extra info in another collapse? But the prompt says "blocos com text preview DEVEM usar ... sem duplicação".
    // If I put another Collapse below the preview, the preview height is 4.5em. If expanded, it grows.
    // If we just change the extra info to be inside the SAME Collapse? 
    // The previous text was separate. Let's just wrap the description in the preview collapse, 
    // and let the extra info be in another Collapse, OR we just merge them. Let's merge them!
    
  }

  fs.writeFileSync(path, code);
}
