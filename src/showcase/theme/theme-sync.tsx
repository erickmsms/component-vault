"use client";

import { useEffect } from "react";
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

/**
 * Mantém o documento igual às escolhas de tema: o CSS dos tokens e o modo claro/escuro (em <html data-mode>). Roda na vitrine e nos iframes.
 */
export function ThemeSync() {
  const settings = useThemeSettings();

  useEffect(() => {
    aplicarCss(storedTheme(settings).css);
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
