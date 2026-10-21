import { useState } from "react";
import { defineStories } from "@/registry/stories";
import { CampoDeEtiquetas } from "./CampoDeEtiquetas";

const SUGESTOES = ["Atacado", "Varejo", "Assinatura", "Marketplace", "Revenda", "Exportação"];

function Exemplo({
  rotulo,
  maximo,
  comSugestoes,
  pontoEVirgula,
  ajuda,
  inicial = ["Varejo", "Assinatura"],
}: {
  rotulo: string;
  maximo: number;
  comSugestoes: boolean;
  pontoEVirgula: boolean;
  ajuda: string;
  inicial?: string[];
}) {
  const [etiquetas, setEtiquetas] = useState(inicial);
  return (
    <div className="w-full max-w-lg">
      <CampoDeEtiquetas
        rotulo={rotulo}
        valor={etiquetas}
        aoMudar={setEtiquetas}
        maximo={maximo > 0 ? maximo : undefined}
        sugestoes={comSugestoes ? SUGESTOES : undefined}
        separadores={pontoEVirgula ? [",", ";"] : [","]}
        ajuda={ajuda || undefined}
      />
    </div>
  );
}

export default defineStories({
  args: {
    rotulo: "Canais de venda",
    maximo: 0,
    comSugestoes: true,
    pontoEVirgula: false,
    ajuda: "Separe por vírgula ou tecle Enter. Cole uma lista para criar várias.",
  },
  controls: {
    rotulo: { type: "text" },
    maximo: { type: "number", label: "maximo (0 = sem limite)", min: 0, max: 10 },
    comSugestoes: { type: "boolean", label: "sugestões (datalist)" },
    pontoEVirgula: { type: "boolean", label: "“;” também separa" },
    ajuda: { type: "text" },
  },
  render: (a) => <Exemplo {...a} />,
  stories: [
    { name: "Etiquetas" },
    { name: "Com limite", args: { rotulo: "Palavras-chave", maximo: 3, comSugestoes: false, ajuda: "" } },
    {
      name: "Vazio, separando por “;”",
      render: () => (
        <Exemplo
          rotulo="Cenários da proposta"
          maximo={0}
          comSugestoes={false}
          pontoEVirgula
          ajuda="Ex.: Base; Otimista; Pessimista"
          inicial={[]}
        />
      ),
    },
  ],
});
