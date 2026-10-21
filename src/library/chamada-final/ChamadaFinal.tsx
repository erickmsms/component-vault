"use client";

import { isValidElement, type ReactNode } from "react";
import { Revelar } from "@/library/revelar/Revelar";

/** Botão da chamada: vira <a> com `href` e <button> sem ele. */
export type AcaoDaChamada = {
  rotulo: string;
  href?: string;
  aoClicar?: () => void;
  /** Padrão: a primeira ação é "primaria" e as outras, "secundaria". */
  variante?: "primaria" | "secundaria";
  /** Abre o link em nova aba (com rel="noopener noreferrer"). */
  novaAba?: boolean;
};

/**
 * Pares de cores de cada tom, escolhidos para manter o contraste nos dois modos.
 * "escuro" usa `color-scheme: dark`: os tokens do tema são `light-dark()`, então
 * dentro do painel eles valem os valores do modo escuro, mesmo no modo claro.
 */
const TONS = {
  destaque: {
    painel: "bg-accent text-page",
    texto: "text-page/80",
    primaria: "bg-page text-ink hover:bg-page/90",
    secundaria: "border border-page/50 text-page hover:bg-page/10",
    foco: "outline-page",
  },
  escuro: {
    painel: "scheme-dark border border-rule bg-surface text-ink",
    texto: "text-ink-2",
    primaria: "bg-accent text-page hover:bg-accent/90",
    secundaria: "border border-ink/30 text-ink hover:bg-ink/10",
    foco: "outline-accent",
  },
  superficie: {
    painel: "bg-surface text-ink",
    texto: "text-ink-2",
    primaria: "bg-accent text-page hover:bg-accent/90",
    secundaria: "border border-rule-strong text-ink hover:bg-ink/5",
    foco: "outline-accent",
  },
} as const;

export type TomDaChamada = keyof typeof TONS;

const ehAcao = (x: unknown): x is AcaoDaChamada =>
  typeof x === "object" && x !== null && !isValidElement(x) && "rotulo" in x;

/**
 * Chamada final antes do rodapé: um painel largo, bem arredondado, com o convite
 * em letras grandes, um texto de apoio e até dois botões. Sobe e aparece ao
 * entrar na tela (sem animação com "reduzir movimento").
 */
export function ChamadaFinal({
  titulo,
  texto,
  acoes,
  tom = "destaque",
}: {
  titulo: ReactNode;
  texto?: ReactNode;
  /**
   * Botões abaixo do texto (pensado para até dois), ou um conteúdo próprio
   * (ReactNode) no lugar deles.
   */
  acoes?: AcaoDaChamada[] | ReactNode;
  /**
   * Cor do painel: "destaque" (cor de destaque do tema), "escuro" (escuro nos
   * dois modos) ou "superficie" (discreto, na cor de superfície).
   */
  tom?: TomDaChamada;
}) {
  const cores = TONS[tom];
  const lista = Array.isArray(acoes) && acoes.every(ehAcao) ? acoes : null;

  return (
    <section className="w-full">
      <Revelar deslocamento={40} duracao={900} margem="0px 0px -25% 0px">
        <div
          className={`mx-auto flex max-w-[100rem] flex-col items-center rounded-3xl px-6 py-20 text-center sm:px-12 lg:rounded-4xl lg:py-28 ${cores.painel}`}
        >
          <h2 className="max-w-3xl font-display text-4xl leading-[1.1] font-bold tracking-[-0.01em] sm:text-5xl">
            {titulo}
          </h2>

          {texto && <p className={`mt-6 max-w-2xl text-lg leading-relaxed ${cores.texto}`}>{texto}</p>}

          {lista
            ? lista.length > 0 && (
                <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
                  {lista.map((acao, i) => {
                    const variante = acao.variante ?? (i === 0 ? "primaria" : "secundaria");
                    const classes = `inline-flex h-12 cursor-pointer items-center justify-center rounded-2xl px-7 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${cores.foco} ${cores[variante]}`;
                    return acao.href ? (
                      <a
                        key={`${acao.rotulo}-${i}`}
                        href={acao.href}
                        onClick={acao.aoClicar}
                        className={classes}
                        {...(acao.novaAba ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        {acao.rotulo}
                      </a>
                    ) : (
                      <button key={`${acao.rotulo}-${i}`} type="button" onClick={acao.aoClicar} className={classes}>
                        {acao.rotulo}
                      </button>
                    );
                  })}
                </div>
              )
            : acoes != null && acoes !== false && <div className="mt-10">{acoes as ReactNode}</div>}
        </div>
      </Revelar>
    </section>
  );
}
