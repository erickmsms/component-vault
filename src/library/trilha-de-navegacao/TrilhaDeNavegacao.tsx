import type { ComponentType, ReactNode } from "react";

export type ItemDaTrilha = {
  rotulo: ReactNode;
  /** Para onde o item leva. Sem `href`, o item aparece como texto. */
  href?: string;
};

type PropsDoLink = { href: string; className?: string; "aria-current"?: "page"; children: ReactNode };

/**
 * Trilha com o caminho até a página atual ("Botões → Botão"), com cada parte clicável.
 * O último item é a página atual: fica em destaque e é anunciado como tal.
 */
export function TrilhaDeNavegacao({
  itens,
  separador = "→",
  rotulo = "Caminho",
  componenteDeLink: Link = "a",
}: {
  itens: ItemDaTrilha[];
  /** Símbolo entre os itens (não é lido por leitores de tela). */
  separador?: ReactNode;
  /** Nome da região para leitores de tela. */
  rotulo?: string;
  /** Componente usado nos links, como o `Link` do roteador (padrão: `<a>`). */
  componenteDeLink?: ComponentType<PropsDoLink> | "a";
}) {
  return (
    <nav aria-label={rotulo}>
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        {itens.map((item, indice) => {
          const atual = indice === itens.length - 1;
          return (
            <li key={indice} className="flex items-center gap-2">
              {indice > 0 && (
                <span aria-hidden="true" className="text-muted/70">
                  {separador}
                </span>
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  aria-current={atual ? "page" : undefined}
                  className={`rounded-sm underline-offset-4 outline-accent hover:underline focus-visible:outline-2 ${
                    atual ? "font-medium text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {item.rotulo}
                </Link>
              ) : (
                <span aria-current={atual ? "page" : undefined} className={atual ? "font-medium text-ink" : "text-muted"}>
                  {item.rotulo}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
