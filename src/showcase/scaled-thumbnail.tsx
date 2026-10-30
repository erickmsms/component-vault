"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

const MARGEM = 12;
const LARGURA_MINIMA = 200;
const LARGURA_MAXIMA = 800;
const ESCALA_MAXIMA = 1.25;

/**
 * Miniatura de componentes pequenos: centraliza e ajusta a escala para o exemplo caber inteiro
 * no card, sem cortes. Testa algumas larguras de layout (de estreita a larga) e fica com a que
 * dá a maior escala, então listas e cartões altos abrem mais em vez de encolherem à toa.
 *
 * Com `largura` (seções e páginas), renderiza nessa largura fixa, como numa tela larga, porque
 * os breakpoints dependem da janela e não do card, e só reduz para caber.
 */
export function FitThumbnail({ largura, children }: { largura?: number; children: ReactNode }) {
  const caixa = useRef<HTMLDivElement>(null);
  const conteudo = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const box = caixa.current;
    const el = conteudo.current;
    if (!box || !el) return;

    const ajustar = () => {
      const livreL = box.clientWidth - MARGEM * 2;
      const livreA = box.clientHeight - MARGEM * 2;
      if (livreL <= 0 || livreA <= 0) return;

      el.style.transform = "none";
      el.style.width = "max-content";
      // Para cima: offsetWidth arredonda (451,3 vira 451) e o conteúdo que quebra linha quebraria
      const natural = largura ?? Math.min(Math.max(Math.ceil(el.getBoundingClientRect().width), LARGURA_MINIMA), LARGURA_MAXIMA);
      const limite = largura ?? LARGURA_MAXIMA;
      const maxima = largura ? 1 : ESCALA_MAXIMA;

      let melhor = { escala: 0, largura: natural };
      let topo = 0;
      for (let candidata = natural; candidata <= limite; candidata *= 1.2) {
        el.style.width = `${candidata}px`;
        const escala = Math.min(
          livreL / Math.max(candidata, el.scrollWidth),
          livreA / Math.max(el.offsetHeight, el.scrollHeight),
          maxima,
        );
        // Escalas quase iguais: fica com a mais larga, onde o texto trunca menos
        topo = Math.max(topo, escala);
        if (escala >= topo * 0.97) melhor = { escala, largura: candidata };
      }

      el.style.width = `${melhor.largura}px`;
      el.style.transform = `translate(-50%, -50%) scale(${melhor.escala})`;
      el.style.visibility = "visible";
    };

    ajustar();
    const observer = new ResizeObserver(ajustar);
    observer.observe(box);
    // Fontes do tema chegam depois da primeira pintura e mudam o tamanho do texto
    document.fonts.addEventListener("loadingdone", ajustar);
    return () => {
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", ajustar);
    };
  }, [largura]);

  return (
    <div ref={caixa} className="relative size-full">
      <div ref={conteudo} className="invisible absolute top-1/2 left-1/2 flex justify-center">
        {children}
      </div>
    </div>
  );
}
