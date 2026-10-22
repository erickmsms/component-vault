# Component Vault

[Português](README.md) · **English**

Open source library of **generic** React components, with a Next.js showcase to browse them by **type**, **topic** and **source project**, try each component with different themes, fonts and screen sizes, and tweak its props live. No login: just open it and use it.

Live at **https://vault-components.vercel.app**. Contributions are welcome via pull request: see [CONTRIBUTING.en.md](CONTRIBUTING.en.md).

> The showcase UI and the code (component names, props, routes, scripts) are in Portuguese. This document translates the docs only; identifiers are kept as they appear in the code.

## Running

```bash
npm install
npm run dev
```

Opens at http://localhost:3000.

## What the showcase does

- **Landing** (`/`): the first screen, with the site's brand (fixed colors and font, they don't follow the theme). "Ver componentes" or a click on the red block scrolls down to the catalog with a transition. Old links with filters (`/?tipo=...`) are redirected to `/componentes`.
- **Catalog** (`/componentes`) with search and filters in a sidebar that stays put while scrolling (it is the library's own **Barra de Filtros** component, with **Filtros Ativos** above the results): topic and source project use the library's own Seletor Múltiplo (with search and counts; multiple selections combine as "any of"), and type is a list with counts. Active filters show up as removable pills above the results, with "Limpar tudo" (clear all), and live in the URL so they can be shared: `/componentes?tipo=forms&tema=dropdown,kpi&projeto=nexco,acktalabs`.
- **Global theme in the header** ("Aparência" menu): five ready-made themes (Editorial, Minimalista, Corporativo, Acolhedor, Brutalista), Light / Dark / System mode, and the heading and body fonts (any Google Fonts family). It applies to the catalog, the previews and the header itself.
- **Theme editor** ("Editar tema…" in the Aparência menu, in a floating card): colors of each token in both modes, a brand color that generates the accent and tints the neutrals, WCAG contrast for text/background pairs, fonts, text size, heading scale, roundness, density and shadow.
  - **Theme JSON:** "Copiar JSON" copies the whole theme; "Colar JSON" applies a pasted theme (partial themes and the ```` ```json ```` block AIs produce are accepted, and it tells you what was ignored); "Copiar prompt para IA" copies a prompt that explains the format, so you can generate themes in ChatGPT and paste them back.
  - **Export:** "Baixar .css" generates a single file for another project using Tailwind 4.
- **Compare** (`/comparar?a=botao&b=botao-flutuante`): in the catalog, **Ctrl (or Cmd) + click** on two cards (or the `+` button in each card's corner) opens a bar at the bottom of the screen with a "Comparar" button. The page shows both side by side, each with its variations, screen sizes and playground. Selecting a third one drops the oldest.
- **Gradients** (`/gradientes`, via the round shortcut in the header): gradient generator with color blobs over a background, presets and CSS copy.
- **Component page:**
  - the filter bar stays on the left: changing a filter or searching takes you to the filtered catalog. At the top, the clickable breadcrumb (`Botões → Botão Flutuante`) leads to the catalog for that type;
  - preview in an iframe, with variations as tabs, screen sizes (phone, tablet, laptop, desktop: breakpoints really respond) and a dotted background;
  - playground to tweak props live;
  - props table generated from the TypeScript types;
  - the code, and what to copy along with it to use it in another project.

## Structure

```
src/
  library/<slug>/        one component per folder
    <Nome>.tsx           the component itself (may have more files)
    stories.tsx          variations and playground (becomes the preview and the thumbnail)
    meta.ts              metadata: name, type, topics, source project...
  themes/
    tokens.ts            token list and theme CSS generation
    presets.ts           the ready-made themes
    tokens.css           bridge between the tokens and the Tailwind classes
    fonts.ts, color.ts, json.ts   fonts, colors/contrast and the theme JSON
  registry/
    index.ts             metadata list (generated: npm run registro)
    all-stories.tsx      slug -> stories map (generated: npm run registro)
    stories.tsx          variation format (defineStories)
    props.ts             reads props from the TypeScript types
    categories.ts        available types and section order
  showcase/              showcase UI (landing, catalog, preview, playground, theme)
  app/
    page.tsx             the landing (/)
    (vitrine)/           /componentes, /components/[slug], /comparar and /gradientes
    preview/[slug]/      the page rendered inside the preview iframe
scripts/
  gerar-registro.mjs     builds the registry from the src/library folders
```

## What goes into the library

Only **generic** components, usable in any project:

- Everything comes in through props: text, data, colors and formatting. No types, calculations or copy from the source project's domain (when bringing a component over from a project, strip that out and replace it with props).
- Display values arrive already formatted (`valor: "R$ 48 mil"`), or the component accepts a formatting function (`formatarValor`, `formatar`).
- No imports from outside the library, other than React. A component may use others from the library (`@/library/<slug>/<Arquivo>`).
- Styling only through regular Tailwind classes and the theme's color tokens (`bg-page`, `text-ink`, `border-rule`, `var(--series-1)`...). No hard-coded values like `text-[13px]` or `#hex`: the theme controls text sizes, spacing and radii by redefining the variables Tailwind uses (`--text-*`, `--spacing`, `--radius-*`). For floating shadows, use `shadow-flutuante`.
- Action buttons use the library's `Botao` (`@/library/botao/Botao`), not a hand-made `<button>`. To make its radius concentric with its container, set `--raio-do-botao` on the container, e.g. `[--raio-do-botao:max(var(--radius-sm),calc(var(--radius-xl)_-_var(--spacing)*4))]` (outer radius minus the distance to the edge); without it, `--radius-lg` applies.
- Document props with `/** */`: the comment becomes the description in the props table.
- No animation dependencies: CSS, IntersectionObserver and native scrolling. Use `src/library/revelar/Movimento.tsx`: `useSemMovimento()` (respects the system's "reduce motion" and `ProvedorDeMovimento`), `useEmTela()` and `CURVA_SUAVE`. With motion off, the component renders straight in its final state (catalog thumbnails rely on this).
- Inline SVG icons; when the icon is the user's choice, it becomes a `ReactNode` prop.

## Adding a component

1. Create `src/library/<slug>/` with the component, a `stories.tsx` and a `meta.ts` (use `src/library/aviso/` as a template). The meta's `slug` must match the folder name.
2. Registration is automatic: `npm run dev` and `npm run build` run `npm run registro` first, which regenerates `src/registry/index.ts` and `all-stories.tsx` from the folders. If the server is already running, run `npm run registro` by hand.
3. If the component needs npm packages, install them and list them under `dependencies` in the meta.

### Variations (`stories.tsx`)

```tsx
export default defineStories({
  args: { tipo: "info", texto: "Os dados são atualizados todo dia." }, // playground values
  controls: { tipo: { type: "select", options: ["info", "erro"] }, texto: { type: "text" } },
  render: (a) => <Aviso tipo={a.tipo as TipoDeAviso}>{a.texto}</Aviso>,
  stories: [
    { name: "Info" },                                    // uses the default args
    { name: "Erro", args: { tipo: "erro" } },            // overrides some args
    { name: "Todos os tipos", render: () => <>...</> },  // fixed composition, no playground
  ],
});
```

Controls: `text`, `number` (`min`, `max`, `step`), `boolean`, `select` (`options`) and `color`. Don't use hooks directly in `render`: create an example component in the same file (as in `seletor-multiplo/stories.tsx`).

**The first variation is the catalog thumbnail and what opens on the component page:** it shows **a single instance**, in its default state, preferably using the `args` (so the playground shows up). Compositions like "all types", "sizes" or "several side by side" come after, as their own variations. When the folder exports more than one component (Etiqueta, Chip and Contador, for example), `render` shows one at a time, picked by a `mostrar` control.

### `meta.ts` fields

| Field            | Purpose                                                                    |
| ---------------- | -------------------------------------------------------------------------- |
| `category`       | Type ("Tipo" filter and catalog section). Values in `categories.ts`        |
| `tags`           | Free-form topics ("Tema" filter): `dropdown`, `kpi`, `tooltip`...          |
| `source`         | Source project ("Projeto de origem" filter)                                |
| `dependencies`   | npm packages shown on the component page                                   |
| `thumbnailWidth` | Width (px) of the catalog thumbnail, for sections and pages                |
| `previewHeight`  | Fixed height (px) of the preview iframe, which scrolls inside: for components that react to scrolling |

Catalog thumbnail rules (and the pre-commit hook that checks them): [docs/previews.md](docs/previews.md) (in Portuguese).

## Themes

A theme is a set of values (`ThemeValues` in `src/themes/tokens.ts`): the colors of each token in light and dark modes, the fonts, text size, heading scale, roundness, density and shadow. `themeCss()` turns that into the CSS variables components read inside `[data-theme="vault"]`.

- **New ready-made theme:** add it to `src/themes/presets.ts`. If it uses a font that isn't in `src/themes/fonts.ts`, it's loaded from Google Fonts on the fly; to load it with the page, add it to `src/app/layout.tsx` and to `LOCAL_FONTS`.
- **Theme for another project:** build it in the editor and use "Baixar .css". The file has the Tailwind bridge and the tokens in `:root`; import it after `@import "tailwindcss"`.
- The theme choice is kept in the browser's `localStorage` and applied before the page appears (no flash). Preview iframes get changes instantly.

### JSON format

```json
{
  "name": "My theme",
  "colors": { "accent": { "light": "#1a56db", "dark": "#7aa2f7" }, "page": "#ffffff" },
  "fontDisplay": "Archivo",
  "fontBody": "Inter",
  "textBase": 16,
  "textScale": 1.25,
  "radius": 8,
  "density": 1,
  "shadow": "soft"
}
```

A single color (`"page": "#ffffff"`) applies to both modes. Missing fields keep their current theme values. The color tokens and each number's range are in the prompt from the "Copiar prompt para IA" button.

## License

[MIT](LICENSE).
