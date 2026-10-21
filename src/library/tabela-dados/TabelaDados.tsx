import type { ReactNode } from "react";
import { desenharTabela } from "./desenho";
import { TabelaOrdenavel } from "./TabelaOrdenavel";

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
  /**
   * O título vira um botão que ordena pela coluna: crescente, decrescente e de
   * volta à ordem original. Números, datas e textos (em português) já se comparam;
   * valores vazios ficam no fim.
   */
  ordenavel?: boolean;
  /** Comparação própria para a ordem crescente (negativo: `a` vem antes). */
  ordenarPor?: (a: T, b: T) => number;
};

/** Coluna e direção da ordenação. */
export type Ordenacao<T> = { chave: keyof T & string; direcao: "asc" | "desc" };

/**
 * Tabela de dados tipada por colunas, com formatação brasileira e rolagem horizontal em telas estreitas.
 * Colunas podem ser ordenáveis e o cabeçalho pode ficar fixo enquanto o corpo rola.
 */
export function TabelaDados<T extends object>({
  colunas,
  linhas,
  legenda,
  larguraMinima = "40rem",
  cabecalhoFixo = false,
  alturaMaxima,
  fundoDoCabecalho = "page",
  ordenacaoInicial,
}: {
  colunas: Coluna<T>[];
  linhas: T[];
  /** Descrição da tabela para leitores de tela. */
  legenda: string;
  /** Abaixo desta largura a tabela rola na horizontal em vez de espremer as colunas. */
  larguraMinima?: string;
  /**
   * Mantém o cabeçalho no topo enquanto as linhas rolam. A tabela passa a rolar
   * dentro da própria caixa, com a altura de `alturaMaxima` (padrão: 70vh).
   */
  cabecalhoFixo?: boolean;
  /** Altura máxima da caixa ("24rem", "60vh"); acima dela, as linhas rolam dentro da tabela. */
  alturaMaxima?: string;
  /** Fundo do cabeçalho fixo: o mesmo do que está atrás da tabela, para as linhas não aparecerem por baixo. */
  fundoDoCabecalho?: "page" | "surface";
  /** Ordenação ao abrir (só vale com colunas ordenáveis). */
  ordenacaoInicial?: Ordenacao<T>;
}) {
  const desenho = { colunas, linhas, legenda, larguraMinima, cabecalhoFixo, alturaMaxima, fundoDoCabecalho };
  // Só a versão ordenável usa estado (e é client component); sem ordenação, a tabela continua sem hooks
  if (colunas.some((c) => c.ordenavel)) return <TabelaOrdenavel {...desenho} ordenacaoInicial={ordenacaoInicial} />;
  return desenharTabela(desenho);
}
