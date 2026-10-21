import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "campo-de-moeda",
  name: "Campo de Moeda",
  description:
    "Campo de dinheiro que formata enquanto se digita (Intl, qualquer moeda e localidade) e guarda o número. Com um valor calculado de referência, oferece restaurá-lo quando a pessoa o substitui.",
  category: "forms",
  tags: ["moeda", "dinheiro", "máscara", "input"],
  source: "acktalabs",
};
