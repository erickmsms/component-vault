"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { useSemMovimento } from "@/library/revelar/Movimento";

const limitar = (n: number) => Math.min(Math.max(n, 0), 1);
/** Saída suave: o cartão recua rápido no começo da cobertura e assenta no fim. */
const suavizar = (t: number) => 1 - (1 - t) ** 2;
const medida = (v: number | string) => (typeof v === "number" ? `${v}px` : v);

export type CartaoDaPilha = {
  titulo: string;
  descricao: ReactNode;
  /** Imagem ou ilustração: coluna à direita em telas largas, faixa no topo nas pequenas. Ocupa a área inteira (use `size-full` ou `absolute inset-0`). */
  midia?: ReactNode;
  /** Botão ou link no pé do texto do cartão. */
  acao?: ReactNode;
};

/**
 * Cartões que se empilham ao rolar: cada um gruda no topo da tela, o seguinte
 * sobe por cima, e o de baixo recua (encolhe, desce um pouco e perde opacidade),
 * ficando como uma camada atrás da pilha. O texto viaja junto com o cartão.
 *
 * Os cartões ficam no fluxo normal com `position: sticky`; um listener de
 * rolagem (um cálculo por quadro) mede quanto o próximo cartão já cobriu cada
 * um e aplica o recuo. Abaixo de `lg`, ou com "reduzir movimento", vira uma
 * lista vertical simples.
 */
export function PilhaDeCartoes({
  itens,
  topo = 96,
  degrau = 0,
  alturaDoCartao = "max(46vh, 22rem)",
  escalaAoSair = 0.95,
  opacidadeAoSair = 0.35,
  deslocamentoAoSair = 45,
}: {
  itens: CartaoDaPilha[];
  /** Distância do topo da tela em que os cartões grudam: px (número) ou medida do CSS ("6rem", "10vh"). */
  topo?: number | string;
  /** Px a mais no topo de cada cartão em relação ao anterior. 0 empilha todos no mesmo lugar. */
  degrau?: number;
  /** Altura de cada cartão em telas largas: px (número) ou medida do CSS. */
  alturaDoCartao?: number | string;
  /** Escala do cartão já coberto (1 = não encolhe). */
  escalaAoSair?: number;
  /** Opacidade do cartão já coberto. */
  opacidadeAoSair?: number;
  /** Quanto (px) o cartão já coberto desce. */
  deslocamentoAoSair?: number;
}) {
  const ref = useRef<HTMLUListElement>(null);
  const semMovimento = useSemMovimento();
  const empilhar = !semMovimento && itens.length > 1;

  useEffect(() => {
    const lista = ref.current;
    if (!empilhar || !lista) return;
    const lis = Array.from(lista.children) as HTMLElement[];
    // O recuo vai no cartão de dentro: o <li> grudado fica sem transformação e serve de régua.
    const cartoes = lis.map((li) => li.firstElementChild as HTMLElement | null);

    const limpar = () => {
      cartoes.forEach((cartao) => {
        cartao?.style.removeProperty("transform");
        cartao?.style.removeProperty("opacity");
        cartao?.style.removeProperty("will-change");
      });
    };

    let quadro = 0;
    const atualizar = () => {
      quadro = 0;
      // Abaixo de lg os cartões não grudam: lista simples, sem recuo.
      if (getComputedStyle(lis[0]).position !== "sticky") {
        limpar();
        return;
      }
      for (let i = 0; i < lis.length - 1; i++) {
        const cartao = cartoes[i];
        if (!cartao) continue;
        const atual = lis[i].getBoundingClientRect();
        const proximo = lis[i + 1].getBoundingClientRect();
        // Cobertura total: o próximo grudado, um `degrau` abaixo do topo deste.
        const vao = parseFloat(getComputedStyle(lis[i + 1]).top) - parseFloat(getComputedStyle(lis[i]).top);
        const total = atual.height - (Number.isFinite(vao) ? vao : 0);
        const coberto = total > 0 ? limitar((atual.bottom - proximo.top) / total) : 0;
        const t = suavizar(coberto);
        cartao.style.transform = `translateY(${t * deslocamentoAoSair}px) scale(${1 - t * (1 - escalaAoSair)})`;
        cartao.style.opacity = String(1 - t * (1 - opacidadeAoSair));
        cartao.style.willChange = "transform, opacity";
      }
    };
    const agendar = () => {
      if (!quadro) quadro = requestAnimationFrame(atualizar);
    };

    agendar();
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar);
    return () => {
      cancelAnimationFrame(quadro);
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
      limpar();
    };
  }, [empilhar, itens.length, topo, degrau, alturaDoCartao, escalaAoSair, opacidadeAoSair, deslocamentoAoSair]);

  return (
    <ul
      ref={ref}
      className="flex w-full flex-col gap-6 lg:gap-10"
      style={{ "--altura-cartao": medida(alturaDoCartao) } as CSSProperties}
    >
      {itens.map((item, i) => (
        <li
          key={`${item.titulo}-${i}`}
          className={empilhar ? "lg:sticky lg:top-(--topo-cartao) lg:h-(--altura-cartao)" : "lg:min-h-(--altura-cartao)"}
          style={{ "--topo-cartao": `calc(${medida(topo)} + ${i * degrau}px)` } as CSSProperties}
        >
          <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-surface lg:flex-row">
            {/* A mídia sangra até a borda: faixa no topo em telas pequenas, coluna à direita a partir de lg. */}
            {item.midia && (
              <div className="relative h-48 w-full shrink-0 sm:h-56 lg:order-2 lg:h-auto lg:w-[54%]">{item.midia}</div>
            )}
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-10 p-8 lg:order-1 lg:p-12">
              <div>
                <h3 className="font-display text-2xl font-semibold text-ink lg:text-3xl">{item.titulo}</h3>
                <div className="mt-3 max-w-md leading-relaxed text-ink-2 lg:text-lg">{item.descricao}</div>
              </div>
              {item.acao && <div>{item.acao}</div>}
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
