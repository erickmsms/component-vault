import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "texto-desfocado",
  name: "Texto desfocado",
  description:
    "Texto que entra em foco palavra por palavra (ou letra por letra), saindo do desfoque e deslizando até o lugar. Cinco efeitos (desfoque, zoom, inclinar, foco e deriva), ordem de entrada, gatilhos (ao aparecer, ao carregar, ao passar o mouse ou ao clicar), repetição e foco por palavra. Leitores de tela leem o texto inteiro. Adaptado do BlurText do React Bits (reactbits.dev/text-animations/blur-text).",
  category: "animation",
  tags: ["animação", "texto", "desfoque", "blur", "entrada", "motion"],
  source: "React Bits",
  dependencies: ["motion"],
  miniaturaRepete: 4000,
};
