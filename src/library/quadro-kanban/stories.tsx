import { useState } from "react";
import { defineStories } from "@/registry/stories";
import { moverCartao, QuadroKanban, type CartaoDoQuadro, type ColunaDoQuadro } from "./QuadroKanban";

const PRIORIDADE = { alta: "var(--critical)", media: "var(--warning)", baixa: "var(--success)" };
const ETIQUETA = {
  design: { texto: "Design", cor: "var(--series-1)" },
  site: { texto: "Site", cor: "var(--series-2)" },
  vendas: { texto: "Vendas", cor: "var(--series-3)" },
  financeiro: { texto: "Financeiro", cor: "var(--series-4)" },
};
const P = { ana: { nome: "Ana Souza" }, bruno: { nome: "Bruno Lima" }, carla: { nome: "Carla Mendes" }, davi: { nome: "Davi Rocha" } };

const COLUNAS: ColunaDoQuadro[] = [
  {
    id: "afazer",
    titulo: "A fazer",
    cor: "var(--muted)",
    cartoes: [
      { id: "c1", titulo: "Pesquisa com clientes sobre o novo plano", cor: PRIORIDADE.media, prazo: "28 out", etiquetas: [ETIQUETA.vendas], responsaveis: [P.ana] },
      {
        id: "c2",
        titulo: "Atualizar fotos da página de produtos",
        descricao: "Trocar as fotos antigas pelas da sessão de setembro e revisar os textos alternativos.",
        cor: PRIORIDADE.baixa,
        etiquetas: [ETIQUETA.design, ETIQUETA.site],
        responsaveis: [P.carla, P.davi],
      },
      { id: "c3", titulo: "Planilha de custos do 4º trimestre", cor: PRIORIDADE.alta, prazo: "ontem", prazoVencido: true, etiquetas: [ETIQUETA.financeiro], responsaveis: [P.bruno] },
    ],
  },
  {
    id: "andamento",
    titulo: "Em andamento",
    cor: "var(--accent)",
    cartoes: [
      {
        id: "c4",
        titulo: "Campanha de Black Friday",
        descricao: "Peças para redes sociais, e-mail e banner do site.",
        cor: PRIORIDADE.alta,
        prazo: "14 nov",
        etiquetas: [ETIQUETA.design, ETIQUETA.vendas],
        responsaveis: [P.ana, P.bruno, P.carla, P.davi],
      },
      { id: "c5", titulo: "Novo formulário de contato", cor: PRIORIDADE.media, prazo: "2 nov", etiquetas: [ETIQUETA.site], responsaveis: [P.davi] },
    ],
  },
  {
    id: "revisao",
    titulo: "Em revisão",
    cor: "var(--warning)",
    cartoes: [{ id: "c6", titulo: "Relatório trimestral de vendas", cor: PRIORIDADE.media, prazo: "31 out", etiquetas: [ETIQUETA.vendas], responsaveis: [P.carla] }],
  },
  { id: "feito", titulo: "Concluído", cor: "var(--success)", cartoes: [] },
];

function Exemplo({ altura, personalizado }: { altura: number; personalizado: boolean }) {
  const [colunas, setColunas] = useState(COLUNAS);
  const [aberto, setAberto] = useState<string | null>(null);
  return (
    <div className="flex w-full flex-col gap-3">
      <div style={{ height: altura }}>
        <QuadroKanban
          colunas={colunas}
          aoMover={(m) => setColunas((c) => moverCartao(c, m))}
          aoAbrirCartao={(cartao) => setAberto(cartao.titulo)}
          rotulo="Quadro de tarefas da equipe"
          renderizarCartao={
            personalizado
              ? (cartao: CartaoDoQuadro, coluna) => (
                  <div className="flex items-center justify-between gap-2 pr-7">
                    <span className="text-sm font-medium">{cartao.titulo}</span>
                    <span className="shrink-0 text-xs text-muted">{coluna.titulo}</span>
                  </div>
                )
              : undefined
          }
        />
      </div>
      <p className="text-sm text-muted" aria-live="polite">
        {aberto ? `Abriu: ${aberto}` : "Arraste os cartões entre as colunas ou use o botão de mover de cada um."}
      </p>
    </div>
  );
}

export default defineStories({
  args: { altura: 480, personalizado: false },
  controls: {
    altura: { type: "number", label: "altura do contêiner (px)", min: 280, max: 720, step: 20 },
    personalizado: { type: "boolean", label: "renderizarCartao (exemplo)" },
  },
  render: (a) => <Exemplo {...a} />,
  stories: [
    { name: "Quadro" },
    { name: "Baixo, com rolagem nas colunas", args: { altura: 320 } },
    { name: "Cartão personalizado", args: { personalizado: true, altura: 360 } },
  ],
});
