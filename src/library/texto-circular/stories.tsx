import { defineStories } from "@/registry/stories";
import { TextoCircular } from "./TextoCircular";

export default defineStories({
  args: {
    texto: "COMPONENT*VAULT*CÓDIGO*ABERTO*",
    duracao: 20,
    aoPassar: "acelerar",
  },
  controls: {
    texto: { type: "text" },
    duracao: { type: "number", label: "duracao (s por volta)", min: 2, max: 60, step: 1 },
    aoPassar: { type: "select", options: ["desacelerar", "acelerar", "pausar", "enlouquecer", "nada"] },
  },
  render: (a) => <TextoCircular texto={a.texto} duracao={a.duracao} aoPassar={a.aoPassar as "acelerar"} />,
  stories: [
    { name: "Padrão" },
    {
      name: "Selo pequeno que enlouquece",
      render: () => (
        <TextoCircular texto="NOVO • NOVO • NOVO • " aoPassar="enlouquecer" duracao={8} className="text-sm font-bold text-rose-600" />
      ),
    },
  ],
});
