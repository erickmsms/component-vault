"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";

const LARGURA_MAXIMA = 320;
const MARGEM = 8;
/** Abaixo disto de espaço livre na tela, o balão abre para cima. */
const ESPACO_MINIMO_ABAIXO = 240;

/**
 * Ícone "?" ao lado de um termo; abre uma explicação curta.
 *
 * Abre ao passar o mouse, ao focar com o teclado ou ao tocar, e fecha com Esc,
 * ao clicar fora, ao rolar a página ou ao sair. O balão tem posição fixa
 * (calculada ao abrir), então não é cortado por tabelas com rolagem.
 */
export function Dica({ texto, termo }: { texto: string; termo: string }) {
  const id = useId();
  const botao = useRef<HTMLButtonElement>(null);
  const [estilo, setEstilo] = useState<CSSProperties | null>(null);
  const aberta = estilo !== null;

  function abrir() {
    const caixa = botao.current?.getBoundingClientRect();
    if (!caixa) return;
    const largura = Math.min(LARGURA_MAXIMA, window.innerWidth - 2 * MARGEM);
    const centro = caixa.left + caixa.width / 2;
    const left = Math.min(Math.max(centro - largura / 2, MARGEM), window.innerWidth - largura - MARGEM);
    const cabeEmbaixo = window.innerHeight - caixa.bottom >= ESPACO_MINIMO_ABAIXO;
    setEstilo(
      cabeEmbaixo
        ? { left, width: largura, top: caixa.bottom + 8 }
        : { left, width: largura, bottom: window.innerHeight - caixa.top + 8 },
    );
  }

  useEffect(() => {
    if (!aberta) return;
    const fechar = () => setEstilo(null);
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar();
    };
    const aoTocarFora = (e: PointerEvent) => {
      if (!botao.current?.contains(e.target as Node)) fechar();
    };
    window.addEventListener("keydown", aoTeclar);
    window.addEventListener("pointerdown", aoTocarFora);
    window.addEventListener("scroll", fechar, true);
    window.addEventListener("resize", fechar);
    return () => {
      window.removeEventListener("keydown", aoTeclar);
      window.removeEventListener("pointerdown", aoTocarFora);
      window.removeEventListener("scroll", fechar, true);
      window.removeEventListener("resize", fechar);
    };
  }, [aberta]);

  return (
    <span className="relative inline-flex align-middle" onMouseEnter={abrir} onMouseLeave={() => setEstilo(null)}>
      <button
        ref={botao}
        type="button"
        aria-label={`Explicar: ${termo}`}
        aria-describedby={id}
        onClick={abrir}
        onFocus={abrir}
        onBlur={() => setEstilo(null)}
        className="relative inline-flex h-5 w-5 shrink-0 cursor-help items-center justify-center rounded-full text-muted outline-accent before:absolute before:-inset-3 before:content-[''] hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
        >
          <circle cx="8" cy="8" r="6.25" />
          <path d="M8 7.25v3.5" />
          <circle cx="8" cy="5" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      </button>
      <span
        id={id}
        role="tooltip"
        style={estilo ?? undefined}
        className={`${aberta ? "fixed" : "hidden"} z-50 rounded-lg border border-rule bg-page px-3.5 py-3 text-left text-sm leading-relaxed font-normal tracking-normal whitespace-normal text-ink normal-case shadow-flutuante`}
      >
        {texto}
      </span>
    </span>
  );
}

/** Um termo seguido do ícone de explicação; o ícone nunca fica sozinho numa linha. */
export function Termo({ dica, children }: { dica: string; children: string }) {
  const corte = children.lastIndexOf(" ") + 1;
  return (
    <>
      {children.slice(0, corte)}
      <span className="whitespace-nowrap">
        {children.slice(corte)}
        <span className="ml-1">
          <Dica texto={dica} termo={children} />
        </span>
      </span>
    </>
  );
}
