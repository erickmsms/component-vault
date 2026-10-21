import { useState } from "react";
import { defineStories } from "@/registry/stories";
import { CaixaDeSelecao, OpcaoDeRadio } from "./CaixaDeSelecao";

const AVISOS = [
  { id: "tarefas", rotulo: "Tarefas atribuídas a mim", descricao: "Quando alguém colocar você como responsável." },
  { id: "comentarios", rotulo: "Comentários", descricao: "Respostas em tarefas que você acompanha." },
  { id: "prazos", rotulo: "Prazos próximos", descricao: "Um dia antes da data de entrega." },
];

const PLANOS = [
  { valor: "mensal", rotulo: "Mensal", descricao: "R$ 49 por mês, cancele quando quiser." },
  { valor: "anual", rotulo: "Anual", descricao: "R$ 490 por ano, dois meses grátis." },
  { valor: "empresa", rotulo: "Empresa", descricao: "Fale com a equipe de vendas.", desabilitado: true },
];

function Preferencias() {
  const [marcados, setMarcados] = useState<string[]>(["tarefas"]);
  const todos = marcados.length === AVISOS.length;
  const alguns = marcados.length > 0 && !todos;
  return (
    <fieldset className="flex w-full max-w-sm flex-col gap-3">
      <legend className="mb-3 font-display text-lg font-bold">Avisos por e-mail</legend>
      <CaixaDeSelecao
        rotulo="Marcar todos"
        marcado={todos}
        indeterminado={alguns}
        aoMudar={() => setMarcados(todos ? [] : AVISOS.map((a) => a.id))}
        className="border-b border-rule pb-3 font-medium"
      />
      {AVISOS.map((a) => (
        <CaixaDeSelecao
          key={a.id}
          rotulo={a.rotulo}
          descricao={a.descricao}
          marcado={marcados.includes(a.id)}
          aoMudar={(m) => setMarcados((atual) => (m ? [...atual, a.id] : atual.filter((id) => id !== a.id)))}
        />
      ))}
    </fieldset>
  );
}

function Planos() {
  const [plano, setPlano] = useState("anual");
  return (
    <fieldset className="flex w-full max-w-sm flex-col gap-3">
      <legend className="mb-3 font-display text-lg font-bold">Plano</legend>
      {PLANOS.map((p) => (
        <OpcaoDeRadio
          key={p.valor}
          name="plano"
          value={p.valor}
          rotulo={p.rotulo}
          descricao={p.descricao}
          marcado={plano === p.valor}
          aoEscolher={() => setPlano(p.valor)}
          disabled={p.desabilitado}
        />
      ))}
    </fieldset>
  );
}

function Exemplo({
  tipo,
  rotulo,
  descricao,
  indeterminado,
  desabilitado,
}: {
  tipo: string;
  rotulo: string;
  descricao: string;
  indeterminado: boolean;
  desabilitado: boolean;
}) {
  const [marcado, setMarcado] = useState(true);
  const comum = { rotulo: rotulo || undefined, descricao: descricao || undefined, disabled: desabilitado };
  return (
    <div className="w-full max-w-sm">
      {tipo === "radio" ? (
        <OpcaoDeRadio {...comum} marcado={marcado} aoEscolher={() => setMarcado(true)} aria-label={rotulo || "Opção"} />
      ) : (
        <CaixaDeSelecao
          {...comum}
          marcado={marcado}
          indeterminado={indeterminado}
          aoMudar={setMarcado}
          aria-label={rotulo ? undefined : "Selecionar linha"}
        />
      )}
    </div>
  );
}

export default defineStories({
  args: {
    tipo: "caixa",
    rotulo: "Lembrar de mim neste computador",
    descricao: "Não marque em computadores compartilhados.",
    indeterminado: false,
    desabilitado: false,
  },
  controls: {
    tipo: { type: "select", label: "componente", options: ["caixa", "radio"] },
    rotulo: { type: "text", label: "rotulo (vazio = só a caixa)" },
    descricao: { type: "text" },
    indeterminado: { type: "boolean", label: "indeterminado (só caixa)" },
    desabilitado: { type: "boolean", label: "disabled" },
  },
  render: (a) => <Exemplo {...a} />,
  stories: [
    {
      name: "Lista com marcar todos",
      render: () => <Preferencias />,
    },
    {
      name: "Grupo de rádio",
      render: () => <Planos />,
    },
    { name: "Playground" },
    { name: "Desabilitada", args: { desabilitado: true } },
    { name: "Só a caixa", args: { rotulo: "", descricao: "" } },
  ],
});
