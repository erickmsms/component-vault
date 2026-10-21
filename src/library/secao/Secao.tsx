import { Termo } from "@/library/dica/Dica";

/** Seção da página: título (com tooltip opcional ao lado) e o conteúdo. */
export function Secao({ titulo, dica, children }: { titulo: string; dica?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-3xl font-bold tracking-[-0.015em]">
        {dica ? <Termo dica={dica}>{titulo}</Termo> : titulo}
      </h2>
      {children}
    </section>
  );
}
