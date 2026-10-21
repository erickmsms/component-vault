"use client";

import { useId } from "react";
import { useSemMovimento } from "@/library/revelar/Movimento";
import estilos from "./BarraDeProgresso.module.css";

// A classe de texto pinta a faixa indeterminada (currentColor); `bg-current` pinta o preenchimento.
const TONS = {
  destaque: "text-accent",
  sucesso: "text-success",
  alerta: "text-warning",
  perigo: "text-critical",
} as const;

const ESPESSURAS = { sm: "h-1.5", md: "h-2.5" } as const;

const porcentagem = (valor: number, maximo: number) => `${Math.round((valor / maximo) * 100)}%`;

/**
 * Barra de progresso. Com `valor`, é determinada (envio de arquivo, itens
 * concluídos de uma lista); sem `valor`, é indeterminada: uma faixa que corre
 * pelo trilho, para esperas que não dá para medir. Usa `role="progressbar"` com
 * os `aria-value*` do caso.
 */
export function BarraDeProgresso({
  valor,
  maximo = 100,
  rotulo,
  ocultarRotulo = false,
  mostrarValor = true,
  formatarValor = porcentagem,
  tom = "destaque",
  tamanho = "sm",
  className = "",
}: {
  /** Quanto já foi feito, de 0 a `maximo`. Omita para a barra indeterminada. */
  valor?: number;
  /** O total (100 para porcentagem, ou o número de itens). */
  maximo?: number;
  /** O que está em andamento ("Enviando arquivo..."). Aparece acima da barra e dá nome a ela. */
  rotulo: string;
  /** Esconde o rótulo da tela (continua dando nome à barra para leitores de tela). */
  ocultarRotulo?: boolean;
  /** Mostra o valor formatado à direita do rótulo (só na determinada). */
  mostrarValor?: boolean;
  /** Formata o valor mostrado e lido pelo leitor de tela. Padrão: porcentagem ("60%"); ex.: (v, m) => `${v} de ${m}`. */
  formatarValor?: (valor: number, maximo: number) => string;
  tom?: keyof typeof TONS;
  /** Espessura do trilho. */
  tamanho?: keyof typeof ESPESSURAS;
  className?: string;
}) {
  const semMovimento = useSemMovimento();
  const idRotulo = useId();
  const determinada = valor != null;
  const max = maximo > 0 ? maximo : 1;
  const atual = determinada ? Math.min(Math.max(valor, 0), max) : 0;
  const texto = determinada ? formatarValor(atual, max) : undefined;
  const valorVisivel = determinada && mostrarValor;

  const elementoDoRotulo = (
    <span id={idRotulo} className={ocultarRotulo ? "sr-only" : ""}>
      {rotulo}
    </span>
  );

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {!ocultarRotulo || valorVisivel ? (
        <div className="flex items-baseline justify-between gap-3 text-xs text-ink-2">
          {elementoDoRotulo}
          {valorVisivel && (
            // O leitor de tela já ouve o valor pelo aria-valuetext da barra.
            <span aria-hidden="true" className="ml-auto tabular-nums">
              {texto}
            </span>
          )}
        </div>
      ) : (
        elementoDoRotulo
      )}
      <div
        role="progressbar"
        aria-labelledby={idRotulo}
        aria-valuemin={determinada ? 0 : undefined}
        aria-valuemax={determinada ? max : undefined}
        aria-valuenow={determinada ? atual : undefined}
        aria-valuetext={texto}
        className={`w-full overflow-hidden rounded-full bg-track ${ESPESSURAS[tamanho]} ${TONS[tom]} ${
          determinada ? "" : `${estilos.indeterminada} ${semMovimento ? estilos.parada : ""}`
        }`}
      >
        {determinada && (
          <div
            className={`h-full rounded-full bg-current ${semMovimento ? "" : "transition-[width] duration-300 ease-out"}`}
            style={{ width: `${(atual / max) * 100}%` }}
          />
        )}
      </div>
    </div>
  );
}
