import { defineStories } from "@/registry/stories";
import { DiagramaAluvial } from "./DiagramaAluvial";

const PLANOS = {
  etapas: ["Janeiro", "Abril", "Julho"],
  fluxos: [
    { caminho: ["Grátis", "Grátis", "Grátis"], valor: 380 },
    { caminho: ["Grátis", "Pro", "Pro"], valor: 140 },
    { caminho: ["Grátis", "Pro", "Cancelou"], valor: 40 },
    { caminho: ["Grátis", "Cancelou", "Cancelou"], valor: 120 },
    { caminho: ["Pro", "Pro", "Pro"], valor: 210 },
    { caminho: ["Pro", "Empresa", "Empresa"], valor: 60 },
    { caminho: ["Pro", "Grátis", "Grátis"], valor: 50 },
    { caminho: ["Pro", "Pro", "Cancelou"], valor: 30 },
    { caminho: ["Empresa", "Empresa", "Empresa"], valor: 90 },
  ],
};

const PESQUISA = {
  etapas: ["Idade", "Canal", "Avaliação"],
  fluxos: [
    { caminho: ["18–29", "App", "Positiva"], valor: 210 },
    { caminho: ["18–29", "App", "Negativa"], valor: 60 },
    { caminho: ["18–29", "Site", "Positiva"], valor: 70 },
    { caminho: ["30–49", "App", "Positiva"], valor: 150 },
    { caminho: ["30–49", "Site", "Positiva"], valor: 180 },
    { caminho: ["30–49", "Site", "Negativa"], valor: 90 },
    { caminho: ["50+", "Site", "Positiva"], valor: 110 },
    { caminho: ["50+", "Loja", "Positiva"], valor: 130 },
    { caminho: ["50+", "Loja", "Negativa"], valor: 40 },
  ],
};

export default defineStories({
  args: { altura: 300, colorirFaixas: false },
  controls: {
    altura: { type: "number", min: 180, max: 600, step: 20 },
    colorirFaixas: { type: "boolean" },
  },
  render: (a) => (
    <div className="w-full max-w-2xl">
      <DiagramaAluvial
        {...PLANOS}
        rotulo="Migração de clientes entre planos"
        formatar={(n) => `${n} clientes`}
        altura={a.altura as number}
        colorirFaixas={a.colorirFaixas as boolean}
        cores={{ Cancelou: "var(--muted)" }}
      />
    </div>
  ),
  stories: [
    { name: "Migração de planos" },
    {
      name: "Faixas coloridas",
      render: () => (
        <div className="w-full max-w-2xl">
          <DiagramaAluvial {...PESQUISA} rotulo="Respostas da pesquisa por idade e canal" altura={320} colorirFaixas />
        </div>
      ),
    },
  ],
});
