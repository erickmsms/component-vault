import { defineStories } from "@/registry/stories";
import { TituloMascarado } from "./TituloMascarado";

export default defineStories({
  args: {
    texto: "Componentes que ganham vida",
    duracaoDeriva: 12,
    duracao: 0.8,
    atrasoPalavra: 0.12,
  },
  controls: {
    texto: { type: "text" },
    duracaoDeriva: { type: "number", label: "duracaoDeriva (s)", min: 2, max: 30, step: 1 },
    duracao: { type: "number", label: "duracao (s)", min: 0.1, max: 3, step: 0.1 },
    atrasoPalavra: { type: "number", label: "atrasoPalavra (s)", min: 0, max: 1, step: 0.02 },
  },
  render: (a) => (
    <TituloMascarado
      key={`${a.texto}-${a.duracao}-${a.atrasoPalavra}`}
      texto={a.texto}
      duracaoDeriva={a.duracaoDeriva}
      duracao={a.duracao}
      atrasoPalavra={a.atrasoPalavra}
      aoEntrarNaTela={false}
    />
  ),
  stories: [
    { name: "Padrão" },
    {
      name: "Cores quentes",
      render: () => (
        <TituloMascarado
          texto="Pôr do sol em cada letra"
          cores={["#f43f5e", "#fb923c", "#facc15"]}
          className="text-6xl font-black"
          aoEntrarNaTela={false}
        />
      ),
    },
  ],
});
