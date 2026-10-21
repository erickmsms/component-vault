"use client";

import { useEffect, useId, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { useSemMovimento } from "@/library/revelar/Movimento";

export type ItemEmFoco = {
  titulo: string;
  /** Aparece abaixo do título quando o item está aceso. */
  descricao: ReactNode;
  /** Botão ou link mostrado abaixo da descrição do item aceso. Nos apagados, fica fora do alcance do teclado. */
  acao?: ReactNode;
};

/**
 * Pilha de títulos grandes em que só um fica aceso por vez: os outros ficam
 * apagados e recolhidos, e o aceso escurece e abre a descrição (e a ação, se
 * houver).
 *
 * Ao rolar, acende o item cujo centro está mais perto do centro da tela; mouse,
 * foco e clique também escolhem, para funcionar sem rolar. Com "reduzir
 * movimento", a rolagem não troca o item (só mouse, foco e clique) e as trocas
 * acontecem sem transição.
 */
export function ListaEmFoco({
  itens,
  alinhamento = "centro",
  ativoInicial = 0,
  aoMudar,
}: {
  itens: ItemEmFoco[];
  /** Alinhamento dos títulos e textos. */
  alinhamento?: "centro" | "esquerda";
  /** Índice do item aceso antes de qualquer rolagem ou interação. */
  ativoInicial?: number;
  /** Chamada quando outro item acende, com o índice dele. */
  aoMudar?: (indice: number) => void;
}) {
  const id = useId();
  const ref = useRef<HTMLUListElement>(null);
  const semMovimento = useSemMovimento();
  const [ativo, setAtivo] = useState(ativoInicial);

  // Avisa a troca depois que ela acontece, venha da rolagem ou da interação.
  // A ref guarda o último índice avisado, para não repetir o aviso.
  const avisado = useRef(ativoInicial);
  useEffect(() => {
    if (avisado.current === ativo) return;
    avisado.current = ativo;
    aoMudar?.(ativo);
  }, [ativo, aoMudar]);

  useEffect(() => {
    const lista = ref.current;
    if (semMovimento || !lista) return;

    let quadro = 0;
    // Um item por vez, sempre o mais perto do centro: com faixas fixas por
    // item, rolagens rápidas pulariam itens ou deixariam buracos sem nenhum aceso.
    const escolherPeloCentro = () => {
      quadro = 0;
      const altura = window.innerHeight;
      const caixa = lista.getBoundingClientRect();
      if (caixa.bottom < 0 || caixa.top > altura) return;
      const meio = altura / 2;
      let perto = 0;
      let menor = Infinity;
      Array.from(lista.children).forEach((item, i) => {
        const c = item.getBoundingClientRect();
        const distancia = Math.abs(c.top + c.height / 2 - meio);
        if (distancia < menor) {
          menor = distancia;
          perto = i;
        }
      });
      setAtivo(perto);
    };
    const agendar = () => {
      if (!quadro) quadro = requestAnimationFrame(escolherPeloCentro);
    };

    agendar();
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar);
    return () => {
      cancelAnimationFrame(quadro);
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
    };
  }, [semMovimento]);

  // Ao rolar com o mouse parado, o navegador avisa que o ponteiro "entrou" no
  // item que passou por baixo dele, e isso brigaria com a escolha pelo centro.
  // Por isso o mouse só escolhe quando o ponteiro se move de verdade.
  const ponteiro = useRef({ x: -1, y: -1 });
  const aoMoverPonteiro = (i: number, e: PointerEvent<HTMLLIElement>) => {
    if (e.pointerType !== "mouse") return;
    const { clientX: x, clientY: y } = e;
    if (ponteiro.current.x === x && ponteiro.current.y === y) return;
    ponteiro.current = { x, y };
    setAtivo(i);
  };

  const centro = alinhamento === "centro";
  const transicao = semMovimento ? "" : "transition-all duration-500 ease-out";

  return (
    <ul ref={ref} className={`w-full max-w-4xl ${centro ? "mx-auto text-center" : "text-left"}`}>
      {itens.map((item, i) => {
        const aceso = i === ativo;
        return (
          <li key={`${item.titulo}-${i}`} className="py-8 lg:py-12" onPointerMove={(e) => aoMoverPonteiro(i, e)}>
            <h3>
              <button
                type="button"
                aria-expanded={aceso}
                aria-controls={`${id}-item-${i}`}
                onClick={() => setAtivo(i)}
                onFocus={() => setAtivo(i)}
                className={`block w-full font-display text-4xl leading-[1.05] tracking-[-0.01em] outline-accent focus-visible:outline-2 focus-visible:outline-offset-4 sm:text-5xl lg:text-7xl ${
                  centro ? "text-center" : "text-left"
                } ${semMovimento ? "" : "transition-colors duration-500"} ${aceso ? "text-ink" : "text-ink/20 hover:text-ink/40"}`}
              >
                {item.titulo}
              </button>
            </h3>

            {/* Grade de uma linha que anima de 0fr a 1fr: a altura segue o conteúdo, sem max-height chutado.
                Recolhido, o trecho fica inerte: some do teclado e dos leitores de tela. */}
            <div
              id={`${id}-item-${i}`}
              inert={!aceso}
              className={`grid ${transicao} ${aceso ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden px-1 pb-1">
                <div className={`mt-5 max-w-xl leading-relaxed text-ink-2 lg:text-lg ${centro ? "mx-auto" : ""}`}>
                  {item.descricao}
                </div>
                {item.acao && <div className="mt-6">{item.acao}</div>}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
