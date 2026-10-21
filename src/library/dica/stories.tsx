import { defineStories } from "@/registry/stories";
import { Dica, Termo } from "./Dica";

export default defineStories({
  args: {
    termo: "taxa de conversão",
    texto: "Percentual de visitantes que fizeram uma compra no período.",
  },
  controls: {
    termo: { type: "text", label: "children do Termo" },
    texto: { type: "text", label: "dica (texto do balão)" },
  },
  render: (a) => (
    <p className="max-w-md text-base leading-relaxed">
      A <Termo dica={a.texto}>{a.termo}</Termo> subiu para 3,2% em outubro.
    </p>
  ),
  stories: [
    { name: "Termo no meio do texto" },
    {
      name: "Explicação longa",
      args: {
        termo: "NPS",
        texto:
          "Net Promoter Score: o quanto os clientes recomendariam o produto, de −100 a 100. Calculado como a porcentagem de promotores (notas 9 e 10) menos a de detratores (notas de 0 a 6).",
      },
    },
    {
      name: "Só o ícone",
      render: () => (
        <p className="flex items-center gap-2 text-ink-2">
          Passe o mouse ou foque:
          <Dica termo="NPS" texto="O quanto os clientes recomendariam o produto, de −100 a 100." />
        </p>
      ),
    },
  ],
});
