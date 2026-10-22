"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ProvedorDeMiniatura } from "@/library/revelar/Movimento";

/**
 * Miniatura de animação: liga o modo miniatura (efeitos de mouse e rolagem se mostram sozinhos)
 * e, com `repetir`, monta o exemplo de novo a cada tantos milissegundos, para animações de
 * entrada, que só tocam uma vez, voltarem a tocar.
 */
export function MiniaturaAnimada({ repetir, children }: { repetir?: number; children: ReactNode }) {
  const [vez, setVez] = useState(0);

  useEffect(() => {
    if (!repetir) return;
    const t = setInterval(() => setVez((v) => v + 1), repetir);
    return () => clearInterval(t);
  }, [repetir]);

  return (
    <ProvedorDeMiniatura>
      <div key={vez} className="contents">
        {children}
      </div>
    </ProvedorDeMiniatura>
  );
}
