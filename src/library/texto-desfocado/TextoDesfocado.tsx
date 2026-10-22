"use client";

import { useRef } from "react";
import { useEmTela, useSemMovimento } from "@/library/revelar/Movimento";

/**
 * Texto que surge do desfoque: cada palavra (ou letra) chega desfocada e transparente,
 * deslizando de cima ou de baixo, e entra em foco em cascata quando aparece na tela.
 * Adaptado do BlurText do React Bits (reactbits.dev), só com CSS, sem Motion.
 *
 * O texto completo fica num rótulo para leitores de tela; os pedaços animados ficam
 * escondidos deles. Com "reduzir movimento", mostra o texto já nítido, parado.
 */
export function TextoDesfocado({
  texto,
  animarPor = "palavras",
  direcao = "cima",
  atraso = 200,
  duracao = 700,
  desfoque = 10,
  deslocamento = 50,
  className = "text-4xl font-bold text-ink",
}: {
  /** Texto exibido. */
  texto: string;
  /** Anima palavra por palavra ou letra por letra. */
  animarPor?: "palavras" | "letras";
  /** De onde os pedaços chegam. */
  direcao?: "cima" | "baixo";
  /** Milissegundos entre o início de um pedaço e o do seguinte. */
  atraso?: number;
  /** Milissegundos que cada pedaço leva para entrar em foco. */
  duracao?: number;
  /** Desfoque inicial, em pixels. */
  desfoque?: number;
  /** Distância inicial do deslize, em pixels. */
  deslocamento?: number;
  /** Classes do contêiner. */
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const semMovimento = useSemMovimento();
  const emTela = useEmTela(ref);
  const pedacos = animarPor === "palavras" ? texto.split(" ") : Array.from(texto);
  const y = direcao === "cima" ? -deslocamento : deslocamento;

  return (
    <span ref={ref} className={`inline-flex flex-wrap ${className}`}>
      <span className="sr-only">{texto}</span>
      {pedacos.map((p, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="inline-block whitespace-pre"
          style={
            semMovimento
              ? undefined
              : ({
                  "--td-blur": `${desfoque}px`,
                  "--td-blur-meio": `${desfoque / 2}px`,
                  "--td-y": `${y}px`,
                  "--td-y-meio": `${-y / 10}px`,
                  opacity: 0,
                  animation: emTela
                    ? `texto-desfocado-entrar ${duracao}ms ease-out ${i * atraso}ms forwards`
                    : "none",
                } as React.CSSProperties)
          }
        >
          {p === " " ? " " : p}
          {animarPor === "palavras" && i < pedacos.length - 1 && " "}
        </span>
      ))}
      <style>{`@keyframes texto-desfocado-entrar {
  0% { filter: blur(var(--td-blur)); opacity: 0; transform: translateY(var(--td-y)); }
  50% { filter: blur(var(--td-blur-meio)); opacity: 0.5; transform: translateY(var(--td-y-meio)); }
  100% { filter: blur(0); opacity: 1; transform: translateY(0); }
}`}</style>
    </span>
  );
}
