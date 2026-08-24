import os
import re

files = [
  'src/screens/Ficha/ModalArmas.tsx',
  'src/screens/Ficha/ModalItens.tsx',
  'src/screens/Ficha/ModalItensAmaldicoados.tsx',
  'src/screens/Ficha/ModalMunicoes.tsx',
  'src/screens/Ficha/ModalProtecoes.tsx',
  'src/screens/Ficha/InventarioPanel.tsx'
]

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'CustomSelect' not in content:
        content = content.replace('import React', 'import { CustomSelect } from \'../../components/CustomSelect\';\nimport React')

    # Find all <select ...> ... </select> blocks
    # We will use regex to extract the value, onChange, and the options.
    pattern = re.compile(r'<select([^>]+)>(.*?)</select>', re.DOTALL)
    
    def repl(m):
        attrs = m.group(1)
        options_block = m.group(2)
        
        # extract value
        val_match = re.search(r'value=\{([^}]+)\}', attrs)
        value = val_match.group(1) if val_match else ''
        
        # extract onChange (it's usually e => setter(e.target.value))
        setter_match = re.search(r'onChange=\{\(e\) => ([^\(]+)\(e\.target\.value\)\}', attrs)
        setter = setter_match.group(1) if setter_match else ''
        
        # extract static options: <option value="X">Y</option>
        opts = []
        for opt_m in re.finditer(r'<option\s*value="([^"]+)">([^<]+)</option>', options_block):
            opts.append(f"{{ value: '{opt_m.group(1)}', label: '{opt_m.group(2)}' }}")
        
        # extract dynamic options: uniqueTipos.map(t => <option key={t} value={t}>{t}</option>)
        dynamic = None
        dyn_match = re.search(r'\{([a-zA-Z0-9_]+)\.map', options_block)
        if dyn_match:
            arr_name = dyn_match.group(1)
            # if arr_name is 'filtros', it's f.valor and f.label
            if arr_name == 'filtros':
                dynamic = f"...{arr_name}.map(f => ({{ value: String(f.valor), label: String(f.label) }}))"
            else:
                dynamic = f"...{arr_name}.map(t => ({{ value: String(t), label: String(t) }}))"
        
        opts_str = ", ".join(opts)
        
        final_options = f"[{opts_str}]"
        if dynamic:
            if opts_str:
                final_options = f"[{opts_str}, {dynamic}]"
            else:
                final_options = f"[{dynamic}]"
                
        return f'<CustomSelect value={{{value}}} onChange={{{setter}}} options={{{final_options}}} wrapperClassName="w-full" />'

    content = pattern.sub(repl, content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print('Done')
