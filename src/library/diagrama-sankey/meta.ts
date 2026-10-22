import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "diagrama-sankey",
  name: "Diagrama de Sankey",
  description:
    "Fluxos entre etapas em SVG puro: colunas calculadas a partir das ligações, nós proporcionais ao volume e faixas na cor da origem. Destaque do caminho e balão com valores ao passar o mouse, e tabela para leitores de tela.",
  category: "dataviz",
  tags: ["svg", "fluxo", "funil", "interativo", "acessibilidade", "sem dependências"],
  source: "component-vault",
  thumbnailWidth: 720,
};
