import { useState } from "react";
import { defineStories } from "@/registry/stories";
import { CampoDeMoeda } from "./CampoDeMoeda";

function Exemplo({
  rotulo,
  moeda,
  localidade,
  inicial,
  comCalculado,
  ajuda,
}: {
  rotulo: string;
  moeda: string;
  localidade: string;
  inicial: number;
  comCalculado: boolean;
  ajuda: string;
}) {
  const [valor, setValor] = useState<number | null>(inicial > 0 ? inicial : null);
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <CampoDeMoeda
        rotulo={rotulo}
        valor={valor}
        aoMudar={setValor}
        moeda={moeda}
        localidade={localidade}
        valorCalculado={comCalculado ? 39072 : undefined}
        ajuda={ajuda || undefined}
      />
      <p className="text-xs text-muted">
        Valor guardado: <code>{valor === null ? "null" : valor}</code>
      </p>
    </div>
  );
}

/** Dois campos lado a lado, um deles já alterado em relação ao calculado. */
function ExemploDeRevisao() {
  const [frete, setFrete] = useState<number | null>(12500);
  const [instalacao, setInstalacao] = useState<number | null>(26572.4);
  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-rule bg-surface p-4">
        <CampoDeMoeda rotulo="Frete" valor={frete} aoMudar={setFrete} valorCalculado={12500} />
      </div>
      <div className="rounded-xl border border-rule bg-surface p-4">
        <CampoDeMoeda rotulo="Instalação" valor={instalacao} aoMudar={setInstalacao} valorCalculado={24980} />
      </div>
    </div>
  );
}

export default defineStories({
  args: {
    rotulo: "Valor da proposta",
    moeda: "BRL",
    localidade: "pt-BR",
    inicial: 39072,
    comCalculado: true,
    ajuda: "Os dígitos entram pela direita: os dois últimos são os centavos.",
  },
  controls: {
    rotulo: { type: "text" },
    moeda: { type: "select", options: ["BRL", "USD", "EUR", "JPY"] },
    localidade: { type: "select", options: ["pt-BR", "en-US", "de-DE", "ja-JP"] },
    inicial: { type: "number", label: "valor inicial (0 = vazio)", min: 0, step: 100 },
    comCalculado: { type: "boolean", label: "valorCalculado (39.072)" },
    ajuda: { type: "text" },
  },
  render: (a) => <Exemplo key={`${a.inicial}`} {...a} />,
  stories: [
    { name: "Reais" },
    { name: "Alterado: restaurar", args: { inicial: 41500 } },
    { name: "Vazio", args: { inicial: 0, comCalculado: false, rotulo: "Desconto" } },
    { name: "Euro (de-DE)", args: { moeda: "EUR", localidade: "de-DE", comCalculado: false, ajuda: "" } },
    { name: "Revisão de valores", render: () => <ExemploDeRevisao /> },
  ],
});
