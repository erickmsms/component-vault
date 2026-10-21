import { useState } from "react";
import { defineStories } from "@/registry/stories";
import { SeletorDePeriodo, type UnidadeDoPeriodo } from "./SeletorDePeriodo";

// Os campos de texto do playground podem estar no meio da digitação: só datas completas passam
const dataValida = (texto: string) => /^\d{4}-\d{2}-\d{2}$/.test(texto);

function Exemplo({
  unidade,
  inicial,
  minimo,
  maximo,
  comBotaoAtual,
  domingo,
}: {
  unidade: UnidadeDoPeriodo;
  inicial: string;
  minimo: string;
  maximo: string;
  comBotaoAtual: boolean;
  domingo: boolean;
}) {
  const [valor, setValor] = useState(dataValida(inicial) ? inicial : "2026-09-16");
  return (
    <SeletorDePeriodo
      unidade={unidade}
      valor={valor}
      aoMudar={setValor}
      minimo={dataValida(minimo) ? minimo : undefined}
      maximo={dataValida(maximo) ? maximo : undefined}
      comBotaoAtual={comBotaoAtual}
      inicioDaSemana={domingo ? 0 : 1}
    />
  );
}

/** O período escolhido filtra uma lista: o caso de uso típico (fechamento do mês, apontamento da semana). */
function ExemploComConteudo() {
  const [mes, setMes] = useState("2026-09-01");
  const numero = Number(mes.slice(5, 7));
  return (
    <div className="w-full max-w-md rounded-2xl border border-rule p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold">Fechamento</h3>
        <SeletorDePeriodo unidade="mes" valor={mes} aoMudar={setMes} maximo="2026-09-30" comBotaoAtual={false} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-surface p-3">
          <dt className="text-muted">Pedidos</dt>
          <dd className="font-display text-2xl font-bold tabular-nums">{180 + numero * 17}</dd>
        </div>
        <div className="rounded-lg bg-surface p-3">
          <dt className="text-muted">Devoluções</dt>
          <dd className="font-display text-2xl font-bold tabular-nums">{(numero * 7) % 12}</dd>
        </div>
      </dl>
    </div>
  );
}

export default defineStories({
  args: {
    unidade: "semana",
    inicial: "2026-09-16",
    minimo: "",
    maximo: "",
    comBotaoAtual: true,
    domingo: false,
  },
  controls: {
    unidade: { type: "select", options: ["mes", "semana", "dia"] },
    inicial: { type: "text", label: "valor inicial (AAAA-MM-DD)" },
    minimo: { type: "text", label: "minimo (AAAA-MM-DD)" },
    maximo: { type: "text", label: "maximo (AAAA-MM-DD)" },
    comBotaoAtual: { type: "boolean", label: "atalho para o período atual" },
    domingo: { type: "boolean", label: "semana começa no domingo" },
  },
  render: (a) => <Exemplo key={`${a.unidade}-${a.inicial}`} {...a} unidade={a.unidade as UnidadeDoPeriodo} />,
  stories: [
    { name: "Semana" },
    { name: "Mês", args: { unidade: "mes", inicial: "2026-09-01" } },
    { name: "Dia", args: { unidade: "dia" } },
    {
      name: "Com limites",
      args: { unidade: "mes", inicial: "2026-08-01", minimo: "2026-06-01", maximo: "2026-09-30", comBotaoAtual: false },
    },
    { name: "Filtrando conteúdo", render: () => <ExemploComConteudo /> },
  ],
});
