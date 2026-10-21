import type { ReactNode } from "react";

/** Abertura de página: chapéu (linha acima), manchete e linha fina. */
export function Abertura({
  chapeu,
  titulo,
  linhaFina,
}: {
  /** Linha curta acima da manchete: data, categoria, contexto. */
  chapeu?: string;
  titulo: ReactNode;
  /** Frase abaixo da manchete que explica ou complementa. */
  linhaFina?: ReactNode;
}) {
  return (
    <section className="flex max-w-[57.5rem] flex-col gap-5">
      {chapeu && <p className="text-[13px] font-semibold tracking-[0.08em] text-accent uppercase">{chapeu}</p>}
      <h1 className="font-display text-4xl leading-[1.04] font-extrabold tracking-[-0.025em] sm:text-6xl">{titulo}</h1>
      {linhaFina && <p className="max-w-[47.5rem] text-lg leading-relaxed text-ink-2 sm:text-xl">{linhaFina}</p>}
    </section>
  );
}
