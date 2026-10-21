import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getComponent, registry } from "@/registry";
import { categories } from "@/registry/categories";
import { CodeBlock } from "@/showcase/code-block";
import { DemoPreview } from "@/showcase/demo-preview";

const srcDir = path.join(process.cwd(), "src");

type Source = { file: string; code: string };

// Lê todos os arquivos da pasta do componente (menos meta.ts), com a demo por último
function readSources(slug: string): Source[] {
  const dir = path.join(srcDir, "library", slug);
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name !== "meta.ts")
    .map((entry) => path.relative(dir, path.join(entry.parentPath, entry.name)).replaceAll("\\", "/"))
    .sort((a, b) => Number(a === "demo.tsx") - Number(b === "demo.tsx") || a.localeCompare(b))
    .map((file) => ({ file, code: readFileSync(path.join(dir, file), "utf-8") }));
}

// "@/library/dica/Dica" -> "dica"
function libraryImports(code: string) {
  return [...code.matchAll(/from "@\/library\/([^/"]+)\//g)].map((match) => match[1]);
}

/**
 * Componentes da biblioteca que este usa, direta ou indiretamente (sem contar a
 * demo): é tudo o que precisa ser copiado junto para outro projeto.
 */
function readDependencies(slug: string, sources: Source[]) {
  const components = new Set<string>();
  const pending = sources.filter((s) => s.file !== "demo.tsx").map((s) => s.code);

  while (pending.length > 0) {
    for (const name of libraryImports(pending.pop()!)) {
      if (name === slug || components.has(name)) continue;
      components.add(name);
      pending.push(...readSources(name).filter((s) => s.file !== "demo.tsx").map((s) => s.code));
    }
  }
  return [...components].sort();
}

function readTheme(theme: string) {
  const file = path.join(srcDir, "themes", `${theme}.css`);
  return existsSync(file) ? readFileSync(file, "utf-8") : null;
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
  const dependencies = readDependencies(component.slug, sources);
  const themeCss = component.theme ? readTheme(component.theme) : null;

  return (
    <article className="space-y-8">
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

      {(dependencies.length > 0 || themeCss) && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Para usar em outro projeto, copie também</h2>
          {dependencies.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Componentes da biblioteca (diretos e indiretos)
              </h3>
              <ul className="flex flex-wrap gap-1.5">
                {dependencies.map((slug) => (
                  <li key={slug}>
                    <Link
                      href={`/components/${slug}`}
                      className="inline-block rounded-full border border-zinc-200 px-3 py-1 text-sm hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
                    >
                      {getComponent(slug)?.name ?? slug}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {themeCss && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Tokens do tema “{component.theme}”
              </h3>
              <details>
                <summary className="cursor-pointer py-1 font-mono text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                  src/themes/{component.theme}.css
                </summary>
                <div className="mt-2">
                  <CodeBlock title={`src/themes/${component.theme}.css`} code={themeCss} />
                </div>
              </details>
            </div>
          )}
        </section>
      )}
    </article>
  );
}
