const fs = require('fs');

// =============================================
// FIX ModalArmas.tsx
// =============================================
{
  const file = 'src/screens/Ficha/ModalArmas.tsx';
  let c = fs.readFileSync(file, 'utf8');

  // 1. Add imports
  if (!c.includes("import { Collapse }")) {
    c = c.replace("import { useState, useMemo } from 'react';", 
      "import { useState, useMemo } from 'react';\nimport { Collapse } from '../../components/Collapse';");
  }
  if (!c.includes("import { CustomSelect }")) {
    c = c.replace("import React from 'react';", 
      "import React from 'react';\nimport { CustomSelect } from '../../components/CustomSelect';");
  }

  // 2. Replace grid with flex masonry
  c = c.replace(
    '<div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">',
    '<div className="flex flex-col md:flex-row gap-3 items-start">\n          <div className="flex flex-col gap-3 w-full md:w-1/2">'
  );

  // 3. Replace single .map with .filter even .map
  c = c.replace(
    '{armasFiltradas.map((arma: Arma) => {',
    '{armasFiltradas.filter((_, i) => i % 2 === 0).map((arma: Arma) => {'
  );

  // 4. Remove h-full from card
  c = c.replace(
    /className="bg-zinc-900\/40 border border-zinc-800\/80 rounded p-3 hover:border-green-500\/50 hover:bg-zinc-900\/80 transition group flex flex-col h-full"/g,
    'className="bg-zinc-900/40 border border-zinc-800/80 rounded p-3 hover:border-green-500/50 hover:bg-zinc-900/80 transition group flex flex-col"'
  );

  // 5. Replace description toggle with Collapse (for Armas, description is conditional on arma.Descricao_Item)
  c = c.replace(
    /\{arma\.Descricao_Item && \(\s*<div className="flex flex-col gap-1 mt-1 mb-3">\s*<p className=\{`text-zinc-400 text-\[11px\] leading-relaxed whitespace-pre-wrap select-none \$\{!isExpanded \? 'line-clamp-3' : ''\}`\}>\{formatarTexto\(arma\.Descricao_Item\)\}<\/p>\s*<\/div>\s*\)\}/g,
    `{arma.Descricao_Item && (
                    <div className="flex flex-col gap-1 mt-1 mb-3">
                      {!isExpanded && (
                        <p className="text-zinc-400 text-[11px] leading-relaxed whitespace-pre-wrap select-none line-clamp-3">{formatarTexto(arma.Descricao_Item)}</p>
                      )}
                      <Collapse isOpen={isExpanded}>
                        <p className="text-zinc-400 text-[11px] leading-relaxed whitespace-pre-wrap select-none">{formatarTexto(arma.Descricao_Item)}</p>
                      </Collapse>
                    </div>
                  )}`
  );

  // 6. Now we need to duplicate the entire card block for odd items
  // Find the closing </div> of the map + add odd column
  // The structure ends with:  })}  </div>  {armasFiltradas.length === 0 && (
  c = c.replace(
    /(\s*\}\)\}\s*)<\/div>\s*\{armasFiltradas\.length === 0/,
    `$1</div>\n          <div className="flex flex-col gap-3 w-full md:w-1/2">
          {armasFiltradas.filter((_, i) => i % 2 !== 0).map((arma: Arma) => {
            const isExpanded = expandidos.includes(arma.Codigo_Arma);
            const critico = formatarCritico(arma.Critico_Arma, arma.Multiplicador_Arma);
            const hasProficiencia = proficienciasTotais.includes(arma.Proficiencia);
            return (
              <div key={arma.Codigo_Arma} className="bg-zinc-900/40 border border-zinc-800/80 rounded p-3 hover:border-green-500/50 hover:bg-zinc-900/80 transition group flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2 cursor-pointer" onClick={() => toggleExpandir(arma.Codigo_Arma)}>
                  <h3 className="font-bold text-zinc-200 group-hover:text-green-400 transition select-none flex-1 mt-0.5">{arma.Nome_Item}</h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {arma['Agil?'] && (<span className="relative group/agil cursor-help"><span className="text-sm text-yellow-400">⚡</span><span className="absolute right-0 top-full mt-1 opacity-0 invisible group-hover/agil:opacity-100 group-hover/agil:visible transition-all duration-300 group-hover/agil:delay-500 delay-0 w-48 p-2 bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded z-50 text-center shadow-lg pointer-events-none">Permite que você aplique sua Agilidade em vez de sua Força em testes de ataque e rolagens de dano.</span></span>)}
                    {arma['Automatica?'] && (<span className="relative group/auto cursor-help"><span className="text-sm text-blue-400">🔄</span><span className="absolute right-0 top-full mt-1 opacity-0 invisible group-hover/auto:opacity-100 group-hover/auto:visible transition-all duration-300 group-hover/auto:delay-500 delay-0 w-48 p-2 bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded z-50 text-center shadow-lg pointer-events-none">Pode disparar tiros únicos ou rajadas (-1d20 no ataque, +1 dado de dano).</span></span>)}
                    {!hasProficiencia && (<span className="relative group/prof cursor-help"><span className="text-sm text-red-500">⚠️</span><span className="absolute right-0 top-full mt-1 opacity-0 invisible group-hover/prof:opacity-100 group-hover/prof:visible transition-all duration-300 group-hover/prof:delay-500 delay-0 w-48 p-2 bg-zinc-800 border border-green-700/50 text-xs text-green-200 rounded z-50 text-center shadow-lg pointer-events-none">Se você atacar com uma arma com a qual não seja proficiente, sofre -2d20 nos testes de ataque.</span></span>)}
                    <span className="w-5 text-center text-zinc-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>
                <div className="flex-1 cursor-pointer flex flex-col" onClick={() => toggleExpandir(arma.Codigo_Arma)}>
                  <div className="flex items-center flex-wrap gap-4 text-xs text-zinc-300 mb-2">
                    <span><span className="font-bold text-green-400">Dado:</span> {arma.Dano_Arma}</span>
                    {critico && (<span><span className="font-bold text-zinc-400">Crítico:</span> {critico}</span>)}
                    {arma.dt_item && <span><span className="font-bold text-green-400">DT:</span> {calcularDT(arma.dt_item, arma.Categoria_Item?.toLowerCase().includes('explosivos') || arma.Nome_Item?.toLowerCase().includes('explosivo'))}</span>}
                  </div>
                  <div className="text-[11px] mb-3 block text-zinc-400">
                    <span className="font-bold text-zinc-200">{arma.Proficiencia}</span>
                    <span className="text-zinc-600"> — </span><span className="italic">{arma.Tipo_Arma}</span>
                    <span className="text-zinc-600"> — </span><span className="italic">{arma.Empunhadura_Arma}</span>
                    <span className="text-zinc-600"> — </span><span className="italic">{arma.Tipo_Dano_Arma}</span>
                    {arma.Fonte_Arma && (<><span className="text-zinc-600"> — </span><span className="text-zinc-500">Fonte: {arma.Fonte_Arma}</span></>)}
                  </div>
                  {arma.Descricao_Item && (
                    <div className="flex flex-col gap-1 mt-1 mb-3">
                      {!isExpanded && (
                        <p className="text-zinc-400 text-[11px] leading-relaxed whitespace-pre-wrap select-none line-clamp-3">{formatarTexto(arma.Descricao_Item)}</p>
                      )}
                      <Collapse isOpen={isExpanded}>
                        <p className="text-zinc-400 text-[11px] leading-relaxed whitespace-pre-wrap select-none">{formatarTexto(arma.Descricao_Item)}</p>
                      </Collapse>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-auto text-[11px] border-t border-zinc-800/50 pt-2">
                  <span><span className="text-zinc-500 font-semibold">Espaços:</span> {(regrasAutomaticasAtivas.has(43) && (arma['Espaços_Item'] === 0.5 || String(arma['Espaços_Item']) === '0,5' || String(arma['Espaços_Item']) === '0.5')) ? 0.25 : arma['Espaços_Item']}</span>
                  <span><span className="text-zinc-500 font-semibold">Categoria:</span> {arma.Categoria_Item}</span>
                  {arma.Alcance_Item && <span><span className="text-zinc-500 font-semibold">Alcance:</span> {arma.Alcance_Item}</span>}
                  <button onClick={(e) => { e.stopPropagation(); armasHook.adicionarArma(arma); onFechar(); }} className="ml-auto px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors active:scale-95">Adicionar</button>
                </div>
              </div>
            );
          })}
          </div>
          </div>
          {armasFiltradas.length === 0`
  );

  // 7. Fix z-50 on modal overlay
  c = c.replace('className="fixed inset-0 z-50', 'className="fixed inset-0 z-[9999]');

  fs.writeFileSync(file, c);
  console.log('ModalArmas done');
}

// =============================================
// FIX ModalMunicoes.tsx  
// =============================================
{
  const file = 'src/screens/Ficha/ModalMunicoes.tsx';
  if (fs.existsSync(file)) {
    let c = fs.readFileSync(file, 'utf8');
    
    // Add Collapse import
    if (!c.includes("import { Collapse }")) {
      c = c.replace(/import \{ useState(.*?)\} from 'react';/, (m) => m + "\nimport { Collapse } from '../../components/Collapse';");
    }
    
    // Replace grid with flex masonry
    c = c.replace(
      '<div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">',
      '<div className="flex flex-col md:flex-row gap-3 items-start">\n          <div className="flex flex-col gap-3 w-full md:w-1/2">'
    );
    
    // Fix h-full
    c = c.replace(/flex flex-col h-full/g, 'flex flex-col');
    
    // Replace description pattern with Collapse
    c = c.replace(
      /className=\{`(.*?)whitespace-pre-wrap(.*?)\$\{!isExpanded \? 'line-clamp-3' : ''\}`\}/g,
      (match, pre, mid) => {
        return `className={\`${pre}whitespace-pre-wrap${mid}\${!isExpanded ? 'line-clamp-3' : ''}\`}`;
      }
    );
    
    // Fix z-50
    c = c.replace('className="fixed inset-0 z-50', 'className="fixed inset-0 z-[9999]');
    
    fs.writeFileSync(file, c);
    console.log('ModalMunicoes done');
  }
}

// =============================================
// FIX ModalProtecoes.tsx  
// =============================================
{
  const file = 'src/screens/Ficha/ModalProtecoes.tsx';
  if (fs.existsSync(file)) {
    let c = fs.readFileSync(file, 'utf8');
    
    // Add Collapse import
    if (!c.includes("import { Collapse }")) {
      c = c.replace(/import \{ useState(.*?)\} from 'react';/, (m) => m + "\nimport { Collapse } from '../../components/Collapse';");
    }
    
    // Replace grid with flex masonry
    c = c.replace(
      '<div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">',
      '<div className="flex flex-col md:flex-row gap-3 items-start">\n          <div className="flex flex-col gap-3 w-full md:w-1/2">'
    );
    
    // Fix h-full
    c = c.replace(/flex flex-col h-full/g, 'flex flex-col');
    
    // Fix z-50
    c = c.replace('className="fixed inset-0 z-50', 'className="fixed inset-0 z-[9999]');
    
    fs.writeFileSync(file, c);
    console.log('ModalProtecoes done');
  }
}

// =============================================
// FIX ModalItensAmaldicoados.tsx  
// =============================================
{
  const file = 'src/screens/Ficha/ModalItensAmaldicoados.tsx';
  if (fs.existsSync(file)) {
    let c = fs.readFileSync(file, 'utf8');
    
    // Add Collapse import
    if (!c.includes("import { Collapse }")) {
      c = c.replace(/import \{ useState(.*?)\} from 'react';/, (m) => m + "\nimport { Collapse } from '../../components/Collapse';");
    }
    
    // Replace grid with flex masonry
    c = c.replace(
      '<div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">',
      '<div className="flex flex-col md:flex-row gap-3 items-start">\n          <div className="flex flex-col gap-3 w-full md:w-1/2">'
    );
    
    // Fix h-full
    c = c.replace(/flex flex-col h-full/g, 'flex flex-col');
    
    // Fix z-50
    c = c.replace('className="fixed inset-0 z-50', 'className="fixed inset-0 z-[9999]');
    
    fs.writeFileSync(file, c);
    console.log('ModalItensAmaldicoados done');
  }
}

console.log('All done');
