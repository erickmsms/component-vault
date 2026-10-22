import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "medidor-solido",
  name: "Medidor Sólido",
  description:
    "Medidor de meia-volta em SVG para um número em relação a um limite: arco sólido que cresce ao entrar na tela, número no centro, limites nas pontas e cor por faixas (bom, atenção, crítico). Exposto como role=\"meter\".",
  category: "dataviz",
  tags: ["svg", "kpi", "gauge", "acessibilidade", "sem dependências"],
  source: "component-vault",
};
