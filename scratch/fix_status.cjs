const fs = require('fs');
let c = fs.readFileSync('src/screens/Ficha/StatusPanel.tsx', 'utf8');

if (!c.includes('CustomSelect')) {
  c = c.replace('import React', 'import { CustomSelect } from \'../../components/CustomSelect\';\nimport React');
}

c = c.replace(
/<select\s*value=\{nivel\}\s*onChange=\{\(e\) => setNivel\(Number\(e\.target\.value\)\)\}\s*className="[^"]*"\s*>\s*\{NIVEL_OPTIONS\.map\(n => \(\s*<option[^>]*>\{n\}<\/option>\s*\)\)\}\s*<\/select>/g,
`<CustomSelect
  value={String(nivel)}
  onChange={(val) => setNivel(Number(val))}
  options={NIVEL_OPTIONS.map(n => ({ value: String(n), label: String(n) }))}
  wrapperClassName="w-24"
/>`
);

c = c.replace(
/<select\s*value=\{nex\}\s*onChange=\{\(e\) => setNex\(Number\(e\.target\.value\)\)\}\s*className="[^"]*"\s*>\s*\{NEX_OPTIONS\.map\(n => \(\s*<option[^>]*>\{n\}%<\/option>\s*\)\)\}\s*<\/select>/g,
`<CustomSelect
  value={String(nex)}
  onChange={(val) => setNex(Number(val))}
  options={NEX_OPTIONS.map(n => ({ value: String(n), label: String(n) + '%' }))}
  wrapperClassName="w-24"
/>`
);

fs.writeFileSync('src/screens/Ficha/StatusPanel.tsx', c);
