const fs = require('fs');

const path = 'src/screens/Ficha/InventarioPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add SortableItemAmaldicoado import
if (!content.includes('SortableItemAmaldicoado')) {
    content = content.replace(
        "import { ModalEditarArma } from '../../components/ModalEditarArma';",
        "import { ModalEditarArma } from '../../components/ModalEditarArma';\nimport { SortableItemAmaldicoado } from '../../components/SortableItemAmaldicoado';"
    );
}

// 2. Add modal Itens Amaldicoados states
if (!content.includes('modalItensAmaldicoadosAberto')) {
    content = content.replace(
        "const [modalItensAberto, setModalItensAberto] = useState(false);",
        "const [modalItensAberto, setModalItensAberto] = useState(false);\n  const [modalItensAmaldicoadosAberto, setModalItensAmaldicoadosAberto] = useState(false);"
    );
}

// 3. Edit editingItem typing
content = content.replace(
    "tipo: 'arma' | 'protecao' | 'item' | 'municao' }",
    "tipo: 'arma' | 'protecao' | 'item' | 'municao' | 'amaldicoado' }"
);
content = content.replace(
    "type: 'arma' | 'municao' | 'protecao' | 'item', name?: string }",
    "type: 'arma' | 'municao' | 'protecao' | 'item' | 'amaldicoado', name?: string }"
);

// 4. Add getItemAmaldicoadoParaEditar
if (!content.includes('getItemAmaldicoadoParaEditar')) {
    content = content.replace(
        "const getMunicaoParaEditar = () => editingItem?.tipo === 'municao' ? municoesHook.municoesInventario.find(i => i.id === editingItem.id) : null;",
        "const getMunicaoParaEditar = () => editingItem?.tipo === 'municao' ? municoesHook.municoesInventario.find(i => i.id === editingItem.id) : null;\n  const getItemAmaldicoadoParaEditar = () => editingItem?.tipo === 'amaldicoado' ? itensAmaldicoadosHook.itensAmaldicoadosInventario.find(i => i.id === editingItem.id) : null;"
    );
}

// 5. Add itensAmaldicoadosHook in context extraction
if (!content.includes('itensAmaldicoadosHook, toggleVestimentaGeral')) {
    content = content.replace(
        "armasHook, municoesHook, protecoesHook, itensHook, status,",
        "armasHook, municoesHook, protecoesHook, itensHook, itensAmaldicoadosHook, toggleVestimentaGeral, status,"
    );
}

// 6. Handle handleDragEnd
if (!content.includes('itemAmaldicoadoActive')) {
    content = content.replace(
        "const protecaoActive = protecoesHook?.protecoesInventario.find(p => p.id === active.id);",
        "const protecaoActive = protecoesHook?.protecoesInventario.find(p => p.id === active.id);\n      const itemAmaldicoadoActive = itensAmaldicoadosHook?.itensAmaldicoadosInventario.find(p => p.id === active.id);"
    );
    content = content.replace(
        "const protecaoOver = protecoesHook?.protecoesInventario.find(p => p.id === over.id);",
        "const protecaoOver = protecoesHook?.protecoesInventario.find(p => p.id === over.id);\n      const itemAmaldicoadoOver = itensAmaldicoadosHook?.itensAmaldicoadosInventario.find(p => p.id === over.id);"
    );
    content = content.replace(
        "const itemOver = itensHook?.itensInventario.find(i => i.id === over.id);",
        "const itemOver = itensHook?.itensInventario.find(i => i.id === over.id);\n        if (itemAmaldicoadoActive && itemAmaldicoadoOver) {\n          const oldIndex = (itensAmaldicoadosHook?.itensAmaldicoadosInventario || []).findIndex(x => x.id === active.id);\n          const newIndex = (itensAmaldicoadosHook?.itensAmaldicoadosInventario || []).findIndex(x => x.id === over.id);\n          if (oldIndex !== -1 && newIndex !== -1 && itensAmaldicoadosHook?.reordenarItens) {\n            itensAmaldicoadosHook.reordenarItens(oldIndex, newIndex);\n          }\n          return;\n        }"
    );
}

// 7. Add filter lists
if (!content.includes('itensAmaldicoadosGeral')) {
    content = content.replace(
        "const itensGeral = (itensHook?.itensInventario || []).filter(iinv => {",
        "const itensAmaldicoadosGeral = (itensAmaldicoadosHook?.itensAmaldicoadosInventario || []).filter(iinv => {\n    if (buscaItem && !iinv.item.Nome_Ama.toLowerCase().includes(buscaItem.toLowerCase())) return false;\n    return true;\n  });\n\n  const itensGeral = (itensHook?.itensInventario || []).filter(iinv => {"
    );
}

// 8. Add tab button
if (!content.includes("setCategoriaFiltro('Amaldiçoados')")) {
    const tabString = `
          <button
            onClick={() => setCategoriaFiltro('Amaldiçoados')}
            title="Amaldiçoados"
            className={\`w-12 h-12 flex items-center justify-center rounded-t text-2xl transition border-b-2 \${
              categoriaFiltro === 'Amaldiçoados' 
                ? 'bg-zinc-900 text-purple-400 border-b-purple-500' 
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50 border-b-transparent'
            }\`}
          >
            💀
          </button>
        </div>`;
    content = content.replace("</div>\n\n        {/* Filtros e Busca */}", tabString + "\n\n        {/* Filtros e Busca */}");
}

// 9. Add "Adicionar" button
if (!content.includes("setModalItensAmaldicoadosAberto(true)")) {
    const addBtnStr = `
          {categoriaFiltro === 'Amaldiçoados' && (
            <button
              onClick={() => {
                setAbaItensAberta('');
                setModalItensAmaldicoadosAberto(true);
              }}
              className="bg-green-700 hover:bg-green-600 text-white px-4 py-1.5 rounded font-bold text-sm transition"
            >
              + Adicionar
            </button>
          )}`;
    content = content.replace(
        "{categoriaFiltro === 'Itens Paranormais' && (",
        addBtnStr + "\n          {categoriaFiltro === 'Itens Paranormais' && ("
    );
}

// 10. Add rendering list
if (!content.includes("SortableItemAmaldicoado\n")) {
    const renderStr = `
            {categoriaFiltro === 'Amaldiçoados' && (
              <SortableContext items={itensAmaldicoadosGeral.map(i => i.id)} strategy={verticalListSortingStrategy}>
                {itensAmaldicoadosGeral.map(iinv => (
                  <SortableItemAmaldicoado
                    key={iinv.id}
                    item={iinv}
                    isExpanded={expandidos[iinv.id] || false}
                    toggleExpandir={toggleExpandir}
                    removerItem={() => itensAmaldicoadosHook.removerItem(iinv.id)}
                    stringDT={calcularDT(iinv.item.DT_Ama)}
                    onEditar={() => setEditingItem({ id: iinv.id, tipo: 'amaldicoado' })}
                    toggleEquipado={() => toggleVestimentaGeral(iinv.id, true)}
                  />
                ))}
                {itensAmaldicoadosGeral.length === 0 && (
                  <div className="text-center text-zinc-500 py-8 text-sm italic">
                    Nenhum item amaldiçoado no inventário.
                  </div>
                )}
              </SortableContext>
            )}
`;
    content = content.replace(
        "{categoriaFiltro === 'Itens Paranormais' && (",
        renderStr + "\n            {categoriaFiltro === 'Itens Paranormais' && ("
    );
}

fs.writeFileSync(path, content, 'utf8');
console.log('InventarioPanel.tsx updated successfully');
