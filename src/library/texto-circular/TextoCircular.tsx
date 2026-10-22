"use client";

import { useEffect, useRef, useState } from "react";
import { useEmTela, useSemMovimento } from "@/library/revelar/Movimento";

type AoPassar = "desacelerar" | "acelerar" | "pausar" | "enlouquecer" | "nada";

/**
 * Texto disposto em círculo, girando sem parar. Ao passar o mouse, o giro pode
 * desacelerar, acelerar, pausar ou "enlouquecer" (acelera e encolhe). Adaptado do
 * CircularText do React Bits (reactbits.dev), sem Motion: o giro é feito com
 * requestAnimationFrame e a velocidade muda suavemente.
 *
 * Leitores de tela leem o texto inteiro; as letras soltas ficam escondidas deles.
 * Com "reduzir movimento", o círculo fica parado.
 */
export function TextoCircular({
  texto,
  duracao = 20,
  aoPassar = "acelerar",
  raio,
  className = "text-2xl font-black text-ink",
}: {
  /** Texto distribuído ao redor do círculo. Termine com um separador (ex.: "*") para fechar a volta. */
  texto: string;
  /** Segundos por volta completa. */
  duracao?: number;
  /** O que acontece com o giro ao passar o mouse. */
  aoPassar?: AoPassar;
  /** Raio em px. Sem raio, cresce com o número de letras. */
  raio?: number;
  /** Classes do contêiner (tamanho e cor da letra). */
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const giro = useRef<HTMLDivElement>(null);
  const semMovimento = useSemMovimento();
  const emTela = useEmTela(ref);
  const [sobre, setSobre] = useState(false);
  const letras = Array.from(texto);
  const r = raio ?? Math.max(48, letras.length * 4.5);

  const alvo = !sobre
    ? { vel: 1, escala: 1 }
    : aoPassar === "desacelerar"
      ? { vel: 0.5, escala: 1 }
      : aoPassar === "acelerar"
        ? { vel: 4, escala: 1 }
        : aoPassar === "pausar"
          ? { vel: 0, escala: 1 }
          : aoPassar === "enlouquecer"
            ? { vel: 20, escala: 0.8 }
            : { vel: 1, escala: 1 };
  const alvoRef = useRef(alvo);
  useEffect(() => {
    alvoRef.current = alvo;
  });

  useEffect(() => {
    if (semMovimento || !emTela) return;
    let quadro = 0;
    let anterior = performance.now();
    let angulo = 0;
    let vel = 1;
    let escala = 1;
    const passo = (agora: number) => {
      const dt = Math.min(0.1, (agora - anterior) / 1000);
      anterior = agora;
      const k = 1 - Math.exp(-dt * 4);
      vel += (alvoRef.current.vel - vel) * k;
      escala += (alvoRef.current.escala - escala) * k;
      angulo = (angulo + (360 / Math.max(0.1, duracao)) * vel * dt) % 360;
      if (giro.current) giro.current.style.transform = `rotate(${angulo}deg) scale(${escala})`;
      quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [semMovimento, emTela, duracao]);

  return (
    <div
      ref={ref}
      className={`relative inline-block ${className}`}
      style={{ width: r * 2, height: r * 2 }}
      onPointerEnter={() => setSobre(true)}
      onPointerLeave={() => setSobre(false)}
    >
      <span className="sr-only">{texto}</span>
      <div ref={giro} aria-hidden="true" className="absolute inset-0">
        {letras.map((l, i) => (
          <span
            key={i}
            className="absolute left-1/2 top-0 inline-block leading-none"
            style={{
              transform: `translateX(-50%) rotate(${(360 / letras.length) * i}deg)`,
              transformOrigin: `50% ${r}px`,
              height: r,
            }}
          >
            {l === " " ? " " : l}
          </span>
        ))}
      </div>
    </div>
  );
}
