// Fontes que a vitrine oferece para títulos e texto.

/** Carregadas pelo next/font no layout: trocam na hora, sem buscar nada na rede. */
export const LOCAL_FONTS: Record<string, string> = {
  Archivo: "var(--font-archivo)",
  Inter: "var(--font-inter)",
  Geist: "var(--font-geist-sans)",
  "Geist Mono": "var(--font-geist-mono)",
  "IBM Plex Sans": "var(--font-plex)",
  Fraunces: "var(--font-fraunces)",
  Nunito: "var(--font-nunito)",
  "Space Grotesk": "var(--font-space-grotesk)",
};

/** Sugestões do Google Fonts, carregadas sob demanda. Qualquer outro nome do Google Fonts também funciona. */
export const GOOGLE_SUGGESTIONS = [
  "Bricolage Grotesque",
  "DM Sans",
  "DM Serif Display",
  "Instrument Serif",
  "JetBrains Mono",
  "Libre Baskerville",
  "Lora",
  "Manrope",
  "Merriweather",
  "Montserrat",
  "Outfit",
  "Playfair Display",
  "Plus Jakarta Sans",
  "Poppins",
  "Rubik",
  "Sora",
  "Source Serif 4",
  "Space Mono",
  "Work Sans",
];

export const ALL_FONTS = [...Object.keys(LOCAL_FONTS), ...GOOGLE_SUGGESTIONS].sort((a, b) => a.localeCompare(b));

const FALLBACK = "system-ui, -apple-system, \"Segoe UI\", sans-serif";

/**
 * Nome de família aceito no CSS: letras, números, espaço, ponto, hífen e sublinhado.
 * Nada de aspas, barras invertidas, quebras de linha, ponto e vírgula ou chaves, que
 * permitiriam fechar a string e escrever CSS arbitrário no tema.
 */
const NOME_SEGURO = /^[\p{L}\p{N} ._-]{1,60}$/u;

/**
 * Devolve o nome canônico de uma fonte da vitrine (ignora maiúsculas e espaços nas
 * pontas) ou null se o valor não for uma das fontes conhecidas. É o filtro de tudo
 * o que vem de fora: JSON colado e dados salvos no navegador.
 */
export function fonteConhecida(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const nome = valor.trim().toLowerCase();
  return ALL_FONTS.find((f) => f.toLowerCase() === nome) ?? null;
}

/**
 * Pilha de fontes para o CSS. Na vitrine, as locais usam a variável do next/font;
 * no CSS exportado, sai o nome da família (o outro projeto carrega a fonte).
 * Um nome fora do formato seguro vira só a fonte do sistema.
 */
export function fontStack(family: string, target: "vault" | "export") {
  const local = LOCAL_FONTS[family];
  if (target === "vault" && local) return `${local}, ${FALLBACK}`;
  if (!NOME_SEGURO.test(family)) return FALLBACK;
  return `"${family}", ${FALLBACK}`;
}

export type FontLink = { family: string; href: string; fallback: string };

/**
 * Link do Google Fonts para uma família que não é local. Pede os pesos usados
 * pelos componentes; se a família não tiver algum deles, o Google responde erro
 * e o link troca para a versão sem pesos (`fallback`).
 */
export function googleFontLink(family: string): FontLink | null {
  if (LOCAL_FONTS[family] || !family.trim()) return null;
  const nome = encodeURIComponent(family.trim()).replaceAll("%20", "+");
  return {
    family,
    href: `https://fonts.googleapis.com/css2?family=${nome}:wght@400;500;600;700;800&display=swap`,
    fallback: `https://fonts.googleapis.com/css2?family=${nome}&display=swap`,
  };
}
