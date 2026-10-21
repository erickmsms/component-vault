import type { ColorPair, ThemeValues } from "./tokens";

const par = (light: string, dark: string = light): ColorPair => ({ light, dark });

function series(light: string[], dark: string[]) {
  return Object.fromEntries(light.map((cor, i) => [`series-${i + 1}`, par(cor, dark[i])])) as Record<
    `series-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`,
    ColorPair
  >;
}

// Paleta categórica validada para daltonismo, usada pela maioria dos temas
const SERIES_PADRAO = series(
  ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6", "#e34948"],
  ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#008300", "#9085e9", "#e66767"],
);

export const PRESETS = {
  editorial: {
    label: "Editorial",
    values: {
      colors: {
        page: par("#ffffff", "#0f0f0e"),
        surface: par("#f5f5f5", "#1a1a19"),
        ink: par("#111111", "#f0efec"),
        "ink-2": par("#4a4a4a", "#c3c2b7"),
        muted: par("#666666", "#a3a29a"),
        rule: par("#e3e3e3", "#2c2c2a"),
        "rule-strong": par("#111111", "#f0efec"),
        track: par("#f0f0f0", "#262624"),
        grid: par("#ededed", "#232321"),
        axis: par("#9a9a9a", "#6b6a64"),
        accent: par("#1a56db", "#7aa2f7"),
        success: par("#13865c", "#3fc48f"),
        warning: par("#fab219"),
        critical: par("#d03b3b"),
        ...SERIES_PADRAO,
      },
      fontDisplay: "Archivo",
      fontBody: "Inter",
      textBase: 16,
      textScale: 1.25,
      radius: 8,
      density: 1,
      shadow: "soft",
    },
  },
  minimalista: {
    label: "Minimalista",
    values: {
      colors: {
        page: par("#ffffff", "#0a0a0a"),
        surface: par("#f7f7f7", "#161616"),
        ink: par("#0a0a0a", "#f5f5f5"),
        "ink-2": par("#525252", "#c4c4c4"),
        muted: par("#737373", "#a3a3a3"),
        rule: par("#ebebeb", "#262626"),
        "rule-strong": par("#0a0a0a", "#f5f5f5"),
        track: par("#f0f0f0", "#1f1f1f"),
        grid: par("#f0f0f0", "#1c1c1c"),
        axis: par("#a3a3a3", "#525252"),
        accent: par("#0a0a0a", "#f5f5f5"),
        success: par("#15803d", "#4ade80"),
        warning: par("#ca8a04", "#facc15"),
        critical: par("#dc2626", "#f87171"),
        ...SERIES_PADRAO,
      },
      fontDisplay: "Geist",
      fontBody: "Geist",
      textBase: 16,
      textScale: 1.2,
      radius: 6,
      density: 1,
      shadow: "soft",
    },
  },
  corporativo: {
    label: "Corporativo",
    values: {
      colors: {
        page: par("#ffffff", "#161616"),
        surface: par("#f4f4f4", "#262626"),
        ink: par("#161616", "#f4f4f4"),
        "ink-2": par("#525252", "#c6c6c6"),
        muted: par("#6f6f6f", "#a8a8a8"),
        rule: par("#e0e0e0", "#393939"),
        "rule-strong": par("#161616", "#f4f4f4"),
        track: par("#e8e8e8", "#333333"),
        grid: par("#e8e8e8", "#2e2e2e"),
        axis: par("#8d8d8d", "#6f6f6f"),
        accent: par("#0f62fe", "#78a9ff"),
        success: par("#198038", "#42be65"),
        warning: par("#f1c21b"),
        critical: par("#da1e28", "#fa4d56"),
        ...series(
          ["#6929c4", "#1192e8", "#005d5d", "#9f1853", "#fa4d56", "#570408", "#198038", "#002d9c"],
          ["#8a3ffc", "#33b1ff", "#08bdba", "#ff7eb6", "#fa4d56", "#fff1f1", "#6fdc8c", "#4589ff"],
        ),
      },
      fontDisplay: "IBM Plex Sans",
      fontBody: "IBM Plex Sans",
      textBase: 16,
      textScale: 1.2,
      radius: 2,
      density: 1,
      shadow: "soft",
    },
  },
  acolhedor: {
    label: "Acolhedor",
    values: {
      colors: {
        page: par("#fffaf3", "#1c1714"),
        surface: par("#f6eee2", "#28211c"),
        ink: par("#2b2118", "#f5ece1"),
        "ink-2": par("#5e4f42", "#d6c7b6"),
        muted: par("#7d6b58", "#a8968a"),
        rule: par("#eadfce", "#3a3029"),
        "rule-strong": par("#2b2118", "#f5ece1"),
        track: par("#efe4d3", "#332a23"),
        grid: par("#f0e7da", "#2c241e"),
        axis: par("#b4a28c", "#6e6052"),
        accent: par("#c2410c", "#fb923c"),
        success: par("#3f7d3a", "#86c97f"),
        warning: par("#d97706", "#f59e0b"),
        critical: par("#b42318", "#f97066"),
        ...series(
          ["#c2410c", "#0e7490", "#65a30d", "#a16207", "#be185d", "#4d7c0f", "#7c3aed", "#b91c1c"],
          ["#fb923c", "#22d3ee", "#a3e635", "#facc15", "#f472b6", "#84cc16", "#a78bfa", "#f87171"],
        ),
      },
      fontDisplay: "Fraunces",
      fontBody: "Nunito",
      textBase: 16,
      textScale: 1.25,
      radius: 14,
      density: 1.1,
      shadow: "soft",
    },
  },
  brutalista: {
    label: "Brutalista",
    values: {
      colors: {
        page: par("#ffffff", "#000000"),
        surface: par("#fff3b0", "#1f1f1f"),
        ink: par("#000000", "#ffffff"),
        "ink-2": par("#222222", "#e5e5e5"),
        muted: par("#555555", "#b3b3b3"),
        rule: par("#000000", "#ffffff"),
        "rule-strong": par("#000000", "#ffffff"),
        track: par("#e5e5e5", "#262626"),
        grid: par("#e5e5e5", "#262626"),
        axis: par("#000000", "#ffffff"),
        accent: par("#e03a00", "#ff6a3d"),
        success: par("#00875a", "#00d68f"),
        warning: par("#ffb800"),
        critical: par("#e00000", "#ff4d4d"),
        ...series(
          ["#ff3d00", "#0047ff", "#00a86b", "#ffb800", "#ff00a8", "#00b8d9", "#7a00ff", "#000000"],
          ["#ff6a3d", "#4d7cff", "#00d68f", "#ffd000", "#ff4dc4", "#33d6f2", "#a64dff", "#ffffff"],
        ),
      },
      fontDisplay: "Space Grotesk",
      fontBody: "Space Grotesk",
      textBase: 16,
      textScale: 1.25,
      radius: 0,
      density: 0.95,
      shadow: "hard",
    },
  },
} satisfies Record<string, { label: string; values: ThemeValues }>;

export type PresetId = keyof typeof PRESETS;
export const PRESET_IDS = Object.keys(PRESETS) as PresetId[];
export const DEFAULT_PRESET: PresetId = "editorial";

export function presetValues(id: PresetId): ThemeValues {
  return structuredClone(PRESETS[id].values) as ThemeValues;
}
