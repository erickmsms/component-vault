# Component Vault

Biblioteca pessoal de componentes React **genéricos**, garimpados de outros projetos, com uma vitrine em Next.js para navegar por **tipo**, **tema** e **projeto de origem**, com busca e preview de cada componente.

## Rodando

```bash
npm install
npm run dev
```

Abre em http://localhost:3000.

## Estrutura

```
src/
  library/<slug>/        um componente por pasta
    <Nome>.tsx           o componente em si (pode ter mais arquivos)
    demo.tsx             export default com exemplos de uso (vira o preview)
    meta.ts              metadados: nome, tipo, temas, projeto de origem...
  themes/<tema>.css      tokens de cor e fonte que os componentes usam (bg-page, text-ink...)
  registry/
    index.ts             lista de metadados (registre o meta.ts aqui)
    demos.tsx            mapa slug -> demo (registre o demo.tsx aqui)
    categories.ts        tipos disponíveis e a ordem das seções
    types.ts             formato do meta.ts
  showcase/              UI da vitrine (catálogo, cards, preview, código)
  app/                   rotas: / (catálogo) e /components/[slug] (detalhe)
```

## O que entra na biblioteca

Só componentes **genéricos**, que servem em qualquer projeto:

- Tudo chega por props: textos, dados, cores e formatação. Nada de tipos, cálculos ou textos do domínio do projeto de origem (ao trazer um componente de um projeto, tire essa parte e troque por props).
- Valores para exibir chegam já formatados (`valor: "R$ 48 mil"`), ou o componente aceita uma função de formatação (`formatarValor`, `formatar`).
- Nenhum import de fora da biblioteca, além de React. Um componente pode usar outros da biblioteca (`@/library/<slug>/<Arquivo>`).
- Estilo pelos tokens do tema (`bg-page`, `text-ink`, `border-rule`, `var(--series-1)`...), para que outro projeto troque as cores redefinindo as variáveis.
- A demo usa dados de exemplo genéricos, escritos na própria demo.

## Adicionando um componente

1. Crie `src/library/<slug>/` com o componente, um `demo.tsx` e um `meta.ts` (use `src/library/aviso/` como modelo). O `slug` do meta tem que ser igual ao nome da pasta.
2. Importe o `meta` em `src/registry/index.ts` e a demo em `src/registry/demos.tsx`.
3. Se o componente precisar de pacotes npm, instale-os e liste em `dependencies` no meta.

A página de detalhe mostra todos os arquivos da pasta (menos o `meta.ts`) e, em "Para usar em outro projeto, copie também", os outros componentes de que ele depende (diretos e indiretos) e os tokens do tema.

### Temas

Os tokens ficam em `src/themes/<tema>.css`, escopados em `[data-theme="<tema>"]`, com as versões clara e escura em `light-dark()`. O preview aplica o tema pelo `theme` do meta e troca o modo com os botões Claro/Escuro. Um tema novo precisa ser importado em `src/app/globals.css`, e as fontes dele carregadas em `src/app/layout.tsx`.

Para usar um componente em outro projeto, copie a pasta dele, as dos componentes de que depende e o CSS do tema (ou defina as mesmas variáveis com as cores do projeto).

### Campos do `meta.ts`

| Campo            | Uso                                                                  |
| ---------------- | -------------------------------------------------------------------- |
| `category`       | Tipo (filtro "Tipo" e seção do catálogo). Valores em `categories.ts` |
| `tags`           | Temas livres (filtro "Tema"): `dropdown`, `kpi`, `tooltip`...        |
| `source`         | Projeto de origem (filtro "Projeto de origem")                       |
| `dependencies`   | Pacotes npm exibidos na página do componente                         |
| `background`     | Fundo padrão do preview: `light`, `dark` ou `dots`                   |
| `theme`          | Tema cujos tokens o componente usa (`src/themes/<tema>.css`)         |
| `thumbnailWidth` | Largura (px) da miniatura no catálogo, para seções e páginas         |

## Filtros pela URL

Os filtros ficam na URL, então dá pra salvar ou compartilhar uma visão:

- `/?tipo=forms`
- `/?tema=dropdown,filtro` (combina temas)
- `/?projeto=climatempo`

## Origem dos componentes

| Projeto      | Origem                              | Componentes |
| ------------ | ----------------------------------- | ----------- |
| `climatempo` | `webscreaping-climatempo/dashboard` | 17          |
