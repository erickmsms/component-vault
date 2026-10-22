"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  AnimatePresence,
  MotionConfig,
  animate as animarValor,
  motion,
  useMotionValue,
  useReducedMotion,
  type TargetAndTransition,
  type Transition,
} from "motion/react";

// Porte do RotatingText do React Bits (reactbits.dev/text-animations/rotating-text).
// A lógica segue o original; a API pública está em português.

export type EfeitoDeRotacao = "deslizar" | "virar" | "desfocar" | "escala" | "cair";
export type OrigemDoEscalonamento = "primeiro" | "ultimo" | "centro" | "aleatorio" | number;

export type ControleDoTextoRotativo = {
  proximo: () => void;
  anterior: () => void;
  irPara: (indice: number) => void;
  reiniciar: () => void;
};

type Estado = TargetAndTransition;
type Predefinicao = {
  inicial: Estado;
  animar: Estado;
  saida: Estado;
  transicao: Transition;
  transicaoDeSaida?: Transition;
};

const MOLA_LAYOUT: Transition = { type: "spring", damping: 25, stiffness: 300 };
const MOLA_LARGURA: Transition = { type: "spring", damping: 34, stiffness: 320 };
const ESTILO_VIRAR: CSSProperties = { transformOrigin: "50% 50% -0.45em", backfaceVisibility: "hidden" };

const EFEITOS: Record<EfeitoDeRotacao, (subindo: boolean) => Predefinicao> = {
  deslizar: (up) => ({
    inicial: { y: up ? "100%" : "-100%", opacity: 0 },
    animar: { y: 0, opacity: 1 },
    saida: { y: up ? "-120%" : "120%", opacity: 0 },
    transicao: { type: "spring", damping: 25, stiffness: 300 },
  }),
  virar: (up) => ({
    inicial: { rotateX: up ? -90 : 90, opacity: 0, transformPerspective: 480 },
    animar: { rotateX: 0, opacity: 1, transformPerspective: 480 },
    saida: { rotateX: up ? 90 : -90, opacity: 0, transformPerspective: 480 },
    transicao: { type: "tween", duration: 0.6, ease: [0.34, 1.4, 0.64, 1] },
    transicaoDeSaida: { type: "tween", duration: 0.32, ease: [0.5, 0, 0.75, 0] },
  }),
  desfocar: (up) => ({
    inicial: { y: up ? "45%" : "-45%", opacity: 0 },
    animar: { y: 0, opacity: 1 },
    saida: { y: up ? "-45%" : "45%", opacity: 0 },
    transicao: { type: "tween", duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
  escala: (up) => ({
    inicial: { scale: up ? 0.35 : 1.7, opacity: 0 },
    animar: { scale: 1, opacity: 1 },
    saida: { scale: up ? 1.7 : 0.35, opacity: 0 },
    transicao: { type: "spring", damping: 17, stiffness: 240 },
  }),
  cair: () => ({
    inicial: { y: "-110%", opacity: 0 },
    animar: { y: 0, opacity: 1 },
    saida: { y: "110%", opacity: 0 },
    transicao: { type: "spring", damping: 18, stiffness: 320, mass: 0.9 },
    transicaoDeSaida: { type: "tween", duration: 0.3, ease: [0.55, 0, 1, 0.45] },
  }),
};

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const segmentador =
  typeof Intl !== "undefined" && Intl.Segmenter ? new Intl.Segmenter("pt", { granularity: "grapheme" }) : null;

const separarLetras = (texto: string) =>
  segmentador ? Array.from(segmentador.segment(texto), (s) => s.segment) : Array.from(texto);

const comFiltro = (estado: Estado, filter: string): Estado => ({ ...estado, filter });

/** Preto ou branco, o que tiver mais contraste sobre a cor (hex ou rgb). */
const textoLegivel = (cor: string) => {
  const valor = cor.trim();
  let rgb: number[] | null = null;
  const hex = valor.match(/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (hex) {
    const d = hex[1].length < 6 ? [...hex[1].slice(0, 3)].map((c) => c + c).join("") : hex[1].slice(0, 6);
    rgb = [0, 2, 4].map((i) => parseInt(d.slice(i, i + 2), 16));
  } else {
    const fn = valor.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
    if (fn) rgb = fn.slice(1, 4).map(Number);
  }
  if (!rgb) return undefined;
  const [r, g, b] = rgb.map((canal) => {
    const c = Math.min(Math.max(canal / 255, 0), 1);
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.3 ? "#0b0b0c" : "#ffffff";
};

export type TextoRotativoProps = {
  textos: string[];
  efeito?: EfeitoDeRotacao;
  direcao?: "cima" | "baixo";
  /** Fundo colorido que acompanha a largura da palavra. */
  destaque?: boolean;
  corDoDestaque?: string;
  /** Tempo (ms) que cada texto fica parado. */
  intervalo?: number;
  /** Atraso (s) entre uma letra e a próxima. */
  escalonamento?: number;
  origemDoEscalonamento?: OrigemDoEscalonamento;
  repetir?: boolean;
  automatico?: boolean;
  pausarAoPassar?: boolean;
  /** Desfoque (px) na entrada e na saída; o efeito "desfocar" usa 10 se ficar em 0. */
  desfoque?: number;
  dividirPor?: "letras" | "palavras" | "linhas" | string;
  /** Muda o efeito por fora da predefinição. */
  inicial?: Estado;
  animar?: Estado;
  saida?: Estado;
  transicao?: Transition;
  modoDePresenca?: "wait" | "sync" | "popLayout";
  animarPrimeiro?: boolean;
  aoMudar?: (indice: number) => void;
  className?: string;
  classeDaPalavra?: string;
  classeDaLetra?: string;
  style?: CSSProperties;
};

/**
 * Troca uma palavra (ou frase) por outra em ciclo, letra por letra, com cinco efeitos:
 * deslizar, virar, desfocar, escala e cair. Pode ter um fundo de destaque que estica e encolhe
 * com a largura do texto. O `ref` expõe `proximo`, `anterior`, `irPara` e `reiniciar`.
 *
 * Leitores de tela leem só o texto atual. Com "reduzir movimento", a troca é instantânea.
 */
export const TextoRotativo = forwardRef<ControleDoTextoRotativo, TextoRotativoProps>(function TextoRotativo(
  {
    textos,
    efeito = "deslizar",
    direcao = "cima",
    destaque = false,
    corDoDestaque = "#a855f7",
    intervalo = 2000,
    escalonamento = 0,
    origemDoEscalonamento = "primeiro",
    repetir = true,
    automatico = true,
    pausarAoPassar = false,
    desfoque = 0,
    dividirPor = "letras",
    inicial,
    animar,
    saida,
    transicao,
    modoDePresenca = "wait",
    animarPrimeiro = false,
    aoMudar,
    className,
    classeDaPalavra,
    classeDaLetra,
    style,
  },
  ref,
) {
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [emCima, setEmCima] = useState(false);
  const indiceRef = useRef(0);
  const aoMudarRef = useRef(aoMudar);
  useEffect(() => {
    aoMudarRef.current = aoMudar;
  });

  const conteudoRef = useRef<HTMLSpanElement>(null);
  const largura = useMotionValue<number | string>("auto");
  const semMovimento = useReducedMotion();

  const ultimo = Math.max(textos.length - 1, 0);
  const ativo = Math.min(indiceAtual, ultimo);

  const blocos = useMemo(() => {
    const texto = textos[ativo] ?? "";
    if (dividirPor === "letras") {
      const palavras = texto.split(" ");
      return palavras.map((p, i) => ({ partes: separarLetras(p), espaco: i !== palavras.length - 1 }));
    }
    const sep = dividirPor === "palavras" ? " " : dividirPor === "linhas" ? "\n" : dividirPor;
    return texto.split(sep).map((p, i, arr) => ({ partes: [p], espaco: i !== arr.length - 1 }));
  }, [textos, ativo, dividirPor]);

  const ordem = useMemo(() => {
    const total = blocos.reduce((s, b) => s + b.partes.length, 0);
    const embaralhada = Array.from({ length: total }, (_, i) => i).sort(() => Math.random() - 0.5);
    return { total, embaralhada };
  }, [blocos]);

  const atrasoDe = (i: number) => {
    const { total, embaralhada } = ordem;
    const o = origemDoEscalonamento;
    if (o === "primeiro") return i * escalonamento;
    if (o === "ultimo") return (total - 1 - i) * escalonamento;
    if (o === "centro") return Math.abs(Math.floor(total / 2) - i) * escalonamento;
    if (o === "aleatorio") return embaralhada[i] * escalonamento;
    return Math.abs(o - i) * escalonamento;
  };

  const irPara = useCallback((i: number) => {
    if (i === indiceRef.current) return;
    indiceRef.current = i;
    setIndiceAtual(i);
    aoMudarRef.current?.(i);
  }, []);

  const proximo = useCallback(() => {
    const atual = Math.min(indiceRef.current, ultimo);
    irPara(atual < ultimo ? atual + 1 : repetir ? 0 : atual);
  }, [ultimo, repetir, irPara]);

  const anterior = useCallback(() => {
    const atual = Math.min(indiceRef.current, ultimo);
    irPara(atual > 0 ? atual - 1 : repetir ? ultimo : atual);
  }, [ultimo, repetir, irPara]);

  useImperativeHandle(
    ref,
    () => ({
      proximo,
      anterior,
      irPara: (i: number) => irPara(Math.max(0, Math.min(i, ultimo))),
      reiniciar: () => irPara(0),
    }),
    [proximo, anterior, irPara, ultimo],
  );

  const pausado = pausarAoPassar && emCima;

  useEffect(() => {
    if (!automatico || pausado) return;
    const id = setTimeout(proximo, intervalo);
    return () => clearTimeout(id);
  }, [proximo, intervalo, automatico, pausado, ativo]);

  useIsomorphicLayoutEffect(() => {
    const conteudo = conteudoRef.current;
    if (!destaque || !conteudo) {
      largura.set("auto");
      return undefined;
    }
    let controle: ReturnType<typeof animarValor> | null = null;
    let assentado = false;
    const ajustar = () => {
      const alvo = conteudo.offsetWidth + 1;
      controle?.stop();
      if (!assentado || semMovimento) {
        assentado = true;
        largura.set(alvo);
        return;
      }
      controle = animarValor(largura, alvo, MOLA_LARGURA);
    };
    ajustar();
    const observador = typeof ResizeObserver !== "undefined" ? new ResizeObserver(ajustar) : null;
    observador?.observe(conteudo);
    return () => {
      observador?.disconnect();
      controle?.stop();
    };
  }, [destaque, semMovimento, largura]);

  const pre = (EFEITOS[efeito] ?? EFEITOS.deslizar)(direcao !== "baixo");
  const borrao = desfoque > 0 ? desfoque : efeito === "desfocar" ? 10 : 0;
  const de = inicial ?? pre.inicial;
  const repouso = animar ?? pre.animar;
  const para = saida ?? pre.saida;
  const transicaoDaLetra = transicao ?? pre.transicao;
  const transicaoDeSaida = transicao || saida ? null : pre.transicaoDeSaida;
  const entrada = borrao > 0 ? comFiltro(de, `blur(${borrao}px)`) : de;
  const meio = borrao > 0 ? comFiltro(repouso, "blur(0px)") : repouso;
  const fim = borrao > 0 ? comFiltro(para, `blur(${borrao}px)`) : para;
  const estiloDaLetra = efeito === "virar" ? ESTILO_VIRAR : undefined;

  const linhas = dividirPor === "linhas";
  const estiloDoBloco = destaque
    ? { ...style, width: largura, backgroundColor: corDoDestaque, color: textoLegivel(corDoDestaque) ?? style?.color }
    : style;

  const presenca = (
    <AnimatePresence mode={modoDePresenca} initial={animarPrimeiro}>
      <motion.span
        key={ativo}
        className={linhas ? "flex w-full flex-col" : "relative flex flex-wrap whitespace-pre-wrap"}
        layout={!destaque}
        aria-hidden="true"
      >
        {blocos.map((bloco, bi, arr) => {
          const antes = arr.slice(0, bi).reduce((s, b) => s + b.partes.length, 0);
          return (
            <span key={bi} className={["inline-flex", classeDaPalavra].filter(Boolean).join(" ")}>
              {bloco.partes.map((parte, pi) => {
                const atraso = atrasoDe(antes + pi);
                return (
                  <motion.span
                    key={pi}
                    initial={entrada}
                    animate={meio}
                    exit={transicaoDeSaida ? { ...fim, transition: { ...transicaoDeSaida, delay: atraso } } : fim}
                    transition={{ ...transicaoDaLetra, delay: atraso }}
                    className={["inline-block", classeDaLetra].filter(Boolean).join(" ")}
                    style={estiloDaLetra}
                  >
                    {parte}
                  </motion.span>
                );
              })}
              {bloco.espaco && <span className="whitespace-pre"> </span>}
            </span>
          );
        })}
      </motion.span>
    </AnimatePresence>
  );

  return (
    <MotionConfig reducedMotion="user">
      <motion.span
        className={[
          "relative flex flex-wrap whitespace-pre-wrap",
          destaque && "box-content flex-nowrap justify-center overflow-hidden rounded-[0.16em] px-[0.28em] py-[0.1em]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={estiloDoBloco}
        onMouseEnter={() => pausarAoPassar && setEmCima(true)}
        onMouseLeave={() => setEmCima(false)}
        layout={!destaque}
        transition={transicao ?? MOLA_LAYOUT}
      >
        <span className="sr-only">{textos[ativo]}</span>
        {destaque ? (
          <span ref={conteudoRef} className="flex shrink-0 whitespace-pre">
            {presenca}
          </span>
        ) : (
          presenca
        )}
      </motion.span>
    </MotionConfig>
  );
});
