import React, { useState, useRef, useEffect } from 'react';

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string; disabled?: boolean; subtitle?: string }[] | string[];
  className?: string;
  wrapperClassName?: string;
  placeholder?: string;
  hideIcon?: boolean;
}

export function CustomSelect({ value, onChange, options, className = '', wrapperClassName = 'w-full', placeholder, hideIcon = false }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown se clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Normaliza as opções para o formato {value, label}
  const normalizedOptions = options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value);

  return (
    <div className={`relative text-left ${wrapperClassName}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center ${hideIcon ? 'justify-center' : 'justify-between text-left'} rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 outline-none hover:border-zinc-500 focus:border-green-600 transition ${className}`}
      >
        <span className="block truncate">
          {selectedOption ? selectedOption.label : placeholder || 'Selecione...'}
        </span>
        {!hideIcon && (
          <span className="pointer-events-none ml-2 flex items-center">
            <svg className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </button>

      {/* Dropdown com animação */}
      <div 
        className={`absolute z-[100] mt-1 ${hideIcon ? 'w-full min-w-max left-1/2 -translate-x-1/2' : 'w-full'} overflow-hidden rounded-md border border-zinc-700/80 bg-zinc-900/95 backdrop-blur-xl shadow-xl shadow-black/50 transition-all duration-200 origin-top ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
      >
        <ul className="max-h-60 overflow-auto custom-scrollbar py-1 text-sm text-zinc-300">
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
              className={`relative py-2 px-3 transition-colors ${
                opt.disabled
                  ? 'opacity-60 cursor-not-allowed bg-zinc-900/50 text-zinc-500'
                  : 'cursor-pointer select-none hover:bg-green-600/20 hover:text-green-400'
              } ${
                value === opt.value ? 'bg-green-900/30 font-bold text-green-400' : ''
              }`}
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
        </ul>
      </div>
    </div>
  );
}
