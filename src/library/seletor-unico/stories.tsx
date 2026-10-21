import { useState } from "react";
import { defineStories } from "@/registry/stories";
import { SeletorUnico } from "./SeletorUnico";

const LISTAS: Record<string, Array<{ valor: string; rotulo: string }>> = {
  periodo: [
    { valor: "7d", rotulo: "Últimos 7 dias" },
    { valor: "30d", rotulo: "Últimos 30 dias" },
    { valor: "ano", rotulo: "Este ano" },
  ],
  metrica: [
    { valor: "receita", rotulo: "Receita" },
    { valor: "pedidos", rotulo: "Pedidos" },
    { valor: "ticket", rotulo: "Ticket médio" },
    { valor: "conversao", rotulo: "Conversão" },
  ],
};

function Exemplo({ rotulo, lista }: { rotulo: string; lista: string }) {
  const opcoes = LISTAS[lista] ?? LISTAS.periodo;
  const [valor, setValor] = useState(opcoes[0].valor);
  return (
    <div className="flex min-h-64 items-start justify-center in-data-miniatura:min-h-0">
      <SeletorUnico rotulo={rotulo} opcoes={opcoes} valor={valor} aoEscolher={setValor} />
    </div>
  );
}

export default defineStories({
  args: { rotulo: "Período", lista: "periodo" },
  controls: {
    rotulo: { type: "text" },
    lista: { type: "select", label: "opções (exemplo)", options: ["periodo", "metrica"] },
  },
  render: (a) => <Exemplo key={a.lista} rotulo={a.rotulo} lista={a.lista} />,
  stories: [{ name: "Período" }, { name: "Métrica", args: { rotulo: "Métrica", lista: "metrica" } }],
});
