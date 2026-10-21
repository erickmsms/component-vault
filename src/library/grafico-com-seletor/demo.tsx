import type { Serie } from "@/library/grafico-linhas/GraficoLinhas";
import { ListaDeIndicadores } from "@/library/lista-de-indicadores/ListaDeIndicadores";
import { GraficoComSeletor, type OpcaoDoGrafico } from "./GraficoComSeletor";

// 30 dias de dados de exemplo, determinísticos
const DIAS = Array.from({ length: 30 }, (_, i) => new Date(Date.UTC(2026, 8, 1 + i)).toISOString().slice(0, 10));

const CANAIS = [
  { nome: "Loja online", cor: "var(--series-1)", peso: 1.4 },
  { nome: "Loja física", cor: "var(--series-2)", peso: 1 },
];

function series(base: number, amplitude: number, casas = 0): Serie[] {
  return CANAIS.map((c, n) => ({
    nome: c.nome,
    cor: c.cor,
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

export default function GraficoComSeletorDemo() {
  return (
    <div className="w-full">
      <GraficoComSeletor
        titulo="Desempenho diário"
        opcoes={OPCOES}
        altura={360}
        lateral={
          <ListaDeIndicadores
            titulo="Resumo do mês"
            itens={[
              { rotulo: "Pedidos", valor: "5.912", descricao: "8% acima de agosto" },
              { rotulo: "Ticket médio", valor: "R$ 182", descricao: "estável" },
              { rotulo: "Dias acima da meta", valor: "19 de 30", descricao: "melhor mês do ano" },
            ]}
          />
        }
      />
    </div>
  );
}
