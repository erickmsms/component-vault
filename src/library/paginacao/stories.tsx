import { useState } from "react";
import { defineStories } from "@/registry/stories";
import { Paginacao, type TextosDaPaginacao } from "./Paginacao";

function Exemplo({
  pagina,
  totalDePaginas,
  vizinhos,
  rotulo,
  textos,
}: {
  pagina: number;
  totalDePaginas: number;
  vizinhos: number;
  rotulo?: string;
  textos?: Partial<TextosDaPaginacao>;
}) {
  const [atual, setAtual] = useState(pagina);
  return (
    <Paginacao
      pagina={atual}
      totalDePaginas={totalDePaginas}
      aoMudar={setAtual}
      vizinhos={vizinhos}
      rotulo={rotulo}
      textos={textos}
    />
  );
}

export default defineStories({
  args: { pagina: 5, totalDePaginas: 20, vizinhos: 1, rotulo: "Paginação" },
  controls: {
    pagina: { type: "number", min: 1, max: 100 },
    totalDePaginas: { type: "number", min: 1, max: 100 },
    vizinhos: { type: "number", min: 0, max: 3 },
    rotulo: { type: "text" },
  },
  render: (a) => (
    <Exemplo
      key={`${a.pagina}-${a.totalDePaginas}`}
      pagina={a.pagina}
      totalDePaginas={a.totalDePaginas}
      vizinhos={a.vizinhos}
      rotulo={a.rotulo}
    />
  ),
  stories: [
    { name: "Padrão" },
    { name: "Poucas páginas", args: { pagina: 2, totalDePaginas: 5 } },
    { name: "Primeira página", args: { pagina: 1 } },
    { name: "Mais vizinhos", args: { pagina: 10, vizinhos: 2 } },
    {
      name: "Textos próprios",
      render: () => (
        <Exemplo pagina={3} totalDePaginas={12} vizinhos={1} rotulo="Pagination" textos={{ anterior: "Previous", proxima: "Next" }} />
      ),
    },
  ],
});
