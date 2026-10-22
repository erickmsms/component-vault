import { defineStories } from "@/registry/stories";
import { TextoDeParticulas } from "./TextoDeParticulas";

export default defineStories({
  args: {
    texto: "React Bits",
    entrada: "juntar",
    forma: "circulo",
    destaque: "movimento",
    corDestaque: "#ff5a36",
    tamanhoParticula: 2,
    densidade: 4,
    repulsao: 40,
    raioRepulsao: 120,
    flutuacao: 0.7,
    explodirAoClicar: true,
    gatilho: "montar",
    brilho: true,
    final: "particulas",
  },
  controls: {
    texto: { type: "text" },
    entrada: { type: "select", options: ["juntar", "chuva", "espiral", "varredura"] },
    forma: { type: "select", options: ["circulo", "quadrado", "linha"] },
    destaque: { type: "select", options: ["movimento", "gradiente"] },
    corDestaque: { type: "color" },
    tamanhoParticula: { type: "number", label: "tamanhoParticula (px)", min: 1, max: 6, step: 0.5 },
    densidade: { type: "number", label: "densidade (px entre pontos)", min: 2, max: 10, step: 1 },
    repulsao: { type: "number", label: "repulsao (px)", min: 0, max: 120, step: 5 },
    raioRepulsao: { type: "number", label: "raioRepulsao (px)", min: 20, max: 300, step: 10 },
    flutuacao: { type: "number", label: "flutuacao (px)", min: 0, max: 4, step: 0.1 },
    explodirAoClicar: { type: "boolean" },
    gatilho: { type: "select", options: ["montar", "passar", "clicar"] },
    brilho: { type: "boolean" },
    final: { type: "select", options: ["particulas", "texto"] },
  },
  render: (a) => (
    <div className="h-64 w-full max-w-3xl">
      <TextoDeParticulas
        // Recomeça a entrada quando muda o tipo de entrada
        key={a.entrada}
        texto={a.texto}
        entrada={a.entrada as "juntar"}
        forma={a.forma as "circulo"}
        destaque={a.destaque as "movimento"}
        corDestaque={a.corDestaque}
        tamanhoParticula={a.tamanhoParticula}
        densidade={a.densidade}
        repulsao={a.repulsao}
        raioRepulsao={a.raioRepulsao}
        flutuacao={a.flutuacao}
        explodirAoClicar={a.explodirAoClicar}
        gatilho={a.gatilho as "montar"}
        brilho={a.brilho}
        final={a.final as "particulas"}
      />
    </div>
  ),
  stories: [
    { name: "Padrão" },
    { name: "Chuva", args: { texto: "Chuva", entrada: "chuva", corDestaque: "#38bdf8" } },
    { name: "Espiral em linhas", args: { texto: "Espiral", entrada: "espiral", forma: "linha", corDestaque: "#a78bfa" } },
    { name: "Termina em texto", args: { texto: "Sólido", final: "texto" } },
    { name: "Varredura em gradiente", args: { texto: "Scanner", entrada: "varredura", destaque: "gradiente", forma: "quadrado" } },
  ],
});
