import type { CSSProperties, ReactNode } from "react";

export type NumeroPrincipal = {
  /** Já formatado ("0,88 °C", "R$ 48 mil", "92%") ou um `<Contador>` para animar. */
  valor: ReactNode;
  /** Frase curta que explica o número. */
  texto: string;
};

/**
 * Os números que resumem a página, grandes e lado a lado. Uma coluna por número
 * em telas largas. `divisorias` desliga as linhas (layout solto, com espaço entre
 * as colunas) e `destaque` pinta os números na cor de destaque.
 */
export function NumerosPrincipais({
  itens,
  rotulo = "Números principais",
  divisorias = true,
  destaque = false,
}: {
  itens: NumeroPrincipal[];
  /** Nome da região para leitores de tela. */
  rotulo?: string;
  /** Linhas acima, abaixo e entre os números. */
  divisorias?: boolean;
  /** Números na cor de destaque. */
  destaque?: boolean;
}) {
  return (
    <section
      aria-label={rotulo}
      style={{ "--colunas": itens.length } as CSSProperties}
      className={`grid lg:grid-cols-[repeat(var(--colunas),minmax(0,1fr))] ${
        divisorias ? "border-t-2 border-b border-rule-strong border-b-rule" : "gap-10"
      }`}
    >
      {itens.map((n, i) => (
        <div
          key={`${i}-${n.texto}`}
          className={`flex flex-col gap-2.5 ${
            divisorias
              ? "border-t border-rule py-7 first:border-t-0 lg:border-t-0 lg:border-l lg:px-7 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0"
              : ""
          }`}
        >
          <span
            className={`font-display text-6xl leading-none font-extrabold tracking-[-0.03em] md:text-7xl lg:text-5xl ${
              destaque ? "text-accent" : ""
            }`}
          >
            {n.valor}
          </span>
          <span className="max-w-xs leading-relaxed text-ink-2">{n.texto}</span>
        </div>
      ))}
    </section>
  );
}
