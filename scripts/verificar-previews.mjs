// Confere nos meta.ts as regras de preview de docs/previews.md. Roda no pre-commit
// (`npm run check:previews`) e não renderiza nada: o que só o navegador mede fica de fora.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";

const biblioteca = path.resolve(import.meta.dirname, "..", "src", "library");

// Tipos cujo componente é um bloco de tela e pode ter largura fixa de miniatura.
// Nos demais (botões, campos, avisos...) a miniatura se ajusta sozinha.
const COM_LARGURA = new Set(["sections", "pages", "layout", "navigation", "charts", "data-display"]);
const LARGURA_MIN = 600;
const LARGURA_MAX = 1400;

const erros = [];
const pastas = readdirSync(biblioteca, { withFileTypes: true }).filter((d) => d.isDirectory());

for (const { name: slug } of pastas) {
  const arquivo = path.join(biblioteca, slug, "meta.ts");
  if (!existsSync(arquivo)) continue;
  const fonte = readFileSync(arquivo, "utf8");
  const campo = (nome) => fonte.match(new RegExp(String.raw`^\s*${nome}:\s*(.+?),?\s*$`, "m"))?.[1];
  const onde = `src/library/${slug}/meta.ts`;

  if (campo("thumbnailZoom") !== undefined) {
    erros.push(`${onde}: thumbnailZoom não existe mais; a miniatura se ajusta sozinha. Remova o campo.`);
  }

  const largura = campo("thumbnailWidth");
  if (largura !== undefined) {
    const categoria = campo("category")?.replace(/["']/g, "");
    const n = Number(largura);
    if (!COM_LARGURA.has(categoria)) {
      erros.push(`${onde}: thumbnailWidth só vale para ${[...COM_LARGURA].join(", ")} (aqui: ${categoria}). Remova o campo.`);
    }
    if (!Number.isFinite(n) || n < LARGURA_MIN || n > LARGURA_MAX) {
      erros.push(`${onde}: thumbnailWidth deve ser um número entre ${LARGURA_MIN} e ${LARGURA_MAX} (aqui: ${largura}).`);
    }
  }
}

if (erros.length) {
  console.error("Previews fora das regras (veja docs/previews.md):\n" + erros.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}
console.log("Previews ok.");
