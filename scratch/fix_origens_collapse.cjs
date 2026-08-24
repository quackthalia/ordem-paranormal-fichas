const fs = require('fs');
let c = fs.readFileSync('src/screens/OrigensScreen.tsx', 'utf8');

if (!c.includes('import { Collapse }')) {
  c = c.replace('import React,', 'import { Collapse } from \'../components/Collapse\';\nimport React,');
}

c = c.replace(
  /<div className=\{`overflow-hidden transition-\[max-height,opacity\] duration-300 ease-in-out \$\{estaExpandida \? 'max-h-\[1000px\] opacity-100' : 'max-h-0 opacity-0'\}`\}>\r?\n\s*<div className="border-t/g,
  '<Collapse isOpen={estaExpandida}>\n                <div className="border-t'
);

// Oh wait, if I used Collapse, the closing `</div>` needs to be `</Collapse>`
c = c.replace(
  /\{origem\.Descricao_Poder\}\r?\n\s*<\/p>\r?\n\s*<\/div>\r?\n\s*<\/div>/g,
  '{origem.Descricao_Poder}\n                  </p>\n                </div>\n              </Collapse>'
);

fs.writeFileSync('src/screens/OrigensScreen.tsx', c);
