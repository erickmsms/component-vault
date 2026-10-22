import { defineStories } from "@/registry/stories";
import { TextoDistorcido } from "./TextoDistorcido";

export default defineStories({
  args: {
    texto: "Bend the moment",
    lente: "bulge",
    forcaDistorcao: 0.08,
    escalaDistorcao: 1.7,
    velocidade: 0.55,
    alcancePonteiro: 0.42,
    forcaPonteiro: 0.38,
    refracao: 0.018,
    cromatica: 0,
    ondulacao: true,
    ondaAoClicar: true,
    derivaParada: 0.2,
  },
  controls: {
    texto: { type: "text" },
    lente: { type: "select", options: ["bulge", "pinch", "swirl"] },
    forcaDistorcao: { type: "number", min: 0, max: 1, step: 0.01 },
    escalaDistorcao: { type: "number", min: 0.1, max: 5, step: 0.1 },
    velocidade: { type: "number", min: 0, max: 3, step: 0.05 },
    alcancePonteiro: { type: "number", min: 0.05, max: 1.5, step: 0.01 },
    forcaPonteiro: { type: "number", min: 0, max: 2, step: 0.01 },
    refracao: { type: "number", min: 0, max: 0.2, step: 0.002 },
    cromatica: { type: "number", min: 0, max: 1, step: 0.05 },
    ondulacao: { type: "boolean" },
    ondaAoClicar: { type: "boolean" },
    derivaParada: { type: "number", min: 0, max: 1, step: 0.05 },
  },
  render: (a) => (
    <div className="w-full max-w-4xl">
      <TextoDistorcido
        texto={a.texto}
        lente={a.lente as "bulge"}
        forcaDistorcao={a.forcaDistorcao}
        escalaDistorcao={a.escalaDistorcao}
        velocidade={a.velocidade}
        alcancePonteiro={a.alcancePonteiro}
        forcaPonteiro={a.forcaPonteiro}
        refracao={a.refracao}
        cromatica={a.cromatica}
        ondulacao={a.ondulacao}
        ondaAoClicar={a.ondaAoClicar}
        derivaParada={a.derivaParada}
      />
    </div>
  ),
  stories: [
    { name: "Padrão" },
    { name: "Redemoinho", args: { texto: "Swirl", lente: "swirl", forcaPonteiro: 0.8 } },
    { name: "Refração colorida", args: { texto: "Refract", refracao: 0.08, cromatica: 0.8, derivaParada: 0.6 } },
  ],
});
