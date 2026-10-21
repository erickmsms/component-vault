"use client";

import { useId, type ReactNode } from "react";
import { Dica } from "@/library/dica/Dica";

/** Forma do mini gráfico: área com degradê, só a linha, ou barras. */
export type TipoDeSerie = "area" | "linha" | "barras";

/** Variação do número em relação a um período de comparação. */
export type VariacaoDoKpi = {
  /** Variação já em unidade de exibição (ex.: 12.5 para +12,5%). `null` mostra "sem comparativo". */
  valor: number | null;
  /** Formata o valor **absoluto** da variação (a direção já aparece na seta). Padrão: "12,5%". */
  formato?: (n: number) => string;
  /** Subir é bom (verde) ou ruim (vermelho)? Desligue para custos, prazos, erros... */
  positivoEhBom?: boolean;
  /** Texto depois do indicador. Padrão: "vs. período anterior". */
  rotulo?: string;
};

const formatarPercentual = (n: number) => `${n.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

// ─── Sparkline ───────────────────────────────────────────────────────────────

type Ponto = { x: number; y: number };

/** Curva suave (Catmull-Rom convertida em Bézier) passando por todos os pontos. */
function caminhoSuave(pts: Ponto[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

const valido = (v: number | null): v is number => v !== null && Number.isFinite(v);

/**
 * Mini gráfico de tendência em SVG puro (área, linha ou barras), sem eixos.
 * Valores `null` interrompem a linha (ou viram uma barra vazia).
 *
 * Com `rotulo`, o gráfico é uma imagem com descrição para leitores de tela; sem
 * ele, é tratado como decoração (use assim quando o número já está no texto ao lado).
 */
export function Sparkline({
  serie,
  tipo = "area",
  rotulo,
  cor = "var(--accent)",
  largura = 96,
  altura = 32,
}: {
  serie: (number | null)[];
  tipo?: TipoDeSerie;
  /** Descrição para leitores de tela ("Vendas em 12 meses: de 40 para 62"). Sem ela, o SVG fica oculto (decorativo). */
  rotulo?: string;
  /** Cor do traço e do preenchimento. */
  cor?: string;
  /** Largura em px. */
  largura?: number;
  /** Altura em px. */
  altura?: number;
}) {
  const idDegrade = `sparkline-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const valores = serie.filter(valido);
  const acessibilidade = rotulo ? { role: "img", "aria-label": rotulo } : { "aria-hidden": true };

  if (valores.length < 2) {
    return <svg width={largura} height={altura} className="block shrink-0" {...acessibilidade} />;
  }

  const max = Math.max(...valores);
  const min = Math.min(...valores, 0);
  const faixa = max - min || 1;

  if (tipo === "barras") {
    const passo = largura / serie.length;
    const vao = Math.min(2, passo * 0.25);
    const larguraBarra = Math.max(0.5, passo - vao);
    return (
      <svg width={largura} height={altura} viewBox={`0 0 ${largura} ${altura}`} className="block shrink-0" {...acessibilidade}>
        {serie.map((v, i) => {
          const h = valido(v) ? Math.max(2, ((v - min) / faixa) * (altura - 2)) : 2;
          return (
            <rect
              key={i}
              x={i * passo + vao / 2}
              y={altura - h}
              width={larguraBarra}
              height={h}
              rx={Math.min(larguraBarra / 2, 2)}
              fill={valido(v) ? cor : "var(--track)"}
              opacity={valido(v) ? 0.8 : 1}
            />
          );
        })}
      </svg>
    );
  }

  // Linha e área: um trecho por sequência sem buracos, com 3px de folga em cima e embaixo.
  const passoX = largura / (serie.length - 1);
  const trechos: Ponto[][] = [];
  let atual: Ponto[] = [];
  serie.forEach((v, i) => {
    if (!valido(v)) {
      if (atual.length) trechos.push(atual);
      atual = [];
      return;
    }
    atual.push({ x: i * passoX, y: altura - 3 - ((v - min) / faixa) * (altura - 6) });
  });
  if (atual.length) trechos.push(atual);

  return (
    <svg
      width={largura}
      height={altura}
      viewBox={`0 0 ${largura} ${altura}`}
      className="block shrink-0 overflow-visible"
      {...acessibilidade}
    >
      <defs>
        <linearGradient id={idDegrade} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={cor} stopOpacity={tipo === "area" ? 0.28 : 0} />
          <stop offset="100%" stopColor={cor} stopOpacity={0} />
        </linearGradient>
      </defs>
      {trechos.map((pts, i) => {
        const linha = caminhoSuave(pts);
        const ultimo = pts[pts.length - 1];
        return (
          <g key={i}>
            {tipo === "area" && pts.length > 1 && (
              <path d={`${linha} L ${ultimo.x} ${altura} L ${pts[0].x} ${altura} Z`} fill={`url(#${idDegrade})`} />
            )}
            {pts.length === 1 ? (
              <circle cx={pts[0].x} cy={pts[0].y} r={1.5} fill={cor} />
            ) : (
              <path d={linha} fill="none" stroke={cor} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Indicador de variação ───────────────────────────────────────────────────

/**
 * Seta e valor da variação, com cor pelo sentido (verde quando a mudança é boa,
 * vermelho quando é ruim) e a direção escrita para leitores de tela.
 */
export function IndicadorDeVariacao({
  valor,
  formato = formatarPercentual,
  positivoEhBom = true,
  textoSemComparativo = "sem comparativo",
  textos = { alta: "Alta de", queda: "Queda de", estavel: "Estável:" },
}: {
  /** Variação já em unidade de exibição. `null` mostra o texto de "sem comparativo". */
  valor: number | null;
  /** Formata o valor absoluto (a direção já aparece na seta). */
  formato?: (n: number) => string;
  /** Subir é bom? Desligue para custos, prazos, erros... */
  positivoEhBom?: boolean;
  textoSemComparativo?: string;
  /** Prefixos lidos só por leitores de tela, no lugar da seta. */
  textos?: { alta: string; queda: string; estavel: string };
}) {
  if (valor === null || !Number.isFinite(valor)) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <path d="M5 12h14" />
        </svg>
        {textoSemComparativo}
      </span>
    );
  }

  const sentido = valor > 0 ? "alta" : valor < 0 ? "queda" : "estavel";
  const bom = sentido === "estavel" ? null : (sentido === "alta") === positivoEhBom;
  const cor = bom === null ? "text-muted" : bom ? "text-success" : "text-critical";

  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums ${cor}`}>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {sentido === "alta" && <path d="M7 17 17 7M8 7h9v9" />}
        {sentido === "queda" && <path d="M7 7l10 10M17 8v9H8" />}
        {sentido === "estavel" && <path d="M5 12h14m-4-4 4 4-4 4" />}
      </svg>
      <span className="sr-only">{textos[sentido]} </span>
      {formato(Math.abs(valor))}
    </span>
  );
}

// ─── Cartão ──────────────────────────────────────────────────────────────────

/**
 * Cartão de indicador: rótulo com explicação opcional, número grande, ícone,
 * variação contra o período anterior, mini gráfico de tendência e um rodapé livre.
 */
export function CartaoKpi({
  rotulo,
  dica,
  valor,
  sufixo,
  icone,
  variacao,
  serie,
  tipoDeSerie = "area",
  descricaoDaSerie,
  rodape,
}: {
  rotulo: string;
  /** Explicação curta do indicador, num ícone "?" ao lado do rótulo. */
  dica?: string;
  /** Já formatado: "R$ 48,2 mil", "1.284", "92%". */
  valor: string;
  /** Texto menor na mesma linha do número: unidade ou o mesmo valor dito de outro jeito ("/ 1.500", "≈ US$ 9 mil"). */
  sufixo?: ReactNode;
  /** Ícone num quadrado com a cor de destaque, no canto superior direito. */
  icone?: ReactNode;
  variacao?: VariacaoDoKpi;
  /** Valores do mini gráfico, do mais antigo ao mais recente. `null` é um buraco. Precisa de 2 ou mais valores. */
  serie?: (number | null)[];
  tipoDeSerie?: TipoDeSerie;
  /** Descrição do mini gráfico para leitores de tela. Sem ela, o gráfico é decorativo (o número já está no texto). */
  descricaoDaSerie?: string;
  /** Linha final em texto pequeno ("Meta: 1.500", "média do time: 12"). */
  rodape?: ReactNode;
}) {
  const temSerie = serie !== undefined && serie.filter(valido).length >= 2;

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-rule bg-page p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="flex min-w-0 items-center gap-1 text-sm text-ink-2">
          <span className="truncate">{rotulo}</span>
          {dica && <Dica texto={dica} termo={rotulo} />}
        </p>
        {icone && (
          <span
            aria-hidden="true"
            className="-my-1 flex size-9 shrink-0 items-center justify-center rounded-[max(var(--radius-sm),calc(var(--radius-xl)_-_var(--spacing)*4))] bg-accent/10 text-accent [&_svg]:size-5"
          >
            {icone}
          </span>
        )}
      </div>

      <div className="flex min-h-8 items-end justify-between gap-3">
        {/* min-w-0: o número trunca em vez de empurrar o gráfico para fora do cartão. */}
        <p className="flex min-w-0 items-baseline gap-1.5">
          <span className="truncate font-display text-3xl leading-none font-semibold tracking-tight tabular-nums">{valor}</span>
          {sufixo && <span className="shrink-0 text-sm leading-none text-muted tabular-nums">{sufixo}</span>}
        </p>
        {temSerie && <Sparkline serie={serie} tipo={tipoDeSerie} rotulo={descricaoDaSerie} />}
      </div>

      {variacao && (
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <IndicadorDeVariacao valor={variacao.valor} formato={variacao.formato} positivoEhBom={variacao.positivoEhBom} />
          <span className="text-xs text-muted">{variacao.rotulo ?? "vs. período anterior"}</span>
        </p>
      )}

      {rodape && (
        <div className="flex items-center justify-between gap-2 border-t border-rule pt-3 text-xs text-muted tabular-nums">
          {rodape}
        </div>
      )}
    </div>
  );
}
