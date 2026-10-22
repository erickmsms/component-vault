"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Mesh, Program, Renderer, Texture, Triangle } from "ogl";
import { useSemMovimento } from "@/library/revelar/Movimento";

type Lente = "bulge" | "pinch" | "swirl";

const MODOS_DE_LENTE: Record<Lente, number> = { bulge: 0, pinch: 1, swirl: 2 };
const INTRO_MS = 1600;
const VIDA_DA_ONDA = 1.6;
const MAX_CLIQUES = 4;

const vertex = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;

uniform sampler2D uTextTexture;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform float uTime;
uniform float uWarpStrength;
uniform float uWarpScale;
uniform float uSpeed;
uniform float uPointerInfluence;
uniform float uPointerStrength;
uniform float uRefraction;
uniform float uChromatic;
uniform float uRipple;
uniform float uMotion;
uniform float uLens;
uniform float uIntro;
uniform float uReveal;
uniform float uBackdrop;
uniform vec4 uClicks[4];

in vec2 vUv;
out vec4 fragColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p *= 2.02;
    amplitude *= 0.5;
  }
  return value;
}

vec4 sampleText(vec2 uv) {
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    return vec4(0.0);
  }
  return texture(uTextTexture, uv);
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float time = uTime * uSpeed;
  float scale = max(uWarpScale, 0.001);

  vec2 drift = vec2(time * 0.055, -time * 0.045);
  float n1 = fbm(uv * scale * 3.1 + drift);
  float n2 = fbm((uv + 19.17) * scale * 3.4 - drift.yx);
  vec2 ambient = (vec2(n1, n2) - 0.5) * (uWarpStrength * 0.045 * uMotion + uIntro * 0.18);

  vec2 pointerDelta = uv - uPointer;
  vec2 aspectDelta = vec2(pointerDelta.x * aspect, pointerDelta.y);
  float dist = length(aspectDelta);
  float radius = max(uPointerInfluence, 0.001);
  float t = clamp(dist / radius, 0.0, 1.0);
  float lens = smoothstep(radius, 0.0, dist) * uPointerActive;
  float bulge = t * (1.0 - t) * (1.0 - t) * 6.75 * uPointerActive;
  vec2 dir = dist > 0.0001 ? vec2(aspectDelta.x / aspect, aspectDelta.y) / dist : vec2(0.0);

  float rippleWave = sin(dist * 28.0 - time * 4.2) * 0.5 + 0.5;
  float rippleRing = (rippleWave - 0.5) * uRipple;
  vec2 pointerWarp = dir * rippleRing * bulge * uPointerStrength * 0.016;

  if (uLens > 1.5) {
    float twist = (1.0 - t) * (1.0 - t) * uPointerActive * uPointerStrength * 2.4;
    float s = sin(twist);
    float c = cos(twist);
    vec2 turned = vec2(aspectDelta.x * c - aspectDelta.y * s, aspectDelta.x * s + aspectDelta.y * c);
    pointerWarp += vec2(turned.x / aspect, turned.y) - pointerDelta;
  } else {
    float side = uLens > 0.5 ? -1.0 : 1.0;
    pointerWarp -= dir * side * bulge * uPointerStrength * 0.045;
  }

  vec2 shock = vec2(0.0);
  float shockLight = 0.0;
  for (int i = 0; i < 4; i++) {
    vec4 click = uClicks[i];
    if (click.w <= 0.0) continue;
    vec2 clickDelta = uv - click.xy;
    vec2 clickAspect = vec2(clickDelta.x * aspect, clickDelta.y);
    float clickDist = length(clickAspect);
    float age = click.z;
    float offset = (clickDist - age * 0.9) / (0.06 + age * 0.06);
    float fade = 1.0 - smoothstep(0.0, 1.6, age);
    float energy = exp(-offset * offset) * fade * smoothstep(0.0, 0.08, age) * click.w;
    vec2 clickDir = clickDist > 0.0001 ? vec2(clickAspect.x / aspect, clickAspect.y) / clickDist : vec2(0.0);
    shock -= clickDir * offset * energy * 0.09;
    shockLight += energy;
  }

  vec2 bend = pointerWarp + shock;
  vec2 rest = uv + ambient;
  vec2 splitDir = ambient + bend;
  float splitLen = length(splitDir);
  splitDir = splitLen > 0.00001 ? splitDir / splitLen : vec2(0.7071, 0.7071);
  vec2 split = splitDir * uRefraction * 0.16 * (0.35 + lens * 1.65 + uIntro * 3.0);
  float dispersion = uChromatic * 0.5;

  vec3 ink = vec3(0.0);
  vec3 cover = vec3(0.0);
  vec3 weight = vec3(0.0);
  for (int i = 0; i < 7; i++) {
    float k = 1.0 - float(i) / 3.0;
    vec4 tap = sampleText(rest + bend * (1.0 + dispersion * k) + split * k);
    vec3 band = vec3(max(k, 0.0), 1.0 - abs(k), max(-k, 0.0));
    ink += tap.rgb * band;
    cover += tap.a * band;
    weight += band;
  }
  ink /= weight;
  cover /= weight;
  float a = max(max(cover.r, cover.g), cover.b);
  vec3 color = ink + (a - cover) * uBackdrop;
  color = min(color + (lens + shockLight * 0.5) * cover.g * 0.055, vec3(a));
  fragColor = vec4(color, a) * uReveal;
}
`;

type Props = {
  texto: string;
  cor: string;
  forcaDistorcao: number;
  escalaDistorcao: number;
  velocidade: number;
  alcancePonteiro: number;
  forcaPonteiro: number;
  refracao: number;
  cromatica: number;
  ondulacao: boolean;
  ondaAoClicar: boolean;
  derivaParada: number;
  lente: Lente;
  intro: boolean;
  tamanhoFonte: number | string;
  pesoFonte: number;
  fonte: string;
  espacamento: number | string;
  entrelinha: number | string;
};

const valorDeFonte = (v: number | string) => (typeof v === "number" ? `${v}px` : v);
const suave = (v: number) => v * v * (3 - 2 * v);

function luminancia(cor: string) {
  const sonda = document.createElement("canvas");
  sonda.width = 1;
  sonda.height = 1;
  const ctx = sonda.getContext("2d", { willReadFrequently: true });
  if (!ctx) return 1;
  ctx.fillStyle = cor;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function medirLinha(ctx: CanvasRenderingContext2D, linha: string, espacamento: number) {
  const letras = Array.from(linha);
  const largura = letras.reduce((soma, l) => soma + ctx.measureText(l).width, 0);
  return largura + Math.max(0, letras.length - 1) * espacamento;
}

function desenharLinha(ctx: CanvasRenderingContext2D, linha: string, x: number, y: number, espacamento: number) {
  const letras = Array.from(linha);
  let cursor = x - medirLinha(ctx, linha, espacamento) / 2;
  letras.forEach((l, i) => {
    ctx.fillText(l, cursor, y);
    cursor += ctx.measureText(l).width + (i === letras.length - 1 ? 0 : espacamento);
  });
}

/** Desenha o texto num canvas 2D, que vira a textura distorcida pelo shader. */
function textoEmCanvas(container: HTMLElement, largura: number, altura: number, dpr: number, p: Props) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(largura * dpr));
  canvas.height = Math.max(1, Math.floor(altura * dpr));
  const ctx = canvas.getContext("2d");
  if (!ctx) return { canvas, tinta: p.cor };

  // Um span invisível resolve as unidades CSS (rem, clamp, em) e a cor herdada
  const sonda = document.createElement("span");
  sonda.textContent = p.texto;
  Object.assign(sonda.style, {
    position: "absolute",
    visibility: "hidden",
    pointerEvents: "none",
    whiteSpace: "pre",
    inset: "0 auto auto 0",
    color: p.cor,
    fontFamily: p.fonte,
    fontSize: valorDeFonte(p.tamanhoFonte),
    fontWeight: String(p.pesoFonte),
    letterSpacing: valorDeFonte(p.espacamento),
    lineHeight: typeof p.entrelinha === "number" ? String(p.entrelinha) : p.entrelinha,
  });
  container.appendChild(sonda);
  const calculado = getComputedStyle(sonda);
  let tamanho = parseFloat(calculado.fontSize) || 96;
  const tinta = calculado.color || p.cor;
  const familia = calculado.fontFamily || "sans-serif";
  const peso = calculado.fontWeight || String(p.pesoFonte);
  let espacamento = calculado.letterSpacing === "normal" ? 0 : parseFloat(calculado.letterSpacing) || 0;
  let entrelinha = parseFloat(calculado.lineHeight);
  if (!Number.isFinite(entrelinha)) entrelinha = tamanho * (typeof p.entrelinha === "number" ? p.entrelinha : 0.92);
  sonda.remove();

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, largura, altura);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = tinta;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const linhas = String(p.texto || "").split("\n");
  const aplicarFonte = () => {
    ctx.font = `${peso} ${tamanho}px ${familia}`;
  };
  aplicarFonte();

  // Reduz a fonte se o texto não couber
  const maisLarga = Math.max(...linhas.map((l) => medirLinha(ctx, l, espacamento)), 1);
  const alturaDoBloco = Math.max(entrelinha * linhas.length, 1);
  const encaixe = Math.min(1, (largura * 0.86) / maisLarga, (altura * 0.78) / alturaDoBloco);
  if (encaixe < 1) {
    tamanho *= encaixe;
    espacamento *= encaixe;
    entrelinha *= encaixe;
    aplicarFonte();
  }

  const inicioY = altura / 2 - (entrelinha * (linhas.length - 1)) / 2;
  linhas.forEach((l, i) => desenharLinha(ctx, l, largura / 2, inicioY + i * entrelinha, espacamento));
  return { canvas, tinta };
}

function sincronizarUniforms(program: Program, p: Props) {
  const u = program.uniforms;
  u.uWarpStrength.value = p.forcaDistorcao;
  u.uWarpScale.value = p.escalaDistorcao;
  u.uSpeed.value = p.velocidade;
  u.uPointerInfluence.value = p.alcancePonteiro;
  u.uPointerStrength.value = p.forcaPonteiro;
  u.uRefraction.value = p.refracao;
  u.uChromatic.value = p.cromatica;
  u.uRipple.value = p.ondulacao ? 1 : 0;
  u.uLens.value = MODOS_DE_LENTE[p.lente] ?? 0;
}

/**
 * Texto em WebGL que ondula devagar e se curva e refrata em volta do ponteiro, como uma lente
 * (inchar, apertar ou girar), com ondas de choque ao clicar e uma entrada que assenta. Parado,
 * uma lente fraca passeia sozinha pelo texto. Port do WarpText do React Bits (ogl), com as
 * props em português.
 *
 * Leitores de tela leem o texto pelo aria-label. Sem WebGL, mostra o texto comum. Com
 * "reduzir movimento", o texto fica quase parado e só reage de leve ao ponteiro.
 */
export function TextoDistorcido({
  texto = "Bend the moment",
  cor = "currentColor",
  forcaDistorcao = 0.08,
  escalaDistorcao = 1.7,
  velocidade = 0.55,
  alcancePonteiro = 0.42,
  forcaPonteiro = 0.38,
  refracao = 0.018,
  cromatica = 0,
  ondulacao = true,
  ondaAoClicar = true,
  derivaParada = 0.2,
  lente = "bulge",
  intro = true,
  tamanhoFonte = "clamp(3rem, 10vw, 9rem)",
  pesoFonte = 800,
  fonte = "inherit",
  espacamento = "-0.06em",
  entrelinha = 0.9,
  className = "text-ink",
  style,
}: {
  /** Texto; quebre linhas com "\n". */
  texto?: string;
  /** Cor do texto. Por padrão, a herdada. */
  cor?: string;
  /** Força da ondulação de fundo, que mexe o texto o tempo todo. */
  forcaDistorcao?: number;
  /** Escala do ruído da ondulação: maior, ondas menores. */
  escalaDistorcao?: number;
  /** Velocidade da ondulação. */
  velocidade?: number;
  /** Raio da lente do ponteiro, em fração da altura. */
  alcancePonteiro?: number;
  /** Força da lente do ponteiro. */
  forcaPonteiro?: number;
  /** Quanto as cores se separam na refração. */
  refracao?: number;
  /** Dispersão cromática extra (0 a 1). */
  cromatica?: number;
  /** Anéis ondulando em volta do ponteiro. */
  ondulacao?: boolean;
  /** Onda de choque a cada clique. */
  ondaAoClicar?: boolean;
  /** Força da lente que passeia sozinha quando o ponteiro está fora (0 a 1). */
  derivaParada?: number;
  /** Lente que incha (bulge), aperta (pinch) ou gira (swirl). */
  lente?: Lente;
  /** Entrada em que o texto chega desfeito e assenta. */
  intro?: boolean;
  /** Tamanho da fonte (px ou qualquer valor CSS). O texto encolhe se não couber. */
  tamanhoFonte?: number | string;
  pesoFonte?: number;
  /** Família da fonte. Por padrão, a de onde o componente é usado. */
  fonte?: string;
  /** Espaçamento entre letras (px ou valor CSS). */
  espacamento?: number | string;
  entrelinha?: number | string;
  /** Classes do contêiner (que tem altura mínima de 220px e ocupa a largura toda). */
  className?: string;
  style?: CSSProperties;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const semMovimento = useSemMovimento();
  const atuais: Props = {
    texto,
    cor,
    forcaDistorcao,
    escalaDistorcao,
    velocidade,
    alcancePonteiro,
    forcaPonteiro,
    refracao,
    cromatica,
    ondulacao,
    ondaAoClicar,
    derivaParada,
    lente,
    intro,
    tamanhoFonte,
    pesoFonte,
    fonte,
    espacamento,
    entrelinha,
  };
  const propsRef = useRef(atuais);
  const contextoRef = useRef<{ program: Program; rasterizar: () => void; reduzir: (sim: boolean) => void } | null>(
    null,
  );
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    propsRef.current = atuais;
    if (contextoRef.current) sincronizarUniforms(contextoRef.current.program, propsRef.current);
  });

  useEffect(() => {
    contextoRef.current?.rasterizar();
  }, [texto, cor, tamanhoFonte, pesoFonte, fonte, espacamento, entrelinha]);

  useEffect(() => {
    contextoRef.current?.reduzir(semMovimento);
  }, [semMovimento]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: Renderer;
    let raf = 0;
    let descartado = false;
    let contextoPerdido = false;
    let visivel = true;
    let paginaVisivel = !document.hidden;
    const consulta = matchMedia("(prefers-reduced-motion: reduce)");
    let reduzir = consulta.matches;
    let versaoRaster = 0;
    let textoPronto = false;
    let progressoIntro = propsRef.current.intro && !reduzir ? 0 : 1;
    let ultimoQuadro = 0;
    let quadro = 0;
    let ultimaTinta = "";

    const ponteiro = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, active: 0, activeTarget: 0 };
    const cliques = Array.from({ length: MAX_CLIQUES }, () => [0.5, 0.5, 0, 0]);
    let vagaDoClique = 0;
    const inicio = performance.now();

    try {
      renderer = new Renderer({
        webgl: 2,
        alpha: true,
        premultipliedAlpha: true,
        antialias: true,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      });
    } catch (erro) {
      console.warn("TextoDistorcido: não deu para iniciar o WebGL.", erro);
      queueMicrotask(() => setFalhou(true));
      return;
    }
    const gl = renderer.gl;

    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas as HTMLCanvasElement;
    Object.assign(canvas.style, { position: "absolute", inset: "0", width: "100%", height: "100%", display: "block" });
    canvas.setAttribute("aria-hidden", "true");
    container.appendChild(canvas);

    const textura = new Texture(gl, {
      generateMipmaps: false,
      premultiplyAlpha: true,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE,
    });

    const geometria = new Triangle(gl);
    const p0 = propsRef.current;
    const program = new Program(gl, {
      vertex,
      fragment,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTextTexture: { value: textura },
        uResolution: { value: new Float32Array([1, 1]) },
        uPointer: { value: new Float32Array([0.5, 0.5]) },
        uPointerActive: { value: 0 },
        uTime: { value: 0 },
        uWarpStrength: { value: p0.forcaDistorcao },
        uWarpScale: { value: p0.escalaDistorcao },
        uSpeed: { value: p0.velocidade },
        uPointerInfluence: { value: p0.alcancePonteiro },
        uPointerStrength: { value: p0.forcaPonteiro },
        uRefraction: { value: p0.refracao },
        uChromatic: { value: p0.cromatica },
        uRipple: { value: p0.ondulacao ? 1 : 0 },
        uMotion: { value: reduzir ? 0 : 1 },
        uLens: { value: MODOS_DE_LENTE[p0.lente] ?? 0 },
        uIntro: { value: 0 },
        uReveal: { value: 0 },
        uBackdrop: { value: 0 },
        uClicks: { value: cliques },
      },
    });
    const malha = new Mesh(gl, { geometry: geometria, program });

    const renderizar = () => {
      if (descartado || contextoPerdido) return;
      renderer.render({ scene: malha });
    };

    const rasterizar = async () => {
      const versao = ++versaoRaster;
      try {
        await document.fonts?.ready;
      } catch {
        // segue com a fonte que houver
      }
      if (descartado || contextoPerdido || versao !== versaoRaster) return;
      const r = container.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      // Mede no tamanho de layout (sem o scale de quem estiver por fora, como a miniatura)
      const largura = container.offsetWidth;
      const altura = container.offsetHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ultimaTinta = getComputedStyle(container).color;
      const raster = textoEmCanvas(container, largura, altura, dpr, propsRef.current);
      textura.image = raster.canvas;
      textura.needsUpdate = true;
      program.uniforms.uBackdrop.value = luminancia(raster.tinta) < 0.5 ? 1 : 0;
      textoPronto = true;
      renderizar();
    };

    const redimensionar = () => {
      if (descartado || contextoPerdido) return;
      const largura = container.offsetWidth;
      const altura = container.offsetHeight;
      if (largura <= 0 || altura <= 0) return;
      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setSize(largura, altura);
      program.uniforms.uResolution.value[0] = gl.drawingBufferWidth;
      program.uniforms.uResolution.value[1] = gl.drawingBufferHeight;
      rasterizar();
    };

    const aoMover = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = canvas.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      ponteiro.tx = (e.clientX - r.left) / r.width;
      ponteiro.ty = 1 - (e.clientY - r.top) / r.height;
      ponteiro.activeTarget = 1;
    };
    const aoSair = () => {
      ponteiro.activeTarget = 0;
    };
    const aoClicar = (e: PointerEvent) => {
      if (!propsRef.current.ondaAoClicar) return;
      const r = canvas.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      const c = cliques[vagaDoClique];
      vagaDoClique = (vagaDoClique + 1) % cliques.length;
      c[0] = (e.clientX - r.left) / r.width;
      c[1] = 1 - (e.clientY - r.top) / r.height;
      c[2] = 0;
      c[3] = reduzir ? 0.35 : 1;
    };
    const aoPerderContexto = (e: Event) => {
      e.preventDefault();
      contextoPerdido = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      setFalhou(true);
    };
    const aoMudarVisibilidade = () => {
      paginaVisivel = !document.hidden;
      if (paginaVisivel && visivel && !raf) raf = requestAnimationFrame(laco);
      if (!paginaVisivel && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const definirReduzir = (sim: boolean) => {
      reduzir = sim;
      if (reduzir) progressoIntro = 1;
      program.uniforms.uMotion.value = reduzir ? 0 : 1;
      renderizar();
    };
    const aoMudarPreferencia = (e: MediaQueryListEvent) => definirReduzir(e.matches);

    const laco = (agora: number) => {
      if (descartado || contextoPerdido) return;
      const decorrido = (agora - inicio) * 0.001;
      const delta = ultimoQuadro ? Math.min(agora - ultimoQuadro, 50) : 16;
      ultimoQuadro = agora;
      quadro += 1;

      if (textoPronto && progressoIntro < 1) progressoIntro = Math.min(1, progressoIntro + delta / INTRO_MS);
      const assentar = 1 - progressoIntro;

      // Troca de tema: redesenha a textura com a cor nova
      if (textoPronto && quadro % 15 === 0 && getComputedStyle(container).color !== ultimaTinta) rasterizar();

      const deriva = Math.min(Math.max(propsRef.current.derivaParada, 0), 1);
      const engajado = ponteiro.activeTarget > 0;
      const paradoX = 0.5 + Math.sin(decorrido * 0.33) * (0.08 + deriva * 0.2);
      const paradoY = 0.5 + Math.cos(decorrido * 0.27) * (0.06 + deriva * 0.2);
      const seguir = 1 - Math.exp(-delta / (engajado ? 130 : 470));

      ponteiro.x += ((engajado ? ponteiro.tx : paradoX) - ponteiro.x) * seguir;
      ponteiro.y += ((engajado ? ponteiro.ty : paradoY) - ponteiro.y) * seguir;
      ponteiro.active += ((engajado ? 1 : deriva) - ponteiro.active) * (1 - Math.exp(-delta / 270));

      cliques.forEach((c) => {
        if (c[3] <= 0) return;
        c[2] += delta / 1000;
        if (c[2] > VIDA_DA_ONDA) c[3] = 0;
      });

      const u = program.uniforms;
      u.uPointer.value[0] = ponteiro.x;
      u.uPointer.value[1] = ponteiro.y;
      u.uPointerActive.value = reduzir ? ponteiro.active * 0.35 : ponteiro.active;
      u.uTime.value = reduzir ? 0 : decorrido;
      u.uIntro.value = assentar * assentar * assentar;
      u.uReveal.value = textoPronto ? suave(Math.min(1, progressoIntro / 0.45)) : 0;

      renderizar();
      raf = requestAnimationFrame(laco);
    };

    const observadorDeTamanho = new ResizeObserver(redimensionar);
    observadorDeTamanho.observe(container);
    const observadorDeTela = new IntersectionObserver(([entrada]) => {
      visivel = entrada.isIntersecting;
      if (visivel && paginaVisivel && !raf) raf = requestAnimationFrame(laco);
      if (!visivel && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    observadorDeTela.observe(container);

    canvas.addEventListener("pointermove", aoMover);
    canvas.addEventListener("pointerleave", aoSair);
    canvas.addEventListener("pointerdown", aoClicar);
    canvas.addEventListener("webglcontextlost", aoPerderContexto, false);
    document.addEventListener("visibilitychange", aoMudarVisibilidade);
    consulta.addEventListener("change", aoMudarPreferencia);

    sincronizarUniforms(program, propsRef.current);
    contextoRef.current = { program, rasterizar, reduzir: definirReduzir };
    redimensionar();
    raf = requestAnimationFrame(laco);

    return () => {
      descartado = true;
      contextoRef.current = null;
      if (raf) cancelAnimationFrame(raf);
      observadorDeTamanho.disconnect();
      observadorDeTela.disconnect();
      canvas.removeEventListener("pointermove", aoMover);
      canvas.removeEventListener("pointerleave", aoSair);
      canvas.removeEventListener("pointerdown", aoClicar);
      canvas.removeEventListener("webglcontextlost", aoPerderContexto);
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
      consulta.removeEventListener("change", aoMudarPreferencia);
      if (!contextoPerdido) {
        try {
          if (textura.texture) gl.deleteTexture(textura.texture);
          geometria.remove();
          program.remove();
          gl.getExtension("WEBGL_lose_context")?.loseContext();
        } catch {
          // contexto já se foi
        }
      }
      if (canvas.parentNode === container) container.removeChild(canvas);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={texto}
      className={`relative isolate block min-h-[220px] w-full overflow-hidden rounded-[inherit] ${className}`}
      style={style}
    >
      {falhou && (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center px-[7%] text-center whitespace-pre-line"
          style={{
            color: cor,
            fontFamily: fonte,
            fontWeight: pesoFonte,
            fontSize: valorDeFonte(tamanhoFonte),
            letterSpacing: valorDeFonte(espacamento),
            lineHeight: entrelinha,
          }}
        >
          {texto}
        </span>
      )}
    </div>
  );
}
