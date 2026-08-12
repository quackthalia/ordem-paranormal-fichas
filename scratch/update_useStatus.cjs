const fs = require('fs');

const path = 'src/hooks/useStatus.ts';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('bonusPv: number = 0')) {
    content = content.replace(
        "regrasAtivas?: Set<number>",
        "regrasAtivas?: Set<number>,\n  bonusPv: number = 0,\n  bonusPe: number = 0"
    );

    content = content.replace(
        "const calcMaxPv = baseStatus.pvMax;",
        "const calcMaxPv = baseStatus.pvMax + bonusPv;"
    );

    content = content.replace(
        "const calcMaxPe = baseStatus.peMax;",
        "const calcMaxPe = baseStatus.peMax + bonusPe;"
    );

    fs.writeFileSync(path, content, 'utf8');
    console.log('useStatus.ts updated successfully');
}
