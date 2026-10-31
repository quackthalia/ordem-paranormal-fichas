import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string; disabled?: boolean; subtitle?: string }[] | string[];
  className?: string;
  wrapperClassName?: string;
  minDropdownWidth?: number;
  placeholder?: string;
  hideIcon?: boolean;
  align?: 'left' | 'center' | 'right';
  /** Renderiza a lista no document.body (evita ser cortada por containers com overflow-hidden) */
  portal?: boolean;
  unstyled?: boolean;
}

export function CustomSelect({ value, onChange, options, className = '', wrapperClassName = 'w-full', minDropdownWidth, placeholder, hideIcon = false, align, portal = true, unstyled = false }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top?: number; bottom?: number; left: number; width: number; openUp: boolean } | null>(null);

  const isCentered = align === 'center' || (!align && (hideIcon || className.includes('text-center')));
  const isRight = align === 'right' || (!align && className.includes('text-right'));
  const textAlignment = isCentered ? 'text-center' : isRight ? 'text-right' : 'text-left';

  // Fecha o dropdown se clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Posicionamento do dropdown em modo portal (abre para cima se não couber embaixo)
  useLayoutEffect(() => {
    if (!portal || !isOpen) return;
    const atualizar = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const alturaMax = 240 + 8;
      const espacoAbaixo = window.innerHeight - rect.bottom;
      const openUp = espacoAbaixo < alturaMax && rect.top > espacoAbaixo;

      const minW = minDropdownWidth ?? (isCentered ? 64 : 0);
      const finalWidth = Math.max(rect.width, minW);

      let left = rect.left;
      if (isCentered && finalWidth > rect.width) {
        left = rect.left - (finalWidth - rect.width) / 2;
      } else if (isRight && finalWidth > rect.width) {
        left = rect.right - finalWidth;
      }
      left = Math.max(8, Math.min(left, window.innerWidth - finalWidth - 8));

      setPos({
        top: openUp ? undefined : rect.bottom + 4,
        bottom: openUp ? window.innerHeight - rect.top + 4 : undefined,
        left,
        width: finalWidth,
        openUp,
      });
    };
    atualizar();
    window.addEventListener('scroll', atualizar, true);
    window.addEventListener('resize', atualizar);
    return () => {
      window.removeEventListener('scroll', atualizar, true);
      window.removeEventListener('resize', atualizar);
    };
  }, [portal, isOpen, isCentered, isRight, minDropdownWidth]);

  // Normaliza as opções para o formato {value, label}
  const normalizedOptions = options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value);

  const lista = (
    <ul 
      className={`max-h-60 overflow-y-auto py-1 text-sm text-zinc-300 ${textAlignment} ${
        isCentered ? '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden' : 'custom-scrollbar'
      }`}
    >
      {normalizedOptions.map((opt) => {
        const isSelected = value === opt.value;
        return (
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
            onPointerDown={(e) => {
              if (opt.disabled) return;
              e.preventDefault();
              onChange(opt.value);
              setIsOpen(false);
            }}
            className={`relative ${isCentered ? 'px-2 py-1.5' : 'px-3 py-2'} text-xs md:text-sm transition-colors ${
              opt.disabled
                ? 'opacity-50 cursor-not-allowed bg-zinc-900/50 text-zinc-500'
                : isSelected
                  ? isCentered
                    ? 'bg-zinc-800 text-green-400 font-bold'
                    : 'bg-zinc-800 text-white font-bold border-l-2 border-green-500'
                  : 'cursor-pointer select-none text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
            }`}
          >
            <div className={`w-full flex flex-col ${isCentered ? 'justify-center items-center text-center' : isRight ? 'justify-end items-end text-right' : 'justify-start items-start text-left'}`}>
              <span className={`block w-full ${isCentered ? 'text-center whitespace-nowrap' : isRight ? 'text-right truncate' : 'text-left truncate'}`}>{opt.label}</span>
              {opt.subtitle && (
                <span className="text-[10px] mt-0.5 whitespace-normal leading-tight text-red-400/80">
                  {opt.subtitle}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className={`relative ${textAlignment} ${wrapperClassName}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={unstyled 
          ? `flex w-full items-center ${hideIcon ? 'justify-center' : 'justify-between'} ${textAlignment} text-sm text-zinc-100 outline-none transition ${className}`
          : `flex w-full items-center ${hideIcon ? 'justify-center' : 'justify-between'} ${textAlignment} rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 outline-none hover:border-zinc-500 focus:border-green-600 transition ${className}`
        }
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

      {portal ? (
        typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && pos && (
              <motion.div
                key="custom-select-portal-menu"
                ref={dropdownRef}
                initial={{ opacity: 0, y: pos.openUp ? 6 : -6, scale: 0.98 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
                }}
                exit={{
                  opacity: 0,
                  y: pos.openUp ? 4 : -4,
                  scale: 0.98,
                  pointerEvents: 'none',
                  transition: { duration: 0.14, ease: 'easeIn' },
                }}
                style={{
                  position: 'fixed',
                  left: pos.left,
                  top: pos.top,
                  bottom: pos.bottom,
                  width: pos.width,
                  transformOrigin: pos.openUp ? 'bottom center' : 'top center',
                }}
                className="z-[1000] overflow-hidden rounded-lg border border-zinc-700/80 bg-zinc-900/95 backdrop-blur-md shadow-2xl shadow-black"
              >
                {lista}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )
      ) : (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="custom-select-inline-menu"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
              }}
              exit={{
                opacity: 0,
                y: -4,
                scale: 0.98,
                pointerEvents: 'none',
                transition: { duration: 0.14, ease: 'easeIn' },
              }}
              style={{ transformOrigin: 'top center' }}
              className={`absolute z-[100] mt-1.5 ${hideIcon ? 'w-full left-0' : 'w-full'} overflow-hidden rounded-lg border border-zinc-700/80 bg-zinc-900/95 backdrop-blur-md shadow-2xl shadow-black`}
            >
              {lista}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
