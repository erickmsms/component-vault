"use client";

import { useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMiniatura, useSemMovimento } from "@/library/revelar/Movimento";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

type Caixa = { x: number; y: number; width: number; height: number };
type Lado = "esquerda" | "direita" | "cima" | "baixo";

const OPACIDADE_SOMBRA = 0.5;

/** Retângulo do recorte do preenchimento: começa achatado no lado `de` e termina cobrindo a caixa. */
function quadrosDaVarredura(caixa: Caixa, de: Lado) {
  const fim = { ...caixa };
  if (de === "direita") return { inicio: { ...fim, x: caixa.x + caixa.width, width: 0 }, fim };
  if (de === "cima") return { inicio: { ...fim, height: 0 }, fim };
  if (de === "baixo") return { inicio: { ...fim, y: caixa.y + caixa.height, height: 0 }, fim };
  return { inicio: { ...fim, width: 0 }, fim };
}

function padraoDoTraco(estilo: "solido" | "tracejado" | "pontilhado", tamanho: number, espessura: number) {
  const largura = Math.max(espessura || 0, 0.1);
  const comprimento = Math.max(tamanho || 0, 1);
  if (estilo === "pontilhado") {
    const vao = Math.max(comprimento, largura * 1.8);
    return { array: `0 ${vao}`, periodo: vao };
  }
  if (estilo === "tracejado") {
    const cheio = Math.max(comprimento - largura, 0.5);
    const vazio = comprimento * 0.6 + largura;
    return { array: `${cheio} ${vazio}`, periodo: cheio + vazio };
  }
  return null;
}

/**
 * Texto que se desenha: o contorno de cada letra é traçado uma após a outra e depois o
 * preenchimento entra, varrendo de um lado ou aparecendo letra a letra, com sombra opcional.
 * Port do StrokeText do React Bits (SVG + GSAP), com as props em português.
 *
 * O SVG fica escondido de leitores de tela, que leem o texto pelo aria-label. Com "reduzir
 * movimento", aparece desenhado e preenchido. Na miniatura do catálogo, roda em ciclo.
 */
export function TextoContornado({
  texto = "Draw Attention",
  corContorno = "#A78BFA",
  corPreenchimento = "currentColor",
  espessura = 1.4,
  duracaoTraco = 1.6,
  atrasoPreenchimento = 0.2,
  intervalo = 0.05,
  curva = "power2.out",
  gatilho = "montar",
  preenchimento = "varrer",
  varrerDe = "esquerda",
  tamanhoFonte = 128,
  pesoFonte = 800,
  fonte = "inherit",
  espacamento = -4,
  inverter = false,
  estiloTraco = "solido",
  tamanhoTraco = 10,
  marchando = false,
  redesenharAoPassar = false,
  sombra = false,
  corSombra,
  className = "text-ink",
  style,
}: {
  texto?: string;
  /** Cor do contorno. */
  corContorno?: string;
  /** Cor do preenchimento. Por padrão, a cor do texto. */
  corPreenchimento?: string;
  /** Espessura do contorno, em unidades da fonte. */
  espessura?: number;
  /** Segundos para traçar cada letra. */
  duracaoTraco?: number;
  /** Segundos entre o fim do traço e o começo do preenchimento. */
  atrasoPreenchimento?: number;
  /** Segundos entre uma letra e a próxima. */
  intervalo?: number;
  /** Curva do traço, no formato do GSAP ("power2.out", "expo.inOut"...). */
  curva?: string;
  /**
   * Quando desenhar: ao montar, ao entrar na tela (`rolagem`), a cada vez que o mouse entra
   * (`passar`, parado desenhado até lá) ou em `ciclo`, desenhando e apagando sem parar.
   */
  gatilho?: "montar" | "rolagem" | "passar" | "ciclo";
  /** Como o preenchimento entra: varrendo, aparecendo letra a letra ou sem preenchimento. */
  preenchimento?: "varrer" | "aparecer" | "nenhum";
  /** Lado de onde a varredura começa. */
  varrerDe?: Lado;
  /** Tamanho da fonte em px (o SVG escala para caber na largura disponível). */
  tamanhoFonte?: number;
  pesoFonte?: number;
  /** Família da fonte. Por padrão, a de onde o componente é usado. */
  fonte?: string;
  /** Espaçamento entre letras, em px. */
  espacamento?: number;
  /** Desenha da última letra para a primeira. */
  inverter?: boolean;
  /** Contorno contínuo, tracejado ou pontilhado. */
  estiloTraco?: "solido" | "tracejado" | "pontilhado";
  /** Tamanho de cada traço ou ponto, no tracejado e no pontilhado. */
  tamanhoTraco?: number;
  /** Faz o tracejado andar em volta das letras, sem parar. */
  marchando?: boolean;
  /** Ao passar o mouse depois de pronto, apaga e redesenha o contorno. Não vale no `ciclo`. */
  redesenharAoPassar?: boolean;
  /** Sombra que se descola do texto quando o preenchimento entra. */
  sombra?: boolean;
  /** Cor da sombra. Por padrão, a do contorno. */
  corSombra?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const raiz = useRef<HTMLSpanElement>(null);
  const contornoRef = useRef<SVGTextElement>(null);
  const varreduraRef = useRef<SVGRectElement>(null);
  const sombraRef = useRef<SVGFEDropShadowElement>(null);
  const [caixa, setCaixa] = useState<Caixa | null>(null);
  const semMovimento = useSemMovimento();
  const miniatura = useMiniatura();
  const modo = miniatura ? "ciclo" : gatilho;

  const base = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const idVarredura = `texto-contornado-varrer-${base}`;
  const idRevelar = `texto-contornado-revelar-${base}`;
  const idErodir = `texto-contornado-erodir-${base}`;
  const idSombra = `texto-contornado-sombra-${base}`;

  const letras = useMemo(() => Array.from(texto), [texto]);
  const tamanhoDoTraco = Math.max(tamanhoFonte * 7, 200);
  const padrao = padraoDoTraco(estiloTraco, tamanhoTraco, espessura);
  const arrayDoTraco = padrao?.array ?? null;
  const periodoDoTraco = padrao?.periodo ?? 0;
  const deslocamentoSombra = tamanhoFonte * 0.06;
  const suavidadeSombra = tamanhoFonte * 0.016;
  const comSombra = sombra && preenchimento !== "nenhum";

  const estiloFonte = useMemo<CSSProperties>(
    () => ({ fontFamily: fonte, fontSize: `${tamanhoFonte}px`, fontWeight: pesoFonte, letterSpacing: `${espacamento}px` }),
    [fonte, tamanhoFonte, pesoFonte, espacamento],
  );

  // Mede o texto para ajustar o viewBox (de novo quando a fonte carrega ou o espaço muda)
  useLayoutEffect(() => {
    const el = raiz.current;
    if (!el) return;
    let cancelado = false;
    const medir = () => {
      const t = contornoRef.current;
      if (cancelado || !t) return;
      let b: DOMRect;
      try {
        b = t.getBBox();
      } catch {
        return;
      }
      if (!b.width) return;
      const folga = Math.max(espessura || 1, tamanhoFonte * 0.1);
      const nova = { x: b.x - folga, y: b.y - folga, width: b.width + folga * 2, height: b.height + folga * 2 };
      setCaixa((antes) =>
        antes &&
        Math.abs(antes.x - nova.x) < 0.5 &&
        Math.abs(antes.y - nova.y) < 0.5 &&
        Math.abs(antes.width - nova.width) < 0.5 &&
        Math.abs(antes.height - nova.height) < 0.5
          ? antes
          : nova,
      );
    };
    const quadro = requestAnimationFrame(medir);
    document.fonts?.ready.then(medir);
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => {
      cancelado = true;
      cancelAnimationFrame(quadro);
      observador.disconnect();
    };
  }, [letras, estiloFonte, espessura, tamanhoFonte]);

  useLayoutEffect(() => {
    const el = raiz.current;
    if (!el || !caixa) return;

    const tracos = gsap.utils.toArray<SVGTSpanElement>(el.querySelectorAll("[data-traco]"));
    const preenchidas = gsap.utils.toArray<SVGTSpanElement>(el.querySelectorAll("[data-preenchida]"));
    const varredura = varreduraRef.current;
    const contorno = contornoRef.current;
    const gota = sombraRef.current;
    if (!tracos.length) return;

    const comPreenchimento = preenchimento !== "nenhum";
    const varrer = comPreenchimento && preenchimento === "varrer";
    const duracaoPreenchimento = Math.max(0.4, duracaoTraco * 0.5);
    const escalonar = inverter ? { each: intervalo, from: "end" as const } : intervalo;
    const quadros = quadrosDaVarredura(caixa, varrerDe);
    const erguida = { dx: deslocamentoSombra, dy: deslocamentoSombra, "flood-opacity": OPACIDADE_SOMBRA };
    const assentada = { dx: 0, dy: 0, "flood-opacity": 0 };
    const alvos = [...tracos, ...preenchidas, varredura, gota].filter(Boolean);

    const definirInicio = () => {
      gsap.killTweensOf(alvos);
      gsap.set(tracos, { strokeDasharray: tamanhoDoTraco, strokeDashoffset: tamanhoDoTraco, strokeOpacity: 1 });
      gsap.set(preenchidas, { opacity: varrer ? 1 : 0 });
      if (varredura) gsap.set(varredura, { attr: quadros.inicio });
      if (gota) gsap.set(gota, { attr: assentada });
    };

    const definirFim = () => {
      gsap.killTweensOf(alvos);
      gsap.set(tracos, { strokeDasharray: tamanhoDoTraco, strokeDashoffset: 0, strokeOpacity: 1 });
      gsap.set(preenchidas, { opacity: comPreenchimento ? 1 : 0 });
      if (varredura) gsap.set(varredura, { attr: comPreenchimento ? quadros.fim : quadros.inicio });
      if (gota) gsap.set(gota, { attr: comPreenchimento ? erguida : assentada });
    };

    if (semMovimento) {
      definirFim();
      return () => gsap.killTweensOf(alvos);
    }

    const montarLinha = () => {
      definirInicio();
      const emCiclo = modo === "ciclo";
      const tl = gsap.timeline({
        paused: true,
        repeat: emCiclo ? -1 : 0,
        repeatDelay: emCiclo ? 0.9 : 0,
        yoyo: emCiclo,
        defaults: { overwrite: "auto" },
      });

      tl.to(tracos, { strokeDashoffset: 0, duration: duracaoTraco, ease: curva, stagger: escalonar }, 0);

      if (varrer && varredura) {
        tl.to(
          varredura,
          { attr: quadros.fim, duration: duracaoPreenchimento, ease: "power2.inOut" },
          duracaoTraco + atrasoPreenchimento,
        );
      } else if (comPreenchimento) {
        tl.to(
          preenchidas,
          { opacity: 1, duration: duracaoPreenchimento, ease: "power2.out", stagger: escalonar },
          duracaoTraco + atrasoPreenchimento,
        );
      }

      if (gota && comPreenchimento) {
        tl.to(
          gota,
          { attr: erguida, duration: duracaoPreenchimento * 1.4, ease: "power3.out" },
          duracaoTraco + atrasoPreenchimento + duracaoPreenchimento * 0.3,
        );
      }

      return tl;
    };

    let linha: gsap.core.Timeline | null = null;
    let gatilhoDeRolagem: ScrollTrigger | null = null;
    let redesenho: gsap.core.Timeline | null = null;
    const ouvintes: (() => void)[] = [];
    const aoEntrarMouse = (f: () => void) => {
      el.addEventListener("pointerenter", f);
      ouvintes.push(f);
    };

    if (modo === "passar") {
      definirFim();
      aoEntrarMouse(() => {
        linha?.kill();
        linha = montarLinha();
        linha.play(0);
      });
    } else {
      linha = montarLinha();
      if (modo === "rolagem") {
        gatilhoDeRolagem = ScrollTrigger.create({
          trigger: el,
          start: "top 82%",
          once: true,
          onEnter: () => linha?.play(0),
        });
      } else {
        linha.play(0);
      }

      if (redesenharAoPassar && modo !== "ciclo") {
        aoEntrarMouse(() => {
          if (!linha || linha.progress() < 1 || redesenho?.isActive()) return;
          redesenho?.kill();
          redesenho = gsap
            .timeline()
            .to(tracos, { strokeOpacity: 0, duration: 0.2, ease: "power1.out" })
            .set(tracos, { strokeDashoffset: tamanhoDoTraco, strokeOpacity: 1 })
            .to(tracos, { strokeDashoffset: 0, duration: duracaoTraco * 0.8, ease: curva, stagger: escalonar });
        });
      }
    }

    // Tracejado andando em volta das letras
    const marcha =
      arrayDoTraco && marchando && contorno
        ? gsap.fromTo(
            contorno,
            { strokeDashoffset: 0 },
            {
              strokeDashoffset: -periodoDoTraco,
              duration: periodoDoTraco / (tamanhoFonte * 0.22),
              ease: "none",
              repeat: -1,
            },
          )
        : null;

    return () => {
      ouvintes.forEach((f) => el.removeEventListener("pointerenter", f));
      gatilhoDeRolagem?.kill();
      linha?.kill();
      redesenho?.kill();
      marcha?.kill();
      gsap.killTweensOf(alvos);
    };
  }, [
    caixa,
    modo,
    semMovimento,
    tamanhoDoTraco,
    duracaoTraco,
    atrasoPreenchimento,
    intervalo,
    curva,
    preenchimento,
    varrerDe,
    inverter,
    arrayDoTraco,
    periodoDoTraco,
    marchando,
    redesenharAoPassar,
    comSombra,
    deslocamentoSombra,
    tamanhoFonte,
  ]);

  const viewBox = caixa
    ? `${caixa.x} ${caixa.y} ${caixa.width} ${caixa.height}`
    : `0 ${-tamanhoFonte} 600 ${tamanhoFonte * 1.3}`;
  const inicioVarredura = caixa ? quadrosDaVarredura(caixa, varrerDe).inicio : null;
  const regiao = caixa
    ? {
        x: caixa.x - tamanhoFonte,
        y: caixa.y - tamanhoFonte,
        width: caixa.width + tamanhoFonte * 2,
        height: caixa.height + tamanhoFonte * 2,
      }
    : {};

  const camadaContorno = (
    <text
      key={arrayDoTraco ? "padrao" : "solido"}
      ref={contornoRef}
      className="select-none"
      x="0"
      y="0"
      fill="none"
      stroke={corContorno}
      strokeWidth={espessura}
      strokeLinejoin="round"
      strokeLinecap="round"
      strokeDasharray={arrayDoTraco ?? undefined}
      mask={arrayDoTraco ? `url(#${idRevelar})` : undefined}
      style={estiloFonte}
    >
      {letras.map((letra, i) => (
        <tspan data-traco={arrayDoTraco ? undefined : ""} key={i}>
          {letra}
        </tspan>
      ))}
    </text>
  );

  return (
    <span
      ref={raiz}
      role="img"
      aria-label={texto}
      className={`block w-full leading-[0] ${modo === "passar" ? "cursor-pointer" : ""} ${className}`}
      style={style}
    >
      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        className="mx-auto block h-auto w-full overflow-visible"
        style={{ maxWidth: caixa ? caixa.width : 600, visibility: caixa ? undefined : "hidden" }}
      >
        <defs>
          {preenchimento === "varrer" && inicioVarredura && (
            <clipPath id={idVarredura} clipPathUnits="userSpaceOnUse">
              <rect ref={varreduraRef} {...inicioVarredura} />
            </clipPath>
          )}

          {arrayDoTraco && (
            <filter id={idErodir} filterUnits="userSpaceOnUse" {...regiao}>
              <feMorphology operator="erode" radius={(espessura || 1) / 2 + 0.75} />
            </filter>
          )}

          {/* No tracejado, quem se desenha é a máscara; o contorno com o padrão só aparece onde ela já passou */}
          {arrayDoTraco && (
            <mask id={idRevelar} maskUnits="userSpaceOnUse" {...regiao}>
              <text
                x="0"
                y="0"
                fill="none"
                stroke="#fff"
                strokeWidth={(espessura || 1) + 2}
                strokeLinejoin="round"
                strokeLinecap="round"
                style={estiloFonte}
              >
                {letras.map((letra, i) => (
                  <tspan data-traco="" key={i}>
                    {letra}
                  </tspan>
                ))}
              </text>
              <text x="0" y="0" fill="#000" stroke="none" filter={`url(#${idErodir})`} style={estiloFonte}>
                {letras.map((letra, i) => (
                  <tspan key={i}>{letra}</tspan>
                ))}
              </text>
            </mask>
          )}

          {comSombra && (
            <filter id={idSombra} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB" {...regiao}>
              <feDropShadow
                ref={sombraRef}
                dx={deslocamentoSombra}
                dy={deslocamentoSombra}
                stdDeviation={suavidadeSombra}
                floodColor={corSombra || corContorno}
                floodOpacity={OPACIDADE_SOMBRA}
              />
            </filter>
          )}
        </defs>

        {!arrayDoTraco && camadaContorno}

        <g filter={comSombra ? `url(#${idSombra})` : undefined}>
          <text
            className="select-none"
            x="0"
            y="0"
            fill={corPreenchimento}
            stroke="none"
            style={estiloFonte}
            clipPath={preenchimento === "varrer" && inicioVarredura ? `url(#${idVarredura})` : undefined}
          >
            {letras.map((letra, i) => (
              <tspan data-preenchida="" key={i}>
                {letra}
              </tspan>
            ))}
          </text>
        </g>

        {arrayDoTraco && camadaContorno}
      </svg>
    </span>
  );
}
