"use client";

import { useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { useSemMovimento } from "@/library/revelar/Movimento";

const LARGURA = 1200;
const ALTURA = 520;
const CX = LARGURA / 2;
const CY = ALTURA / 2;
const MARGEM_DA_BORDA = 6;
const PASSOS_DO_ESMAECIMENTO = 8;
const ARREMESSO_MAXIMO = 2600;
const IMPULSO_MAXIMO = 1600;

type Forma = "onda" | "circulo" | "infinito" | "arco" | "reta";

const suave = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const voltar = (v: number, tamanho: number) => ((v % tamanho) + tamanho) % tamanho;

const raioDoCirculo = (curvatura: number, larguraFita: number) =>
  Math.min(90 + Math.max(0, curvatura) * 0.95, Math.max(20, CY - Math.max(0, larguraFita) / 2 - MARGEM_DA_BORDA));

/** Caminho da forma, no espaço de 1200×520 do SVG. `espelhado` vira a forma para a fita que cruza por baixo. */
function montarCaminho(forma: Forma, curvatura: number, larguraFita: number, espelhado = false) {
  const c = Math.max(0, curvatura);
  const folga = Math.max(20, CY - Math.max(0, larguraFita) / 2 - MARGEM_DA_BORDA);
  const sinal = espelhado ? -1 : 1;

  switch (forma) {
    case "circulo": {
      const r = raioDoCirculo(curvatura, larguraFita);
      if (espelhado) {
        const rx = r * 1.22;
        const ry = r * 0.42;
        return `M ${CX - rx} ${CY} A ${rx} ${ry} 0 1 1 ${CX + rx} ${CY} A ${rx} ${ry} 0 1 1 ${CX - rx} ${CY} Z`;
      }
      return `M ${CX - r} ${CY} A ${r} ${r} 0 1 1 ${CX + r} ${CY} A ${r} ${r} 0 1 1 ${CX - r} ${CY} Z`;
    }
    case "infinito": {
      const r = 150 + c * 1.4;
      const h = Math.min(60 + c * 0.95, folga);
      return [
        `M ${CX} ${CY}`,
        `C ${CX + r * 0.55} ${CY - h} ${CX + r} ${CY - h} ${CX + r} ${CY}`,
        `C ${CX + r} ${CY + h} ${CX + r * 0.55} ${CY + h} ${CX} ${CY}`,
        `C ${CX - r * 0.55} ${CY - h} ${CX - r} ${CY - h} ${CX - r} ${CY}`,
        `C ${CX - r} ${CY + h} ${CX - r * 0.55} ${CY + h} ${CX} ${CY}`,
        "Z",
      ].join(" ");
    }
    case "arco": {
      const subida = Math.min(120 + c * 1.1, folga * 2) * sinal;
      return `M 120 ${CY + subida / 2} Q ${CX} ${CY - subida * 1.5} ${LARGURA - 120} ${CY + subida / 2}`;
    }
    case "reta":
      return `M -320 ${CY} L ${LARGURA + 320} ${CY}`;
    case "onda":
    default: {
      const a = Math.min(c * 2.2, folga * 2) * sinal;
      return `M -320 ${CY} Q -160 ${CY - a} 0 ${CY} T 320 ${CY} T 640 ${CY} T 960 ${CY} T 1280 ${CY} T ${LARGURA + 320} ${CY}`;
    }
  }
}

/** Degraus de opacidade nas duas pontas do gradiente que esmaece as bordas. */
function montarEsmaecimento(esmaecer: number) {
  const largura = Math.min(1, Math.max(0, esmaecer)) * 0.3;
  if (largura <= 0) return [];
  const paradas: { posicao: number; opacidade: number }[] = [];
  for (let i = 0; i <= PASSOS_DO_ESMAECIMENTO; i++) {
    const t = i / PASSOS_DO_ESMAECIMENTO;
    paradas.push({ posicao: t * largura, opacidade: suave(t) });
  }
  for (let i = PASSOS_DO_ESMAECIMENTO; i >= 0; i--) {
    const t = i / PASSOS_DO_ESMAECIMENTO;
    paradas.push({ posicao: 1 - t * largura, opacidade: suave(t) });
  }
  return paradas;
}

function lerHex(valor: string) {
  const m = /^#?([\da-f]{3}|[\da-f]{6})$/i.exec(String(valor || "").trim());
  if (!m) return null;
  const hex = m[1].length === 3 ? m[1].replace(/./g, (ch) => ch + ch) : m[1];
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

/** Clareia a cor em direção ao branco (`quanto` de 0 a 1). */
function clarear(cor: string, quanto: number) {
  const rgb = lerHex(cor);
  if (!rgb) return cor;
  return `#${rgb
    .map((v) =>
      Math.round(v + (255 - v) * quanto)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

/** Branco ou quase preto, o que ler melhor sobre a cor. */
function tintaSobre(cor: string) {
  const rgb = lerHex(cor);
  if (!rgb) return "#ffffff";
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.2 ? "#120f17" : "#ffffff";
}

/**
 * Texto que corre em laço por uma forma (onda, círculo, infinito, arco ou reta), em geral
 * sobre uma fita colorida, como uma faixa de aviso. Pode cruzar uma segunda fita, ser arrastado
 * com o dedo ou o mouse (e continuar com a inércia) e acelerar com a rolagem da página.
 * Port do TextLoop do React Bits (SVG + GSAP), com as props em português.
 *
 * O SVG tem um aria-label com o texto e as repetições ficam escondidas de leitores de tela.
 * Com "reduzir movimento", o texto fica parado. Só anima enquanto está na tela.
 */
export function TextoEmCiclo({
  texto = "React ✦ Bits",
  forma = "onda",
  caminho,
  velocidade = 90,
  direcao = "frente",
  separador = "✦",
  curvatura = 90,
  inclinacao = 0,
  tamanhoFonte = 46,
  pesoFonte = 800,
  espacamento = 2,
  maiusculas = true,
  cor,
  fita = true,
  corFita = "#5227FF",
  larguraFita = 86,
  esmaecerBordas = 0,
  pausarAoPassar = true,
  cruzar = false,
  corCruzada,
  anguloCruzado = 16,
  arrastavel = false,
  impulsoDaRolagem = 0,
  contorno = false,
  espessuraContorno = 1.5,
  className = "text-ink",
  style,
}: {
  texto?: string;
  /** Forma do percurso. Ignorada se houver `caminho`. */
  forma?: Forma;
  /** Caminho SVG próprio (atributo `d`, no espaço de 1200×520). Substitui a `forma`. */
  caminho?: string;
  /** Velocidade, em unidades do SVG por segundo. */
  velocidade?: number;
  /** Sentido em que o texto corre. */
  direcao?: "frente" | "tras";
  /** Símbolo entre uma repetição do texto e a próxima. Vazio deixa só espaço. */
  separador?: string;
  /** Quanto a forma se curva (altura da onda, tamanho do círculo, do infinito e do arco). */
  curvatura?: number;
  /** Gira o conjunto, em graus. */
  inclinacao?: number;
  /** Tamanho da fonte, em unidades do SVG. */
  tamanhoFonte?: number;
  pesoFonte?: number;
  /** Espaçamento entre letras, em unidades do SVG. */
  espacamento?: number;
  /** Escreve o texto todo em maiúsculas. */
  maiusculas?: boolean;
  /** Cor do texto. Por padrão, branco sobre a fita ou a cor do texto sem ela. */
  cor?: string;
  /** Desenha a fita colorida atrás do texto. */
  fita?: boolean;
  corFita?: string;
  /** Largura (grossura) da fita. */
  larguraFita?: number;
  /** Quanto as pontas esmaecem (0 a 1); só tem efeito nas formas que passam pelas bordas. */
  esmaecerBordas?: number;
  /** Para suavemente enquanto o mouse está em cima. */
  pausarAoPassar?: boolean;
  /** Cruza uma segunda fita, correndo no sentido contrário, por baixo da principal. */
  cruzar?: boolean;
  /** Cor da fita cruzada. Por padrão, uma versão clara da `corFita`. */
  corCruzada?: string;
  /** Ângulo, em graus, entre as duas fitas. */
  anguloCruzado?: number;
  /** Deixa arrastar o texto; ao soltar, ele segue com a inércia. */
  arrastavel?: boolean;
  /** Quanto a rolagem da página acelera o texto (0 desliga; 1 é um impulso normal). */
  impulsoDaRolagem?: number;
  /** Escreve só o contorno das letras, sem preenchimento. */
  contorno?: boolean;
  espessuraContorno?: number;
  /** Classes do contêiner. A cor do texto sem fita vem daqui. */
  className?: string;
  style?: CSSProperties;
}) {
  const raiz = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const caminhoRef = useRef<SVGPathElement>(null);
  const caminhoCruzadoRef = useRef<SVGPathElement>(null);
  const medidaRef = useRef<SVGTextElement>(null);
  const frenteRef = useRef<SVGTextPathElement>(null);
  const atrasRef = useRef<SVGTextPathElement>(null);
  const frenteCruzadaRef = useRef<SVGTextPathElement>(null);
  const atrasCruzadaRef = useRef<SVGTextPathElement>(null);
  const progressoRef = useRef(0);
  const semMovimento = useSemMovimento();

  const [medidas, setMedidas] = useState({ comprimento: 0, repeticoes: 1, comprimentoCruzado: 0, repeticoesCruzadas: 1 });

  const base = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const idCaminho = `texto-em-ciclo-${base}`;
  const idCruzado = `${idCaminho}-cruzado`;
  const idDegrade = `${idCaminho}-degrade`;
  const idMascara = `${idCaminho}-mascara`;
  const idSombra = `${idCaminho}-sombra`;
  const idPorBaixo = `${idCaminho}-por-baixo`;

  const personalizado = Boolean(caminho);
  const d = useMemo(
    () => caminho || montarCaminho(forma, curvatura, larguraFita),
    [caminho, forma, curvatura, larguraFita],
  );
  const dCruzado = useMemo(() => {
    if (!cruzar) return "";
    if (caminho) return caminho;
    return montarCaminho(forma, curvatura, larguraFita, forma === "onda" || forma === "arco" || forma === "circulo");
  }, [cruzar, caminho, forma, curvatura, larguraFita]);
  const esmaecimento = useMemo(() => montarEsmaecimento(esmaecerBordas), [esmaecerBordas]);
  const preenchimento = cor || (fita ? "#ffffff" : "currentColor");

  const meia = cruzar ? anguloCruzado / 2 : 0;
  const anguloPrincipal = inclinacao + meia;
  const anguloDaCruzada = inclinacao - meia;
  const girarPrincipal = anguloPrincipal ? `rotate(${anguloPrincipal} ${CX} ${CY})` : undefined;
  const girarCruzada = anguloDaCruzada ? `rotate(${anguloDaCruzada} ${CX} ${CY})` : undefined;
  const fitaCruzada = corCruzada || clarear(corFita, 0.62);
  const preenchimentoCruzado = fita ? tintaSobre(fitaCruzada) : corCruzada || "currentColor";
  const opacidadeCruzada = !fita && !corCruzada ? 0.45 : 1;

  const unidade = useMemo(() => {
    const miolo = maiusculas ? String(texto).toUpperCase() : String(texto);
    const vao = separador ? ` ${separador} ` : "   ";
    return `${miolo}${vao}`;
  }, [texto, separador, maiusculas]);

  const estiloDoTexto = useMemo<CSSProperties>(
    () => ({ fontSize: `${tamanhoFonte}px`, fontWeight: pesoFonte, letterSpacing: `${espacamento}px` }),
    [tamanhoFonte, pesoFonte, espacamento],
  );

  // Mede o percurso e quantas repetições do texto cabem nele (de novo quando a fonte carrega)
  useLayoutEffect(() => {
    const percurso = caminhoRef.current;
    const medida = medidaRef.current;
    if (!percurso || !medida) return;
    let cancelado = false;

    const medir = () => {
      if (cancelado) return;
      let comprimento = 0;
      let largura = 0;
      let comprimentoCruzado = 0;
      try {
        comprimento = percurso.getTotalLength();
        largura = medida.getComputedTextLength();
        comprimentoCruzado = caminhoCruzadoRef.current ? caminhoCruzadoRef.current.getTotalLength() : 0;
      } catch {
        return;
      }
      if (!comprimento) return;

      const repeticoesPara = (total: number) => (largura > 0 ? Math.max(1, Math.round(total / largura)) : 1);
      const nova = {
        comprimento,
        repeticoes: repeticoesPara(comprimento),
        comprimentoCruzado,
        repeticoesCruzadas: repeticoesPara(comprimentoCruzado),
      };
      setMedidas((antes) =>
        antes.comprimento === nova.comprimento &&
        antes.repeticoes === nova.repeticoes &&
        antes.comprimentoCruzado === nova.comprimentoCruzado &&
        antes.repeticoesCruzadas === nova.repeticoesCruzadas
          ? antes
          : nova,
      );
    };

    const quadro = requestAnimationFrame(medir);
    document.fonts?.ready.then(medir);
    return () => {
      cancelado = true;
      cancelAnimationFrame(quadro);
    };
  }, [d, dCruzado, unidade, tamanhoFonte, pesoFonte, espacamento]);

  // Movimento: um único tique do GSAP desloca o texto; arrastar, rolar e passar o mouse só mexem na velocidade
  useLayoutEffect(() => {
    const { comprimento, comprimentoCruzado } = medidas;
    const frente = frenteRef.current;
    const atras = atrasRef.current;
    const el = raiz.current;
    const svg = svgRef.current;
    if (!frente || !atras || !el || !svg || !comprimento) return;

    const cruzadaFrente = frenteCruzadaRef.current;
    const cruzadaAtras = atrasCruzadaRef.current;
    const cruzadas = cruzar && cruzadaFrente && cruzadaAtras && comprimentoCruzado > 0 ? [cruzadaFrente, cruzadaAtras] : null;

    let deslocamento = progressoRef.current * comprimento;
    const aplicar = () => {
      const posicao = voltar(deslocamento, comprimento);
      progressoRef.current = posicao / comprimento;
      frente.setAttribute("startOffset", String(posicao));
      atras.setAttribute("startOffset", String(posicao - comprimento));
      if (cruzadas) {
        const posicaoCruzada = voltar(-deslocamento, comprimentoCruzado);
        cruzadas[0].setAttribute("startOffset", String(posicaoCruzada));
        cruzadas[1].setAttribute("startOffset", String(posicaoCruzada - comprimentoCruzado));
      }
    };
    aplicar();

    const sinal = direcao === "tras" ? -1 : 1;
    const normal = semMovimento ? 0 : Math.max(0, velocidade) * sinal;
    const passando = { escala: 1 };
    const anguloRad = (anguloPrincipal * Math.PI) / 180;
    const circular = !personalizado && forma === "circulo";
    const raio = raioDoCirculo(curvatura, larguraFita);
    const comImpulso = impulsoDaRolagem > 0 && !semMovimento;

    let arremesso = 0;
    let impulso = 0;
    let velocidadeDaRolagem = 0;
    let rolouEm = 0;
    let posicaoDaRolagem = 0;
    let origemDaRolagem: EventTarget | null = null;
    let arrastando = false;
    let idDoPonteiro: number | null = null;
    let ultimoX = 0;
    let ultimoY = 0;
    let ultimoT = 0;
    let velocidadeDoArrasto = 0;
    let centro = { x: 0, y: 0 };
    let rodando = false;

    const tique = (_: number, deltaMs: number) => {
      if (arrastando) return;
      const dt = Math.min(0.05, deltaMs / 1000);
      arremesso *= Math.exp(-dt / 0.55);
      if (comImpulso) {
        if (performance.now() - rolouEm > 90) velocidadeDaRolagem *= Math.exp(-dt / 0.12);
        const alvo = limitar(velocidadeDaRolagem * impulsoDaRolagem * 0.35 * sinal, -IMPULSO_MAXIMO, IMPULSO_MAXIMO);
        impulso += (alvo - impulso) * (1 - Math.exp(-dt / 0.18));
      }
      const v = normal * passando.escala + arremesso + impulso;
      if (Math.abs(v) < 0.01) return;
      deslocamento += v * dt;
      aplicar();
    };

    const comecar = () => {
      if (rodando || semMovimento) return;
      rodando = true;
      gsap.ticker.add(tique);
    };
    const parar = () => {
      if (!rodando) return;
      rodando = false;
      gsap.ticker.remove(tique);
    };

    const deslizar = (sobre: boolean) =>
      gsap.to(passando, {
        escala: sobre ? 0 : 1,
        duration: sobre ? 0.6 : 0.9,
        ease: sobre ? "power2.out" : "power2.inOut",
        overwrite: true,
      });
    const aoEntrar = (e: PointerEvent) => {
      if (e.pointerType !== "touch") deslizar(true);
    };
    const aoSair = () => deslizar(false);

    const aoApertar = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      arrastando = true;
      idDoPonteiro = e.pointerId;
      el.setPointerCapture?.(e.pointerId);
      ultimoX = e.clientX;
      ultimoY = e.clientY;
      ultimoT = performance.now();
      velocidadeDoArrasto = normal * passando.escala + arremesso + impulso;
      const r = svg.getBoundingClientRect();
      centro = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      el.style.cursor = "grabbing";
    };
    const aoMover = (e: PointerEvent) => {
      if (!arrastando || e.pointerId !== idDoPonteiro) return;
      const agora = performance.now();
      let delta: number;
      if (circular) {
        let giro =
          Math.atan2(e.clientY - centro.y, e.clientX - centro.x) - Math.atan2(ultimoY - centro.y, ultimoX - centro.x);
        if (giro > Math.PI) giro -= Math.PI * 2;
        if (giro < -Math.PI) giro += Math.PI * 2;
        delta = giro * raio;
      } else {
        const escala = LARGURA / (svg.getBoundingClientRect().width || LARGURA);
        delta = ((e.clientX - ultimoX) * Math.cos(anguloRad) + (e.clientY - ultimoY) * Math.sin(anguloRad)) * escala;
      }
      deslocamento += delta;
      aplicar();
      const dt = Math.max(1, agora - ultimoT) / 1000;
      velocidadeDoArrasto = velocidadeDoArrasto * 0.6 + (delta / dt) * 0.4;
      ultimoX = e.clientX;
      ultimoY = e.clientY;
      ultimoT = agora;
    };
    const aoSoltar = (e: PointerEvent) => {
      if (!arrastando || e.pointerId !== idDoPonteiro) return;
      arrastando = false;
      idDoPonteiro = null;
      el.style.cursor = "";
      if (semMovimento) return;
      const solta = performance.now() - ultimoT > 90 ? 0 : limitar(velocidadeDoArrasto, -ARREMESSO_MAXIMO, ARREMESSO_MAXIMO);
      arremesso = solta - (normal * passando.escala + impulso);
    };

    const aoRolar = (e: Event) => {
      const origem = e.target;
      const pagina = origem === document || origem === document.documentElement || origem === document.body;
      if (!pagina && !(origem instanceof Node && origem.contains(el))) return;
      const pos = pagina ? window.scrollY : (origem as HTMLElement).scrollTop;
      const agora = performance.now();
      if (origem !== origemDaRolagem || agora - rolouEm > 200) {
        origemDaRolagem = origem;
        posicaoDaRolagem = pos;
        rolouEm = agora;
        return;
      }
      const instantanea = (pos - posicaoDaRolagem) / (Math.max(8, agora - rolouEm) / 1000);
      velocidadeDaRolagem = velocidadeDaRolagem * 0.5 + instantanea * 0.5;
      posicaoDaRolagem = pos;
      rolouEm = agora;
    };

    if (pausarAoPassar) {
      el.addEventListener("pointerenter", aoEntrar);
      el.addEventListener("pointerleave", aoSair);
    }
    if (arrastavel) {
      el.addEventListener("pointerdown", aoApertar);
      el.addEventListener("pointermove", aoMover);
      el.addEventListener("pointerup", aoSoltar);
      el.addEventListener("pointercancel", aoSoltar);
    }
    if (comImpulso) window.addEventListener("scroll", aoRolar, { capture: true, passive: true });

    const observador =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([entrada]) => {
            if (entrada.isIntersecting) comecar();
            else parar();
          })
        : null;
    if (observador) observador.observe(el);
    else comecar();

    return () => {
      observador?.disconnect();
      parar();
      gsap.killTweensOf(passando);
      el.style.cursor = "";
      el.removeEventListener("pointerenter", aoEntrar);
      el.removeEventListener("pointerleave", aoSair);
      el.removeEventListener("pointerdown", aoApertar);
      el.removeEventListener("pointermove", aoMover);
      el.removeEventListener("pointerup", aoSoltar);
      el.removeEventListener("pointercancel", aoSoltar);
      window.removeEventListener("scroll", aoRolar, { capture: true });
    };
  }, [
    medidas,
    velocidade,
    direcao,
    pausarAoPassar,
    arrastavel,
    impulsoDaRolagem,
    cruzar,
    personalizado,
    forma,
    anguloPrincipal,
    curvatura,
    larguraFita,
    semMovimento,
  ]);

  const textoRepetido = unidade.repeat(medidas.repeticoes);
  const textoCruzado = unidade.repeat(medidas.repeticoesCruzadas);
  const ajuste = medidas.comprimento || undefined;
  const ajusteCruzado = medidas.comprimentoCruzado || undefined;
  const pintar = (tinta: string, opacidade: number) =>
    contorno
      ? { fill: "none", stroke: tinta, strokeOpacity: opacidade, strokeWidth: espessuraContorno, strokeLinejoin: "round" as const }
      : { fill: tinta, fillOpacity: opacidade };
  const pinturaPrincipal = pintar(preenchimento, 1);
  const pinturaCruzada = pintar(preenchimentoCruzado, opacidadeCruzada);

  return (
    <div
      ref={raiz}
      className={`relative w-full overflow-hidden ${arrastavel ? "cursor-grab touch-pan-y" : ""} ${className}`}
      style={style}
    >
      <svg
        ref={svgRef}
        className="block h-auto w-full"
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={texto}
      >
        <defs>
          {esmaecimento.length > 0 && (
            <linearGradient id={idDegrade} x1="0" y1="0" x2="1" y2="0">
              {esmaecimento.map((parada, i) => (
                <stop key={i} offset={parada.posicao} stopColor="#ffffff" stopOpacity={parada.opacidade} />
              ))}
            </linearGradient>
          )}
          {esmaecimento.length > 0 && (
            <mask id={idMascara} maskUnits="userSpaceOnUse" x="0" y="0" width={LARGURA} height={ALTURA}>
              <rect width={LARGURA} height={ALTURA} fill={`url(#${idDegrade})`} />
            </mask>
          )}
          {cruzar && fita && (
            <filter id={idSombra} filterUnits="userSpaceOnUse" x={-LARGURA} y={-ALTURA} width={LARGURA * 3} height={ALTURA * 3}>
              <feGaussianBlur stdDeviation={Math.max(4, larguraFita * 0.11)} />
            </filter>
          )}
          {cruzar && fita && (
            <mask id={idPorBaixo} maskUnits="userSpaceOnUse" x={-LARGURA} y={-ALTURA} width={LARGURA * 3} height={ALTURA * 3}>
              <g transform={girarCruzada}>
                <path d={dCruzado} fill="none" stroke="#ffffff" strokeWidth={larguraFita} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </mask>
          )}
        </defs>

        {/* Mede quanto o texto ocupa, para saber quantas repetições cabem no percurso */}
        <text ref={medidaRef} className="pointer-events-none invisible" style={estiloDoTexto} aria-hidden="true">
          {unidade}
        </text>

        <g mask={esmaecimento.length > 0 ? `url(#${idMascara})` : undefined}>
          {cruzar && (
            <g transform={girarCruzada}>
              <path
                ref={caminhoCruzadoRef}
                id={idCruzado}
                d={dCruzado}
                fill="none"
                stroke={fita ? fitaCruzada : "none"}
                strokeWidth={fita ? larguraFita : 0}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text
                className="select-none"
                style={estiloDoTexto}
                {...pinturaCruzada}
                dominantBaseline="central"
                aria-hidden="true"
                textLength={ajusteCruzado}
                lengthAdjust="spacing"
              >
                <textPath ref={frenteCruzadaRef} href={`#${idCruzado}`} startOffset={0}>
                  {textoCruzado}
                </textPath>
              </text>
              <text
                className="select-none"
                style={estiloDoTexto}
                {...pinturaCruzada}
                dominantBaseline="central"
                aria-hidden="true"
                textLength={ajusteCruzado}
                lengthAdjust="spacing"
              >
                <textPath ref={atrasCruzadaRef} href={`#${idCruzado}`} startOffset={0}>
                  {textoCruzado}
                </textPath>
              </text>
            </g>
          )}

          {/* Sombra da fita principal sobre a cruzada, para parecer que passa por cima */}
          {cruzar && fita && (
            <g mask={`url(#${idPorBaixo})`}>
              <g filter={`url(#${idSombra})`} transform={`translate(0 ${Math.max(4, larguraFita * 0.08)})`}>
                <g transform={girarPrincipal}>
                  <path
                    d={d}
                    fill="none"
                    stroke="#000000"
                    strokeOpacity={0.42}
                    strokeWidth={larguraFita}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              </g>
            </g>
          )}

          <g transform={girarPrincipal}>
            <path
              ref={caminhoRef}
              id={idCaminho}
              d={d}
              fill="none"
              stroke={fita ? corFita : "none"}
              strokeWidth={fita ? larguraFita : 0}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Duas cópias do texto, uma comprimento atrás da outra, para o laço não ter emenda */}
            <text
              className="select-none"
              style={estiloDoTexto}
              {...pinturaPrincipal}
              dominantBaseline="central"
              aria-hidden="true"
              textLength={ajuste}
              lengthAdjust="spacing"
            >
              <textPath ref={frenteRef} href={`#${idCaminho}`} startOffset={0}>
                {textoRepetido}
              </textPath>
            </text>
            <text
              className="select-none"
              style={estiloDoTexto}
              {...pinturaPrincipal}
              dominantBaseline="central"
              aria-hidden="true"
              textLength={ajuste}
              lengthAdjust="spacing"
            >
              <textPath ref={atrasRef} href={`#${idCaminho}`} startOffset={0}>
                {textoRepetido}
              </textPath>
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
