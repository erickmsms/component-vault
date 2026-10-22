"use client";

import { useEffect, useRef } from "react";
import { assinarPonteiro, useMiniatura, useSemMovimento } from "@/library/revelar/Movimento";

/**
 * Título em que cada palavra fica mais leve conforme o mouse se aproxima (o efeito do
 * título da landing). Precisa de uma fonte variável, que aceite qualquer peso.
 *
 * Para não pesar: as caixas das palavras são medidas só ao carregar e no resize, cada palavra
 * reserva a largura que tem no peso base (mudar o peso não empurra as vizinhas) e a animação
 * roda num único requestAnimationFrame que para quando tudo assenta. Só reage a mouse; no toque
 * e com "reduzir movimento" o título fica parado no peso base.
 */
export function TituloVivo({
  linhas,
  pesoBase = 800,
  pesoPerto = 450,
  alcance = 320,
  className = "text-[clamp(44px,13vw,64px)] leading-[0.9] font-extrabold tracking-[-0.05em] text-ink md:text-[clamp(48px,6.5vw,104px)]",
}: {
  /** Uma linha por item; cada linha é quebrada em palavras pelos espaços. */
  linhas: string[];
  /** Peso das palavras longe do mouse. */
  pesoBase?: number;
  /** Peso de uma palavra com o mouse em cima. */
  pesoPerto?: number;
  /** Distância (px) a partir da qual o mouse deixa de afetar a palavra. */
  alcance?: number;
  /** Classes do h1 (substituem as padrão: tamanho, entrelinha, peso e cor). */
  className?: string;
}) {
  const palavras = useRef<(HTMLSpanElement | null)[]>([]);
  const semMovimento = useSemMovimento();
  const miniatura = useMiniatura();
  const titulo = useRef<HTMLHeadingElement>(null);
  const assinatura = linhas.join("\n");

  useEffect(() => {
    const h1 = titulo.current;
    if (semMovimento || !h1) return;
    const els = palavras.current.filter((el): el is HTMLSpanElement => el !== null);
    const atual = els.map(() => pesoBase);
    const alvo = els.map(() => pesoBase);
    let caixas: { x1: number; y1: number; x2: number; y2: number }[] = [];
    let quadro = 0;

    const medir = () => {
      for (const el of els) {
        el.style.fontVariationSettings = "";
        el.style.minWidth = "";
      }
      caixas = els.map((el) => {
        const c = el.getBoundingClientRect();
        el.style.minWidth = `${c.width}px`;
        return { x1: c.left + scrollX, y1: c.top + scrollY, x2: c.right + scrollX, y2: c.bottom + scrollY };
      });
      atual.fill(pesoBase);
      alvo.fill(pesoBase);
    };

    const passo = () => {
      let mexendo = false;
      els.forEach((el, i) => {
        const antes = Math.round(atual[i]);
        atual[i] += (alvo[i] - atual[i]) * 0.18;
        if (Math.abs(alvo[i] - atual[i]) < 0.5) atual[i] = alvo[i];
        else mexendo = true;
        const depois = Math.round(atual[i]);
        if (depois !== antes) el.style.fontVariationSettings = `"wght" ${depois}`;
      });
      quadro = mexendo ? requestAnimationFrame(passo) : 0;
    };
    const animar = () => {
      if (!quadro) quadro = requestAnimationFrame(passo);
    };

    const mover = (ponteiro: { x: number; y: number }) => {
      const px = ponteiro.x + scrollX;
      const py = ponteiro.y + scrollY;
      caixas.forEach((c, i) => {
        const dx = px - Math.max(c.x1, Math.min(px, c.x2));
        const dy = py - Math.max(c.y1, Math.min(py, c.y2));
        alvo[i] = pesoBase - (pesoBase - pesoPerto) * Math.max(0, 1 - Math.hypot(dx, dy) / alcance);
      });
      animar();
    };
    const sair = () => {
      alvo.fill(pesoBase);
      animar();
    };

    // Mede depois que a fonte carrega, senão as larguras saem da fonte reserva
    let vivo = true;
    document.fonts.ready.then(() => vivo && medir());
    window.addEventListener("resize", medir);
    const cancelar = assinarPonteiro(h1, miniatura, (p) => {
      if (!p) sair();
      else if (p.mouse) mover(p);
    });
    return () => {
      vivo = false;
      cancelAnimationFrame(quadro);
      window.removeEventListener("resize", medir);
      cancelar();
      for (const el of els) {
        el.style.fontVariationSettings = "";
        el.style.minWidth = "";
      }
    };
  }, [semMovimento, miniatura, pesoBase, pesoPerto, alcance, assinatura]);

  let i = 0;
  return (
    <h1 ref={titulo} className={className}>
      {linhas.map((linha, l) => (
        <span key={l} className="block">
          {linha
            .split(/\s+/)
            .filter(Boolean)
            .map((texto, p) => {
              const indice = i++;
              return (
                <span key={p}>
                  {p > 0 && " "}
                  <span
                    ref={(el) => {
                      palavras.current[indice] = el;
                    }}
                    className="inline-block"
                  >
                    {texto}
                  </span>
                </span>
              );
            })}
        </span>
      ))}
    </h1>
  );
}
