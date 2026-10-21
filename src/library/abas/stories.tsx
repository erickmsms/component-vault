import { useState, type ReactNode } from "react";
import { defineStories } from "@/registry/stories";
import { Abas, type OpcaoDeAba } from "./Abas";

function Icone({ children }: { children: ReactNode }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

const PERIODOS = [
  { valor: "7d", rotulo: "7 dias" },
  { valor: "30d", rotulo: "30 dias" },
  { valor: "90d", rotulo: "90 dias" },
  { valor: "12m", rotulo: "12 meses" },
] as const;

const SITUACOES = [
  { valor: "todas", rotulo: "Todas", contador: 48 },
  { valor: "pendentes", rotulo: "Pendentes", contador: 12 },
  { valor: "concluidas", rotulo: "Concluídas", contador: 36 },
] as const;

const VISOES = [
  {
    valor: "geral",
    rotulo: "Visão geral",
    icone: (
      <Icone>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </Icone>
    ),
  },
  {
    valor: "equipe",
    rotulo: "Por equipe",
    icone: (
      <Icone>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6" />
      </Icone>
    ),
  },
  {
    valor: "produto",
    rotulo: "Por produto",
    icone: (
      <Icone>
        <path d="m12 3 8.5 4.5v9L12 21l-8.5-4.5v-9L12 3zM3.5 7.5 12 12l8.5-4.5M12 12v9" />
      </Icone>
    ),
  },
] as const;

const SECOES = [
  { valor: "perfil", rotulo: "Perfil e preferências" },
  { valor: "equipes", rotulo: "Equipes e permissões" },
  { valor: "integracoes", rotulo: "Integrações" },
  { valor: "cobranca", rotulo: "Cobrança e notas fiscais" },
  { valor: "seguranca", rotulo: "Segurança" },
] as const;

function Exemplo<T extends string>({
  opcoes,
  rotulo,
  ...resto
}: {
  opcoes: ReadonlyArray<OpcaoDeAba<T>>;
  rotulo: string;
  tamanho?: "sm" | "md";
  bloco?: boolean;
  quebrar?: boolean;
  desabilitado?: boolean;
}) {
  const [valor, setValor] = useState<T>(opcoes[0].valor);
  return <Abas valor={valor} aoMudar={setValor} opcoes={opcoes} rotulo={rotulo} {...resto} />;
}

export default defineStories({
  args: { tamanho: "md", comContador: true, bloco: false, quebrar: false, desabilitado: false },
  controls: {
    tamanho: { type: "select", options: ["sm", "md"] },
    comContador: { type: "boolean", label: "contador nas opções" },
    bloco: { type: "boolean" },
    quebrar: { type: "boolean" },
    desabilitado: { type: "boolean" },
  },
  render: (a) => (
    <div className="w-full max-w-md">
      <Exemplo
        rotulo="Situação das tarefas"
        opcoes={a.comContador ? SITUACOES : SITUACOES.map(({ valor, rotulo }) => ({ valor, rotulo }))}
        tamanho={a.tamanho as "sm" | "md"}
        bloco={a.bloco}
        quebrar={a.quebrar}
        desabilitado={a.desabilitado}
      />
    </div>
  ),
  stories: [
    {
      name: "Período e situação",
      render: () => (
        <div className="flex flex-col items-start gap-4">
          <Exemplo rotulo="Período do relatório" opcoes={PERIODOS} />
          <Exemplo rotulo="Situação das tarefas" opcoes={SITUACOES} />
        </div>
      ),
    },
    { name: "Playground" },
    { name: "Com ícones", render: () => <Exemplo rotulo="Visão do painel" opcoes={VISOES} /> },
    { name: "Pequena", render: () => <Exemplo rotulo="Período do relatório" opcoes={PERIODOS} tamanho="sm" /> },
    {
      name: "Bloco (campo de formulário)",
      render: () => (
        <div className="flex w-full max-w-md flex-col gap-2">
          <span className="text-sm text-ink-2">Destinatários</span>
          <Exemplo
            rotulo="Destinatários"
            bloco
            opcoes={[
              { valor: "todos", rotulo: "Todos" },
              { valor: "equipe", rotulo: "Por equipe" },
              { valor: "escolher", rotulo: "Escolher" },
            ]}
          />
        </div>
      ),
    },
    {
      name: "Quebrando linha",
      render: () => (
        <div className="w-full max-w-sm">
          <Exemplo rotulo="Seções das configurações" opcoes={SECOES} quebrar />
        </div>
      ),
    },
  ],
});
