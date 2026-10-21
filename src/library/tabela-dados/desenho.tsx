import type { CSSProperties, ReactNode } from "react";
import { Dica, Termo } from "@/library/dica/Dica";
import type { Coluna, Ordenacao } from "./TabelaDados";

// O desenho da tabela, sem hooks: serve à TabelaDados (que continua podendo ser
// usada em Server Components) e à versão ordenável, que guarda a ordenação no estado.

const NUMERICO = new Set(["numero", "decimal", "percentual"]);

const numero = (v: number, casas: number) =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });

function formatarCelula<T>(linha: T, coluna: Coluna<T>): ReactNode {
  if (coluna.formatar) return coluna.formatar(linha);
  const valor: unknown = linha[coluna.chave];
  if (valor === null || valor === undefined) return "—";

  const tipo = coluna.tipo ?? "texto";
  if (tipo === "texto") return String(valor);
  if (typeof valor !== "number" || Number.isNaN(valor)) return "—";
  if (tipo === "percentual") return `${numero(valor, 1)}%`;

  // "numero": inteiros como estão; "decimal": 2 casas.
  const casas = tipo === "decimal" ? 2 : Number.isInteger(valor) ? 0 : 1;
  return coluna.sufixo ? `${numero(valor, casas)} ${coluna.sufixo}` : numero(valor, casas);
}

// ─── Ordenação ─────────────────────────────────────────────────────────────────

const vazio = (v: unknown) => v === null || v === undefined || (typeof v === "number" && Number.isNaN(v));

function comparar(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  return String(a).localeCompare(String(b), "pt-BR", { numeric: true, sensitivity: "base" });
}

/** Cópia das linhas na ordem pedida. Valores vazios ficam no fim nas duas direções (salvo com `ordenarPor`). */
export function ordenarLinhas<T>(linhas: T[], colunas: Coluna<T>[], ordenacao: Ordenacao<T> | null): T[] {
  const coluna = ordenacao && colunas.find((c) => c.chave === ordenacao.chave);
  if (!ordenacao || !coluna) return linhas;
  const sinal = ordenacao.direcao === "asc" ? 1 : -1;
  return [...linhas].sort((a, b) => {
    if (coluna.ordenarPor) return sinal * coluna.ordenarPor(a, b);
    const va = a[coluna.chave];
    const vb = b[coluna.chave];
    if (vazio(va) || vazio(vb)) return vazio(va) === vazio(vb) ? 0 : vazio(va) ? 1 : -1;
    return sinal * comparar(va, vb);
  });
}

/** Ciclo do clique no cabeçalho: crescente → decrescente → sem ordenação. */
export function proximaOrdenacao<T>(atual: Ordenacao<T> | null, chave: keyof T & string): Ordenacao<T> | null {
  if (atual?.chave !== chave) return { chave, direcao: "asc" };
  return atual.direcao === "asc" ? { chave, direcao: "desc" } : null;
}

function IconeDeOrdem({ direcao }: { direcao: "asc" | "desc" | null }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`size-3.5 shrink-0 ${direcao ? "text-accent" : "text-muted"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direcao === "asc" && <path d="M12 19V5m-6 6 6-6 6 6" />}
      {direcao === "desc" && <path d="M12 5v14m-6-6 6 6 6-6" />}
      {direcao === null && <path d="m8 9 4-4 4 4M8 15l4 4 4-4" />}
    </svg>
  );
}

// ─── Desenho ───────────────────────────────────────────────────────────────────

export type DesenhoDaTabela<T> = {
  colunas: Coluna<T>[];
  linhas: T[];
  legenda: string;
  larguraMinima: string;
  cabecalhoFixo: boolean;
  alturaMaxima?: string;
  fundoDoCabecalho: "page" | "surface";
  /** Só na versão ordenável. */
  ordenacao?: Ordenacao<T> | null;
  aoOrdenar?: (chave: keyof T & string) => void;
};

export function desenharTabela<T extends object>({
  colunas,
  linhas,
  legenda,
  larguraMinima,
  cabecalhoFixo,
  alturaMaxima,
  fundoDoCabecalho,
  ordenacao,
  aoOrdenar,
}: DesenhoDaTabela<T>) {
  // O cabeçalho só gruda se a própria caixa rolar na vertical: a rolagem horizontal
  // dela já impede que ele grude no topo da página.
  const limite = alturaMaxima ?? (cabecalhoFixo ? "70vh" : undefined);

  return (
    // -mr-3/pr-3: o ícone de explicação da última coluna tem uma área de toque que passa 12 px da borda
    // direita; sem essa folga ela contaria como conteúdo e apareceria uma rolagem horizontal à toa.
    <div className={`-mr-3 pr-3 ${limite ? "overflow-auto" : "overflow-x-auto"}`} style={limite ? { maxHeight: limite } : undefined}>
      <table
        style={{ minWidth: larguraMinima } as CSSProperties}
        className="w-full border-collapse text-base tabular-nums"
      >
        <caption className="sr-only">{legenda}</caption>
        <thead>
          <tr>
            {colunas.map((c) => {
              const numerico = NUMERICO.has(c.tipo ?? "texto");
              const direcao = ordenacao?.chave === c.chave ? ordenacao.direcao : null;
              const ordenavel = c.ordenavel && aoOrdenar;
              return (
                <th
                  key={c.chave}
                  scope="col"
                  aria-sort={direcao === "asc" ? "ascending" : direcao === "desc" ? "descending" : undefined}
                  className={`px-3 py-2.5 text-xs font-semibold whitespace-nowrap text-ink-2 first:pl-0 last:pr-0 ${
                    numerico ? "text-right" : "text-left"
                  } ${
                    // Fixo, a linha de baixo vira sombra: com border-collapse a borda não acompanha a célula
                    cabecalhoFixo
                      ? `sticky top-0 z-10 shadow-[inset_0_-2px_0_var(--color-rule-strong)] ${fundoDoCabecalho === "surface" ? "bg-surface" : "bg-page"}`
                      : "border-b-2 border-rule-strong"
                  }`}
                >
                  {ordenavel ? (
                    // O botão de verdade (e não um onClick no th) entra no Tab e responde a Enter/Espaço
                    // Em colunas numéricas a seta vai antes do título, que fica rente à direita como os números
                    <span className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => aoOrdenar(c.chave)}
                        className={`-mx-1 inline-flex cursor-pointer items-center gap-1 rounded-sm px-1 font-semibold outline-accent hover:text-ink focus-visible:outline-2 ${
                          numerico ? "flex-row-reverse" : ""
                        } ${direcao ? "text-ink" : ""}`}
                      >
                        {c.titulo}
                        <IconeDeOrdem direcao={direcao} />
                      </button>
                      {c.dica && <Dica texto={c.dica} termo={c.titulo} />}
                    </span>
                  ) : c.dica ? (
                    <Termo dica={c.dica}>{c.titulo}</Termo>
                  ) : (
                    c.titulo
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha, i) => (
            <tr key={i} className="border-b border-rule">
              {colunas.map((c, j) => {
                const Celula = j === 0 ? "th" : "td";
                return (
                  <Celula
                    key={c.chave}
                    scope={j === 0 ? "row" : undefined}
                    className={`px-3 py-3 align-top whitespace-nowrap first:pl-0 last:pr-0 ${
                      NUMERICO.has(c.tipo ?? "texto") ? "text-right" : "text-left"
                    } ${j === 0 ? "font-semibold" : "font-normal"}`}
                  >
                    {formatarCelula(linha, c)}
                  </Celula>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
