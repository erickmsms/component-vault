import { defineStories } from "@/registry/stories";
import { ProvedorDeMovimento } from "@/library/revelar/Movimento";
import {
  Carregando,
  Esqueleto,
  EsqueletoCartoes,
  EsqueletoGrafico,
  EsqueletoLinhas,
  EsqueletoTabela,
  IndicadorAtualizando,
  RegiaoCarregando,
} from "./Esqueleto";

const TAREFAS = [
  { titulo: "Revisar proposta comercial", responsavel: "Ana Souza", prazo: "Hoje" },
  { titulo: "Atualizar planilha de custos", responsavel: "Bruno Lima", prazo: "Amanhã" },
  { titulo: "Preparar apresentação do trimestre", responsavel: "Carla Dias", prazo: "Sexta" },
];

function Peca({ tipo, quantidade }: { tipo: string; quantidade: number }) {
  switch (tipo) {
    case "linhas (texto)":
      return <EsqueletoLinhas variante="texto" linhas={quantidade} />;
    case "cartões":
      return <EsqueletoCartoes cartoes={quantidade} />;
    case "tabela":
      return <EsqueletoTabela linhas={quantidade} />;
    case "gráfico":
      return <EsqueletoGrafico />;
    case "carregando":
      return <Carregando />;
    default:
      return <EsqueletoLinhas linhas={quantidade} />;
  }
}

export default defineStories({
  args: { tipo: "linhas (lista)", quantidade: 4, pulsar: true },
  controls: {
    tipo: {
      type: "select",
      label: "peça",
      options: ["linhas (lista)", "linhas (texto)", "cartões", "tabela", "gráfico", "carregando"],
    },
    quantidade: { type: "number", label: "linhas / cartões", min: 1, max: 10 },
    pulsar: { type: "boolean", label: "animar (desligado = ProvedorDeMovimento)" },
  },
  render: (a) => (
    <div className="w-full max-w-2xl">
      <ProvedorDeMovimento reduzido={!a.pulsar}>
        <Peca tipo={a.tipo} quantidade={a.quantidade} />
      </ProvedorDeMovimento>
    </div>
  ),
  stories: [
    { name: "Padrão" },
    {
      name: "Painel carregando",
      render: () => (
        <div className="w-full max-w-4xl">
          <RegiaoCarregando rotulo="Carregando o painel de vendas...">
            <EsqueletoCartoes cartoes={3} />
            <div className="rounded-xl border border-rule bg-page px-5 py-2">
              <EsqueletoTabela colunas={4} linhas={4} />
            </div>
          </RegiaoCarregando>
        </div>
      ),
    },
    {
      name: "Lista e gráfico",
      render: () => (
        <div className="grid w-full max-w-4xl gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-rule bg-page px-5 py-2">
            <EsqueletoLinhas linhas={4} rotulo="Carregando tarefas..." />
          </div>
          <EsqueletoGrafico altura="12rem" />
        </div>
      ),
    },
    {
      name: "Forma própria com Esqueleto",
      render: () => (
        <div
          className="flex w-full max-w-md items-start gap-4 rounded-xl border border-rule bg-page p-5"
          aria-busy="true"
        >
          <span className="sr-only">Carregando perfil...</span>
          <Esqueleto forma="circulo" className="size-14" />
          <div className="flex flex-1 flex-col gap-2.5 pt-1">
            <Esqueleto forma="texto" className="h-4 w-1/2" />
            <Esqueleto forma="texto" className="w-1/3" />
            <Esqueleto className="mt-2 h-9 w-32" />
          </div>
        </div>
      ),
    },
    {
      name: "Atualizando em segundo plano",
      render: () => (
        <div className="w-full max-w-xl rounded-xl border border-rule bg-page p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-bold">Tarefas da semana</h3>
            <IndicadorAtualizando />
          </div>
          <ul>
            {TAREFAS.map((t) => (
              <li
                key={t.titulo}
                className="flex items-center justify-between gap-3 border-t border-rule py-3 text-sm first:border-t-0"
              >
                <span>
                  {t.titulo}
                  <span className="block text-xs text-muted">{t.responsavel}</span>
                </span>
                <span className="text-ink-2">{t.prazo}</span>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      name: "Carregando (spinner)",
      render: () => (
        <div className="w-full max-w-md rounded-xl border border-rule bg-page">
          <Carregando texto="Verificando permissões..." />
        </div>
      ),
    },
  ],
});
