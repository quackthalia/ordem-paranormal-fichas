const fs = require('fs');
let c = fs.readFileSync('src/screens/OrigensScreen.tsx', 'utf8');

c = c.replace(
  '{estaExpandida && (',
  '<div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${estaExpandida ? \'max-h-[1000px] opacity-100\' : \'max-h-0 opacity-0\'}`}>\n'
);

c = c.replace(/\{\s*origem\.Descricao_Poder\s*\}\r?\n\s*<\/p>\r?\n\s*<\/div>\r?\n\s*\)\}/g, '{origem.Descricao_Poder}\n                  </p>\n                </div>\n              </div>');

fs.writeFileSync('src/screens/OrigensScreen.tsx', c);
console.log("Done origens");
