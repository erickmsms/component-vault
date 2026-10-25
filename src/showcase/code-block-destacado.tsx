import { CodeBlock } from "./code-block";
import { destacar, type CodigoColorido, type Linguagem } from "./destacar";

// O Shiki lê o relógio por dentro e o Next não aceita isso no prerender; guardar o resultado
// ("use cache") faz o destaque rodar uma vez e entrar no HTML pronto
async function colorir(code: string, lang: Linguagem): Promise<CodigoColorido | null> {
  "use cache";
  return destacar(code, lang);
}

/** CodeBlock com o código colorido no servidor: o navegador não baixa o Shiki. */
export async function CodeBlockDestacado({ title, code, lang }: { title: string; code: string; lang: Linguagem | null }) {
  const colorido = lang ? await colorir(code, lang) : null;
  return <CodeBlock title={title} code={code} colorido={colorido} />;
}
