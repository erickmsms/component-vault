import { useSyncExternalStore } from "react";
import type { FontLink } from "@/themes/fonts";
import { fonteConhecida } from "@/themes/fonts";
import { LIMITES, normalizarHex } from "@/themes/json";
import { DEFAULT_PRESET, PRESETS, presetValues, type PresetId } from "@/themes/presets";
import {
  COLOR_TOKENS,
  SHADOWS,
  themeCss,
  themeFontLinks,
  type ColorPair,
  type ColorToken,
  type ThemeValues,
} from "@/themes/tokens";
import { STORAGE_KEY } from "./constants";

export type ModePreference = "light" | "dark" | "system";

export type ThemeSettings = {
  /** Tema de partida; `values` começa igual a ele e muda com o editor. */
  preset: PresetId;
  mode: ModePreference;
  values: ThemeValues;
  /** Tema colado como JSON: quando existe, ele é a base no lugar do preset. */
  importado?: ThemeValues;
};

/** O que fica salvo: as escolhas e o CSS já gerado, que o script do <head> aplica antes da pintura. */
export type StoredTheme = { settings: ThemeSettings; css: string; fontLinks: FontLink[] };

export const DEFAULT_SETTINGS: ThemeSettings = {
  preset: DEFAULT_PRESET,
  mode: "system",
  values: presetValues(DEFAULT_PRESET),
};

let memoria: string | null = null; // quando o localStorage não está disponível
let cache: { raw: string | null; settings: ThemeSettings } = { raw: null, settings: DEFAULT_SETTINGS };
const ouvintes = new Set<() => void>();

function lerBruto() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return memoria;
  }
}

/**
 * Revalida os valores salvos no navegador: o localStorage pode ter sido alterado (por
 * outra aba, extensão ou script) e tudo aqui vira CSS. Cada campo que não passar nas
 * mesmas regras do "Colar JSON" volta ao valor de partida.
 */
function valoresSeguros(base: ThemeValues, bruto: unknown): ThemeValues {
  const v = (bruto && typeof bruto === "object" ? bruto : {}) as Partial<ThemeValues>;
  const entradaCores = (v.colors && typeof v.colors === "object" ? v.colors : {}) as Partial<
    Record<ColorToken, Partial<ColorPair> | null>
  >;
  const colors = structuredClone(base.colors);
  for (const token of COLOR_TOKENS) {
    for (const modo of ["light", "dark"] as const) {
      const hex = normalizarHex(entradaCores[token]?.[modo]);
      if (hex) colors[token][modo] = hex;
    }
  }
  const numero = (campo: keyof typeof LIMITES) => {
    const n = v[campo];
    if (typeof n !== "number" || !Number.isFinite(n)) return base[campo];
    return Math.min(LIMITES[campo].max, Math.max(LIMITES[campo].min, n));
  };
  return {
    colors,
    fontDisplay: fonteConhecida(v.fontDisplay) ?? base.fontDisplay,
    fontBody: fonteConhecida(v.fontBody) ?? base.fontBody,
    textBase: numero("textBase"),
    textScale: numero("textScale"),
    radius: numero("radius"),
    density: numero("density"),
    shadow: typeof v.shadow === "string" && Object.hasOwn(SHADOWS, v.shadow) ? v.shadow : base.shadow,
  };
}

/** Aceita dados de versões antigas: o que faltar ou for inválido vem do tema de partida. */
function normalizar(dado: unknown): ThemeSettings {
  const s = (dado as Partial<StoredTheme> | null)?.settings;
  if (!s || typeof s.preset !== "string" || !Object.hasOwn(PRESETS, s.preset)) return DEFAULT_SETTINGS;
  const base = presetValues(s.preset);
  return {
    preset: s.preset,
    mode: s.mode === "light" || s.mode === "dark" ? s.mode : "system",
    values: valoresSeguros(base, s.values),
    ...(s.importado ? { importado: valoresSeguros(base, s.importado) } : {}),
  };
}

function getSnapshot() {
  const raw = lerBruto();
  if (raw !== cache.raw) {
    let settings = DEFAULT_SETTINGS;
    try {
      settings = normalizar(raw ? JSON.parse(raw) : null);
    } catch {
      // dado corrompido: volta ao padrão
    }
    cache = { raw, settings };
  }
  return cache.settings;
}

const getServerSnapshot = () => DEFAULT_SETTINGS;

function subscribe(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  // Outras abas e os iframes de preview recebem as mudanças por este evento
  const aoMudarStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) ouvinte();
  };
  window.addEventListener("storage", aoMudarStorage);
  return () => {
    ouvintes.delete(ouvinte);
    window.removeEventListener("storage", aoMudarStorage);
  };
}

export function storedTheme(settings: ThemeSettings): StoredTheme {
  return { settings, css: themeCss(settings.values, "vault"), fontLinks: themeFontLinks(settings.values) };
}

export function updateSettings(mudar: (atual: ThemeSettings) => ThemeSettings) {
  const raw = JSON.stringify(storedTheme(mudar(getSnapshot())));
  try {
    localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    memoria = raw;
  }
  ouvintes.forEach((o) => o());
}

export function useThemeSettings() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Valores de partida: o JSON colado, se houver, senão o preset. */
export function baseValues(settings: ThemeSettings) {
  return settings.importado ?? presetValues(settings.preset);
}

/** O tema mudou em relação ao de partida (por edição ou troca de fonte)? */
export function isEdited(settings: ThemeSettings) {
  return JSON.stringify(settings.values) !== JSON.stringify(baseValues(settings));
}

/** Nome para exibir: "Personalizado" para JSON colado, senão o do preset. */
export function themeName(settings: ThemeSettings) {
  const base = settings.importado ? "Personalizado" : PRESETS[settings.preset].label;
  return isEdited(settings) ? `${base} (editado)` : base;
}
