"use client";

import { motion, MotionConfig, type TargetAndTransition, type Transition } from "motion/react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useSemMovimento } from "@/library/revelar/Movimento";

type Instantaneo = Record<string, string | number>;
type Direcao = "cima" | "baixo" | "esquerda" | "direita";
type Efeito = "desfoque" | "zoom" | "inclinar" | "foco" | "deriva";
type Escalonar = "inicio" | "fim" | "centro" | "aleatorio";
type Gatilho = "vista" | "carregar" | "passar" | "clique";
type Fase = "from" | "in" | "rest" | "out";
type Curva = number[] | string;

const EIXOS: Record<Direcao, ["x" | "y", number]> = {
  cima: ["y", -1],
  baixo: ["y", 1],
  esquerda: ["x", -1],
  direita: ["x", 1],
};

const SAIDA_SUAVE = [0.33, 1, 0.68, 1];
const ENTRADA_E_SAIDA = [0.65, 0, 0.35, 1];
const ENTRADA = [0.55, 0, 0.9, 0.45];
const CURVA_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";
const CHAVES_DE_MOVIMENTO = ["x", "y", "scale", "rotateX", "rotateY", "skewX"];
const INSTANTANEO: Transition = { duration: 0 };

const SO_LEITOR_DE_TELA: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
  userSelect: "none",
};

const ESTILO_DA_PECA: CSSProperties = { display: "inline-block", willChange: "transform, filter, opacity" };
const ESTILO_DA_PALAVRA: CSSProperties = { display: "inline-flex" };

const desfocar = (px: number) => `blur(${Math.max(0, px)}px)`;

/** Estados de cada efeito: de onde a peça parte, por onde passa, para onde vai ao sair e como se move. */
function montarEfeito(efeito: Efeito, direcao: Direcao, desfoque: number, distancia: number) {
  const [eixo, sinal] = EIXOS[direcao] ?? EIXOS.cima;
  const b = Math.max(0, desfoque);
  const d = distancia;

  if (efeito === "zoom") {
    return {
      from: { filter: desfocar(b * 1.2), opacity: 0, scale: 1.4, [eixo]: sinal * d * 0.35 } as Instantaneo,
      steps: [
        { filter: desfocar(b * 0.2), opacity: 0.9, scale: 0.97, [eixo]: -sinal * d * 0.03 },
        { filter: desfocar(0), opacity: 1, scale: 1, [eixo]: 0 },
      ] as Instantaneo[],
      exit: { filter: desfocar(b), opacity: 0, scale: 0.82, [eixo]: -sinal * d * 0.2 } as Instantaneo,
      times: [0, 0.6, 1],
      fade: SAIDA_SUAVE as Curva,
      bounce: 0.25 as number | null,
      settle: 0.5,
      origin: undefined as CSSProperties | undefined,
      exitEase: ENTRADA as Curva,
    };
  }

  if (efeito === "inclinar") {
    const giro = eixo === "y" ? "rotateX" : "rotateY";
    const inclinacao = eixo === "y" ? -sinal : sinal;
    return {
      from: { filter: desfocar(b), opacity: 0, [giro]: inclinacao * 55, [eixo]: sinal * d * 0.5, transformPerspective: 600 } as Instantaneo,
      steps: [
        {
          filter: desfocar(b * 0.15),
          opacity: 0.95,
          [giro]: -inclinacao * 8,
          [eixo]: -sinal * d * 0.04,
          transformPerspective: 600,
        },
        { filter: desfocar(0), opacity: 1, [giro]: 0, [eixo]: 0, transformPerspective: 600 },
      ] as Instantaneo[],
      exit: {
        filter: desfocar(b),
        opacity: 0,
        [giro]: -inclinacao * 40,
        [eixo]: -sinal * d * 0.3,
        transformPerspective: 600,
      } as Instantaneo,
      times: [0, 0.6, 1],
      fade: SAIDA_SUAVE as Curva,
      bounce: 0.3 as number | null,
      settle: 0.8,
      origin: {
        originX: eixo === "x" ? (sinal < 0 ? 0 : 1) : 0.5,
        originY: eixo === "y" ? (sinal < 0 ? 0 : 1) : 0.5,
      } as CSSProperties | undefined,
      exitEase: ENTRADA as Curva,
    };
  }

  if (efeito === "foco") {
    const suave = { filter: desfocar(b * 1.4), opacity: 0.32, scale: 1.12 };
    return {
      from: suave as Instantaneo,
      steps: [
        { filter: desfocar(b * 0.1), opacity: 0.95, scale: 0.995 },
        { filter: desfocar(0), opacity: 1, scale: 1 },
      ] as Instantaneo[],
      exit: suave as Instantaneo,
      times: [0, 0.72, 1],
      fade: ENTRADA_E_SAIDA as Curva,
      bounce: null as number | null,
      settle: 1,
      origin: undefined as CSSProperties | undefined,
      exitEase: ENTRADA_E_SAIDA as Curva,
    };
  }

  if (efeito === "deriva") {
    const h = direcao === "direita" ? 1 : -1;
    const v = eixo === "y" ? sinal : 0;
    return {
      from: { filter: desfocar(b), opacity: 0, x: h * d * 1.6, y: v * d * 0.3, skewX: h * 28 } as Instantaneo,
      steps: [
        { filter: desfocar(b * 0.15), opacity: 0.95, x: -h * d * 0.06, y: 0, skewX: -h * 7 },
        { filter: desfocar(0), opacity: 1, x: 0, y: 0, skewX: 0 },
      ] as Instantaneo[],
      exit: { filter: desfocar(b), opacity: 0, x: -h * d * 1.2, y: -v * d * 0.2, skewX: h * 20 } as Instantaneo,
      times: [0, 0.62, 1],
      fade: SAIDA_SUAVE as Curva,
      bounce: 0.3 as number | null,
      settle: 0.55,
      origin: undefined as CSSProperties | undefined,
      exitEase: ENTRADA as Curva,
    };
  }

  return {
    from: { filter: desfocar(b), opacity: 0, [eixo]: sinal * d } as Instantaneo,
    steps: [
      { filter: desfocar(b / 2), opacity: 0.5, [eixo]: (-sinal * d) / 10 },
      { filter: desfocar(0), opacity: 1, [eixo]: 0 },
    ] as Instantaneo[],
    exit: { filter: desfocar(b), opacity: 0, [eixo]: -sinal * d * 0.6 } as Instantaneo,
    times: [0, 0.5, 1],
    fade: "linear" as Curva,
    bounce: 0.35 as number | null,
    settle: 0.5,
    origin: undefined as CSSProperties | undefined,
    exitEase: ENTRADA as Curva,
  };
}

/** Junta o estado inicial e os passos numa lista de quadros-chave por propriedade. */
function montarQuadros(de: Instantaneo, passos: Instantaneo[]) {
  const chaves = new Set([...Object.keys(de), ...passos.flatMap((p) => Object.keys(p))]);
  const quadros: Record<string, (string | number)[]> = {};
  chaves.forEach((k) => {
    quadros[k] = [de[k], ...passos.map((p) => p[k])];
  });
  return quadros;
}

/** Posição de cada peça na ordem de entrada (0 = primeira a aparecer). */
function montarOrdem(quantidade: number, escalonarDe: Escalonar, semente: string) {
  const ordem = Array.from({ length: quantidade }, (_, i) => i);
  if (escalonarDe === "fim") return ordem.map((i) => quantidade - 1 - i);
  if (escalonarDe === "centro") {
    const meio = (quantidade - 1) / 2;
    const folga = quantidade % 2 === 0 ? 0.5 : 0;
    return ordem.map((i) => Math.abs(i - meio) - folga);
  }
  if (escalonarDe === "aleatorio") {
    // Sorteio com semente fixa no texto: o mesmo texto sempre embaralha igual (sem divergir no servidor)
    let s = 2166136261;
    for (let i = 0; i < semente.length; i++) s = Math.imul(s ^ semente.charCodeAt(i), 16777619) >>> 0;
    const proximo = () => {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
    const sorteio = ordem.slice();
    for (let i = sorteio.length - 1; i > 0; i--) {
      const j = Math.floor(proximo() * (i + 1));
      [sorteio[i], sorteio[j]] = [sorteio[j], sorteio[i]];
    }
    sorteio.forEach((peca, posicao) => {
      ordem[peca] = posicao;
    });
  }
  return ordem;
}

const faseInicial = (gatilho: Gatilho): Fase =>
  gatilho === "carregar" ? "in" : gatilho === "passar" || gatilho === "clique" ? "rest" : "from";

/**
 * Texto que entra em foco: cada palavra (ou letra) começa desfocada e transparente, desliza
 * até o lugar e fica nítida, uma depois da outra. Port do BlurText do React Bits (motion),
 * com as props em português.
 *
 * Os efeitos vão de `desfoque` (o clássico) a `zoom`, `inclinar`, `foco` e `deriva`. O texto
 * inteiro fica num trecho só para leitores de tela; as peças animadas ficam escondidas deles.
 * Com "reduzir movimento", o texto aparece nítido, parado.
 */
export function TextoDesfocado({
  texto = "",
  atraso = 200,
  className = "text-3xl font-bold text-ink",
  animarPor = "palavras",
  direcao = "cima",
  limiar = 0.1,
  margem = "0px",
  animacaoDe,
  animacaoPara,
  curva,
  aoConcluir,
  duracaoPasso = 0.35,
  desfoque = 10,
  distancia = 50,
  efeito = "desfoque",
  escalonarDe = "inicio",
  gatilho = "vista",
  repetir = false,
  pausaRepeticao = 2,
  cor,
  corInicial,
  focarAoPassar = false,
}: {
  texto?: string;
  /** Milissegundos entre uma peça e a próxima. */
  atraso?: number;
  /** Classes do parágrafo (tamanho, peso e cor do texto). */
  className?: string;
  /** Anima palavra por palavra ou letra por letra. */
  animarPor?: "palavras" | "letras";
  /** Lado de onde as peças chegam (nos efeitos que se movem). */
  direcao?: Direcao;
  /** Fração do texto que precisa estar na tela para começar (gatilho `vista`). */
  limiar?: number;
  /** Margem em volta da tela para a detecção (gatilho `vista`), como no `rootMargin`. */
  margem?: string;
  /** Estado inicial próprio (propriedades do motion). Substitui o do efeito. */
  animacaoDe?: Instantaneo;
  /** Passos próprios até o estado final, em ordem. Substitui os do efeito. */
  animacaoPara?: Instantaneo[];
  /** Curva própria para a animação (nome do motion ou os 4 números do cubic-bezier). */
  curva?: Curva;
  /** Chamado quando a entrada termina. */
  aoConcluir?: () => void;
  /** Segundos de cada passo da entrada. */
  duracaoPasso?: number;
  /** Desfoque inicial, em px. */
  desfoque?: number;
  /** Deslocamento inicial, em px. */
  distancia?: number;
  /** Estilo da entrada. */
  efeito?: Efeito;
  /** De onde a sequência começa: da primeira peça, da última, do meio ou em ordem aleatória. */
  escalonarDe?: Escalonar;
  /**
   * Quando tocar: ao entrar na tela (`vista`), ao montar (`carregar`), a cada vez que o mouse
   * entra (`passar`) ou a cada clique (`clique`); estes dois começam com o texto já nítido.
   */
  gatilho?: Gatilho;
  /** Sai e entra de novo sem parar. */
  repetir?: boolean;
  /** Segundos com o texto nítido antes de sair, ao repetir. */
  pausaRepeticao?: number;
  /** Cor do texto. */
  cor?: string;
  /** Cor das peças antes de entrar; elas passam dela para a cor final. */
  corInicial?: string;
  /** Desfoca as outras palavras enquanto o mouse está em uma. */
  focarAoPassar?: boolean;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const semMovimento = useSemMovimento();
  const [faseGuardada, setFase] = useState<Fase>(() => faseInicial(gatilho));
  const [primeiraFase] = useState(faseGuardada);
  const [palavraEmFoco, setPalavraEmFoco] = useState(-1);
  // Com "reduzir movimento", o texto fica nítido e parado
  const fase: Fase = semMovimento ? "rest" : faseGuardada;
  const assentado = useRef(fase === "rest");
  const concluir = useRef(aoConcluir);
  useEffect(() => {
    concluir.current = aoConcluir;
  });

  const fx = useMemo(() => montarEfeito(efeito, direcao, desfoque, distancia), [efeito, direcao, desfoque, distancia]);

  const personalizado = Boolean(animacaoDe || animacaoPara || curva);
  const instantaneoInicial = animacaoDe ?? fx.from;
  const passos = animacaoPara ?? fx.steps;
  const instantaneoDeSaida = animacaoDe ?? fx.exit;
  const instantaneoFinal = passos[passos.length - 1];
  const quadros = useMemo(
    () => montarQuadros(instantaneoInicial, personalizado ? passos : [instantaneoFinal]),
    [instantaneoInicial, passos, instantaneoFinal, personalizado],
  );

  const quantidadeDePassos = passos.length + 1;
  const duracaoTotal = duracaoPasso * (quantidadeDePassos - 1);
  const tempos = animacaoPara
    ? Array.from({ length: quantidadeDePassos }, (_, i) => (quantidadeDePassos === 1 ? 0 : i / (quantidadeDePassos - 1)))
    : fx.times;
  const escalonamento = Math.max(0, atraso) / 1000;
  const duracaoDaSaida = duracaoPasso * 1.3;
  const escalonamentoDaSaida = escalonamento * 0.4;

  const palavras = useMemo(() => texto.split(" "), [texto]);

  const pecas = useMemo(() => {
    const lista: { palavra: number; conteudo: string; chave: string }[] = [];
    palavras.forEach((palavra, p) => {
      const ultima = p === palavras.length - 1;
      if (animarPor === "palavras") {
        lista.push({ palavra: p, conteudo: ultima ? palavra : `${palavra} `, chave: `palavra-${p}` });
        return;
      }
      Array.from(palavra).forEach((letra, l) => lista.push({ palavra: p, conteudo: letra, chave: `letra-${p}-${l}` }));
      if (!ultima) lista.push({ palavra: p, conteudo: " ", chave: `espaco-${p}` });
    });
    return lista;
  }, [palavras, animarPor]);

  const grupos = useMemo(() => {
    const lista: number[][] = palavras.map(() => []);
    pecas.forEach((peca, indice) => lista[peca.palavra].push(indice));
    return lista;
  }, [palavras, pecas]);

  const ordem = useMemo(() => montarOrdem(pecas.length, escalonarDe, texto), [pecas.length, escalonarDe, texto]);
  const maiorPosicao = ordem.reduce((maior, posicao) => Math.max(maior, posicao), 0);
  const totalDaEntrada = (duracaoTotal * (personalizado ? 1 : Math.max(1, fx.settle * 2.2)) + maiorPosicao * escalonamento) * 1000;
  const totalDaSaida = (duracaoDaSaida + maiorPosicao * escalonamentoDaSaida) * 1000;
  const repete = repetir && !semMovimento;

  // Gatilho `vista`: começa quando o texto entra na tela
  useEffect(() => {
    if (fase !== "from") return;
    const el = ref.current;
    if (!el) return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setFase((atual) => (atual === "from" ? "in" : atual));
          observador.disconnect();
        }
      },
      { threshold: limiar, rootMargin: margem },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, [fase, limiar, margem]);

  // Ciclo entre as fases: entrada → nítido (→ saída → entrada, ao repetir)
  useEffect(() => {
    let timer = 0;
    if (fase === "in") {
      assentado.current = false;
      timer = window.setTimeout(() => {
        assentado.current = true;
        concluir.current?.();
        if (repete) timer = window.setTimeout(() => setFase("out"), Math.max(0, pausaRepeticao) * 1000);
      }, totalDaEntrada);
    } else if (fase === "rest") {
      assentado.current = true;
      if (repete) timer = window.setTimeout(() => setFase("out"), Math.max(0, pausaRepeticao) * 1000);
    } else if (fase === "out") {
      assentado.current = false;
      timer = window.setTimeout(() => setFase("in"), totalDaSaida);
    }
    return () => window.clearTimeout(timer);
  }, [fase, repete, pausaRepeticao, totalDaEntrada, totalDaSaida]);

  const tocarDeNovo = () => {
    if (fase === "out" || fase === "from") return;
    setFase("out");
  };

  const transicaoDeEntrada = (posicao: number): Transition => {
    const atrasada = posicao * escalonamento;
    if (personalizado) return { duration: duracaoTotal, times: tempos, delay: atrasada, ease: (curva ?? "linear") as never };
    const transicao: Record<string, unknown> = { duration: duracaoTotal, delay: atrasada, ease: fx.fade };
    if (fx.bounce === null) return transicao as Transition;
    const mola = { type: "spring", visualDuration: duracaoTotal * fx.settle, bounce: fx.bounce, delay: atrasada };
    CHAVES_DE_MOVIMENTO.forEach((chave) => {
      if (chave in instantaneoInicial) transicao[chave] = mola;
    });
    return transicao as Transition;
  };

  const alvo = (
    fase === "in" ? quadros : fase === "out" ? instantaneoDeSaida : fase === "rest" ? instantaneoFinal : instantaneoInicial
  ) as TargetAndTransition;
  const tingida = Boolean(corInicial) && (fase === "from" || fase === "out");
  const atenuacao = Math.min(6, Math.max(2, desfoque * 0.3));
  const estiloBase = fx.origin && !personalizado ? { ...ESTILO_DA_PECA, ...fx.origin } : ESTILO_DA_PECA;

  const desenharPeca = (indice: number) => {
    const peca = pecas[indice];
    const posicao = ordem[indice];
    const transicao: Transition =
      fase === "in"
        ? transicaoDeEntrada(posicao)
        : fase === "out"
          ? { duration: duracaoDaSaida, ease: fx.exitEase as never, delay: posicao * escalonamentoDaSaida }
          : INSTANTANEO;
    const estilo: CSSProperties = corInicial
      ? {
          ...estiloBase,
          color: tingida ? corInicial : undefined,
          transition:
            fase === "in"
              ? `color ${duracaoTotal * 0.9}s ${CURVA_CSS} ${posicao * escalonamento}s`
              : fase === "out"
                ? `color ${duracaoDaSaida}s ${CURVA_CSS} ${posicao * escalonamentoDaSaida}s`
                : "none",
        }
      : estiloBase;

    return (
      <motion.span
        aria-hidden="true"
        key={peca.chave}
        style={estilo}
        initial={primeiraFase === "rest" ? false : (instantaneoInicial as TargetAndTransition)}
        animate={alvo}
        transition={transicao}
      >
        {peca.conteudo}
      </motion.span>
    );
  };

  const estiloDaPalavra = (p: number): CSSProperties => {
    if (!focarAoPassar) return ESTILO_DA_PALAVRA;
    const apagada = palavraEmFoco !== -1 && palavraEmFoco !== p;
    return {
      ...ESTILO_DA_PALAVRA,
      filter: apagada ? `blur(${atenuacao}px)` : "blur(0px)",
      opacity: apagada ? 0.3 : 1,
      transition: `filter 0.45s ${CURVA_CSS}, opacity 0.45s ${CURVA_CSS}`,
    };
  };

  return (
    <MotionConfig reducedMotion="user">
      <p
        ref={ref}
        className={className}
        style={{ display: "flex", flexWrap: "wrap", color: cor, cursor: gatilho === "clique" ? "pointer" : undefined }}
        onPointerEnter={gatilho === "passar" ? () => assentado.current && tocarDeNovo() : undefined}
        onClick={gatilho === "clique" ? tocarDeNovo : undefined}
      >
        <span style={SO_LEITOR_DE_TELA}>{texto}</span>
        {grupos.map((indices, p) => (
          <span
            key={`palavra-${p}`}
            style={estiloDaPalavra(p)}
            onPointerEnter={focarAoPassar ? () => setPalavraEmFoco(p) : undefined}
            onPointerLeave={focarAoPassar ? () => setPalavraEmFoco(-1) : undefined}
          >
            {indices.map(desenharPeca)}
          </span>
        ))}
      </p>
    </MotionConfig>
  );
}
