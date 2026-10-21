"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/**
 * Botão em pílula (rótulo + resumo da escolha) que abre um painel suspenso. É a base dos seletores da barra
 * e dos gráficos: fecha ao clicar fora ou com Esc (devolvendo o foco ao botão). O painel recebe `fechar`.
 */
export function MenuSuspenso({
  rotulo,
  resumo,
  larguraDoPainel = "w-72",
  children,
}: {
  rotulo: string;
  resumo: string;
  /** Classe de largura do painel. */
  larguraDoPainel?: string;
  children: (fechar: () => void) => ReactNode;
}) {
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);
  const idDoPainel = useId();

  const jaAbriu = useRef(false);

  // Ao fechar, se o foco ficou sem lugar (o item clicado sumiu) ou ainda está no menu, volta para o botão.
  useEffect(() => {
    if (aberto) {
      jaAbriu.current = true;
      return;
    }
    if (!jaAbriu.current) return;
    const foco = document.activeElement;
    if (!foco || foco === document.body || raiz.current?.contains(foco)) botao.current?.focus();
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      if (!raiz.current?.contains(e.target as Node)) setAberto(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("pointerdown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  return (
    <div ref={raiz} className="relative">
      <button
        ref={botao}
        type="button"
        aria-expanded={aberto}
        aria-controls={idDoPainel}
        onClick={() => setAberto((a) => !a)}
        className={`flex min-h-11 w-full max-w-full cursor-pointer items-center gap-2 rounded-full border bg-page px-4 text-sm text-ink outline-accent focus-visible:outline-2 focus-visible:outline-offset-2 md:w-auto ${
          aberto ? "border-ink" : "border-axis/50 hover:border-ink"
        }`}
      >
        <span className="text-muted">{rotulo}</span>
        <span className="min-w-0 truncate font-semibold">{resumo}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 12 12"
          className={`ml-auto size-3 shrink-0 text-muted transition-transform ${aberto ? "rotate-180" : ""}`}
        >
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {aberto && (
        <div
          id={idDoPainel}
          role="group"
          aria-label={rotulo}
          className={`absolute top-full right-0 z-50 mt-2 max-w-[calc(100vw-3rem)] rounded-xl border border-rule bg-page shadow-lg ${larguraDoPainel}`}
        >
          {children(() => setAberto(false))}
        </div>
      )}
    </div>
  );
}
