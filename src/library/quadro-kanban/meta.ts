import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "quadro-kanban",
  name: "Quadro Kanban",
  description:
    "Quadro kanban controlado com colunas (cor, título, contagem, rolagem própria) e cartões (faixa de cor, prazo, etiquetas, responsáveis). Arrastar e soltar nativo entre colunas e dentro delas, com linha indicando onde o cartão cai, e um menu “Mover” para teclado e toque. Exporta moverCartao para aplicar o movimento.",
  category: "data-display",
  tags: ["kanban", "quadro", "arrastar e soltar", "drag and drop", "tarefas"],
  source: "component-vault",
  thumbnailWidth: 1200,
};
