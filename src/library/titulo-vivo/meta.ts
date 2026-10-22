import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "titulo-vivo",
  name: "Título vivo",
  description:
    "Título em que cada palavra fica mais leve conforme o mouse se aproxima, o mesmo efeito do título da página inicial. Mede as palavras só ao carregar e no resize e anima num único requestAnimationFrame, para não pesar. Precisa de fonte variável.",
  category: "animation",
  tags: ["animação", "mouse", "texto", "título", "fonte variável"],
  source: "component-vault",
};
