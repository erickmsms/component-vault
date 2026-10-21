import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "modal",
  name: "Modal",
  description:
    "Janela modal acessível com chapéu, título, descrição, corpo que rola e rodapé fixo para as ações. Prende o foco, fecha com Esc, clique fora ou ×, trava a rolagem da página e devolve o foco; fecharDesativado bloqueia as saídas enquanto algo salva.",
  category: "overlay",
  tags: ["diálogo", "acessibilidade", "foco", "formulário", "animação"],
  source: "nexco",
  thumbnailWidth: 1000,
};
