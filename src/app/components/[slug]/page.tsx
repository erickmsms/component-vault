import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getComponent, registry } from "@/registry";
import { categories } from "@/registry/categories";
import { CodeBlock } from "@/showcase/code-block";
import { DemoPreview } from "@/showcase/demo-preview";

const libraryDir = path.join(process.cwd(), "src", "library");

// Lê todos os arquivos da pasta do componente (menos meta.ts), com a demo por último
function readSources(slug: string) {
  const dir = path.join(libraryDir, slug);
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name !== "meta.ts")
    .map((entry) => path.relative(dir, path.join(entry.parentPath, entry.name)).replaceAll("\\", "/"))
    .sort((a, b) => Number(a === "demo.tsx") - Number(b === "demo.tsx") || a.localeCompare(b))
    .map((file) => ({ file, code: readFileSync(path.join(dir, file), "utf-8") }));
}

export function generateStaticParams() {
  return registry.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/components/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: getComponent(slug)?.name };
}

type Params = PageProps<"/components/[slug]">["params"];

export default function ComponentPage({ params }: PageProps<"/components/[slug]">) {
  // Ler params fora de Suspense bloqueia a navegação instantânea do Next 16
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Carregando componente...</p>}>
      <ComponentDetails params={params} />
    </Suspense>
  );
}

async function ComponentDetails({ params }: { params: Params }) {
  const { slug } = await params;
  const component = getComponent(slug);
  if (!component) notFound();

  const sources = readSources(component.slug);

  return (
    <article className="mx-auto max-w-4xl space-y-8">
      <Link
        href="/"
        className="inline-block text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        ← Voltar ao catálogo
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            href={`/?tipo=${component.category}`}
            className="rounded-full bg-zinc-100 px-2.5 py-0.5 font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            {categories[component.category]}
          </Link>
          {component.source && (
            <span className="text-zinc-500">
              extraído de{" "}
              <Link
                href={`/?projeto=${encodeURIComponent(component.source)}`}
                className="font-medium text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300"
              >
                {component.source}
              </Link>
            </span>
          )}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{component.name}</h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">{component.description}</p>
        <ul className="flex flex-wrap gap-1.5">
          {component.tags.map((tag) => (
            <li key={tag}>
              <Link
                href={`/?tema=${encodeURIComponent(tag)}`}
                className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              >
                {tag}
              </Link>
            </li>
          ))}
        </ul>
      </header>

      <DemoPreview slug={component.slug} initialBackground={component.background} />

      {component.dependencies && component.dependencies.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">Dependências</h2>
          <CodeBlock title="terminal" code={`npm install ${component.dependencies.join(" ")}`} />
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Código</h2>
        {sources.map(({ file, code }) => (
          <CodeBlock key={file} title={`${component.slug}/${file}`} code={code} />
        ))}
      </section>
    </article>
  );
}
