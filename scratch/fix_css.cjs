
const fs = require('fs');
let c = fs.readFileSync('src/index.css', 'utf8');
c += \\n\n@keyframes expand {
  from { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; margin-top: 0; margin-bottom: 0; overflow: hidden; }
  to { opacity: 1; max-height: 2000px; padding-top: auto; padding-bottom: auto; margin-top: auto; margin-bottom: auto; overflow: visible; }
}
.animate-expand {
  animation: expand 0.3s ease-in-out forwards;
}
\;
fs.writeFileSync('src/index.css', c);

