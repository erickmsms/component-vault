import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "titulo-mascarado",
  name: "Título mascarado",
  description:
    "Título com uma imagem ou vídeo aparecendo por dentro das letras: a mídia flutua, segue o mouse em paralaxe e pode ganhar zoom, tom, contorno e holofote. As letras entram subindo, crescendo, desfocadas, varridas ou em fade. Adaptado do MaskedHeading do React Bits (reactbits.dev/text-animations/masked-heading).",
  category: "animation",
  tags: ["animação", "texto", "título", "máscara", "imagem", "gsap"],
  source: "React Bits",
  dependencies: ["gsap"],
  miniaturaRepete: 5000,
};
