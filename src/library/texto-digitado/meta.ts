import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "texto-digitado",
  name: "Texto digitado",
  description:
    "Texto que se digita letra por letra, apaga e passa para a próxima frase, com cursor que pisca e desliza. Pode errar teclas vizinhas e corrigir, apagar selecionando, animar cada letra e ter prefixo de terminal. Leitores de tela leem as frases inteiras. Porte do TextType do React Bits (reactbits.dev/text-animations/text-type).",
  category: "animation",
  tags: ["animação", "texto", "digitação", "máquina de escrever", "gsap"],
  source: "React Bits",
  dependencies: ["gsap"],
};
