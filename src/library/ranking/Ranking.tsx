import type { ReactNode } from "react";

export type ItemDoRanking = {
  id: string;
  nome: string;
  /** Texto menor ao lado do nome: sigla, categoria, região... */
  complemento?: string;
  valor: number;
  /** Cor da barra (padrão: a cor de destaque do tema). */
  cor?: string;
  /** Linha abaixo da barra, por exemplo as notas que compõem o valor. */
  detalhe?: ReactNode;
};

const formatarPadrao = (v: number) =>
  Number.isNaN(v) ? "—" : v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/**
 * Ranking: posição, nome, barra proporcional ao valor e o número. Os itens
 * aparecem na ordem recebida (ordene antes). Os destacados ganham fundo e etiqueta.
 */
export function Ranking({
  itens,
  maximo = 100,
  destacados,
  rotuloDoDestaque = "selecionado",
  formatarValor = formatarPadrao,
}: {
  itens: ItemDoRanking[];
  /** Valor que enche a barra inteira. */
  maximo?: number;
  /** Ids a destacar. */
  destacados?: string[];
  rotuloDoDestaque?: string;
  formatarValor?: (valor: number) => string;
}) {
  const largura = (v: number) => `${Number.isNaN(v) ? 0 : Math.min(100, Math.max(0, (v / maximo) * 100))}%`;

  return (
    <ol>
      {itens.map((item, i) => {
        const destaque = destacados?.includes(item.id) ?? false;
        return (
          <li
            key={item.id}
            aria-current={destaque ? "true" : undefined}
            className={`grid grid-cols-[2.25rem_minmax(0,1fr)_4.5rem] items-center gap-4 border-t border-rule py-5 last:border-b sm:grid-cols-[3rem_minmax(0,1fr)_6rem] ${
              destaque ? "-mx-4 bg-surface px-4" : ""
            }`}
          >
            <span className={`font-display text-2xl font-bold sm:text-3xl ${i === 0 ? "text-accent" : "text-muted"}`}>
              {i + 1}
            </span>
            <div className="flex min-w-0 flex-col gap-2.5">
              <div className="flex flex-wrap items-baseline gap-x-2.5">
                <span className="font-display text-xl font-bold sm:text-2xl">{item.nome}</span>
                {item.complemento && <span className="text-sm text-muted">{item.complemento}</span>}
                {destaque && (
                  <span className="text-xs font-semibold tracking-wider text-accent uppercase">{rotuloDoDestaque}</span>
                )}
              </div>
              <div aria-hidden="true" className="h-3.5 rounded-r-sm bg-track">
                <div
                  className="h-3.5 rounded-r-sm"
                  style={{ width: largura(item.valor), background: item.cor ?? "var(--accent)" }}
                />
              </div>
              {item.detalhe && <span className="text-sm text-ink-2">{item.detalhe}</span>}
            </div>
            <span className="text-right font-display text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">
              {formatarValor(item.valor)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
