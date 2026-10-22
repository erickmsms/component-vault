import { useState } from "react";
import { defineStories } from "@/registry/stories";
import { ControleDeslizante } from "@/library/controle-deslizante/ControleDeslizante";
import { VistaExplodida, type PecaExplodida } from "./VistaExplodida";

const RODA: PecaExplodida[] = [
  { marcador: "A", nome: "Cubo com eixo", descricao: "Flange que prende na estrutura", forma: "disco", raio: 1, comprimento: 0.45 },
  { marcador: "", nome: "Eixo do cubo", forma: "eixo", raio: 0.24, comprimento: 1.1, presaAnterior: true },
  { marcador: "B", nome: "Arruela", descricao: "Distribui a carga no rolamento", forma: "anel", raio: 0.42, comprimento: 0.12, furo: 0.62 },
  { marcador: "C", nome: "Espaçador", forma: "anel", raio: 0.42, comprimento: 0.12, furo: 0.62 },
  { marcador: "D", nome: "Roda", descricao: "Corpo de borracha com furo para o eixo", forma: "cilindro", raio: 0.82, comprimento: 0.7, furo: 0.32 },
];

const FILTRO: PecaExplodida[] = [
  { marcador: "1", nome: "Tampa", forma: "disco", raio: 0.9, comprimento: 0.25, cor: "var(--series-2)" },
  { marcador: "2", nome: "Vedação", descricao: "Anel de borracha", forma: "anel", raio: 0.8, comprimento: 0.08, furo: 0.8, cor: "var(--series-4)" },
  { marcador: "3", nome: "Elemento filtrante", descricao: "Troque a cada 6 meses", forma: "cilindro", raio: 0.75, comprimento: 1.2, furo: 0.45, cor: "var(--series-3)" },
  { marcador: "4", nome: "Copo", forma: "cilindro", raio: 1, comprimento: 1.4, furo: 0.85, cor: "var(--series-2)" },
];

function ExemploComControle() {
  const [separacao, setSeparacao] = useState(0.5);
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <VistaExplodida pecas={FILTRO} rotulo="Filtro de água desmontado" separacao={separacao} angulo={20} />
      <ControleDeslizante
        rotulo="Separação"
        valor={separacao * 100}
        aoMudar={(v) => setSeparacao((v as number) / 100)}
        formatar={(n) => (n === 0 ? "Montado" : n === 100 ? "Explodido" : `${n}%`)}
      />
    </div>
  );
}

export default defineStories({
  args: { angulo: 28, mostrarLegenda: true, animar: true, separacao: 1 },
  controls: {
    angulo: { type: "number", min: 0, max: 60, step: 2 },
    mostrarLegenda: { type: "boolean" },
    animar: { type: "boolean", label: "animar ao aparecer (ignora separacao)" },
    separacao: { type: "number", min: 0, max: 1, step: 0.05 },
  },
  render: (a) => (
    <VistaExplodida
      pecas={RODA}
      rotulo="Conjunto da roda com eixo, arruela e espaçador"
      angulo={a.angulo as number}
      mostrarLegenda={a.mostrarLegenda as boolean}
      separacao={a.animar ? undefined : (a.separacao as number)}
    />
  ),
  stories: [
    { name: "Roda" },
    { name: "Separação controlada", render: () => <ExemploComControle /> },
  ],
});
