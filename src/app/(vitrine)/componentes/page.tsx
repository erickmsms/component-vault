import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalog } from "@/showcase/catalog";

export const metadata: Metadata = {
  title: "Catálogo de componentes React",
  description:
    "Todos os componentes da biblioteca, com busca e filtros por tipo, tema e projeto: botões, formulários, gráficos, navegação, overlays e mais.",
  // Os filtros (?tipo=...) mostram a mesma página: o Google conta tudo como /componentes
  alternates: { canonical: "/componentes" },
};

export default function Home() {
  return (
    // O catálogo lê os filtros da URL (useSearchParams), então precisa de Suspense
    <Suspense fallback={<p className="text-sm text-zinc-500">Carregando catálogo...</p>}>
      <Catalog />
    </Suspense>
  );
}
