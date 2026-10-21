import type { CSSProperties, ReactNode } from "react";
import { Termo } from "@/library/dica/Dica";

export type Coluna<T> = {
  chave: keyof T & string;
  titulo: string;
  /** Define o alinhamento e a formatação padrão (padrão: "texto"). */
  tipo?: "texto" | "numero" | "decimal" | "percentual";
  /** Unidade depois do número ("°C", "mm", "kg"). */
  sufixo?: string;
  /** Explicação do termo, mostrada num tooltip ao lado do título. */
  dica?: string;
  /** Formatação própria da célula, no lugar da padrão do tipo. */
  formatar?: (linha: T) => ReactNode;
};

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

/** Tabela de dados tipada por colunas, com formatação brasileira e rolagem horizontal em telas estreitas. */
export function TabelaDados<T extends object>({
  colunas,
  linhas,
  legenda,
  larguraMinima = "40rem",
}: {
  colunas: Coluna<T>[];
  linhas: T[];
  /** Descrição da tabela para leitores de tela. */
  legenda: string;
  /** Abaixo desta largura a tabela rola na horizontal em vez de espremer as colunas. */
  larguraMinima?: string;
}) {
  return (
    // -mr-3/pr-3: o ícone de explicação da última coluna tem uma área de toque que passa 12 px da borda
    // direita; sem essa folga ela contaria como conteúdo e apareceria uma rolagem horizontal à toa.
    <div className="-mr-3 overflow-x-auto pr-3">
      <table
        style={{ minWidth: larguraMinima } as CSSProperties}
        className="w-full border-collapse text-base tabular-nums"
      >
        <caption className="sr-only">{legenda}</caption>
        <thead>
          <tr>
            {colunas.map((c) => (
              <th
                key={c.chave}
                scope="col"
                className={`border-b-2 border-rule-strong px-3 py-2.5 text-xs font-semibold whitespace-nowrap text-ink-2 first:pl-0 last:pr-0 ${
                  NUMERICO.has(c.tipo ?? "texto") ? "text-right" : "text-left"
                }`}
              >
                {c.dica ? <Termo dica={c.dica}>{c.titulo}</Termo> : c.titulo}
              </th>
            ))}
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
