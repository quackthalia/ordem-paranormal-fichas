const fs = require('fs');
const file = 'src/screens/Ficha/index.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /if \(temGraduado40 && isInventarioLoaded\) \{/;

const insertion = `const temAgenteSecreto10 = (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 16 && (regras['nex_experiencia'] ? nivel >= 2 : effectiveNex >= 10));
    if (temAgenteSecreto10 && isInventarioLoaded) {
      const temDocumentos = itensHook.itensInventario.some((i) => i.item.Nome_Item === 'Documentos (Agente Secreto)');
      if (!temDocumentos) {
         itensHook.adicionarItem({
           Codigo_Item: 9998,
           Nome_Item: 'Documentos (Agente Secreto)',
           Categoria_Item: '0',
           Espacos_Itens: '0',
           Desc_Item: 'Fornecem privilégios jurídicos especiais, como acesso a locais restritos, permissão para portar armas de fogo e autoridade investigativa. Pessoas comuns não percebem que são falsos (se aplicável).',
           Grupo_Item: 'Itens Operacionais'
         });
      }
    }

    if (temGraduado40 && isInventarioLoaded) {`;

content = content.replace(regex, insertion);

fs.writeFileSync(file, content);
