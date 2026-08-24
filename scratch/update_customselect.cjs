const fs = require('fs');

const file = 'src/components/CustomSelect.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/options: \{ value: string; label: string \}\[\] \| string\[\];/, 
  `options: { value: string; label: string; disabled?: boolean; subtitle?: string }[] | string[];`);

c = c.replace(/const normalizedOptions = options\.map\(opt =>\s*typeof opt === 'string' \? \{ value: opt, label: opt \} : opt\s*\);/,
  `const normalizedOptions = options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );`);

c = c.replace(/<ul className="max-h-60 overflow-auto custom-scrollbar py-1 text-sm text-zinc-300">\s*\{normalizedOptions\.map\(\(opt\) => \([\s\S]*?<\/li>\s*\)\)\}\s*<\/ul>/, 
`<ul className="max-h-60 overflow-auto custom-scrollbar py-1 text-sm text-zinc-300">
          {normalizedOptions.map((opt) => (
            <li
              key={opt.value}
              onClick={(e) => {
                if (opt.disabled) {
                  e.stopPropagation();
                  return;
                }
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={\`relative py-2 px-3 transition-colors \${
                opt.disabled
                  ? 'opacity-60 cursor-not-allowed bg-zinc-900/50 text-zinc-500'
                  : 'cursor-pointer select-none hover:bg-green-600/20 hover:text-green-400'
              } \${
                value === opt.value ? 'bg-green-900/30 font-bold text-green-400' : ''
              }\`}
            >
              <div className="flex flex-col">
                <span className="block truncate">{opt.label}</span>
                {opt.subtitle && (
                  <span className="text-[10px] mt-0.5 whitespace-normal leading-tight text-red-400/80">
                    {opt.subtitle}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>`);

fs.writeFileSync(file, c);
console.log('done');
