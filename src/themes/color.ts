// Conversões de cor (hex <-> OKLCH) e contraste WCAG, para o editor de tema.
import type { ColorPair, ColorToken } from "./tokens";

type Rgb = [number, number, number];

export function isHex(valor: string) {
  return /^#[0-9a-f]{6}$/i.test(valor);
}

function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => c / 255) as Rgb;
}

function rgbToHex([r, g, b]: Rgb) {
  return `#${[r, g, b]
    .map((c) => Math.round(Math.min(1, Math.max(0, c)) * 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

const paraLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const deLinear = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

/** Contraste WCAG entre duas cores (de 1 a 21). 4,5 é o mínimo para texto normal. */
export function contrastRatio(a: string, b: string) {
  const luminancia = (hex: string) => {
    const [r, g, bl] = hexToRgb(hex).map(paraLinear);
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

type Oklch = { l: number; c: number; h: number };

export function hexToOklch(hex: string): Oklch {
  const [r, g, b] = hexToRgb(hex).map(paraLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { l: L, c: Math.hypot(A, B), h: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
}

function oklchToRgb({ l: L, c, h }: Oklch): Rgb {
  const A = c * Math.cos((h * Math.PI) / 180);
  const B = c * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map(deLinear) as Rgb;
}

/** OKLCH -> hex, reduzindo o croma até a cor caber no sRGB. */
export function oklchToHex(cor: Oklch) {
  let c = cor.c;
  for (let i = 0; i < 40; i++) {
    const rgb = oklchToRgb({ ...cor, c });
    if (rgb.every((v) => v >= -0.0005 && v <= 1.0005)) return rgbToHex(rgb);
    c *= 0.92;
  }
  return rgbToHex(oklchToRgb({ ...cor, c: 0 }));
}

/**
 * Cores derivadas de uma cor de marca: o destaque nas versões clara e escura
 * (ajustando a luminosidade para ter contraste) e, opcionalmente, os neutros
 * levemente tingidos com o mesmo matiz.
 */
export function paletteFromBrand(hex: string, tingirNeutros: boolean): Partial<Record<ColorToken, ColorPair>> {
  const { c, h } = hexToOklch(hex);
  const tom = (l: number, croma: number) => oklchToHex({ l, c: croma, h });
  const accent = { light: tom(0.52, Math.max(c, 0.12)), dark: tom(0.76, Math.max(c * 0.8, 0.1)) };
  if (!tingirNeutros) return { accent };

  const n = Math.min(c, 0.02);
  return {
    accent,
    page: { light: tom(0.995, n * 0.3), dark: tom(0.16, n * 0.5) },
    surface: { light: tom(0.97, n * 0.7), dark: tom(0.21, n * 0.7) },
    track: { light: tom(0.94, n * 0.7), dark: tom(0.25, n * 0.7) },
    grid: { light: tom(0.94, n * 0.5), dark: tom(0.24, n * 0.5) },
    rule: { light: tom(0.9, n), dark: tom(0.3, n) },
    ink: { light: tom(0.2, n * 1.5), dark: tom(0.95, n * 0.6) },
    "ink-2": { light: tom(0.4, n * 1.5), dark: tom(0.82, n) },
    muted: { light: tom(0.52, n), dark: tom(0.7, n) },
    "rule-strong": { light: tom(0.2, n * 1.5), dark: tom(0.95, n * 0.6) },
    axis: { light: tom(0.68, n), dark: tom(0.48, n) },
  };
}
