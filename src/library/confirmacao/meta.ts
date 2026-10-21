import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "confirmacao",
  name: "Confirmação",
  description:
    "Confirmação com API imperativa: `await confirmar({ titulo, mensagem, tom })` devolve true ou false, e um HospedeiroDeConfirmacao montado uma vez mostra o diálogo. O tom “perigo” usa a cor crítica e começa o foco em Cancelar. Também exporta a CaixaDeConfirmacao, controlada por estado.",
  category: "overlay",
  tags: ["diálogo", "modal", "promise", "ação destrutiva", "acessibilidade"],
  source: "acktalabs",
  thumbnailWidth: 800,
};
