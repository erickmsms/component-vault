import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

// Lê as props dos componentes direto dos tipos TypeScript, no servidor (na hora
// do build ou de cada página no dev). Os comentários /** */ viram a descrição.

export type PropDoc = {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
};

export type ComponentDoc = {
  name: string;
  description?: string;
  props: PropDoc[];
  /** Quantas props vêm de tipos do React/HTML (onClick, aria-*...): resumidas numa linha, não listadas. */
  nativas: number;
};

const srcDir = path.join(process.cwd(), "src");
const libraryDir = path.join(srcDir, "library");

/** Arquivos dos componentes (sem exemplos e metadados). */
function arquivosDaBiblioteca() {
  return readdirSync(libraryDir, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".tsx") && e.name !== "stories.tsx")
    .map((e) => path.join(e.parentPath, e.name));
}

let cache: { assinatura: string; program: ts.Program } | null = null;

/** Um Program do TypeScript para a biblioteca inteira, refeito quando algum arquivo muda. */
function programa() {
  const arquivos = arquivosDaBiblioteca();
  const assinatura = arquivos.map((f) => `${f}:${statSync(f).mtimeMs}`).join("|");
  if (cache?.assinatura === assinatura) return cache.program;

  const config = ts.readConfigFile(path.join(process.cwd(), "tsconfig.json"), ts.sys.readFile);
  const { options } = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd());
  const program = ts.createProgram(arquivos, { ...options, noEmit: true, incremental: false });
  cache = { assinatura, program };
  return program;
}

const FORMATO =
  ts.TypeFormatFlags.NoTruncation |
  ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
  ts.TypeFormatFlags.WriteArrowStyleSignature;

/** Valores padrão da desestruturação: `{ tipo = "info" }` -> tipo: "info". */
function padroes(parametro: ts.ParameterDeclaration) {
  const resultado = new Map<string, string>();
  if (!ts.isObjectBindingPattern(parametro.name)) return resultado;
  for (const elemento of parametro.name.elements) {
    if (!elemento.initializer) continue;
    const nome = (elemento.propertyName ?? elemento.name).getText();
    resultado.set(nome, elemento.initializer.getText());
  }
  return resultado;
}

/**
 * Props de ref (`ref?: Ref<HTMLButtonElement>`): o TypeScript expande o tipo até os nomes internos do
 * React (como DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES), que não ajudam quem lê a
 * documentação. Nesses casos mostra o tipo como foi escrito no componente.
 */
function tipoDeRef(prop: ts.Symbol) {
  const declaracao = prop.valueDeclaration ?? prop.declarations?.[0];
  const escrito = declaracao && ts.isPropertySignature(declaracao) ? declaracao.type : undefined;
  if (!escrito || !ts.isTypeReferenceNode(escrito)) return undefined;
  return /^(Ref|LegacyRef|RefObject|RefCallback|ForwardedRef)$/.test(escrito.typeName.getText()) ? escrito.getText() : undefined;
}

function documentar(checker: ts.TypeChecker, funcao: ts.FunctionDeclaration): ComponentDoc {
  const simbolo = funcao.name && checker.getSymbolAtLocation(funcao.name);
  const description = simbolo ? ts.displayPartsToString(simbolo.getDocumentationComment(checker)) : "";
  const parametro = funcao.parameters[0];
  if (!parametro) return { name: funcao.name!.text, description, props: [], nativas: 0 };

  const valoresPadrao = padroes(parametro);
  const tipo = checker.getTypeAtLocation(parametro);
  // Props declaradas só nos tipos do React/DOM (node_modules) são os atributos nativos repassados
  const nativa = (prop: ts.Symbol) =>
    (prop.declarations?.length ?? 0) > 0 &&
    prop.declarations!.every((d) => /[\\/]node_modules[\\/]/.test(d.getSourceFile().fileName));
  const todas = tipo.getProperties();
  const props = todas.filter((p) => !nativa(p)).map((prop): PropDoc => {
    const opcional = (prop.flags & ts.SymbolFlags.Optional) !== 0;
    let tipoDaProp = checker.getTypeOfSymbolAtLocation(prop, parametro);
    if (opcional) tipoDaProp = checker.getNonNullableType(tipoDaProp);
    return {
      name: prop.name,
      type: tipoDeRef(prop) ?? checker.typeToString(tipoDaProp, parametro, FORMATO),
      required: !opcional,
      defaultValue: valoresPadrao.get(prop.name),
      description: ts.displayPartsToString(prop.getDocumentationComment(checker)) || undefined,
    };
  });

  return {
    name: funcao.name!.text,
    description: description || undefined,
    props,
    nativas: todas.length - props.length,
  };
}

/** Componentes exportados da pasta (funções com nome em maiúscula) e as props de cada um. */
export function readComponentDocs(slug: string): ComponentDoc[] {
  const program = programa();
  const checker = program.getTypeChecker();
  const pasta = path.join(libraryDir, slug) + path.sep;

  return program
    .getSourceFiles()
    .filter((sf) => path.normalize(sf.fileName).startsWith(pasta) && sf.fileName.endsWith(".tsx"))
    .filter((sf) => !sf.fileName.endsWith("stories.tsx"))
    .flatMap((sf) =>
      sf.statements.filter(
        (s): s is ts.FunctionDeclaration =>
          ts.isFunctionDeclaration(s) &&
          !!s.name &&
          /^[A-Z]/.test(s.name.text) &&
          (ts.getCombinedModifierFlags(s) & ts.ModifierFlags.Export) !== 0,
      ),
    )
    .map((funcao) => documentar(checker, funcao));
}
