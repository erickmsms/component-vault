import { TabelaDados, type Coluna } from "./TabelaDados";

type Produto = { nome: string; pedidos: number; receita: number; peso: number; margem: number };

const PRODUTOS: Produto[] = [
  { nome: "Café especial 250 g", pedidos: 1284, receita: 48210.5, peso: 0.25, margem: 38.4 },
  { nome: "Moedor manual", pedidos: 312, receita: 40560, peso: 0.68, margem: 27.9 },
  { nome: "Prensa francesa", pedidos: 498, receita: 34362, peso: 0.9, margem: 31.2 },
  { nome: "Filtro de papel (100 un.)", pedidos: 2051, receita: 18459, peso: 0.12, margem: 52.6 },
];

const COLUNAS: Coluna<Produto>[] = [
  { chave: "nome", titulo: "Produto" },
  { chave: "pedidos", titulo: "Pedidos", tipo: "numero" },
  {
    chave: "receita",
    titulo: "Receita",
    tipo: "decimal",
    formatar: (p) => p.receita.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
  },
  { chave: "peso", titulo: "Peso", tipo: "decimal", sufixo: "kg" },
  { chave: "margem", titulo: "Margem", tipo: "percentual", dica: "Receita menos custo, sobre a receita." },
];

export default function TabelaDadosDemo() {
  return (
    <div className="w-full">
      <TabelaDados colunas={COLUNAS} linhas={PRODUTOS} legenda="Vendas por produto" />
    </div>
  );
}
