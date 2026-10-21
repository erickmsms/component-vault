import { defineStories } from "@/registry/stories";
import { LinhaDoTempoDeAtividades, type ItemDaLinhaDoTempo } from "./LinhaDoTempoDeAtividades";

const icone = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONES = {
  criar: icone("M12 5v14M5 12h14"),
  mover: icone("M7 7h12l-3-3M17 17H5l3 3"),
  editar: icone("M4 20h4L19 9l-4-4L4 16v4z"),
  comentar: icone("M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z"),
  concluir: icone("m5 12.5 4.5 4.5L19 7.5"),
  excluir: icone("M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"),
  entrar: icone("M15 3h4v18h-4M10 17l5-5-5-5M15 12H3"),
};

const ANA = { nome: "Ana Souza" };
const BRUNO = { nome: "Bruno Lima" };
const CARLA = { nome: "Carla Mendes" };

const ITENS: ItemDaLinhaDoTempo[] = [
  { id: "1", quando: "2026-10-21T17:42:00", autor: ANA, acao: "concluiu", alvo: "Revisar contrato de fornecedor", icone: ICONES.concluir, tom: "sucesso" },
  {
    id: "2",
    quando: "2026-10-21T16:05:00",
    autor: BRUNO,
    acao: "moveu",
    alvo: "Campanha de Black Friday",
    campo: "Etapa",
    de: "A fazer",
    para: "Em andamento",
    icone: ICONES.mover,
    tom: "info",
  },
  {
    id: "3",
    quando: "2026-10-21T11:20:00",
    autor: CARLA,
    acao: "alterou o prazo de",
    alvo: "Relatório trimestral",
    campo: "Prazo",
    de: "24/10",
    para: "31/10",
    icone: ICONES.editar,
    tom: "alerta",
  },
  { id: "4", quando: "2026-10-21T09:02:00", autor: ANA, acao: "entrou na plataforma", icone: ICONES.entrar },
  { id: "5", quando: "2026-10-20T18:30:00", autor: BRUNO, acao: "comentou em", alvo: "Campanha de Black Friday", icone: ICONES.comentar, tom: "info" },
  { id: "6", quando: "2026-10-20T15:10:00", autor: CARLA, acao: "excluiu", alvo: "Rascunho antigo", icone: ICONES.excluir, tom: "erro" },
  { id: "7", quando: "2026-10-20T10:45:00", autor: ANA, acao: "criou", alvo: "Relatório trimestral", icone: ICONES.criar, tom: "sucesso" },
  { id: "8", quando: "2026-10-17T14:00:00", autor: BRUNO, acao: "criou", alvo: "Campanha de Black Friday", icone: ICONES.criar, tom: "sucesso" },
  { id: "9", quando: "2026-10-17T13:12:00", acao: "Backup automático concluído", tom: "neutro" },
];

export default defineStories({
  args: { agruparPorDia: true, gruposAbertos: 1, comIcones: true, vazio: false },
  controls: {
    agruparPorDia: { type: "boolean" },
    gruposAbertos: { type: "number", min: 0, max: 3 },
    comIcones: { type: "boolean", label: "ícones (sem = ponto colorido)" },
    vazio: { type: "boolean", label: "sem itens" },
  },
  render: (a) => (
    <div className="w-full max-w-2xl">
      <LinhaDoTempoDeAtividades
        key={`${a.gruposAbertos}`}
        itens={a.vazio ? [] : a.comIcones ? ITENS : ITENS.map((i) => ({ ...i, icone: undefined }))}
        agruparPorDia={a.agruparPorDia}
        gruposAbertos={a.gruposAbertos}
      />
    </div>
  ),
  stories: [
    { name: "Agrupada por dia" },
    { name: "Todos os dias abertos", args: { gruposAbertos: 3 } },
    { name: "Sem agrupar", args: { agruparPorDia: false } },
    { name: "Pontos coloridos", args: { comIcones: false, gruposAbertos: 2 } },
    { name: "Vazia", args: { vazio: true } },
  ],
});
