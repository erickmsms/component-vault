import { defineStories } from "@/registry/stories";
import { Dica, Termo } from "./Dica";

export default defineStories({
  args: {
    frase: "A taxa de conversão subiu para 3,2% em outubro.",
    termo: "taxa de conversão",
    texto: "Percentual de visitantes que fizeram uma compra no período.",
  },
  controls: {
    frase: { type: "text", label: "children do Termo (o texto)" },
    termo: { type: "text", label: "nome (leitores de tela)" },
    texto: { type: "text", label: "dica (texto do balão)" },
  },
  render: (a) => (
    <p className="max-w-sm text-base leading-relaxed">
      <Termo dica={a.texto} nome={a.termo}>
        {a.frase}
      </Termo>
    </p>
  ),
  stories: [
    { name: "Ícone no fim da frase" },
    {
      name: "Explicação longa",
      args: {
        frase: "O NPS do trimestre ficou em 62.",
        termo: "NPS",
        texto:
          "Net Promoter Score: o quanto os clientes recomendariam o produto, de −100 a 100. Calculado como a porcentagem de promotores (notas 9 e 10) menos a de detratores (notas de 0 a 6).",
      },
    },
    {
      name: "Texto que quebra em várias linhas",
      render: () => (
        <p className="w-56 text-base leading-relaxed">
          <Termo dica="O ícone acompanha a última palavra, mesmo quando o texto quebra." nome="texto longo">
            Este texto é comprido o bastante para quebrar em várias linhas, e o ícone fica sempre no fim.
          </Termo>
        </p>
      ),
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
