"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, type CSSProperties, type ElementType } from "react";
import { gsap } from "gsap";
import { useSemMovimento } from "@/library/revelar/Movimento";

const limitar = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

// Máscara do holofote: círculo com borda bem suave (curva smootherstep em 9 paradas)
const MASCARA_HOLOFOTE = `radial-gradient(circle var(--tm-holofote-r, 160px) at var(--tm-holofote-x, 50%) var(--tm-holofote-y, 50%), ${Array.from(
  { length: 9 },
  (_, i) => {
    const t = i / 8;
    const u = limitar((t - 0.1) / 0.9, 0, 1);
    return `rgba(0, 0, 0, ${(u * u * u * (u * (u * 6 - 15) + 10)).toFixed(3)}) ${(t * 100).toFixed(1)}%`;
  },
).join(", ")})`;

type Caixa = { x: number; y: number; w: number; cx: number; cy: number; lc: number };
type EstadoLetra = { x: number; y: number; s: number };

/**
 * Título com uma imagem ou vídeo aparecendo por dentro das letras. A mídia flutua devagar,
 * acompanha o mouse em paralaxe e pode ganhar zoom, tom, contorno e um holofote que segue o
 * ponteiro. As letras entram subindo, crescendo, desfocadas, varridas ou em fade.
 * Port do MaskedHeading do React Bits (GSAP + clipPath em SVG), com as props em português.
 *
 * O texto real fica no HTML (transparente) para leitores de tela e buscadores; as letras do
 * recorte são medidas a partir dele. Com "reduzir movimento", aparece pronto e parado.
 */
export function TituloMascarado({
  texto = "Designed in the details",
  tag = "h2",
  tipoMidia = "imagem",
  src = "",
  poster = "",
  escalaMidia = 1.25,
  paralaxe = 26,
  deriva = 18,
  zoomAoPassar = 0,
  brilho = 1,
  saturacao = 1,
  pretoEBranco = false,
  tom = "",
  holofote = false,
  raioHolofote = 160,
  contorno = false,
  corContorno = "",
  espessuraContorno = 1,
  revelar = "subir",
  duracao = 1.1,
  intervalo = 0.09,
  gatilho = "tela",
  alinhamento = "center",
  peso = 700,
  espacamento = -0.03,
  entrelinha = 1.06,
  escalaTexto = 0.115,
  className = "",
  style,
}: {
  texto?: string;
  /** Elemento do título. */
  tag?: ElementType;
  tipoMidia?: "imagem" | "video";
  /** Endereço da imagem ou do vídeo. Sem ele, as letras ficam num tom da cor do texto. */
  src?: string;
  /** Imagem do vídeo antes de carregar. */
  poster?: string;
  /** Quanto a mídia é maior que o título (sobra para a paralaxe e a deriva). */
  escalaMidia?: number;
  /** Deslocamento máximo (px) da mídia seguindo o mouse. */
  paralaxe?: number;
  /** Amplitude (px) da flutuação contínua da mídia. */
  deriva?: number;
  /** Zoom extra da mídia com o mouse em cima (0,1 = 10%). */
  zoomAoPassar?: number;
  brilho?: number;
  saturacao?: number;
  pretoEBranco?: boolean;
  /** Cor que tinge a mídia (mistura "color"). */
  tom?: string;
  /** Escurece e tira a cor fora de um círculo que segue o mouse (ou passeia sozinho). */
  holofote?: boolean;
  /** Raio do holofote, em px. */
  raioHolofote?: number;
  /** Desenha o contorno das letras por cima. */
  contorno?: boolean;
  /** Cor do contorno. Por padrão, a cor do texto. */
  corContorno?: string;
  espessuraContorno?: number;
  /** Como as letras entram. */
  revelar?: "subir" | "crescer" | "desfocar" | "varrer" | "aparecer" | "nenhum";
  /** Segundos da entrada. */
  duracao?: number;
  /** Segundos entre palavras (subir) ou fração disso entre letras (crescer). */
  intervalo?: number;
  /** Quando entrar: ao aparecer na tela, ao montar ou a cada vez que o mouse entra. */
  gatilho?: "tela" | "montar" | "passar";
  alinhamento?: "left" | "center" | "right";
  peso?: number;
  /** Espaçamento entre letras, em em. */
  espacamento?: number;
  entrelinha?: number;
  /** Tamanho da fonte como fração da largura do título (entre 20 e 200 px). */
  escalaTexto?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const raiz = useRef<HTMLElement>(null);
  const medidaRef = useRef<HTMLSpanElement>(null);
  const revelarRef = useRef<HTMLSpanElement>(null);
  const recorteRef = useRef<HTMLSpanElement>(null);
  const midiaRef = useRef<HTMLSpanElement>(null);
  const palavrasRef = useRef<(HTMLSpanElement | null)[]>([]);
  const basesRef = useRef<(HTMLElement | null)[]>([]);
  const glifosRef = useRef<(SVGTextElement | null)[]>([]);
  const linhasRef = useRef<(SVGTextElement | null)[]>([]);
  const caixasRef = useRef<Caixa[]>([]);
  const estadosRef = useRef<EstadoLetra[]>([]);
  const tweenRef = useRef<gsap.core.Animation | null>(null);
  const desvioRef = useRef({ x: 0, y: 0, tx: 0, ty: 0, zoom: 0, px: 0, py: 0, sx: 0, sy: 0, aceso: false });
  const pinturaRef = useRef({ transform: "", filter: "", holofote: "" });
  const acordarRef = useRef(() => {});
  const semMovimento = useSemMovimento();

  const idRecorte = `tm-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const palavras = useMemo(() => texto.split(/\s+/).filter(Boolean), [texto]);
  const glifos = useMemo(
    () => palavras.flatMap((palavra, w) => Array.from(palavra).map((letra) => ({ letra, w }))),
    [palavras],
  );

  // Valores lidos dentro do laço de animação sem recriá-lo
  const ajustesRef = useRef({ escalaMidia, paralaxe, deriva, zoomAoPassar, brilho, saturacao, pretoEBranco, escalaTexto, holofote, semMovimento });
  useLayoutEffect(() => {
    ajustesRef.current = { escalaMidia, paralaxe, deriva, zoomAoPassar, brilho, saturacao, pretoEBranco, escalaTexto, holofote, semMovimento };
  });

  const posicionar = useCallback(() => {
    const el = raiz.current;
    const midia = midiaRef.current;
    if (!el || !midia) return;
    const s = ajustesRef.current;
    const d = desvioRef.current;
    const escala = s.escalaMidia * (1 + Math.max(0, d.zoom));
    const maxX = Math.max(0, ((escala - 1) / 2) * el.clientWidth);
    const maxY = Math.max(0, ((escala - 1) / 2) * el.clientHeight);

    const transform = `translate3d(${limitar(d.x, -maxX, maxX).toFixed(2)}px, ${limitar(d.y, -maxY, maxY).toFixed(2)}px, 0) scale(${escala.toFixed(4)})`;
    const filter = `brightness(${s.brilho}) saturate(${s.saturacao})${s.pretoEBranco ? " grayscale(1)" : ""}`;
    const pintura = pinturaRef.current;
    if (pintura.transform !== transform) {
      pintura.transform = transform;
      midia.style.transform = transform;
    }
    if (pintura.filter !== filter) {
      pintura.filter = filter;
      midia.style.filter = filter;
    }

    const recorte = recorteRef.current;
    if (recorte && s.holofote) {
      const ponto = `${d.sx.toFixed(1)}px ${d.sy.toFixed(1)}px`;
      if (pintura.holofote !== ponto) {
        pintura.holofote = ponto;
        recorte.style.setProperty("--tm-holofote-x", `${d.sx.toFixed(1)}px`);
        recorte.style.setProperty("--tm-holofote-y", `${d.sy.toFixed(1)}px`);
      }
    }
  }, []);

  const desenharGlifos = useCallback(() => {
    const caixas = caixasRef.current;
    const estados = estadosRef.current;
    for (let i = 0; i < glifosRef.current.length; i += 1) {
      const glifo = glifosRef.current[i];
      if (!glifo) continue;
      const caixa = caixas[i];
      const st = estados[i];
      if (!caixa || !st || (st.x === 0 && st.y === 0 && st.s === 1)) {
        if (glifo.hasAttribute("transform")) glifo.removeAttribute("transform");
        continue;
      }
      const s = Math.max(st.s, 0.0001);
      // x espalha a letra a partir do centro da linha (usado no "desfocar")
      const tx = caixa.cx * (1 - s) + st.x * (caixa.cx - caixa.lc);
      const ty = caixa.cy * (1 - s) + st.y;
      glifo.setAttribute("transform", `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(4)})`);
    }
  }, []);

  /** Mede cada letra do texto real e copia posição e fonte para as letras do recorte e do contorno. */
  const sincronizar = useCallback(() => {
    const el = raiz.current;
    const medida = medidaRef.current;
    if (!el || !medida) return;
    const s = ajustesRef.current;

    el.style.fontSize = `${limitar(el.clientWidth * s.escalaTexto, 20, 200).toFixed(1)}px`;

    const cs = window.getComputedStyle(medida);
    const fontePx = parseFloat(cs.fontSize) || 48;
    const caixaRaiz = el.getBoundingClientRect();
    // Desfaz escalas aplicadas por fora (miniaturas do catálogo, por exemplo)
    const proporcao = el.offsetWidth ? caixaRaiz.width / el.offsetWidth || 1 : 1;
    const intervaloTexto = document.createRange();
    const caixas: Caixa[] = [];
    let indice = 0;

    for (let w = 0; w < palavrasRef.current.length; w += 1) {
      const palavra = palavrasRef.current[w];
      const base = basesRef.current[w];
      const no = palavra?.firstChild;
      if (!palavra || !base || !no || no.nodeType !== Node.TEXT_NODE) {
        indice += Array.from(palavra?.textContent ?? "").length;
        continue;
      }
      const caixaPalavra = palavra.getBoundingClientRect();
      const linhaBase = base.offsetTop;
      let deslocamento = 0;
      for (const letra of Array.from((no as Text).data)) {
        intervaloTexto.setStart(no, deslocamento);
        intervaloTexto.setEnd(no, deslocamento + letra.length);
        deslocamento += letra.length;
        const r = intervaloTexto.getBoundingClientRect();
        const x = palavra.offsetLeft + (r.left - caixaPalavra.left) / proporcao;
        const largura = r.width / proporcao;
        caixas[indice] = { x, y: linhaBase, w: largura, cx: x + largura / 2, cy: linhaBase - fontePx * 0.36, lc: 0 };
        indice += 1;
      }
    }
    const linhas = new Map<number, { esquerda: number; direita: number }>();
    for (const c of caixas) {
      if (!c) continue;
      const linha = linhas.get(c.y) ?? { esquerda: Infinity, direita: -Infinity };
      linha.esquerda = Math.min(linha.esquerda, c.x);
      linha.direita = Math.max(linha.direita, c.x + c.w);
      linhas.set(c.y, linha);
    }
    for (const c of caixas) {
      if (!c) continue;
      const linha = linhas.get(c.y)!;
      c.lc = (linha.esquerda + linha.direita) / 2;
    }
    caixasRef.current = caixas;

    const copiarFonte = (t: SVGTextElement) => {
      t.style.fontFamily = cs.fontFamily;
      t.style.fontSize = cs.fontSize;
      t.style.fontWeight = cs.fontWeight;
      t.style.fontStyle = cs.fontStyle;
      t.style.letterSpacing = cs.letterSpacing;
    };
    for (let i = 0; i < caixas.length; i += 1) {
      const c = caixas[i];
      for (const t of [glifosRef.current[i], linhasRef.current[i]]) {
        if (!t || !c) continue;
        t.setAttribute("x", c.x.toFixed(2));
        t.setAttribute("y", `${c.y}`);
        copiarFonte(t);
      }
    }
    desenharGlifos();
    posicionar();
  }, [posicionar, desenharGlifos]);

  // Laço da mídia: deriva, paralaxe, zoom e holofote
  useEffect(() => {
    const el = raiz.current;
    if (!el) return;

    let vivo = true;
    const observadorTamanho = new ResizeObserver(() => sincronizar());
    observadorTamanho.observe(el);
    document.fonts?.ready.then(() => vivo && sincronizar()).catch(() => {});

    const d = desvioRef.current;
    let quadro = 0;
    let anterior = 0;
    let relogio = 0;
    let visivel = true;
    let emCima = false;

    const passo = (agora: number) => {
      quadro = 0;
      const dt = anterior ? Math.min(0.05, (agora - anterior) / 1000) : 0;
      anterior = agora;
      const s = ajustesRef.current;
      const parado = s.semMovimento;

      if (parado) {
        d.x = 0;
        d.y = 0;
        d.zoom = 0;
      } else {
        relogio += dt;
        const dx = Math.sin(relogio * 0.21) * s.deriva;
        const dy = Math.cos(relogio * 0.17) * s.deriva * 0.6;
        const suave = 1 - Math.exp(-dt / 0.18);
        d.x += (d.tx + dx - d.x) * suave;
        d.y += (d.ty + dy - d.y) * suave;
        d.zoom += ((emCima ? s.zoomAoPassar : 0) - d.zoom) * (1 - Math.exp(-dt / 0.35));
      }

      if (s.holofote) {
        const w = el.clientWidth;
        const h = el.clientHeight;
        let gx = w / 2;
        let gy = h / 2;
        if (emCima) {
          gx = d.px;
          gy = d.py;
        } else if (!parado) {
          gx = w * (0.5 + 0.36 * Math.sin(relogio * 0.37));
          gy = h * (0.5 + 0.22 * Math.sin(relogio * 0.61 + 0.9));
        }
        if (!d.aceso || parado) {
          d.sx = gx;
          d.sy = gy;
          d.aceso = true;
        } else {
          const seguir = 1 - Math.exp(-dt / (emCima ? 0.12 : 0.6));
          d.sx += (gx - d.sx) * seguir;
          d.sy += (gy - d.sy) * seguir;
        }
      } else {
        d.aceso = false;
      }

      posicionar();
      if (visivel && !parado && vivo) quadro = requestAnimationFrame(passo);
    };

    const acordar = () => {
      if (quadro || !vivo) return;
      anterior = 0;
      quadro = requestAnimationFrame(passo);
    };
    acordarRef.current = acordar;

    const mover = (e: PointerEvent) => {
      const s = ajustesRef.current;
      const r = el.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / (r.width || 1)) * 2 - 1;
      const ny = ((e.clientY - r.top) / (r.height || 1)) * 2 - 1;
      d.tx = limitar(nx, -1, 1) * -Math.max(0, s.paralaxe);
      d.ty = limitar(ny, -1, 1) * -Math.max(0, s.paralaxe);
      d.px = ((e.clientX - r.left) / (r.width || 1)) * el.clientWidth;
      d.py = ((e.clientY - r.top) / (r.height || 1)) * el.clientHeight;
      if (s.holofote) acordar();
    };
    const entrar = (e: PointerEvent) => {
      emCima = e.pointerType !== "touch";
      mover(e);
      acordar();
    };
    const sair = () => {
      emCima = false;
      d.tx = 0;
      d.ty = 0;
      acordar();
    };

    const observadorTela = new IntersectionObserver(([entrada]) => {
      visivel = entrada.isIntersecting;
      if (visivel) acordar();
    });
    observadorTela.observe(el);

    el.addEventListener("pointermove", mover);
    el.addEventListener("pointerenter", entrar);
    el.addEventListener("pointerleave", sair);
    acordar();

    return () => {
      vivo = false;
      cancelAnimationFrame(quadro);
      acordarRef.current = () => {};
      observadorTamanho.disconnect();
      observadorTela.disconnect();
      el.removeEventListener("pointermove", mover);
      el.removeEventListener("pointerenter", entrar);
      el.removeEventListener("pointerleave", sair);
    };
  }, [posicionar, sincronizar]);

  // Qualquer mudança de prop acorda o laço (ele dorme quando parado ou fora da tela)
  useEffect(() => {
    acordarRef.current();
  });

  useEffect(() => {
    const video = midiaRef.current?.querySelector("video");
    if (video && semMovimento) video.pause();
  }, [tipoMidia, src, semMovimento]);

  useLayoutEffect(() => {
    sincronizar();
  }, [sincronizar, palavras, tag, alinhamento, peso, espacamento, entrelinha, escalaTexto, contorno]);

  // Entrada das letras
  useLayoutEffect(() => {
    const el = raiz.current;
    const camada = revelarRef.current;
    if (!el || !camada) return;
    const estados = glifos.map(() => ({ x: 0, y: 0, s: 1 }));
    estadosRef.current = estados;
    if (!estados.length) return;

    const em = () => parseFloat(window.getComputedStyle(el).fontSize) || 48;
    const atrasoPalavra = (i: number) => glifos[i].w * intervalo;
    const atrasoLetra = (i: number) => i * intervalo * 0.35;

    const limparCamada = () => {
      gsap.set(camada, { opacity: 1, scale: 1 });
      camada.style.clipPath = "";
      camada.style.filter = "";
    };

    const assentar = () => {
      estados.forEach((st) => {
        st.x = 0;
        st.y = 0;
        st.s = 1;
      });
      desenharGlifos();
      limparCamada();
    };

    const repouso = () => {
      const tamanho = em();
      if (revelar === "subir") {
        estados.forEach((st) => (st.y = tamanho * 1.15));
      } else if (revelar === "crescer") {
        estados.forEach((st) => {
          st.y = tamanho * 0.1;
          st.s = 0;
        });
      } else if (revelar === "desfocar") {
        estados.forEach((st) => (st.x = 0.22));
        gsap.set(camada, { opacity: 0 });
        camada.style.filter = `blur(${(tamanho * 0.3).toFixed(2)}px)`;
      } else if (revelar === "varrer") {
        camada.style.clipPath = "inset(0% 100% 0% 0%)";
      } else if (revelar === "aparecer") {
        gsap.set(camada, { opacity: 0, scale: 1.08 });
      }
      desenharGlifos();
    };

    if (revelar === "nenhum" || semMovimento) {
      assentar();
      return;
    }

    const tocar = () => {
      tweenRef.current?.kill();
      const tamanho = em();
      if (revelar === "subir") {
        limparCamada();
        tweenRef.current = gsap.fromTo(
          estados,
          { x: 0, y: tamanho * 1.15, s: 1 },
          { y: 0, duration: duracao, stagger: atrasoPalavra, ease: "power4.out", overwrite: "auto", onUpdate: desenharGlifos },
        );
        desenharGlifos();
      } else if (revelar === "crescer") {
        limparCamada();
        tweenRef.current = gsap.fromTo(
          estados,
          { x: 0, y: tamanho * 0.1, s: 0 },
          { y: 0, s: 1, duration: duracao, stagger: atrasoLetra, ease: "expo.out", overwrite: "auto", onUpdate: desenharGlifos },
        );
        desenharGlifos();
      } else if (revelar === "desfocar") {
        const foco = { blur: tamanho * 0.3, opacity: 0 };
        gsap.set(camada, { scale: 1, opacity: 0 });
        camada.style.clipPath = "";
        camada.style.filter = `blur(${foco.blur.toFixed(2)}px)`;
        const linha = gsap.timeline({ onUpdate: desenharGlifos });
        linha.fromTo(estados, { x: 0.22, y: 0, s: 1 }, { x: 0, duration: duracao * 1.2, ease: "expo.out" }, 0);
        linha.to(
          foco,
          {
            blur: 0,
            opacity: 1,
            duration: duracao * 1.2,
            ease: "power2.out",
            onUpdate: () => {
              camada.style.filter = foco.blur > 0.05 ? `blur(${foco.blur.toFixed(2)}px)` : "";
              camada.style.opacity = foco.opacity.toFixed(3);
            },
          },
          0,
        );
        tweenRef.current = linha;
        desenharGlifos();
      } else if (revelar === "varrer") {
        assentar();
        camada.style.clipPath = "inset(0% 100% 0% 0%)";
        const estado = { p: 100 };
        tweenRef.current = gsap.to(estado, {
          p: 0,
          duration: duracao,
          ease: "power3.inOut",
          overwrite: "auto",
          onUpdate: () => {
            camada.style.clipPath = `inset(0% ${estado.p}% 0% 0%)`;
          },
        });
      } else {
        assentar();
        tweenRef.current = gsap.fromTo(
          camada,
          { opacity: 0, scale: 1.08 },
          { opacity: 1, scale: 1, duration: duracao, ease: "power3.out", overwrite: "auto" },
        );
      }
    };

    if (gatilho === "passar") {
      assentar();
      el.addEventListener("pointerenter", tocar);
      return () => {
        el.removeEventListener("pointerenter", tocar);
        tweenRef.current?.kill();
      };
    }

    if (gatilho === "tela") {
      assentar();
      repouso();
      const observador = new IntersectionObserver(
        (entradas) => {
          if (entradas.some((e) => e.isIntersecting)) {
            tocar();
            observador.disconnect();
          }
        },
        { threshold: 0.25 },
      );
      observador.observe(el);
      return () => {
        observador.disconnect();
        tweenRef.current?.kill();
      };
    }

    tocar();
    return () => tweenRef.current?.kill();
  }, [revelar, gatilho, duracao, intervalo, glifos, desenharGlifos, semMovimento]);

  const Tag = tag;

  return (
    <Tag
      ref={raiz}
      className={`relative m-0 w-full p-0 text-balance antialiased ${className}`}
      style={{ textAlign: alinhamento, fontWeight: peso, letterSpacing: `${espacamento}em`, lineHeight: entrelinha, ...style }}
    >
      {/* Texto real, transparente: dá o layout, é lido por leitores de tela e serve de medida */}
      <span ref={medidaRef} className="text-transparent">
        {palavras.map((palavra, i) => (
          <span
            key={`${palavra}-${i}`}
            ref={(e) => {
              palavrasRef.current[i] = e;
            }}
            className="inline-block whitespace-pre not-last:after:content-['_']"
          >
            {palavra}
            <i
              ref={(e) => {
                basesRef.current[i] = e;
              }}
              className="inline-block size-0"
            />
          </span>
        ))}
      </span>

      <svg className="absolute size-0 overflow-hidden" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={idRecorte} clipPathUnits="userSpaceOnUse">
            {glifos.map((g, i) => (
              <text
                key={i}
                ref={(e) => {
                  glifosRef.current[i] = e;
                }}
              >
                {g.letra}
              </text>
            ))}
          </clipPath>
        </defs>
      </svg>

      <span ref={revelarRef} aria-hidden="true" className="pointer-events-none absolute inset-0 block">
        <span
          ref={recorteRef}
          className="absolute inset-0 block"
          style={{ clipPath: `url(#${idRecorte})`, "--tm-holofote-r": `${Math.max(1, raioHolofote)}px` } as CSSProperties}
        >
          <span
            ref={midiaRef}
            className="absolute inset-0 block bg-[color-mix(in_srgb,currentColor_10%,transparent)] will-change-[transform,filter]"
          >
            {tipoMidia === "video" ? (
              <video
                className="block size-full object-cover select-none"
                src={src || undefined}
                poster={poster || undefined}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- a mídia é recortada pelas letras; next/image não ajuda aqui
              <img className="block size-full object-cover select-none" src={src || undefined} alt="" draggable={false} />
            )}
          </span>
          {tom ? <span className="pointer-events-none absolute inset-0 block mix-blend-color" style={{ background: tom }} /> : null}
          {holofote ? (
            <>
              <span
                className="pointer-events-none absolute inset-0 block bg-[#808080] mix-blend-saturation"
                style={{ maskImage: MASCARA_HOLOFOTE, WebkitMaskImage: MASCARA_HOLOFOTE }}
              />
              <span
                className="pointer-events-none absolute inset-0 block bg-black opacity-55"
                style={{ maskImage: MASCARA_HOLOFOTE, WebkitMaskImage: MASCARA_HOLOFOTE }}
              />
            </>
          ) : null}
        </span>
      </span>

      {contorno ? (
        <svg
          className="pointer-events-none absolute inset-0 size-full overflow-visible fill-none [stroke-linejoin:round]"
          aria-hidden="true"
          focusable="false"
          style={{ stroke: corContorno || "currentColor", strokeWidth: Math.max(0, espessuraContorno) }}
        >
          {glifos.map((g, i) => (
            <text
              key={i}
              ref={(e) => {
                linhasRef.current[i] = e;
              }}
            >
              {g.letra}
            </text>
          ))}
        </svg>
      ) : null}
    </Tag>
  );
}
