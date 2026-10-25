import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import type { LanguageInput } from "shiki/types";

/** Um trecho de código com a cor do tema (sem cor = cor padrão do bloco). */
export type Trecho = [texto: string, cor?: string];
/** Uma lista de trechos por linha. */
export type CodigoColorido = Trecho[][];

export type Linguagem = "tsx" | "typescript" | "css" | "bash";

const TEMA = "github-dark-default";

/** Linguagem pela extensão do arquivo; sem extensão conhecida, null (o bloco fica sem cor). */
export function linguagemDoArquivo(arquivo: string): Linguagem | null {
  const extensao = arquivo.split(".").pop()?.toLowerCase();
  if (extensao === "tsx") return "tsx";
  if (extensao === "ts") return "typescript";
  if (extensao === "css") return "css";
  return null;
}

// Cada gramática é um import próprio: o navegador só baixa a das linguagens que pedir (o CSS do tema),
// e não as de TSX, TypeScript e bash, que só o servidor usa
const GRAMATICAS: Record<Linguagem, () => LanguageInput> = {
  tsx: () => import("shiki/langs/tsx.mjs"),
  typescript: () => import("shiki/langs/typescript.mjs"),
  css: () => import("shiki/langs/css.mjs"),
  bash: () => import("shiki/langs/bash.mjs"),
};

let destacador: Promise<HighlighterCore> | undefined;

// Só o tema usado aqui, com o motor em JavaScript (sem WASM, que a CSP do site não libera)
async function carregar(lang: Linguagem) {
  destacador ??= createHighlighterCore({
    themes: [import("shiki/themes/github-dark-default.mjs")],
    langs: [],
    engine: createJavaScriptRegexEngine(),
  });
  const shiki = await destacador;
  await shiki.loadLanguage(GRAMATICAS[lang]());
  return shiki;
}

/** Quebra o código em trechos coloridos. Se algo falhar, devolve null e o bloco mostra o texto puro. */
export async function destacar(code: string, lang: Linguagem): Promise<CodigoColorido | null> {
  try {
    const { tokens } = (await carregar(lang)).codeToTokens(code, { lang, theme: TEMA });
    return tokens.map((linha) => linha.map((t): Trecho => (t.color ? [t.content, t.color] : [t.content])));
  } catch (erro) {
    console.error("Não foi possível colorir o código; mostrando texto puro.", erro);
    return null;
  }
}
