"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { cancelFrame, frame, motion, useMotionValue, useSpring } from "motion/react";
import { useSemMovimento } from "@/library/revelar/Movimento";

// Porte do CircularText do React Bits (reactbits.dev/text-animations/circular-text).
// A lógica segue o original; a API pública está em português.

type AoPassar = "desacelerar" | "acelerar" | "pausar" | "enlouquecer" | "nada";

/** Multiplicador da velocidade de giro com o mouse em cima. */
const VELOCIDADE_AO_PASSAR: Record<AoPassar, number> = {
  desacelerar: 0.5,
  acelerar: 4,
  pausar: 0,
  enlouquecer: 20,
  nada: 1,
};
const MAX_FLING = 1440;

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

/**
 * Texto em volta de um círculo que gira sem parar. Com o mouse em cima, desacelera, acelera,
 * pausa ou "enlouquece" (gira muito rápido e encolhe). Pode ser arrastado e lançado, inclinar
 * em 3D seguindo o mouse, ter um anel e um conteúdo no centro.
 *
 * Leitores de tela recebem o texto pelo `aria-label`. Com "reduzir movimento", o círculo fica
 * parado.
 */
export function TextoCircular({
  texto,
  duracao = 20,
  aoPassar = "acelerar",
  sentido = "horario",
  tamanho = 200,
  tamanhoFonte = 24,
  peso = 900,
  espacamento = 0,
  cor = "",
  anguloInicial = 0,
  preencher = true,
  repeticoes = 1,
  anel = false,
  corAnel = "",
  inclinacao = 0,
  inclinacaoAoPassar = 0,
  arrastavel = false,
  children,
  className = "text-ink",
}: {
  texto: string;
  /** Segundos por volta; 0 deixa parado. */
  duracao?: number;
  /** O que acontece com o mouse em cima. */
  aoPassar?: AoPassar;
  sentido?: "horario" | "anti-horario";
  /** Diâmetro (px). */
  tamanho?: number;
  /** Tamanho das letras (px). */
  tamanhoFonte?: number;
  peso?: number;
  /** Espaço extra entre letras, em frações do tamanho da fonte (só com `preencher` falso). */
  espacamento?: number;
  cor?: string;
  /** Ângulo (graus) da primeira letra. */
  anguloInicial?: number;
  /** Espalha as letras pela volta inteira; falso usa a largura real de cada letra. */
  preencher?: boolean;
  /** Quantas vezes o texto se repete na volta. */
  repeticoes?: number;
  /** Mostra um anel por dentro das letras. */
  anel?: boolean;
  corAnel?: string;
  /** Inclinação fixa (graus) do círculo, como se estivesse deitado. */
  inclinacao?: number;
  /** Quanto (graus) o círculo inclina em 3D seguindo o mouse. */
  inclinacaoAoPassar?: number;
  /** Pode ser girado com o mouse ou o dedo e lançado. */
  arrastavel?: boolean;
  /** Conteúdo no centro do círculo: um ícone, um logo, uma seta. */
  children?: ReactNode;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const glyphRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const stateRef = useRef({
    dragging: false,
    hovering: false,
    fling: 0,
    cruise: 0,
    angle: null as number | null,
    travel: 0,
    samples: [] as [number, number][],
  });
  const [advances, setAdvances] = useState<number[] | null>(null);
  const [settled, setSettled] = useState(false);
  const [dragging, setDragging] = useState(false);
  const reduceMotion = useSemMovimento();
  const rotation = useMotionValue(0);
  const speed = useSpring(1, { stiffness: 60, damping: 18 });
  const scale = useSpring(1, { stiffness: 300, damping: 20 });
  const tiltX = useSpring(0, { stiffness: 150, damping: 18 });
  const tiltY = useSpring(0, { stiffness: 150, damping: 18 });

  const glyphs = useMemo(() => Array.from(texto ?? ""), [texto]);
  const copies = Math.max(1, Math.round(repeticoes) || 1);
  const letters = useMemo(() => Array.from({ length: copies }, () => glyphs).flat(), [glyphs, copies]);

  // Ângulo de cada letra: divididas por igual, ou pela largura medida de cada uma
  const angles = useMemo(() => {
    const count = glyphs.length;
    if (!count) return [];
    if (preencher) return letters.map((_, i) => anguloInicial + (360 / letters.length) * i);
    const known = advances && advances.length === count ? advances : null;
    const toDegrees = 180 / (Math.PI * Math.max(tamanho / 2 - tamanhoFonte * 0.6, 1));
    const arcs = glyphs.map((glyph, i) => {
      const width = known ? known[i] : tamanhoFonte * (glyph === " " ? 0.3 : 0.6);
      return Math.max(0, width + espacamento * tamanhoFonte) * toDegrees;
    });
    const span = arcs.reduce((sum, arc) => sum + arc, 0);
    const fit = span > 0 ? Math.min(1, 360 / (span * copies)) : 1;
    const result: number[] = [];
    for (let copy = 0; copy < copies; copy += 1) {
      let cursor = anguloInicial + (360 / copies) * copy - (arcs[0] * fit) / 2;
      for (let i = 0; i < count; i += 1) {
        const arc = arcs[i] * fit;
        result.push(cursor + arc / 2);
        cursor += arc;
      }
    }
    return result;
  }, [glyphs, letters, copies, preencher, anguloInicial, tamanho, tamanhoFonte, espacamento, advances]);

  useIsomorphicLayoutEffect(() => {
    if (preencher) return undefined;
    let alive = true;
    const measure = () => {
      if (!alive) return;
      const widths = glyphs.map((_, i) => glyphRefs.current[i]?.offsetWidth ?? 0);
      setAdvances((prev) =>
        prev && prev.length === widths.length && prev.every((width, i) => width === widths[i]) ? prev : widths,
      );
    };
    const id = requestAnimationFrame(measure);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => {
      alive = false;
      cancelAnimationFrame(id);
    };
  }, [preencher, glyphs, tamanhoFonte, peso, className]);

  // Só liga a transição das letras depois da primeira pintura (não anima ao montar)
  useEffect(() => {
    const id = requestAnimationFrame(() => setSettled(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Giro: velocidade de cruzeiro vezes a mola do mouse, mais o impulso de um lançamento
  useEffect(() => {
    const root = rootRef.current;
    const state = stateRef.current;
    const turn = sentido === "anti-horario" ? -1 : 1;
    state.cruise = duracao > 0 && !reduceMotion ? (360 / duracao) * turn : 0;
    if (!root || reduceMotion) return undefined;

    const spin = ({ delta }: { delta: number }) => {
      if (state.dragging) return;
      const dt = Math.min(delta, 100) / 1000;
      state.fling *= Math.exp(-dt / 0.7);
      if (Math.abs(state.fling) < 1) state.fling = 0;
      const velocity = state.cruise * speed.get() + state.fling;
      if (velocity) rotation.set((rotation.get() + velocity * dt) % 360);
    };

    // Fora da tela, não gasta quadro
    let running = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting === running) return;
      running = entry.isIntersecting;
      if (running) frame.update(spin, true);
      else cancelFrame(spin);
    });
    observer.observe(root);

    return () => {
      observer.disconnect();
      cancelFrame(spin);
    };
  }, [duracao, sentido, reduceMotion, rotation, speed]);

  useEffect(() => {
    if (inclinacaoAoPassar && !reduceMotion) return;
    tiltX.set(0);
    tiltY.set(0);
  }, [inclinacaoAoPassar, reduceMotion, tiltX, tiltY]);

  const applyScale = () => {
    const state = stateRef.current;
    const bonkers = state.hovering && aoPassar === "enlouquecer" && !reduceMotion;
    scale.set((bonkers ? 0.8 : 1) * (state.dragging ? 0.96 : 1));
  };

  const pointerAngle = (e: ReactPointerEvent) => {
    const root = rootRef.current;
    if (!root) return null;
    const rect = root.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    if (Math.hypot(dx, dy) < rect.width * 0.06) return null;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };

  const handleEnter = () => {
    stateRef.current.hovering = true;
    if (!reduceMotion) speed.set(VELOCIDADE_AO_PASSAR[aoPassar] ?? 1);
    applyScale();
  };

  const handleLeave = () => {
    stateRef.current.hovering = false;
    speed.set(1);
    tiltX.set(0);
    tiltY.set(0);
    applyScale();
  };

  const handleMove = (e: ReactPointerEvent) => {
    const state = stateRef.current;
    const root = rootRef.current;
    if (!root) return;

    if (state.dragging) {
      const angle = pointerAngle(e);
      if (angle !== null) {
        if (state.angle !== null) {
          let delta = angle - state.angle;
          if (delta > 180) delta -= 360;
          if (delta < -180) delta += 360;
          state.travel += delta;
          rotation.set((rotation.get() + delta) % 360);
          state.samples.push([e.timeStamp, state.travel]);
          while (state.samples.length > 2 && e.timeStamp - state.samples[0][0] > 100) state.samples.shift();
        }
        state.angle = angle;
      }
    }

    if (!inclinacaoAoPassar || reduceMotion || e.pointerType === "touch") return;
    const rect = root.getBoundingClientRect();
    const nx = clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
    const ny = clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
    tiltX.set(-ny * inclinacaoAoPassar);
    tiltY.set(nx * inclinacaoAoPassar);
  };

  const handleDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!arrastavel || (e.pointerType === "mouse" && e.button !== 0)) return;
    const state = stateRef.current;
    state.dragging = true;
    state.fling = 0;
    state.angle = pointerAngle(e);
    state.travel = 0;
    state.samples = [[e.timeStamp, 0]];
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
    applyScale();
  };

  // Ao soltar, a velocidade dos últimos 100 ms vira um lançamento que vai perdendo força
  const handleUp = (e: ReactPointerEvent) => {
    const state = stateRef.current;
    if (!state.dragging) return;
    state.dragging = false;
    setDragging(false);
    applyScale();
    const [startTime, startTravel] = state.samples[0];
    const lastTime = state.samples[state.samples.length - 1][0];
    const elapsed = e.timeStamp - startTime;
    const velocity = elapsed > 0 && e.timeStamp - lastTime < 80 ? ((state.travel - startTravel) / elapsed) * 1000 : 0;
    state.fling = reduceMotion ? 0 : clamp(velocity, -MAX_FLING, MAX_FLING) - state.cruise * speed.get();
  };

  return (
    <div
      ref={rootRef}
      className={`relative mx-auto cursor-pointer rounded-full text-center ${className}`}
      style={{
        width: tamanho,
        height: tamanho,
        fontSize: tamanhoFonte,
        fontWeight: peso,
        color: cor || undefined,
        perspective: tamanho * 2.5,
        cursor: arrastavel ? (dragging ? "grabbing" : "grab") : undefined,
        touchAction: arrastavel ? "none" : undefined,
        userSelect: arrastavel ? "none" : undefined,
        WebkitUserSelect: arrastavel ? "none" : undefined,
      }}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      onPointerMove={handleMove}
      onPointerDown={handleDown}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
    >
      <motion.div
        className="absolute inset-0 transform-3d"
        style={{ rotateX: tiltX, rotateY: tiltY, scale }}
      >
        <div
          className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: inclinacao ? `rotateX(${inclinacao}deg)` : undefined }}
        >
          <span
            className="pointer-events-none absolute inset-[1.3em] rounded-full border-solid border-current transition-opacity duration-400"
            style={{
              borderWidth: Math.max(1, tamanhoFonte / 16),
              borderColor: corAnel || undefined,
              opacity: anel ? 1 : 0,
            }}
          />
          <motion.div className="absolute inset-0" role="img" aria-label={texto} style={{ rotate: rotation }}>
            {letters.map((letter, i) => (
              <span
                key={i}
                className={`absolute inset-0 inline-block whitespace-pre ${
                  settled ? "transition-transform duration-500 ease-[cubic-bezier(0,0,0,1)]" : ""
                }`}
                style={{ transform: `rotate(${angles[i] ?? 0}deg)` }}
              >
                <span
                  ref={
                    i < glyphs.length
                      ? (el) => {
                          glyphRefs.current[i] = el;
                        }
                      : undefined
                  }
                >
                  {letter}
                </span>
              </span>
            ))}
          </motion.div>
        </div>
        {children != null && children !== false ? (
          <div className="absolute inset-0 flex items-center justify-center">{children}</div>
        ) : null}
      </motion.div>
    </div>
  );
}
