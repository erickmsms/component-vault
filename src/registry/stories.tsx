import type { ReactNode } from "react";

/** Controle do playground para uma prop. */
export type Control =
  | { type: "text"; label?: string }
  | { type: "number"; label?: string; min?: number; max?: number; step?: number }
  | { type: "boolean"; label?: string }
  | { type: "select"; label?: string; options: readonly string[] }
  | { type: "color"; label?: string };

export type ArgValue = string | number | boolean;
export type Args = Record<string, ArgValue>;

// O limite é Record<string, unknown> (e não Args) para o TypeScript inferir
// `boolean` em vez de `true`/`false` literais a partir dos valores padrão.
type ArgsShape = Record<string, unknown>;

export type Story<A extends ArgsShape> = {
  name: string;
  /** Valores do playground nesta variação (sobre os padrões). */
  args?: Partial<A>;
  /** Composição própria (várias instâncias, layout...): esta variação não tem playground. */
  render?: () => ReactNode;
};

/**
 * Exemplos de um componente (o `stories.tsx` de cada pasta). `render` monta o
 * componente a partir dos valores do playground; não use hooks direto nele
 * (crie um componente de exemplo, como em seletor-multiplo/stories.tsx).
 */
export type StoriesModule<A extends ArgsShape = Args> = {
  /** Valores iniciais do playground. */
  args: A;
  controls: { [K in keyof A]?: Control };
  render(args: A): ReactNode;
  /** A primeira variação aparece no card do catálogo. */
  stories: Story<A>[];
};

export function defineStories<A extends ArgsShape>(exemplos: StoriesModule<A>) {
  return exemplos as unknown as StoriesModule;
}

export function storyArgs(exemplos: StoriesModule, index: number): Args {
  return { ...exemplos.args, ...exemplos.stories[index]?.args } as Args;
}

/** Renderiza uma variação, com os valores do playground quando ela os usa. */
export function StoryView({ exemplos, index = 0, args }: { exemplos: StoriesModule; index?: number; args?: Args }) {
  const story = exemplos.stories[index] ?? exemplos.stories[0];
  return <>{story.render ? story.render() : exemplos.render(args ?? storyArgs(exemplos, index))}</>;
}
