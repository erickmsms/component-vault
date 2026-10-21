import { Suspense } from "react";
import { Catalog } from "@/showcase/catalog";

export default function Home() {
  return (
    // O catálogo lê os filtros da URL (useSearchParams), então precisa de Suspense
    <Suspense fallback={<p className="text-sm text-zinc-500">Carregando catálogo...</p>}>
      <Catalog />
    </Suspense>
  );
}
