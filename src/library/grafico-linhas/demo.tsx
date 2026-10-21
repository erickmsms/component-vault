import { GraficoLinhas, type Serie } from "./GraficoLinhas";

// 30 dias de dados de exemplo, determinísticos
const DIAS = Array.from({ length: 30 }, (_, i) => new Date(Date.UTC(2026, 8, 1 + i)).toISOString().slice(0, 10));

function serie(nome: string, cor: string, base: number, fase: number): Serie {
  return {
    nome,
    cor,
    pontos: DIAS.map((x, i) => ({ x, y: Math.round(base + 18 * Math.sin(i / 4 + fase) + ((i * 37) % 13)) })),
  };
}

const SERIES = [
  serie("Loja online", "var(--series-1)", 120, 0),
  serie("Loja física", "var(--series-2)", 80, 2),
  serie("Marketplace", "var(--series-3)", 50, 4),
];

export default function GraficoLinhasDemo() {
  return (
    <div className="w-full">
      <GraficoLinhas
        rotulo="Pedidos por dia em cada canal"
        unidade="pedidos"
        series={SERIES}
        anotacoes={[
          {
            x: "2026-09-19",
            y: SERIES[0].pontos[18].y ?? 0,
            cor: "var(--series-1)",
            titulo: "Campanha de setembro",
            texto: "frete grátis por 3 dias",
          },
        ]}
      />
    </div>
  );
}
