import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "texto-contornado",
  name: "Texto contornado",
  description:
    "Texto que se desenha: o contorno de cada letra é traçado uma após a outra e o preenchimento entra varrendo ou letra a letra, com sombra, tracejado e gatilhos (ao montar, ao rolar, ao passar o mouse ou em ciclo). Adaptado do StrokeText do React Bits (reactbits.dev/text-animations/stroke-text).",
  category: "animation",
  tags: ["animação", "texto", "contorno", "stroke", "svg", "gsap"],
  source: "React Bits",
  dependencies: ["gsap"],
};
