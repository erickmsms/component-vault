import { defineStories } from "@/registry/stories";
import { ListaDeIndicadores } from "./ListaDeIndicadores";

const INDICADORES = [
  { rotulo: "Conversão", valor: "3,2%", descricao: "acima da meta de 2,5%" },
  { rotulo: "Cancelamentos", valor: "−12%", descricao: "menos clientes saíram" },
  { rotulo: "NPS", valor: "+64", descricao: "clientes recomendam bastante" },
  { rotulo: "Tempo de resposta", valor: "2h", descricao: "dentro do combinado" },
];

export default defineStories({
  args: {
    titulo: "Saúde da conta",
    dica: "Indicadores dos últimos 30 dias, comparados com o período anterior.",
    quantidade: 3,
    comDescricao: true,
  },
  controls: {
    titulo: { type: "text", label: "titulo (vazio = sem título)" },
    dica: { type: "text", label: "dica (vazio = sem ícone)" },
    quantidade: { type: "number", label: "itens (quantidade)", min: 1, max: 4 },
    comDescricao: { type: "boolean", label: "descrição em cada item" },
  },
  render: (a) => (
    <div className="w-full max-w-xs">
      <ListaDeIndicadores
        titulo={a.titulo || undefined}
        dica={a.dica || undefined}
        itens={INDICADORES.slice(0, a.quantidade).map((i) => (a.comDescricao ? i : { ...i, descricao: undefined }))}
      />
    </div>
  ),
  stories: [
    { name: "Com título e dica" },
    { name: "Só os números", args: { titulo: "", dica: "", comDescricao: false, quantidade: 4 } },
  ],
});
