"use client";

import { useSyncExternalStore } from "react";

export type UnidadeDoPeriodo = "mes" | "semana" | "dia";

const ROTULOS = {
  mes: { anterior: "Mês anterior", proximo: "Próximo mês", ir: "Ir para o mês atual", intl: "month" },
  semana: { anterior: "Semana anterior", proximo: "Próxima semana", ir: "Ir para esta semana", intl: "week" },
  dia: { anterior: "Dia anterior", proximo: "Próximo dia", ir: "Ir para hoje", intl: "day" },
} as const;

// "Hoje" muda com o relógio: fora do servidor (null), para o HTML pré-renderizado não ficar velho
const semAssinatura = () => () => {};
const hojeNoNavegador = () => dataParaIso(new Date());
const hojeNoServidor = () => null;

const doisDigitos = (n: number) => String(n).padStart(2, "0");

/** "2026-09-15" (ou "2026-09") como data local, sem o deslize de fuso de `new Date("2026-09-15")`. */
function lerData(iso: string): Date {
  const [ano, mes = 1, dia = 1] = iso.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

/** Data local em "AAAA-MM-DD". */
export function dataParaIso(data: Date): string {
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;
}

function inicioDoPeriodo(data: Date, unidade: UnidadeDoPeriodo, inicioDaSemana: number): Date {
  if (unidade === "mes") return new Date(data.getFullYear(), data.getMonth(), 1);
  if (unidade === "dia") return new Date(data.getFullYear(), data.getMonth(), data.getDate());
  const recuo = (data.getDay() - inicioDaSemana + 7) % 7;
  return new Date(data.getFullYear(), data.getMonth(), data.getDate() - recuo);
}

/** Início do período `n` passos depois (ou antes, com n negativo). */
function somar(inicio: Date, unidade: UnidadeDoPeriodo, n: number): Date {
  if (unidade === "mes") return new Date(inicio.getFullYear(), inicio.getMonth() + n, 1);
  return new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + n * (unidade === "semana" ? 7 : 1));
}

/** Último dia do período que começa em `inicio`. */
function fimDoPeriodo(inicio: Date, unidade: UnidadeDoPeriodo): Date {
  const seguinte = somar(inicio, unidade, 1);
  return new Date(seguinte.getFullYear(), seguinte.getMonth(), seguinte.getDate() - 1);
}

const maiuscula = (texto: string) => texto.charAt(0).toLocaleUpperCase() + texto.slice(1);

// O Intl usa espaços finos/inseparáveis (U+2009, U+202F, U+00A0) em datas e intervalos, e o
// ICU do Node e o do navegador nem sempre escolhem o mesmo: sem isto o texto do servidor
// difere do cliente e a hidratação falha.
const espacosComuns = (texto: string) => texto.replace(/[   ]/g, " ");

function rotuloPadrao(inicio: Date, fim: Date, unidade: UnidadeDoPeriodo, localidade: string): string {
  if (unidade === "mes") {
    return espacosComuns(maiuscula(new Intl.DateTimeFormat(localidade, { month: "long", year: "numeric" }).format(inicio)));
  }
  if (unidade === "dia") {
    return espacosComuns(
      maiuscula(
        new Intl.DateTimeFormat(localidade, { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(
          inicio,
        ),
      ),
    );
  }
  // "14 – 20 de set. de 2026", "28 de dez. de 2026 – 3 de jan. de 2027"
  return espacosComuns(
    new Intl.DateTimeFormat(localidade, { day: "numeric", month: "short", year: "numeric" }).formatRange(inicio, fim),
  );
}

/** O rótulo em duas partes: o período em destaque e o ano, que aparece mais suave (se houver um só). */
function partesDoRotulo(inicio: Date, fim: Date, unidade: UnidadeDoPeriodo, localidade: string): { principal: string; ano?: string } {
  const ano = String(inicio.getFullYear());
  const formato = (opcoes: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(localidade, opcoes);
  if (unidade === "mes") return { principal: espacosComuns(maiuscula(formato({ month: "long" }).format(inicio))), ano };
  if (unidade === "dia") {
    return { principal: espacosComuns(maiuscula(formato({ weekday: "short", day: "numeric", month: "short" }).format(inicio))), ano };
  }
  if (inicio.getFullYear() === fim.getFullYear()) {
    return { principal: espacosComuns(formato({ day: "numeric", month: "short" }).formatRange(inicio, fim)), ano };
  }
  // A semana vira o ano: cada ponta leva o seu
  return { principal: rotuloPadrao(inicio, fim, unidade, localidade) };
}

/** Quantos períodos o mostrado está do período de hoje (0 = o atual, -1 = o anterior...). */
function periodosDeDistancia(inicio: Date, hoje: Date, unidade: UnidadeDoPeriodo, inicioDaSemana: number): number {
  const atual = inicioDoPeriodo(hoje, unidade, inicioDaSemana);
  if (unidade === "mes") return (inicio.getFullYear() - atual.getFullYear()) * 12 + inicio.getMonth() - atual.getMonth();
  const dia = 24 * 60 * 60 * 1000;
  return Math.round((inicio.getTime() - atual.getTime()) / (dia * (unidade === "semana" ? 7 : 1)));
}

function Seta({ direcao }: { direcao: "esquerda" | "direita" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d={direcao === "esquerda" ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
    </svg>
  );
}

// As setas ficam a 1 unidade da borda do controle (rounded-xl, p-1): o raio acompanha essa folga
const SETA =
  "inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-[max(var(--radius-sm),calc(var(--radius-xl)_-_var(--spacing)*1))] text-ink-2 outline-accent hover:bg-surface hover:text-accent focus-visible:outline-2 focus-visible:-outline-offset-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:bg-transparent aria-disabled:hover:text-ink-2";

/**
 * Navegação de período ‹ rótulo › por mês, semana ou dia, num controle só: o período em
 * destaque (o ano mais suave) entre as setas e, embaixo, onde ele está em relação a hoje
 * ("Há 2 semanas") com o atalho para voltar ao período atual, que só aparece quando você
 * não está nele. As setas ficam inativas nos limites (sem perder o foco) e o rótulo, em
 * português por padrão, é anunciado quando muda.
 *
 * O valor é uma data local "AAAA-MM-DD" (o mês também aceita "AAAA-MM"); qualquer
 * dia do período serve, e `aoMudar` devolve sempre o primeiro dia do período
 * escolhido (o 1º do mês, o início da semana ou o próprio dia).
 */
export function SeletorDePeriodo({
  unidade,
  valor,
  aoMudar,
  minimo,
  maximo,
  inicioDaSemana = 1,
  localidade = "pt-BR",
  comBotaoAtual = true,
  rotuloAtual,
  rotulo = "Período",
  formatarRotulo,
}: {
  unidade: UnidadeDoPeriodo;
  /** Data local "AAAA-MM-DD" de qualquer dia do período mostrado. */
  valor: string;
  /** Recebe o primeiro dia do novo período, em "AAAA-MM-DD". */
  aoMudar: (valor: string) => void;
  /** Primeiro dia que pode aparecer ("AAAA-MM-DD"); a seta de voltar para nele. */
  minimo?: string;
  /** Último dia que pode aparecer ("AAAA-MM-DD"); a seta de avançar para nele. */
  maximo?: string;
  /** Dia em que a semana começa: 0 = domingo, 1 = segunda (padrão). */
  inicioDaSemana?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Localidade das datas no rótulo (Intl). */
  localidade?: string;
  /** Mostra o atalho que volta ao período de hoje (só quando o período mostrado não é o atual). */
  comBotaoAtual?: boolean;
  /** Texto do atalho para o período atual (padrão: "Ir para o mês atual", "Ir para esta semana" ou "Ir para hoje"). */
  rotuloAtual?: string;
  /** Nome do grupo para leitores de tela. */
  rotulo?: string;
  /** Rótulo próprio do período, a partir do primeiro e do último dia. */
  formatarRotulo?: (inicio: Date, fim: Date) => string;
}) {
  const textos = ROTULOS[unidade];
  const descrever = (inicio: Date) =>
    (formatarRotulo ?? ((i: Date, f: Date) => rotuloPadrao(i, f, unidade, localidade)))(inicio, fimDoPeriodo(inicio, unidade));

  const inicio = inicioDoPeriodo(lerData(valor), unidade, inicioDaSemana);
  const anterior = somar(inicio, unidade, -1);
  const proximo = somar(inicio, unidade, 1);
  // Um período pode aparecer se encosta no intervalo [minimo, maximo]
  const limiteMinimo = minimo ? lerData(minimo).getTime() : -Infinity;
  const limiteMaximo = maximo ? lerData(maximo).getTime() : Infinity;
  const podeVoltar = fimDoPeriodo(anterior, unidade).getTime() >= limiteMinimo;
  const podeAvancar = proximo.getTime() <= limiteMaximo;

  function irParaHoje() {
    let alvo = inicioDoPeriodo(new Date(), unidade, inicioDaSemana);
    if (minimo && fimDoPeriodo(alvo, unidade).getTime() < limiteMinimo) alvo = inicioDoPeriodo(lerData(minimo), unidade, inicioDaSemana);
    if (maximo && alvo.getTime() > limiteMaximo) alvo = inicioDoPeriodo(lerData(maximo), unidade, inicioDaSemana);
    aoMudar(dataParaIso(alvo));
  }

  const hoje = useSyncExternalStore(semAssinatura, hojeNoNavegador, hojeNoServidor);
  const distancia = hoje === null ? null : periodosDeDistancia(inicio, lerData(hoje), unidade, inicioDaSemana);
  const relativo =
    distancia === null
      ? null
      : espacosComuns(maiuscula(new Intl.RelativeTimeFormat(localidade, { numeric: "auto" }).format(distancia, textos.intl)));

  const textoCompleto = descrever(inicio);
  // Com `formatarRotulo` o texto é o seu, inteiro; sem ele, o ano vai à parte e mais suave
  const partes = formatarRotulo ? { principal: textoCompleto } : partesDoRotulo(inicio, fimDoPeriodo(inicio, unidade), unidade, localidade);

  return (
    <div role="group" aria-label={rotulo} className="inline-flex flex-col items-center gap-2">
      <div className="inline-flex items-center rounded-xl border border-rule bg-page p-1">
        <button
          type="button"
          aria-label={`${textos.anterior}: ${descrever(anterior)}`}
          aria-disabled={!podeVoltar || undefined}
          onClick={() => podeVoltar && aoMudar(dataParaIso(anterior))}
          className={SETA}
        >
          <Seta direcao="esquerda" />
        </button>
        <span
          aria-live="polite"
          aria-atomic="true"
          className="mx-1 flex min-h-9 min-w-48 items-center justify-center self-stretch border-x border-rule px-4 text-center"
        >
          <span className="sr-only">{textoCompleto}</span>
          <span aria-hidden="true" className="font-display text-base font-semibold text-ink tabular-nums">
            {partes.principal}
            {partes.ano && <span className="ml-1.5 font-normal text-muted">{partes.ano}</span>}
          </span>
        </span>
        <button
          type="button"
          aria-label={`${textos.proximo}: ${descrever(proximo)}`}
          aria-disabled={!podeAvancar || undefined}
          onClick={() => podeAvancar && aoMudar(dataParaIso(proximo))}
          className={SETA}
        >
          <Seta direcao="direita" />
        </button>
      </div>
      {/* Altura reservada: o texto só aparece no navegador (depende de "hoje") e não deve empurrar nada */}
      <p className="flex min-h-5 items-center gap-2 text-xs text-muted">
        {relativo}
        {comBotaoAtual && distancia !== null && distancia !== 0 && (
          <>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={irParaHoje}
              className="cursor-pointer rounded-sm font-medium text-accent underline-offset-4 outline-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {rotuloAtual ?? textos.ir}
            </button>
          </>
        )}
      </p>
    </div>
  );
}
