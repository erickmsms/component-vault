"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useState, type ReactNode } from "react";
import { getComponent } from "@/registry";

/** Quantos componentes cabem lado a lado na comparação. */
const MAXIMO = 2;

type Selecao = { slugs: string[]; alternar: (slug: string) => void; limpar: () => void };

const SelecaoContext = createContext<Selecao | null>(null);

/** Os componentes marcados para comparar. Fica no layout, então vale ao navegar entre páginas. */
export function SelecaoProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);

  // Marcar um terceiro tira o mais antigo
  const alternar = (slug: string) =>
    setSlugs((atual) => (atual.includes(slug) ? atual.filter((s) => s !== slug) : [...atual, slug].slice(-MAXIMO)));

  return (
    <SelecaoContext value={{ slugs, alternar, limpar: () => setSlugs([]) }}>
      {children}
      <BarraDeComparacao />
    </SelecaoContext>
  );
}

function useSelecao() {
  const contexto = useContext(SelecaoContext);
  if (!contexto) throw new Error("useSelecao precisa estar dentro de <SelecaoProvider>");
  return contexto;
}

/**
 * Envolve o card do catálogo: o botão no canto marca para comparar. Ctrl (ou Cmd) + clique
 * no card abre o componente em outra aba, como em qualquer link.
 */
export function CartaoSelecionavel({ slug, nome, children }: { slug: string; nome: string; children: ReactNode }) {
  const { slugs, alternar } = useSelecao();
  const marcado = slugs.includes(slug);

  return (
    <div
      className={`relative rounded-xl ${marcado ? "ring-2 ring-zinc-900 ring-offset-2 ring-offset-white dark:ring-zinc-100 dark:ring-offset-zinc-950" : ""}`}
    >
      {children}
      <button
        type="button"
        aria-pressed={marcado}
        aria-label={`Comparar ${nome}`}
        title="Marcar para comparar"
        onClick={() => alternar(slug)}
        className="absolute top-2 right-2 z-10 flex size-7 items-center justify-center rounded-full border border-zinc-300 bg-white/90 text-zinc-600 backdrop-blur-sm transition-colors hover:border-zinc-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 aria-pressed:border-zinc-900 aria-pressed:bg-zinc-900 aria-pressed:text-white dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-300 dark:focus-visible:outline-zinc-100 dark:aria-pressed:border-zinc-100 dark:aria-pressed:bg-zinc-100 dark:aria-pressed:text-zinc-900"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          {marcado ? <path d="m5 12 5 5 9-10" /> : <path d="M12 5v14M5 12h14" />}
        </svg>
      </button>
    </div>
  );
}

/** Barra no pé da tela com o que está marcado e o botão de comparar. */
function BarraDeComparacao() {
  const router = useRouter();
  const { slugs, limpar } = useSelecao();
  if (slugs.length === 0) return null;

  const nomes = slugs.map((s) => getComponent(s)?.name ?? s);
  const pronto = slugs.length === MAXIMO;

  return (
    <div
      role="region"
      aria-label="Comparar componentes"
      className="fixed bottom-6 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-full bg-zinc-900 py-2 pr-2 pl-5 text-sm text-white shadow-xl dark:bg-zinc-100 dark:text-zinc-900"
    >
      <p aria-live="polite" className="min-w-0 truncate">
        {pronto ? (
          <>
            <strong className="font-medium">{nomes[0]}</strong> × <strong className="font-medium">{nomes[1]}</strong>
          </>
        ) : (
          <>
            <strong className="font-medium">{nomes[0]}</strong>
            <span className="opacity-70"> · marque outro (+) para comparar</span>
          </>
        )}
      </p>
      <button
        type="button"
        onClick={limpar}
        className="shrink-0 rounded-full px-3 py-1.5 opacity-80 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
      >
        Limpar
      </button>
      <button
        type="button"
        disabled={!pronto}
        onClick={() => router.push(`/comparar?a=${slugs[0]}&b=${slugs[1]}`)}
        className="shrink-0 rounded-full bg-white px-4 py-1.5 font-medium text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current disabled:opacity-40 dark:bg-zinc-900 dark:text-white"
      >
        Comparar
      </button>
    </div>
  );
}
