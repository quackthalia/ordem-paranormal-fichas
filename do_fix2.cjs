const fs = require('fs');

let c = fs.readFileSync('src/screens/Ficha/PericiasTable.tsx', 'utf8');
const oldPericiasStr = `<div className="w-20 opacity-0 pointer-events-none"></div>
        <h3 className="font-display text-lg uppercase tracking-[0.2em] text-zinc-300 flex-1 text-center">
          Perícias
        </h3>
        <div className="flex items-center gap-2 w-20 justify-end">
          <button
            onClick={() => setMostrarOpcoes(!mostrarOpcoes)}
            className={\`rounded transition text-lg \${mostrarOpcoes ? 'bg-zinc-800 text-zinc-200 shadow-[0_0_10px_rgba(255,255,255,0.05)]' : 'bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'} border border-zinc-700/50 flex items-center justify-center w-9 h-9\`}
            title="Opções de Regras"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
          <button`;

const newPericiasStr = `<h3 className="font-display text-lg uppercase tracking-[0.2em] text-zinc-300 ml-4 flex-1 text-center">
          Perícias
        </h3>
        <button`;

const oldCollapse = `</button>
        </div>
      </div>
      <Collapse isOpen={mostrarOpcoes}>
        <div className="mb-2 flex flex-col rounded border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-xs shadow-lg shadow-black/50">
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-zinc-400">
              <input
                type="checkbox"
                className="cursor-pointer accent-green-600"
                checked={regrasAtivas}
                onChange={(e) => setRegrasAtivas(e.target.checked)}
              />
              {regrasAtivas ? 'Regras Ativas' : 'Modo Livre'}
            </label>
            {regrasAtivas && (
              <div className="flex gap-4 font-bold">
                <span className={limites.maxTreinadas - totais.totalTreinadasUsadas < 0 ? 'text-green-500' : 'text-emerald-400'}>
                  Treinar: {limites.maxTreinadas - totais.totalTreinadasUsadas}
                </span>
                <span className={limites.maxUpgrades - totais.totalUpgradesGastos < 0 ? 'text-green-500' : 'text-amber-400'}>
                  Upgrades: {limites.maxUpgrades - totais.totalUpgradesGastos}
                </span>
              </div>
            )}
          </div>
        </div>
      </Collapse>
      <Collapse isOpen={mostrarBonus}>`;

const newCollapse = `</button>
      </div>
      
      <div className="flex justify-end mb-2">
        <button 
          onClick={() => setMostrarOpcoes(!mostrarOpcoes)} 
          className={\`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all \${mostrarOpcoes ? 'text-green-500' : 'text-zinc-500 hover:text-zinc-300'}\`} 
          title="Regras e Limites"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={\`transition-transform duration-300 \${mostrarOpcoes ? 'rotate-90' : ''}\`}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg> 
          Limites
        </button>
      </div>

      <div className={\`overflow-hidden transition-all duration-300 ease-in-out \${mostrarOpcoes ? 'max-h-24 opacity-100 mb-2' : 'max-h-0 opacity-0 mb-0'}\`}>
        <div className="flex flex-col rounded border border-zinc-700/50 bg-zinc-900/95 px-3 py-2 text-xs shadow-lg shadow-black/80">
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors">
              <input
                type="checkbox"
                className="cursor-pointer accent-green-600"
                checked={regrasAtivas}
                onChange={(e) => setRegrasAtivas(e.target.checked)}
              />
              {regrasAtivas ? 'Regras Ativas' : 'Modo Livre'}
            </label>
            {regrasAtivas && (
              <div className="flex gap-4 font-bold">
                <span className={limites.maxTreinadas - totais.totalTreinadasUsadas < 0 ? 'text-green-500' : 'text-emerald-400'}>
                  Treinar: {limites.maxTreinadas - totais.totalTreinadasUsadas}
                </span>
                <span className={limites.maxUpgrades - totais.totalUpgradesGastos < 0 ? 'text-green-500' : 'text-amber-400'}>
                  Upgrades: {limites.maxUpgrades - totais.totalUpgradesGastos}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Collapse isOpen={mostrarBonus}>`;

if(c.includes(oldPericiasStr)) {
    c = c.replace(oldPericiasStr, newPericiasStr);
} else {
    console.log("pericias header not match");
}

if(c.includes(oldCollapse)) {
    c = c.replace(oldCollapse, newCollapse);
} else {
    console.log("collapse not match");
}

fs.writeFileSync('src/screens/Ficha/PericiasTable.tsx', c);
console.log("Success pericias table");
