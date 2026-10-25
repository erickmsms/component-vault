import type { ArgValue, Args } from "@/registry/stories";

// Conversa entre a página do componente e o iframe de preview (mesma origem).
export const MENSAGEM = {
  /** iframe -> página: carregou e quer o estado atual. */
  pronto: "vault:pronto",
  /** página -> iframe: o que renderizar. */
  estado: "vault:estado",
  /** iframe -> página: altura do conteúdo, para a moldura acompanhar. */
  altura: "vault:altura",
} as const;

export type Fundo = "tema" | "pontilhado";

export type EstadoDoPreview = {
  story: number;
  /** Valores do playground (só nas variações que o usam). */
  args?: Args;
  fundo: Fundo;
};

/** Altura máxima aceita para o iframe, em px: evita que uma mensagem estranha estique a página. */
export const ALTURA_MAXIMA = 20000;

/** Chaves que nunca viram argumento (protegem o objeto de args contra poluição de protótipo). */
const CHAVES_PROIBIDAS = new Set(["__proto__", "constructor", "prototype"]);

/**
 * Confere o formato do estado recebido por mensagem: devolve um estado novo e limpo,
 * ou null se algo estiver fora do esperado (variação inexistente, fundo desconhecido,
 * args que não sejam texto, número ou booleano).
 */
export function lerEstado(dado: unknown, totalDeVariacoes: number): EstadoDoPreview | null {
  if (!dado || typeof dado !== "object") return null;
  const { story, args, fundo } = dado as Record<string, unknown>;
  if (typeof story !== "number" || !Number.isInteger(story) || story < 0 || story >= totalDeVariacoes) return null;
  if (fundo !== "tema" && fundo !== "pontilhado") return null;
  if (args === undefined) return { story, fundo };
  if (!args || typeof args !== "object" || Array.isArray(args)) return null;
  const limpos: Args = {};
  for (const [chave, valor] of Object.entries(args)) {
    if (CHAVES_PROIBIDAS.has(chave)) return null;
    const tipo = typeof valor;
    if (tipo === "number" && !Number.isFinite(valor)) return null;
    if (tipo !== "string" && tipo !== "number" && tipo !== "boolean") return null;
    limpos[chave] = valor as ArgValue;
  }
  return { story, args: limpos, fundo };
}

/** Altura enviada pelo iframe: um número finito, de 1 até ALTURA_MAXIMA; senão, null. */
export function lerAltura(dado: unknown): number | null {
  if (typeof dado !== "number" || !Number.isFinite(dado) || dado < 1) return null;
  return Math.min(ALTURA_MAXIMA, Math.ceil(dado));
}
