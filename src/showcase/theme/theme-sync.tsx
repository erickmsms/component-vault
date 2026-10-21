"use client";

import { useEffect } from "react";
import type { FontLink } from "@/themes/fonts";
import { storedTheme, useThemeSettings } from "./store";

const ID_DO_ESTILO = "vault-tema-atual";

function aplicarCss(css: string) {
  let estilo = document.getElementById(ID_DO_ESTILO);
  if (!estilo) {
    estilo = document.createElement("style");
    estilo.id = ID_DO_ESTILO;
    document.head.appendChild(estilo);
  }
  if (estilo.textContent !== css) estilo.textContent = css;
}

function carregarFonte(fonte: FontLink) {
  if (document.head.querySelector(`link[data-vault-font="${CSS.escape(fonte.family)}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = fonte.href;
  link.dataset.vaultFont = fonte.family;
  link.onerror = () => {
    if (link.href !== fonte.fallback) link.href = fonte.fallback;
  };
  document.head.appendChild(link);
}

/**
 * Mantém o documento igual às escolhas de tema: o CSS dos tokens, as fontes do
 * Google e o modo claro/escuro (em <html data-mode>). Roda na vitrine e nos iframes.
 */
export function ThemeSync() {
  const settings = useThemeSettings();

  useEffect(() => {
    const { css, fontLinks } = storedTheme(settings);
    aplicarCss(css);
    fontLinks.forEach(carregarFonte);
  }, [settings]);

  useEffect(() => {
    const sistema = matchMedia("(prefers-color-scheme: dark)");
    const aplicar = () => {
      const escuro = settings.mode === "dark" || (settings.mode === "system" && sistema.matches);
      document.documentElement.dataset.mode = escuro ? "dark" : "light";
    };
    aplicar();
    sistema.addEventListener("change", aplicar);
    return () => sistema.removeEventListener("change", aplicar);
  }, [settings.mode]);

  return null;
}
