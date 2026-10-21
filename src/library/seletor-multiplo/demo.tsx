import { useState } from "react";
import { SeletorMultiplo } from "./SeletorMultiplo";

const REGIOES = [
  { valor: "norte", rotulo: "Norte", cor: "var(--series-1)" },
  { valor: "nordeste", rotulo: "Nordeste", cor: "var(--series-2)" },
  { valor: "centro-oeste", rotulo: "Centro-Oeste", cor: "var(--series-3)" },
  { valor: "sudeste", rotulo: "Sudeste", cor: "var(--series-4)" },
  { valor: "sul", rotulo: "Sul", cor: "var(--series-5)" },
];

export default function SeletorMultiploDemo() {
  const [selecionadas, setSelecionadas] = useState(["nordeste", "sul"]);

  return (
    <div className="flex min-h-96 items-start justify-center">
      <SeletorMultiplo
        rotulo="Regiões"
        opcoes={REGIOES}
        selecionados={selecionadas}
        aoMudar={setSelecionadas}
        textos={{ todos: "Todas", nenhum: "Nenhuma", marcarTodos: "Marcar todas" }}
      />
    </div>
  );
}
