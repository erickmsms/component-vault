import { defineStories } from "@/registry/stories";
import { MedidorSolido } from "./MedidorSolido";

const SEMAFORO = [
  { ate: 60, cor: "var(--success)", rotulo: "Saudável" },
  { ate: 85, cor: "var(--warning)", rotulo: "Atenção" },
  { cor: "var(--critical)", rotulo: "Crítico" },
];

export default defineStories({
  args: { valor: 69, min: 0, max: 200, rotulo: "Pedidos hoje", espessura: 0.32, mostrarLimites: true, comFaixas: false },
  controls: {
    valor: { type: "number" },
    min: { type: "number" },
    max: { type: "number" },
    rotulo: { type: "text" },
    espessura: { type: "number", min: 0.1, max: 0.5, step: 0.02 },
    mostrarLimites: { type: "boolean" },
    comFaixas: { type: "boolean", label: "faixas (semáforo, em % do máximo)" },
  },
  render: (a) => (
    <div className="flex w-full justify-center">
      <MedidorSolido
        valor={a.valor as number}
        min={a.min as number}
        max={a.max as number}
        rotulo={a.rotulo as string}
        espessura={a.espessura as number}
        mostrarLimites={a.mostrarLimites as boolean}
        faixas={
          a.comFaixas
            ? SEMAFORO.map((f) => ({ ...f, ate: f.ate === undefined ? undefined : ((a.max as number) * f.ate) / 100 }))
            : undefined
        }
      />
    </div>
  ),
  stories: [
    { name: "Medidor" },
    {
      name: "Faixas de status",
      render: () => (
        <div className="grid w-full max-w-3xl grid-cols-1 gap-8 sm:grid-cols-3">
          {[42, 78, 93].map((v) => (
            <MedidorSolido key={v} valor={v} rotulo="Uso de CPU" formatar={(n) => `${n}%`} faixas={SEMAFORO} />
          ))}
        </div>
      ),
    },
    {
      name: "Espessuras e formatos",
      render: () => (
        <div className="grid w-full max-w-3xl grid-cols-1 gap-8 sm:grid-cols-3">
          <MedidorSolido valor={0.72} max={1} rotulo="Meta do trimestre" espessura={0.14} formatar={(n) => `${Math.round(n * 100)}%`} cor="var(--series-2)" />
          <MedidorSolido
            valor={48500}
            max={80000}
            rotulo="Receita do mês"
            formatar={(n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", notation: "compact" })}
            cor="var(--series-3)"
          />
          <MedidorSolido valor={4.6} max={5} rotulo="Satisfação" espessura={0.5} formatar={(n) => n.toLocaleString("pt-BR")} cor="var(--series-4)" />
        </div>
      ),
    },
  ],
});
