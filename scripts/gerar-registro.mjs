// Gera src/registry/index.ts e src/registry/all-stories.tsx a partir das pastas de
// src/library: toda pasta com meta.ts entra no catálogo, e o stories.tsx dela nos
// previews. Roda sozinho antes de `npm run dev` e `npm run build` (predev/prebuild).
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const raiz = path.resolve(import.meta.dirname, "..");
const biblioteca = path.join(raiz, "src", "library");
const registro = path.join(raiz, "src", "registry");

const AVISO = "// Gerado por scripts/gerar-registro.mjs — não edite à mão (rode `npm run registro`).";

/** "grafico-com-seletor" -> "graficoComSeletor" */
const identificador = (slug) => slug.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

const pastas = readdirSync(biblioteca, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const comMeta = pastas.filter((p) => existsSync(path.join(biblioteca, p, "meta.ts")));
const comStories = comMeta.filter((p) => existsSync(path.join(biblioteca, p, "stories.tsx")));
const semMeta = pastas.filter((p) => !comMeta.includes(p));
const semStories = comMeta.filter((p) => !comStories.includes(p));

const indice = [
  AVISO,
  ...comMeta.map((p) => `import { meta as ${identificador(p)} } from "@/library/${p}/meta";`),
  'import type { ComponentMeta } from "./types";',
  "",
  "// Metadados de todos os componentes, em ordem alfabética de nome.",
  "export const registry: ComponentMeta[] = [",
  ...comMeta.map((p) => `  ${identificador(p)},`),
  '].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));',
  "",
  "export function getComponent(slug: string) {",
  "  return registry.find((component) => component.slug === slug);",
  "}",
  "",
].join("\n");

const stories = [
  AVISO,
  ...comStories.map((p) => `import ${identificador(p)} from "@/library/${p}/stories";`),
  'import type { StoriesModule } from "./stories";',
  "",
  "// Exemplos de cada componente (src/library/<slug>/stories.tsx). Ficam separados dos",
  "// metadados porque só são renderizados no cliente: nos cards e nos iframes de preview.",
  "export const allStories: Record<string, StoriesModule> = {",
  ...comStories.map((p) => (identificador(p) === p ? `  ${p},` : `  ${JSON.stringify(p)}: ${identificador(p)},`)),
  "};",
  "",
].join("\n");

writeFileSync(path.join(registro, "index.ts"), indice);
writeFileSync(path.join(registro, "all-stories.tsx"), stories);

console.log(`Registro gerado: ${comMeta.length} componentes, ${comStories.length} com exemplos.`);
if (semMeta.length) console.warn(`Pastas sem meta.ts (fora do catálogo): ${semMeta.join(", ")}`);
if (semStories.length) console.warn(`Sem stories.tsx (sem preview): ${semStories.join(", ")}`);
