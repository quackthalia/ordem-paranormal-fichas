import { useRef, useEffect, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CollapseProps {
  isOpen: boolean;
  children: ReactNode;
  className?: string;
  previewHeight?: string | number;
  duration?: string;
  timingFunction?: string;
}

export function Collapse({ 
  isOpen, 
  children, 
  className = '', 
  previewHeight,
  duration = '0.35s',
  timingFunction = 'cubic-bezier(0.16, 1, 0.3, 1)'
}: CollapseProps) {
  // Se tiver previewHeight (ex: textos parciais de armas/habilidades com botão "ler mais"), usa preview
  if (previewHeight !== undefined) {
    return (
      <CollapsePreview 
        isOpen={isOpen} 
        previewHeight={previewHeight} 
        className={className} 
        duration={duration} 
        timingFunction={timingFunction}
      >
        {children}
      </CollapsePreview>
    );
  }

  // Para painéis completos como Filtros: slide suave + fade sem cortar o texto em fatias
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: 'auto', 
            opacity: 1,
            transition: {
              height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.28, ease: 'easeOut' }
            },
            transitionEnd: { overflow: 'visible' }
          }}
          exit={{ 
            height: 0, 
            opacity: 0,
            overflow: 'hidden',
            transition: {
              height: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.18, ease: 'easeIn' }
            }
          }}
          className={className}
          style={{ overflow: 'hidden' }}
        >
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
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
  duration = '0.35s',
  timingFunction = 'cubic-bezier(0.16, 1, 0.3, 1)'
}: CollapseProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);
  const [isFullyOpen, setIsFullyOpen] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsFullyOpen(true), 380);
      return () => clearTimeout(timer);
    } else {
      setIsFullyOpen(false);
    }
  }, [isOpen]);

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
