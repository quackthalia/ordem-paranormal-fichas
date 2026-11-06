import { useRef, useEffect, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CollapseProps {
  isOpen: boolean;
  children: ReactNode;
  className?: string;
  previewHeight?: string | number;
  duration?: string | number;
  timingFunction?: string;
}

function parseDurationSeconds(d?: string | number, fallback = 0.48): number {
  if (typeof d === 'number') return d;
  if (!d) return fallback;
  const num = parseFloat(d);
  if (isNaN(num)) return fallback;
  if (typeof d === 'string' && d.includes('ms')) return num / 1000;
  return num;
}

export function Collapse({ 
  isOpen, 
  children, 
  className = '', 
  previewHeight,
  duration = '0.48s',
  timingFunction = 'cubic-bezier(0.4, 0, 0.2, 1)'
}: CollapseProps) {
  const dSec = parseDurationSeconds(duration, 0.48);

  // Se tiver previewHeight (ex: textos parciais de armas/habilidades com botão "ler mais"), usa preview
  if (previewHeight !== undefined) {
    return (
      <CollapsePreview 
        isOpen={isOpen} 
        previewHeight={previewHeight} 
        className={className} 
        duration={typeof duration === 'number' ? `${duration}s` : duration} 
        timingFunction={timingFunction}
      >
        {children}
      </CollapsePreview>
    );
  }

  // Animação suave e fluida estritamente contida (overflow hidden constante para evitar sobreposição de elementos)
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: 'auto', 
            opacity: 1,
            transition: {
              height: { duration: dSec, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: dSec * 0.85, ease: 'easeOut' }
            }
          }}
          exit={{ 
            height: 0, 
            opacity: 0,
            transition: {
              height: { duration: dSec * 0.75, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: dSec * 0.5, ease: 'easeIn' }
            }
          }}
          className={`overflow-hidden ${className}`}
          style={{ overflow: 'hidden' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CollapsePreview({
  isOpen,
  children,
  className = '',
  previewHeight,
  duration = '0.48s',
  timingFunction = 'cubic-bezier(0.4, 0, 0.2, 1)'
}: CollapseProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);
  const [isFullyOpen, setIsFullyOpen] = useState(isOpen);
  const dSec = parseDurationSeconds(duration, 0.48);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsFullyOpen(true), Math.round(dSec * 1000 + 30));
      return () => clearTimeout(timer);
    } else {
      setIsFullyOpen(false);
    }
  }, [isOpen, dSec]);

  useEffect(() => {
    if (!contentRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      if (contentRef.current) {
        setHeight(contentRef.current.scrollHeight);
      }
    });
    resizeObserver.observe(contentRef.current);
    setHeight(contentRef.current.scrollHeight);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      className={`relative ${className}`}
      style={{
        maxHeight: isOpen ? `${height}px` : (previewHeight !== undefined ? previewHeight : '0px'),
        opacity: 1,
        overflow: (isFullyOpen && isOpen) ? 'visible' : 'hidden',
        transition: `max-height ${duration} ${timingFunction}`,
        willChange: 'max-height'
      }}
    >
      <div ref={contentRef} style={{ display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
      {previewHeight !== undefined && !isOpen && (
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-zinc-900/80 to-transparent pointer-events-none" />
      )}
    </div>
  );
}
