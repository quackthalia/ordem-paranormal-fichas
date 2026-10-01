const fs = require('fs');

function fixFile(file, closeFn) {
  let c = fs.readFileSync('src/screens/Ficha/' + file, 'utf8');

  // If already fixed (has "const content = ("), skip
  if (c.includes('const content = (')) {
    console.log(file, 'already embedded');
    return;
  }

  const returnRegex = new RegExp(`return \\(\\s*<div className="fixed inset-0 z-50 flex items-center justify-center bg-black\\/80 backdrop-blur-sm p-4 font-sans" onClick=\\{${closeFn}\\}>\\s*<div\\s*className="(.*?)"\\s*onClick=\\{e => e\\.stopPropagation\\(\\)\\}\\s*>`);
  const match = c.match(returnRegex);
  if (match) {
    const innerClasses = match[1];
    
    const replacement = `
  const content = (
    <div 
      className={isEmbedded ? "flex flex-col h-full w-full" : "${innerClasses}"} 
      onClick={e => !isEmbedded && e.stopPropagation()}
    >
`;
    c = c.replace(returnRegex, replacement);

    // Replace end
    c = c.replace(/    <\/div>\r?\n\s*<\/div>\r?\n\s*\);\r?\n\s*\}\r?\n?$/, 
`    </div>
  );

  if (isEmbedded) return content;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans" onClick={${closeFn}}>
      {content}
    </div>
  );
}`);

    fs.writeFileSync('src/screens/Ficha/' + file, c);
    console.log('fixed', file);
  } else {
    console.log('Regex missed for', file);
  }
}

fixFile('ModalMunicoes.tsx', 'onFechar');
fixFile('ModalItensAmaldicoados.tsx', 'fechar');
