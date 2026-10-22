import { defineStories } from "@/registry/stories";
import { TituloVivo } from "./TituloVivo";

export default defineStories({
  args: {
    texto: "Componentes / prontos. / Código aberto.",
    pesoBase: 800,
    pesoPerto: 450,
    alcance: 320,
  },
  controls: {
    texto: { type: "text", label: "texto (linhas separadas por /)" },
    pesoBase: { type: "number", min: 100, max: 900, step: 50 },
    pesoPerto: { type: "number", min: 100, max: 900, step: 50 },
    alcance: { type: "number", label: "alcance (px)", min: 40, max: 800, step: 20 },
  },
  render: (a) => (
    <TituloVivo
      linhas={a.texto.split("/").map((l: string) => l.trim())}
      pesoBase={a.pesoBase}
      pesoPerto={a.pesoPerto}
      alcance={a.alcance}
    />
  ),
  stories: [
    { name: "Padrão" },
    {
      name: "Leve que engorda",
      render: () => (
        <TituloVivo
          linhas={["Passe o mouse", "por aqui."]}
          pesoBase={300}
          pesoPerto={900}
          alcance={200}
          className="text-6xl leading-none tracking-tight text-ink"
        />
      ),
    },
  ],
});
