import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { TrilhaDeNavegacao } from "@/library/trilha-de-navegacao/TrilhaDeNavegacao";
import { getComponent } from "@/registry";
import { categories } from "@/registry/categories";
import { ComponentPreview } from "@/showcase/preview/component-preview";
import { THEME_ATTR } from "@/themes/tokens";

export const metadata: Metadata = { title: "Comparar" };

export default function ComparePage({ searchParams }: PageProps<"/comparar">) {
  // Ler searchParams fora de Suspense bloqueia a navegação instantânea do Next 16
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Carregando comparação...</p>}>
      <Comparacao searchParams={searchParams} />
    </Suspense>
  );
}

async function Comparacao({ searchParams }: { searchParams: PageProps<"/comparar">["searchParams"] }) {
  const { a, b } = await searchParams;
  const componentes = [a, b]
    .map((slug) => (typeof slug === "string" ? getComponent(slug) : undefined))
    .filter((c) => c !== undefined);

  return (
    <div className="space-y-6">
      <div data-theme={THEME_ATTR}>
        <TrilhaDeNavegacao componenteDeLink={Link} itens={[{ rotulo: "Catálogo", href: "/" }, { rotulo: "Comparar", href: "/comparar" }]} />
      </div>

      {componentes.length < 2 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="font-medium">Escolha dois componentes para comparar</p>
          <p className="mt-1 text-sm text-zinc-500">
            No catálogo, clique no botão + no canto do card de dois componentes.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 xl:grid-cols-2">
          {componentes.map((componente) => (
            <section key={componente.slug} className="min-w-0 space-y-3">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  <Link href={`/components/${componente.slug}`} className="underline-offset-4 hover:underline">
                    {componente.name}
                  </Link>
                </h1>
                <p className="text-sm text-zinc-500">
                  {categories[componente.category]}
                  {componente.source ? ` · ${componente.source}` : ""}
                </p>
              </div>
              <ComponentPreview slug={componente.slug} nome={componente.name} alturaFixa={componente.previewHeight} />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
