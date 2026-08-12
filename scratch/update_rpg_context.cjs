const fs = require('fs');

const path = 'src/context/RPGContext.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Import calcularBonusVestimentas
if (!content.includes('calcularBonusVestimentas')) {
    content = content.replace(
        "import { useItensAmaldicoados } from '../hooks/useItensAmaldicoados';",
        "import { useItensAmaldicoados } from '../hooks/useItensAmaldicoados';\nimport { calcularBonusVestimentas, VestimentasBonus } from '../utils/vestimentasRules';"
    );
}

// 2. Add bonusVestimentas in RPGContextType
if (!content.includes('bonusVestimentas: VestimentasBonus')) {
    content = content.replace(
        "itensAmaldicoadosHook: ReturnType<typeof useItensAmaldicoados>;",
        "itensAmaldicoadosHook: ReturnType<typeof useItensAmaldicoados>;\n  bonusVestimentas: VestimentasBonus;"
    );
}

// 3. Compute bonusVestimentas in RPGProvider
if (!content.includes('const bonusVestimentas = useMemo')) {
    const calcStr = `
  const bonusVestimentas = useMemo(() => {
    return calcularBonusVestimentas(itensAmaldicoadosHook.itensAmaldicoadosInventario);
  }, [itensAmaldicoadosHook.itensAmaldicoadosInventario]);
`;
    content = content.replace(
        "const itensAmaldicoadosHook = useItensAmaldicoados();",
        "const itensAmaldicoadosHook = useItensAmaldicoados();\n" + calcStr
    );
}

// 4. Inject bonusPv and bonusPe into useStatus
if (!content.includes('bonusVestimentas.pv, bonusVestimentas.pe')) {
    content = content.replace(
        "regrasAtivas\n  );",
        "regrasAtivas,\n    bonusVestimentas.pv,\n    bonusVestimentas.pe\n  );"
    );
    // sometimes it's inline
    content = content.replace(
        "regrasAutomaticasAtivas);",
        "regrasAutomaticasAtivas, bonusVestimentas.pv, bonusVestimentas.pe);"
    );
}

// 5. Inject bonusVestimentas into usePericias
if (!content.includes('bonusVestimentas)')) {
    // let's see how usePericias is called:
    // const periciasHook = usePericias(classe, nex, atributos, regras['pericias_livres'] !== true, periciasGratis, origensHook.origemSelecionada?.Codigo_Regra, [], regrasAutomaticasAtivas, poderesHook.poderesEscolhidos, origensHook.origemSelecionada);
    content = content.replace(
        "origensHook.origemSelecionada);",
        "origensHook.origemSelecionada, bonusVestimentas.pericias);"
    );
}

// 6. Inject defesa from vestimentas into defesaTotal
if (!content.includes('bonusVestimentas.defesa')) {
    content = content.replace(
        "const defesaTotal = 10 + atributosFinais.AGI + defEquip + defOutros + totalDefesaProtecoes;",
        "const defesaTotal = 10 + atributosFinais.AGI + defEquip + defOutros + totalDefesaProtecoes + bonusVestimentas.defesa;"
    );
}

// 7. Add bonusVestimentas to the exported context value
if (!content.includes('bonusVestimentas,')) {
    content = content.replace(
        "itensAmaldicoadosHook, toggleVestimentaGeral, modificacoesHook,",
        "itensAmaldicoadosHook, toggleVestimentaGeral, modificacoesHook, bonusVestimentas,"
    );
}

fs.writeFileSync(path, content, 'utf8');
console.log('RPGContext.tsx updated successfully');
