
const fs = require('fs');
let c = fs.readFileSync('src/screens/OrigensScreen.tsx', 'utf8');
c = c.replace(/\{\s*origem\.Descricao_Poder\s*\}\r?\n\s*<\/p>\r?\n\s*<\/div>\r?\n\s*\)\}/g, '{origem.Descricao_Poder}\n                  </p>\n                </div>\n              </div>');
fs.writeFileSync('src/screens/OrigensScreen.tsx', c);

