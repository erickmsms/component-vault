import { useState } from "react";
import { SeletorMultiplo } from "@/library/seletor-multiplo/SeletorMultiplo";
import { defineStories } from "@/registry/stories";
import { Cabecalho } from "./Cabecalho";

const LOJAS = [
  { valor: "centro", rotulo: "Centro", cor: "var(--series-1)" },
  { valor: "shopping", rotulo: "Shopping", cor: "var(--series-2)" },
  { valor: "online", rotulo: "Online", cor: "var(--series-3)" },
];

function Filtro() {
  const [lojas, setLojas] = useState(LOJAS.map((l) => l.valor));
  return (
    <SeletorMultiplo
      rotulo="Lojas"
      opcoes={LOJAS}
      selecionados={lojas}
      aoMudar={setLojas}
      textos={{ todos: "Todas", nenhum: "Nenhuma", marcarTodos: "Marcar todas" }}
    />
  );
}

export default defineStories({
  args: { titulo: "Painel de vendas", comFiltro: true, larguraMaxima: "max-w-[70rem]" },
  controls: {
    titulo: { type: "text" },
    comFiltro: { type: "boolean", label: "children (filtro de exemplo)" },
    larguraMaxima: { type: "select", options: ["max-w-[70rem]", "max-w-5xl", "max-w-none"] },
  },
  render: (a) => (
    <div className="min-h-72 w-full">
      <Cabecalho titulo={a.titulo} larguraMaxima={a.larguraMaxima}>
        {a.comFiltro ? <Filtro /> : undefined}
      </Cabecalho>
    </div>
  ),
  stories: [{ name: "Com filtro" }, { name: "Só o título", args: { comFiltro: false } }],
});
