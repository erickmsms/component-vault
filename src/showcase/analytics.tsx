"use client";

import { Analytics, type BeforeSend } from "@vercel/analytics/next";

type NavegadorComGpc = Navigator & { globalPrivacyControl?: boolean };

/**
 * Antes de enviar qualquer visita: respeita os avisos de privacidade do navegador
 * (Do Not Track e Global Privacy Control), não conta os iframes de preview (só a página
 * que os contém) e tira a query string do endereço.
 */
const filtrarEvento: BeforeSend = (evento) => {
  const navegador = navigator as NavegadorComGpc;
  if (navegador.doNotTrack === "1" || navegador.globalPrivacyControl === true) return null;
  try {
    const url = new URL(evento.url);
    if (url.pathname.startsWith("/preview/")) return null;
    return { ...evento, url: url.origin + url.pathname };
  } catch {
    return null;
  }
};

/** Vercel Web Analytics: visitas e páginas mais vistas, sem cookies, já filtradas por `filtrarEvento`. */
export function AnalyticsComPrivacidade() {
  return <Analytics beforeSend={filtrarEvento} />;
}
