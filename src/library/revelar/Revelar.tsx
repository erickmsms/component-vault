"use client";

import { useRef, type ReactNode } from "react";
import { CURVA_SUAVE, useEmTela, useSemMovimento } from "./Movimento";

/**
 * Faz o conteúdo subir e aparecer quando entra na tela. Com "reduzir movimento"
 * (do sistema ou de um ProvedorDeMovimento), aparece direto, sem animação.
 */
export function Revelar({
  children,
  deslocamento = 32,
  atraso = 0,
  duracao = 800,
  margem = "0px 0px -15% 0px",
  className = "",
}: {
  children: ReactNode;
  /** Distância (px) de onde o conteúdo sobe. */
  deslocamento?: number;
  /** Espera (ms) antes de começar; útil para escalonar vários itens. */
  atraso?: number;
  /** Duração (ms) da animação. */
  duracao?: number;
  /** Margem do IntersectionObserver: o padrão espera o conteúdo entrar 15% na tela. */
  margem?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const semMovimento = useSemMovimento();
  const emTela = useEmTela(ref, { margem });
  const visivel = semMovimento || emTela;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visivel ? 1 : 0,
        transform: visivel ? "none" : `translateY(${deslocamento}px)`,
        transition: semMovimento
          ? undefined
          : `opacity ${duracao}ms ${CURVA_SUAVE} ${atraso}ms, transform ${duracao}ms ${CURVA_SUAVE} ${atraso}ms`,
      }}
    >
      {children}
    </div>
  );
}
