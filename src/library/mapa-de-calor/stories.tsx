import { defineStories } from "@/registry/stories";
import { MapaDeCalor } from "./MapaDeCalor";

const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const HORAS = Array.from({ length: 24 }, (_, h) => `${h}h`);

/** Acessos de exemplo: pico no horário comercial, pouco no fim de semana. Determinístico. */
function acessos(comVazios: boolean) {
  return DIAS.map((_, d) =>
    HORAS.map((_, h) => {
      if (comVazios && d === 2 && h >= 9 && h <= 11) return null; // sistema fora do ar
      const comercial = h >= 8 && h <= 18 ? 1 : h >= 6 && h <= 22 ? 0.35 : 0.05;
      const almoco = h === 12 || h === 13 ? 0.6 : 1;
      const fimDeSemana = d >= 5 ? 0.25 : 1;
      const ruido = ((d * 31 + h * 17) % 11) / 11;
      return Math.round(60 * comercial * almoco * fimDeSemana * (0.75 + ruido * 0.5));
    }),
  );
}

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const LOJAS = ["Centro", "Shopping Norte", "Aeroporto", "Online"];
const VENDAS = LOJAS.map((_, l) => MESES.map((_, m) => 40 + ((l * 13 + m * 7) % 23) * 3 + (m >= 10 ? 30 : 0) + (l === 3 ? 25 : 0)));

const formatoAcessos = (v: number) => `${v.toLocaleString("pt-BR")} ${v === 1 ? "acesso" : "acessos"}`;

export default defineStories({
  args: { rotuloACada: 3, comVazios: false, legenda: true, cor: "accent" },
  controls: {
    rotuloACada: { type: "number", label: "rotuloDeColunaACada", min: 1, max: 6 },
    comVazios: { type: "boolean", label: "células sem dado (null)" },
    legenda: { type: "boolean" },
    cor: { type: "select", options: ["accent", "series-2", "series-3", "series-4"] },
  },
  render: (a) => (
    <div className="w-full max-w-4xl">
      <MapaDeCalor
        linhas={DIAS}
        colunas={HORAS}
        valores={acessos(a.comVazios)}
        rotuloAcessivel="Acessos por dia da semana e hora"
        formatarValor={formatoAcessos}
        rotuloDeColunaACada={a.rotuloACada}
        legenda={a.legenda}
        cor={`var(--${a.cor})`}
      />
    </div>
  ),
  stories: [
    { name: "Dia × hora" },
    { name: "Com células sem dado", args: { comVazios: true } },
    {
      name: "Lojas × meses",
      render: () => (
        <div className="w-full max-w-3xl">
          <MapaDeCalor
            linhas={LOJAS}
            colunas={MESES}
            valores={VENDAS}
            rotuloAcessivel="Vendas por loja e mês, em milhares de reais"
            formatarValor={(v) => `R$ ${v} mil`}
            cor="var(--series-2)"
            minimo={30}
          />
        </div>
      ),
    },
  ],
});
