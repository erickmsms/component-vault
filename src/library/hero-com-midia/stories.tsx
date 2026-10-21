import type { CSSProperties } from "react";
import { defineStories } from "@/registry/stories";
import { HeroComMidia } from "./HeroComMidia";

// Fundos abstratos feitos só com as cores do tema (sem imagens nem vídeos externos).
const FUNDOS: Record<string, CSSProperties> = {
  aurora: {
    background: [
      "radial-gradient(55% 75% at 82% 18%, var(--series-1), transparent 70%)",
      "radial-gradient(45% 65% at 28% 92%, var(--series-3), transparent 70%)",
      "radial-gradient(40% 55% at 62% 62%, var(--series-7), transparent 72%)",
      "linear-gradient(135deg, var(--accent), var(--series-1))",
    ].join(", "),
  },
  entardecer: {
    background: [
      "radial-gradient(35% 45% at 70% 72%, var(--series-4), transparent 75%)",
      "linear-gradient(170deg, var(--series-7) 0%, var(--series-5) 45%, var(--series-2) 100%)",
    ].join(", "),
  },
  conico: {
    background:
      "conic-gradient(from 210deg at 68% 42%, var(--series-1), var(--series-7), var(--series-5), var(--series-2), var(--series-4), var(--series-1))",
  },
};

function FundoAbstrato({ nome }: { nome: string }) {
  return <div className="absolute inset-0" style={FUNDOS[nome] ?? FUNDOS.aurora} />;
}

function Acoes() {
  return (
    <>
      <a
        href="#comecar"
        className="inline-flex h-12 items-center gap-3 rounded-lg bg-accent px-6 text-base font-semibold text-page outline-accent transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Começar agora
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </a>
      <a
        href="#como-funciona"
        className="inline-flex h-12 items-center rounded-lg border border-ink/40 px-6 text-base font-semibold text-ink outline-accent transition-colors hover:bg-ink/10 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Ver como funciona
      </a>
    </>
  );
}

export default defineStories({
  args: {
    chapeu: "Gestão de vendas",
    titulo: "Tudo o que sua equipe precisa",
    enfase: "para vender mais todo mês",
    subtitulo: "Metas, funil e relatórios no mesmo lugar, atualizados enquanto as vendas acontecem.",
    comAcoes: true,
    fundo: "aurora",
    veu: 0.7,
    esquema: "escuro",
    alinhamento: "esquerda",
    intervaloEntrePalavras: 55,
  },
  controls: {
    chapeu: { type: "text", label: "chapeu (vazio = sem)" },
    titulo: { type: "text", label: "titulo (trecho normal)" },
    enfase: { type: "text", label: "trecho em itálico (vazio = sem)" },
    subtitulo: { type: "text", label: "subtitulo (vazio = sem)" },
    comAcoes: { type: "boolean", label: "acoes (botões de exemplo)" },
    fundo: { type: "select", label: "fundo (exemplos abstratos)", options: ["aurora", "entardecer", "conico"] },
    veu: { type: "number", min: 0, max: 1, step: 0.05 },
    esquema: { type: "select", options: ["escuro", "claro"] },
    alinhamento: { type: "select", options: ["esquerda", "centro"] },
    intervaloEntrePalavras: { type: "number", label: "intervaloEntrePalavras (ms)", min: 0, max: 200, step: 5 },
  },
  // altura="auto" nos exemplos: "tela" usa a altura da janela, e o preview cresce com o conteúdo.
  render: (a) => (
    <HeroComMidia
      altura="auto"
      className="rounded-2xl"
      chapeu={a.chapeu || undefined}
      titulo={a.enfase ? [{ texto: a.titulo }, { texto: a.enfase, enfase: true }] : a.titulo}
      subtitulo={a.subtitulo || undefined}
      acoes={a.comAcoes ? <Acoes /> : undefined}
      fundo={<FundoAbstrato nome={a.fundo} />}
      veu={a.veu}
      esquema={a.esquema as "escuro" | "claro"}
      alinhamento={a.alinhamento as "esquerda" | "centro"}
      intervaloEntrePalavras={a.intervaloEntrePalavras}
    />
  ),
  stories: [
    { name: "Sobre fundo abstrato" },
    {
      name: "Centralizado",
      args: {
        alinhamento: "centro",
        fundo: "entardecer",
        chapeu: "Novo",
        titulo: "Relatórios que se",
        enfase: "explicam sozinhos",
        subtitulo: "Cada gráfico chega com um resumo do que mudou e por quê.",
      },
    },
    { name: "Véu leve", args: { fundo: "conico", veu: 0.35 } },
    {
      name: "Esquema claro",
      args: { esquema: "claro", fundo: "entardecer", veu: 0.75 },
    },
    {
      name: "Só o título",
      args: {
        chapeu: "",
        enfase: "",
        subtitulo: "",
        comAcoes: false,
        titulo: "Vendas, metas e equipes em um painel só.",
      },
    },
  ],
});
