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
   * de reduzir para caber. Use em seções e páginas; sem isso, a miniatura se ajusta sozinha.
   */
  thumbnailWidth?: number;
  /**
   * Altura fixa (px) do iframe de preview, com rolagem dentro dele. Para
   * componentes que reagem à rolagem; sem isso, o iframe cresce com o conteúdo.
   */
  previewHeight?: number;
  /**
   * Só para animações de entrada, que tocam uma vez: a miniatura do catálogo monta o exemplo
   * de novo a cada tantos milissegundos, para a animação voltar a tocar.
   */
  miniaturaRepete?: number;
};
