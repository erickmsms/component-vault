"use client";

import { useState, type ReactNode } from "react";
import { GraficoLinhas, type Anotacao, type Serie } from "@/library/grafico-linhas/GraficoLinhas";
import { Secao } from "@/library/secao/Secao";
import { SeletorUnico } from "@/library/seletor-unico/SeletorUnico";

export type OpcaoDoGrafico = {
  chave: string;
  /** Nome no seletor. */
  rotulo: string;
  /** Descrição do gráfico para leitores de tela (padrão: o rótulo). */
  descricao?: string;
  series: Serie[];
  unidade?: string;
  comSinal?: boolean;
  incluirZero?: boolean;
  formatarValor?: (valor: number) => string;
  anotacoes?: Anotacao[];
  /** Explicação mostrada ao lado do título enquanto esta opção está escolhida. */
  dica?: string;
};

/**
 * Seção com um gráfico de linhas e um seletor para trocar o que ele mostra
 * (receita, pedidos, ticket médio...), com um painel opcional ao lado.
 * Trocar de opção muda a escala, mas não a altura.
 */
export function GraficoComSeletor({
  titulo,
  opcoes,
  rotuloDoSeletor = "Mostrar",
  lateral,
  altura = 300,
}: {
  titulo: string;
  opcoes: OpcaoDoGrafico[];
  rotuloDoSeletor?: string;
  /** Conteúdo ao lado do gráfico em telas largas (embaixo nas estreitas). */
  lateral?: ReactNode;
  altura?: number;
}) {
  const [chave, setChave] = useState(opcoes[0]?.chave);
  const opcao = opcoes.find((o) => o.chave === chave) ?? opcoes[0];
  if (!opcao) return null;

  return (
    <Secao titulo={titulo} dica={opcao.dica}>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <div className="min-w-0 flex-1">
          <GraficoLinhas
            rotulo={opcao.descricao ?? opcao.rotulo}
            series={opcao.series}
            unidade={opcao.unidade}
            comSinal={opcao.comSinal}
            incluirZero={opcao.incluirZero}
            formatarValor={opcao.formatarValor}
            anotacoes={opcao.anotacoes}
            altura={altura}
            acoes={
              opcoes.length > 1 ? (
                <SeletorUnico
                  rotulo={rotuloDoSeletor}
                  opcoes={opcoes.map((o) => ({ valor: o.chave, rotulo: o.rotulo }))}
                  valor={opcao.chave}
                  aoEscolher={setChave}
                />
              ) : null
            }
          />
        </div>
        {lateral}
      </div>
    </Secao>
  );
}
