import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";

const VARIANTES = {
  padrao: "border-transparent bg-ink text-page hover:bg-ink/90",
  contorno: "border-rule-strong bg-page text-ink hover:bg-surface",
  secundario: "border-transparent bg-surface text-ink hover:bg-ink/10",
  fantasma: "border-transparent text-ink hover:bg-ink/10",
  destrutivo: "border-transparent bg-critical/10 text-critical hover:bg-critical/20",
  link: "border-transparent text-accent underline-offset-4 hover:underline",
} as const;

const TAMANHOS = {
  xs: { caixa: "h-7 px-2.5 text-xs", quadrado: "size-7" },
  sm: { caixa: "h-8 px-3 text-sm", quadrado: "size-8" },
  padrao: { caixa: "h-9 px-4 text-sm", quadrado: "size-9" },
  lg: { caixa: "h-11 px-6 text-base", quadrado: "size-11" },
} as const;

export type VarianteDoBotaoNeutro = keyof typeof VARIANTES;
export type TamanhoDoBotaoNeutro = keyof typeof TAMANHOS;

type OpcoesDeEstilo = {
  variante?: VarianteDoBotaoNeutro;
  tamanho?: TamanhoDoBotaoNeutro;
  soIcone?: boolean;
  arredondado?: boolean;
};

/**
 * Classes do botão, para dar o visual a um link: `<a className={classesDoBotaoNeutro({ variante: "contorno" })}>`.
 * Melhor que trocar o elemento do botão, porque um link continua sendo link para leitores de tela.
 */
export function classesDoBotaoNeutro({ variante = "padrao", tamanho = "padrao", soIcone = false, arredondado = false }: OpcoesDeEstilo = {}) {
  // O link é só texto: sem altura fixa nem espaçamento
  const medidas = variante === "link" ? "text-sm" : soIcone ? TAMANHOS[tamanho].quadrado : TAMANHOS[tamanho].caixa;
  return [
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 border font-medium whitespace-nowrap select-none",
    arredondado ? "rounded-full" : "rounded-lg",
    "outline-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:active:scale-[0.97]",
    "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-busy:cursor-progress",
    "[&_svg]:size-4 [&_svg]:shrink-0",
    VARIANTES[variante],
    medidas,
  ].join(" ");
}

function Girando() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" className="motion-safe:animate-spin">
      <circle cx="12" cy="12" r="9" opacity={0.25} />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  );
}

export type BotaoNeutroProps = OpcoesDeEstilo &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
    /** Tipo do botão. Padrão "button", para não enviar formulários sem querer. */
    type?: "button" | "submit" | "reset";
    /** Ícone antes do texto (ou o único conteúdo, com `soIcone`). */
    icone?: ReactNode;
    /** Ícone depois do texto. */
    iconeFinal?: ReactNode;
    /** Mostra um indicador de carga no lugar do ícone e ignora cliques, mas mantém o foco. */
    carregando?: boolean;
  };

/**
 * Botão sóbrio, de cor neutra (a variante padrão usa o tom do texto), com contorno, secundário,
 * fantasma, destrutivo e link. Tem tamanho extra pequeno, formato arredondado e versão só com
 * ícone (passe `aria-label`). Para links, use `classesDoBotaoNeutro`.
 */
export function BotaoNeutro({
  variante,
  tamanho,
  soIcone,
  arredondado,
  type = "button",
  icone,
  iconeFinal,
  carregando = false,
  onClick,
  className = "",
  children,
  ...resto
}: BotaoNeutroProps) {
  const aoClicar = (evento: MouseEvent<HTMLButtonElement>) => {
    if (carregando) {
      evento.preventDefault();
      return;
    }
    onClick?.(evento);
  };

  return (
    <button
      {...resto}
      type={type}
      aria-busy={carregando || undefined}
      onClick={aoClicar}
      className={`${classesDoBotaoNeutro({ variante, tamanho, soIcone, arredondado })} ${className}`}
    >
      {soIcone ? (
        carregando ? <Girando /> : (icone ?? children)
      ) : (
        <>
          {carregando ? <Girando /> : icone}
          {children}
          {carregando ? null : iconeFinal}
        </>
      )}
    </button>
  );
}

/**
 * Junta botões lado a lado (ou um sobre o outro) com as bordas coladas e só as pontas
 * arredondadas. Funciona melhor com `variante="contorno"` ou "secundario".
 */
export function GrupoDeBotoes({
  orientacao = "horizontal",
  rotulo,
  children,
}: {
  orientacao?: "horizontal" | "vertical";
  /** Nome do grupo para leitores de tela ("Formatação do texto"). */
  rotulo?: string;
  children: ReactNode;
}) {
  const classes =
    orientacao === "vertical"
      ? "inline-flex flex-col [&>*:not(:first-child)]:-mt-px [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none"
      : "inline-flex [&>*:not(:first-child)]:-ms-px [&>*:not(:first-child)]:rounded-s-none [&>*:not(:last-child)]:rounded-e-none";
  return (
    <div role="group" aria-label={rotulo} className={classes}>
      {children}
    </div>
  );
}
