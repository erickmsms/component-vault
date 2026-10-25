import { isHex } from "./color";
import { ALL_FONTS, fonteConhecida } from "./fonts";
import { COLOR_GROUPS, COLOR_TOKENS, SHADOWS, type ColorPair, type ColorToken, type Shadow, type ThemeValues } from "./tokens";

// Tema em JSON: para copiar, guardar, pedir para uma IA gerar e colar de volta no editor.

export const LIMITES = {
  textBase: { min: 12, max: 22, descricao: "tamanho do texto de corpo, em px" },
  textScale: { min: 1.05, max: 1.6, descricao: "razão da escala dos títulos (1,2 contida; 1,333 dramática)" },
  radius: { min: 0, max: 32, descricao: "arredondamento base em px (0 = cantos retos)" },
  density: { min: 0.7, max: 1.4, descricao: "multiplicador dos espaçamentos (0,85 compacta; 1,15 espaçosa)" },
} as const;

type CampoNumerico = keyof typeof LIMITES;

const CAMPOS = ["name", "colors", "fontDisplay", "fontBody", "textBase", "textScale", "radius", "density", "shadow"];

/** O tema completo, no formato que o "Colar JSON" aceita de volta. */
export function themeToJson(values: ThemeValues, nome: string) {
  return JSON.stringify({ name: nome, ...values }, null, 2);
}

/** "#abc" -> "#aabbcc"; devolve null se não for uma cor hexadecimal. */
export function normalizarHex(valor: unknown) {
  if (typeof valor !== "string") return null;
  const v = valor.trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(v)) return `#${[...v.slice(1)].map((c) => c + c).join("")}`;
  return isHex(v) ? v : null;
}

export type ImportResult =
  | { ok: true; values: ThemeValues; nome?: string; aplicados: number; avisos: string[] }
  | { ok: false; erro: string };

/**
 * Lê um tema em JSON sobre o tema atual: os campos que vierem substituem os
 * atuais, os que faltarem ficam como estão. Valores fora do formato viram avisos
 * (e são ignorados); números fora da faixa são ajustados para o limite.
 */
export function parseThemeJson(texto: string, atual: ThemeValues): ImportResult {
  let dado: unknown;
  try {
    // Aceita o JSON dentro de um bloco ```json ... ``` (como as IAs costumam responder)
    dado = JSON.parse(texto.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, ""));
  } catch (e) {
    return { ok: false, erro: `JSON inválido: ${(e as Error).message}` };
  }
  if (dado && typeof dado === "object" && "values" in dado && typeof dado.values === "object") {
    dado = { ...(dado.values as object), name: (dado as { name?: unknown }).name };
  }
  if (!dado || typeof dado !== "object" || Array.isArray(dado)) {
    return { ok: false, erro: "O JSON precisa ser um objeto, como o do botão “Copiar JSON”." };
  }

  const entrada = dado as Record<string, unknown>;
  const values: ThemeValues = structuredClone(atual);
  const avisos: string[] = [];
  let aplicados = 0;

  for (const chave of Object.keys(entrada)) {
    if (!CAMPOS.includes(chave)) avisos.push(`Campo desconhecido “${chave}” ignorado.`);
  }

  if (entrada.colors !== undefined) {
    if (typeof entrada.colors !== "object" || entrada.colors === null) {
      avisos.push("“colors” precisa ser um objeto; ignorado.");
    } else {
      for (const [token, valor] of Object.entries(entrada.colors)) {
        if (!COLOR_TOKENS.includes(token as ColorToken)) {
          avisos.push(`Cor desconhecida “${token}” ignorada.`);
          continue;
        }
        // Uma cor só vale para os dois modos; um objeto traz { light, dark }
        const par = typeof valor === "string" ? { light: valor, dark: valor } : (valor as Partial<ColorPair> | null);
        const atualDoToken = values.colors[token as ColorToken];
        for (const modo of ["light", "dark"] as const) {
          const bruto = par?.[modo];
          if (bruto === undefined) continue;
          const hex = normalizarHex(bruto);
          if (!hex) {
            avisos.push(`“colors.${token}.${modo}” não é uma cor hexadecimal (#rrggbb): ${JSON.stringify(bruto)}.`);
            continue;
          }
          atualDoToken[modo] = hex;
          aplicados++;
        }
      }
    }
  }

  for (const campo of ["fontDisplay", "fontBody"] as const) {
    const valor = entrada[campo];
    if (valor === undefined) continue;
    if (typeof valor !== "string" || !valor.trim()) {
      avisos.push(`“${campo}” precisa ser o nome de uma fonte; ignorado.`);
      continue;
    }
    // Só entram fontes da vitrine: o nome vai direto para o CSS do tema
    const fonte = fonteConhecida(valor);
    if (!fonte) {
      avisos.push(`“${campo}”: ${JSON.stringify(valor.slice(0, 40))} não é uma fonte da vitrine; ignorada. Use uma da lista do editor.`);
      continue;
    }
    values[campo] = fonte;
    aplicados++;
  }

  for (const campo of Object.keys(LIMITES) as CampoNumerico[]) {
    const valor = entrada[campo];
    if (valor === undefined) continue;
    const n = typeof valor === "string" ? Number(valor.replace(",", ".")) : valor;
    if (typeof n !== "number" || !Number.isFinite(n)) {
      avisos.push(`“${campo}” precisa ser um número; ignorado.`);
      continue;
    }
    const { min, max } = LIMITES[campo];
    const ajustado = Math.min(max, Math.max(min, n));
    if (ajustado !== n) avisos.push(`“${campo}” ajustado de ${n} para ${ajustado} (faixa de ${min} a ${max}).`);
    values[campo] = ajustado;
    aplicados++;
  }

  if (entrada.shadow !== undefined) {
    if (typeof entrada.shadow === "string" && Object.hasOwn(SHADOWS, entrada.shadow)) {
      values.shadow = entrada.shadow as Shadow;
      aplicados++;
    } else {
      avisos.push(`“shadow” precisa ser um de: ${Object.keys(SHADOWS).join(", ")}; ignorado.`);
    }
  }

  if (aplicados === 0) {
    return { ok: false, erro: "Nenhum campo do tema foi reconhecido. Use o formato do botão “Copiar JSON”." };
  }
  const nome = typeof entrada.name === "string" ? entrada.name : undefined;
  return { ok: true, values, nome, aplicados, avisos };
}

/**
 * Pedido pronto para uma IA gerar um tema neste formato: explica cada campo e
 * leva o tema atual como exemplo. Basta acrescentar a ideia do tema no fim.
 */
export function themePromptForAi(values: ThemeValues, nome: string) {
  const cores = COLOR_GROUPS.map(
    (g) => `- ${g.title}: ${g.tokens.map((t) => `"${t.token}" (${t.label.toLowerCase()})`).join(", ")}`,
  ).join("\n");
  const numeros = (Object.keys(LIMITES) as CampoNumerico[])
    .map((c) => `- "${c}": ${LIMITES[c].descricao}; de ${LIMITES[c].min} a ${LIMITES[c].max}.`)
    .join("\n");

  return `Crie um tema visual para uma biblioteca de componentes React e responda só com um JSON válido, neste formato:

- "name": nome do tema.
- "colors": um objeto em que cada chave é um token e o valor é { "light": "#rrggbb", "dark": "#rrggbb" } (cores do modo claro e do escuro). Tokens:
${cores}
- "fontDisplay": fonte dos títulos; "fontBody": fonte do texto. Use exatamente um destes nomes: ${ALL_FONTS.map((f) => `"${f}"`).join(", ")}.
${numeros}
- "shadow": sombra de menus e balões, um de: ${Object.keys(SHADOWS).map((s) => `"${s}"`).join(", ")}.

Regras:
- Texto ("ink", "ink-2", "muted") e "accent" precisam de contraste de pelo menos 4,5:1 sobre "page" e "surface", nos dois modos.
- As 8 cores "series-*" devem ser bem diferentes entre si (são as linhas de gráficos e as categorias).
- Pode omitir campos: os que faltarem continuam como no tema atual.

Exemplo (o tema atual, "${nome}"):
${themeToJson(values, nome)}

O tema que eu quero: `;
}
