import { defineStories } from "@/registry/stories";
import { Revelar } from "./Revelar";

const ITENS = ["Planejamento", "Execução", "Acompanhamento", "Resultados"];

function Cartao({ titulo }: { titulo: string }) {
  return (
    <div className="rounded-2xl border border-rule bg-surface p-6">
      <p className="font-display text-xl font-bold">{titulo}</p>
      <p className="mt-2 text-sm text-ink-2">Cada cartão aparece quando entra na tela.</p>
    </div>
  );
}

export default defineStories({
  args: { deslocamento: 32, duracao: 800, escalonar: 120 },
  controls: {
    deslocamento: { type: "number", min: 0, max: 120, step: 4 },
    duracao: { type: "number", min: 100, max: 2000, step: 100 },
    escalonar: { type: "number", label: "atraso entre itens (ms)", min: 0, max: 400, step: 20 },
  },
  render: (a) => (
    <div className="w-full max-w-3xl">
      <p className="pb-[60vh] text-center text-sm text-muted">Role para baixo dentro do preview ↓</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {ITENS.map((titulo, i) => (
          <Revelar
            key={`${titulo}-${a.deslocamento}-${a.duracao}-${a.escalonar}`}
            deslocamento={a.deslocamento}
            duracao={a.duracao}
            atraso={i * a.escalonar}
          >
            <Cartao titulo={titulo} />
          </Revelar>
        ))}
      </div>
      <div className="h-[40vh]" />
    </div>
  ),
  stories: [
    {
      name: "Cartões",
      render: () => (
        <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
          {ITENS.map((titulo, i) => (
            <Revelar key={titulo} atraso={i * 120}>
              <Cartao titulo={titulo} />
            </Revelar>
          ))}
        </div>
      ),
    },
    { name: "Ao rolar (playground)" },
  ],
});
