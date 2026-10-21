import type { ReactNode } from "react";

export type BlocoDeTexto = { titulo: string; conteudo: ReactNode };

/**
 * Blocos de texto lado a lado num fundo destacado, cada um com o seu título:
 * método e limitações, perguntas frequentes, notas de rodapé de um relatório.
 * As colunas se ajustam à largura disponível.
 */
export function BlocosDeTexto({ blocos }: { blocos: BlocoDeTexto[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-8 rounded-xl bg-surface p-7 leading-relaxed md:gap-10">
      {blocos.map((b) => (
        <section key={b.titulo} className="flex flex-col gap-3">
          <h3 className="font-display text-xl font-bold">{b.titulo}</h3>
          <div>{b.conteudo}</div>
        </section>
      ))}
    </div>
  );
}
