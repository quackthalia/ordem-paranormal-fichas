const fs = require('fs');
const file = 'src/screens/Ficha/InventarioPanel.tsx';
let content = fs.readFileSync(file, 'utf8');

// The block to move is this:
const searchBlockRegex = /\{\(\(Array\.isArray\(item\.maldicoes\).*?<\/Collapse>\s*<\/div>\s*\)\}/s;
const match = content.match(searchBlockRegex);
if (match) {
    const blockText = match[0];
    content = content.replace(blockText, '');
    
    // Now find the Collapse isOpen={isExpanded} inside SortableProtecaoItem
    // SortableProtecaoItem ends around line 1950, so we can replace just the one after the Protecao's modif block
    const targetInsertionPoint = /\{modsAtuais\.map\(m => \(\s*<div key=\{m\.Codigo_Modif\}.*?<\/Collapse>\s*<\/div>\s*\)\}/s;
    const targetMatch = content.match(targetInsertionPoint);
    if (targetMatch) {
        content = content.replace(targetMatch[0], targetMatch[0] + '\n\n            ' + blockText);
        fs.writeFileSync(file, content);
        console.log('Fixed InventarioPanel.tsx');
    } else {
        console.log('Could not find insertion point');
    }
} else {
    console.log('Could not find maldições block');
}
