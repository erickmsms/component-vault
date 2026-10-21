import type { ReactNode } from "react";
import { defineStories } from "@/registry/stories";
import { PilhaDeCartoes, type CartaoDaPilha } from "./PilhaDeCartoes";

/** Mídia de exemplo: área na cor de uma série do tema com um ícone grande (sem arquivos externos). */
function Painel({ serie, children }: { serie: number; children: ReactNode }) {
  const cor = `var(--series-${serie})`;
  return (
    <div
      className="absolute inset-0 grid place-items-center"
      style={{ backgroundColor: `color-mix(in oklab, ${cor} 18%, var(--surface))`, color: cor }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-24 lg:size-32"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </div>
  );
}

function Acao() {
  return (
    <a
      href="#saiba-mais"
      onClick={(e) => e.preventDefault()}
      className="inline-flex w-max items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-medium text-page outline-accent transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      Saiba mais
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
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </a>
  );
}

const CARTOES: CartaoDaPilha[] = [
  {
    titulo: "Lojas virtuais",
    descricao: "Do catálogo ao pagamento, uma loja pronta para vender no celular e no computador.",
    midia: (
      <Painel serie={1}>
        <path d="M6 7h12l-1 13H7L6 7Z" />
        <path d="M9 7a3 3 0 0 1 6 0" />
      </Painel>
    ),
  },
  {
    titulo: "Aplicativos internos",
    descricao: "Ferramentas sob medida para a sua equipe trocar planilhas por telas simples.",
    midia: (
      <Painel serie={2}>
        <rect x="3" y="4" width="18" height="14" rx="2" />
        <path d="M8 21h8M12 18v3" />
      </Painel>
    ),
  },
  {
    titulo: "Painéis de dados",
    descricao: "Os números do negócio num lugar só, atualizados todo dia e fáceis de ler.",
    midia: (
      <Painel serie={3}>
        <path d="M3 3v18h18" />
        <path d="M8 16v-5M13 16V8M18 16v-9" />
      </Painel>
    ),
  },
  {
    titulo: "Manutenção",
    descricao: "Atualizações, cópias de segurança e um contato direto quando algo sai do lugar.",
    midia: (
      <Painel serie={4}>
        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4 2.5-2.5Z" />
      </Painel>
    ),
  },
];

const montar = (quantidade: number, comMidia: boolean, comAcao: boolean): CartaoDaPilha[] =>
  CARTOES.slice(0, quantidade).map((c) => ({
    ...c,
    midia: comMidia ? c.midia : undefined,
    acao: comAcao ? <Acao /> : undefined,
  }));

function Cabecalho() {
  return (
    <header className="mb-10 text-center">
      <h2 className="font-display text-4xl font-bold">Nossos serviços</h2>
      <p className="mx-auto mt-3 max-w-xl text-ink-2">Role para ver os cartões se empilharem.</p>
    </header>
  );
}

export default defineStories({
  args: {
    quantidade: 4,
    topo: 48,
    degrau: 0,
    alturaDoCartao: 360,
    escalaAoSair: 0.95,
    opacidadeAoSair: 0.35,
    deslocamentoAoSair: 45,
    comMidia: true,
    comAcao: true,
  },
  controls: {
    quantidade: { type: "number", label: "cartões (quantidade)", min: 2, max: 4 },
    topo: { type: "number", label: "topo (px)", min: 0, max: 200, step: 8 },
    degrau: { type: "number", label: "degrau (px)", min: 0, max: 40, step: 2 },
    alturaDoCartao: { type: "number", label: "alturaDoCartao (px)", min: 240, max: 520, step: 20 },
    escalaAoSair: { type: "number", min: 0.7, max: 1, step: 0.01 },
    opacidadeAoSair: { type: "number", min: 0, max: 1, step: 0.05 },
    deslocamentoAoSair: { type: "number", label: "deslocamentoAoSair (px)", min: 0, max: 120, step: 5 },
    comMidia: { type: "boolean", label: "com mídia" },
    comAcao: { type: "boolean", label: "com ação" },
  },
  render: (a) => (
    <div className="w-full max-w-4xl">
      <p className="pb-[50vh] text-center text-sm text-muted">Role para baixo dentro do preview ↓</p>
      <PilhaDeCartoes
        itens={montar(a.quantidade, a.comMidia, a.comAcao)}
        topo={a.topo}
        degrau={a.degrau}
        alturaDoCartao={a.alturaDoCartao}
        escalaAoSair={a.escalaAoSair}
        opacidadeAoSair={a.opacidadeAoSair}
        deslocamentoAoSair={a.deslocamentoAoSair}
      />
      <div className="h-[80vh]" />
    </div>
  ),
  stories: [
    {
      name: "Serviços",
      render: () => (
        <div className="w-full max-w-4xl">
          <Cabecalho />
          <PilhaDeCartoes itens={montar(4, true, true)} topo={48} alturaDoCartao={360} />
          {/* Espaço depois da pilha: dá rolagem para o último cartão chegar ao topo. */}
          <div className="h-[60vh]" />
        </div>
      ),
    },
    { name: "Ao rolar (playground)" },
    {
      name: "Com degrau, sem mídia",
      args: { degrau: 16, comMidia: false, alturaDoCartao: 280, deslocamentoAoSair: 0, escalaAoSair: 0.97 },
    },
  ],
});
