import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "contador",
  name: "Contador",
  description:
    "Número que conta até o valor final quando entra na tela, com desaceleração no fim. Leitores de tela recebem o valor final de uma vez e, com “reduzir movimento”, ele aparece direto.",
  category: "data-display",
  tags: ["número", "kpi", "animação", "contagem", "acessibilidade"],
  source: "nexco",
  thumbnailWidth: 900,
};
