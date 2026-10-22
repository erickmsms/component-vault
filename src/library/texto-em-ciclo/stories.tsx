import { defineStories } from "@/registry/stories";
import { TextoEmCiclo } from "./TextoEmCiclo";

export default defineStories({
  args: {
    texto: "React ✦ Bits",
    forma: "onda",
    velocidade: 90,
    direcao: "frente",
    curvatura: 90,
    inclinacao: 0,
    fita: true,
    corFita: "#5227FF",
    larguraFita: 86,
    esmaecerBordas: 0,
    maiusculas: true,
    pausarAoPassar: true,
    cruzar: false,
    arrastavel: false,
    impulsoDaRolagem: 0,
    contorno: false,
  },
  controls: {
    texto: { type: "text" },
    forma: { type: "select", options: ["onda", "circulo", "infinito", "arco", "reta"] },
    velocidade: { type: "number", min: 0, max: 400, step: 10 },
    direcao: { type: "select", options: ["frente", "tras"] },
    curvatura: { type: "number", min: 0, max: 200, step: 5 },
    inclinacao: { type: "number", label: "inclinacao (graus)", min: -90, max: 90, step: 1 },
    fita: { type: "boolean" },
    corFita: { type: "color" },
    larguraFita: { type: "number", min: 20, max: 200, step: 2 },
    esmaecerBordas: { type: "number", min: 0, max: 1, step: 0.05 },
    maiusculas: { type: "boolean" },
    pausarAoPassar: { type: "boolean" },
    cruzar: { type: "boolean", label: "cruzar (segunda fita)" },
    arrastavel: { type: "boolean" },
    impulsoDaRolagem: { type: "number", min: 0, max: 3, step: 0.1 },
    contorno: { type: "boolean" },
  },
  render: (a) => (
    <div className="w-full max-w-4xl">
      <TextoEmCiclo
        texto={a.texto}
        forma={a.forma as "onda"}
        velocidade={a.velocidade}
        direcao={a.direcao as "frente"}
        curvatura={a.curvatura}
        inclinacao={a.inclinacao}
        fita={a.fita}
        corFita={a.corFita}
        larguraFita={a.larguraFita}
        esmaecerBordas={a.esmaecerBordas}
        maiusculas={a.maiusculas}
        pausarAoPassar={a.pausarAoPassar}
        cruzar={a.cruzar}
        arrastavel={a.arrastavel}
        impulsoDaRolagem={a.impulsoDaRolagem}
        contorno={a.contorno}
      />
    </div>
  ),
  stories: [
    { name: "Padrão" },
    { name: "Círculo", args: { texto: "Component Vault", forma: "circulo", velocidade: 70, arrastavel: true } },
    { name: "Infinito", args: { texto: "Sem fim", forma: "infinito", corFita: "#e11d48", velocidade: 110 } },
    {
      name: "Duas fitas cruzadas",
      args: { texto: "Código aberto", cruzar: true, inclinacao: -4, arrastavel: true, velocidade: 100 },
    },
    {
      name: "Só contorno, bordas esmaecidas",
      args: { texto: "Sem fita", fita: false, contorno: true, forma: "reta", esmaecerBordas: 0.8, impulsoDaRolagem: 1 },
    },
  ],
});
