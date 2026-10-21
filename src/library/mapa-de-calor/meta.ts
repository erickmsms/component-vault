import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "mapa-de-calor",
  name: "Mapa de Calor",
  description:
    "Grade de linhas × colunas (como dias da semana × horas) com a cor de cada célula pela intensidade do valor, balão com o valor ao passar o mouse ou focar, legenda do menor ao maior e células sem dado. Navegável pelas setas do teclado.",
  category: "charts",
  tags: ["heatmap", "grade", "intensidade", "dashboard", "acessibilidade"],
  source: "acktalabs",
};
