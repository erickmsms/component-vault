import { defineStories } from "@/registry/stories";
import { Superficie3D } from "./Superficie3D";

/** Uma "onda" com um pico e um vale, como a do exemplo de stream graph em 3D. */
function onda(linhas: number, colunas: number) {
  return Array.from({ length: linhas }, (_, i) =>
    Array.from({ length: colunas }, (_, j) => {
      const x = (j / (colunas - 1)) * 2 - 1;
      const y = (i / (linhas - 1)) * 2 - 1;
      return Math.round(260 + 280 * Math.exp(-((x - 0.25) ** 2 + (y + 0.1) ** 2) * 4) - 160 * Math.exp(-((x + 0.45) ** 2 + (y - 0.5) ** 2) * 6));
    }),
  );
}

const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const HORAS = Array.from({ length: 12 }, (_, k) => `${8 + k}h`);
/** Pedidos por hora e dia: pico no almoço e no fim do dia, mais forte na sexta e no sábado. */
const PEDIDOS = DIAS.map((_, d) =>
  HORAS.map((_, h) => {
    const fim = d >= 4 ? 1.4 : 1;
    return Math.round((30 + 90 * Math.exp(-((h - 4) ** 2) / 3) + 120 * Math.exp(-((h - 10) ** 2) / 2.5)) * fim);
  }),
);

export default defineStories({
  args: { giro: -35, inclinacao: 28, mostrarEixos: true, resolucao: 12 },
  controls: {
    giro: { type: "number", min: -180, max: 180, step: 5 },
    inclinacao: { type: "number", min: 8, max: 70, step: 2 },
    mostrarEixos: { type: "boolean" },
    resolucao: { type: "number", min: 4, max: 30 },
  },
  render: (a) => (
    <Superficie3D
      key={`${a.giro}-${a.inclinacao}`}
      valores={onda(a.resolucao as number, a.resolucao as number)}
      rotulo="Superfície de exemplo com um pico e um vale"
      giro={a.giro as number}
      inclinacao={a.inclinacao as number}
      mostrarEixos={a.mostrarEixos as boolean}
    />
  ),
  stories: [
    { name: "Superfície" },
    {
      name: "Pedidos por hora e dia",
      render: () => (
        <Superficie3D
          valores={PEDIDOS}
          rotulo="Pedidos por hora do dia e dia da semana"
          rotulosX={HORAS}
          rotulosY={DIAS}
          nomeX="Hora"
          nomeY="Dia"
          nomeZ="Pedidos"
          cor="var(--series-2)"
          giro={-50}
          inclinacao={32}
        />
      ),
    },
  ],
});
