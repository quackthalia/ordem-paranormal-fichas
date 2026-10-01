const fs = require('fs');

// 1. Fix encoding in usePericias.ts
let cHook = fs.readFileSync('src/hooks/usePericias.ts', 'utf8');
cHook = cHook.replace(/Profiss\uFFFDo/g, 'Profissão');
fs.writeFileSync('src/hooks/usePericias.ts', cHook);

// 2. Add validation to PericiasTable.tsx
let cTable = fs.readFileSync('src/screens/Ficha/PericiasTable.tsx', 'utf8');
const oldSelect = `onChange={val => setProfissoes(prev => prev.map((p, i) => i === idx ? { ...p, treino: Number(val) } : p))}`;

const newSelect = `onChange={val => {
                                      const novoValor = Number(val);
                                      if (regrasAtivas) {
                                        if (novoValor === 10 && rpg.status.nivel < 7) return;
                                        if (novoValor === 15 && rpg.status.nivel < 14) return;
                                        
                                        const currentTreino = prof.treino;
                                        let simTreinadas = totais.totalTreinadasUsadas;
                                        let simUpgrades = totais.totalUpgradesGastos;
                                        
                                        if (currentTreino >= 5) simTreinadas -= 1;
                                        if (currentTreino === 10) simUpgrades -= 1;
                                        if (currentTreino === 15) simUpgrades -= 2;
                                        
                                        if (novoValor >= 5) simTreinadas += 1;
                                        if (novoValor === 10) simUpgrades += 1;
                                        if (novoValor === 15) simUpgrades += 2;
                                        
                                        if (simTreinadas > limites.maxTreinadas) return;
                                        if (simUpgrades > limites.maxUpgrades) return;
                                      }
                                      setProfissoes(prev => prev.map((p, i) => i === idx ? { ...p, treino: novoValor } : p));
                                    }}`;

cTable = cTable.replace(oldSelect, newSelect);

// wait, we need to access `rpg.status.nivel` which means we need `useRPG()` or `status`.
// In PericiasTable, we already have `const { periciasHook, regrasAtivas, ... } = useRPG();`
// We need `status`! Let's just import `status` from `useRPG()`.
// Wait, is `status` already destructured? Let's check `PericiasTable.tsx`.
