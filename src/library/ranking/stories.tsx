import { defineStories } from "@/registry/stories";
import { Ranking } from "./Ranking";

const EQUIPES = [
  { id: "norte", nome: "Equipe Norte", complemento: "AM", valor: 91.4, detalhe: "Vendas 95 · Retenção 88 · NPS 90" },
  { id: "sul", nome: "Equipe Sul", complemento: "RS", valor: 84.2, detalhe: "Vendas 80 · Retenção 91 · NPS 82" },
  { id: "leste", nome: "Equipe Leste", complemento: "BA", valor: 72.8, detalhe: "Vendas 70 · Retenção 77 · NPS 71" },
  { id: "oeste", nome: "Equipe Oeste", complemento: "MT", valor: 58.1, detalhe: "Vendas 52 · Retenção 66 · NPS 57" },
  { id: "centro", nome: "Equipe Centro", complemento: "DF", valor: 44.6, detalhe: "Vendas 41 · Retenção 50 · NPS 43" },
];

export default defineStories({
  args: {
    quantidade: 4,
    destacado: "sul",
    rotuloDoDestaque: "sua equipe",
    maximo: 100,
    coresPorItem: true,
    comDetalhe: true,
  },
  controls: {
    quantidade: { type: "number", label: "itens (quantidade)", min: 1, max: 5 },
    destacado: { type: "select", label: "destacados", options: ["nenhum", "norte", "sul", "leste", "oeste", "centro"] },
    rotuloDoDestaque: { type: "text" },
    maximo: { type: "number", min: 50, max: 200, step: 10 },
    coresPorItem: { type: "boolean", label: "cor própria em cada item" },
    comDetalhe: { type: "boolean", label: "detalhe abaixo da barra" },
  },
  render: (a) => (
    <div className="w-full">
      <Ranking
        maximo={a.maximo}
        destacados={a.destacado === "nenhum" ? undefined : [a.destacado]}
        rotuloDoDestaque={a.rotuloDoDestaque}
        itens={EQUIPES.slice(0, a.quantidade).map((e, i) => ({
          ...e,
          cor: a.coresPorItem ? `var(--series-${i + 1})` : undefined,
          detalhe: a.comDetalhe ? e.detalhe : undefined,
        }))}
      />
    </div>
  ),
  stories: [
    { name: "Com destaque" },
    { name: "Uma cor só, sem detalhes", args: { coresPorItem: false, comDetalhe: false, destacado: "nenhum", quantidade: 5 } },
  ],
});
