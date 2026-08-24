const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Ensure import
  if (!content.includes('CustomSelect')) {
    if (content.includes("import { Collapse } from './Collapse';")) {
        content = content.replace("import { Collapse } from './Collapse';", "import { Collapse } from './Collapse';\nimport { CustomSelect } from './CustomSelect';");
    } else {
        content = content.replace("import { Collapse } from '../../components/Collapse';", "import { Collapse } from '../../components/Collapse';\nimport { CustomSelect } from '../../components/CustomSelect';");
    }
  }

  // 1. Replace <select> tags
  // ModalPoderOutraClasse.tsx
  if (filePath.endsWith('ModalPoderOutraClasse.tsx')) {
    content = content.replace(/<select[\s\S]*?onChange=\{\(e\) => \{[\s\S]*?const cod = Number\(e\.target\.value\);[\s\S]*?if \(cod\) \{[\s\S]*?const nomePericia = contextoPrereq\.nomesPericias\[cod\];[\s\S]*?setEscolhendoPericiaId\(null\);[\s\S]*?poderesHook\.escolherPoderExtra\(poder, undefined, nomePericia, 'extra_regra31'\);[\s\S]*?onClose\(\);[\s\S]*?\}[\s\S]*?\}\}[\s\S]*?defaultValue=""[\s\S]*?>[\s\S]*?<option value="" disabled>Escolher\.\.\.<\/option>[\s\S]*?\{periciasDisponiveis\.map\(p => \{[\s\S]*?const valPericia = verificarPreRequisitos\(poder as Poder, contextoPrereq, undefined, p\.id\);[\s\S]*?return \([\s\S]*?<option[\s\S]*?key=\{p\.id\}[\s\S]*?value=\{p\.id\}[\s\S]*?disabled=\{!valPericia\.atende\}[\s\S]*?style=\{\{ color: !valPericia\.atende \? '#52525b' : '#e4e4e7', backgroundColor: !valPericia\.atende \? '#18181b' : '#27272a' \}\}[\s\S]*?className=\{!valPericia\.atende \? "italic" : ""\}[\s\S]*?>[\s\S]*?\{p\.nome\}[\s\S]*?<\/option>[\s\S]*?\);[\s\S]*?\}\)\}[\s\S]*?<\/select>/g,
`<CustomSelect
  value=""
  onChange={(val) => {
    const cod = Number(val);
    if (cod) {
      const nomePericia = contextoPrereq.nomesPericias[cod];
      setEscolhendoPericiaId(null);
      poderesHook.escolherPoderExtra(poder, undefined, nomePericia, 'extra_regra31');
      onClose();
    }
  }}
  options={[
    { value: '', label: 'Escolher...' },
    ...periciasDisponiveis.map(p => {
      const valPericia = verificarPreRequisitos(poder as Poder, contextoPrereq, undefined, p.id);
      return {
        value: String(p.id),
        label: p.nome,
        disabled: !valPericia.atende
      };
    })
  ]}
  wrapperClassName="max-w-[120px]"
  className="bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 rounded px-1 py-1"
/>`);

    content = content.replace(/<div className="border-t border-zinc-800 px-5 py-4 text-left">[\s\S]*?<div className=\{`text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap \$\{isExpanded \? 'mb-4' : 'line-clamp-2'\}`\} dangerouslySetInnerHTML=\{\{ __html: formatarDescricao\(poder\.Descricao\) \}\} \/>[\s\S]*?<Collapse isOpen=\{isExpanded\}>[\s\S]*?\{poder\.PreRequisitos && \([\s\S]*?<div className="mt-4 p-2 rounded bg-amber-500\/10 text-xs italic text-amber-500 border border-amber-500\/20">Pré-requisitos: \{formatarTextoPreRequisitos\(poder\.PreRequisitos, contextoPrereq\.nomesPericias\)\}<\/div>[\s\S]*?\}[\s\S]*?\)[\s\S]*?<\/Collapse>[\s\S]*?<\/div>/g,
`<div className="border-t border-zinc-800 px-5 py-4 text-left">
  <Collapse isOpen={isExpanded} previewHeight="4.5em">
    <div className="text-xs text-zinc-400 mb-4 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatarDescricao(poder.Descricao) }} />
    {poder.PreRequisitos && (
      <div className="mt-4 p-2 rounded bg-amber-500/10 text-xs italic text-amber-500 border border-amber-500/20">Pré-requisitos: {formatarTextoPreRequisitos(poder.PreRequisitos, contextoPrereq.nomesPericias)}</div>
    )}
  </Collapse>
</div>`);
  }

  // ModalPoderOutraOrigem.tsx
  if (filePath.endsWith('ModalPoderOutraOrigem.tsx')) {
    content = content.replace(/<select[\s\S]*?onChange=\{\(e\) => \{[\s\S]*?const cod = Number\(e\.target\.value\);[\s\S]*?if \(cod && contextoPrereq\) \{[\s\S]*?const nomePericia = contextoPrereq\.nomesPericias\[cod\];[\s\S]*?setEscolhendoPericiaId\(null\);[\s\S]*?poderesHook\.escolherPoderExtra\([\s\S]*?\} as any, undefined, nomePericia, 'extra_regra32'\);[\s\S]*?onClose\(\);[\s\S]*?\}[\s\S]*?\}\}[\s\S]*?defaultValue=""[\s\S]*?>[\s\S]*?<option value="" disabled>Escolher\.\.\.<\/option>[\s\S]*?\{periciasDisponiveis\.map\(p => \([\s\S]*?<option key=\{p\.id\} value=\{p\.id\}>\{p\.nome\}<\/option>[\s\S]*?\)\}[\s\S]*?<\/select>/g,
`<CustomSelect
  value=""
  onChange={(val) => {
    const cod = Number(val);
    if (cod && contextoPrereq) {
      const nomePericia = contextoPrereq.nomesPericias[cod];
      setEscolhendoPericiaId(null);
      poderesHook.escolherPoderExtra({
        Id_Poder: -origem.Codigo_Origem,
        Codigo_Poder: -1,
        Nome: origem.Nome_Poder,
        Descricao: origem.Descricao_Poder,
        Fonte: origem.Fonte,
        Tipo: 'Geral',
        Codigo_Regra: origem.Codigo_Regra
      } as any, undefined, nomePericia, 'extra_regra32');
      onClose();
    }
  }}
  options={[
    { value: '', label: 'Escolher...' },
    ...periciasDisponiveis.map(p => ({
      value: String(p.id),
      label: p.nome
    }))
  ]}
  wrapperClassName="max-w-[120px]"
  className="bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 rounded px-1 py-1"
/>`);

    content = content.replace(/\{!isExpanded && \([\s\S]*?<div className="border-t border-zinc-800 px-5 py-4 text-left">[\s\S]*?<p className="line-clamp-2">[\s\S]*?<strong className="text-green-500">\{origem\.Nome_Poder\}\. <\/strong>[\s\S]*?<span className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML=\{\{ __html: formatarDescricao\(origem\.Descricao_Poder\) \}\} \/>[\s\S]*?<\/p>[\s\S]*?<\/div>[\s\S]*?\)[\s\S]*?\}[\s\S]*?<Collapse isOpen=\{isExpanded\}>[\s\S]*?<div className="border-t border-zinc-800 px-5 py-4 text-left">[\s\S]*?<p>[\s\S]*?<strong className="text-green-500">\{origem\.Nome_Poder\}\. <\/strong>[\s\S]*?<span className="text-xs text-zinc-400 mb-4 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML=\{\{ __html: formatarDescricao\(origem\.Descricao_Poder\) \}\} \/>[\s\S]*?<\/p>[\s\S]*?<\/div>[\s\S]*?<\/Collapse>/g,
`<div className="border-t border-zinc-800 px-5 py-4 text-left">
  <Collapse isOpen={isExpanded} previewHeight="4.5em">
    <p>
      <strong className="text-green-500">{origem.Nome_Poder}. </strong>
      <span className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatarDescricao(origem.Descricao_Poder) }} />
    </p>
  </Collapse>
</div>`);
  }

  // ModalPoderes.tsx
  if (filePath.endsWith('ModalPoderes.tsx')) {
    content = content.replace(/<select[\s\S]*?onChange=\{\(e\) => \{[\s\S]*?const cod = Number\(e\.target\.value\);[\s\S]*?if \(cod\) \{[\s\S]*?setEscolhendoPericia\(false\);[\s\S]*?onEscolher\(undefined, cod\);[\s\S]*?\}[\s\S]*?\}\}[\s\S]*?defaultValue=""[\s\S]*?>[\s\S]*?<option value="" disabled>Escolher\.\.\.<\/option>[\s\S]*?\{periciasDisponiveis\.map\(p => \{[\s\S]*?const valPericia = contextoPrereq \? verificarPreRequisitos\(poder as Poder, contextoPrereq, undefined, p\.id\) : \{ atende: true \};[\s\S]*?const isFocoEmPericia = \(poder as any\)\.Codigo_Regra === 42;[\s\S]*?const jaFocou = isFocoEmPericia && contextoPrereq \? Object\.values\(contextoPrereq\.poderes\)\.some\(pe => pe\.codigoRegra === 42 && pe\.periciaEscolhidaNome === p\.nome\) : false;[\s\S]*?const isDisabled = !valPericia\.atende \|\| jaFocou;[\s\S]*?return \([\s\S]*?<option[\s\S]*?key=\{p\.id\}[\s\S]*?value=\{p\.id\}[\s\S]*?disabled=\{isDisabled\}[\s\S]*?style=\{\{ color: isDisabled \? '#52525b' : '#e4e4e7', backgroundColor: isDisabled \? '#18181b' : '#27272a' \}\}[\s\S]*?className=\{isDisabled \? "italic" : ""\}[\s\S]*?>[\s\S]*?\{p\.nome\} \{jaFocou \? "\(Já Escolhido\)" : ""\}[\s\S]*?<\/option>[\s\S]*?\);[\s\S]*?\}\)\}[\s\S]*?<\/select>/g,
`<CustomSelect
  value=""
  onChange={(val) => {
    const cod = Number(val);
    if (cod) {
      setEscolhendoPericia(false);
      onEscolher(undefined, cod);
    }
  }}
  options={[
    { value: '', label: 'Escolher...' },
    ...periciasDisponiveis.map(p => {
      const valPericia = contextoPrereq ? verificarPreRequisitos(poder as Poder, contextoPrereq, undefined, p.id) : { atende: true };
      const isFocoEmPericia = (poder as any).Codigo_Regra === 42;
      const jaFocou = isFocoEmPericia && contextoPrereq ? Object.values(contextoPrereq.poderes).some(pe => pe.codigoRegra === 42 && pe.periciaEscolhidaNome === p.nome) : false;
      const isDisabled = !valPericia.atende || jaFocou;
      return {
        value: String(p.id),
        label: \`\${p.nome} \${jaFocou ? "(Já Escolhido)" : ""}\`.trim(),
        disabled: isDisabled
      };
    })
  ]}
  wrapperClassName="max-w-[120px]"
  className="bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 rounded px-1 py-1"
/>`);
  }

  // ModalPoderesExtra.tsx
  if (filePath.endsWith('ModalPoderesExtra.tsx')) {
    content = content.replace(/<select[\s\S]*?onChange=\{\(e\) => \{[\s\S]*?const cod = Number\(e\.target\.value\);[\s\S]*?if \(cod\) \{[\s\S]*?setEscolhendoPericiaId\(null\);[\s\S]*?onEscolher\(poder, undefined, cod\);[\s\S]*?onClose\(\);[\s\S]*?\}[\s\S]*?\}\}[\s\S]*?defaultValue=""[\s\S]*?>[\s\S]*?<option value="" disabled>Escolher\.\.\.<\/option>[\s\S]*?\{periciasDisponiveis\.map\(p => \{[\s\S]*?const valPericia = verificarPreRequisitos\(poder as Poder, contextoPrereq, undefined, p\.id\);[\s\S]*?const isFocoEmPericia = \(poder as any\)\.Codigo_Regra === 42;[\s\S]*?const jaFocou = isFocoEmPericia && contextoPrereq \? Object\.values\(contextoPrereq\.poderes\)\.some\(pe => pe\.codigoRegra === 42 && pe\.periciaEscolhidaNome === p\.nome\) : false;[\s\S]*?const isDisabled = !valPericia\.atende \|\| jaFocou;[\s\S]*?return \([\s\S]*?<option[\s\S]*?key=\{p\.id\}[\s\S]*?value=\{p\.id\}[\s\S]*?disabled=\{isDisabled\}[\s\S]*?style=\{\{ color: isDisabled \? '#52525b' : '#e4e4e7', backgroundColor: isDisabled \? '#18181b' : '#27272a' \}\}[\s\S]*?className=\{isDisabled \? "italic" : ""\}[\s\S]*?>[\s\S]*?\{p\.nome\} \{jaFocou \? "\(Já Escolhido\)" : ""\}[\s\S]*?<\/option>[\s\S]*?\);[\s\S]*?\}\)\}[\s\S]*?<\/select>/g,
`<CustomSelect
  value=""
  onChange={(val) => {
    const cod = Number(val);
    if (cod) {
      setEscolhendoPericiaId(null);
      onEscolher(poder, undefined, cod);
      onClose();
    }
  }}
  options={[
    { value: '', label: 'Escolher...' },
    ...periciasDisponiveis.map(p => {
      const valPericia = verificarPreRequisitos(poder as Poder, contextoPrereq, undefined, p.id);
      const isFocoEmPericia = (poder as any).Codigo_Regra === 42;
      const jaFocou = isFocoEmPericia && contextoPrereq ? Object.values(contextoPrereq.poderes).some(pe => pe.codigoRegra === 42 && pe.periciaEscolhidaNome === p.nome) : false;
      const isDisabled = !valPericia.atende || jaFocou;
      return {
        value: String(p.id),
        label: \`\${p.nome} \${jaFocou ? "(Já Escolhido)" : ""}\`.trim(),
        disabled: isDisabled
      };
    })
  ]}
  wrapperClassName="max-w-[120px]"
  className="bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 rounded px-1 py-1"
/>`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Processed', filePath);
}

const dir = 'src/components';
const files = [
  'ModalPoderOutraClasse.tsx',
  'ModalPoderOutraOrigem.tsx',
  'ModalPoderes.tsx',
  'ModalPoderesExtra.tsx'
];

files.forEach(file => {
  const fullPath = path.join(dir, file);
  if (fs.existsSync(fullPath)) {
    processFile(fullPath);
  }
});
