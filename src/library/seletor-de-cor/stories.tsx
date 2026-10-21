import { useState } from "react";
import { defineStories } from "@/registry/stories";
import { SeletorDeCor } from "./SeletorDeCor";

// Hex aqui é dado de exemplo: as cores que a pessoa escolhe (o componente em si só usa tokens)
const PALETA = [
  "#2563eb",
  "#0ea5e9",
  "#14b8a6",
  "#22c55e",
  "#eab308",
  "#f97316",
  "#ef4444",
  "#ec4899",
  "#a855f7",
  "#64748b",
];

const NOMES: Record<string, string> = {
  "#2563eb": "Azul",
  "#0ea5e9": "Céu",
  "#14b8a6": "Turquesa",
  "#22c55e": "Verde",
  "#eab308": "Amarelo",
  "#f97316": "Laranja",
  "#ef4444": "Vermelho",
  "#ec4899": "Rosa",
  "#a855f7": "Roxo",
  "#64748b": "Ardósia",
};

const nomeDaCor = (cor: string) => NOMES[cor] ?? cor;

type Formato = "redondo" | "quadrado";
type Tamanho = "sm" | "md" | "lg";

function Exemplo({
  formato,
  tamanho,
  comPersonalizada,
  compacto,
  inicial = PALETA[0],
}: {
  formato: Formato;
  tamanho: Tamanho;
  comPersonalizada: boolean;
  compacto: boolean;
  inicial?: string;
}) {
  const [cor, setCor] = useState(inicial);
  return (
    <div className={`flex w-full max-w-md flex-col gap-4 ${compacto ? "min-h-64" : ""}`}>
      <div className="flex items-center gap-3">
        <SeletorDeCor
          cores={PALETA}
          valor={cor}
          aoMudar={setCor}
          rotulo="Cor da etiqueta"
          formato={formato}
          tamanho={tamanho}
          comPersonalizada={comPersonalizada}
          compacto={compacto}
          nomeDaCor={nomeDaCor}
        />
        {compacto && <span className="text-sm text-ink-2">Cor da etiqueta</span>}
      </div>
      <p className="flex items-center gap-2 text-sm text-muted">
        <span aria-hidden="true" className="size-3 rounded-full" style={{ background: cor }} />
        {NOMES[cor] ?? "Personalizada"} <code className="text-xs">{cor}</code>
      </p>
    </div>
  );
}

/** Lista de etiquetas com uma bolinha de cor em cada linha (o modo compacto do original). */
function ExemploEmLista() {
  const [cores, setCores] = useState({ Urgente: "#ef4444", Financeiro: "#22c55e", Marketing: "#a855f7" });
  return (
    // min-h: espaço para o balão abrir embaixo do último item
    <div className="min-h-72 w-full max-w-xs">
      <ul className="flex flex-col divide-y divide-rule rounded-xl border border-rule">
        {Object.entries(cores).map(([nome, cor]) => (
          <li key={nome} className="flex items-center gap-3 px-4 py-3 text-sm">
            <SeletorDeCor
              compacto
              tamanho="sm"
              cores={PALETA}
              valor={cor}
              aoMudar={(nova) => setCores((atual) => ({ ...atual, [nome]: nova }))}
              rotulo={`Cor de ${nome}`}
              nomeDaCor={nomeDaCor}
            />
            {nome}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default defineStories({
  args: { formato: "redondo", tamanho: "md", comPersonalizada: true, compacto: false },
  controls: {
    formato: { type: "select", options: ["redondo", "quadrado"] },
    tamanho: { type: "select", options: ["sm", "md", "lg"] },
    comPersonalizada: { type: "boolean", label: "botão de cor personalizada" },
    compacto: { type: "boolean", label: "compacto (abre num balão)" },
  },
  render: (a) => (
    <Exemplo
      formato={a.formato as Formato}
      tamanho={a.tamanho as Tamanho}
      comPersonalizada={a.comPersonalizada}
      compacto={a.compacto}
    />
  ),
  stories: [
    { name: "Paleta" },
    { name: "Quadrado", args: { formato: "quadrado", tamanho: "lg" } },
    {
      name: "Cor personalizada",
      render: () => <Exemplo formato="redondo" tamanho="md" comPersonalizada compacto={false} inicial="#0f766e" />,
    },
    { name: "Compacto", args: { compacto: true } },
    { name: "Compacto numa lista", render: () => <ExemploEmLista /> },
  ],
});
