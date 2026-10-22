import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "texto-distorcido",
  name: "Texto distorcido",
  description:
    "Texto em WebGL que ondula devagar e se curva e refrata em volta do ponteiro, como uma lente (inchar, apertar ou girar), com ondas de choque ao clicar. Parado, uma lente fraca passeia sozinha. Adaptado do WarpText do React Bits (reactbits.dev/text-animations/warp-text).",
  category: "animation",
  tags: ["animação", "texto", "distorção", "ponteiro", "interativo", "webgl"],
  source: "React Bits",
  dependencies: ["ogl"],
};
