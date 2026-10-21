import type { CSSProperties } from "react";

export type NumeroPrincipal = {
  /** Já formatado: "0,88 °C", "R$ 48 mil", "92%". */
  valor: string;
  /** Frase curta que explica o número. */
  texto: string;
};

/** Os números que resumem a página, grandes e lado a lado, com divisórias. Uma coluna por número em telas largas. */
export function NumerosPrincipais({
  itens,
  rotulo = "Números principais",
}: {
  itens: NumeroPrincipal[];
  /** Nome da região para leitores de tela. */
  rotulo?: string;
}) {
  return (
    <section
      aria-label={rotulo}
      style={{ "--colunas": itens.length } as CSSProperties}
      className="grid border-t-2 border-b border-rule-strong border-b-rule lg:grid-cols-[repeat(var(--colunas),minmax(0,1fr))]"
    >
      {itens.map((n) => (
        <div
          key={`${n.valor}-${n.texto}`}
          className="flex flex-col gap-2.5 border-t border-rule py-7 first:border-t-0 lg:border-t-0 lg:border-l lg:px-7 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0"
        >
          <span className="font-display text-6xl leading-none font-extrabold tracking-[-0.03em] md:text-7xl lg:text-5xl">
            {n.valor}
          </span>
          <span className="leading-relaxed text-ink-2">{n.texto}</span>
        </div>
      ))}
    </section>
  );
}
