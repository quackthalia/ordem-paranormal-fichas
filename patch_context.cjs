const fs = require('fs');
const file = 'src/context/RPGContext.tsx';
let content = fs.readFileSync(file, 'utf8');

const periciasGratisRegex = /if \(trilhasHook\.trilhaSelecionada && trilhasHook\.trilhaSelecionada\.nome_pericia\) \{\s*list\.push\(trilhasHook\.trilhaSelecionada\.nome_pericia\);\s*\}/;

const periciasGratisReplacement = `if (trilhasHook.trilhaSelecionada && trilhasHook.trilhaSelecionada.nome_pericia) {
      list.push(trilhasHook.trilhaSelecionada.nome_pericia);
    }
    if (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 16 && poderesExtras['agente_secreto_pericia']) {
      list.push(poderesExtras['agente_secreto_pericia']);
    }`;

content = content.replace(periciasGratisRegex, periciasGratisReplacement);

const jaTinhaRegex = /const jaTinhaPericiaTrilha = useMemo\(\(\) => \{\s*if \(\!trilhasHook\.trilhaSelecionada \|\| \!trilhasHook\.trilhaSelecionada\.nome_pericia\) return false;\s*return periciasGratisSemTrilha\.includes\(trilhasHook\.trilhaSelecionada\.nome_pericia\);\s*\}, \[periciasGratisSemTrilha, trilhasHook\.trilhaSelecionada\]\);/;

const jaTinhaReplacement = `const jaTinhaPericiaTrilha = useMemo(() => {
    if (!trilhasHook.trilhaSelecionada) return false;
    if (trilhasHook.trilhaSelecionada.Codigo_Trilha === 16 && poderesExtras['agente_secreto_pericia']) {
      return periciasGratisSemTrilha.includes(poderesExtras['agente_secreto_pericia']);
    }
    if (!trilhasHook.trilhaSelecionada.nome_pericia) return false;
    return periciasGratisSemTrilha.includes(trilhasHook.trilhaSelecionada.nome_pericia);
  }, [periciasGratisSemTrilha, trilhasHook.trilhaSelecionada, poderesExtras]);`;

content = content.replace(jaTinhaRegex, jaTinhaReplacement);

const combRegex = /\(\(\) => \{ const comb = \{\.\.\.bonusVestimentas\.pericias\}; Object\.keys\(bonusMaldicoes\.pericias \|\| \{\}\)\.forEach\(k => \{ comb\[k\] = \(comb\[k\] \|\| 0\) \+ bonusMaldicoes\.pericias\[k\]; \}\); return comb; \}\)\(\)/g;

const combReplacement = `(() => { 
      const comb = {...bonusVestimentas.pericias}; 
      Object.keys(bonusMaldicoes.pericias || {}).forEach(k => { 
        comb[k] = (comb[k] || 0) + bonusMaldicoes.pericias[k]; 
      }); 
      
      if (trilhasHook.trilhaSelecionada?.Codigo_Trilha === 16) {
         const periciaEscolhida = poderesExtras['agente_secreto_pericia'];
         if (periciaEscolhida) {
            const jaTinha = periciasGratisSemTrilha.includes(periciaEscolhida);
            if (jaTinha) {
               comb[periciaEscolhida] = (comb[periciaEscolhida] || 0) + 2;
            }
         }
         
         const temTrilha40 = (regras['nex_experiencia'] ? effectiveNivel >= 8 : effectiveNex >= 40);
         if (temTrilha40) {
            comb['Diplomacia'] = (comb['Diplomacia'] || 0) + 2;
            comb['Enganação'] = (comb['Enganação'] || 0) + 2;
         }
      }

      return comb; 
    })()`;

content = content.replace(combRegex, combReplacement);

fs.writeFileSync(file, content);
