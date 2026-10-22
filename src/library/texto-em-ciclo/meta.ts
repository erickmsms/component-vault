import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "texto-em-ciclo",
  name: "Texto em ciclo",
  description:
    "Texto que corre em laço por uma forma (onda, círculo, infinito, arco ou reta), em geral sobre uma fita colorida. Pode cruzar uma segunda fita, ser arrastado com inércia e acelerar com a rolagem da página. Adaptado do TextLoop do React Bits (reactbits.dev/text-animations/text-loop).",
  category: "animation",
  tags: ["animação", "texto", "faixa", "marquee", "svg", "gsap"],
  source: "React Bits",
  dependencies: ["gsap"],
};
