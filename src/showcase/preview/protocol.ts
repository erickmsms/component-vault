import type { Args } from "@/registry/stories";

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
