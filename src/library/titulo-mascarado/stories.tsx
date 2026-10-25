import { defineStories } from "@/registry/stories";
import { TituloMascarado } from "./TituloMascarado";

// Ilustração do próprio site (public/exemplos): os exemplos não buscam imagens de terceiros
const IMAGEM = "/exemplos/paisagem.svg";

export default defineStories({
  args: {
    texto: "Designed in the details",
    src: IMAGEM,
    revelar: "subir",
    gatilho: "tela",
    duracao: 1.1,
    intervalo: 0.09,
    paralaxe: 26,
    deriva: 18,
    zoomAoPassar: 0,
    holofote: false,
    contorno: false,
    pretoEBranco: false,
    tom: "",
  },
  controls: {
    texto: { type: "text" },
    src: { type: "text", label: "src (imagem)" },
    revelar: { type: "select", options: ["subir", "crescer", "desfocar", "varrer", "aparecer", "nenhum"] },
    gatilho: { type: "select", options: ["tela", "montar", "passar"] },
    duracao: { type: "number", label: "duracao (s)", min: 0.2, max: 3, step: 0.1 },
    intervalo: { type: "number", label: "intervalo (s)", min: 0, max: 0.4, step: 0.01 },
    paralaxe: { type: "number", label: "paralaxe (px)", min: 0, max: 80, step: 2 },
    deriva: { type: "number", label: "deriva (px)", min: 0, max: 60, step: 2 },
    zoomAoPassar: { type: "number", min: 0, max: 0.5, step: 0.05 },
    holofote: { type: "boolean" },
    contorno: { type: "boolean" },
    pretoEBranco: { type: "boolean" },
    tom: { type: "color" },
  },
  render: (a) => (
    <div className="w-full max-w-4xl text-ink">
      <TituloMascarado
        key={`${a.revelar}-${a.gatilho}`}
        texto={a.texto}
        src={a.src}
        revelar={a.revelar as "subir"}
        gatilho={a.gatilho as "tela"}
        duracao={a.duracao}
        intervalo={a.intervalo}
        paralaxe={a.paralaxe}
        deriva={a.deriva}
        zoomAoPassar={a.zoomAoPassar}
        holofote={a.holofote}
        contorno={a.contorno}
        pretoEBranco={a.pretoEBranco}
        tom={a.tom}
      />
    </div>
  ),
  stories: [
    { name: "Padrão" },
    { name: "Holofote e contorno", args: { texto: "Follow the light", holofote: true, contorno: true, zoomAoPassar: 0.1 } },
    { name: "Crescendo, em preto e branco", args: { texto: "Every letter counts", revelar: "crescer", pretoEBranco: true } },
    { name: "Desfocando", args: { texto: "Out of focus", revelar: "desfocar" } },
  ],
});
