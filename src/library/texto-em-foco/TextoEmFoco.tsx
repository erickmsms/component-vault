"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useReducedMotion, type Transition } from "motion/react";

// Porte do TrueFocus do React Bits (reactbits.dev/text-animations/true-focus).
// A lógica segue o original; a API pública está em português.

export type EstiloDoFoco = "cantos" | "caixa" | "sublinhado" | "marca-texto";

const CANTOS = ["sup-esq", "sup-dir", "inf-esq", "inf-dir"] as const;
type Canto = (typeof CANTOS)[number];
const BORDAS_DO_CANTO: Record<Canto, CSSProperties> = {
  "sup-esq": { borderRight: "none", borderBottom: "none" },
  "sup-dir": { borderLeft: "none", borderBottom: "none" },
  "inf-esq": { borderRight: "none", borderTop: "none" },
  "inf-dir": { borderLeft: "none", borderTop: "none" },
};
const FOLGA = 10;
const SUAVE: [number, number, number, number] = [0.65, 0, 0.35, 1];
const SUAVE_CSS = "cubic-bezier(0.65, 0, 0.35, 1)";
const MOLA_CSS = "cubic-bezier(0.34, 1.56, 0.64, 1)";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Retangulo = { x: number; y: number; width: number; height: number };

export type TextoEmFocoProps = {
  frase?: string;
  separador?: string;
  /** Foco segue o mouse em vez de andar sozinho. */
  manual?: boolean;
  estilo?: EstiloDoFoco;
  ordem?: "sequencial" | "aleatoria";
  suavizacao?: "suave" | "mola";
  /** Desfoque (px) das palavras fora de foco. */
  desfoque?: number;
  escalaDoFoco?: number;
  corDaBorda?: string;
  /** Cor do marca-texto (padrão: a da borda). */
  corDoDestaque?: string;
  corDoBrilho?: string;
  /** Duração (s) da troca de foco. */
  duracao?: number;
  /** Pausa (s) entre uma troca e a próxima. */
  pausa?: number;
  tamanhoDoCanto?: number;
  larguraDaBorda?: number;
  opacidadeFora?: number;
  className?: string;
};

/**
 * Frase em que uma palavra por vez fica nítida e as outras desfocadas, com uma moldura
 * (cantos, caixa, sublinhado ou marca-texto) que pula de palavra em palavra. No modo manual,
 * o foco segue o mouse.
 *
 * Leitores de tela leem a frase normalmente; a moldura é decorativa. Com "reduzir movimento",
 * o foco troca sem animar.
 */
export function TextoEmFoco({
  frase = "Foco Verdadeiro",
  separador = " ",
  manual = false,
  estilo = "cantos",
  ordem = "sequencial",
  suavizacao = "suave",
  desfoque = 5,
  escalaDoFoco = 1,
  corDaBorda = "#22c55e",
  corDoDestaque,
  corDoBrilho = "transparent",
  duracao = 0.5,
  pausa = 1,
  tamanhoDoCanto = 16,
  larguraDaBorda = 3,
  opacidadeFora = 1,
  className,
}: TextoEmFocoProps) {
  const palavras = frase.split(separador).filter((p) => p.trim() !== "");
  const [indice, setIndice] = useState(0);
  const [foco, setFoco] = useState<Retangulo | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const palavrasRef = useRef<(HTMLSpanElement | null)[]>([]);
  const semMovimento = useReducedMotion();
  const dur = semMovimento ? 0 : duracao;
  const ativo = palavras.length ? indice % palavras.length : -1;
  const mola = suavizacao === "mola" && !semMovimento;
  const transicao: Transition = mola
    ? { type: "spring", visualDuration: dur, bounce: 0.38 }
    : { duration: dur, ease: SUAVE };

  useEffect(() => {
    if (manual || palavras.length < 2) return;
    const id = setInterval(() => {
      const sorteio = Math.random();
      setIndice((prev) => {
        const atual = prev % palavras.length;
        if (ordem !== "aleatoria") return (atual + 1) % palavras.length;
        const prox = Math.floor(sorteio * (palavras.length - 1));
        return prox >= atual ? prox + 1 : prox;
      });
    }, (duracao + pausa) * 1000);
    return () => clearInterval(id);
  }, [manual, duracao, pausa, palavras.length, ordem]);

  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    const palavra = palavrasRef.current[ativo];
    if (!container || !palavra) return;
    const medir = () => {
      const r = { x: palavra.offsetLeft, y: palavra.offsetTop, width: palavra.offsetWidth, height: palavra.offsetHeight };
      setFoco((p) => (p && p.x === r.x && p.y === r.y && p.width === r.width && p.height === r.height ? p : r));
    };
    medir();
    if (typeof ResizeObserver === "undefined") return;
    const obs = new ResizeObserver(medir);
    obs.observe(container);
    palavrasRef.current.forEach((n) => n && obs.observe(n));
    return () => obs.disconnect();
  }, [ativo, frase, separador]);

  const quadro = foco && {
    x: foco.x - (foco.width * (escalaDoFoco - 1)) / 2,
    y: foco.y - (foco.height * (escalaDoFoco - 1)) / 2,
    width: foco.width * escalaDoFoco,
    height: foco.height * escalaDoFoco,
  };

  const posCantos: Record<Canto, { x: number; y: number }> | null = quadro && {
    "sup-esq": { x: quadro.x - FOLGA, y: quadro.y - FOLGA },
    "sup-dir": { x: quadro.x + quadro.width + FOLGA - tamanhoDoCanto, y: quadro.y - FOLGA },
    "inf-esq": { x: quadro.x - FOLGA, y: quadro.y + quadro.height + FOLGA - tamanhoDoCanto },
    "inf-dir": { x: quadro.x + quadro.width + FOLGA - tamanhoDoCanto, y: quadro.y + quadro.height + FOLGA - tamanhoDoCanto },
  };

  const formas = quadro && {
    caixa: { x: quadro.x - FOLGA, y: quadro.y - FOLGA, width: quadro.width + FOLGA * 2, height: quadro.height + FOLGA * 2 },
    sublinhado: { x: quadro.x, y: quadro.y + quadro.height + FOLGA * 0.4, width: quadro.width, height: larguraDaBorda },
    marca: {
      x: quadro.x - quadro.height * 0.14,
      y: quadro.y + quadro.height * 0.04,
      width: quadro.width + quadro.height * 0.28,
      height: quadro.height * 0.92,
    },
  };

  const brilho = `drop-shadow(0 0 4px ${corDoBrilho})`;
  const borda = `${larguraDaBorda}px solid ${corDaBorda}`;
  const base = "pointer-events-none absolute left-0 top-0";

  return (
    <div
      ref={containerRef}
      className={["relative flex select-none flex-wrap items-center justify-center gap-[1em]", className]
        .filter(Boolean)
        .join(" ")}
    >
      {estilo === "marca-texto" && formas && (
        <motion.span
          aria-hidden="true"
          className={`${base} rounded-md`}
          style={{ backgroundColor: `color-mix(in srgb, ${corDoDestaque ?? corDaBorda} 30%, transparent)` }}
          initial={{ ...formas.marca, opacity: 0 }}
          animate={{ ...formas.marca, opacity: 1 }}
          transition={transicao}
        />
      )}

      {palavras.map((p, i) => {
        const emFoco = i === ativo;
        return (
          <span
            key={i}
            ref={(el) => {
              palavrasRef.current[i] = el;
            }}
            className="relative cursor-pointer text-5xl font-black"
            style={{
              filter: `blur(${emFoco ? 0 : desfoque}px)`,
              opacity: emFoco ? 1 : opacidadeFora,
              transform: escalaDoFoco !== 1 ? `scale(${emFoco ? escalaDoFoco : 1})` : undefined,
              transition: `filter ${dur}s ease, opacity ${dur}s ease, transform ${dur}s ${mola ? MOLA_CSS : SUAVE_CSS}`,
            }}
            onMouseEnter={() => manual && setIndice(i)}
          >
            {p}
          </span>
        );
      })}

      {formas && posCantos && estilo !== "marca-texto" && (
        <div className={base} aria-hidden="true">
          {estilo === "caixa" && (
            <motion.span
              className={`${base} box-border rounded-md`}
              style={{ border: borda, filter: brilho }}
              initial={{ ...formas.caixa, opacity: 0 }}
              animate={{ ...formas.caixa, opacity: 1 }}
              transition={transicao}
            />
          )}
          {estilo === "sublinhado" && (
            <motion.span
              className={base}
              style={{ backgroundColor: corDaBorda, borderRadius: larguraDaBorda / 2, filter: brilho }}
              initial={{ ...formas.sublinhado, opacity: 0 }}
              animate={{ ...formas.sublinhado, opacity: 1 }}
              transition={transicao}
            />
          )}
          {estilo === "cantos" &&
            CANTOS.map((c) => (
              <motion.span
                key={c}
                className={`${base} box-border rounded-[3px]`}
                style={{
                  width: tamanhoDoCanto,
                  height: tamanhoDoCanto,
                  border: borda,
                  filter: brilho,
                  ...BORDAS_DO_CANTO[c],
                }}
                initial={{ ...posCantos[c], opacity: 0 }}
                animate={{ ...posCantos[c], opacity: 1 }}
                transition={transicao}
              />
            ))}
        </div>
      )}
    </div>
  );
}
