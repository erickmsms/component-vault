"use client";

import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

const formatarNumero = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

/** Fundo de uma célula: mistura a cor com o trilho conforme a intensidade (0 a 1). */
function corDaCelula(cor: string, intensidade: number) {
  return `color-mix(in oklab, ${cor} ${Math.round(intensidade * 100)}%, var(--track))`;
}

type Ativa = { linha: number; coluna: number; x: number; y: number; alinhamento: "inicio" | "meio" | "fim" };

/**
 * Mapa de calor em grade (linhas × colunas, como dias da semana × horas): a cor
 * de cada célula cresce com o valor. Mostra o valor num balão ao passar o mouse
 * ou focar, tem legenda do menor ao maior e trata células sem dado.
 *
 * Pelo teclado, a grade é um só ponto de Tab: as setas andam entre as células
 * (Home/End vão ao começo/fim da linha) e o leitor de tela lê linha, coluna e valor.
 */
export function MapaDeCalor({
  linhas,
  colunas,
  valores,
  rotuloAcessivel,
  formatarValor = formatarNumero,
  cor = "var(--accent)",
  minimo,
  maximo,
  rotuloDeColunaACada = 1,
  textoSemValor = "Sem dados",
  legenda = true,
  instrucao = "Use as setas para percorrer as células.",
}: {
  /** Rótulos das linhas, de cima para baixo ("Seg", "Ter"...). */
  linhas: string[];
  /** Rótulos das colunas, da esquerda para a direita ("0h", "1h"...). */
  colunas: string[];
  /** Uma lista por linha, um valor por coluna. `null` é célula sem dado (diferente de zero). */
  valores: (number | null)[][];
  /** Nome da grade para leitores de tela ("Acessos por dia da semana e hora"). */
  rotuloAcessivel: string;
  /** Formatação do valor no balão e na legenda ("12 acessos", "R$ 1,2 mil"). */
  formatarValor?: (valor: number) => string;
  /** Cor da intensidade máxima. */
  cor?: string;
  /** Início da escala de cor. Padrão: o menor valor ou zero, o que for menor. */
  minimo?: number;
  /** Fim da escala de cor. Padrão: o maior valor. */
  maximo?: number;
  /** Escreve o rótulo de uma coluna a cada N (ex.: 3 para horas: 0h, 3h, 6h...). Todas continuam no balão e no leitor de tela. */
  rotuloDeColunaACada?: number;
  textoSemValor?: string;
  /** Mostra a legenda de cores embaixo da grade. */
  legenda?: boolean;
  /** Dica de uso do teclado lida por leitores de tela ao entrar na grade. */
  instrucao?: string;
}) {
  const idInstrucao = useId();
  const raiz = useRef<HTMLDivElement>(null);
  const [focoGuardado, setFoco] = useState({ linha: 0, coluna: 0 });
  // Se a grade encolher, a célula com Tab volta para dentro dela.
  const foco = {
    linha: Math.max(0, Math.min(focoGuardado.linha, linhas.length - 1)),
    coluna: Math.max(0, Math.min(focoGuardado.coluna, colunas.length - 1)),
  };
  const [ativa, setAtiva] = useState<Ativa | null>(null);

  const numeros = valores.flat().filter((v): v is number => v !== null && Number.isFinite(v));
  const temValor = numeros.length > 0;
  const inicio = minimo ?? Math.min(0, ...numeros);
  const fim = maximo ?? (temValor ? Math.max(...numeros) : 1);
  const intensidade = (v: number) => (fim === inicio ? 1 : Math.min(1, Math.max(0, (v - inicio) / (fim - inicio))));
  const temVazio = linhas.some((_, l) => colunas.some((_, c) => (valores[l]?.[c] ?? null) === null));

  const valorEm = (l: number, c: number) => valores[l]?.[c] ?? null;
  const textoDoValor = (v: number | null) => (v === null ? textoSemValor : formatarValor(v));

  function mostrar(linha: number, coluna: number, celula: HTMLElement) {
    const caixa = raiz.current?.getBoundingClientRect();
    if (!caixa) return;
    const r = celula.getBoundingClientRect();
    const x = r.left + r.width / 2 - caixa.left;
    // Perto das bordas o balão se alinha à célula em vez de centralizar, para não sair da área.
    const alinhamento = x < caixa.width * 0.2 ? "inicio" : x > caixa.width * 0.8 ? "fim" : "meio";
    setAtiva({
      linha,
      coluna,
      x: alinhamento === "inicio" ? r.left - caixa.left : alinhamento === "fim" ? r.right - caixa.left : x,
      y: r.top - caixa.top,
      alinhamento,
    });
  }

  function aoTeclar(e: KeyboardEvent<HTMLTableElement>) {
    const passos: Record<string, [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    let { linha, coluna } = foco;
    if (passos[e.key]) {
      linha = Math.min(linhas.length - 1, Math.max(0, linha + passos[e.key][0]));
      coluna = Math.min(colunas.length - 1, Math.max(0, coluna + passos[e.key][1]));
    } else if (e.key === "Home") {
      coluna = 0;
      if (e.ctrlKey) linha = 0;
    } else if (e.key === "End") {
      coluna = colunas.length - 1;
      if (e.ctrlKey) linha = linhas.length - 1;
    } else if (e.key === "Escape") {
      setAtiva(null);
      return;
    } else {
      return;
    }
    e.preventDefault();
    setFoco({ linha, coluna });
    const celula = e.currentTarget.querySelector<HTMLElement>(`[data-celula="${linha}-${coluna}"]`);
    celula?.focus();
  }

  const posicaoDoBalao: CSSProperties | undefined = ativa
    ? {
        left: ativa.x,
        top: ativa.y - 6,
        transform: `translate(${ativa.alinhamento === "inicio" ? "0" : ativa.alinhamento === "fim" ? "-100%" : "-50%"}, -100%)`,
      }
    : undefined;

  return (
    <div ref={raiz} className="relative flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table
          role="grid"
          aria-label={rotuloAcessivel}
          aria-describedby={idInstrucao}
          onKeyDown={aoTeclar}
          onPointerLeave={() => setAtiva(null)}
          style={{ minWidth: `${colunas.length * 1.25 + 3}rem` }}
          className="w-full border-separate border-spacing-0.5"
        >
          <thead>
            <tr>
              <td />
              {colunas.map((c, i) => (
                <th key={`${c}-${i}`} scope="col" className="p-0 pb-1 text-center text-xs font-normal text-muted">
                  {i % rotuloDeColunaACada === 0 ? (
                    <span className="whitespace-nowrap">{c}</span>
                  ) : (
                    <span className="sr-only">{c}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhas.map((rotuloLinha, l) => (
              <tr key={`${rotuloLinha}-${l}`}>
                <th scope="row" className="w-px p-0 pr-2 text-right text-xs font-normal whitespace-nowrap text-muted">
                  {rotuloLinha}
                </th>
                {colunas.map((rotuloColuna, c) => {
                  const v = valorEm(l, c);
                  const focavel = foco.linha === l && foco.coluna === c;
                  return (
                    <td
                      key={`${rotuloColuna}-${c}`}
                      data-celula={`${l}-${c}`}
                      tabIndex={focavel ? 0 : -1}
                      onPointerEnter={(e) => mostrar(l, c, e.currentTarget)}
                      onFocus={(e) => {
                        setFoco({ linha: l, coluna: c });
                        mostrar(l, c, e.currentTarget);
                      }}
                      onBlur={() => setAtiva(null)}
                      className="h-6 rounded-sm p-0 outline-accent focus-visible:outline-2 focus-visible:outline-offset-1"
                      style={
                        v === null
                          ? { boxShadow: "inset 0 0 0 1px var(--rule)" }
                          : { background: corDaCelula(cor, intensidade(v)) }
                      }
                    >
                      <span className="sr-only">{textoDoValor(v)}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p id={idInstrucao} className="sr-only">
        {instrucao}
      </p>

      {legenda && temValor && (
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="tabular-nums">{formatarValor(inicio)}</span>
            <span aria-hidden="true" className="flex gap-0.5">
              {[0, 0.25, 0.5, 0.75, 1].map((p) => (
                <span key={p} className="size-3.5 rounded-sm" style={{ background: corDaCelula(cor, p) }} />
              ))}
            </span>
            <span className="tabular-nums">{formatarValor(fim)}</span>
          </span>
          {temVazio && (
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="size-3.5 rounded-sm" style={{ boxShadow: "inset 0 0 0 1px var(--rule)" }} />
              {textoSemValor}
            </span>
          )}
        </div>
      )}

      {ativa && (
        <div
          aria-hidden="true"
          style={posicaoDoBalao}
          className="pointer-events-none absolute z-10 rounded-lg border border-rule bg-page px-3 py-2 text-sm whitespace-nowrap shadow-flutuante"
        >
          <div className="text-xs text-muted">
            {linhas[ativa.linha]} · {colunas[ativa.coluna]}
          </div>
          <div className="font-semibold tabular-nums">{textoDoValor(valorEm(ativa.linha, ativa.coluna))}</div>
        </div>
      )}
    </div>
  );
}
