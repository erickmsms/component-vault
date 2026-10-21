import { useState, type ReactNode } from "react";
import { defineStories } from "@/registry/stories";
import { BarraLateral, type ItemDaBarraLateral } from "./BarraLateral";

const icone = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const I = {
  inicio: icone("M3 11 12 4l9 7M5 10v10h5v-6h4v6h5V10"),
  tarefas: icone("M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"),
  mensagens: icone("M4 5h16v11H8l-4 4z"),
  relatorios: icone("M4 20V10M10 20V4M16 20v-7M22 20H2"),
  clientes: icone("M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM22 19v-1a4 4 0 0 0-3-3.9M16 4.1a3 3 0 0 1 0 5.8"),
  config: icone("M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"),
};

const PAGINAS: Record<string, string> = {
  "/inicio": "Início",
  "/tarefas": "Tarefas",
  "/mensagens": "Mensagens",
  "/relatorios/vendas": "Relatório de vendas",
  "/relatorios/equipes": "Relatório de equipes",
  "/relatorios/estoque": "Relatório de estoque",
  "/clientes": "Clientes",
  "/configuracoes": "Configurações",
};

function itens(atual: string, comContadores: boolean): ItemDaBarraLateral[] {
  const item = (rotulo: string, href: string, ic?: ReactNode, contador?: number | string): ItemDaBarraLateral => ({
    rotulo,
    href,
    icone: ic,
    ativo: atual === href,
    contador: comContadores ? contador : undefined,
  });
  return [
    item("Início", "/inicio", I.inicio),
    item("Tarefas", "/tarefas", I.tarefas, 8),
    item("Mensagens", "/mensagens", I.mensagens, 3),
    {
      rotulo: "Relatórios",
      icone: I.relatorios,
      filhos: [
        item("Vendas", "/relatorios/vendas"),
        item("Equipes", "/relatorios/equipes"),
        item("Estoque", "/relatorios/estoque", undefined, "Novo"),
      ],
    },
    item("Clientes", "/clientes", I.clientes),
    { ...item("Configurações", "/configuracoes", I.config), separarAntes: true },
  ];
}

function Marca({ recolhida }: { recolhida: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent font-display text-sm font-bold text-page">
        A
      </span>
      <span className={`font-display font-bold whitespace-nowrap transition-opacity ${recolhida ? "opacity-0" : "opacity-100"}`}>Acme Painel</span>
    </span>
  );
}

function Conta({ recolhida }: { recolhida: boolean }) {
  return (
    <span className="flex items-center gap-3 py-1" title={recolhida ? "Ana Souza" : undefined}>
      <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-semibold text-ink-2">
        AS
      </span>
      <span className={`min-w-0 transition-opacity ${recolhida ? "opacity-0" : "opacity-100"}`}>
        <span className="block truncate text-sm font-medium whitespace-nowrap">Ana Souza</span>
        <span className="block truncate text-xs whitespace-nowrap text-muted">ana@exemplo.com</span>
      </span>
    </span>
  );
}

function Exemplo({
  inicial = "/relatorios/vendas",
  recolhida: recolhidaInicial,
  comContadores,
  comCabecalho,
  comRodape,
  umGrupoPorVez,
}: {
  inicial?: string;
  recolhida: boolean;
  comContadores: boolean;
  comCabecalho: boolean;
  comRodape: boolean;
  umGrupoPorVez: boolean;
}) {
  const [atual, setAtual] = useState(inicial);
  return (
    <div className="flex h-[34rem] w-full overflow-hidden rounded-xl border border-rule bg-surface">
      <BarraLateral
        itens={itens(atual, comContadores)}
        recolhidaInicial={recolhidaInicial}
        umGrupoPorVez={umGrupoPorVez}
        cabecalho={comCabecalho ? (r) => <Marca recolhida={r} /> : undefined}
        rodape={comRodape ? (r) => <Conta recolhida={r} /> : undefined}
        // Exemplo de link próprio: aqui ele só troca a página do exemplo, como faria um roteador.
        renderizarLink={(p) => (
          <a
            {...p}
            onClick={(e) => {
              e.preventDefault();
              setAtual(p.href);
            }}
          />
        )}
      />
      <main className="flex min-w-0 flex-1 flex-col gap-4 p-8">
        <p className="text-sm text-muted">Página atual</p>
        <h2 className="font-display text-3xl font-bold">{PAGINAS[atual]}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 rounded-xl border border-rule bg-page" />
          ))}
        </div>
        <div className="min-h-0 flex-1 rounded-xl border border-rule bg-page" />
      </main>
    </div>
  );
}

export default defineStories({
  args: { recolhida: false, comContadores: true, comCabecalho: true, comRodape: true, umGrupoPorVez: true },
  controls: {
    recolhida: { type: "boolean", label: "recolhidaInicial" },
    comContadores: { type: "boolean", label: "contadores (exemplo)" },
    comCabecalho: { type: "boolean", label: "cabecalho (exemplo)" },
    comRodape: { type: "boolean", label: "rodape (exemplo)" },
    umGrupoPorVez: { type: "boolean" },
  },
  render: (a) => <Exemplo key={String(a.recolhida)} {...a} />,
  stories: [
    { name: "Aberta" },
    { name: "Recolhida", args: { recolhida: true } },
    { name: "Sem cabeçalho e rodapé", args: { comCabecalho: false, comRodape: false, comContadores: false } },
  ],
});
