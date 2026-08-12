const fs = require('fs');

const path = 'src/hooks/usePericias.ts';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove the mistake from `limites`
content = content.replace(
    "    return {\n    bonusVestimentas: bonusVestimentas || {},\n      ...lim,",
    "    return {\n      ...lim,"
);

// 2. Add bonusVestimentas logic to periciasComBonus
const novoPericiasComBonus = `
  const periciasComBonus = useMemo(() => {
    let novas = { ...pericias };
    
    // Regra 40
    if (Object.keys(bonusRegra40).length > 0) {
      Object.entries(bonusRegra40).forEach(([nome, bonus]) => {
        if (novas[nome]) {
          novas[nome] = {
            ...novas[nome],
            outros: (novas[nome].outros || 0) + bonus
          };
        }
      });
    }

    // Vestimentas
    if (bonusVestimentas && Object.keys(bonusVestimentas).length > 0) {
      Object.entries(bonusVestimentas).forEach(([nome, bonus]) => {
        if (novas[nome]) {
          novas[nome] = {
            ...novas[nome],
            outros: (novas[nome].outros || 0) + bonus
          };
        }
      });
    }

    return novas;
  }, [pericias, bonusRegra40, bonusVestimentas]);
`;

content = content.replace(
    /const periciasComBonus = useMemo\(\(\) => \{[\s\S]*?\}, \[pericias, bonusRegra40\]\);/,
    novoPericiasComBonus.trim()
);

// 3. Add to final return
if (!content.includes('bonusVestimentas,')) {
    content = content.replace(
        "bonusRegra40\n  };",
        "bonusRegra40,\n    bonusVestimentas: bonusVestimentas || {}\n  };"
    );
}

fs.writeFileSync(path, content, 'utf8');
console.log('usePericias.ts fixed and updated successfully');
