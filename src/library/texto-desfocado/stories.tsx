import { defineStories } from "@/registry/stories";
import { TextoDesfocado } from "./TextoDesfocado";

export default defineStories({
  args: {
    texto: "Componentes que entram em foco.",
    animarPor: "palavras",
    direcao: "cima",
    atraso: 200,
    duracao: 700,
    desfoque: 10,
  },
  controls: {
    texto: { type: "text" },
    animarPor: { type: "select", options: ["palavras", "letras"] },
    direcao: { type: "select", options: ["cima", "baixo"] },
    atraso: { type: "number", label: "atraso (ms)", min: 0, max: 1000, step: 25 },
    duracao: { type: "number", label: "duracao (ms)", min: 100, max: 3000, step: 100 },
    desfoque: { type: "number", label: "desfoque (px)", min: 0, max: 30, step: 1 },
  },
  render: (a) => (
    <TextoDesfocado
      key={JSON.stringify(a)}
      texto={a.texto}
      animarPor={a.animarPor as "palavras" | "letras"}
      direcao={a.direcao as "cima" | "baixo"}
      atraso={a.atraso}
      duracao={a.duracao}
      desfoque={a.desfoque}
    />
  ),
  stories: [
    { name: "Padrão" },
    {
      name: "Letra por letra, de baixo",
      render: () => (
        <TextoDesfocado texto="Nítido." animarPor="letras" direcao="baixo" atraso={60} className="text-6xl font-extrabold text-ink" />
      ),
    },
  ],
});
