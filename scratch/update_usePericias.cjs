const fs = require('fs');

const path = 'src/hooks/usePericias.ts';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('bonusVestimentas?: Record<string, number>')) {
    content = content.replace(
        "origemSelecionada?: Origem | null",
        "origemSelecionada?: Origem | null,\n  bonusVestimentas?: Record<string, number>"
    );

    // Apply the bonus in the derivation. We need to find where `pericias` is exported or how it is accessed.
    // Wait, the pericias state holds { treino, outros }. The UI displays total = treino + outros + atributos.
    // If we add `bonusVestimentas` into `outros`, that works! But `outros` is user-editable.
    // It's better to export `bonusVestimentas` from `usePericias` and add it in `PericiasTable.tsx`, 
    // OR we can just inject `bonusVestimentas` into the `outros` programmatically? No, users edit `outros`.
    // Wait, let's see how `usePericias` handles `bonusRegra40`.
    // It exposes `bonusRegra40: Record<string, number>;` in `UsePericiasReturn`.
    // We can just expose `bonusVestimentas: Record<string, number>;` and the UI handles it.

    content = content.replace(
        "bonusRegra40: Record<string, number>;",
        "bonusRegra40: Record<string, number>;\n  bonusVestimentas: Record<string, number>;"
    );

    content = content.replace(
        "return {",
        "return {\n    bonusVestimentas: bonusVestimentas || {},"
    );

    fs.writeFileSync(path, content, 'utf8');
    console.log('usePericias.ts updated successfully');
}
