"use client";

import { useRef } from "react";
import { useEmTela, useSemMovimento } from "@/library/revelar/Movimento";

/**
 * Título com uma malha de cores (ou uma imagem) à deriva aparecendo por dentro das letras,
 * revelado palavra por palavra. Adaptado do MaskedHeading do React Bits (reactbits.dev),
 * só com CSS.
 *
 * O texto completo fica num rótulo para leitores de tela; as palavras animadas ficam
 * escondidas deles. Com "reduzir movimento", o título aparece inteiro e o fundo fica parado.
 */
export function TituloMascarado({
  texto,
  cores = ["#6366f1", "#ec4899", "#f59e0b", "#10b981"],
  imagem,
  duracaoDeriva = 12,
  duracao = 0.8,
  atrasoPalavra = 0.12,
  aoEntrarNaTela = true,
  className = "text-5xl font-extrabold tracking-tight",
}: {
  /** Texto do título. */
  texto: string;
  /** Cores da malha que se move por dentro das letras. Ignoradas se houver imagem. */
  cores?: string[];
  /** URL de uma imagem para aparecer por dentro das letras no lugar da malha. */
  imagem?: string;
  /** Segundos de um ciclo da deriva do fundo. */
  duracaoDeriva?: number;
  /** Segundos da revelação de cada palavra. */
  duracao?: number;
  /** Segundos entre o início de uma palavra e o da seguinte. */
  atrasoPalavra?: number;
  /** Só revela quando o título entra na tela. */
  aoEntrarNaTela?: boolean;
  /** Classes do título. */
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const semMovimento = useSemMovimento();
  const emTela = useEmTela(ref);
  const ativo = !aoEntrarNaTela || emTela;
  const palavras = texto.split(/\s+/).filter(Boolean);

  const c = cores.length ? cores : ["currentColor"];
  const fundo = imagem
    ? `url("${imagem}") center / cover`
    : c
        .map((cor, i) => {
          const x = [15, 85, 30, 70][i % 4];
          const y = [20, 30, 80, 75][i % 4];
          return `radial-gradient(circle at ${x}% ${y}%, ${cor} 0%, transparent 55%)`;
        })
        .join(", ") + `, ${c[0]}`;

  return (
    <h2 ref={ref} className={`text-ink ${className}`}>
      <span className="sr-only">{texto}</span>
      <span
        aria-hidden="true"
        className="titulo-mascarado-fundo inline"
        style={{
          background: fundo,
          backgroundSize: imagem ? "cover" : "200% 200%",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          animation: semMovimento ? undefined : `titulo-mascarado-deriva ${duracaoDeriva}s ease-in-out infinite alternate`,
        }}
      >
        {palavras.map((p, i) => (
          <span key={i} className="inline-block overflow-hidden pb-[0.1em] align-bottom">
            <span
              className="inline-block"
              style={{
                background: "inherit",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                animation: semMovimento
                  ? undefined
                  : `titulo-mascarado-palavra ${duracao}s cubic-bezier(.2,.7,.2,1) ${i * atrasoPalavra}s both`,
                animationPlayState: ativo ? "running" : "paused",
              }}
            >
              {p}
            </span>
            {i < palavras.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
      <style>{`@keyframes titulo-mascarado-deriva { 0% { background-position: 0% 0%; } 50% { background-position: 100% 50%; } 100% { background-position: 30% 100%; } }
@keyframes titulo-mascarado-palavra { from { transform: translateY(110%); opacity: 0; filter: blur(4px); } to { transform: none; opacity: 1; filter: none; } }`}</style>
    </h2>
  );
}
