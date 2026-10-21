"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

const LARGURA_MAXIMA = 320;
/** Distância mínima entre o balão e a borda da tela. */
const MARGEM = 8;
/** Distância entre o ícone e o balão (a seta ocupa esse espaço). */
const DISTANCIA = 10;
/** A seta não chega mais perto que isto dos cantos do balão. */
const MARGEM_DA_SETA = 14;

type Lado = "baixo" | "cima" | "direita" | "esquerda";
/** Ordem de preferência: embaixo, em cima, à direita, à esquerda. */
const LADOS: Lado[] = ["baixo", "cima", "direita", "esquerda"];

const limitar = (valor: number, minimo: number, maximo: number) => Math.min(Math.max(valor, minimo), Math.max(minimo, maximo));

/**
 * Posiciona o balão (position: fixed) em relação ao ícone: mede o balão de verdade, escolhe o
 * primeiro lado em que ele cabe inteiro e o empurra para dentro da tela nos outros eixos. Se
 * não couber em nenhum lado, usa o lado com mais espaço e limita a altura (o texto rola).
 * Mexe direto no DOM: roda a cada rolagem, sem passar pelo estado do React.
 */
function posicionar(balao: HTMLElement, ancora: HTMLElement) {
  const c = ancora.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  balao.style.maxHeight = "";
  balao.style.width = `${Math.min(LARGURA_MAXIMA, vw - 2 * MARGEM)}px`;
  const largura = balao.offsetWidth;
  const altura = balao.offsetHeight;

  const livre: Record<Lado, number> = {
    baixo: vh - c.bottom - DISTANCIA - MARGEM,
    cima: c.top - DISTANCIA - MARGEM,
    direita: vw - c.right - DISTANCIA - MARGEM,
    esquerda: c.left - DISTANCIA - MARGEM,
  };
  const alturaDaTela = vh - 2 * MARGEM;
  // Nas laterais o balão tem que caber na altura da tela; em cima e embaixo, no espaço livre
  const cabe = (lado: Lado) =>
    lado === "baixo" || lado === "cima" ? livre[lado] >= altura : livre[lado] >= largura && altura <= alturaDaTela;
  const lado = LADOS.find(cabe) ?? (livre.baixo >= livre.cima ? "baixo" : "cima");

  // Sem lugar em lado nenhum: o balão ocupa o espaço que sobra e o texto rola dentro dele
  const alturaMaxima = lado === "baixo" || lado === "cima" ? Math.max(livre[lado], 80) : alturaDaTela;
  const alturaFinal = Math.min(altura, alturaMaxima);
  if (alturaFinal < altura) balao.style.maxHeight = `${alturaFinal}px`;

  let left: number;
  let top: number;
  let seta: number;
  if (lado === "baixo" || lado === "cima") {
    const centro = c.left + c.width / 2;
    left = limitar(centro - largura / 2, MARGEM, vw - largura - MARGEM);
    top = lado === "baixo" ? c.bottom + DISTANCIA : c.top - DISTANCIA - alturaFinal;
    seta = limitar(centro - left, MARGEM_DA_SETA, largura - MARGEM_DA_SETA);
  } else {
    const centro = c.top + c.height / 2;
    left = lado === "direita" ? c.right + DISTANCIA : c.left - DISTANCIA - largura;
    top = limitar(centro - alturaFinal / 2, MARGEM, vh - alturaFinal - MARGEM);
    seta = limitar(centro - top, MARGEM_DA_SETA, alturaFinal - MARGEM_DA_SETA);
  }

  balao.dataset.lado = lado;
  balao.style.left = `${left}px`;
  balao.style.top = `${top}px`;
  balao.style.setProperty("--seta", `${seta}px`);
  balao.style.visibility = "visible";
}

// A seta é um quadrado girado a 45° preso à borda do balão que fica de frente para o ícone
const SETA =
  "absolute size-2 rotate-45 border-rule bg-page " +
  "group-data-[lado=baixo]:-top-1 group-data-[lado=baixo]:left-(--seta) group-data-[lado=baixo]:-ml-1 group-data-[lado=baixo]:border-t group-data-[lado=baixo]:border-l " +
  "group-data-[lado=cima]:-bottom-1 group-data-[lado=cima]:left-(--seta) group-data-[lado=cima]:-ml-1 group-data-[lado=cima]:border-r group-data-[lado=cima]:border-b " +
  "group-data-[lado=direita]:-left-1 group-data-[lado=direita]:top-(--seta) group-data-[lado=direita]:-mt-1 group-data-[lado=direita]:border-b group-data-[lado=direita]:border-l " +
  "group-data-[lado=esquerda]:-right-1 group-data-[lado=esquerda]:top-(--seta) group-data-[lado=esquerda]:-mt-1 group-data-[lado=esquerda]:border-t group-data-[lado=esquerda]:border-r";

/**
 * Ícone "?" ao lado de um termo; abre uma explicação curta.
 *
 * Abre ao passar o mouse, ao focar com o teclado ou ao tocar, e fecha com Esc, ao clicar
 * fora, ao sair ou quando o ícone sai da tela. O balão mede a si mesmo e escolhe o lado em
 * que cabe (embaixo, em cima, à direita ou à esquerda), com uma seta apontando para o ícone,
 * e acompanha o ícone ao rolar a página. Fica num portal, então nenhum contêiner com
 * rolagem, `overflow` ou `transform` o corta ou o cobre.
 */
export function Dica({ texto, termo }: { texto: string; termo: string }) {
  const id = useId();
  const botao = useRef<HTMLButtonElement>(null);
  const balao = useRef<HTMLSpanElement | null>(null);
  // Onde o balão é montado: o elemento do tema mais próximo (para herdar as cores) ou o body
  const [alvo, setAlvo] = useState<Element | null>(null);
  const aberta = alvo !== null;

  function abrir() {
    if (botao.current) setAlvo(botao.current.closest("[data-theme]") ?? document.body);
  }
  const fechar = useCallback(() => setAlvo(null), []);

  // Posiciona assim que o balão entra na página (ainda invisível, para não piscar no lugar errado)
  const aoMontar = useCallback((el: HTMLSpanElement | null) => {
    balao.current = el;
    if (el && botao.current) posicionar(el, botao.current);
  }, []);

  useEffect(() => {
    if (!aberta) return;
    const reposicionar = () => {
      if (!balao.current || !botao.current) return;
      const c = botao.current.getBoundingClientRect();
      // Ícone fora da tela: não há para onde apontar
      if (c.bottom < 0 || c.top > window.innerHeight || c.right < 0 || c.left > window.innerWidth) fechar();
      else posicionar(balao.current, botao.current);
    };
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar();
    };
    const aoTocarFora = (e: PointerEvent) => {
      if (!botao.current?.contains(e.target as Node)) fechar();
    };
    window.addEventListener("keydown", aoTeclar);
    window.addEventListener("pointerdown", aoTocarFora);
    window.addEventListener("scroll", reposicionar, true);
    window.addEventListener("resize", reposicionar);
    return () => {
      window.removeEventListener("keydown", aoTeclar);
      window.removeEventListener("pointerdown", aoTocarFora);
      window.removeEventListener("scroll", reposicionar, true);
      window.removeEventListener("resize", reposicionar);
    };
  }, [aberta, fechar]);

  return (
    <span className="relative inline-flex align-middle" onMouseEnter={abrir} onMouseLeave={fechar}>
      <button
        ref={botao}
        type="button"
        aria-label={`Explicar: ${termo}`}
        aria-describedby={id}
        onClick={abrir}
        onFocus={abrir}
        onBlur={fechar}
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
      {/* O texto para leitores de tela fica sempre no lugar; o balão visível só existe aberto */}
      <span id={id} role="tooltip" className="sr-only">
        {texto}
      </span>
      {alvo &&
        createPortal(
          <span
            ref={aoMontar}
            aria-hidden="true"
            // Invisível até ser medido e posicionado (aoMontar)
            style={{ position: "fixed", top: 0, left: 0, visibility: "hidden" }}
            className="group pointer-events-none z-50 overflow-y-auto rounded-lg border border-rule bg-page px-3.5 py-3 text-left text-sm leading-relaxed font-normal tracking-normal whitespace-normal text-ink normal-case shadow-flutuante"
          >
            {texto}
            <span aria-hidden="true" className={SETA} />
          </span>,
          alvo,
        )}
    </span>
  );
}

/**
 * Um texto seguido do ícone de explicação, no fim dele (da frase, do termo ou do parágrafo).
 * O ícone fica colado à última palavra: quando o texto quebra em várias linhas ele acompanha
 * essa palavra e nunca aparece sozinho no começo de uma linha.
 */
export function Termo({
  dica,
  nome,
  children,
}: {
  /** O texto do balão. */
  dica: string;
  /** Nome curto para leitores de tela ("Explicar: NPS"). Padrão: o próprio texto. */
  nome?: string;
  children: string;
}) {
  const corte = children.lastIndexOf(" ") + 1;
  return (
    <>
      {children.slice(0, corte)}
      <span className="whitespace-nowrap">
        {children.slice(corte)}
        <span className="ml-1">
          <Dica texto={dica} termo={nome ?? children} />
        </span>
      </span>
    </>
  );
}
