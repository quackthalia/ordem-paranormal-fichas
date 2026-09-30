const fs = require('fs');

let c = fs.readFileSync('src/screens/Ficha/index.tsx', 'utf8');

const oldStr = `<div className="absolute top-0 left-0 md:left-4 z-10 flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-lg">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">NEX:</span>
        {regras['nex_experiencia'] ? (
          <div className="flex items-center w-16">
            <input
              type="number"
              onKeyDown={bloquearLetras}
              value={nex}
              onChange={(e) => setNex(Math.max(0, Math.min(99, Number(e.target.value))))}
              className="w-8 bg-transparent text-center text-sm font-bold text-zinc-100 outline-none"
            />
            <span className="text-sm font-bold text-zinc-500">%</span>
          </div>
        ) : (
          <div className="relative z-50 w-20">
            <CustomSelect
              value={(NEX_OPTIONS.includes(nex) ? nex : Math.max(5, Math.ceil(nex / 5) * 5)).toString()}
              onChange={(val) => setNex(Number(val))}
              options={NEX_OPTIONS.map(n => ({ value: n.toString(), label: n + '%' }))}
              hideIcon={true}
              wrapperClassName="w-full"
              className="w-full bg-transparent border-none text-center text-sm font-bold text-zinc-100 hover:text-green-400 p-0 focus:ring-0 cursor-pointer"
            />
          </div>
        )}
      </div>

      <div className="absolute top-0 right-0 md:right-4 z-10 flex flex-col items-end gap-1.5">
        <button 
          onClick={() => setOpcoesAbertas(!opcoesAbertas)}
          className="bg-zinc-900/80 border border-zinc-800 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all cursor-pointer"
          title="Opções de Atributos"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        </button>

        {opcoesAbertas && (
          <div className="bg-zinc-900/90 border border-zinc-800 px-3 py-2 rounded-lg flex flex-col items-end gap-1.5 shadow-lg shadow-black/50 transition-all">
            <label className="flex cursor-pointer items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
              <input
                type="checkbox"
                className="cursor-pointer accent-green-600"
                checked={regrasAtivasAtributos}
                onChange={(e) => setRegrasAtivasAtributos(e.target.checked)}
              />
              {regrasAtivasAtributos ? 'Regras Ativas' : 'Modo Livre'}
            </label>
            {regrasAtivasAtributos && (
              <span className={\`text-[10px] uppercase tracking-wider font-bold \${pontosRestantes > 0 ? 'text-green-500' : 'text-zinc-500'}\`}>
                Disponível: {pontosRestantes}
              </span>
            )}
          </div>
        )}
      </div>`;

const newStr = `<div className="absolute top-0 left-0 md:left-4 z-10 flex flex-col items-start gap-1.5">
        <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-lg shadow-lg shadow-black/20">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">NEX:</span>
          {regras['nex_experiencia'] ? (
            <div className="flex items-center w-16">
              <input
                type="number"
                onKeyDown={bloquearLetras}
                value={nex}
                onChange={(e) => setNex(Math.max(0, Math.min(99, Number(e.target.value))))}
                className="w-8 bg-transparent text-center text-sm font-bold text-zinc-100 outline-none"
              />
              <span className="text-sm font-bold text-zinc-500">%</span>
            </div>
          ) : (
            <div className="relative z-50 w-20">
              <CustomSelect
                value={(NEX_OPTIONS.includes(nex) ? nex : Math.max(5, Math.ceil(nex / 5) * 5)).toString()}
                onChange={(val) => setNex(Number(val))}
                options={NEX_OPTIONS.map(n => ({ value: n.toString(), label: n + '%' }))}
                hideIcon={true}
                wrapperClassName="w-full"
                className="w-full bg-transparent border-none text-center text-sm font-bold text-zinc-100 hover:text-green-400 p-0 focus:ring-0 cursor-pointer"
              />
            </div>
          )}
          <div className="w-px h-4 bg-zinc-800 mx-1"></div>
          <button 
            onClick={() => setOpcoesAbertas(!opcoesAbertas)}
            className={\`text-zinc-500 hover:text-zinc-300 transition-transform duration-300 \${opcoesAbertas ? 'rotate-90 text-zinc-200' : ''}\`}
            title="Opções de Atributos"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
        </div>

        <div className={\`overflow-hidden transition-all duration-300 ease-in-out \${opcoesAbertas ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}\`}>
          <div className="bg-zinc-900/95 border border-zinc-700/50 px-3 py-2 rounded-lg flex flex-col items-start gap-1.5 shadow-lg shadow-black/80 mt-1">
            <label className="flex cursor-pointer items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-400 font-bold hover:text-zinc-200 transition-colors">
              <input
                type="checkbox"
                className="cursor-pointer accent-green-600"
                checked={regrasAtivasAtributos}
                onChange={(e) => setRegrasAtivasAtributos(e.target.checked)}
              />
              {regrasAtivasAtributos ? 'Regras Ativas' : 'Modo Livre'}
            </label>
            {regrasAtivasAtributos && (
              <span className={\`text-[10px] uppercase tracking-wider font-bold \${pontosRestantes > 0 ? 'text-green-500' : 'text-zinc-500'}\`}>
                Disponível: {pontosRestantes}
              </span>
            )}
          </div>
        </div>
      </div>`;

if(c.includes(oldStr)) {
    c = c.replace(oldStr, newStr);
    fs.writeFileSync('src/screens/Ficha/index.tsx', c);
    console.log("Success index");
} else {
    console.log("index not match");
}
