import type { Serie } from "@/library/grafico-linhas/GraficoLinhas";
import { defineStories } from "@/registry/stories";
import { GraficoComSeletor, type OpcaoDoGrafico } from "./GraficoComSeletor";

// 30 dias de dados de exemplo, determinísticos
const DIAS = Array.from({ length: 30 }, (_, i) => new Date(Date.UTC(2026, 8, 1 + i)).toISOString().slice(0, 10));

const CANAIS = [
  { nome: "Loja online", peso: 1.4 },
  { nome: "Loja física", peso: 1 },
];

function series(base: number, amplitude: number, casas = 0): Serie[] {
  return CANAIS.map((c, n) => ({
    nome: c.nome,
    cor: `var(--series-${n + 1})`,
    pontos: DIAS.map((x, i) => ({
      x,
      y: Number((c.peso * (base + amplitude * Math.sin(i / 4 + n * 2)) + ((i * 37) % 7)).toFixed(casas)),
    })),
  }));
}

const OPCOES: OpcaoDoGrafico[] = [
  { chave: "pedidos", rotulo: "Pedidos", series: series(90, 20), unidade: "pedidos", incluirZero: false },
  {
    chave: "ticket",
    rotulo: "Ticket médio",
    series: series(160, 25, 2),
    formatarValor: (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    incluirZero: false,
    dica: "Receita dividida pelo número de pedidos do dia.",
  },
  {
    chave: "variacao",
    rotulo: "Variação vs. meta",
    series: series(0, 12, 1),
    unidade: "%",
    comSinal: true,
    dica: "Quanto cada dia ficou acima (+) ou abaixo (−) da meta diária.",
  },
];

const RESUMO = [
  { rotulo: "Pedidos", valor: "5.912", descricao: "8% acima de agosto" },
  { rotulo: "Ticket médio", valor: "R$ 182", descricao: "estável" },
  { rotulo: "Dias acima da meta", valor: "19 de 30", descricao: "melhor mês do ano" },
];

/** Coluna de números ao lado do gráfico, só para o exemplo. */
function Resumo() {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-base font-semibold">Resumo do mês</h3>
      <ul className="divide-y divide-rule">
        {RESUMO.map((item) => (
          <li key={item.rotulo} className="py-3 first:pt-0">
            <p className="text-xs font-medium text-muted">{item.rotulo}</p>
            <p className="font-display text-3xl font-semibold tabular-nums">{item.valor}</p>
            <p className="text-sm text-ink-2">{item.descricao}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default defineStories({
  args: { titulo: "Desempenho diário", rotuloDoSeletor: "Mostrar", altura: 360, lateral: true, opcoes: 3 },
  controls: {
    titulo: { type: "text" },
    rotuloDoSeletor: { type: "text" },
    altura: { type: "number", min: 200, max: 480, step: 20 },
    lateral: { type: "boolean", label: "lateral (resumo ao lado)" },
    opcoes: { type: "number", label: "opções no seletor", min: 1, max: 3 },
  },
  render: (a) => (
    <div className="w-full">
      <GraficoComSeletor
        key={a.opcoes}
        titulo={a.titulo}
        rotuloDoSeletor={a.rotuloDoSeletor}
        altura={a.altura}
        opcoes={OPCOES.slice(0, a.opcoes)}
        lateral={
          a.lateral ? (
            <Resumo />
          ) : undefined
        }
      />
    </div>
  ),
  stories: [
    { name: "Com indicadores ao lado" },
    { name: "Só o gráfico", args: { lateral: false, altura: 300 } },
    { name: "Uma opção (sem seletor)", args: { opcoes: 1, lateral: false } },
  ],
});
