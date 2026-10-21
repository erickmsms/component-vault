import type { AnchorHTMLAttributes, ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";

const VARIANTES = {
  primario: "border-transparent bg-accent text-page hover:bg-accent/90",
  secundario: "border-transparent bg-ink/10 text-ink hover:bg-ink/15",
  terciario: "border-transparent bg-accent/10 text-accent hover:bg-accent/20",
  contorno: "border-rule-strong text-ink hover:bg-ink/5",
  fantasma: "border-transparent text-ink hover:bg-ink/10",
  perigo: "border-transparent bg-critical text-page hover:bg-critical/90",
  "perigo-suave": "border-transparent bg-critical/10 text-critical hover:bg-critical/20",
  link: "border-transparent text-accent underline-offset-4 hover:underline",
} as const;

const TAMANHOS = {
  xs: { caixa: "h-7 px-2.5 text-xs", quadrado: "size-7" },
  sm: { caixa: "h-8 px-3 text-xs", quadrado: "size-8" },
  md: { caixa: "h-10 px-4 text-sm", quadrado: "size-10" },
  lg: { caixa: "h-12 px-6 text-base", quadrado: "size-12" },
} as const;

export type VarianteDoBotao = keyof typeof VARIANTES;
export type TamanhoDoBotao = keyof typeof TAMANHOS;

type OpcoesDeEstilo = {
  variante?: VarianteDoBotao;
  tamanho?: TamanhoDoBotao;
  larguraTotal?: boolean;
  soIcone?: boolean;
  /** Cantos totalmente redondos (formato de pílula). */
  arredondado?: boolean;
};

/**
 * Classes do botão, para dar o mesmo visual a outro elemento (um `<Link>` do roteador,
 * por exemplo): `<Link className={classesDoBotao({ variante: "contorno" })}>`.
 */
export function classesDoBotao({
  variante = "primario",
  tamanho = "md",
  larguraTotal = false,
  soIcone = false,
  arredondado = false,
}: OpcoesDeEstilo = {}) {
  // O link é só texto: sem altura fixa nem espaçamento (a não ser que seja só ícone)
  const medidas = soIcone ? TAMANHOS[tamanho].quadrado : variante === "link" ? "text-sm" : TAMANHOS[tamanho].caixa;
  return [
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 border font-medium whitespace-nowrap select-none",
    "outline-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:active:scale-[0.97]",
    "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-busy:cursor-progress",
    "[&_svg]:size-4 [&_svg]:shrink-0",
    arredondado ? "rounded-full" : "rounded-lg",
    VARIANTES[variante],
    medidas,
    larguraTotal ? "w-full" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function Girando() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" className="motion-safe:animate-spin">
      <circle cx="12" cy="12" r="9" opacity={0.25} />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  );
}

export type BotaoProps = OpcoesDeEstilo &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
    /** Com `href`, vira um link (`<a>`) com o visual de botão. */
    href?: string;
    /** Abre o link em nova aba (com rel="noopener noreferrer"). Só vale com `href`. */
    novaAba?: boolean;
    /** Tipo do botão. Padrão "button", para não enviar formulários sem querer. */
    type?: "button" | "submit" | "reset";
    /** Ícone antes do texto. */
    icone?: ReactNode;
    /** Ícone depois do texto. */
    iconeFinal?: ReactNode;
    /** Mostra um indicador de carga no lugar do ícone e ignora cliques, mas mantém o foco. */
    carregando?: boolean;
    /** Texto no lugar de `children` enquanto carrega ("Enviando..."). */
    textoCarregando?: ReactNode;
  };

/**
 * Botão com oito variantes (primário, secundário, terciário, contorno, fantasma, perigo,
 * perigo suave e link), quatro tamanhos, formato arredondado, versão só com ícone e estado de carregamento. Com `href`
 * vira link. Quando só há ícone, passe `aria-label`.
 */
export function Botao({
  variante,
  tamanho,
  larguraTotal,
  soIcone,
  arredondado,
  href,
  novaAba,
  type = "button",
  icone,
  iconeFinal,
  carregando = false,
  textoCarregando,
  disabled,
  onClick,
  className = "",
  children,
  ...resto
}: BotaoProps) {
  const classes = `${classesDoBotao({ variante, tamanho, larguraTotal, soIcone, arredondado })} ${className}`;
  const conteudo = soIcone ? (
    // Só ícone: o ícone pode vir em `icone` ou em `children`
    carregando ? <Girando /> : (icone ?? children)
  ) : (
    <>
      {carregando ? <Girando /> : icone}
      {carregando && textoCarregando !== undefined ? textoCarregando : children}
      {carregando ? null : iconeFinal}
    </>
  );
  // Carregando: não envia nem clica, mas o botão continua focável (sem "sumir" para o teclado)
  const aoClicar = (evento: MouseEvent<HTMLButtonElement>) => {
    if (carregando) {
      evento.preventDefault();
      return;
    }
    onClick?.(evento);
  };

  if (href !== undefined) {
    return (
      <a
        {...(resto as AnchorHTMLAttributes<HTMLAnchorElement>)}
        href={disabled ? undefined : href}
        target={novaAba ? "_blank" : undefined}
        rel={novaAba ? "noopener noreferrer" : undefined}
        aria-disabled={disabled || undefined}
        aria-busy={carregando || undefined}
        onClick={aoClicar as unknown as AnchorHTMLAttributes<HTMLAnchorElement>["onClick"]}
        className={classes}
      >
        {conteudo}
      </a>
    );
  }

  return (
    <button {...resto} type={type} disabled={disabled} aria-busy={carregando || undefined} onClick={aoClicar} className={classes}>
      {conteudo}
    </button>
  );
}
