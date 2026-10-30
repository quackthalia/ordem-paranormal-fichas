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
  duration = '0.4s',
  timingFunction = 'cubic-bezier(0.16, 1, 0.3, 1)'
}: CollapseProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);
  const [isFullyOpen, setIsFullyOpen] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsFullyOpen(true), 420);
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

  return (
    <div
      className={`relative ${className}`}
      style={{
        maxHeight: isOpen ? `${height}px` : (previewHeight !== undefined ? previewHeight : '0px'),
        opacity: (isOpen || previewHeight !== undefined) ? 1 : 0,
        overflow: (isFullyOpen && isOpen) ? 'visible' : 'hidden',
        transition: `max-height ${duration} ${timingFunction}, opacity ${duration} ease-out`,
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
