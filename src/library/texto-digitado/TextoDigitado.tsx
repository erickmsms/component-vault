"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ElementType,
} from "react";
import { gsap } from "gsap";
import { useEmTela, useSemMovimento } from "@/library/revelar/Movimento";

// Porte do TextType do React Bits (reactbits.dev/text-animations/text-type).
// A lógica segue o original; a API pública está em português.

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Teclas vizinhas no teclado, para os erros de digitação parecerem de verdade. */
const VIZINHAS: Record<string, string> = {
  a: "qwsz",
  b: "vghn",
  c: "xdfv",
  d: "serfcx",
  e: "wsdr",
  f: "drtgvc",
  g: "ftyhbv",
  h: "gyujnb",
  i: "ujko",
  j: "huikmn",
  k: "jiolm",
  l: "kop",
  m: "njk",
  n: "bhjm",
  o: "iklp",
  p: "ol",
  q: "wa",
  r: "edft",
  s: "awedxz",
  t: "rfgy",
  u: "yhji",
  v: "cfgb",
  w: "qase",
  x: "zsdc",
  y: "tghu",
  z: "asx",
  0: "9p",
  1: "2q",
  2: "13w",
  3: "24e",
  4: "35r",
  5: "46t",
  6: "57y",
  7: "68u",
  8: "79i",
  9: "80o",
};

const EFEITOS = {
  surgir: {
    keyframes: [{ opacity: 0 }, { opacity: 1 }],
    options: { duration: 360, easing: "cubic-bezier(0.25, 1, 0.5, 1)" },
  },
  desfocar: {
    keyframes: [
      { opacity: 0, filter: "blur(0.3em)" },
      { opacity: 1, filter: "blur(0em)" },
    ],
    options: { duration: 520, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
  },
  subir: {
    keyframes: [
      { opacity: 0, top: "0.6em" },
      { opacity: 1, top: "0em" },
    ],
    options: { duration: 480, easing: "cubic-bezier(0.34, 1.4, 0.64, 1)" },
  },
};

type Erro = { plan: string[]; tail: string[]; fixing: boolean };

/** Separa em grafemas: emojis e letras acentuadas compostas contam como uma letra só. */
const grafemas = (valor: string) => {
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(valor), (p) => p.segment);
  }
  return Array.from(valor);
};

const erroPara = (letra: string) => {
  const teclas = VIZINHAS[letra.toLowerCase()];
  if (!teclas) return null;
  const tecla = teclas[Math.floor(Math.random() * teclas.length)];
  return letra === letra.toLowerCase() ? tecla : tecla.toUpperCase();
};

/**
 * Texto que se digita sozinho, letra por letra, apaga e passa para a próxima frase, com um
 * cursor que pisca e desliza até a posição. Pode errar teclas vizinhas e corrigir, apagar
 * selecionando a frase inteira e animar cada letra que entra.
 *
 * O texto inteiro fica num trecho só para leitores de tela; as letras animadas ficam escondidas
 * deles. Com "reduzir movimento", cada frase aparece de uma vez e o cursor não pisca.
 */
export function TextoDigitado({
  frases,
  elemento = "div",
  velocidade = 50,
  atrasoInicial = 0,
  pausa = 2000,
  velocidadeApagando = 30,
  modoApagar = "voltar",
  repetir = true,
  className = "text-3xl font-bold text-ink",
  mostrarCursor = true,
  esconderCursorDigitando = false,
  estiloCursor = "caractere",
  cursor = "|",
  corCursor = "currentColor",
  classeCursor = "",
  duracaoPiscar = 0.5,
  cursorDesliza = true,
  efeito = "nenhum",
  erros = 0,
  prefixo = "",
  corPrefixo = "currentColor",
  cores = [],
  velocidadeVariavel,
  aoCompletarFrase,
  aoEntrarNaTela = false,
  reverso = false,
}: {
  /** Frases digitadas em sequência (ou uma só). */
  frases: string[] | string;
  /** Elemento que envolve o texto: "div", "h1", "span"... */
  elemento?: ElementType;
  /** Milissegundos por letra ao digitar. */
  velocidade?: number;
  /** Milissegundos antes da primeira letra de cada frase. */
  atrasoInicial?: number;
  /** Milissegundos com a frase completa antes de apagar. */
  pausa?: number;
  /** Milissegundos por letra ao apagar. */
  velocidadeApagando?: number;
  /** "voltar": apaga letra por letra. "selecionar": seleciona a frase e apaga de uma vez. */
  modoApagar?: "voltar" | "selecionar";
  /** Volta para a primeira frase depois da última. Sem repetir, a última fica na tela. */
  repetir?: boolean;
  className?: string;
  mostrarCursor?: boolean;
  /** Esconde o cursor enquanto digita ou apaga; ele só aparece nas pausas. */
  esconderCursorDigitando?: boolean;
  /** Formato do cursor: o caractere de `cursor`, uma barra, um bloco ou um sublinhado. */
  estiloCursor?: "caractere" | "barra" | "bloco" | "sublinhado";
  /** Caractere do cursor, com `estiloCursor="caractere"`. */
  cursor?: string;
  corCursor?: string;
  classeCursor?: string;
  /** Segundos de cada piscada do cursor; 0 deixa ele aceso. */
  duracaoPiscar?: number;
  /** O cursor desliza até a próxima letra em vez de pular. */
  cursorDesliza?: boolean;
  /** Animação de cada letra que entra. */
  efeito?: "nenhum" | "surgir" | "desfocar" | "subir";
  /** Frequência de erros de digitação (0 a 1): digita uma tecla vizinha e corrige. */
  erros?: number;
  /** Texto fixo antes das frases, como "> " num terminal. */
  prefixo?: string;
  corPrefixo?: string;
  /** Uma cor por frase, em ciclo. Sem cores, usa a cor do texto. */
  cores?: string[];
  /** Velocidade sorteada entre `min` e `max` a cada letra, como alguém digitando. */
  velocidadeVariavel?: { min: number; max: number };
  /** Chamada quando uma frase termina de ser apagada. */
  aoCompletarFrase?: (frase: string, indice: number) => void;
  /** Só começa quando o texto entra na tela. */
  aoEntrarNaTela?: boolean;
  /** Digita da última letra para a primeira. */
  reverso?: boolean;
}) {
  const [textIndex, setTextIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState(0);
  const [typo, setTypo] = useState<Erro | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const blinkRef = useRef<HTMLSpanElement>(null);
  const blinkTimeline = useRef<gsap.core.Timeline | null>(null);
  const blinkResume = useRef<gsap.core.Tween | null>(null);
  const caretPosition = useRef<{ x: number; y: number } | null>(null);
  const placeCursor = useRef<(instant: boolean) => void>(() => {});
  const lastTypo = useRef(-1);
  const onSentenceCompleteRef = useRef(aoCompletarFrase);
  const reduceMotion = useSemMovimento();
  const emTela = useEmTela(containerRef, { limiar: 0.1 });
  const isVisible = !aoEntrarNaTela || emTela;

  const textKey = Array.isArray(frases) ? frases.join("\u0000") : String(frases ?? "");
  const textArray = useMemo(() => textKey.split("\u0000"), [textKey]);
  const index = textIndex % textArray.length;
  const chars = useMemo(() => grafemas(textArray[index]), [textArray, index]);
  const total = chars.length;
  const shown = Math.min(count, total);
  const minSpeed = velocidadeVariavel?.min ?? velocidade;
  const maxSpeed = velocidadeVariavel?.max ?? velocidade;
  const pace = (minSpeed + maxSpeed) / 2;
  const glideTime = Math.min(0.18, Math.max(0.06, pace * 0.0016));

  useEffect(() => {
    onSentenceCompleteRef.current = aoCompletarFrase;
  }, [aoCompletarFrase]);

  // Piscada suave do cursor (aceso, apaga, acende), em loop
  useEffect(() => {
    const blink = blinkRef.current;
    if (!mostrarCursor || !blink) return;
    gsap.set(blink, { opacity: 1 });
    if (reduceMotion || duracaoPiscar <= 0) return;

    const hold = duracaoPiscar * 0.7;
    const fade = duracaoPiscar * 0.45;
    const timeline = gsap.timeline({ repeat: -1 });
    timeline
      .to(blink, { opacity: 0, duration: fade, ease: "sine.inOut" }, hold)
      .to(blink, { opacity: 1, duration: fade, ease: "sine.inOut" }, hold + fade + duracaoPiscar * 0.4);
    blinkTimeline.current = timeline;

    return () => {
      timeline.kill();
      blinkResume.current?.kill();
      gsap.killTweensOf(blink);
      blinkTimeline.current = null;
    };
  }, [mostrarCursor, duracaoPiscar, reduceMotion]);

  useIsomorphicLayoutEffect(() => {
    caretPosition.current = null;
  }, [mostrarCursor]);

  // O cursor fica fora do texto e segue um marcador invisível de largura zero
  useIsomorphicLayoutEffect(() => {
    placeCursor.current = (instant) => {
      const caret = caretRef.current;
      const cursorEl = cursorRef.current;
      if (!caret || !cursorEl) return;

      const x = caret.offsetLeft;
      const y = caret.offsetTop;
      const last = caretPosition.current;
      if (last && Math.abs(last.x - x) < 0.5 && Math.abs(last.y - y) < 0.5) return;
      caretPosition.current = { x, y };

      if (instant || !last || !cursorDesliza || reduceMotion || Math.abs(last.y - y) > 1) {
        gsap.killTweensOf(cursorEl);
        gsap.set(cursorEl, { x, y });
      } else {
        gsap.to(cursorEl, { x, y, duration: glideTime, ease: "power3.out", overwrite: true });
      }

      // Enquanto digita, o cursor fica aceso; a piscada recomeça depois
      const timeline = blinkTimeline.current;
      const blink = blinkRef.current;
      if (instant || !timeline || !blink) return;
      timeline.pause();
      blinkResume.current?.kill();
      gsap.to(blink, { opacity: 1, duration: 0.12, ease: "power1.out" });
      blinkResume.current = gsap.delayedCall(0.12, () => {
        timeline.restart();
      });
    };
    placeCursor.current(false);
  });

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => placeCursor.current(true));
    observer.observe(node);
    return () => observer.disconnect();
  }, [elemento]);

  // Máquina de estados da digitação: um passo por timeout
  useEffect(() => {
    if (!isVisible) return;

    let timeout: ReturnType<typeof setTimeout>;
    const wait = (ms: number, next: () => void) => {
      timeout = setTimeout(next, ms);
    };
    const speed = () => minSpeed + Math.random() * (maxSpeed - minSpeed);

    if (!isDeleting) {
      if (typo) {
        if (reduceMotion) {
          wait(0, () => setTypo(null));
        } else if (!typo.fixing) {
          if (typo.tail.length < typo.plan.length) {
            wait(speed(), () => setTypo({ ...typo, tail: typo.plan.slice(0, typo.tail.length + 1) }));
          } else {
            wait(260 + Math.random() * 320, () => setTypo({ ...typo, fixing: true }));
          }
        } else if (typo.tail.length) {
          wait(Math.max(45, velocidadeApagando), () => setTypo({ ...typo, tail: typo.tail.slice(0, -1) }));
        } else {
          wait(90 + Math.random() * 140, () => setTypo(null));
        }
      } else if (shown < total) {
        const lead = shown === 0 ? atrasoInicial : 0;
        const next = reverso ? total - shown - 1 : shown;
        const wrong = erros > 0 && shown > 0 && lastTypo.current !== next ? erroPara(chars[next]) : null;

        if (reduceMotion) {
          wait(lead, () => setCount(total));
        } else if (wrong && Math.random() < Math.min(1, erros) * 0.16) {
          lastTypo.current = next;
          const plan = [wrong];
          const follow = chars[reverso ? next - 1 : next + 1];
          if (follow && follow.trim() && Math.random() < 0.4) plan.push(follow);
          wait(lead + speed(), () => setTypo({ plan, tail: [wrong], fixing: false }));
        } else {
          wait(lead + speed(), () => setCount(shown + 1));
        }
      } else if (repetir || index < textArray.length - 1) {
        wait(pausa, () => setIsDeleting(true));
      }
    } else if (shown > 0) {
      if (reduceMotion) {
        wait(0, () => setCount(0));
      } else if (modoApagar === "selecionar") {
        if (selected < shown) {
          wait(velocidadeApagando, () => setSelected(selected + 1));
        } else {
          wait(Math.max(160, velocidadeApagando * 8), () => {
            setSelected(0);
            setCount(0);
          });
        }
      } else {
        wait(velocidadeApagando, () => setCount(shown - 1));
      }
    } else {
      wait(0, () => {
        onSentenceCompleteRef.current?.(textArray[index], index);
        lastTypo.current = -1;
        setSelected(0);
        setIsDeleting(false);
        setTextIndex((index + 1) % textArray.length);
      });
    }

    return () => clearTimeout(timeout);
  }, [
    isVisible,
    isDeleting,
    shown,
    total,
    chars,
    selected,
    typo,
    index,
    textArray,
    repetir,
    velocidadeApagando,
    modoApagar,
    pausa,
    atrasoInicial,
    minSpeed,
    maxSpeed,
    erros,
    reverso,
    reduceMotion,
  ]);

  const animateChar = useCallback(
    (node: HTMLSpanElement | null) => {
      const effect = efeito === "nenhum" ? null : EFEITOS[efeito];
      if (!node || !effect || reduceMotion || typeof node.animate !== "function") return;
      node.animate(effect.keyframes, effect.options);
    },
    [efeito, reduceMotion],
  );

  const start = reverso ? total - shown : 0;
  const marked = Math.min(selected, shown);
  const correct = chars.slice(start, start + shown).map((char, i) => {
    const isMarked = reverso ? i < marked : i >= shown - marked;
    return (
      <span
        key={start + i}
        ref={animateChar}
        className={isMarked ? "relative bg-[color-mix(in_srgb,currentColor_25%,transparent)]" : "relative"}
      >
        {char}
      </span>
    );
  });
  const mistyped = (typo?.tail ?? []).map((char, i) => (
    <span key={`erro-${i}`} ref={animateChar} className="relative">
      {char}
    </span>
  ));
  if (reverso) mistyped.reverse();

  const caret = (
    <span ref={caretRef} className="inline-block w-0">
      {"​"}
    </span>
  );
  const color = cores.length ? cores[index % cores.length] : "inherit";
  const typing = shown < total || isDeleting || typo !== null;
  const hideCursor = esconderCursorDigitando && typing;
  const customCursorColor = corCursor && corCursor !== "currentColor" ? { color: corCursor } : undefined;
  const forma = {
    barra: "h-[1.1em] w-[max(2px,0.07em)] rounded-[1px] align-[-0.2em]",
    bloco: "h-[1.1em] w-[0.56em] rounded-[0.06em] align-[-0.2em]",
    sublinhado: "h-[max(2px,0.075em)] w-[0.56em] rounded-[1px] align-[-0.12em]",
    caractere: "",
  }[estiloCursor];

  const Elemento = elemento;
  return (
    <Elemento ref={containerRef} className={`relative inline-block whitespace-pre-wrap ${className}`}>
      <span className="sr-only">{prefixo + textArray.join(" ")}</span>
      <span aria-hidden="true">
        {prefixo ? <span style={{ color: corPrefixo }}>{prefixo}</span> : null}
        {reverso && caret}
        <span style={{ color }}>{reverso ? [...mistyped, ...correct] : [...correct, ...mistyped]}</span>
        {!reverso && caret}
      </span>
      {mostrarCursor && (
        <span
          ref={cursorRef}
          aria-hidden="true"
          className={`pointer-events-none absolute top-0 left-0 whitespace-pre transition-opacity duration-200 will-change-transform ${
            hideCursor ? "opacity-0" : ""
          } ${classeCursor}`}
          style={customCursorColor}
        >
          <span ref={blinkRef} className={`inline-block ${estiloCursor === "caractere" ? "ml-1" : ""}`}>
            {estiloCursor === "caractere" ? cursor : <span className={`ml-[0.06em] inline-block bg-current ${forma}`} />}
          </span>
        </span>
      )}
    </Elemento>
  );
}
