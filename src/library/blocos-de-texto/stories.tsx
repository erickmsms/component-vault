import { defineStories } from "@/registry/stories";
import { BlocosDeTexto } from "./BlocosDeTexto";

const BLOCOS = [
  {
    titulo: "Como medimos",
    conteudo: "Somamos os pedidos pagos de cada dia e comparamos com o mesmo período do mês anterior.",
  },
  {
    titulo: "Limitações",
    conteudo: "Pedidos cancelados depois de 7 dias ainda aparecem como vendas no mês em que foram feitos.",
  },
  {
    titulo: "Próximos passos",
    conteudo: "Separar as vendas por campanha e incluir as devoluções no cálculo da receita.",
  },
  { titulo: "Contato", conteudo: "Dúvidas sobre os números: fale com o time de dados." },
];

export default defineStories({
  args: { quantidade: 3 },
  controls: { quantidade: { type: "number", label: "blocos (quantidade)", min: 1, max: 4 } },
  render: (a) => (
    <div className="w-full">
      <BlocosDeTexto blocos={BLOCOS.slice(0, a.quantidade)} />
    </div>
  ),
  stories: [{ name: "Três blocos" }, { name: "Dois blocos", args: { quantidade: 2 } }],
});
