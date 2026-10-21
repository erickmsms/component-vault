"use client";

import { useEffect, useRef, useState } from "react";
import { useEmTela, useSemMovimento } from "@/library/revelar/Movimento";

/** Saída suave (como o "power2.out"): rápida no começo, devagar perto do valor final. */
const suavizar = (t: number) => 1 - (1 - t) ** 2;

/**
 * Número que conta de `de` até `valor` quando entra na tela e depois fica parado.
 * É só a animação: um texto inline que herda fonte, tamanho e cor de onde for
 * usado (um título, um card, uma frase). O layout fica com quem o usa.
 *
 * O número animado é só visual (`aria-hidden`): leitores de tela recebem o valor
 * final de uma vez, num texto escondido. Uma cópia invisível do valor final
 * reserva a largura, então o texto em volta não pula durante a contagem. Com
 * "reduzir movimento" o valor final aparece direto.
 */
export function Contador({
  valor,
  de = 0,
  duracao = 1400,
  casas = 0,
  prefixo = "",
  sufixo = "",
  formatar,
  rotuloAcessivel,
  className,
}: {
  /** Valor final da contagem. */
  valor: number;
  /** Valor de onde a contagem parte. */
  de?: number;
  /** Duração (ms) da contagem. */
  duracao?: number;
  /** Casas decimais mostradas durante e no fim da contagem. */
  casas?: number;
  /** Texto antes do número ("R$ "). */
  prefixo?: string;
  /** Texto depois do número ("+", "%", " mil"). */
  sufixo?: string;
  /** Formata o número (já arredondado em `casas`). Padrão: separadores do pt-BR. */
  formatar?: (n: number) => string;
  /** O que os leitores de tela leem no lugar do número. Padrão: o valor final com prefixo e sufixo. */
  rotuloAcessivel?: string;
  /** Classes extras do número. Sem elas, herda o estilo do texto em volta. */
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const semMovimento = useSemMovimento();
  const emTela = useEmTela(ref, { margem: "0px 0px -15% 0px" });
  const [atual, setAtual] = useState(de);

  useEffect(() => {
    if (!emTela || semMovimento) return;
    let quadro = 0;
    const inicio = performance.now();
    const passo = (agora: number) => {
      const t = duracao > 0 ? Math.min((agora - inicio) / duracao, 1) : 1;
      setAtual(de + (valor - de) * suavizar(t));
      if (t < 1) quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [emTela, semMovimento, de, valor, duracao]);

  const escrever = (n: number) => {
    const arredondado = Number(n.toFixed(casas));
    const numero = formatar
      ? formatar(arredondado)
      : arredondado.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
    return `${prefixo}${numero}${sufixo}`;
  };

  const final = escrever(valor);
  const mostrado = semMovimento ? final : escrever(atual);

  return (
    <span ref={ref} className={className}>
      {/* Valor final invisível na mesma célula da grade: guarda a largura máxima. */}
      <span aria-hidden="true" className="inline-grid tabular-nums">
        <span className="invisible col-start-1 row-start-1">{final}</span>
        <span className="col-start-1 row-start-1">{mostrado}</span>
      </span>
      <span className="sr-only">{rotuloAcessivel ?? final}</span>
    </span>
  );
}
