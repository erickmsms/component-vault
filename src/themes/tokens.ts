import { fontStack } from "./fonts";

/** Seletor onde os tokens valem: os previews, o catálogo e o cabeçalho da vitrine. */
export const THEME_ATTR = "vault";
export const THEME_SELECTOR = `[data-theme="${THEME_ATTR}"]`;

export const COLOR_GROUPS = [
  {
    title: "Superfícies",
    tokens: [
      { token: "page", label: "Página" },
      { token: "surface", label: "Superfície" },
      { token: "track", label: "Trilho (fundo de barras)" },
      { token: "grid", label: "Grade de gráficos" },
    ],
  },
  {
    title: "Texto",
    tokens: [
      { token: "ink", label: "Texto" },
      { token: "ink-2", label: "Texto secundário" },
      { token: "muted", label: "Texto apagado" },
    ],
  },
  {
    title: "Linhas",
    tokens: [
      { token: "rule", label: "Divisória" },
      { token: "rule-strong", label: "Divisória forte" },
      { token: "axis", label: "Eixo de gráficos" },
    ],
  },
  {
    title: "Estados",
    tokens: [
      { token: "accent", label: "Destaque" },
      { token: "success", label: "Sucesso" },
      { token: "warning", label: "Atenção" },
      { token: "critical", label: "Erro" },
    ],
  },
  {
    title: "Séries (gráficos e categorias)",
    tokens: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ token: `series-${n}`, label: `Série ${n}` })),
  },
] as const satisfies ReadonlyArray<{ title: string; tokens: ReadonlyArray<{ token: string; label: string }> }>;

export type ColorToken = (typeof COLOR_GROUPS)[number]["tokens"][number]["token"];
export const COLOR_TOKENS = COLOR_GROUPS.flatMap((g) => g.tokens.map((t) => t.token)) as ColorToken[];

export type ColorPair = { light: string; dark: string };
export type Shadow = "none" | "soft" | "strong" | "hard";
export type Mode = "light" | "dark";

export type ThemeValues = {
  colors: Record<ColorToken, ColorPair>;
  /** Família das fontes (uma das de LOCAL_FONTS). */
  fontDisplay: string;
  fontBody: string;
  /** Tamanho do texto de corpo, em px. */
  textBase: number;
  /** Razão da escala modular dos tamanhos de texto. */
  textScale: number;
  /** Arredondamento base em px (o rounded-lg); os demais crescem na mesma proporção. */
  radius: number;
  /** Multiplica todos os espaçamentos (padding, gap, margem, tamanhos). */
  density: number;
  shadow: Shadow;
};

export const SHADOWS: Record<Shadow, { label: string; css: string }> = {
  none: { label: "Nenhuma", css: "none" },
  soft: { label: "Suave", css: "0 8px 24px -6px rgb(0 0 0 / 0.14), 0 2px 6px -2px rgb(0 0 0 / 0.08)" },
  strong: { label: "Forte", css: "0 18px 40px -8px rgb(0 0 0 / 0.32), 0 6px 12px -4px rgb(0 0 0 / 0.18)" },
  hard: { label: "Dura", css: "4px 4px 0 0 var(--rule-strong)" },
};

/** Expoente da escala modular de cada tamanho do Tailwind (base = 0). */
const TEXT_STEPS: Record<string, number> = {
  xs: -1,
  sm: -0.5,
  base: 0,
  lg: 0.5,
  xl: 1,
  "2xl": 2,
  "3xl": 3,
  "4xl": 4,
  "5xl": 5,
  "6xl": 6,
  "7xl": 7,
};

/** Raios padrão do Tailwind em px; o tema multiplica todos por radius / 8. */
const RADII: Record<string, number> = { xs: 2, sm: 4, md: 6, lg: 8, xl: 12, "2xl": 16, "3xl": 24, "4xl": 32 };

const arredondar = (v: number, casas = 4) => Number(v.toFixed(casas));

export function textSize(values: Pick<ThemeValues, "textBase" | "textScale">, step: string) {
  return arredondar((values.textBase * values.textScale ** TEXT_STEPS[step]) / 16);
}

export const TEXT_STEP_NAMES = Object.keys(TEXT_STEPS);

/**
 * CSS do tema: os tokens declarados no seletor do tema, com as cores claras e
 * escuras em light-dark() (seguem o color-scheme). `target` decide como as
 * fontes aparecem: variáveis do next/font na vitrine, nomes no CSS exportado.
 */
export function themeCss(values: ThemeValues, target: "vault" | "export", selector = THEME_SELECTOR) {
  const linhas = [
    ...COLOR_TOKENS.map((t) => {
      const { light, dark } = values.colors[t];
      return `--${t}: ${light === dark ? light : `light-dark(${light}, ${dark})`};`;
    }),
    `--fonte-titulo: ${fontStack(values.fontDisplay, target)};`,
    `--fonte-texto: ${fontStack(values.fontBody, target)};`,
    `--spacing: ${arredondar(0.25 * values.density)}rem;`,
    ...TEXT_STEP_NAMES.map((s) => `--text-${s}: ${textSize(values, s)}rem;`),
    ...Object.entries(RADII).map(([nome, px]) => `--radius-${nome}: ${arredondar((px * values.radius) / 8, 2)}px;`),
    `--sombra-flutuante: ${SHADOWS[values.shadow].css};`,
    `color: var(--ink);`,
    `font-family: var(--fonte-texto);`,
  ];
  return `${selector} {\n  ${linhas.join("\n  ")}\n}\n`;
}

/** Bloco @theme do Tailwind que liga as classes (bg-page, font-display...) aos tokens. Igual a tokens.css. */
export function tailwindBridge() {
  return [
    "@theme inline {",
    ...COLOR_TOKENS.filter((t) => !t.startsWith("series-")).map((t) => `  --color-${t}: var(--${t});`),
    "  --font-display: var(--fonte-titulo);",
    "  --shadow-flutuante: var(--sombra-flutuante);",
    "}",
  ].join("\n");
}

/**
 * Arquivo único para outro projeto com Tailwind 4: a ponte com o Tailwind e os
 * tokens em :root, seguindo o modo claro/escuro do sistema.
 */
export function exportThemeCss(values: ThemeValues, nome: string) {
  const fontes = [...new Set([values.fontDisplay, values.fontBody])].map((f) => `"${f}"`).join(" e ");
  // O nome entra num comentário CSS: sem "*/" para ele não conseguir fechá-lo
  const nomeSeguro = nome.replaceAll("*/", "");
  return [
    `/* Tema "${nomeSeguro}", gerado no Component Vault.`,
    `   Importe depois de @import "tailwindcss". Carregue as fontes ${fontes} no projeto. */`,
    tailwindBridge(),
    "",
    themeCss(values, "export", ":root").replace("{\n", "{\n  color-scheme: light dark;\n"),
  ].join("\n");
}
