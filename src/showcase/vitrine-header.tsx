"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarraDeBusca } from "@/library/barra-de-busca/BarraDeBusca";
import { useBusca } from "./filters";
import { LogoVault } from "./logo-vault";
import { ThemeControls } from "./theme/theme-controls";

/** Topo da vitrine: logo, busca no centro e, à direita, o atalho para Gradientes e o menu Aparência. Sem borda: some no fundo da página. */
export function VitrineHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { query, setQuery } = useBusca();

  return (
    <header className="sticky top-0 z-40 bg-page/90 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4 md:flex-nowrap">
        <Link href="/" className="shrink-0 font-display text-lg font-extrabold tracking-tight whitespace-nowrap">
          <LogoVault />
        </Link>
        <div className="order-last w-full md:order-none md:mx-auto md:max-w-xl md:flex-1">
          <BarraDeBusca
            value={query}
            onChange={(valor) => {
              setQuery(valor);
              // Buscar a partir da página de um componente leva para o catálogo
              if (pathname !== "/" && valor.trim()) router.push("/");
            }}
            placeholder="Buscar por nome, tema, projeto..."
            aria-label="Buscar componentes"
            atalho
          />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <Link
            href="/gradientes"
            aria-label="Gerador de gradientes"
            title="Gerador de gradientes"
            className="flex size-11 items-center justify-center rounded-full border border-axis/50 bg-page outline-accent hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span aria-hidden="true" className="size-5 rounded-full bg-linear-135 from-indigo-500 to-pink-500" />
          </Link>
          <ThemeControls />
        </div>
      </div>
    </header>
  );
}
