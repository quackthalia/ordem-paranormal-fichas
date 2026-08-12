const fs = require('fs');

const path = 'src/screens/Ficha/InventarioPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add import
if (!content.includes('ModalItensAmaldicoados')) {
    content = content.replace(
        "import { ModalItens } from './ModalItens';",
        "import { ModalItens } from './ModalItens';\nimport { ModalItensAmaldicoados } from './ModalItensAmaldicoados';"
    );
}

// 2. Add Modal inside return
if (!content.includes('<ModalItensAmaldicoados')) {
    const modalStr = `
      <ModalItensAmaldicoados
        aberto={modalItensAmaldicoadosAberto}
        fechar={() => setModalItensAmaldicoadosAberto(false)}
      />
`;
    content = content.replace(
        "<ModalItens",
        modalStr + "      <ModalItens"
    );
}

fs.writeFileSync(path, content, 'utf8');
console.log('InventarioPanel.tsx updated successfully with Modal');
