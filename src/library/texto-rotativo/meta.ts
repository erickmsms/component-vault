import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "texto-rotativo",
  name: "Texto rotativo",
  description:
    "Palavra que troca por outra em ciclo, letra por letra, deslizando, virando, desfocando, crescendo ou caindo. Pode ter um fundo de destaque que acompanha a largura do texto, escalonar as letras a partir de qualquer ponto e ser controlado por ref. Porte do RotatingText do React Bits (reactbits.dev/text-animations/rotating-text).",
  category: "animation",
  tags: ["animação", "texto", "rotação", "troca", "título", "motion"],
  source: "React Bits",
  dependencies: ["motion"],
};
