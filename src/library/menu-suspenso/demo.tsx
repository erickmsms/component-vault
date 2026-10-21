import { useState } from "react";
import { MenuSuspenso } from "./MenuSuspenso";

const ORDENS = ["Mais recentes", "Mais vendidos", "Menor preço", "Maior preço"];

export default function MenuSuspensoDemo() {
  const [ordem, setOrdem] = useState(ORDENS[0]);

  return (
    <div className="flex min-h-64 items-start justify-center">
      <MenuSuspenso rotulo="Ordenar por" resumo={ordem} larguraDoPainel="w-56">
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
