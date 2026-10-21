import { useState } from "react";
import { SeletorMultiplo } from "@/library/seletor-multiplo/SeletorMultiplo";
import { Cabecalho } from "./Cabecalho";

const LOJAS = [
  { valor: "centro", rotulo: "Centro", cor: "var(--series-1)" },
  { valor: "shopping", rotulo: "Shopping", cor: "var(--series-2)" },
  { valor: "online", rotulo: "Online", cor: "var(--series-3)" },
];

export default function CabecalhoDemo() {
  const [lojas, setLojas] = useState(LOJAS.map((l) => l.valor));

  return (
    <div className="min-h-72 w-full">
      <Cabecalho titulo="Painel de vendas">
        <SeletorMultiplo
          rotulo="Lojas"
          opcoes={LOJAS}
          selecionados={lojas}
          aoMudar={setLojas}
          textos={{ todos: "Todas", nenhum: "Nenhuma", marcarTodos: "Marcar todas" }}
        />
      </Cabecalho>
    </div>
  );
}
