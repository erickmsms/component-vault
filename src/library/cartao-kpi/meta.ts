import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "cartao-kpi",
  name: "Cartão KPI",
  description:
    "Cartão de indicador com número grande, explicação opcional, ícone, variação contra o período anterior (com cor pelo sentido bom ou ruim) e mini gráfico de tendência em área, linha ou barras. Exporta também o Sparkline e o IndicadorDeVariacao avulsos.",
  category: "data-display",
  tags: ["kpi", "indicador", "sparkline", "variação", "dashboard"],
  source: "acktalabs",
};
