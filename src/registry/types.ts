import type { CategoryId } from "./categories";

export type ComponentMeta = {
  /** Usado na URL (/components/<slug>). Deve ser igual ao nome da pasta em src/library. */
  slug: string;
  name: string;
  description: string;
  /** Tipo do componente: define a seção do catálogo em que ele aparece. */
  category: CategoryId;
  /** Temas e palavras-chave livres: estilo, assunto, contexto de uso... */
  tags: string[];
  /** Projeto de onde o componente foi extraído. */
  source?: string;
  /** Pacotes npm necessários além de react e tailwind. */
  dependencies?: string[];
  /**
   * Largura (px) em que o card do catálogo renderiza a primeira variação antes
   * de reduzir para caber. Use em seções e páginas; sem isso, aparece em 75%.
   */
  thumbnailWidth?: number;
};
