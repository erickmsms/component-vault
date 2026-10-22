import { useState } from "react";
import { defineStories } from "@/registry/stories";
import { MenuSuspenso } from "./MenuSuspenso";

const ORDENS = ["Mais recentes", "Mais vendidos", "Menor preço", "Maior preço"];

function Exemplo({ rotulo, largura }: { rotulo: string; largura: string }) {
  const [ordem, setOrdem] = useState(ORDENS[0]);
  return (
    <div className="flex min-h-64 items-start justify-center in-data-miniatura:min-h-0">
      <MenuSuspenso rotulo={rotulo} resumo={ordem} larguraDoPainel={largura}>
        {(fechar) => (
          <ul className="py-1">
            {ORDENS.map((o) => (
              <li key={o}>
                <button
                  type="button"
                  onClick={() => {
                    setOrdem(o);
                    fechar();
                  }}
                  className="flex min-h-11 w-full items-center px-3 text-left text-sm hover:bg-surface"
                >
                  {o}
                </button>
              </li>
            ))}
          </ul>
        )}
      </MenuSuspenso>
    </div>
  );
}

export default defineStories({
  args: { rotulo: "Ordenar por", largura: "w-56" },
  controls: {
    rotulo: { type: "text" },
    largura: { type: "select", label: "larguraDoPainel", options: ["w-48", "w-56", "w-72", "w-96"] },
  },
  render: (a) => <Exemplo rotulo={a.rotulo} largura={a.largura} />,
  stories: [{ name: "Lista de opções" }, { name: "Painel largo", args: { largura: "w-96" } }],
});
