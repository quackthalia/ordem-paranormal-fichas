import { useRef, useEffect, useState, type ReactNode } from 'react';

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
  duration = '0.25s',
  timingFunction = 'cubic-bezier(0.4, 0, 0.2, 1)'
}: CollapseProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);
  const [isFullyOpen, setIsFullyOpen] = useState(isOpen);
  const [localMaxHeight, setLocalMaxHeight] = useState<string | number>(
    isOpen ? 'none' : (previewHeight !== undefined ? previewHeight : '0px')
  );

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsFullyOpen(true), 300);
      return () => clearTimeout(timer);
    } else {
      setIsFullyOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!contentRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeight(entry.target.scrollHeight);
      }
    });
    resizeObserver.observe(contentRef.current);
    
    // Initial measure
    setHeight(contentRef.current.scrollHeight);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (localMaxHeight === 'none') return;
      setLocalMaxHeight(`${height}px`);
      const timer = setTimeout(() => {
        setLocalMaxHeight('none');
      }, 300);
      return () => clearTimeout(timer);
    } else {
      const currentHeight = contentRef.current?.scrollHeight || height;
      setLocalMaxHeight(`${currentHeight}px`);
      
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setLocalMaxHeight(previewHeight !== undefined ? previewHeight : '0px');
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isOpen, height, previewHeight]);

  return (
    <div
      className={`relative ${className}`}
      style={{
        maxHeight: localMaxHeight,
        opacity: (isOpen || previewHeight !== undefined) ? 1 : 0,
        overflow: (isFullyOpen && isOpen) ? 'visible' : 'hidden',
        transition: (isFullyOpen && isOpen) ? `max-height 0.01s linear, opacity ${duration} ${timingFunction}` : `max-height ${duration} ${timingFunction}, opacity ${duration} ${timingFunction}`,
        willChange: 'max-height, opacity'
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
