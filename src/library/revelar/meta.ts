import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "revelar",
  name: "Revelar e Movimento",
  description:
    "Revelar faz o conteúdo subir e aparecer ao entrar na tela. Movimento.tsx traz o que as animações da biblioteca compartilham: useSemMovimento (respeita “reduzir movimento”), useEmTela e o ProvedorDeMovimento, que desliga as animações de um trecho.",
  category: "animation",
  tags: ["animação", "scroll", "acessibilidade", "sem dependências"],
  source: "component-vault",
  previewHeight: 520,
  miniaturaRepete: 4000,
};
