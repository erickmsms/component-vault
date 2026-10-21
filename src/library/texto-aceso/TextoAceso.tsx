"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { useSemMovimento } from "@/library/revelar/Movimento";

const limitar = (n: number) => Math.min(Math.max(n, 0), 1);

/** Opacidade da palavra `i` de `total` quando o bloco está em `progresso` (0 a 1): uma palavra acende por vez. */
function opacidadeDaPalavra(i: number, total: number, progresso: number, apagada: number) {
  const local = limitar(progresso * total - i);
  return apagada + (1 - apagada) * local;
}

/**
 * Parágrafos cujas palavras acendem uma a uma, presas à rolagem: o texto começa
 * apagado e ganha opacidade conforme o bloco atravessa a tela.
 *
 * O progresso vai de 0, quando o topo do bloco passa pela linha `inicio`, até 1,
 * quando a base do bloco passa pela linha `fim` (frações da altura da janela,
 * contadas de cima). As palavras ficam no HTML; a animação só muda a opacidade,
 * então leitores de tela e buscadores leem o texto inteiro. Com "reduzir
 * movimento", o texto aparece aceso.
 */
export function TextoAceso({
  paragrafos,
  opacidadeApagada = 0.15,
  inicio = 0.78,
  fim = 0.62,
  progresso,
  className = "text-xl leading-relaxed text-ink sm:text-2xl",
}: {
  /** Um texto por parágrafo. */
  paragrafos: string[];
  /** Opacidade das palavras ainda não acesas (0 a 1). */
  opacidadeApagada?: number;
  /**
   * Linha da janela (0 = topo, 1 = base) que o topo do bloco cruza para começar
   * a acender. O padrão, 0,78, fica um pouco abaixo de três quartos da tela.
   */
  inicio?: number;
  /**
   * Linha da janela (0 = topo, 1 = base) que a base do bloco cruza quando a
   * última palavra acende. Com o padrão, 0,62, o texto termina de acender
   * quando a base do bloco está a 38% da borda de baixo da tela.
   */
  fim?: number;
  /**
   * Progresso fixo (0 a 1) que ignora a rolagem e o "reduzir movimento". Para
   * mostrar o efeito parado (miniaturas, documentação) ou controlá-lo de fora.
   */
  progresso?: number;
  /** Classes de cada parágrafo (substituem as padrão: tamanho, entrelinha e cor). */
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const semMovimento = useSemMovimento();
  const fixo = progresso !== undefined;
  const animar = !fixo && !semMovimento;

  const palavras = paragrafos.map((p) => p.split(/\s+/).filter(Boolean));
  const total = palavras.reduce((soma, lista) => soma + lista.length, 0);
  // Índice da primeira palavra de cada parágrafo na contagem geral.
  const primeiras = palavras.map((_, p) => palavras.slice(0, p).reduce((soma, lista) => soma + lista.length, 0));
  const assinatura = paragrafos.join("\n");

  useEffect(() => {
    const bloco = ref.current;
    if (!animar || !bloco) return;
    const elementos = Array.from(bloco.querySelectorAll<HTMLElement>("[data-palavra]"));

    let quadro = 0;
    const atualizar = () => {
      quadro = 0;
      const caixa = bloco.getBoundingClientRect();
      const altura = window.innerHeight;
      const percurso = (inicio - fim) * altura + caixa.height;
      const p = percurso > 0 ? limitar((inicio * altura - caixa.top) / percurso) : 1;
      elementos.forEach((el, i) => {
        el.style.opacity = String(opacidadeDaPalavra(i, elementos.length, p, opacidadeApagada));
      });
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
      // O React cuida só da variável --opacidade; a opacidade escrita aqui sai junto com o efeito.
      elementos.forEach((el) => el.style.removeProperty("opacity"));
    };
  }, [animar, inicio, fim, opacidadeApagada, assinatura]);

  return (
    <div
      ref={ref}
      className="flex flex-col gap-6"
      style={{ "--opacidade": opacidadeApagada } as CSSProperties}
    >
      {palavras.map((lista, p) => (
        <p key={p} className={className}>
          {lista.map((palavra, i) => (
            // O espaço fica fora da palavra, para a quebra de linha continuar natural.
            <span key={i}>
              <span
                data-palavra=""
                // Antes do efeito rodar, a palavra já começa apagada (sem piscar acesa).
                className={animar || fixo ? "opacity-(--opacidade)" : undefined}
                style={
                  fixo
                    ? ({
                        "--opacidade": opacidadeDaPalavra(primeiras[p] + i, total, limitar(progresso), opacidadeApagada),
                      } as CSSProperties)
                    : undefined
                }
              >
                {palavra}
              </span>{" "}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}
