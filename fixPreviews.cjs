const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('src/{components,screens}/**/*.tsx');

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  let originalCode = code;

  // We are looking for the pattern where there is a !isExpanded block right before Collapse
  const regex = /\{\!isExpanded[^}]+\&\&\s*\(\s*<p className="[^\"]*line-clamp-3[^\"]*">(.*?)<\/p>\s*\)\s*\}\s*<\/div>\s*<Collapse isOpen=\{isExpanded\}>/g;
  
  code = code.replace(regex, (match, innerText) => {
    // Replace it by removing the !isExpanded block and adding previewHeight to Collapse
    return `</div>\n\n                    <Collapse isOpen={isExpanded} previewHeight="54px">`;
  });

  const regex2 = /\{\!estaExpandida[^}]+\&\&\s*\(\s*<div className="[^\"]*line-clamp-3[^\"]*"[^>]*><\/div>\s*\)\s*\}\s*<Collapse isOpen=\{estaExpandida\}>/g;
  code = code.replace(regex2, (match, innerText) => {
    // For ModalTrilhas
    return `<Collapse isOpen={estaExpandida} previewHeight="54px">`;
  });

  if (code !== originalCode) {
    fs.writeFileSync(file, code);
    console.log('Fixed', file);
  }
});
