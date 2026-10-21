import Link from "next/link";
import { ProvedorDeMovimento } from "@/library/revelar/Movimento";
import { allStories } from "@/registry/all-stories";
import { StoryView } from "@/registry/stories";
import type { ComponentMeta } from "@/registry/types";
import { THEME_ATTR } from "@/themes/tokens";
import { ScaledThumbnail } from "./scaled-thumbnail";
import { CartaoSelecionavel } from "./selecao";

export function ComponentCard({ component }: { component: ComponentMeta }) {
  const exemplos = allStories[component.slug];
  // Miniaturas paradas: animações de entrada e de rolagem aparecem no estado final
  const exemplo = exemplos ? (
    <ProvedorDeMovimento>
      <StoryView exemplos={exemplos} />
    </ProvedorDeMovimento>
  ) : (
    <p className="text-sm opacity-60">Sem exemplos para “{component.slug}”.</p>
  );

  return (
    <CartaoSelecionavel slug={component.slug} nome={component.name}>
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 transition-colors hover:border-zinc-400 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-600 dark:has-[:focus-visible]:ring-zinc-100">
      {/* Miniatura da primeira variação, com o tema escolhido: inerte para o card inteiro funcionar como link */}
      {component.thumbnailWidth ? (
        <div inert data-miniatura data-theme={THEME_ATTR} className="h-44 overflow-hidden bg-page">
          <ScaledThumbnail width={component.thumbnailWidth}>{exemplo}</ScaledThumbnail>
        </div>
      ) : (
        <div
          inert
          data-miniatura
          data-theme={THEME_ATTR}
          className="flex h-44 items-center-safe justify-center-safe overflow-hidden bg-page p-4"
        >
          <div className="flex w-full justify-center" style={{ zoom: component.thumbnailZoom ?? 0.75 }}>{exemplo}</div>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 border-t border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-medium">
            <Link
              href={`/components/${component.slug}`}
              className="after:absolute after:inset-0 focus-visible:outline-none"
            >
              {component.name}
            </Link>
          </h3>
          {component.source && (
            <span className="truncate text-xs text-zinc-500">{component.source}</span>
          )}
        </div>
        <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
          {component.description}
        </p>
        <ul className="mt-auto flex flex-wrap gap-1 pt-1">
          {component.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </div>
    </CartaoSelecionavel>
  );
}
