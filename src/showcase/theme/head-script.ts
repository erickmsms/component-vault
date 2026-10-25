import { STORAGE_KEY } from "./constants";

/**
 * Roda no <head>, antes da página pintar: aplica o modo claro/escuro, o CSS do
 * tema salvo e as fontes. Sem isso, a página apareceria um instante com o tema
 * padrão antes do React carregar. O ThemeSync mantém tudo atualizado depois.
 */
export const THEME_HEAD_SCRIPT = `(function () {
  var html = document.documentElement, salvo = null;
  try { salvo = JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)}) || "null"); } catch (e) {}
  var modo = salvo && salvo.settings && salvo.settings.mode;
  if (modo !== "light" && modo !== "dark") modo = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  html.dataset.mode = modo;
  // O CSS salvo só é aplicado se tiver o formato que o themeCss gera: uma regra do tema,
  // sem url(), @-regras, comentários nem barras invertidas. Se não, o ThemeSync refaz o CSS.
  function cssSeguro(css) {
    if (typeof css !== "string" || css.length > 8000) return false;
    if (css.indexOf(${JSON.stringify(`[data-theme="vault"] {`)}) !== 0) return false;
    if (css.split("{").length !== 2 || css.split("}").length !== 2) return false;
    var proibidos = ["<", ">", "@", "url(", "/*", "expression", "import", String.fromCharCode(92)];
    var minusculo = css.toLowerCase();
    for (var i = 0; i < proibidos.length; i++) if (minusculo.indexOf(proibidos[i]) !== -1) return false;
    return true;
  }
  if (!salvo || !cssSeguro(salvo.css)) return;
  var estilo = document.createElement("style");
  estilo.id = "vault-tema-atual";
  estilo.textContent = salvo.css;
  document.head.appendChild(estilo);
  (salvo.fontLinks || []).forEach(function (f) {
    // Só o CSS de fontes do Google, com o endereço que o próprio site gera
    var prefixo = "https://fonts.googleapis.com/css2?family=";
    if (!f || typeof f.href !== "string" || f.href.indexOf(prefixo) !== 0) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = f.href;
    link.dataset.vaultFont = String(f.family);
    link.onerror = function () { if (link.href !== f.fallback && String(f.fallback).indexOf(prefixo) === 0) link.href = f.fallback; };
    document.head.appendChild(link);
  });
})();`;
