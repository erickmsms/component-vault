"use client";

import { useId, type ReactNode } from "react";

/**
 * Colunas pela quantidade de itens. As classes precisam existir inteiras no
 * código: o Tailwind varre o texto dos arquivos, então `lg:grid-cols-${n}`
 * montado na hora não geraria nada.
 */
const COLUNAS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
  5: "sm:grid-cols-2 lg:grid-cols-3",
  6: "sm:grid-cols-2 lg:grid-cols-3",
};

export type ItemNumerado = { titulo: string; texto: ReactNode };

/**
 * Seção de destaques em cartões, cada um marcado por um número grande ("01",
 * "02"...) no lugar de ícones, com título e texto curto. As colunas se ajustam
 * à quantidade de itens; `alternada` troca os fundos para seções em sequência.
 */
export function GradeNumerada({
  titulo,
  itens,
  alternada = false,
}: {
  /** Título da seção. Sem ele, só a grade. */
  titulo?: ReactNode;
  itens: ItemNumerado[];
  /**
   * Troca os fundos: seção em `surface` e cartões em `page`. Use em seções
   * seguidas para elas se alternarem.
   */
  alternada?: boolean;
}) {
  const idTitulo = useId();
  return (
    <section
      aria-labelledby={titulo ? idTitulo : undefined}
      className={`w-full py-20 lg:py-28 ${alternada ? "bg-surface" : "bg-page"}`}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        {titulo && (
          <h2
            id={idTitulo}
            className="mb-12 max-w-3xl font-display text-4xl leading-[1.1] font-bold tracking-[-0.01em] sm:text-5xl lg:mb-16"
          >
            {titulo}
          </h2>
        )}

        <ul className={`grid gap-4 ${COLUNAS[itens.length] ?? COLUNAS[4]}`}>
          {itens.map((item, i) => (
            <li
              key={item.titulo}
              className={`flex flex-col rounded-3xl p-7 lg:p-8 ${alternada ? "bg-page" : "bg-surface"}`}
            >
              {/* O índice faz o papel de marcador, no lugar de um ícone */}
              <span aria-hidden className="font-display text-2xl leading-none text-accent lg:text-3xl">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-6 text-lg leading-snug font-medium text-ink">{item.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{item.texto}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
