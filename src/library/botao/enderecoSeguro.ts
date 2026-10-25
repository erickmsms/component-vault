/** Esquemas de link aceitos. Qualquer outro (javascript:, data:, vbscript:, file:...) é recusado. */
const ESQUEMAS_PERMITIDOS = new Set(["http", "https", "mailto", "tel", "sms"]);

/**
 * Devolve o `href` como veio quando é seguro (caminho, #âncora, ?busca ou um dos
 * esquemas http, https, mailto, tel e sms) e "#" quando não é. Os navegadores ignoram
 * espaços, tabs e quebras de linha no começo e dentro do esquema ("java\tscript:"), então
 * eles são removidos só para conferir o esquema.
 */
export function enderecoSeguro(href: string): string;
export function enderecoSeguro(href: string | undefined): string | undefined;
export function enderecoSeguro(href: string | undefined) {
  if (href === undefined) return undefined;
  const conferir = href.replace(/[\u0000- \u007f-\u009f]/g, "");
  const esquema = /^([a-z][a-z0-9+.-]*):/i.exec(conferir)?.[1];
  if (esquema === undefined) return href;
  return ESQUEMAS_PERMITIDOS.has(esquema.toLowerCase()) ? href : "#";
}
