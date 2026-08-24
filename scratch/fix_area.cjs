const fs = require('fs');
['src/components/ModalRituais.tsx', 'src/components/ModalRituaisExtra.tsx'].forEach(file => {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/<div className="text-xs"><span className="font-bold text-zinc-500">.*?rea: <\/span><span className="text-zinc-300">\{ritual\.Area_Ritual\?\.split\('\/'\)\[0\]\.trim\(\)\}<\/span><\/div>/g,
    `{ritual.Area_Ritual && ritual.Area_Ritual.trim() !== '-' && (
      <div className="text-xs"><span className="font-bold text-zinc-500">Área: </span><span className="text-zinc-300">{ritual.Area_Ritual.split('/')[0].trim()}</span></div>
    )}`);
  fs.writeFileSync(file, c);
});
console.log('done');
