"use client";

import { useEffect, useRef, useState } from "react";
import { useEmTela, useSemMovimento } from "@/library/revelar/Movimento";

/**
 * Texto que se digita sozinho, letra por letra, apaga e passa para a próxima frase, com
 * um cursor piscando. Adaptado do TextType do React Bits (reactbits.dev), sem GSAP.
 *
 * O texto completo da frase atual fica num rótulo para leitores de tela; as letras que
 * aparecem e somem ficam escondidas deles. Com "reduzir movimento", mostra a primeira
 * frase inteira, parada.
 */
export function TextoDigitado({
  frases,
  velocidade = 50,
  velocidadeApagando = 30,
  pausa = 2000,
  atrasoInicial = 0,
  repetir = true,
  cursor = "|",
  mostrarCursor = true,
  esconderCursorDigitando = false,
  cores,
  aoEntrarNaTela = false,
  className = "text-3xl font-bold text-ink",
}: {
  /** Frases digitadas em sequência. */
  frases: string[];
  /** Milissegundos por letra ao digitar. */
  velocidade?: number;
  /** Milissegundos por letra ao apagar. */
  velocidadeApagando?: number;
  /** Milissegundos com a frase completa antes de apagar. */
  pausa?: number;
  /** Milissegundos antes de começar. */
  atrasoInicial?: number;
  /** Volta para a primeira frase depois da última. Sem repetir, a última fica na tela. */
  repetir?: boolean;
  /** Caractere do cursor. */
  cursor?: string;
  mostrarCursor?: boolean;
  /** Esconde o cursor enquanto digita ou apaga; ele só pisca nas pausas. */
  esconderCursorDigitando?: boolean;
  /** Uma cor por frase, em ciclo. Sem cores, usa a cor do texto. */
  cores?: string[];
  /** Só começa quando o texto entra na tela. */
  aoEntrarNaTela?: boolean;
  /** Classes do contêiner. */
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const semMovimento = useSemMovimento();
  const emTela = useEmTela(ref);
  const [frase, setFrase] = useState(0);
  const [letras, setLetras] = useState(0);
  const [apagando, setApagando] = useState(false);
  const [comecou, setComecou] = useState(atrasoInicial === 0);
  const ativo = !semMovimento && (!aoEntrarNaTela || emTela);

  const atual = frases[frase % frases.length] ?? "";
  const ultima = frase === frases.length - 1;

  useEffect(() => {
    if (!ativo || comecou) return;
    const t = setTimeout(() => setComecou(true), atrasoInicial);
    return () => clearTimeout(t);
  }, [ativo, comecou, atrasoInicial]);

  useEffect(() => {
    if (!ativo || !comecou) return;
    let t: ReturnType<typeof setTimeout>;
    if (!apagando && letras < atual.length) {
      t = setTimeout(() => setLetras((n) => n + 1), velocidade);
    } else if (!apagando) {
      if (ultima && !repetir) return;
      t = setTimeout(() => setApagando(true), pausa);
    } else if (letras > 0) {
      t = setTimeout(() => setLetras((n) => n - 1), velocidadeApagando);
    } else {
      t = setTimeout(() => {
        setApagando(false);
        setFrase((f) => (f + 1) % frases.length);
      }, velocidade);
    }
    return () => clearTimeout(t);
  }, [ativo, comecou, apagando, letras, atual, ultima, repetir, velocidade, velocidadeApagando, pausa, frases.length]);

  const visivel = semMovimento ? (frases[0] ?? "") : atual.slice(0, letras);
  const digitando = !semMovimento && (apagando || letras < atual.length);
  const cor = cores?.length ? cores[frase % cores.length] : undefined;

  return (
    <span ref={ref} className={`inline-block whitespace-pre-wrap ${className}`}>
      <span className="sr-only">{semMovimento ? frases[0] : atual}</span>
      <span aria-hidden="true" style={cor ? { color: cor } : undefined}>
        {visivel}
      </span>
      {mostrarCursor && (
        <span
          aria-hidden="true"
          className={`ml-0.5 inline-block ${digitando ? "" : "motion-safe:animate-[texto-digitado-cursor_1s_step-end_infinite]"} ${
            esconderCursorDigitando && digitando ? "invisible" : ""
          }`}
        >
          {cursor}
        </span>
      )}
      <style>{`@keyframes texto-digitado-cursor { 50% { opacity: 0; } }`}</style>
    </span>
  );
}
