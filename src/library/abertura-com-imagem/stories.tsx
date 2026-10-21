import { defineStories } from "@/registry/stories";
import { AberturaComImagem } from "./AberturaComImagem";

// Mídias abstratas feitas só com as cores do tema (sem imagens externas).
const MIDIAS = {
  ondas: {
    background: [
      "radial-gradient(70% 90% at 85% 15%, var(--series-1), transparent 70%)",
      "radial-gradient(60% 80% at 10% 95%, var(--series-3), transparent 70%)",
      "linear-gradient(150deg, var(--accent), var(--series-7))",
    ].join(", "),
  },
  grade: {
    background: [
      "repeating-linear-gradient(90deg, color-mix(in oklab, var(--page) 18%, transparent) 0 1px, transparent 1px 48px)",
      "repeating-linear-gradient(0deg, color-mix(in oklab, var(--page) 18%, transparent) 0 1px, transparent 1px 48px)",
      "linear-gradient(200deg, var(--series-4), var(--series-2))",
    ].join(", "),
  },
};

function MidiaAbstrata({ nome }: { nome: keyof typeof MIDIAS }) {
  return <div aria-hidden="true" className="absolute inset-0" style={MIDIAS[nome]} />;
}

function Chamada({ texto }: { texto: string }) {
  return (
    <a
      href="#contato"
      className="inline-flex h-12 items-center rounded-2xl bg-accent px-7 text-sm font-medium text-page outline-accent transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {texto}
    </a>
  );
}

export default defineStories({
  args: {
    voltar: "Voltar aos produtos",
    chapeu: "Relatórios",
    titulo: "Relatórios que se explicam sozinhos",
    resumo:
      "Cada gráfico chega com um resumo do que mudou e por quê, para a reunião de segunda começar pela decisão, e não pela planilha.",
    acao: "Agendar uma demonstração",
    midia: "ondas",
    inverter: false,
    fundo: "superficie",
  },
  controls: {
    voltar: { type: "text", label: "voltar.rotulo (vazio = sem)" },
    chapeu: { type: "text", label: "chapeu (vazio = sem)" },
    titulo: { type: "text" },
    resumo: { type: "text", label: "resumo (vazio = sem)" },
    acao: { type: "text", label: "acao (texto do botão; vazio = sem)" },
    midia: { type: "select", label: "midia (exemplos abstratos)", options: ["ondas", "grade", "nenhuma"] },
    inverter: { type: "boolean" },
    fundo: { type: "select", options: ["superficie", "nenhum"] },
  },
  render: (a) => (
    <div className="w-full overflow-hidden rounded-2xl">
      <AberturaComImagem
        voltar={a.voltar ? { rotulo: a.voltar, href: "#produtos" } : undefined}
        chapeu={a.chapeu || undefined}
        titulo={a.titulo}
        resumo={a.resumo || undefined}
        acao={a.acao ? <Chamada texto={a.acao} /> : undefined}
        midia={a.midia === "nenhuma" ? undefined : <MidiaAbstrata nome={a.midia as keyof typeof MIDIAS} />}
        inverter={a.inverter}
        fundo={a.fundo as "superficie" | "nenhum"}
      />
    </div>
  ),
  stories: [
    { name: "Mídia à direita" },
    { name: "Mídia à esquerda", args: { inverter: true, midia: "grade", voltar: "" } },
    { name: "Sem fundo", args: { fundo: "nenhum", chapeu: "Equipes", titulo: "Metas por pessoa, sem planilha" } },
    { name: "Sem mídia", args: { midia: "nenhuma" } },
  ],
});
