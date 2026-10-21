"use client";

import { useId, useState, type ReactNode } from "react";
import { useSemMovimento } from "@/library/revelar/Movimento";

/** Cor do marcador da atividade. */
export type TomDaAtividade = "neutro" | "info" | "sucesso" | "alerta" | "erro";

export type AutorDaAtividade = { nome: string; imagem?: string };

export type ItemDaLinhaDoTempo = {
  id: string;
  /** Data e hora. Texto em ISO com hora ("2026-10-21T14:30:00"); só a data é lida como UTC pelo navegador. */
  quando: Date | string;
  autor?: AutorDaAtividade;
  /** O que aconteceu, depois do nome do autor ("moveu", "comentou em"). */
  acao: ReactNode;
  /** Em que aconteceu, em destaque depois da ação ("Revisar contrato"). */
  alvo?: ReactNode;
  /** Nome do que mudou, antes do "de → para" ("Etapa", "Prazo"). */
  campo?: ReactNode;
  /** Valor anterior (riscado). */
  de?: ReactNode;
  /** Valor novo. */
  para?: ReactNode;
  /** Ícone no marcador; sem ele, um ponto na cor do tom. */
  icone?: ReactNode;
  tom?: TomDaAtividade;
};

const COR_DO_TOM: Record<TomDaAtividade, string> = {
  neutro: "text-muted",
  info: "text-accent",
  sucesso: "text-success",
  alerta: "text-warning",
  erro: "text-critical",
};

const formatarDiaPadrao = (d: Date) =>
  d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const formatarHoraPadrao = (d: Date) => d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
const contarPadrao = (n: number) => (n === 1 ? "1 atividade" : `${n} atividades`);

const paraData = (v: Date | string) => (v instanceof Date ? v : new Date(v));
const chaveDoDia = (d: Date) =>
  Number.isNaN(d.getTime()) ? "invalida" : `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

/** Cor estável por nome, entre as cores de série do tema. */
function corDoNome(nome: string) {
  let soma = 0;
  for (const letra of nome) soma = (soma * 31 + letra.charCodeAt(0)) >>> 0;
  return `var(--series-${(soma % 8) + 1})`;
}

function Avatar({ autor }: { autor: AutorDaAtividade }) {
  if (autor.imagem) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- a biblioteca não depende do next/image
      <img src={autor.imagem} alt="" className="inline-block size-6 shrink-0 rounded-full object-cover align-middle" />
    );
  }
  const cor = corDoNome(autor.nome);
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs leading-none font-semibold text-ink align-middle"
      style={{ background: `color-mix(in oklab, ${cor} 28%, var(--page))` }}
    >
      {iniciais(autor.nome)}
    </span>
  );
}

function Linha({ item, hora }: { item: ItemDaLinhaDoTempo; hora: string }) {
  const data = paraData(item.quando);
  const temMudanca = item.de !== undefined || item.para !== undefined;
  return (
    <li className="relative flex gap-3 py-2.5">
      <span
        aria-hidden="true"
        className={`relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border border-rule bg-page [&_svg]:size-3.5 ${COR_DO_TOM[item.tom ?? "neutro"]}`}
      >
        {item.icone ?? <span className="size-2 rounded-full bg-current" />}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 text-sm leading-relaxed text-ink-2">
            {item.autor && (
              <span className="mr-1 inline-flex items-center gap-1.5 align-top">
                <Avatar autor={item.autor} />
                <span className="font-semibold text-ink">{item.autor.nome}</span>
              </span>
            )}
            {item.acao}
            {item.alvo && (
              <>
                {" "}
                <span className="font-medium text-ink">{item.alvo}</span>
              </>
            )}
          </p>
          <time dateTime={Number.isNaN(data.getTime()) ? undefined : data.toISOString()} className="shrink-0 pt-0.5 text-xs whitespace-nowrap text-muted tabular-nums">
            {hora}
          </time>
        </div>
        {temMudanca && (
          <p className="mt-1 text-xs text-ink-2">
            {item.campo && <span className="text-muted">{item.campo}: </span>}
            {item.de !== undefined && <del className="text-muted decoration-muted/60">{item.de}</del>}
            {item.de !== undefined && item.para !== undefined && (
              <span aria-hidden="true" className="mx-1.5 text-muted">
                →
              </span>
            )}
            {item.para !== undefined && <ins className="font-medium text-ink no-underline">{item.para}</ins>}
          </p>
        )}
      </div>
    </li>
  );
}

/** Lista com a linha vertical que liga os marcadores. */
function Lista({ children }: { children: ReactNode }) {
  return (
    <ol className="relative before:absolute before:top-4 before:bottom-4 before:left-3.5 before:w-px before:-translate-x-1/2 before:bg-rule">
      {children}
    </ol>
  );
}

/**
 * Histórico de atividades: quem fez o quê, em quê e quando, com o "de → para"
 * do que mudou. Agrupa por dia em seções que abrem e fecham (com a contagem e o
 * intervalo de horas de cada dia) e marca cada item com ícone e cor por tipo.
 *
 * Os itens aparecem na ordem recebida (normalmente do mais recente para o mais antigo).
 */
export function LinhaDoTempoDeAtividades({
  itens,
  agruparPorDia = true,
  gruposAbertos = 1,
  formatarDia = formatarDiaPadrao,
  formatarHora = formatarHoraPadrao,
  formatarContagem = contarPadrao,
  textoVazio = "Nenhuma atividade registrada.",
}: {
  itens: ItemDaLinhaDoTempo[];
  agruparPorDia?: boolean;
  /** Quantos dias começam abertos, a partir do primeiro. */
  gruposAbertos?: number;
  /** Título de cada dia. Padrão: "qua., 21 de out. de 2026". */
  formatarDia?: (data: Date) => string;
  /** Hora de cada item. Padrão: "14:30". */
  formatarHora?: (data: Date) => string;
  /** Contagem no título do dia. Padrão: "3 atividades". */
  formatarContagem?: (quantidade: number) => string;
  textoVazio?: string;
}) {
  const semMovimento = useSemMovimento();
  const idBase = useId();
  // Só guarda o que a pessoa mudou; o resto segue `gruposAbertos`.
  const [alternados, setAlternados] = useState<Record<string, boolean>>({});

  if (itens.length === 0) {
    return <p className="rounded-xl border border-dashed border-rule px-4 py-8 text-center text-sm text-muted">{textoVazio}</p>;
  }

  if (!agruparPorDia) {
    return (
      <Lista>
        {itens.map((item) => {
          const d = paraData(item.quando);
          return <Linha key={item.id} item={item} hora={`${formatarDia(d)}, ${formatarHora(d)}`} />;
        })}
      </Lista>
    );
  }

  const grupos: { chave: string; data: Date; itens: ItemDaLinhaDoTempo[] }[] = [];
  const porChave = new Map<string, (typeof grupos)[number]>();
  for (const item of itens) {
    const data = paraData(item.quando);
    const chave = chaveDoDia(data);
    const grupo = porChave.get(chave);
    if (grupo) grupo.itens.push(item);
    else {
      const novo = { chave, data, itens: [item] };
      porChave.set(chave, novo);
      grupos.push(novo);
    }
  }

  return (
    <div className="flex flex-col divide-y divide-rule rounded-xl border border-rule bg-page">
      {grupos.map((grupo, i) => {
        const aberto = alternados[grupo.chave] ?? i < gruposAbertos;
        const idPainel = `${idBase}-${grupo.chave}`;
        const horas = grupo.itens.map((it) => paraData(it.quando).getTime()).filter((t) => !Number.isNaN(t));
        const intervalo =
          horas.length > 1
            ? `${formatarHora(new Date(Math.min(...horas)))}–${formatarHora(new Date(Math.max(...horas)))}`
            : null;
        return (
          <section key={grupo.chave}>
            <h3 className="m-0">
              <button
                type="button"
                aria-expanded={aberto}
                aria-controls={idPainel}
                onClick={() => setAlternados((a) => ({ ...a, [grupo.chave]: !aberto }))}
                className="flex min-h-12 w-full cursor-pointer items-center gap-3 px-4 py-2 text-left outline-accent hover:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className={`size-4 shrink-0 text-muted ${semMovimento ? "" : "transition-transform"} ${aberto ? "rotate-90" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 6 6 6-6 6" />
                </svg>
                <span className="text-sm font-semibold text-ink first-letter:uppercase">
                  {chaveDoDia(grupo.data) === "invalida" ? "—" : formatarDia(grupo.data)}
                </span>
                {intervalo && <span className="hidden text-xs text-muted tabular-nums sm:inline">{intervalo}</span>}
                <span className="ml-auto shrink-0 text-xs text-muted">{formatarContagem(grupo.itens.length)}</span>
              </button>
            </h3>
            {/* grid-rows 0fr → 1fr anima a altura sem medir; `inert` tira o conteúdo fechado do Tab. */}
            <div
              id={idPainel}
              inert={!aberto}
              className={`grid ${semMovimento ? "" : "transition-[grid-template-rows] duration-300 ease-out"} ${aberto ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <div className="px-4 pb-2">
                  <Lista>
                    {grupo.itens.map((item) => (
                      <Linha key={item.id} item={item} hora={formatarHora(paraData(item.quando))} />
                    ))}
                  </Lista>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
