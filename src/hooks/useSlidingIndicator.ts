"use client";

import { useLayoutEffect, useRef, useState } from "react";

interface IndicatorStyle {
  left: number;
  width: number;
}

/**
 * Measures the position of the active item inside a horizontal row and
 * returns pixel coordinates for an absolutely-positioned "sliding pill"
 * indicator that glides between items on change, rather than each item
 * toggling its own background instantly.
 */
export function useSlidingIndicator(activeKey: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLElement | null>>({});
  const [style, setStyle] = useState<IndicatorStyle | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      const el = itemRefs.current[activeKey];
      if (!container || !el) return;
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setStyle({ left: elRect.left - containerRect.left, width: elRect.width });
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeKey]);

  const registerItem = (key: string) => (el: HTMLElement | null) => {
    itemRefs.current[key] = el;
  };

  return { containerRef, registerItem, style };
}
