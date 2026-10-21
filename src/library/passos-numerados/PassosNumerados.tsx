"use client";

import { useId, type ReactNode } from "react";

/**
 * Colunas em telas largas: todos os passos numa linha até cinco; acima disso,
 * linhas de quatro. Classes inteiras de propósito: o Tailwind varre o texto dos
 * arquivos, então `lg:grid-cols-${n}` montado na hora não geraria nada.
 */
const COLUNAS: Record<number, string> = {
  1: "",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
  5: "sm:grid-cols-2 lg:grid-cols-5",
};

export type Passo = { titulo: string; texto: ReactNode };

/**
 * Passos numerados de um processo: discos com o número, ligados por um fio
 * horizontal em telas largas, cada um com título e texto curto.
 */
export function PassosNumerados({
  titulo,
  passos,
  alternada = false,
}: {
  /** Título da seção. Sem ele, só os passos. */
  titulo?: ReactNode;
  passos: Passo[];
  /** Fundo `surface` em vez de `page`, para alternar com a seção anterior. */
  alternada?: boolean;
}) {
  const idTitulo = useId();
  const porLinha = passos.length <= 5 ? passos.length : 4;

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

        <ol className={`grid gap-10 lg:gap-6 ${COLUNAS[porLinha] ?? COLUNAS[4]}`}>
          {passos.map((passo, i) => (
            <li key={passo.titulo} className="relative">
              {/* O fio começa depois do disco e vai até a coluna seguinte; some no
                  último passo de cada linha e quando as colunas empilham */}
              {i < passos.length - 1 && (i + 1) % porLinha !== 0 && (
                <span aria-hidden className="absolute top-5 right-0 left-14 hidden h-px bg-rule-strong lg:block" />
              )}
              <span
                aria-hidden
                className="relative grid size-10 place-items-center rounded-full bg-accent font-display text-lg leading-none text-page"
              >
                {i + 1}
              </span>
              <h3 className="mt-6 text-lg leading-snug font-medium text-ink">{passo.titulo}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-2">{passo.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
