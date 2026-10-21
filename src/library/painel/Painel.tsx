import { useId, type ReactNode, type Ref } from "react";

// Os tons de aviso tingem fundo e borda com a cor do estado, em vez de cada tela
// escrever a sua transparência.
const TONS = {
  padrao: "border-rule bg-page",
  sutil: "border-rule bg-surface",
  destaque: "border-accent/30 bg-accent/5",
  sucesso: "border-success/30 bg-success/10",
  alerta: "border-warning/30 bg-warning/10",
  perigo: "border-critical/30 bg-critical/10",
} as const;

export type TomDePainel = keyof typeof TONS;

/**
 * Cartão de conteúdo: a mesma casca (borda, fundo, raio e espaçamento) para o
 * cabeçalho de uma tela, a barra de filtros e os blocos de conteúdo, de modo que
 * as bordas de todos se alinhem. O cabeçalho (título, descrição e ações à
 * direita) é opcional. Não aceita `onClick` de propósito: um cartão clicável
 * precisa ser um `<a>` ou `<button>` para entrar na ordem do Tab.
 */
export function Painel({
  children,
  titulo,
  descricao,
  acoes,
  nivel = 2,
  tom = "padrao",
  semEspaco = false,
  como: Tag = "div",
  ref,
  className = "",
}: {
  children?: ReactNode;
  /** Título no topo do painel. Em `como="section"`, também dá nome à região. */
  titulo?: ReactNode;
  /** Uma frase abaixo do título. */
  descricao?: ReactNode;
  /** Botões ou links alinhados à direita do título. */
  acoes?: ReactNode;
  /** Nível do título (`1` no cabeçalho de uma tela). */
  nivel?: 1 | 2 | 3 | 4;
  /** `padrao`, `sutil` (fundo de superfície) ou um tom de aviso (`destaque`, `sucesso`, `alerta`, `perigo`). */
  tom?: TomDePainel;
  /**
   * Tira o espaçamento interno do conteúdo, para o que desenha as próprias bordas
   * (tabela, lista com divisórias). O cabeçalho, se houver, continua com o seu.
   */
  semEspaco?: boolean;
  /** Elemento renderizado: `section` quando o painel é uma região da página. */
  como?: "div" | "section" | "article" | "aside";
  ref?: Ref<HTMLElement>;
  className?: string;
}) {
  const idTitulo = useId();
  const H = `h${nivel}` as const;
  const temCabecalho = titulo != null || descricao != null || acoes != null;

  return (
    <Tag
      ref={ref as Ref<HTMLDivElement>}
      aria-labelledby={Tag === "section" && titulo != null ? idTitulo : undefined}
      className={`rounded-xl border ${TONS[tom]} ${semEspaco ? "overflow-hidden" : "p-5"} ${className}`}
    >
      {temCabecalho && (
        <div className={`flex flex-wrap items-start justify-between gap-x-4 gap-y-3 ${semEspaco ? "p-5" : children != null ? "mb-4" : ""}`}>
          {/* Base de 14rem: sem espaço, as ações descem para a linha de baixo em vez de espremer o título */}
          <div className="min-w-0 flex-[1_1_14rem]">
            {titulo != null && (
              <H id={idTitulo} className={`font-display font-bold text-ink ${nivel === 1 ? "text-2xl" : "text-lg"}`}>
                {titulo}
              </H>
            )}
            {descricao != null && <p className="mt-1 max-w-3xl text-sm text-ink-2">{descricao}</p>}
          </div>
          {acoes != null && <div className="flex shrink-0 flex-wrap items-center gap-2">{acoes}</div>}
        </div>
      )}
      {children}
    </Tag>
  );
}
