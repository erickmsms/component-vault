"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/**
 * Renderiza o conteúdo numa largura fixa, como numa tela larga, e reduz para
 * caber no card. Serve para seções e páginas, cujos breakpoints dependem da
 * largura da janela e não do card.
 */
export function ScaledThumbnail({ width, children }: { width: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / width));
    observer.observe(el);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div ref={ref} className="relative size-full">
      <div
        className="absolute top-0 left-0 origin-top-left p-8"
        style={{ width, transform: `scale(${scale})`, visibility: scale ? "visible" : "hidden" }}
      >
        {children}
      </div>
    </div>
  );
}
