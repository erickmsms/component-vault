import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "quadro-metricas",
  name: "Quadro de Métricas",
  description:
    "Grupos de métricas em listas rótulo → valor, cada termo com a sua explicação. Os grupos viram colunas conforme a largura.",
  category: "data-display",
  tags: ["métricas", "lista de definição", "tooltip"],
  source: "climatempo",
  theme: "editorial",
  thumbnailWidth: 1000,
};
