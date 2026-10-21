"use client";

import { FiltrosAtivos, type FiltroAtivo } from "@/library/barra-de-filtros/BarraDeFiltros";
import { registry } from "@/registry";
import { categories, categoryIds } from "@/registry/categories";
import type { ComponentMeta } from "@/registry/types";
import { THEME_ATTR } from "@/themes/tokens";
import { ComponentCard } from "./component-card";
import { useBusca, useFiltrosDaUrl } from "./filters";

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

/** Os resultados do catálogo. A barra de filtros fica no layout (src/showcase/filters.tsx). */
export function Catalog() {
  const { query, setQuery } = useBusca();
  const { category, tags, sources, setParams, clearFilters } = useFiltrosDaUrl();

  // Temas e projetos combinam por "qualquer um" (OU), como em todo seletor múltiplo
  const normalizedQuery = normalize(query.trim());
  const results = registry.filter(
    (c) =>
      (!category || c.category === category) &&
      (sources.length === 0 || (c.source !== undefined && sources.includes(c.source))) &&
      (tags.length === 0 || tags.some((tag) => c.tags.includes(tag))) &&
      (!normalizedQuery || matchesQuery(c, normalizedQuery)),
  );
  const groups = categoryIds
    .map((id) => ({ id, items: results.filter((c) => c.category === id) }))
    .filter((group) => group.items.length > 0);

  const ativos: FiltroAtivo[] = [
    ...(query.trim() ? [{ chave: "busca", rotulo: `Busca: “${query.trim()}”`, aoRemover: () => setQuery("") }] : []),
    ...(category ? [{ chave: "tipo", rotulo: `Tipo: ${categories[category]}`, aoRemover: () => setParams({ tipo: null }) }] : []),
    ...tags.map((t) => ({
      chave: `tema-${t}`,
      rotulo: `Tema: ${t}`,
      aoRemover: () => setParams({ tema: tags.filter((x) => x !== t).join(",") || null }),
    })),
    ...sources.map((p) => ({
      chave: `projeto-${p}`,
      rotulo: `Projeto: ${p}`,
      aoRemover: () => setParams({ projeto: sources.filter((x) => x !== p).join(",") || null }),
    })),
  ];

  return (
    <div className="space-y-10">
      <div data-theme={THEME_ATTR}>
        <FiltrosAtivos
          resumo={`${results.length} de ${registry.length} componentes`}
          filtros={ativos}
          aoLimparTudo={clearFilters}
        />
      </div>

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
  );
}
