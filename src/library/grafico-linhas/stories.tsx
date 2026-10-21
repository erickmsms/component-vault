import { defineStories } from "@/registry/stories";
import { GraficoLinhas, type Serie } from "./GraficoLinhas";

// 30 dias de dados de exemplo, determinísticos
const DIAS = Array.from({ length: 30 }, (_, i) => new Date(Date.UTC(2026, 8, 1 + i)).toISOString().slice(0, 10));

const CANAIS = [
  { nome: "Loja online", base: 120, fase: 0 },
  { nome: "Loja física", base: 80, fase: 2 },
  { nome: "Marketplace", base: 50, fase: 4 },
];

function series(quantidade: number, dados: string): Serie[] {
  return CANAIS.slice(0, quantidade).map((c, n) => ({
    nome: c.nome,
    cor: `var(--series-${n + 1})`,
    pontos: DIAS.map((x, i) => {
      const onda = Math.sin(i / 4 + c.fase);
      // "variacao": em torno de zero, para o eixo e o sinal fazerem diferença
      const y = dados === "variacao" ? 12 * onda + ((i * 37) % 7) - 3 : c.base + 18 * onda + ((i * 37) % 13);
      return { x, y: Number(y.toFixed(1)) };
    }),
  }));
}

export default defineStories({
  args: {
    dados: "pedidos",
    series: 3,
    unidade: "pedidos",
    altura: 260,
    incluirZero: true,
    comSinal: false,
    anotacao: true,
  },
  controls: {
    dados: { type: "select", label: "dados de exemplo", options: ["pedidos", "variacao"] },
    series: { type: "number", label: "séries (quantidade)", min: 1, max: 3 },
    unidade: { type: "text" },
    altura: { type: "number", min: 160, max: 480, step: 20 },
    incluirZero: { type: "boolean" },
    comSinal: { type: "boolean" },
    anotacao: { type: "boolean", label: "anotações (exemplo)" },
  },
  render: (a) => {
    const dados = series(a.series, a.dados);
    const ponto = dados[0].pontos[18];
    return (
      <div className="w-full">
        <GraficoLinhas
          rotulo="Pedidos por dia em cada canal"
          series={dados}
          unidade={a.unidade}
          altura={a.altura}
          incluirZero={a.incluirZero}
          comSinal={a.comSinal}
          anotacoes={
            a.anotacao
              ? [{ x: ponto.x, y: ponto.y ?? 0, cor: dados[0].cor, titulo: "Campanha de setembro", texto: "frete grátis por 3 dias" }]
              : []
          }
        />
      </div>
    );
  },
  stories: [
    { name: "Três canais" },
    { name: "Uma série", args: { series: 1, anotacao: false } },
    { name: "Eixo sem o zero", args: { incluirZero: false, anotacao: false } },
    { name: "Variação com sinal", args: { dados: "variacao", unidade: "%", comSinal: true, series: 2, anotacao: false } },
  ],
});
