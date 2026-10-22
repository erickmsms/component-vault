import { useState, type ReactNode } from "react";
import { Botao } from "@/library/botao/Botao";
import { defineStories } from "@/registry/stories";
import { EtapasInterativas, type EtapaInterativa } from "./EtapasInterativas";

/** Mídia de exemplo: painel na cor de uma série do tema com um ícone grande (sem arquivos externos). */
function Painel({ serie, children }: { serie: number; children: ReactNode }) {
  const cor = `var(--series-${serie})`;
  return (
    <div
      className="absolute inset-0 grid place-items-center pb-24"
      style={{ backgroundColor: `color-mix(in oklab, ${cor} 16%, var(--surface))`, color: cor }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-24"
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

const ETAPAS: EtapaInterativa[] = [
  {
    titulo: "Conversa inicial",
    descricao: "Entendemos o que você precisa, o prazo e o orçamento numa reunião de meia hora.",
    midia: (
      <Painel serie={1}>
        <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
      </Painel>
    ),
  },
  {
    titulo: "Proposta",
    descricao: "Em até três dias você recebe o escopo, o cronograma e o valor fechado, sem letras miúdas.",
    midia: (
      <Painel serie={2}>
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" />
        <path d="M14 3v6h6M8 13h8M8 17h5" />
      </Painel>
    ),
  },
  {
    titulo: "Produção",
    descricao: "A equipe trabalha em ciclos de uma semana e mostra o andamento ao fim de cada um.",
    midia: (
      <Painel serie={3}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
      </Painel>
    ),
  },
  {
    titulo: "Entrega e suporte",
    descricao: "Entregamos com documentação e acompanhamos os primeiros meses de uso de perto.",
    midia: (
      <Painel serie={4}>
        <path d="m5 12 5 5L20 7" />
      </Painel>
    ),
  },
];

const SEM_MIDIA = ETAPAS.map(({ titulo, descricao }) => ({ titulo, descricao }));

type Valores = {
  quantidade: number;
  comMidia: boolean;
  crescimentoAberto: number;
  duracaoDaLinha: number;
  alturaDoPainel: number;
};

/** Playground com um botão para ver a entrada de novo (a chave remonta o componente). */
function ExemploComRepetir(a: Valores) {
  const [vez, setVez] = useState(0);
  return (
    <div className="flex w-full max-w-6xl flex-col items-start gap-8">
      <EtapasInterativas
        key={`${vez}-${a.quantidade}-${a.duracaoDaLinha}`}
        itens={(a.comMidia ? ETAPAS : SEM_MIDIA).slice(0, a.quantidade)}
        crescimentoAberto={a.crescimentoAberto}
        duracaoDaLinha={a.duracaoDaLinha}
        alturaDoPainel={a.alturaDoPainel}
      />
      <Botao
        variante="contorno"
        arredondado
        onClick={() => setVez((v) => v + 1)}
      >
        Ver a entrada de novo
      </Botao>
    </div>
  );
}

export default defineStories({
  args: { quantidade: 4, comMidia: true, crescimentoAberto: 2.8, duracaoDaLinha: 3000, alturaDoPainel: 400 },
  controls: {
    quantidade: { type: "number", label: "etapas (quantidade)", min: 2, max: 4 },
    comMidia: { type: "boolean", label: "com mídia" },
    crescimentoAberto: { type: "number", min: 1, max: 5, step: 0.2 },
    duracaoDaLinha: { type: "number", label: "duracaoDaLinha (ms)", min: 300, max: 6000, step: 100 },
    alturaDoPainel: { type: "number", label: "alturaDoPainel (px)", min: 200, max: 600, step: 20 },
  },
  render: (a) => <ExemploComRepetir {...a} />,
  stories: [
    { name: "Com mídia" },
    { name: "Sem mídia (número no painel)", args: { comMidia: false, alturaDoPainel: 320 } },
    {
      name: "Sobre fundo surface",
      render: () => (
        <div className="w-full max-w-6xl rounded-3xl bg-surface p-6 sm:p-10">
          <EtapasInterativas itens={SEM_MIDIA.slice(0, 3)} fundo="surface" alturaDoPainel={300} duracaoDaLinha={1800} />
        </div>
      ),
    },
  ],
});
