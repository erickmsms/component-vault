import type { ReactNode } from "react";
import { defineStories } from "@/registry/stories";
import { AcordeaoComMidia, type ItemDoAcordeao } from "./AcordeaoComMidia";

/** Mídia de exemplo: painel na cor de uma série do tema com um ícone grande (sem arquivos externos). */
function Painel({ serie, children }: { serie: number; children: ReactNode }) {
  const cor = `var(--series-${serie})`;
  return (
    <div
      className="grid size-full place-items-center"
      style={{ backgroundColor: `color-mix(in oklab, ${cor} 14%, var(--surface))` }}
    >
      <span className="grid size-32 place-items-center rounded-full text-page" style={{ backgroundColor: cor }}>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-14"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {children}
        </svg>
      </span>
    </div>
  );
}

const ITENS: ItemDoAcordeao[] = [
  {
    titulo: "Agenda compartilhada",
    texto: "Toda a equipe vê os mesmos compromissos, com lembretes antes de cada reunião e convites que chegam por e-mail.",
    midia: (
      <Painel serie={1}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </Painel>
    ),
  },
  {
    titulo: "Relatórios automáticos",
    texto: "Os números da semana chegam prontos toda segunda-feira, com comparação ao período anterior.",
    midia: (
      <Painel serie={2}>
        <path d="M3 3v18h18" />
        <path d="m7 15 4-4 3 3 5-6" />
      </Painel>
    ),
  },
  {
    titulo: "Integrações",
    texto: "Conecte a planilha, o e-mail e o sistema de vendas que você já usa, sem copiar dados à mão.",
    midia: (
      <Painel serie={3}>
        <path d="M9 7H6a4 4 0 0 0 0 8h3M15 7h3a4 4 0 0 1 0 8h-3M8 11h8" />
      </Painel>
    ),
  },
  {
    titulo: "Atendimento",
    texto: "Uma pessoa de verdade responde em até duas horas nos dias úteis, por chat ou telefone.",
    midia: (
      <Painel serie={4}>
        <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
      </Painel>
    ),
  },
];

export default defineStories({
  args: { quantidade: 3, ativoInicial: 0, ladoDaMidia: "direita", proporcaoDaMidia: "4 / 3" },
  controls: {
    quantidade: { type: "number", label: "itens (quantidade)", min: 2, max: 4 },
    ativoInicial: { type: "number", min: 0, max: 3 },
    ladoDaMidia: { type: "select", options: ["direita", "esquerda"] },
    proporcaoDaMidia: { type: "select", options: ["4 / 3", "1", "16 / 9", "3 / 4"] },
  },
  render: (a) => (
    <div className="w-full max-w-6xl">
      <AcordeaoComMidia
        key={`${a.quantidade}-${a.ativoInicial}`}
        itens={ITENS.slice(0, a.quantidade)}
        ativoInicial={Math.min(a.ativoInicial, a.quantidade - 1)}
        ladoDaMidia={a.ladoDaMidia as "direita" | "esquerda"}
        proporcaoDaMidia={a.proporcaoDaMidia}
      />
    </div>
  ),
  stories: [
    { name: "Mídia à direita" },
    { name: "Mídia à esquerda", args: { ladoDaMidia: "esquerda", ativoInicial: 1 } },
    { name: "Quatro itens, mídia quadrada", args: { quantidade: 4, proporcaoDaMidia: "1" } },
  ],
});
