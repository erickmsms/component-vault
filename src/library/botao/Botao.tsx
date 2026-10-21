"use client";

import type { ComponentPropsWithRef, ReactNode } from "react";
import { useSemMovimento } from "@/library/revelar/Movimento";
import { classesDeBotao, type TamanhoDeBotao, type VarianteDeBotao } from "./classesDeBotao";

function Girando() {
  const semMovimento = useSemMovimento();
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`size-4 ${semMovimento ? "" : "animate-spin"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
    >
      <path d="M21 12a9 9 0 1 1-6.2-8.56" />
    </svg>
  );
}

/**
 * Botão com variantes, tamanhos, ícone e estado de carregamento. Repassa as
 * props nativas do `<button>` (`onClick`, `form`, `aria-*`, `ref`...). Para um
 * link com cara de botão, use `classesDeBotao()`.
 */
export function Botao({
  variante = "secundaria",
  tamanho = "md",
  icone,
  carregando = false,
  bloco = false,
  type = "button",
  disabled,
  className = "",
  children,
  ...resto
}: {
  /** O que a ação é: `primaria` (uma por tela), `secundaria`, `perigo` (destrutiva), `fantasma` ou `contorno`. */
  variante?: VarianteDeBotao;
  /** `sm`, `md` e `lg` para texto; `icone` e `icone-sm` são quadrados, só com ícone (passe `aria-label`). */
  tamanho?: TamanhoDeBotao;
  /** Ícone antes do texto (SVG; sem classe de tamanho, fica com size-4). No carregamento, vira o spinner. */
  icone?: ReactNode;
  /** Ação em andamento: mostra o spinner, marca `aria-busy` e desabilita, para não haver clique duplo. */
  carregando?: boolean;
  /** Ocupa a largura do contêiner. */
  bloco?: boolean;
  /** Padrão "button": dentro de um `<form>`, o padrão do HTML ("submit") enviaria o formulário. */
  type?: "button" | "submit" | "reset";
  children?: ReactNode;
} & Omit<ComponentPropsWithRef<"button">, "type" | "children">) {
  return (
    <button
      type={type}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      className={classesDeBotao({ variante, tamanho, bloco, className })}
      {...resto}
    >
      {carregando ? <Girando /> : icone}
      {children}
    </button>
  );
}
