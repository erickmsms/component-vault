import { defineStories } from "@/registry/stories";
import { TextoDesfocado } from "./TextoDesfocado";

export default defineStories({
  args: {
    texto: "Componentes que entram em foco.",
    animarPor: "palavras",
    efeito: "desfoque",
    direcao: "cima",
    escalonarDe: "inicio",
    gatilho: "vista",
    atraso: 200,
    duracaoPasso: 0.35,
    desfoque: 10,
    distancia: 50,
    repetir: false,
    pausaRepeticao: 2,
    focarAoPassar: false,
  },
  controls: {
    texto: { type: "text" },
    animarPor: { type: "select", options: ["palavras", "letras"] },
    efeito: { type: "select", options: ["desfoque", "zoom", "inclinar", "foco", "deriva"] },
    direcao: { type: "select", options: ["cima", "baixo", "esquerda", "direita"] },
    escalonarDe: { type: "select", options: ["inicio", "fim", "centro", "aleatorio"] },
    gatilho: { type: "select", options: ["vista", "carregar", "passar", "clique"] },
    atraso: { type: "number", label: "atraso (ms)", min: 0, max: 1000, step: 25 },
    duracaoPasso: { type: "number", label: "duracaoPasso (s)", min: 0.1, max: 2, step: 0.05 },
    desfoque: { type: "number", label: "desfoque (px)", min: 0, max: 30, step: 1 },
    distancia: { type: "number", label: "distancia (px)", min: 0, max: 150, step: 5 },
    repetir: { type: "boolean" },
    pausaRepeticao: { type: "number", label: "pausaRepeticao (s)", min: 0, max: 6, step: 0.5 },
    focarAoPassar: { type: "boolean" },
  },
  render: (a) => (
    <TextoDesfocado
      key={JSON.stringify(a)}
      texto={a.texto}
      animarPor={a.animarPor as "palavras"}
      efeito={a.efeito as "desfoque"}
      direcao={a.direcao as "cima"}
      escalonarDe={a.escalonarDe as "inicio"}
      gatilho={a.gatilho as "vista"}
      atraso={a.atraso}
      duracaoPasso={a.duracaoPasso}
      desfoque={a.desfoque}
      distancia={a.distancia}
      repetir={a.repetir}
      pausaRepeticao={a.pausaRepeticao}
      focarAoPassar={a.focarAoPassar}
    />
  ),
  stories: [
    { name: "Padrão" },
    { name: "Zoom, do centro", args: { texto: "Zoom que abre do meio", efeito: "zoom", escalonarDe: "centro", repetir: true } },
    { name: "Inclinar, letra por letra", args: { texto: "Inclinado.", efeito: "inclinar", animarPor: "letras", atraso: 60, direcao: "baixo" } },
    { name: "Deriva", args: { texto: "Palavras à deriva", efeito: "deriva", direcao: "direita", repetir: true } },
    { name: "Foco ao passar o mouse", args: { texto: "Passe o mouse em cada palavra", focarAoPassar: true } },
    { name: "Toca ao clicar", args: { texto: "Clique para repetir", gatilho: "clique", efeito: "foco" } },
  ],
});
