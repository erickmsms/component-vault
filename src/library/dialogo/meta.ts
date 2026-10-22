import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "dialogo",
  name: "Diálogo",
  description:
    "Diálogo modal sobre <dialog> nativo, com título e ações sempre fixos e só o meio rolando. Status com ícone, quatro tamanhos, posição (folha no celular), três fundos, modo alerta que exige escolha explícita e arredondamento concêntrico.",
  category: "overlay",
  tags: ["modal", "confirmacao", "alerta", "acessibilidade", "teclado"],
  source: "component-vault",
  // O diálogo aberto cobre a janela do iframe: sem altura fixa, o iframe teria só a altura do botão
  previewHeight: 640,
};
