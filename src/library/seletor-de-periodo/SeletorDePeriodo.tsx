"use client";

export type UnidadeDoPeriodo = "mes" | "semana" | "dia";

const ROTULOS = {
  mes: { anterior: "Mês anterior", proximo: "Próximo mês", atual: "Mês atual" },
  semana: { anterior: "Semana anterior", proximo: "Próxima semana", atual: "Esta semana" },
  dia: { anterior: "Dia anterior", proximo: "Próximo dia", atual: "Hoje" },
} as const;

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

function Seta({ direcao }: { direcao: "esquerda" | "direita" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d={direcao === "esquerda" ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
    </svg>
  );
}

const BOTAO =
  "inline-flex min-h-10 cursor-pointer items-center justify-center rounded-lg border border-rule bg-page text-sm text-ink-2 outline-accent hover:border-accent/50 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:border-rule aria-disabled:hover:text-ink-2";

/**
 * Navegação de período ‹ rótulo › por mês, semana ou dia, com botão para voltar
 * ao período atual. As setas ficam inativas nos limites (sem perder o foco) e o
 * rótulo, em português por padrão, é anunciado quando muda.
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
  /** Mostra o botão que volta ao período de hoje. */
  comBotaoAtual?: boolean;
  /** Texto do botão de voltar ao período atual (padrão: "Mês atual", "Esta semana" ou "Hoje"). */
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

  return (
    <div role="group" aria-label={rotulo} className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        aria-label={`${textos.anterior}: ${descrever(anterior)}`}
        aria-disabled={!podeVoltar || undefined}
        onClick={() => podeVoltar && aoMudar(dataParaIso(anterior))}
        className={`${BOTAO} size-10`}
      >
        <Seta direcao="esquerda" />
      </button>
      <span
        aria-live="polite"
        aria-atomic="true"
        className="inline-flex min-h-10 min-w-44 items-center justify-center rounded-lg border border-rule bg-surface px-3 text-center text-sm font-medium text-ink tabular-nums"
      >
        {descrever(inicio)}
      </span>
      <button
        type="button"
        aria-label={`${textos.proximo}: ${descrever(proximo)}`}
        aria-disabled={!podeAvancar || undefined}
        onClick={() => podeAvancar && aoMudar(dataParaIso(proximo))}
        className={`${BOTAO} size-10`}
      >
        <Seta direcao="direita" />
      </button>
      {comBotaoAtual && (
        <button type="button" onClick={irParaHoje} className={`${BOTAO} px-3 font-medium`}>
          {rotuloAtual ?? textos.atual}
        </button>
      )}
    </div>
  );
}
