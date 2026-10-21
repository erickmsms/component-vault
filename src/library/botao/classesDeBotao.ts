/**
 * As classes do Botao, num módulo SEM "use client".
 *
 * Por que separado do componente: no Next, todo export de um módulo cliente vira
 * referência de cliente, e chamar uma função dele no servidor quebra ("Attempted
 * to call classesDeBotao() from the server"). Uma página 404 ou de erro que só
 * precisa de um link com cara de botão não tem por que virar cliente para pegar
 * uma string de classes. A regra: o que é pura aparência mora aqui; o que usa
 * hook ou evento mora em Botao.tsx.
 */

// `[&_svg...]`: ícones sem tamanho próprio ficam com size-4; quem passa `size-5` no SVG mantém o seu.
const BASE =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap select-none transition-colors outline-accent focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

// Todas as variantes têm borda (transparente quando não aparece) para as alturas baterem lado a lado.
export const VARIANTES_DE_BOTAO = {
  /** Ação principal da tela. */
  primaria: "border border-transparent bg-accent text-page hover:bg-accent/85",
  /** Ação de apoio ao lado da principal (Cancelar, Voltar). */
  secundaria: "border border-rule bg-surface text-ink hover:border-rule-strong",
  /** Ação destrutiva (Excluir, Remover). */
  perigo: "border border-critical/30 bg-critical/10 text-critical hover:bg-critical/20",
  /** Sem caixa: ação terciária, barra de ferramentas, item de menu. */
  fantasma: "border border-transparent text-ink-2 hover:bg-surface hover:text-ink",
  /** Contorno na cor de destaque: ação intermediária ("Pré-visualizar"). */
  contorno: "border border-accent text-accent hover:bg-accent/10",
} as const;

// Altura fixa (e não só padding) para botão e campo do mesmo tamanho baterem.
export const TAMANHOS_DE_BOTAO = {
  /** Denso: célula de tabela, linha de lista, barra de ferramentas. */
  sm: "h-8 px-3 text-xs",
  /** Padrão. */
  md: "h-10 px-4 text-sm",
  /** Formulários e telas com mais respiro. */
  lg: "h-12 px-5 text-base",
  /** Quadrado, só com ícone (passe `aria-label`). */
  icone: "size-10 px-0",
  /** Quadrado denso, para a barra de ações de uma linha de lista (passe `aria-label`). */
  "icone-sm": "size-8 px-0",
} as const;

export type VarianteDeBotao = keyof typeof VARIANTES_DE_BOTAO;
export type TamanhoDeBotao = keyof typeof TAMANHOS_DE_BOTAO;

/**
 * As classes do botão, para quando o elemento NÃO pode ser um `<button>`: um
 * `<a href>` ou `<a download>` que precisa parecer botão. Em todo o resto use o
 * `<Botao>`: trocar um botão de verdade por um link estilizado quebra teclado e
 * leitor de tela. Para desabilitar um link, use `aria-disabled="true"`.
 *
 * `className` é somado no fim, sem mesclar: não serve para trocar uma classe que
 * já existe (cor, altura); para isso, escolha outra variante ou tamanho.
 */
export function classesDeBotao({
  variante = "secundaria",
  tamanho = "md",
  bloco = false,
  className = "",
}: {
  variante?: VarianteDeBotao;
  tamanho?: TamanhoDeBotao;
  /** Ocupa a largura do contêiner. */
  bloco?: boolean;
  className?: string;
} = {}) {
  return [BASE, VARIANTES_DE_BOTAO[variante], TAMANHOS_DE_BOTAO[tamanho], bloco ? "w-full" : "", className]
    .filter(Boolean)
    .join(" ");
}
