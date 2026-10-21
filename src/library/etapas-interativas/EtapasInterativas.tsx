"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { CURVA_SUAVE, useEmTela, useSemMovimento } from "@/library/revelar/Movimento";

/** Curva com um leve passo além do fim: o marco "salta" ao aparecer. */
const CURVA_SALTO = "cubic-bezier(0.34, 1.56, 0.64, 1)";

/** Classes que dependem do fundo da seção (escritas por extenso para o Tailwind encontrar). */
const CORES = {
  page: { borda: "border-page", cartao: "bg-surface", rotulo: "bg-surface/95" },
  surface: { borda: "border-surface", cartao: "bg-page", rotulo: "bg-page/95" },
} as const;

export type EtapaInterativa = {
  titulo: string;
  /** Aparece no rótulo da etapa quando ela está aberta. */
  descricao: ReactNode;
  /** Imagem ou ilustração que ocupa o painel inteiro (use `size-full` ou `absolute inset-0`). Sem ela, o painel mostra o número da etapa. */
  midia?: ReactNode;
};

/**
 * Processo em etapas numa linha do tempo horizontal.
 *
 * Entrada (uma vez, ao aparecer na tela): a linha se desenha da esquerda para a
 * direita, cada marco numerado salta quando a linha chega nele e os painéis
 * sobem; no fim, a primeira etapa se abre. Depois disso, passar o mouse, focar
 * ou clicar numa etapa abre ela: o painel cresce, os outros se comprimem, e o
 * rótulo mostra a descrição.
 *
 * Abaixo de `lg` a linha continua horizontal, com rolagem lateral e painéis de
 * larguras iguais. Com "reduzir movimento", tudo aparece pronto, com a primeira
 * etapa aberta.
 */
export function EtapasInterativas({
  itens,
  alturaDoPainel = 440,
  crescimentoAberto = 2.8,
  duracaoDaLinha = 3000,
  fundo = "page",
  aoMudar,
}: {
  itens: EtapaInterativa[];
  /** Altura dos painéis: px (número) ou qualquer medida do CSS ("60vh", "28rem"). */
  alturaDoPainel?: number | string;
  /** Quantas vezes o painel aberto cresce em relação aos outros (`flex-grow`), a partir de telas largas. */
  crescimentoAberto?: number;
  /** Duração (ms) do desenho da linha na entrada. Os marcos e painéis acompanham. */
  duracaoDaLinha?: number;
  /**
   * Token do fundo onde o componente fica. A borda dos marcos usa essa cor para
   * abrir um vão na linha, e os painéis usam a outra superfície para contrastar.
   */
  fundo?: "page" | "surface";
  /** Chamada quando outra etapa é aberta, com o índice dela. */
  aoMudar?: (indice: number) => void;
}) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const semMovimento = useSemMovimento();
  const emTela = useEmTela(ref, { margem: "0px 0px -35% 0px" });
  const [escolhido, setEscolhido] = useState<number | null>(null);
  const [entradaConcluida, setEntradaConcluida] = useState(false);

  const entrou = semMovimento || emTela;
  // Até alguém escolher, a primeira etapa abre quando a entrada termina.
  const aberto = escolhido ?? (semMovimento || entradaConcluida ? 0 : null);

  useEffect(() => {
    if (!emTela || semMovimento || entradaConcluida) return;
    const espera = setTimeout(() => setEntradaConcluida(true), duracaoDaLinha);
    return () => clearTimeout(espera);
  }, [emTela, semMovimento, entradaConcluida, duracaoDaLinha]);

  const escolher = (i: number) => {
    if (i === aberto) return;
    setEscolhido(i);
    aoMudar?.(i);
  };

  const cores = CORES[fundo];
  const altura = typeof alturaDoPainel === "number" ? `${alturaDoPainel}px` : alturaDoPainel;
  const n = itens.length;

  return (
    // Abaixo de lg: rolagem lateral, sem barra visível (os botões em foco rolam até aparecer).
    <div
      ref={ref}
      className="w-full overflow-x-auto pb-4 [scrollbar-width:none] lg:overflow-visible [&::-webkit-scrollbar]:hidden"
    >
      <div
        className="relative min-w-[calc(var(--quantidade)*13rem)] lg:min-w-0"
        style={{ "--quantidade": n, "--altura-painel": altura } as CSSProperties}
      >
        {/* Linha na altura do centro dos marcos (size-10): trilho e traço que se desenha. */}
        <div aria-hidden="true" className="absolute inset-x-0 top-5 h-px bg-rule" />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-5 h-px origin-left bg-accent"
          style={{
            transform: `scaleX(${entrou ? 1 : 0})`,
            transition: semMovimento ? undefined : `transform ${duracaoDaLinha}ms linear`,
          }}
        />

        <ol className="flex gap-4 lg:gap-5">
          {itens.map((etapa, i) => {
            const estaAberta = aberto === i;
            // Instante em que o traço chega ao marco, que fica na borda esquerda da coluna i.
            const atraso = Math.round((duracaoDaLinha * i) / n);

            return (
              <li
                key={`${etapa.titulo}-${i}`}
                className="relative min-w-0 grow basis-0 lg:grow-(--crescimento)"
                style={
                  {
                    "--crescimento": estaAberta ? crescimentoAberto : 1,
                    transition: semMovimento ? undefined : `flex-grow 650ms ${CURVA_SUAVE}`,
                  } as CSSProperties
                }
                onMouseEnter={() => escolher(i)}
                onFocus={() => escolher(i)}
                // O clique em qualquer parte do painel abre a etapa (o botão do título também chega aqui).
                onClick={() => escolher(i)}
              >
                {/* Marco: o número fica sobre a linha; a borda na cor do fundo abre um vão nela. */}
                <span
                  aria-hidden="true"
                  className={`absolute top-0 left-0 z-10 grid size-10 place-items-center rounded-full border-4 font-display text-lg leading-none ${cores.borda} ${
                    estaAberta ? "bg-accent text-page" : `${cores.cartao} text-ink/45`
                  }`}
                  style={{
                    transform: entrou ? "scale(1)" : "scale(0)",
                    opacity: entrou ? 1 : 0,
                    transition: semMovimento
                      ? undefined
                      : `transform 400ms ${CURVA_SALTO} ${atraso}ms, opacity 300ms ease-out ${atraso}ms, background-color 500ms, color 500ms`,
                  }}
                >
                  {i + 1}
                </span>

                <div
                  className="pt-16"
                  style={{
                    transform: entrou ? "none" : "translateY(28px)",
                    opacity: entrou ? 1 : 0,
                    transition: semMovimento
                      ? undefined
                      : `transform 550ms ${CURVA_SUAVE} ${atraso + 80}ms, opacity 550ms ${CURVA_SUAVE} ${atraso + 80}ms`,
                  }}
                >
                  <div className={`relative h-(--altura-painel) overflow-hidden rounded-3xl ${cores.cartao}`}>
                    {etapa.midia ?? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 grid place-items-center font-display text-7xl text-ink/10"
                      >
                        {i + 1}
                      </span>
                    )}

                    {/* Rótulo: só o título quando comprimida; a descrição aparece na etapa aberta. */}
                    <div
                      className={`absolute inset-x-3 bottom-3 rounded-2xl p-4 backdrop-blur-sm lg:inset-x-4 lg:bottom-4 lg:p-5 ${cores.rotulo}`}
                    >
                      <h3>
                        <button
                          type="button"
                          aria-expanded={estaAberta}
                          aria-controls={`${id}-descricao-${i}`}
                          className="block w-full truncate text-left font-semibold text-ink outline-accent focus-visible:outline-2 focus-visible:outline-offset-4 lg:text-lg"
                        >
                          {etapa.titulo}
                        </button>
                      </h3>
                      <div
                        id={`${id}-descricao-${i}`}
                        inert={!estaAberta}
                        className={`grid ${semMovimento ? "" : "transition-all duration-500 ease-out"} ${
                          estaAberta ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="pt-2 text-sm leading-relaxed text-ink-2 lg:text-base">{etapa.descricao}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
