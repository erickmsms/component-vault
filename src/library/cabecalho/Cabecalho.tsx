import type { ReactNode } from "react";

/**
 * Barra fixa no topo, com fundo translúcido: título à esquerda e ações à direita
 * (filtros, links, botões). Acompanha a rolagem da página.
 */
export function Cabecalho({
  titulo,
  children,
  larguraMaxima = "max-w-[70rem]",
}: {
  titulo: ReactNode;
  /** Ações à direita. */
  children?: ReactNode;
  /** Classe de largura do conteúdo ("max-w-none" para ocupar a tela toda). */
  larguraMaxima?: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-page/90 backdrop-blur-md">
      <div
        className={`mx-auto flex flex-col gap-2 px-6 py-3 md:flex-row md:items-center md:justify-between md:gap-3 md:py-4 ${larguraMaxima}`}
      >
        <span className="font-display text-lg font-extrabold tracking-tight">{titulo}</span>
        {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
      </div>
    </header>
  );
}
