import type { ReactNode } from "react";

/**
 * Junta botões lado a lado (ou um sobre o outro) com as bordas coladas e só as pontas
 * arredondadas. Funciona melhor com `variante="contorno"` ou "secundario".
 */
export function GrupoDeBotoes({
  orientacao = "horizontal",
  rotulo,
  children,
}: {
  orientacao?: "horizontal" | "vertical";
  /** Nome do grupo para leitores de tela ("Formatação do texto"). */
  rotulo?: string;
  children: ReactNode;
}) {
  const classes =
    orientacao === "vertical"
      ? "inline-flex flex-col [&>*:not(:first-child)]:-mt-px [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none"
      : "inline-flex [&>*:not(:first-child)]:-ms-px [&>*:not(:first-child)]:rounded-s-none [&>*:not(:last-child)]:rounded-e-none";
  return (
    <div role="group" aria-label={rotulo} className={classes}>
      {children}
    </div>
  );
}
