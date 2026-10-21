import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "pilha-de-cartoes",
  name: "Pilha de cartões",
  description:
    "Cartões que grudam no topo ao rolar: o seguinte sobe por cima e o de baixo recua, encolhendo e perdendo opacidade. Feito com position: sticky e um cálculo por quadro, sem bibliotecas; em telas pequenas vira uma lista simples.",
  category: "sections",
  tags: ["cartões", "scroll", "sticky", "animação", "serviços"],
  source: "nexco",
  previewHeight: 640,
  thumbnailWidth: 1000,
};
