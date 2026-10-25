"use client";

import { useEffect, useRef, useState } from "react";
import { CodeBlock } from "@/showcase/code-block";
import type { CodigoColorido } from "@/showcase/destacar";
import { exportThemeCss } from "@/themes/tokens";
import { themeName, useThemeSettings } from "./store";

/** O CSS do tema escolhido na vitrine, pronto para outro projeto (o mesmo do "Exportar" do editor). */
export function CurrentThemeCss() {
  const settings = useThemeSettings();
  const nome = themeName(settings);
  const code = exportThemeCss(settings.values, nome);
  const [colorido, setColorido] = useState<{ code: string; trechos: CodigoColorido | null }>();

  const raiz = useRef<HTMLDivElement>(null);

  // Este CSS só existe no navegador (vem do tema escolhido). O Shiki é importado aqui, sob demanda:
  // o bloco fica dentro de um <details> e só é colorido (e o Shiki só baixado) quando ele abre.
  // Até lá, e se falhar, o código aparece como texto puro.
  useEffect(() => {
    let cancelado = false;
    const detalhes = raiz.current?.closest("details");
    const colorir = () => {
      if (detalhes && !detalhes.open) return;
      import("@/showcase/destacar")
        .then((m) => m.destacar(code, "css"))
        .then((trechos) => !cancelado && setColorido({ code, trechos }));
    };
    colorir();
    detalhes?.addEventListener("toggle", colorir);
    return () => {
      cancelado = true;
      detalhes?.removeEventListener("toggle", colorir);
    };
  }, [code]);

  return (
    <div ref={raiz}>
      <CodeBlock
        title={`tema-${settings.importado ? "personalizado" : settings.preset}.css · ${nome}`}
        code={code}
        // Se o tema mudou e o novo destaque ainda não chegou, não mostra cores velhas em cima do código novo
        colorido={colorido?.code === code ? colorido.trechos : null}
      />
    </div>
  );
}
