import { defineStories } from "@/registry/stories";
import { NumerosPrincipais } from "./NumerosPrincipais";

const NUMEROS = [
  { valor: "R$ 48 mil", texto: "de receita em outubro." },
  { valor: "1.284", texto: "pedidos pagos no mês." },
  { valor: "3,2%", texto: "dos visitantes compraram algo." },
  { valor: "4,7", texto: "de nota média nas avaliações." },
  { valor: "2,4 dias", texto: "de prazo médio de entrega." },
  { valor: "68%", texto: "dos clientes já tinham comprado antes." },
];

export default defineStories({
  args: { quantidade: 4 },
  controls: { quantidade: { type: "number", label: "itens (quantidade)", min: 1, max: 6 } },
  render: (a) => (
    <div className="w-full">
      <NumerosPrincipais itens={NUMEROS.slice(0, a.quantidade)} />
    </div>
  ),
  stories: [
    { name: "Quatro números" },
    { name: "Três números", args: { quantidade: 3 } },
    { name: "Dois números", args: { quantidade: 2 } },
  ],
});
