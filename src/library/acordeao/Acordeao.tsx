"use client";

import { useId, useState, type ReactNode } from "react";
import { useSemMovimento } from "@/library/revelar/Movimento";

export type ItemDoAcordeao = {
  titulo: ReactNode;
  conteudo: ReactNode;
  /** Linha menor abaixo do título (resumo, motivo, data...). */
  subtitulo?: ReactNode;
  /**
   * Lado direito do cabeçalho: valores, selos ou botões. Clicar em texto aqui
   * também abre o item; links e botões dentro dele continuam funcionando.
   */
  extra?: ReactNode;
  desativado?: boolean;
};

/**
 * Lista de itens que abrem e fecham (um de cada vez ou vários), com altura
 * animada e o padrão de acessibilidade de acordeão: título num botão dentro de um
 * heading, aria-expanded e aria-controls. Fechado, o conteúdo fica inerte (fora do
 * Tab e dos leitores de tela). Com "reduzir movimento", abre sem animação.
 */
export function Acordeao({
  itens,
  modo = "varios",
  abertosIniciais = [],
  aparencia = "linhas",
  nivelDoTitulo = 3,
}: {
  itens: ItemDoAcordeao[];
  /** "um": abrir um item fecha o que estava aberto. */
  modo?: "um" | "varios";
  /** Índices dos itens que começam abertos (no modo "um", vale só o primeiro). */
  abertosIniciais?: number[];
  /** "linhas": itens separados por linhas; "cartoes": cada item numa caixa com borda. */
  aparencia?: "linhas" | "cartoes";
  /** Nível do heading que envolve cada título, para encaixar na hierarquia da página. */
  nivelDoTitulo?: 2 | 3 | 4 | 5 | 6;
}) {
  const id = useId();
  const semMovimento = useSemMovimento();
  const [abertos, setAbertos] = useState<number[]>(() =>
    modo === "um" ? abertosIniciais.slice(0, 1) : abertosIniciais,
  );
  const Titulo = `h${nivelDoTitulo}` as const;
  const cartoes = aparencia === "cartoes";

  const alternar = (indice: number) =>
    setAbertos((atual) => {
      if (atual.includes(indice)) return atual.filter((i) => i !== indice);
      return modo === "um" ? [indice] : [...atual, indice];
    });

  return (
    <div className={cartoes ? "flex w-full flex-col gap-3" : "w-full divide-y divide-rule border-y border-rule"}>
      {itens.map((item, indice) => {
        const aberto = abertos.includes(indice);
        const idBotao = `${id}-botao-${indice}`;
        const idPainel = `${id}-painel-${indice}`;
        return (
          <div key={indice} className={cartoes ? "overflow-hidden rounded-xl border border-rule bg-page" : ""}>
            {/* O botão cobre a linha inteira (after:inset-0); o extra fica por cima só nos elementos clicáveis */}
            <div
              className={`relative flex items-center gap-3 transition-colors ${cartoes ? "px-4 py-3" : "px-2 py-3"} ${
                aberto || cartoes ? "bg-surface" : "hover:bg-surface/60"
              }`}
            >
              <Titulo className="min-w-0 flex-1 text-base font-normal">
                <button
                  id={idBotao}
                  type="button"
                  aria-expanded={aberto}
                  aria-controls={idPainel}
                  disabled={item.desativado}
                  onClick={() => alternar(indice)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-sm text-left outline-accent after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className={`size-4 shrink-0 text-muted ${semMovimento ? "" : "transition-transform duration-200"} ${aberto ? "rotate-90" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink">{item.titulo}</span>
                    {item.subtitulo && <span className="mt-0.5 block text-sm text-ink-2">{item.subtitulo}</span>}
                  </span>
                </button>
              </Titulo>
              {item.extra && (
                <div className="pointer-events-none relative flex shrink-0 items-center gap-2 text-sm text-ink-2 [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_input]:pointer-events-auto [&_label]:pointer-events-auto [&_select]:pointer-events-auto">
                  {item.extra}
                </div>
              )}
            </div>
            {/* Altura animada sem medir: a linha da grade vai de 0fr a 1fr */}
            <div
              id={idPainel}
              role="region"
              aria-labelledby={idBotao}
              inert={!aberto}
              className={`grid ${semMovimento ? "" : "transition-[grid-template-rows] duration-300 ease-out"} ${
                aberto ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <div className={`text-sm text-ink ${cartoes ? "border-t border-rule px-4 py-4" : "bg-surface pt-1 pr-2 pb-4 pl-9"}`}>
                  {item.conteudo}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
