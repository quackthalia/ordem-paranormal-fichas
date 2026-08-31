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

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsFullyOpen(true), 300);
      return () => clearTimeout(timer);
    } else {
      setIsFullyOpen(false);
    }
  }, [isOpen]);

  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!contentRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!isOpenRef.current) return;
      for (const entry of entries) {
        setHeight(entry.target.scrollHeight);
      }
    });
    resizeObserver.observe(contentRef.current);
    
    // Initial measure
    setHeight(contentRef.current.scrollHeight);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      className={`relative ${className}`}
      style={{
        maxHeight: (isFullyOpen && isOpen) ? 'none' : (isOpen ? `${height}px` : (previewHeight !== undefined ? previewHeight : '0px')),
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
