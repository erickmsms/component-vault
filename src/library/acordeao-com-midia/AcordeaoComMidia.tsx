"use client";

import { useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useEmTela, useSemMovimento } from "@/library/revelar/Movimento";

/** O que a mídia de um item recebe quando é uma função. */
export type EstadoDaMidia = {
  /** Verdadeiro para a mídia do item aberto. */
  ativa: boolean;
  /** Verdadeiro enquanto o componente está na tela (ou perto dela). */
  emTela: boolean;
};

export type ItemDoAcordeao = {
  titulo: string;
  texto: ReactNode;
  /**
   * Conteúdo do painel de mídia quando o item está aberto: imagem, vídeo,
   * ilustração. Ocupa o painel inteiro (use `size-full` ou `absolute inset-0`).
   * Como função, recebe `{ ativa, emTela }`, por exemplo para tocar um
   * `VideoControlado` só quando ele aparece.
   */
  midia: ReactNode | ((estado: EstadoDaMidia) => ReactNode);
};

/**
 * Lista de itens de um lado e um painel de mídia do outro. Só um item fica
 * aberto: o que recebe o mouse, o foco do teclado ou o clique. A mídia troca
 * junto, cruzando a opacidade; todas ficam montadas, mas só a do item aberto
 * aparece.
 *
 * Em telas pequenas a mídia vem antes da lista, mais baixa (16:9), para não
 * empurrar o texto para fora da tela.
 */
export function AcordeaoComMidia({
  itens,
  ativoInicial = 0,
  proporcaoDaMidia = "4 / 3",
  ladoDaMidia = "direita",
  aoMudar,
}: {
  itens: ItemDoAcordeao[];
  /** Índice do item aberto no começo. */
  ativoInicial?: number;
  /** Proporção do painel de mídia a partir de telas largas (`aspect-ratio` do CSS: "4 / 3", "1", "16 / 9"). */
  proporcaoDaMidia?: string;
  /** De que lado da lista fica a mídia em telas largas. */
  ladoDaMidia?: "direita" | "esquerda";
  /** Chamada quando outro item é aberto, com o índice dele. */
  aoMudar?: (indice: number) => void;
}) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const semMovimento = useSemMovimento();
  // A margem adianta o gatilho: um vídeo tem tempo de carregar antes de aparecer.
  const emTela = useEmTela(ref, { margem: "300px 0px", umaVez: false });
  const [ativo, setAtivo] = useState(ativoInicial);

  const escolher = (i: number) => {
    if (i === ativo) return;
    setAtivo(i);
    aoMudar?.(i);
  };

  const transicao = semMovimento ? "" : "transition-all duration-500 ease-out";
  const midiaADireita = ladoDaMidia === "direita";

  return (
    <div
      ref={ref}
      className={`grid items-center gap-10 lg:gap-16 ${midiaADireita ? "lg:grid-cols-[1.15fr_0.85fr]" : "lg:grid-cols-[0.85fr_1.15fr]"}`}
    >
      {/* Painel único de mídia: uma camada por item, só a do aberto visível. */}
      <div
        className={`relative aspect-video overflow-hidden rounded-3xl bg-surface lg:aspect-(--proporcao) ${midiaADireita ? "lg:order-2" : ""}`}
        style={{ "--proporcao": proporcaoDaMidia } as CSSProperties}
      >
        {itens.map((item, i) => {
          const ativa = i === ativo;
          return (
            <div
              key={`${item.titulo}-${i}`}
              aria-hidden={!ativa}
              inert={!ativa}
              className={`absolute inset-0 ${transicao} ${ativa ? "opacity-100" : "opacity-0"}`}
            >
              {typeof item.midia === "function" ? item.midia({ ativa, emTela }) : item.midia}
            </div>
          );
        })}
      </div>

      <ul className={midiaADireita ? "lg:order-1" : ""}>
        {itens.map((item, i) => {
          const aberto = i === ativo;
          return (
            <li
              key={`${item.titulo}-${i}`}
              onMouseEnter={() => escolher(i)}
              className={i > 0 ? "border-t border-rule" : ""}
            >
              <h3>
                <button
                  type="button"
                  id={`${id}-titulo-${i}`}
                  aria-expanded={aberto}
                  aria-controls={`${id}-texto-${i}`}
                  onClick={() => escolher(i)}
                  onFocus={() => escolher(i)}
                  className={`block w-full py-5 text-left font-display text-xl font-semibold outline-accent focus-visible:outline-2 focus-visible:outline-offset-2 lg:py-6 lg:text-2xl ${semMovimento ? "" : "transition-colors duration-500"} ${aberto ? "text-ink" : "text-ink/35 hover:text-ink/60"}`}
                >
                  {item.titulo}
                </button>
              </h3>

              {/* Grade de uma linha que anima de 0fr a 1fr: a altura segue o texto, sem max-height chutado. */}
              <div
                id={`${id}-texto-${i}`}
                inert={!aberto}
                className={`grid ${transicao} ${aberto ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="overflow-hidden">
                  <div className="max-w-md pb-6 leading-relaxed text-ink-2">{item.texto}</div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
