import Link from "next/link";
import type { ComponentMeta } from "@/registry/types";
import { backgrounds, Demo } from "./demo-preview";

export function ComponentCard({ component }: { component: ComponentMeta }) {
  const background = backgrounds[component.background ?? "light"];

  return (
    <div className="relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 transition-colors hover:border-zinc-400 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-600 dark:has-[:focus-visible]:ring-zinc-100">
      {/* Preview em miniatura: inerte para que o card inteiro funcione como link */}
      <div
        inert
        className={`flex h-44 items-center justify-center overflow-hidden p-4 ${background.className}`}
      >
        <div className="flex w-full justify-center [zoom:0.75]">
          <Demo slug={component.slug} />
        </div>
      </div>
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
  );
}
