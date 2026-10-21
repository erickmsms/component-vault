"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { registry } from "@/registry";
import { categories, categoryIds } from "@/registry/categories";
import type { ComponentMeta } from "@/registry/types";
import { ComponentCard } from "./component-card";

const usedCategories = categoryIds.filter((id) => registry.some((c) => c.category === id));
const allTags = unique(registry.flatMap((c) => c.tags));
const allSources = unique(registry.flatMap((c) => (c.source ? [c.source] : [])));

function unique(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

// Ignora maiúsculas e acentos: "botao" encontra "Botão"
function normalize(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function matchesQuery(component: ComponentMeta, query: string) {
  const haystack = [
    component.name,
    component.slug,
    component.description,
    component.source ?? "",
    ...component.tags,
  ].join(" ");
  return normalize(haystack).includes(query);
}

export function Catalog() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  // Filtros ficam na URL para dar pra compartilhar/salvar: /?tipo=buttons&tema=dark
  const category = searchParams.get("tipo");
  const tags = searchParams.get("tema")?.split(",").filter(Boolean) ?? [];
  const source = searchParams.get("projeto");
  const hasFilters = Boolean(query || category || tags.length || source);

  function setParams(changes: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function toggleTag(tag: string) {
    const next = tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag];
    setParams({ tema: next.join(",") || null });
  }

  function clearFilters() {
    setQuery("");
    router.replace(pathname, { scroll: false });
  }

  const normalizedQuery = normalize(query.trim());
  const results = registry.filter(
    (c) =>
      (!category || c.category === category) &&
      (!source || c.source === source) &&
      tags.every((tag) => c.tags.includes(tag)) &&
      (!normalizedQuery || matchesQuery(c, normalizedQuery)),
  );
  const groups = categoryIds
    .map((id) => ({ id, items: results.filter((c) => c.category === id) }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* top-24: abaixo do cabeçalho fixo */}
      <aside className="space-y-6 lg:sticky lg:top-24 lg:w-64 lg:shrink-0 lg:self-start">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nome, tema, projeto..."
          aria-label="Buscar componentes"
          className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-300"
        />

        <FilterGroup title="Tipo">
          <Chip active={!category} onClick={() => setParams({ tipo: null })}>
            Todos <Count value={registry.length} />
          </Chip>
          {usedCategories.map((id) => (
            <Chip
              key={id}
              active={category === id}
              onClick={() => setParams({ tipo: category === id ? null : id })}
            >
              {categories[id]}{" "}
              <Count value={registry.filter((c) => c.category === id).length} />
            </Chip>
          ))}
        </FilterGroup>

        {allTags.length > 0 && (
          <FilterGroup title="Tema">
            {allTags.map((tag) => (
              <Chip key={tag} active={tags.includes(tag)} onClick={() => toggleTag(tag)}>
                {tag}
              </Chip>
            ))}
          </FilterGroup>
        )}

        {allSources.length > 0 && (
          <FilterGroup title="Projeto de origem">
            {allSources.map((name) => (
              <Chip
                key={name}
                active={source === name}
                onClick={() => setParams({ projeto: source === name ? null : name })}
              >
                {name}
              </Chip>
            ))}
          </FilterGroup>
        )}

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline dark:hover:text-zinc-100"
          >
            Limpar filtros
          </button>
        )}
      </aside>

      <div className="min-w-0 flex-1 space-y-10">
        <p className="text-sm text-zinc-500">
          {results.length} de {registry.length} componentes
        </p>

        {groups.map((group) => (
          <section key={group.id} className="space-y-4">
            <h2 className="flex items-baseline gap-2 text-lg font-semibold tracking-tight">
              {categories[group.id]}
              <span className="text-sm font-normal text-zinc-500">{group.items.length}</span>
            </h2>
            {/* Quantas colunas couberem, para ocupar a largura toda em qualquer tela */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))] gap-4">
              {group.items.map((component) => (
                <ComponentCard key={component.slug} component={component} />
              ))}
            </div>
          </section>
        ))}

        {results.length === 0 && (
          <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
            <p className="font-medium">Nenhum componente encontrado</p>
            <p className="mt-1 text-sm text-zinc-500">Tente outra busca ou remova algum filtro.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">{title}</h3>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-700 transition-colors hover:border-zinc-400 aria-pressed:border-zinc-900 aria-pressed:bg-zinc-900 aria-pressed:text-white dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:aria-pressed:border-zinc-100 dark:aria-pressed:bg-zinc-100 dark:aria-pressed:text-zinc-900"
    >
      {children}
    </button>
  );
}

function Count({ value }: { value: number }) {
  return <span className="text-xs opacity-60">{value}</span>;
}
