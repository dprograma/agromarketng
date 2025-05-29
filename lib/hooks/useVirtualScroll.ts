import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVirtualScrollProps {
    itemCount: number;
    itemHeight: number;
    overscan?: number;
}

export function useVirtualScroll({ itemCount, itemHeight, overscan = 3 }: UseVirtualScrollProps) {
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleScroll = useCallback(() => {
        if (containerRef.current) {
            setScrollTop(containerRef.current.scrollTop);
        }
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
        itemCount - 1,
        Math.floor((scrollTop + (containerRef.current?.clientHeight || 0)) / itemHeight) + overscan
    );

    const virtualItems = Array.from({ length: endIndex - startIndex + 1 }, (_, index) => ({
        index: startIndex + index,
        top: (startIndex + index) * itemHeight,
    }));

    const totalHeight = itemCount * itemHeight;

    return {
        virtualItems,
        totalHeight,
        containerRef,
    };
} 