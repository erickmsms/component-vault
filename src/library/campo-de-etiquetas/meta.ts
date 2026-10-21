import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "campo-de-etiquetas",
  name: "Campo de Etiquetas",
  description:
    "Campo que transforma o texto em etiquetas: Enter ou vírgula adiciona, Backspace apaga a última, × remove e colar uma lista cria várias. Ignora repetidas, respeita um máximo e aceita sugestões.",
  category: "forms",
  tags: ["tags", "chips", "input", "teclado"],
  source: "acktalabs",
};
