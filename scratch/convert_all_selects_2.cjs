const fs = require('fs');

const files = [
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
    const depth = (file.match(/\//g) || []).length;
    let importPath = '../../components/CustomSelect';
    if (file.startsWith('src/components/')) importPath = './CustomSelect';
    else if (depth === 1) importPath = '../components/CustomSelect';
    
    c = c.replace(/import React/, `import { CustomSelect } from '${importPath}';\nimport React`);
  }

  c = c.replace(/<select([^>]+)>([\s\S]*?)<\/select>/g, (match, attrs, content) => {
    let valMatch = attrs.match(/value=\{([^}]+)\}/);
    let value = valMatch ? valMatch[1] : '';
    if (!value) return match; 

    let setMatch = attrs.match(/onChange=\{([^}]+)\}/);
    let setter = setMatch ? setMatch[1] : '';
    
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
      let optValue = m[1] ? `'${m[1]}'` : m[2]; 
      opts.push(`{ value: String(${optValue}), label: \`${m[3]}\` }`); // USE BACKTICKS
    }
    
    let dynMatch = content.match(/\{([a-zA-Z0-9_\.]+)\.map\(([a-zA-Z0-9_]+)\s*=>\s*(?:(?:<option[^>]+>([^<]+)<\/option>)|(?:\(\s*<option[^>]+>([^<]+)<\/option>\s*\)))\)\}/);
    let dynamic = null;
    if (dynMatch) {
      let arr = dynMatch[1];
      let itemVar = dynMatch[2];
      let content1 = dynMatch[3];
      let content2 = dynMatch[4];
      let innerContent = content1 || content2;
      
      let dynValMatch = content.match(/<option[^>]+value=\{([^}]+)\}/);
      let dynVal = dynValMatch ? dynValMatch[1] : itemVar;
      
      // Use backticks to interpolate the JSX text, replacing {x} with ${x}
      let labelTemplate = innerContent.replace(/\{([^}]+)\}/g, '$${$1}');
      
      dynamic = `...${arr}.map(${itemVar} => ({ value: String(${dynVal}), label: \`${labelTemplate}\` }))`;
    }
    
    let optStr = opts.join(', ');
    let finalOpts = `[${optStr}]`;
    if (dynamic) {
      if (optStr) finalOpts = `[${optStr}, ${dynamic}]`;
      else finalOpts = `[${dynamic}]`;
    }
    
    return `<CustomSelect value={String(${value})} onChange={${newSetter}} options={${finalOpts}} wrapperClassName="w-full flex-1 min-w-[120px]" />`;
  });
  
  fs.writeFileSync(file, c);
}
console.log('Done');
