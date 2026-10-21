import { defineStories } from "@/registry/stories";
import { TabelaDados, type Coluna } from "./TabelaDados";

type Produto = { nome: string; pedidos: number; receita: number; peso: number; margem: number | null };

const PRODUTOS: Produto[] = [
  { nome: "Café especial 250 g", pedidos: 1284, receita: 48210.5, peso: 0.25, margem: 38.4 },
  { nome: "Moedor manual", pedidos: 312, receita: 40560, peso: 0.68, margem: 27.9 },
  { nome: "Prensa francesa", pedidos: 498, receita: 34362, peso: 0.9, margem: 31.2 },
  { nome: "Filtro de papel (100 un.)", pedidos: 2051, receita: 18459, peso: 0.12, margem: 52.6 },
  { nome: "Chaleira bico de ganso", pedidos: 141, receita: 26085, peso: 1.1, margem: null },
  { nome: "Balança de precisão", pedidos: 97, receita: 15423, peso: 0.45, margem: 22.4 },
];

function colunas(comDicas: boolean, ordenavel = false): Coluna<Produto>[] {
  const lista: Coluna<Produto>[] = [
    { chave: "nome", titulo: "Produto" },
    { chave: "pedidos", titulo: "Pedidos", tipo: "numero" },
    {
      chave: "receita",
      titulo: "Receita",
      tipo: "decimal",
      formatar: (p) => p.receita.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    },
    { chave: "peso", titulo: "Peso", tipo: "decimal", sufixo: "kg" },
    {
      chave: "margem",
      titulo: "Margem",
      tipo: "percentual",
      dica: comDicas ? "Receita menos custo, sobre a receita. Travessão quando ainda não há custo cadastrado." : undefined,
    },
  ];
  return lista.map((c) => ({ ...c, ordenavel }));
}

type Tarefa = { titulo: string; responsavel: string; prioridade: "Alta" | "Média" | "Baixa"; prazo: string; horas: number };

const PESO = { Alta: 0, Média: 1, Baixa: 2 };
const RESPONSAVEIS = ["Ana", "Bruno", "Carla", "Diego", "Elisa"];
const TAREFAS: Tarefa[] = [
  "Revisar contrato",
  "Atualizar catálogo",
  "Fechar o caixa",
  "Treinar equipe",
  "Conferir estoque",
  "Responder clientes",
  "Planejar campanha",
  "Ajustar preços",
  "Auditar notas",
  "Renovar alvará",
  "Organizar depósito",
  "Montar vitrine",
  "Negociar frete",
  "Enviar relatório",
].map((titulo, i) => ({
  titulo,
  responsavel: RESPONSAVEIS[i % RESPONSAVEIS.length],
  prioridade: (["Alta", "Média", "Baixa"] as const)[(i * 2) % 3],
  prazo: `2026-10-${String(((i * 5) % 27) + 1).padStart(2, "0")}`,
  horas: ((i * 5) % 17) + 1.5,
}));

const COLUNAS_DE_TAREFAS: Coluna<Tarefa>[] = [
  { chave: "titulo", titulo: "Tarefa", ordenavel: true },
  { chave: "responsavel", titulo: "Responsável", ordenavel: true },
  // A ordem natural da prioridade não é a alfabética: comparação própria
  { chave: "prioridade", titulo: "Prioridade", ordenavel: true, ordenarPor: (a, b) => PESO[a.prioridade] - PESO[b.prioridade] },
  {
    chave: "prazo",
    titulo: "Prazo",
    ordenavel: true,
    formatar: (t) => t.prazo.split("-").reverse().slice(0, 2).join("/"),
  },
  { chave: "horas", titulo: "Horas", tipo: "numero", sufixo: "h", ordenavel: true },
];

export default defineStories({
  args: { linhas: 4, comDicas: true, ordenavel: false, larguraMinima: "40rem", legenda: "Vendas por produto" },
  controls: {
    linhas: { type: "number", label: "linhas (quantidade)", min: 0, max: 6 },
    comDicas: { type: "boolean", label: "dica no título da coluna" },
    ordenavel: { type: "boolean", label: "colunas ordenáveis" },
    larguraMinima: { type: "select", options: ["30rem", "40rem", "50rem"] },
    legenda: { type: "text" },
  },
  render: (a) => (
    <div className="w-full">
      <TabelaDados
        colunas={colunas(a.comDicas, a.ordenavel)}
        linhas={PRODUTOS.slice(0, a.linhas)}
        legenda={a.legenda}
        larguraMinima={a.larguraMinima}
      />
    </div>
  ),
  stories: [
    { name: "Produtos" },
    { name: "Com valor ausente", args: { linhas: 6 } },
    { name: "Sem dicas", args: { comDicas: false } },
    { name: "Ordenável", args: { linhas: 6, ordenavel: true } },
    {
      name: "Cabeçalho fixo e ordem própria",
      render: () => (
        <div className="w-full">
          <TabelaDados
            colunas={COLUNAS_DE_TAREFAS}
            linhas={TAREFAS}
            legenda="Tarefas da equipe"
            cabecalhoFixo
            alturaMaxima="20rem"
            ordenacaoInicial={{ chave: "prioridade", direcao: "asc" }}
          />
        </div>
      ),
    },
  ],
});
