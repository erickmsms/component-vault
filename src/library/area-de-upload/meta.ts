import type { ComponentMeta } from "@/registry/types";

export const meta: ComponentMeta = {
  slug: "area-de-upload",
  name: "Área de Upload",
  description:
    "Área para arrastar e soltar ou clicar e escolher arquivos, com validação de tipo, tamanho e quantidade, lista dos escolhidos com miniatura (prévia de imagens ou ícone pelo tipo), tamanho, botão de remover e progresso de envio de cada um. Exporta também a MiniaturaDeArquivo.",
  category: "forms",
  tags: ["upload", "arquivo", "arrastar e soltar", "drag and drop", "progresso"],
  source: "acktalabs",
};
