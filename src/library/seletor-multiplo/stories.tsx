import { useState } from "react";
import { defineStories } from "@/registry/stories";
import { SeletorMultiplo } from "./SeletorMultiplo";

const ESTADOS = [
  "Bahia",
  "Ceará",
  "Goiás",
  "Minas Gerais",
  "Pará",
  "Paraná",
  "Pernambuco",
  "Rio de Janeiro",
  "Rio Grande do Sul",
  "São Paulo",
];

const NO_FEMININO = { todos: "Todas", nenhum: "Nenhuma", marcarTodos: "Marcar todas" };

function Exemplo({
  rotulo,
  quantidade,
  comCores,
  feminino,
  comBusca,
}: {
  rotulo: string;
  quantidade: number;
  comCores: boolean;
  feminino: boolean;
  comBusca: boolean;
}) {
  const opcoes = ESTADOS.slice(0, quantidade).map((nome, i) => ({
    valor: nome,
    rotulo: nome,
    cor: comCores ? (i < 8 ? `var(--series-${i + 1})` : "var(--muted)") : undefined,
  }));
  const [selecionados, setSelecionados] = useState(opcoes.slice(0, 2).map((o) => o.valor));
  return (
    <div className="flex min-h-96 items-start justify-center">
      <SeletorMultiplo
        rotulo={rotulo}
        opcoes={opcoes}
        selecionados={selecionados.filter((s) => opcoes.some((o) => o.valor === s))}
        aoMudar={setSelecionados}
        textos={feminino ? NO_FEMININO : undefined}
        comBusca={comBusca}
        rotuloDaBusca={feminino ? "Buscar região..." : "Buscar estado..."}
      />
    </div>
  );
}

export default defineStories({
  args: { rotulo: "Regiões", quantidade: 5, comCores: true, feminino: true, comBusca: false },
  controls: {
    rotulo: { type: "text" },
    quantidade: { type: "number", label: "opções (quantidade)", min: 2, max: 10 },
    comCores: { type: "boolean", label: "cor em cada opção" },
    feminino: { type: "boolean", label: "textos no feminino (Todas/Nenhuma)" },
    comBusca: { type: "boolean", label: "busca no painel" },
  },
  render: (a) => <Exemplo key={a.quantidade} {...a} />,
  stories: [
    { name: "Com cores" },
    { name: "Sem cores", args: { rotulo: "Lojas", comCores: false, feminino: true } },
    { name: "Muitas opções", args: { rotulo: "Estados", quantidade: 10, feminino: false } },
    { name: "Com busca", args: { rotulo: "Estados", quantidade: 10, feminino: false, comBusca: true } },
  ],
});
