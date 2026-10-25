// Fontes que a vitrine oferece para títulos e texto.

/**
 * Todas vêm do next/font (src/app/fontes.ts): os arquivos são baixados no build e servidos
 * pelo próprio site, então trocar de fonte não faz o navegador falar com o Google.
 */
export const LOCAL_FONTS: Record<string, string> = {
  Archivo: "var(--font-archivo)",
  "Bricolage Grotesque": "var(--font-bricolage)",
  "DM Sans": "var(--font-dm-sans)",
  "DM Serif Display": "var(--font-dm-serif)",
  Fraunces: "var(--font-fraunces)",
  Geist: "var(--font-geist-sans)",
  "Geist Mono": "var(--font-geist-mono)",
  "IBM Plex Sans": "var(--font-plex)",
  "Instrument Serif": "var(--font-instrument-serif)",
  Inter: "var(--font-inter)",
  "JetBrains Mono": "var(--font-jetbrains)",
  "Libre Baskerville": "var(--font-libre-baskerville)",
  Lora: "var(--font-lora)",
  Manrope: "var(--font-manrope)",
  Merriweather: "var(--font-merriweather)",
  Montserrat: "var(--font-montserrat)",
  Nunito: "var(--font-nunito)",
  Outfit: "var(--font-outfit)",
  "Playfair Display": "var(--font-playfair)",
  "Plus Jakarta Sans": "var(--font-jakarta)",
  Poppins: "var(--font-poppins)",
  Rubik: "var(--font-rubik)",
  Sora: "var(--font-sora)",
  "Source Serif 4": "var(--font-source-serif)",
  "Space Grotesk": "var(--font-space-grotesk)",
  "Space Mono": "var(--font-space-mono)",
  "Work Sans": "var(--font-work-sans)",
};

export const ALL_FONTS = Object.keys(LOCAL_FONTS).sort((a, b) => a.localeCompare(b));

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
  const local = Object.hasOwn(LOCAL_FONTS, family) ? LOCAL_FONTS[family] : undefined;
  if (target === "vault" && local) return `${local}, ${FALLBACK}`;
  if (!NOME_SEGURO.test(family)) return FALLBACK;
  return `"${family}", ${FALLBACK}`;
}
