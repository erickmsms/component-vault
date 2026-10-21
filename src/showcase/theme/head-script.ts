import { STORAGE_KEY } from "./constants";

/**
 * Roda no <head>, antes da página pintar: aplica o modo claro/escuro, o CSS do
 * tema salvo e as fontes. Sem isso, a página apareceria um instante com o tema
 * padrão antes do React carregar. O ThemeSync mantém tudo atualizado depois.
 */
export const THEME_HEAD_SCRIPT = `(function () {
  var html = document.documentElement, salvo = null;
  try { salvo = JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)}) || "null"); } catch (e) {}
  var modo = (salvo && salvo.settings && salvo.settings.mode) || "system";
  if (modo === "system") modo = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  html.dataset.mode = modo;
  if (!salvo || !salvo.css) return;
  var estilo = document.createElement("style");
  estilo.id = "vault-tema-atual";
  estilo.textContent = salvo.css;
  document.head.appendChild(estilo);
  (salvo.fontLinks || []).forEach(function (f) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = f.href;
    link.dataset.vaultFont = f.family;
    link.onerror = function () { if (link.href !== f.fallback) link.href = f.fallback; };
    document.head.appendChild(link);
  });
})();`;
