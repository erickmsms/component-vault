"use client";

import { useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
/** Um ponto da série: `x` é uma data "AAAA-MM-DD"; `y` nulo interrompe a linha. */
export type PontoSerie = { x: string; y: number | null };

export type Serie = { nome: string; cor: string; pontos: PontoSerie[] };

/** Ponto anotado no gráfico, com título e uma linha de explicação. */
export type Anotacao = { x: string; y: number; cor: string; titulo: string; texto: string };

const MARGEM = { topo: 16, direita: 16, base: 28, esquerda: 44 };
const DIA_MS = 86_400_000;
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const paraTempo = (data: string) => Date.parse(`${data}T00:00:00Z`);
const paraData = (t: number) => new Date(t).toISOString().slice(0, 10);

/** "2026-03-01" -> "1 mar" (ou "1 mar 2026"). */
function formatarDia(data: string, comAno = false) {
  const [ano, mes, dia] = data.split("-").map(Number);
  return `${dia} ${MESES[mes - 1]}${comAno ? ` ${ano}` : ""}`;
}

/** Número no formato brasileiro; inteiros sem casas decimais. */
function formatarNumero(v: number, sinal = false) {
  const casas = Number.isInteger(v) ? 0 : 1;
  return v.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
    signDisplay: sinal ? "exceptZero" : "auto",
  });
}

function passoRedondo(bruto: number) {
  const base = 10 ** Math.floor(Math.log10(bruto));
  const f = bruto / base;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * base;
}

/** Marcas do eixo Y em passos redondos; com `incluirZero`, o eixo sempre passa pelo zero. */
function escalaY(valores: number[], incluirZero: boolean) {
  const base = incluirZero || valores.length === 0 ? [0, ...valores] : valores;
  let min = Math.min(...base);
  let max = Math.max(...base);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const passo = passoRedondo((max - min) / 5);
  const inicio = Math.floor(min / passo) * passo;
  const fim = Math.ceil(max / passo) * passo;
  const marcas: number[] = [];
  for (let v = inicio; v <= fim + passo / 2; v += passo) marcas.push(Number(v.toFixed(10)));
  return { min: inicio, max: fim, marcas };
}

/** Marcas do eixo X: datas espaçadas em passos de dias que caibam na largura. */
function marcasX(t0: number, t1: number, larguraPlot: number) {
  const dias = Math.round((t1 - t0) / DIA_MS);
  const maximo = Math.max(2, Math.floor(larguraPlot / 72));
  const passo = [1, 2, 3, 7, 14, 28, 56, 91, 182, 364].find((p) => dias / p <= maximo) ?? 364;
  const marcas: number[] = [];
  for (let t = t0; t <= t1; t += passo * DIA_MS) marcas.push(t);
  return marcas;
}

/** Trechos contínuos da série: um valor ausente interrompe a linha; um dia sem ponto, não. */
function trechos(pontos: PontoSerie[]) {
  const resultado: Array<Array<{ t: number; y: number }>> = [];
  let atual: Array<{ t: number; y: number }> = [];
  for (const p of pontos) {
    if (p.y === null) {
      if (atual.length) resultado.push(atual);
      atual = [];
    } else {
      atual.push({ t: paraTempo(p.x), y: p.y });
    }
  }
  if (atual.length) resultado.push(atual);
  return resultado;
}

function useLargura<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [largura, setLargura] = useState(720);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observador = new ResizeObserver(([entrada]) => setLargura(entrada.contentRect.width));
    observador.observe(el);
    return () => observador.disconnect();
  }, []);
  return [ref, largura] as const;
}

const HALO = { paintOrder: "stroke", stroke: "var(--page)", strokeWidth: 4, strokeLinejoin: "round" } as const;

/** Abaixo desta largura, as anotações viram marcadores numerados com o texto embaixo do gráfico. */
const LARGURA_MINIMA_ANOTACAO_INLINE = 640;

/**
 * Gráfico de linhas por dia em SVG puro: uma linha por série, legenda, valores do
 * dia ao passar o mouse (ou com as setas do teclado) e anotações opcionais.
 */
export function GraficoLinhas({
  rotulo,
  series,
  unidade = "",
  comSinal = false,
  incluirZero = true,
  formatarValor,
  anotacoes = [],
  altura = 260,
  acoes,
}: {
  /** Descrição do gráfico para leitores de tela. */
  rotulo: string;
  series: Serie[];
  /** Unidade depois do valor no balão ("°C", "mm", "pedidos"). */
  unidade?: string;
  /** Mostra "+" nos valores positivos (útil para erros e variações). */
  comSinal?: boolean;
  /** Faz o eixo Y sempre passar pelo zero. Desligue para valores longe do zero (ex.: temperaturas). */
  incluirZero?: boolean;
  /** Formatação própria do valor no balão (moeda, por exemplo); substitui unidade e comSinal. */
  formatarValor?: (valor: number) => string;
  anotacoes?: Anotacao[];
  altura?: number;
  /** Controles na linha da legenda, alinhados à direita (por exemplo, um seletor). */
  acoes?: ReactNode;
}) {
  const valorNoBalao = formatarValor ?? ((v: number) => `${formatarNumero(v, comSinal)} ${unidade}`.trim());
  const [ref, largura] = useLargura<HTMLDivElement>();
  const [ativo, setAtivo] = useState<number | null>(null);

  const desenho = useMemo(() => {
    const datas = [...new Set(series.flatMap((s) => s.pontos.map((p) => paraTempo(p.x))))].sort((a, b) => a - b);
    const valores = series.flatMap((s) => s.pontos.flatMap((p) => (p.y === null ? [] : [p.y])));
    let t0 = datas[0] ?? 0;
    let t1 = datas[datas.length - 1] ?? 0;
    if (t0 === t1) {
      t0 -= DIA_MS;
      t1 += DIA_MS;
    }
    const y = escalaY(valores, incluirZero);
    const larguraPlot = Math.max(1, largura - MARGEM.esquerda - MARGEM.direita);
    const alturaPlot = altura - MARGEM.topo - MARGEM.base;
    const px = (t: number) => MARGEM.esquerda + ((t - t0) / (t1 - t0)) * larguraPlot;
    const py = (v: number) => MARGEM.topo + ((y.max - v) / (y.max - y.min)) * alturaPlot;
    return { datas, y, px, py, marcasX: marcasX(t0, t1, larguraPlot) };
  }, [series, largura, altura, incluirZero]);

  const { datas, y, px, py } = desenho;
  const tAtivo = ativo === null ? null : (datas[ativo] ?? null);

  function aoMoverPonteiro(e: PointerEvent<SVGSVGElement>) {
    const x = e.clientX - e.currentTarget.getBoundingClientRect().left;
    let melhor = 0;
    datas.forEach((t, i) => {
      if (Math.abs(px(t) - x) < Math.abs(px(datas[melhor]) - x)) melhor = i;
    });
    setAtivo(melhor);
  }

  function aoTeclar(e: KeyboardEvent<SVGSVGElement>) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const passo = e.key === "ArrowLeft" ? -1 : 1;
    setAtivo((i) => Math.min(datas.length - 1, Math.max(0, (i ?? -passo) + passo)));
  }

  const linhasDica =
    tAtivo === null
      ? []
      : series.map((s) => ({
          ...s,
          y: s.pontos.find((p) => paraTempo(p.x) === tAtivo)?.y ?? null,
          existe: s.pontos.some((p) => paraTempo(p.x) === tAtivo),
        }));

  const descricaoAnotacoes = anotacoes.map((a) => `${a.titulo}: ${a.texto}`).join(". ");
  const anotacoesInline = largura >= LARGURA_MINIMA_ANOTACAO_INLINE;

  return (
    <figure className="m-0 flex flex-col gap-3">
      {(series.length >= 2 || acoes) && (
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
          {series.length >= 2 && (
            <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {series.map((s) => (
                <li key={s.nome} className="flex items-center gap-2">
                  <span aria-hidden className="inline-block h-[3px] w-[18px] rounded-full" style={{ background: s.cor }} />
                  {s.nome}
                </li>
              ))}
            </ul>
          )}
          {acoes && <div className="ml-auto">{acoes}</div>}
        </div>
      )}

      {/* overflow-hidden: no HTML pré-renderizado o SVG ainda tem a largura padrão, até o ResizeObserver medir. */}
      <div ref={ref} className="relative overflow-hidden">
        <svg
          width={largura}
          height={altura}
          role="img"
          aria-label={`${rotulo}. ${descricaoAnotacoes ? `${descricaoAnotacoes}. ` : ""}Use as setas para ver os valores de cada dia.`}
          tabIndex={0}
          className="block touch-none rounded outline-none select-none focus-visible:ring-2 focus-visible:ring-accent"
          onPointerMove={aoMoverPonteiro}
          onPointerLeave={() => setAtivo(null)}
          onKeyDown={aoTeclar}
          onBlur={() => setAtivo(null)}
        >
          {y.marcas.map((v) => (
            <g key={v}>
              <line
                x1={MARGEM.esquerda}
                x2={largura - MARGEM.direita}
                y1={py(v)}
                y2={py(v)}
                stroke={v === 0 ? "var(--axis)" : "var(--grid)"}
                strokeWidth={1}
              />
              <text x={MARGEM.esquerda - 8} y={py(v)} dy="0.32em" textAnchor="end" className="fill-muted text-xs tabular-nums">
                {formatarNumero(v)}
              </text>
            </g>
          ))}

          {desenho.marcasX.map((t) => (
            <text key={t} x={px(t)} y={altura - 8} textAnchor="middle" className="fill-muted text-xs">
              {formatarDia(paraData(t))}
            </text>
          ))}

          {series.map((s) =>
            trechos(s.pontos).map((trecho, i) =>
              trecho.length === 1 ? (
                <circle key={`${s.nome}-${i}`} cx={px(trecho[0].t)} cy={py(trecho[0].y)} r={4} fill={s.cor} />
              ) : (
                <polyline
                  key={`${s.nome}-${i}`}
                  points={trecho.map((p) => `${px(p.t)},${py(p.y)}`).join(" ")}
                  fill="none"
                  stroke={s.cor}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ),
            ),
          )}

          {anotacoes.map((a, i) => {
            const x = px(paraTempo(a.x));
            const yPonto = py(a.y);
            if (!anotacoesInline) {
              return (
                <g key={`${a.x}-${a.titulo}`} pointerEvents="none" aria-hidden="true">
                  <circle cx={x} cy={yPonto} r={9} fill="var(--page)" stroke={a.cor} strokeWidth={2} />
                  <text x={x} y={yPonto} dy="0.35em" textAnchor="middle" className="fill-ink text-[11px] font-bold">
                    {i + 1}
                  </text>
                </g>
              );
            }
            const aDireita = x < largura / 2;
            const tx = aDireita ? x + 12 : x - 12;
            const y1 = yPonto < altura / 2 ? yPonto + 22 : yPonto - 24;
            return (
              <g key={`${a.x}-${a.titulo}`} pointerEvents="none" aria-hidden="true">
                <circle cx={x} cy={yPonto} r={6} fill={a.cor} stroke="var(--page)" strokeWidth={2} />
                <text x={tx} y={y1} textAnchor={aDireita ? "start" : "end"} className="fill-ink text-[13px] font-semibold" style={HALO}>
                  {a.titulo}
                </text>
                <text x={tx} y={y1 + 17} textAnchor={aDireita ? "start" : "end"} className="fill-ink-2 text-[13px]" style={HALO}>
                  {a.texto}
                </text>
              </g>
            );
          })}

          {tAtivo !== null && (
            <g pointerEvents="none">
              <line
                x1={px(tAtivo)}
                x2={px(tAtivo)}
                y1={MARGEM.topo}
                y2={altura - MARGEM.base}
                stroke="var(--muted)"
                strokeWidth={1}
              />
              {linhasDica.map((s) =>
                s.y === null ? null : (
                  <circle key={s.nome} cx={px(tAtivo)} cy={py(s.y)} r={4} fill={s.cor} stroke="var(--page)" strokeWidth={2} />
                ),
              )}
            </g>
          )}
        </svg>

        {tAtivo !== null && (
          <div
            role="status"
            className="pointer-events-none absolute top-2 z-10 min-w-44 rounded-lg border border-rule bg-page px-3 py-2 text-sm shadow-md"
            style={px(tAtivo) > largura * 0.6 ? { right: largura - px(tAtivo) + 12 } : { left: px(tAtivo) + 12 }}
          >
            <div className="mb-1 font-semibold">{formatarDia(paraData(tAtivo), true)}</div>
            {linhasDica
              .filter((s) => s.existe)
              .map((s) => (
                <div key={s.nome} className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-ink-2">
                    <span aria-hidden className="inline-block h-2 w-2 rounded-full" style={{ background: s.cor }} />
                    {s.nome}
                  </span>
                  <span className="font-medium tabular-nums">{s.y === null ? "—" : valorNoBalao(s.y)}</span>
                </div>
              ))}
          </div>
        )}
      </div>

      {!anotacoesInline && anotacoes.length > 0 && (
        <ol aria-hidden="true" className="flex flex-col gap-1.5 text-sm">
          {anotacoes.map((a, i) => (
            <li key={`${a.x}-${a.titulo}`} className="flex gap-2">
              <span className="font-bold">{i + 1}.</span>
              <span>
                <span className="font-semibold">{a.titulo}:</span> <span className="text-ink-2">{a.texto}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </figure>
  );
}
