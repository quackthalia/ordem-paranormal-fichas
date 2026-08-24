const fs = require('fs');
const files = [
  'src/components/ModalAfinidade.tsx',
  'src/components/ModalEditarArma.tsx',
  'src/components/ModalEditarItem.tsx',
  'src/components/ModalEditarItemAmaldicoado.tsx',
  'src/components/ModalEditarMunicao.tsx',
  'src/components/ModalEditarProtecao.tsx',
  'src/components/ModalEditarTrilha.tsx',
  'src/components/ModalEscolherRitualAprendido.tsx',
  'src/components/ModalHabilidadeTrilhaExtra.tsx',
  'src/components/ModalPoderes.tsx',
  'src/components/ModalPoderesExtra.tsx',
  'src/components/ModalPoderOutraClasse.tsx',
  'src/components/ModalPoderOutraOrigem.tsx',
  'src/components/ModalRituaisExtra.tsx',
  'src/components/ModalTrilhas.tsx',
  'src/components/ModalRituais.tsx' // Wait, ModalRituais didn't match the search, maybe it uses a different z-index? Let's check later.
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/className="fixed inset-0 z-50/g, 'className="fixed inset-0 z-[9999]');
    fs.writeFileSync(f, c);
  }
});
console.log('done');
