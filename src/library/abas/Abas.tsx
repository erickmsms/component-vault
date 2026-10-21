"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";

export type OpcaoDeAba<T extends string> = {
  valor: T;
  /** O texto da opção. Comece com maiúscula. */
  rotulo: string;
  /** Número ao lado do rótulo ("Pendentes 12"). */
  contador?: number;
  /** Ícone antes do rótulo (SVG; sem classe de tamanho, fica com size-4). */
  icone?: ReactNode;
  /** Texto ao passar o mouse. */
  dica?: string;
};

const TAMANHOS = {
  sm: { casca: "gap-0.5 p-0.5", raio: "rounded-[max(var(--radius-sm),calc(var(--radius-lg)_-_var(--spacing)*0.5))]", opcao: "h-7 px-2.5 text-xs" },
  md: { casca: "gap-1 p-1", raio: "rounded-[max(var(--radius-sm),calc(var(--radius-lg)_-_var(--spacing)*1))]", opcao: "h-8 px-3 text-sm" },
} as const;

/**
 * Controle segmentado: uma barra de opções em que só uma fica ativa, para trocar
 * a visão, o período ou o filtro de uma lista. Controlado (quem usa guarda o
 * valor). Setas ←/→ andam entre as opções, Home/End vão às pontas, e só a
 * opção ativa fica na ordem do Tab.
 */
export function Abas<T extends string>({
  valor,
  aoMudar,
  opcoes,
  rotulo,
  tamanho = "md",
  bloco = false,
  quebrar = false,
  desabilitado = false,
  className = "",
}: {
  /** A opção ativa. */
  valor: T;
  aoMudar: (valor: T) => void;
  opcoes: ReadonlyArray<OpcaoDeAba<T>>;
  /** Nome do grupo para leitores de tela ("Período do relatório"). */
  rotulo: string;
  /** `md` acompanha botões e campos de tamanho médio; `sm` é para barras densas. */
  tamanho?: keyof typeof TAMANHOS;
  /** Ocupa a largura do contêiner, com as opções dividindo o espaço em partes iguais. */
  bloco?: boolean;
  /** Deixa as opções quebrarem para a linha de baixo em telas estreitas (rótulos longos ou muitas opções). */
  quebrar?: boolean;
  /** Desliga a barra inteira (por exemplo, enquanto a troca anterior carrega). */
  desabilitado?: boolean;
  className?: string;
}) {
  const botoes = useRef<(HTMLButtonElement | null)[]>([]);
  const t = TAMANHOS[tamanho];
  // Roving tabindex: a ativa (ou a primeira, se o valor não está nas opções) recebe o Tab.
  const indiceDoTab = Math.max(0, opcoes.findIndex((o) => o.valor === valor));

  function aoTeclar(e: KeyboardEvent<HTMLDivElement>) {
    const atual = botoes.current.findIndex((b) => b === e.target);
    if (atual < 0) return;
    const n = opcoes.length;
    // As setas dão a volta nas pontas.
    const destinos: Record<string, number> = {
      ArrowRight: (atual + 1) % n,
      ArrowLeft: (atual - 1 + n) % n,
      Home: 0,
      End: n - 1,
    };
    const destino = destinos[e.key];
    if (destino === undefined) return;
    e.preventDefault();
    botoes.current[destino]?.focus();
  }

  return (
    // Não é role="tablist": tablist promete um tabpanel ligado a cada aba (aria-controls),
    // e aqui as opções trocam um conteúdo que o componente não conhece (a página, um
    // gráfico, o filtro de uma lista). Um grupo de botões com aria-pressed descreve o
    // que de fato acontece. As setas seguem o padrão de barra de ferramentas: movem o
    // foco, e Enter/Espaço escolhem.
    <div
      role="group"
      aria-label={rotulo}
      onKeyDown={aoTeclar}
      // Sem `quebrar`, opções que não cabem rolam na horizontal em vez de vazar da tela
      className={`${bloco ? "flex w-full" : "inline-flex max-w-full"} ${quebrar ? "flex-wrap" : "overflow-x-auto [scrollbar-width:none]"} items-center rounded-lg border border-rule bg-surface ${t.casca} ${className}`}
    >
      {opcoes.map((o, i) => {
        const ativa = o.valor === valor;
        return (
          <button
            key={o.valor}
            ref={(el) => {
              botoes.current[i] = el;
            }}
            type="button"
            aria-pressed={ativa}
            tabIndex={i === indiceDoTab ? 0 : -1}
            title={o.dica}
            disabled={desabilitado}
            onClick={() => aoMudar(o.valor)}
            className={`inline-flex cursor-pointer items-center gap-1.5 ${t.raio} font-medium whitespace-nowrap transition-colors outline-accent focus-visible:outline-2 focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 ${t.opcao} ${
              bloco ? "flex-1 justify-center" : ""
            } ${ativa ? "bg-page text-accent ring-1 ring-rule" : "text-ink-2 hover:text-ink"}`}
          >
            {o.icone}
            {o.rotulo}
            {typeof o.contador === "number" && (
              <span className={`tabular-nums ${ativa ? "text-accent" : "text-muted"}`}>{o.contador}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
