import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "texto-em-foco",
  name: "Texto em foco",
  description:
    "Frase em que uma palavra por vez fica nítida e as outras desfocadas, com uma moldura (cantos, caixa, sublinhado ou marca-texto) que pula de palavra em palavra, em ordem ou ao acaso. No modo manual, o foco segue o mouse. Porte do TrueFocus do React Bits (reactbits.dev/text-animations/true-focus).",
  category: "animation",
  tags: ["animação", "texto", "foco", "desfoque", "moldura", "motion"],
  source: "React Bits",
  dependencies: ["motion"],
};
