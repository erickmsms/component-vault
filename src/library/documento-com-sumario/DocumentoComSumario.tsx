"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Âncora estável a partir de um título: sem acentos e sem pontuação ("Uso do Site" → "uso-do-site"). */
export function ancora(titulo: string) {
  return titulo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export type BlocoDoDocumento =
  | { tipo: "paragrafo"; texto: ReactNode }
  | { tipo: "lista"; itens: ReactNode[] }
  | { tipo: "cartoes"; itens: { titulo: string; texto: ReactNode }[] }
  /** Qualquer conteúdo próprio: contatos, uma tabela, um botão. */
  | { tipo: "conteudo"; conteudo: ReactNode };

export type SecaoDoDocumento = {
  /** Título sem numeração: o número vem da ordem das seções. */
  titulo: string;
  /** Âncora da seção. Padrão: `ancora(titulo)`. */
  id?: string;
  blocos: BlocoDoDocumento[];
};

const numero = (i: number) => String(i + 1).padStart(2, "0");

const TEXTO = "text-base leading-[1.7] text-ink-2 lg:text-lg";

function Bloco({ bloco }: { bloco: BlocoDoDocumento }) {
  if (bloco.tipo === "paragrafo") return <p className={TEXTO}>{bloco.texto}</p>;

  if (bloco.tipo === "lista") {
    return (
      <ul className="space-y-3">
        {bloco.itens.map((item, i) => (
          <li key={i} className={`flex gap-3 ${TEXTO}`}>
            {/* Marcador na cor de destaque, alinhado à primeira linha */}
            <span aria-hidden className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-accent" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (bloco.tipo === "cartoes") {
    return (
      // Empilhados, e não em grade: na coluna de leitura (max-w-2xl) três
      // colunas deixariam cada cartão estreito demais
      <ul className="space-y-3">
        {bloco.itens.map((c) => (
          <li key={c.titulo} className="rounded-2xl bg-surface p-6 sm:p-7">
            <h3 className="text-base font-medium text-ink">{c.titulo}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{c.texto}</p>
          </li>
        ))}
      </ul>
    );
  }

  return <div className={TEXTO}>{bloco.conteudo}</div>;
}

/**
 * Página de documento longo (termos, privacidade, políticas, manuais): faixa de
 * abertura com link de voltar, título e data de atualização; sumário numerado
 * que fica preso ao lado do texto em telas largas e marca a seção que está
 * sendo lida; e as seções numeradas, montadas a partir de blocos tipados.
 */
export function DocumentoComSumario({
  titulo,
  atualizado,
  rotuloAtualizado = "Última atualização",
  voltar,
  rotuloSumario = "Nesta página",
  secoes,
  margemDoTopo = 0,
}: {
  titulo: ReactNode;
  /** Data já formatada ("11 de agosto de 2026"). Sem ela, a linha não aparece. */
  atualizado?: string;
  rotuloAtualizado?: string;
  /** Link acima do título ("Voltar ao início"). */
  voltar?: { rotulo: string; href: string };
  /** Título do sumário; também nomeia a navegação para leitores de tela. */
  rotuloSumario?: string;
  secoes: SecaoDoDocumento[];
  /**
   * Altura (px) de um cabeçalho fixo da página, se houver: o sumário gruda
   * abaixo dele e os links não deixam o título da seção escondido atrás dele.
   */
  margemDoTopo?: number;
}) {
  const corpo = useRef<HTMLDivElement>(null);
  const [ativa, setAtiva] = useState<string | null>(null);
  const ids = secoes.map((s) => s.id ?? ancora(s.titulo));
  const folga = margemDoTopo + 32;
  // Refaz a observação só quando as seções mudam de verdade, e não a cada array novo
  const chave = ids.join("|");

  // A seção atual é a primeira (na ordem do texto) que cruza uma faixa no alto
  // da tela, logo abaixo da folga do topo
  useEffect(() => {
    const el = corpo.current;
    if (!el) return;
    const alvos = [...el.querySelectorAll<HTMLElement>(":scope > section")];
    const cruzando = new Set<Element>();
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) cruzando.add(e.target);
          else cruzando.delete(e.target);
        }
        const primeira = alvos.find((a) => cruzando.has(a));
        if (primeira) setAtiva(primeira.id);
      },
      { rootMargin: `-${folga}px 0px -55% 0px` },
    );
    alvos.forEach((a) => observador.observe(a));
    return () => observador.disconnect();
  }, [folga, chave]);

  return (
    <article className="w-full">
      <header className="w-full bg-surface pt-16 pb-14 lg:pt-24 lg:pb-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          {voltar && (
            <a
              href={voltar.href}
              className="mb-8 inline-flex items-center gap-2 rounded-sm text-sm text-ink-2 outline-accent transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <span aria-hidden>←</span> {voltar.rotulo}
            </a>
          )}
          <h1 className="max-w-3xl font-display text-4xl leading-[1.1] font-bold tracking-[-0.01em] sm:text-5xl lg:text-6xl">
            {titulo}
          </h1>
          {atualizado && (
            <p className="mt-6 text-xs tracking-[0.14em] text-muted uppercase">
              {rotuloAtualizado}: {atualizado}
            </p>
          )}
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:px-10 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-24 lg:px-16 lg:py-24">
        <nav aria-label={rotuloSumario} className="lg:sticky lg:self-start" style={{ top: folga }}>
          <p className="text-sm font-medium text-ink">{rotuloSumario}</p>
          <ol className="mt-4 space-y-3">
            {secoes.map((s, i) => {
              const atual = ativa === ids[i];
              return (
                <li key={ids[i]} className="flex gap-3">
                  <span aria-hidden className={`mt-[0.15em] text-xs tabular-nums transition-colors ${atual ? "text-accent" : "text-muted"}`}>
                    {numero(i)}
                  </span>
                  <a
                    href={`#${ids[i]}`}
                    aria-current={atual ? "true" : undefined}
                    onClick={() => setAtiva(ids[i])}
                    className={`rounded-sm text-sm outline-accent transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      atual ? "font-medium text-ink" : "text-ink-2"
                    }`}
                  >
                    {s.titulo}
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>

        <div ref={corpo} className="max-w-2xl">
          {secoes.map((s, i) => (
            <section
              key={ids[i]}
              id={ids[i]}
              aria-labelledby={`${ids[i]}-titulo`}
              style={{ scrollMarginTop: folga }}
              className="border-t border-rule py-10 first:border-t-0 first:pt-0 lg:py-12"
            >
              <div className="flex items-baseline gap-4">
                <span aria-hidden className="text-xs text-accent tabular-nums">
                  {numero(i)}
                </span>
                <h2 id={`${ids[i]}-titulo`} className="font-display text-2xl leading-tight font-bold lg:text-3xl">
                  {s.titulo}
                </h2>
              </div>
              <div className="mt-6 space-y-5">
                {s.blocos.map((b, j) => (
                  <Bloco key={`${b.tipo}-${j}`} bloco={b} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
