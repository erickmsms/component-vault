import { useSyncExternalStore } from "react";
import type { FontLink } from "@/themes/fonts";
import { DEFAULT_PRESET, PRESETS, presetValues, type PresetId } from "@/themes/presets";
import { themeCss, themeFontLinks, type ThemeValues } from "@/themes/tokens";
import { STORAGE_KEY } from "./constants";

export type ModePreference = "light" | "dark" | "system";

export type ThemeSettings = {
  /** Tema de partida; `values` começa igual a ele e muda com o editor. */
  preset: PresetId;
  mode: ModePreference;
  values: ThemeValues;
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

/** Aceita dados de versões antigas: o que faltar vem do tema de partida. */
function normalizar(dado: unknown): ThemeSettings {
  const s = (dado as Partial<StoredTheme> | null)?.settings;
  if (!s || !(s.preset in PRESETS)) return DEFAULT_SETTINGS;
  const base = presetValues(s.preset);
  return {
    preset: s.preset,
    mode: s.mode === "light" || s.mode === "dark" ? s.mode : "system",
    values: { ...base, ...s.values, colors: { ...base.colors, ...s.values?.colors } },
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

/** O tema mudou em relação ao de partida (por edição ou troca de fonte)? */
export function isEdited(settings: ThemeSettings) {
  return JSON.stringify(settings.values) !== JSON.stringify(presetValues(settings.preset));
}
