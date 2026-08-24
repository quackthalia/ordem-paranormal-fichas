const fs = require('fs');
let t = fs.readFileSync('src/components/ModalTrilhas.tsx', 'utf8');

if (!t.includes('import { Collapse } from')) {
  t = t.replace("import { calcularNivel } from '../utils/rpgRules';", "import { calcularNivel } from '../utils/rpgRules';\nimport { Collapse } from './Collapse';");
}

t = t.replace(
  /<div className=\{\`text-xs text-zinc-400 mb-4 leading-relaxed \$\{\!estaExpandida \? 'line-clamp-3' : ''\}\`\} dangerouslySetInnerHTML=\{\{ __html: formatarDescricao\(trilha\.Descricao_Trilha\) \}\} \/>/g,
  `<Collapse isOpen={estaExpandida} previewHeight="4.5em">
                    <div className="text-xs text-zinc-400 mb-4 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatarDescricao(trilha.Descricao_Trilha) }} />
                  </Collapse>`
);

fs.writeFileSync('src/components/ModalTrilhas.tsx', t);
