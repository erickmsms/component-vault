import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { getComponent, registry } from "@/registry";
import { categories } from "@/registry/categories";
import { readComponentDocs } from "@/registry/props";
import { CodeBlock } from "@/showcase/code-block";
import { ComponentPreview } from "@/showcase/preview/component-preview";
import { PropsTable } from "@/showcase/props-table";
import { CurrentThemeCss } from "@/showcase/theme/current-theme-css";

const srcDir = path.join(process.cwd(), "src");
const EXEMPLOS = "stories.tsx";

type Source = { file: string; code: string };

// Lê todos os arquivos da pasta do componente (menos meta.ts), com os exemplos por último
function readSources(slug: string): Source[] {
  const dir = path.join(srcDir, "library", slug);
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name !== "meta.ts")
    .map((entry) => path.relative(dir, path.join(entry.parentPath, entry.name)).replaceAll("\\", "/"))
    .sort((a, b) => Number(a === EXEMPLOS) - Number(b === EXEMPLOS) || a.localeCompare(b))
    .map((file) => ({ file, code: readFileSync(path.join(dir, file), "utf-8") }));
}

// "@/library/dica/Dica" -> "dica"
function libraryImports(code: string) {
  return [...code.matchAll(/from "@\/library\/([^/"]+)\//g)].map((match) => match[1]);
}

/**
 * Componentes da biblioteca que este usa, direta ou indiretamente (sem contar os
 * exemplos): é tudo o que precisa ser copiado junto para outro projeto.
 */
function readDependencies(slug: string, sources: Source[]) {
  const components = new Set<string>();
  const pending = sources.filter((s) => s.file !== EXEMPLOS).map((s) => s.code);

  while (pending.length > 0) {
    for (const name of libraryImports(pending.pop()!)) {
      if (name === slug || components.has(name)) continue;
      components.add(name);
      pending.push(...readSources(name).filter((s) => s.file !== EXEMPLOS).map((s) => s.code));
    }
  }
  return [...components].sort();
}

function Secao({ titulo, descricao, children }: { titulo: string; descricao?: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{titulo}</h2>
        {descricao && <p className="text-sm text-zinc-500">{descricao}</p>}
      </div>
      {children}
    </section>
  );
}

export function generateStaticParams() {
  return registry.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/components/[slug]">): Promise<Metadata> {
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
  const docs = readComponentDocs(component.slug);
  const tokensCss = readFileSync(path.join(srcDir, "themes", "tokens.css"), "utf-8");

  return (
    <article className="space-y-10">
      <div className="space-y-6">
        {/* Caminho até aqui; cada parte leva para onde diz (o tipo abre o catálogo filtrado) */}
        <nav aria-label="Caminho">
          <ol className="flex flex-wrap items-center gap-2 text-sm">
            <li>
              <Link
                href={`/?tipo=${component.category}`}
                className="text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline dark:hover:text-zinc-100"
              >
                {categories[component.category]}
              </Link>
            </li>
            <li aria-hidden="true" className="text-zinc-400">
              →
            </li>
            <li>
              <Link
                href={`/components/${component.slug}`}
                aria-current="page"
                className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
              >
                {component.name}
              </Link>
            </li>
          </ol>
        </nav>

        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
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

        <ComponentPreview slug={component.slug} nome={component.name} alturaFixa={component.previewHeight} />
      </div>

      <Secao titulo="Props" descricao="Geradas dos tipos TypeScript do componente; a descrição vem dos comentários /** */.">
        <PropsTable docs={docs} />
      </Secao>

      {component.dependencies && component.dependencies.length > 0 && (
        <Secao titulo="Dependências">
          <CodeBlock title="terminal" code={`npm install ${component.dependencies.join(" ")}`} />
        </Secao>
      )}

      <Secao titulo="Código" descricao={`${EXEMPLOS} tem os exemplos usados no preview e no playground.`}>
        {sources.map(({ file, code }) => (
          <CodeBlock key={file} title={`${component.slug}/${file}`} code={code} />
        ))}
      </Secao>

      <Secao
        titulo="Para usar em outro projeto, copie também"
        descricao="Os componentes de que este depende e o tema. O CSS do tema é um arquivo só: importe depois do Tailwind."
      >
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
        <div className="space-y-2">
          <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Tema escolhido no cabeçalho (com a ponte para o Tailwind)
          </h3>
          <details>
            <summary className="cursor-pointer py-1 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              Ver o CSS do tema
            </summary>
            <div className="mt-2 space-y-3">
              <CurrentThemeCss />
              <p className="text-sm text-zinc-500">
                Na vitrine, a ponte com o Tailwind fica em <code className="font-mono text-xs">src/themes/tokens.css</code>:
              </p>
              <CodeBlock title="src/themes/tokens.css" code={tokensCss} />
            </div>
          </details>
        </div>
      </Secao>
    </article>
  );
}
