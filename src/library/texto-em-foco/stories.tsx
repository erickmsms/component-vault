import { defineStories } from "@/registry/stories";
import { TextoEmFoco, type EstiloDoFoco } from "./TextoEmFoco";

export default defineStories({
  args: {
    frase: "Foco Verdadeiro",
    estilo: "cantos",
    manual: false,
    ordem: "sequencial",
    suavizacao: "suave",
    desfoque: 5,
    escalaDoFoco: 1,
    corDaBorda: "#22c55e",
    corDoBrilho: "#22c55e99",
    duracao: 0.5,
    pausa: 1,
    tamanhoDoCanto: 16,
    larguraDaBorda: 3,
    opacidadeFora: 1,
  },
  controls: {
    frase: { type: "text" },
    estilo: { type: "select", options: ["cantos", "caixa", "sublinhado", "marca-texto"] },
    manual: { type: "boolean", label: "manual (segue o mouse)" },
    ordem: { type: "select", options: ["sequencial", "aleatoria"] },
    suavizacao: { type: "select", options: ["suave", "mola"] },
    desfoque: { type: "number", label: "desfoque (px)", min: 0, max: 15, step: 1 },
    escalaDoFoco: { type: "number", min: 1, max: 1.4, step: 0.05 },
    corDaBorda: { type: "color" },
    corDoBrilho: { type: "color" },
    duracao: { type: "number", label: "duracao (s)", min: 0.1, max: 2, step: 0.1 },
    pausa: { type: "number", label: "pausa (s)", min: 0, max: 3, step: 0.1 },
    tamanhoDoCanto: { type: "number", label: "tamanhoDoCanto (px)", min: 6, max: 32, step: 1 },
    larguraDaBorda: { type: "number", label: "larguraDaBorda (px)", min: 1, max: 8, step: 1 },
    opacidadeFora: { type: "number", min: 0.1, max: 1, step: 0.05 },
  },
  render: (a) => (
    <TextoEmFoco
      frase={a.frase}
      estilo={a.estilo as EstiloDoFoco}
      manual={a.manual}
      ordem={a.ordem as "sequencial" | "aleatoria"}
      suavizacao={a.suavizacao as "suave" | "mola"}
      desfoque={a.desfoque}
      escalaDoFoco={a.escalaDoFoco}
      corDaBorda={a.corDaBorda}
      corDoBrilho={a.corDoBrilho}
      duracao={a.duracao}
      pausa={a.pausa}
      tamanhoDoCanto={a.tamanhoDoCanto}
      larguraDaBorda={a.larguraDaBorda}
      opacidadeFora={a.opacidadeFora}
      className="text-ink"
    />
  ),
  stories: [
    { name: "Padrão" },
    {
      name: "Marca-texto com mola",
      render: () => (
        <TextoEmFoco
          frase="Menos ruído mais sinal"
          estilo="marca-texto"
          suavizacao="mola"
          corDaBorda="#f59e0b"
          desfoque={3}
          opacidadeFora={0.5}
          className="text-ink"
        />
      ),
    },
    {
      name: "Manual, com caixa",
      render: () => (
        <TextoEmFoco frase="Passe o mouse aqui" manual estilo="caixa" corDaBorda="#3b82f6" className="text-ink" />
      ),
    },
    {
      name: "Sublinhado aleatório",
      render: () => (
        <TextoEmFoco frase="Um dois três quatro" estilo="sublinhado" ordem="aleatoria" corDaBorda="#ec4899" className="text-ink" />
      ),
    },
  ],
});
