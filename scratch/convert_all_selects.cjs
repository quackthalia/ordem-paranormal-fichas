const fs = require('fs');

const files = [
  'src/screens/AtributosScreen.tsx',
  'src/screens/Ficha/ModalArmas.tsx',
  'src/screens/Ficha/ModalItens.tsx',
  'src/screens/Ficha/ModalItensAmaldicoados.tsx',
  'src/screens/Ficha/ModalMunicoes.tsx',
  'src/screens/Ficha/ModalProtecoes.tsx',
  'src/screens/Ficha/InventarioPanel.tsx',
  'src/components/ModalPoderes.tsx',
  'src/components/ModalPoderesExtra.tsx',
  'src/components/ModalRituaisExtra.tsx',
  'src/components/ModalPoderOutraClasse.tsx',
  'src/components/ModalPoderOutraOrigem.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  
  let c = fs.readFileSync(file, 'utf8');
  
  if (!c.includes('CustomSelect')) {
    // We need to import it. Let's find the depth.
    const depth = (file.match(/\//g) || []).length;
    let importPath = '../../components/CustomSelect';
    if (file.startsWith('src/components/')) importPath = './CustomSelect';
    else if (depth === 1) importPath = '../components/CustomSelect';
    
    c = c.replace(/import React/, `import { CustomSelect } from '${importPath}';\nimport React`);
  }

  c = c.replace(/<select([^>]+)>([\s\S]*?)<\/select>/g, (match, attrs, content) => {
    let valMatch = attrs.match(/value=\{([^}]+)\}/);
    let value = valMatch ? valMatch[1] : '';
    if (!value) return match; // fallback

    let setMatch = attrs.match(/onChange=\{([^}]+)\}/);
    let setter = setMatch ? setMatch[1] : '';
    
    // We need to convert `(e) => setFiltro(e.target.value)` to `(val) => setFiltro(val)`
    let newSetter = setter;
    const arrowFuncMatch = setter.match(/\(\s*([a-zA-Z0-9_]+)\s*\)\s*=>\s*(.+)/);
    if (arrowFuncMatch) {
      const eventVar = arrowFuncMatch[1];
      const body = arrowFuncMatch[2];
      newSetter = `(val) => ` + body.replace(new RegExp(`${eventVar}\\.target\\.value`, 'g'), 'val');
    }

    let opts = [];
    let optionRegex = /<option\s*(?:key=\{[^}]+\}\s*)?value=(?:"([^"]+)"|\{([^}]+)\})>([^<]+)<\/option>/g;
    let m;
    while ((m = optionRegex.exec(content)) !== null) {
      let optValue = m[1] ? `'${m[1]}'` : m[2]; // string literal or variable
      opts.push(`{ value: String(${optValue}), label: '${m[3]}' }`);
    }
    
    let dynMatch = content.match(/\{([a-zA-Z0-9_\.]+)\.map\(([a-zA-Z0-9_]+)\s*=>\s*(?:(?:<option[^>]+>([^<]+)<\/option>)|(?:\(\s*<option[^>]+>([^<]+)<\/option>\s*\)))\)\}/);
    let dynamic = null;
    if (dynMatch) {
      let arr = dynMatch[1];
      let itemVar = dynMatch[2];
      let content1 = dynMatch[3];
      let content2 = dynMatch[4];
      let innerContent = content1 || content2;
      
      // We need to know what value the dynamic option uses.
      let dynValMatch = content.match(/<option[^>]+value=\{([^}]+)\}/);
      let dynVal = dynValMatch ? dynValMatch[1] : itemVar;
      
      // The innerContent is what's displayed (e.g., {t}, or {f.label}, or {n}%)
      // If it contains expressions like {t}, we need to convert to JS.
      // This is tricky, so let's just do a generic approach:
      dynamic = `...${arr}.map(${itemVar} => ({ value: String(${dynVal}), label: String(${innerContent.replace(/\{|\}/g, '')}) }))`;
    }
    
    let optStr = opts.join(', ');
    let finalOpts = `[${optStr}]`;
    if (dynamic) {
      if (optStr) finalOpts = `[${optStr}, ${dynamic}]`;
      else finalOpts = `[${dynamic}]`;
    }
    
    return `<CustomSelect value={String(${value})} onChange={${newSetter}} options={${finalOpts}} wrapperClassName="w-full flex-1" />`;
  });
  
  fs.writeFileSync(file, c);
}
console.log('Done');
