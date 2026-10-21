import { Termo } from "@/library/dica/Dica";

export type Indicador = {
  rotulo: string;
  /** Já formatado: "+0,22", "3,2%". */
  valor: string;
  /** Leitura do número em palavras. */
  descricao?: string;
};

/** Coluna de indicadores: rótulo, número grande e uma leitura curta de cada um. Cabe ao lado de um gráfico. */
export function ListaDeIndicadores({
  titulo,
  dica,
  itens,
}: {
  titulo?: string;
  /** Explicação mostrada num tooltip ao lado do título. */
  dica?: string;
  itens: Indicador[];
}) {
  return (
    <aside aria-label={titulo} className="flex flex-col gap-4 lg:w-64 lg:shrink-0">
      {titulo && (
        <h3 className="font-display text-lg font-bold">{dica ? <Termo dica={dica}>{titulo}</Termo> : titulo}</h3>
      )}
      <ul className="border-t-2 border-rule-strong">
        {itens.map((item) => (
          <li key={item.rotulo} className="flex flex-col gap-1 border-b border-rule py-4 last:border-b-0">
            <span className="text-[13px] font-semibold text-ink-2">{item.rotulo}</span>
            <span className="font-display text-4xl leading-none font-extrabold tracking-[-0.03em] tabular-nums">
              {item.valor}
            </span>
            {item.descricao && <span className="text-sm leading-snug text-ink-2">{item.descricao}</span>}
          </li>
        ))}
      </ul>
    </aside>
  );
}
