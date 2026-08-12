const fs = require('fs');

const path = 'src/screens/Ficha/index.tsx';
let content = fs.readFileSync(path, 'utf8');

// The `resistenciasExtras` in index.tsx is a local const array
// I can just append `...bonusVestimentas.resistenciasExtras`
if (!content.includes('...bonusVestimentas.resistenciasExtras')) {
    content = content.replace(
        "const { atributosFinais, status, regrasAutomaticasAtivas, defEquip, setDefEquip, defOutros, setDefOutros, protecoesHook, itensHook, periciasHook, rituaisHook, resistencias, setResistencias, poderesHook,",
        "const { atributosFinais, status, regrasAutomaticasAtivas, defEquip, setDefEquip, defOutros, setDefOutros, protecoesHook, itensHook, periciasHook, rituaisHook, resistencias, setResistencias, poderesHook, bonusVestimentas,"
    );

    content = content.replace(
        "const resistenciasExtras: string[] = [];",
        "const resistenciasExtras: string[] = [...(bonusVestimentas?.resistenciasExtras || [])];"
    );
}

fs.writeFileSync(path, content, 'utf8');
console.log('index.tsx updated successfully for resistencias');
