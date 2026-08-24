const fs = require('fs');

function fixFile(file) {
  let c = fs.readFileSync(file, 'utf8');

  // Replace each line. We use more tolerant regexes in case of line breaks or formatting.
  
  c = c.replace(/<div className="text-xs"><span className="font-bold text-zinc-500">Execu..o: <\/span><span className="text-zinc-300">\{ritual\.Execucao_Ritual\?\.split\('\/'\)\[0\]\.trim\(\)\}<\/span><\/div>/g, 
    `{ritual.Execucao_Ritual && ritual.Execucao_Ritual.trim() !== '-' && (
      <div className="text-xs"><span className="font-bold text-zinc-500">Execução: </span><span className="text-zinc-300">{ritual.Execucao_Ritual.split('/')[0].trim()}</span></div>
    )}`);

  c = c.replace(/<div className="text-xs"><span className="font-bold text-zinc-500">Alcance: <\/span><span className="text-zinc-300">\{ritual\.Alcance_Ritual\?\.split\('\/'\)\[0\]\.trim\(\)\}<\/span><\/div>/g, 
    `{ritual.Alcance_Ritual && ritual.Alcance_Ritual.trim() !== '-' && (
      <div className="text-xs"><span className="font-bold text-zinc-500">Alcance: </span><span className="text-zinc-300">{ritual.Alcance_Ritual.split('/')[0].trim()}</span></div>
    )}`);

  c = c.replace(/<div className="text-xs"><span className="font-bold text-zinc-500">..rea: <\/span><span className="text-zinc-300">\{ritual\.Area_Ritual\?\.split\('\/'\)\[0\]\.trim\(\)\}<\/span><\/div>/g, 
    `{ritual.Area_Ritual && ritual.Area_Ritual.trim() !== '-' && (
      <div className="text-xs"><span className="font-bold text-zinc-500">Área: </span><span className="text-zinc-300">{ritual.Area_Ritual.split('/')[0].trim()}</span></div>
    )}`);

  c = c.replace(/<div className="text-xs"><span className="font-bold text-zinc-500">Alvo: <\/span><span className="text-zinc-300">\{ritual\.Alvo_Ritual\?\.split\('\/'\)\[0\]\.trim\(\)\}<\/span><\/div>/g, 
    `{ritual.Alvo_Ritual && ritual.Alvo_Ritual.trim() !== '-' && (
      <div className="text-xs"><span className="font-bold text-zinc-500">Alvo: </span><span className="text-zinc-300">{ritual.Alvo_Ritual.split('/')[0].trim()}</span></div>
    )}`);

  c = c.replace(/<div className="text-xs"><span className="font-bold text-zinc-500">Dura..o: <\/span><span className="text-zinc-300">\{ritual\.Duracao_Ritual\?\.split\('\/'\)\[0\]\.trim\(\)\}<\/span><\/div>/g, 
    `{ritual.Duracao_Ritual && ritual.Duracao_Ritual.trim() !== '-' && (
      <div className="text-xs"><span className="font-bold text-zinc-500">Duração: </span><span className="text-zinc-300">{ritual.Duracao_Ritual.split('/')[0].trim()}</span></div>
    )}`);

  c = c.replace(/\{ritual\.Efeito_Ritual && <div className="text-xs"><span className="font-bold text-zinc-500\">Efeito: <\/span><span className="text-zinc-300">\{ritual\.Efeito_Ritual\.split\('\/'\)\[0\]\.trim\(\)\}<\/span><\/div>\}/g, 
    `{ritual.Efeito_Ritual && ritual.Efeito_Ritual.trim() !== '-' && (
      <div className="text-xs"><span className="font-bold text-zinc-500">Efeito: </span><span className="text-zinc-300">{ritual.Efeito_Ritual.split('/')[0].trim()}</span></div>
    )}`);

  c = c.replace(/<div className="text-xs"><span className="font-bold text-zinc-500">Resist.ncia: <\/span><span className="text-zinc-300">\{ritual\.Resistencia_Ritual\?\.split\('\/'\)\[0\]\.trim\(\)\}<\/span><\/div>/g, 
    `{ritual.Resistencia_Ritual && ritual.Resistencia_Ritual.trim() !== '-' && (
      <div className="text-xs"><span className="font-bold text-zinc-500">Resistência: </span><span className="text-zinc-300">{ritual.Resistencia_Ritual.split('/')[0].trim()}</span></div>
    )}`);

  fs.writeFileSync(file, c);
}

fixFile('src/components/ModalRituais.tsx');
fixFile('src/components/ModalRituaisExtra.tsx');

console.log('done');
