import { defineStories } from "@/registry/stories";
import { ListaEmFoco, type ItemEmFoco } from "./ListaEmFoco";

function Acao({ children }: { children: string }) {
  return (
    <button
      type="button"
      className="inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-medium text-page outline-accent transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {children}
    </button>
  );
}

const SERVICOS = [
  {
    titulo: "Consultoria",
    descricao: "Um diagnóstico do seu processo atual e um plano com prioridades, prazos e custos estimados.",
  },
  {
    titulo: "Treinamentos",
    descricao: "Turmas presenciais ou online para a sua equipe, com material próprio e certificado.",
  },
  {
    titulo: "Suporte técnico",
    descricao: "Atendimento em horário comercial por chat e telefone, com resposta em até duas horas.",
  },
  {
    titulo: "Análise de dados",
    descricao: "Painéis e relatórios com os números que importam, atualizados todo dia.",
  },
  {
    titulo: "Projetos sob medida",
    descricao: "Quando nada pronto serve: desenhamos e construímos junto com você.",
  },
];

const itens = (quantidade: number, comAcao: boolean): ItemEmFoco[] =>
  SERVICOS.slice(0, quantidade).map((s) => ({ ...s, acao: comAcao ? <Acao>Falar com a equipe</Acao> : undefined }));

export default defineStories({
  args: { quantidade: 5, alinhamento: "centro", ativoInicial: 0, comAcao: true, espacos: true },
  controls: {
    quantidade: { type: "number", label: "itens (quantidade)", min: 2, max: 5 },
    alinhamento: { type: "select", options: ["centro", "esquerda"] },
    ativoInicial: { type: "number", min: 0, max: 4 },
    comAcao: { type: "boolean", label: "com ação" },
    espacos: { type: "boolean", label: "espaço antes e depois (para rolar)" },
  },
  render: (a) => (
    <div className="w-full max-w-5xl">
      {a.espacos && <p className="pb-[45vh] text-center text-sm text-muted">Role para baixo dentro do preview ↓</p>}
      <ListaEmFoco
        key={`${a.quantidade}-${a.ativoInicial}`}
        itens={itens(a.quantidade, a.comAcao)}
        alinhamento={a.alinhamento as "centro" | "esquerda"}
        ativoInicial={Math.min(a.ativoInicial, a.quantidade - 1)}
      />
      {a.espacos && <div className="h-[50vh]" />}
    </div>
  ),
  stories: [
    { name: "Lista", args: { quantidade: 4, espacos: false } },
    { name: "Ao rolar (playground)" },
    { name: "À esquerda, sem ação", args: { alinhamento: "esquerda", comAcao: false } },
  ],
});
