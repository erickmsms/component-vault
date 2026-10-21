import type { ReactNode } from "react";

export type LinkDoRodape = { rotulo: string; href: string };

/** Rodapé discreto: um texto à esquerda (origem dos dados, período, créditos) e links à direita. */
export function Rodape({ children, links = [] }: { children: ReactNode; links?: LinkDoRodape[] }) {
  return (
    <footer className="flex flex-wrap justify-between gap-2 border-t border-rule pt-5 text-xs text-muted">
      <span>{children}</span>
      {links.length > 0 && (
        <nav className="flex flex-wrap gap-4">
          {links.map((l) => (
            <a key={l.href} className="text-accent underline-offset-4 hover:underline" href={l.href}>
              {l.rotulo}
            </a>
          ))}
        </nav>
      )}
    </footer>
  );
}
