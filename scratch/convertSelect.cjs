const fs = require('fs');

const files = [
  'src/screens/Ficha/ModalArmas.tsx',
  'src/screens/Ficha/ModalItens.tsx',
  'src/screens/Ficha/ModalItensAmaldicoados.tsx',
  'src/screens/Ficha/ModalMunicoes.tsx',
  'src/screens/Ficha/ModalProtecoes.tsx',
  'src/screens/Ficha/InventarioPanel.tsx'
];

for (const file of files) {
  let c = fs.readFileSync(file, 'utf8');
  
  if (!c.includes('CustomSelect')) {
    c = c.replace('import React', 'import { CustomSelect } from \'../../components/CustomSelect\';\nimport React');
  }

  c = c.replace(/<select([^>]+)>([\s\S]*?)<\/select>/g, (match, attrs, content) => {
    let valMatch = attrs.match(/value=\{([^}]+)\}/);
    let value = valMatch ? valMatch[1] : '';
    
    let setMatch = attrs.match(/onChange=\{\(e\) => ([^\(]+)\(e\.target\.value\)\}/);
    let setter = setMatch ? setMatch[1] : '';
    
    let opts = [];
    let optionRegex = /<option\s*value="([^"]+)">([^<]+)<\/option>/g;
    let m;
    while ((m = optionRegex.exec(content)) !== null) {
      opts.push(`{ value: '${m[1]}', label: '${m[2]}' }`);
    }
    
    let dynMatch = content.match(/\{([a-zA-Z0-9_]+)\.map/);
    let dynamic = null;
    if (dynMatch) {
      let arr = dynMatch[1];
      if (arr === 'filtros') {
        dynamic = `...${arr}.map(f => ({ value: String(f.valor), label: String(f.label) }))`;
      } else {
        dynamic = `...${arr}.map(t => ({ value: String(t), label: String(t) }))`;
      }
    }
    
    let optStr = opts.join(', ');
    let finalOpts = `[${optStr}]`;
    if (dynamic) {
      if (optStr) finalOpts = `[${optStr}, ${dynamic}]`;
      else finalOpts = `[${dynamic}]`;
    }
    
    return `<CustomSelect value={${value}} onChange={${setter}} options={${finalOpts}} wrapperClassName="w-full" />`;
  });
  
  fs.writeFileSync(file, c);
}
console.log('Done');
