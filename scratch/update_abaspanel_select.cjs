const fs = require('fs');

const file = 'src/screens/Ficha/AbasPanel.tsx';
let c = fs.readFileSync(file, 'utf8');

if (!c.includes("import { CustomSelect } from '../../components/CustomSelect'")) {
  c = c.replace("import React,", "import { CustomSelect } from '../../components/CustomSelect';\nimport React,");
}

// Update the array mapping:
c = c.replace(/const versoesDisponiveis: \{ value: VersaoRitual; label: string; disabled\?: boolean; title\?: string \}\[\] = \[/g, `const versoesDisponiveis: { value: VersaoRitual; label: string; disabled?: boolean; subtitle?: string; title?: string }[] = [`);

c = c.replace(/label: reqNormal\.atende \? 'Normal' : \`Normal \(\$\{reqNormal\.motivo\}\)\`,/g, `label: 'Normal',\n                              subtitle: !reqNormal.atende ? reqNormal.motivo : undefined,`);

c = c.replace(/label: req\.atende \? 'Discente' : \`Discente \(\$\{req\.motivo\}\)\`,/g, `label: 'Discente',\n                              subtitle: !req.atende ? req.motivo : undefined,`);

c = c.replace(/label: req\.atende \? 'Verdadeiro' : \`Verdadeiro \(\$\{req\.motivo\}\)\`,/g, `label: 'Verdadeiro',\n                              subtitle: !req.atende ? req.motivo : undefined,`);

// Replace the <select> ... </select> block with CustomSelect:
// It looks like:
/*
                                            <select
                                              value={versao}
                                              onChange={e => {
                                                e.stopPropagation();
                                                setVersaoRitual(prev => ({
                                                  ...prev,
                                                  [chaveUnica]: e.target.value as VersaoRitual,
                                                }));
                                              }}
                                              className="cursor-pointer rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs font-bold text-zinc-200 outline-none transition hover:bg-zinc-800 focus:border-green-700"
                                            >
                                              {versoesDisponiveis.map(v => (
                                                <option key={v.value} value={v.value} disabled={v.disabled} title={v.title}>
                                                  {v.label}
                                                </option>
                                              ))}
                                            </select>
*/

const selectRegex = /<select\s*value=\{versao\}\s*onChange=\{e => \{\s*e\.stopPropagation\(\);\s*setVersaoRitual\(prev => \(\{\s*\.\.\.prev,\s*\[chaveUnica\]: e\.target\.value as VersaoRitual,\s*\}\)\);\s*\}\}\s*className="cursor-pointer rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs font-bold text-zinc-200 outline-none transition hover:bg-zinc-800 focus:border-green-700"\s*>\s*\{versoesDisponiveis\.map\(v => \(\s*<option key=\{v\.value\} value=\{v\.value\} disabled=\{v\.disabled\} title=\{v\.title\}>\s*\{v\.label\}\s*<\/option>\s*\)\)\}\s*<\/select>/;

c = c.replace(selectRegex, `<CustomSelect
                                              value={versao}
                                              onChange={(val) => {
                                                setVersaoRitual(prev => ({
                                                  ...prev,
                                                  [chaveUnica]: val as VersaoRitual,
                                                }));
                                              }}
                                              options={versoesDisponiveis}
                                              wrapperClassName="w-48 relative z-50"
                                              className="cursor-pointer rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs font-bold text-zinc-200 outline-none transition hover:bg-zinc-800 focus:border-green-700"
                                            />`);

fs.writeFileSync(file, c);
console.log('done');
