import { useEffect, RefObject } from 'react';

export function useSmoothExpandScroll(isExpanded: boolean, elementRef: RefObject<HTMLElement>, durationMs: number = 300) {
  useEffect(() => {
    if (isExpanded && elementRef.current) {
      const scrollParent = elementRef.current.closest('.overflow-y-auto') as HTMLElement;
      if (!scrollParent) return;

      let start = Date.now();
      let lastHeight = scrollParent.scrollHeight;

      const tick = () => {
        const currentHeight = scrollParent.scrollHeight;
        const diff = currentHeight - lastHeight;
        
        if (diff > 0) {
          scrollParent.scrollTop += diff;
          lastHeight = currentHeight;
        }

        if (Date.now() - start < durationMs) {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
    }
  }, [isExpanded, elementRef, durationMs]);
}
