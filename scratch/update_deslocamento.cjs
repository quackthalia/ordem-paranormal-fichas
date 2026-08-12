const fs = require('fs');

const path = 'src/screens/Ficha/StatusPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Ensure `bonusVestimentas` is extracted
if (!content.includes('bonusVestimentas,')) {
    content = content.replace(
        "const { atributosFinais, status, regrasAutomaticasAtivas } = useRPG();",
        "const { atributosFinais, status, regrasAutomaticasAtivas, bonusVestimentas } = useRPG();"
    );
}

// 2. Add bonusVestimentas.deslocamento
if (!content.includes('bonusVestimentas.deslocamento')) {
    content = content.replace(
        "const bonusDesloc = (regrasAutomaticasAtivas.has(12) ? 3 : 0) + (regrasAutomaticasAtivas.has(22) ? 3 : 0) + (regrasAutomaticasAtivas.has(41) ? 3 : 0);",
        "const bonusDesloc = (regrasAutomaticasAtivas.has(12) ? 3 : 0) + (regrasAutomaticasAtivas.has(22) ? 3 : 0) + (regrasAutomaticasAtivas.has(41) ? 3 : 0) + (bonusVestimentas?.deslocamento || 0);"
    );
    
    content = content.replace(
        "const bonusDesloc = (regrasAutomaticasAtivas.has(12) ? 3 : 0) + (regrasAutomaticasAtivas.has(22) ? 3 : 0) + (regrasAutomaticasAtivas.has(41) ? 3 : 0);",
        "const bonusDesloc = (regrasAutomaticasAtivas.has(12) ? 3 : 0) + (regrasAutomaticasAtivas.has(22) ? 3 : 0) + (regrasAutomaticasAtivas.has(41) ? 3 : 0) + (bonusVestimentas?.deslocamento || 0);"
    );
    
    content = content.replace(
        "const bonusDesloc = (regrasAutomaticasAtivas.has(12) ? 3 : 0) + (regrasAutomaticasAtivas.has(22) ? 3 : 0) + (regrasAutomaticasAtivas.has(41) ? 3 : 0);",
        "const bonusDesloc = (regrasAutomaticasAtivas.has(12) ? 3 : 0) + (regrasAutomaticasAtivas.has(22) ? 3 : 0) + (regrasAutomaticasAtivas.has(41) ? 3 : 0) + (bonusVestimentas?.deslocamento || 0);"
    );
    
    content = content.replace(
        "const bonusDesloc = (regrasAutomaticasAtivas.has(12) ? 3 : 0) + (regrasAutomaticasAtivas.has(22) ? 3 : 0) + (regrasAutomaticasAtivas.has(41) ? 3 : 0);",
        "const bonusDesloc = (regrasAutomaticasAtivas.has(12) ? 3 : 0) + (regrasAutomaticasAtivas.has(22) ? 3 : 0) + (regrasAutomaticasAtivas.has(41) ? 3 : 0) + (bonusVestimentas?.deslocamento || 0);"
    );
}

fs.writeFileSync(path, content, 'utf8');
console.log('StatusPanel.tsx updated for deslocamento');
