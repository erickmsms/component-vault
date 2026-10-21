"use client";

import type { CSSProperties, ReactNode } from "react";

// Duas regras por tom: fundo tingido (suave) ou só a borda (contorno). O texto vai
// sempre na cor cheia; o neutro usa a tinta a 10% porque um cinza claro sobre o
// fundo cinza de um cartão não se distingue.
const TONS = {
  neutro: { suave: "border-transparent bg-ink/10 text-ink-2", contorno: "border-rule-strong text-ink-2" },
  destaque: { suave: "border-transparent bg-accent/15 text-accent", contorno: "border-accent/60 text-accent" },
  sucesso: { suave: "border-transparent bg-success/15 text-success", contorno: "border-success/60 text-success" },
  alerta: { suave: "border-transparent bg-warning/15 text-warning", contorno: "border-warning/60 text-warning" },
  perigo: { suave: "border-transparent bg-critical/15 text-critical", contorno: "border-critical/60 text-critical" },
} as const;

export type TomDeEtiqueta = keyof typeof TONS;

/**
 * Selo de status ("Concluído", "Atrasado", "Rascunho"): texto curto numa pílula
 * tingida pela cor do tom, com ponto ou ícone opcionais. Não é clicável; para um
 * filtro que liga e desliga, use o `Chip`.
 */
export function Etiqueta({
  children,
  tom = "neutro",
  variante = "suave",
  ponto = false,
  icone,
  maiuscula = false,
  cor,
  title,
  className = "",
}: {
  children: ReactNode;
  /**
   * O que a cor diz, não que cor usar: `perigo` = não siga (bloqueado, recusado);
   * `alerta` = olhe isto (precisa de atenção, mas não bloqueia); `sucesso` =
   * concluído, aprovado; `destaque` = informativo, em andamento.
   */
  tom?: TomDeEtiqueta;
  /** `suave` (fundo tingido) ou `contorno` (só a borda, para listas com muitos selos). */
  variante?: "suave" | "contorno";
  /** Ponto na cor do tom antes do texto. */
  ponto?: boolean;
  /** Ícone antes do texto (SVG; sem classe de tamanho, fica com size-3.5). Substitui o ponto. */
  icone?: ReactNode;
  /** Caixa alta com espaçamento: liga em rótulo de estado, desliga em nome próprio. */
  maiuscula?: boolean;
  /**
   * Cor vinda do dado (a cor de uma categoria, `var(--series-3)`), no lugar do tom.
   * O fundo e a borda saem dela, misturados com transparência.
   */
  cor?: string;
  /** Texto completo ao passar o mouse (para selos cortados ou abreviados). */
  title?: string;
  className?: string;
}) {
  const estiloDaCor: CSSProperties | undefined = cor
    ? {
        color: cor,
        backgroundColor: variante === "suave" ? `color-mix(in oklab, ${cor} 15%, transparent)` : undefined,
        borderColor: variante === "contorno" ? `color-mix(in oklab, ${cor} 60%, transparent)` : "transparent",
      }
    : undefined;

  return (
    <span
      title={title}
      style={estiloDaCor}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 ${
        maiuscula ? "tracking-wide uppercase" : ""
      } ${cor ? "" : TONS[tom][variante]} ${className}`}
    >
      {icone ?? (ponto && <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />)}
      {children}
    </span>
  );
}

/**
 * Pílula clicável de filtro, que liga e desliga um recorte da lista. É um
 * `<button>` com `aria-pressed`, então entra na ordem do Tab e o leitor de tela
 * diz se o filtro está ligado. O ligado mostra um ✓ além da cor.
 */
export function Chip({
  children,
  ativo,
  aoAlternar,
  cor,
  desabilitado = false,
  title,
  className = "",
}: {
  children: ReactNode;
  /** Se o filtro está ligado. Componente controlado. */
  ativo: boolean;
  /** Recebe o novo estado (o contrário de `ativo`). */
  aoAlternar: (ativo: boolean) => void;
  /** Cor da categoria (`var(--series-2)`), num ponto antes do texto. */
  cor?: string;
  desabilitado?: boolean;
  title?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={() => aoAlternar(!ativo)}
      disabled={desabilitado}
      title={title}
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-sm whitespace-nowrap transition-colors outline-accent focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        ativo ? "border-accent bg-accent/10 text-ink" : "border-rule bg-surface text-ink-2 hover:border-rule-strong hover:text-ink"
      } ${className}`}
    >
      {ativo && (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="-ml-0.5 size-3.5 shrink-0 text-accent"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      )}
      {cor && <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ backgroundColor: cor }} />}
      {children}
    </button>
  );
}

const TONS_DO_CONTADOR = {
  destaque: "bg-accent text-page",
  alerta: "bg-warning text-page",
  perigo: "bg-critical text-page",
  neutro: "bg-ink/10 text-ink-2",
} as const;

/**
 * Contador numérico (o "3" do sino, o "12" de uma coluna): cápsula de largura
 * mínima, número centralizado, e "9+" acima do máximo. Zero não desenha nada:
 * uma pastilha "0" ocupa espaço para dizer que não há o que ver.
 */
export function ContadorNumerico({
  valor,
  maximo = 9,
  tom = "perigo",
  rotulo,
  className = "",
}: {
  valor: number;
  /** Teto antes de virar "N+". */
  maximo?: number;
  tom?: keyof typeof TONS_DO_CONTADOR;
  /**
   * Texto para leitores de tela no lugar do número ("12 notificações não lidas").
   * Sem ele, o número é lido sozinho; o "9+" esconde o valor real.
   */
  rotulo?: string;
  className?: string;
}) {
  if (!valor || valor < 1) return null;
  const texto = valor > maximo ? `${maximo}+` : String(valor);
  return (
    <span
      className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs leading-none font-semibold tabular-nums ${TONS_DO_CONTADOR[tom]} ${className}`}
    >
      {rotulo ? (
        <>
          <span aria-hidden="true">{texto}</span>
          <span className="sr-only">{rotulo}</span>
        </>
      ) : (
        texto
      )}
    </span>
  );
}
