"use client";

import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import { useSemMovimento } from "@/library/revelar/Movimento";

// Quando vários esqueletos estão dentro de uma RegiaoCarregando, só ela anuncia;
// sem isso, cada peça repetiria "Carregando..." para o leitor de tela.
const DentroDeRegiao = createContext(false);

const FORMAS = {
  retangulo: { raio: "rounded-md", altura: "h-4", largura: "w-full" },
  texto: { raio: "rounded-sm", altura: "h-3", largura: "w-full" },
  circulo: { raio: "rounded-full", altura: "h-10", largura: "w-10" },
} as const;

// Sem tailwind-merge, `h-4` e `h-8` juntos não têm vencedor garantido: o tamanho
// padrão da forma só entra quando o className não traz o seu.
const TEM_ALTURA = /(^|\s)(h|size)-/;
const TEM_LARGURA = /(^|\s)(w|size)-/;

/**
 * Um bloco que pulsa no lugar do conteúdo que ainda vai chegar. Monte a FORMA do
 * conteúdo com vários deles, para a tela não pular quando os dados entrarem. O
 * tamanho vem das classes (`className="h-6 w-1/3"`, que seguem a densidade do
 * tema) ou de `largura`/`altura`. Com "reduzir movimento", fica parado.
 */
export function Esqueleto({
  forma = "retangulo",
  largura,
  altura,
  className = "",
}: {
  /** `retangulo` (h-4, largura total), `texto` (h-3, linha de texto) ou `circulo` (size-10, avatar e ícone). */
  forma?: keyof typeof FORMAS;
  /** Largura em CSS ("40%", "12rem") ou em px. Sem ela, vale a da forma ou a do `className`. */
  largura?: string | number;
  /** Altura em CSS ou em px. Sem ela, vale a da forma ou a do `className`. */
  altura?: string | number;
  className?: string;
}) {
  const semMovimento = useSemMovimento();
  const f = FORMAS[forma];
  const estilo: CSSProperties = {};
  if (largura != null) estilo.width = largura;
  if (altura != null) estilo.height = altura;
  const alturaPadrao = altura == null && !TEM_ALTURA.test(className) ? f.altura : "";
  const larguraPadrao = largura == null && !TEM_LARGURA.test(className) ? f.largura : "";
  return (
    <div
      aria-hidden="true"
      style={estilo}
      className={`shrink-0 bg-ink/10 ${f.raio} ${alturaPadrao} ${larguraPadrao} ${semMovimento ? "" : "animate-pulse"} ${className}`}
    />
  );
}

/**
 * A região que está carregando: marca `aria-busy` e dá a frase que o leitor de
 * tela ouve, já que os blocos são `aria-hidden` (sem isso a região fica muda).
 * Use para juntar vários esqueletos sob um anúncio só.
 */
export function RegiaoCarregando({
  rotulo = "Carregando...",
  children,
  className = "flex flex-col gap-4",
}: {
  /** O que está carregando, para leitores de tela ("Carregando pedidos..."). */
  rotulo?: string;
  children: ReactNode;
  /** Classes do contêiner; substituem o padrão (coluna com gap-4). */
  className?: string;
}) {
  return (
    <div aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{rotulo}</span>
      <DentroDeRegiao.Provider value={true}>{children}</DentroDeRegiao.Provider>
    </div>
  );
}

/** Cada peça pronta é uma região própria, a menos que já esteja dentro de uma. */
function Regiao({ rotulo, className, children }: { rotulo: string; className?: string; children: ReactNode }) {
  const dentro = useContext(DentroDeRegiao);
  if (dentro) return <div className={className}>{children}</div>;
  return (
    <RegiaoCarregando rotulo={rotulo} className={className}>
      {children}
    </RegiaoCarregando>
  );
}

// Larguras que variam de linha para linha, para não parecer uma grade.
const LARGURAS_DO_TITULO = ["w-5/12", "w-1/3", "w-1/2", "w-2/5", "w-4/12"];
const LARGURAS_DA_LEGENDA = ["w-1/4", "w-1/3", "w-1/5", "w-2/5", "w-1/4"];
const LARGURAS_DO_TEXTO = ["w-full", "w-11/12", "w-full", "w-10/12", "w-full", "w-9/12"];

/**
 * Linhas de esqueleto: `lista` (ícone redondo, nome, legenda e valor, com
 * divisórias) ou `texto` (um parágrafo, a última linha mais curta).
 */
export function EsqueletoLinhas({
  linhas = 4,
  variante = "lista",
  rotulo = "Carregando...",
}: {
  linhas?: number;
  variante?: "lista" | "texto";
  /** Frase para leitores de tela (ignorada dentro de uma RegiaoCarregando). */
  rotulo?: string;
}) {
  if (variante === "texto") {
    return (
      <Regiao rotulo={rotulo} className="flex flex-col gap-2.5">
        {Array.from({ length: linhas }, (_, i) => (
          <Esqueleto
            key={i}
            forma="texto"
            className={i === linhas - 1 && linhas > 1 ? "w-3/5" : LARGURAS_DO_TEXTO[i % LARGURAS_DO_TEXTO.length]}
          />
        ))}
      </Regiao>
    );
  }
  return (
    <Regiao rotulo={rotulo}>
      {Array.from({ length: linhas }, (_, i) => (
        <div key={i} className="flex items-center gap-3 border-t border-rule py-3 first:border-t-0">
          <Esqueleto forma="circulo" className="size-8" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Esqueleto forma="texto" className={`h-3.5 ${LARGURAS_DO_TITULO[i % 5]}`} />
            <Esqueleto forma="texto" className={LARGURAS_DA_LEGENDA[i % 5]} />
          </div>
          <Esqueleto forma="texto" className="h-3.5 w-16" />
        </div>
      ))}
    </Regiao>
  );
}

/** A faixa de cartões de número (KPIs) do topo de um painel: rótulo, valor grande e legenda. */
export function EsqueletoCartoes({
  cartoes = 4,
  rotulo = "Carregando indicadores...",
}: {
  cartoes?: number;
  /** Frase para leitores de tela (ignorada dentro de uma RegiaoCarregando). */
  rotulo?: string;
}) {
  return (
    <Regiao rotulo={rotulo} className="grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-4">
      {Array.from({ length: cartoes }, (_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-xl border border-rule bg-page p-5">
          <Esqueleto forma="texto" className="w-1/2" />
          <Esqueleto className="h-8 w-2/5" />
          <Esqueleto forma="texto" className="w-3/4" />
        </div>
      ))}
    </Regiao>
  );
}

const LARGURAS_DA_CELULA = ["w-3/4", "w-1/2", "w-2/3", "w-3/5"];

/**
 * A forma de uma tabela: a faixa do cabeçalho e N linhas, com a primeira coluna
 * mais larga. Diferente da lista: prometer a forma errada faz a tela pular do
 * mesmo jeito.
 */
export function EsqueletoTabela({
  colunas = 4,
  linhas = 5,
  rotulo = "Carregando tabela...",
}: {
  colunas?: number;
  linhas?: number;
  /** Frase para leitores de tela (ignorada dentro de uma RegiaoCarregando). */
  rotulo?: string;
}) {
  const grade: CSSProperties = { gridTemplateColumns: `2fr repeat(${Math.max(colunas - 1, 0)}, minmax(0, 1fr))` };
  return (
    <Regiao rotulo={rotulo} className="w-full">
      <div style={grade} className="grid items-center gap-4 border-b border-rule py-2.5">
        {Array.from({ length: colunas }, (_, c) => (
          <Esqueleto key={c} forma="texto" className={c === 0 ? "w-1/3" : "w-1/2"} />
        ))}
      </div>
      {Array.from({ length: linhas }, (_, l) => (
        <div key={l} style={grade} className="grid items-center gap-4 border-b border-rule py-3.5 last:border-b-0">
          {Array.from({ length: colunas }, (_, c) => (
            <Esqueleto key={c} forma="texto" className={`h-3.5 ${LARGURAS_DA_CELULA[(l + c) % LARGURAS_DA_CELULA.length]}`} />
          ))}
        </div>
      ))}
    </Regiao>
  );
}

/** Um cartão de gráfico: título curto e a área do desenho. */
export function EsqueletoGrafico({
  altura,
  rotulo = "Carregando gráfico...",
}: {
  /** Altura da área do gráfico em CSS ou px (padrão: h-56). */
  altura?: string | number;
  /** Frase para leitores de tela (ignorada dentro de uma RegiaoCarregando). */
  rotulo?: string;
}) {
  return (
    <Regiao rotulo={rotulo} className="flex flex-col gap-4 rounded-xl border border-rule bg-page p-5">
      <Esqueleto forma="texto" className="h-3.5 w-1/3" />
      <Esqueleto altura={altura} className={altura == null ? "h-56" : ""} />
    </Regiao>
  );
}

function Arco({ className }: { className: string }) {
  const semMovimento = useSemMovimento();
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`shrink-0 ${semMovimento ? "" : "animate-spin"} ${className}`}
      fill="none"
      strokeWidth={2.5}
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="9" className="stroke-rule" />
      <path d="M12 3a9 9 0 0 1 9 9" className="stroke-accent" />
    </svg>
  );
}

/**
 * Spinner e frase, centralizados. É a exceção, não a regra: use quando não há
 * forma a prometer (resolvendo a rota, checando permissão). Se você sabe a forma
 * do que vai aparecer, use um esqueleto.
 */
export function Carregando({ texto = "Carregando...", className = "py-16" }: { texto?: string; className?: string }) {
  return (
    <div role="status" className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Arco className="size-8" />
      <p className="text-sm text-ink-2">{texto}</p>
    </div>
  );
}

/**
 * Selo de recarga em segundo plano: o conteúdo antigo continua na tela e isto
 * diz que ele está sendo atualizado. Trocar a lista por esqueleto a cada recarga
 * pisca a tela e perde a rolagem; separe "carregando" (primeira vez) de
 * "atualizando".
 */
export function IndicadorAtualizando({ texto = "Atualizando..." }: { texto?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-1.5 text-xs whitespace-nowrap text-ink-2">
      <Arco className="size-3.5" />
      {texto}
    </span>
  );
}
