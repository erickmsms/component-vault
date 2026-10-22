import { defineStories } from "@/registry/stories";
import { TextoTech } from "./TextoTech";

type Revelar = "letra" | "area";
type Entrada = "nenhuma" | "digitar" | "montar" | "metricas";

const CAIXA = "h-64 w-[640px] max-w-full text-ink";

export default defineStories({
  args: {
    texto: "React Bits",
    peso: 600,
    revelar: "letra",
    entrada: "nenhuma",
    tracejado: true,
    traco: 4,
    intervalo: 2,
    espessura: 1.5,
    particulas: 15,
    selecao: true,
    rotulos: true,
    guias: false,
    arrastavel: true,
    elasticidade: 0.4,
    passeio: true,
  },
  controls: {
    texto: { type: "text" },
    peso: { type: "number", min: 100, max: 900, step: 100 },
    revelar: { type: "select", options: ["letra", "area"] },
    entrada: { type: "select", options: ["nenhuma", "digitar", "montar", "metricas"] },
    tracejado: { type: "boolean" },
    traco: { type: "number", label: "traco (px)", min: 1, max: 20, step: 1 },
    intervalo: { type: "number", label: "intervalo (px)", min: 1, max: 20, step: 1 },
    espessura: { type: "number", label: "espessura (px)", min: 0.5, max: 4, step: 0.5 },
    particulas: { type: "number", min: 0, max: 40, step: 1 },
    selecao: { type: "boolean" },
    rotulos: { type: "boolean" },
    guias: { type: "boolean" },
    arrastavel: { type: "boolean" },
    elasticidade: { type: "number", min: 0, max: 1, step: 0.05 },
    passeio: { type: "boolean", label: "passeio (sem o mouse)" },
  },
  render: (a) => (
    // A chave reinicia a entrada quando ela muda no playground
    <TextoTech
      key={a.entrada}
      texto={a.texto}
      peso={a.peso}
      revelar={a.revelar as Revelar}
      entrada={a.entrada as Entrada}
      tracejado={a.tracejado}
      traco={a.traco}
      intervalo={a.intervalo}
      espessura={a.espessura}
      particulas={a.particulas}
      selecao={a.selecao}
      rotulos={a.rotulos}
      guias={a.guias}
      arrastavel={a.arrastavel}
      elasticidade={a.elasticidade}
      passeio={a.passeio}
      className={CAIXA}
    />
  ),
  stories: [
    { name: "Padrão" },
    {
      name: "Lente e guias de métrica",
      render: () => <TextoTech texto="Tipografia" revelar="area" guias corDestaque="#2563eb" className={CAIXA} />,
    },
    {
      name: "Entrada montando em blocos",
      render: () => <TextoTech texto="VAULT" peso={800} entrada="montar" duracaoEntrada={2.5} className={CAIXA} />,
    },
  ],
});
