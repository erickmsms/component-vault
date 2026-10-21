"use client";

import { useEffect, useRef, type ReactNode } from "react";

function Desenho({ children }: { children: ReactNode }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

const VARIANTES = {
  vazio: {
    cor: "text-muted",
    bolha: "border-accent/25 bg-accent/10 text-accent",
    icone: (
      <Desenho>
        <path d="M3 13h5l1.5 3h5L16 13h5" />
        <path d="M5.5 5h13L21 13v6H3v-6l2.5-8z" />
      </Desenho>
    ),
  },
  busca: {
    cor: "text-muted",
    bolha: "border-rule bg-surface text-muted",
    icone: (
      <Desenho>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4M8.5 8.5l5 5m0-5-5 5" />
      </Desenho>
    ),
  },
  erro: {
    cor: "text-critical",
    bolha: "border-critical/30 bg-critical/10 text-critical",
    icone: (
      <Desenho>
        <path d="M12 3 2.5 20h19L12 3z" />
        <path d="M12 10v4M12 17.5h.01" />
      </Desenho>
    ),
  },
} as const;

const TAMANHOS = {
  sm: { caixa: "gap-1.5 px-3 py-4", icone: "[&_svg:not([class*='size-'])]:size-5" },
  md: { caixa: "gap-2 p-10", icone: "[&_svg:not([class*='size-'])]:size-6" },
  lg: { caixa: "gap-5 px-6 py-16", icone: "[&_svg:not([class*='size-'])]:size-7" },
} as const;

export type VarianteDeEstadoVazio = keyof typeof VARIANTES;

/**
 * O que mostrar quando não há o que mostrar: lista vazia, busca sem resultado
 * ou falha ao carregar. Orienta o próximo passo com uma ação (criar o primeiro
 * item, limpar os filtros, tentar de novo). Em `lg`, vira a tela inteira de um
 * erro ou de uma área vazia, com o ícone numa bolha tingida e título.
 */
export function EstadoVazio({
  titulo,
  descricao,
  variante = "vazio",
  tamanho = "md",
  icone,
  acao,
  codigo,
  rotuloDoCodigo = "Código para o suporte:",
  nivel = 2,
  focarTitulo = false,
  className = "",
}: {
  /** O que não há (ou o que deu errado). Frase curta. */
  titulo: ReactNode;
  /** Como sair daqui. Uma ou duas frases. */
  descricao?: ReactNode;
  /** `vazio` (nada criado ainda), `busca` (os filtros não acharam nada) ou `erro` (falhou ao carregar). Muda o ícone, a cor e o anúncio. */
  variante?: VarianteDeEstadoVazio;
  /** `sm` dentro de um campo ou lista curta, `md` no corpo de um cartão ou modal, `lg` ocupando a tela. */
  tamanho?: keyof typeof TAMANHOS;
  /** Substitui o ícone padrão da variante (SVG; sem classe de tamanho, acompanha o tamanho). */
  icone?: ReactNode;
  /** O que resolve o vazio: normalmente um ou dois botões. */
  acao?: ReactNode;
  /** Código para o suporte achar o erro nos registros (o digest do Next, um id de requisição). Selecionável com um clique. */
  codigo?: string;
  rotuloDoCodigo?: string;
  /** Nível do título em `lg` (nos outros tamanhos o título é um parágrafo). */
  nivel?: 1 | 2 | 3;
  /**
   * Leva o foco ao título ao aparecer (em `lg`), para quem usa teclado ou leitor de
   * tela saber que a tela trocou de conteúdo. Útil em telas de erro que substituem a página.
   */
  focarTitulo?: boolean;
  className?: string;
}) {
  const v = VARIANTES[variante];
  const t = TAMANHOS[tamanho];
  const grande = tamanho === "lg";
  const refTitulo = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (focarTitulo && grande) refTitulo.current?.focus();
  }, [focarTitulo, grande]);

  const H = `h${nivel}` as const;
  // Erro é anunciado na hora; busca sem resultado, com educação (é a resposta a uma ação).
  const papel = variante === "erro" ? "alert" : variante === "busca" ? "status" : undefined;

  return (
    <div
      role={papel}
      className={`flex flex-col items-center justify-center text-center ${t.caixa} ${
        grande ? "mx-auto max-w-lg" : "rounded-lg border border-dashed border-rule bg-surface"
      } ${className}`}
    >
      {grande ? (
        <span className={`flex size-14 items-center justify-center rounded-full border ${v.bolha} ${t.icone}`}>{icone ?? v.icone}</span>
      ) : (
        <span className={`${v.cor} ${t.icone}`}>{icone ?? v.icone}</span>
      )}

      {grande ? (
        <div className="flex flex-col gap-2">
          <H ref={refTitulo} tabIndex={focarTitulo ? -1 : undefined} className="font-display text-2xl font-bold text-ink outline-none">
            {titulo}
          </H>
          {descricao != null && <p className="leading-relaxed text-ink-2">{descricao}</p>}
        </div>
      ) : (
        <>
          <p className={`font-medium text-ink-2 ${tamanho === "sm" ? "text-sm" : ""}`}>{titulo}</p>
          {descricao != null && <p className="max-w-md text-sm text-muted">{descricao}</p>}
        </>
      )}

      {acao != null && <div className={`flex flex-wrap items-center justify-center gap-2 ${grande ? "" : "mt-2"}`}>{acao}</div>}

      {codigo && (
        <p className="text-xs text-muted">
          {rotuloDoCodigo} <span className="font-mono select-all">{codigo}</span>
        </p>
      )}
    </div>
  );
}
