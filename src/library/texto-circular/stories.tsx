import { defineStories } from "@/registry/stories";
import { TextoCircular } from "./TextoCircular";

type AoPassar = "desacelerar" | "acelerar" | "pausar" | "enlouquecer" | "nada";

export default defineStories({
  args: {
    texto: "COMPONENT*VAULT*CÓDIGO*ABERTO*",
    duracao: 20,
    aoPassar: "acelerar",
    sentido: "horario",
    tamanho: 200,
    tamanhoFonte: 24,
    preencher: true,
    repeticoes: 1,
    anel: false,
    inclinacao: 0,
    inclinacaoAoPassar: 0,
    arrastavel: false,
  },
  controls: {
    texto: { type: "text" },
    duracao: { type: "number", label: "duracao (s por volta)", min: 0, max: 60, step: 1 },
    aoPassar: { type: "select", options: ["desacelerar", "acelerar", "pausar", "enlouquecer", "nada"] },
    sentido: { type: "select", options: ["horario", "anti-horario"] },
    tamanho: { type: "number", label: "tamanho (px)", min: 100, max: 400, step: 10 },
    tamanhoFonte: { type: "number", label: "tamanhoFonte (px)", min: 8, max: 48, step: 1 },
    preencher: { type: "boolean", label: "preencher (volta inteira)" },
    repeticoes: { type: "number", min: 1, max: 4, step: 1 },
    anel: { type: "boolean" },
    inclinacao: { type: "number", label: "inclinacao (graus)", min: 0, max: 70, step: 5 },
    inclinacaoAoPassar: { type: "number", label: "inclinacaoAoPassar (graus)", min: 0, max: 40, step: 5 },
    arrastavel: { type: "boolean" },
  },
  render: (a) => (
    <TextoCircular
      texto={a.texto}
      duracao={a.duracao}
      aoPassar={a.aoPassar as AoPassar}
      sentido={a.sentido as "horario" | "anti-horario"}
      tamanho={a.tamanho}
      tamanhoFonte={a.tamanhoFonte}
      preencher={a.preencher}
      repeticoes={a.repeticoes}
      anel={a.anel}
      inclinacao={a.inclinacao}
      inclinacaoAoPassar={a.inclinacaoAoPassar}
      arrastavel={a.arrastavel}
    />
  ),
  stories: [
    { name: "Padrão" },
    {
      name: "Selo com seta no centro, arrastável",
      render: () => (
        <TextoCircular
          texto="ROLE PARA BAIXO • "
          repeticoes={2}
          tamanho={160}
          tamanhoFonte={16}
          anel
          arrastavel
          inclinacaoAoPassar={20}
          className="text-ink"
        >
          <span className="text-3xl">↓</span>
        </TextoCircular>
      ),
    },
    {
      name: "Que enlouquece",
      render: () => (
        <TextoCircular texto="NOVO • NOVO • NOVO • " aoPassar="enlouquecer" duracao={8} className="text-rose-600" />
      ),
    },
  ],
});
