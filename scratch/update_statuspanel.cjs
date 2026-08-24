const fs = require('fs');

const file = 'src/screens/Ficha/StatusPanel.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/onChange=\{\(e\) => setNex\(Math\.max\(0, Math\.min\(99, Number\(e\.target\.value\)\)\)\)\}/g, 
  `onChange={(e) => {
    const val = Math.max(0, Math.min(99, Number(e.target.value)));
    setNex(val);
    if (val < 50 && afinidadeEscolhida) setAfinidadeEscolhida(null);
  }}`
);

c = c.replace(/onChange=\{\(val\) => setNex\(Number\(val\)\)\}/g, 
  `onChange={(val) => {
    const v = Number(val);
    setNex(v);
    if (v < 50 && afinidadeEscolhida) setAfinidadeEscolhida(null);
  }}`
);

c = c.replace(/onChange=\{\(val\) => setNivel\(Number\(val\)\)\}/g, 
  `onChange={(val) => {
    const v = Number(val);
    setNivel(v);
    if (v < 10 && afinidadeEscolhida) setAfinidadeEscolhida(null);
  }}`
);

fs.writeFileSync(file, c);
console.log('done');
