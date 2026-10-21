"use client";

import { useState } from "react";
import { desenharTabela, ordenarLinhas, proximaOrdenacao, type DesenhoDaTabela } from "./desenho";
import type { Ordenacao } from "./TabelaDados";

/**
 * A TabelaDados quando alguma coluna é ordenável: guarda a ordenação no estado.
 * Fica num arquivo "use client" à parte para a tabela sem ordenação seguir sem hooks.
 * (Constante e não `function`: a vitrine documenta só a TabelaDados.)
 */
export const TabelaOrdenavel = <T extends object>({
  ordenacaoInicial,
  ...props
}: Omit<DesenhoDaTabela<T>, "ordenacao" | "aoOrdenar"> & { ordenacaoInicial?: Ordenacao<T> }) => {
  const [ordenacao, setOrdenacao] = useState<Ordenacao<T> | null>(ordenacaoInicial ?? null);
  return desenharTabela({
    ...props,
    linhas: ordenarLinhas(props.linhas, props.colunas, ordenacao),
    ordenacao,
    aoOrdenar: (chave) => setOrdenacao((atual) => proximaOrdenacao(atual, chave)),
  });
};
