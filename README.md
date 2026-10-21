# Component Vault

Biblioteca pessoal de componentes React **genéricos**, garimpados de outros projetos, com uma vitrine em Next.js para navegar por **tipo**, **tema** e **projeto de origem**, testar cada componente com temas, fontes e tamanhos de tela diferentes e mexer nas props ao vivo.

## Rodando

```bash
npm install
npm run dev
```

Abre em http://localhost:3000.

## O que a vitrine faz

- **Catálogo** com busca e filtros na lateral, que fica parada ao rolar a página (é o componente **Barra de Filtros** da própria biblioteca, com **Filtros Ativos** acima dos resultados): tema e projeto de origem no próprio Seletor Múltiplo da biblioteca (com busca e contagem; vários marcados combinam por "qualquer um") e tipo numa lista com contagem. Os filtros ativos aparecem em pílulas removíveis acima dos resultados, com "Limpar tudo", e ficam na URL para compartilhar: `/?tipo=forms&tema=dropdown,kpi&projeto=nexco,acktalabs`.
- **Tema global no cabeçalho:** cinco temas prontos (Editorial, Minimalista, Corporativo, Acolhedor, Brutalista), modo Claro / Escuro / Sistema e troca das fontes de títulos e texto (qualquer família do Google Fonts). Vale para o catálogo, os previews e o próprio cabeçalho.
- **Editor de tema** (botão "Editar tema"): cores de cada token nos dois modos, cor da marca que gera o destaque e tinge os neutros, contraste WCAG dos pares de texto e fundo, fontes, tamanho do texto, escala dos títulos, arredondamento, densidade e sombra.
  - **JSON do tema:** "Copiar JSON" copia o tema inteiro; "Colar JSON" aplica um tema colado (aceita parcial e o bloco ```` ```json ```` das IAs, e avisa o que foi ignorado); "Copiar prompt para IA" copia um pedido que explica o formato, para gerar temas no ChatGPT e colar de volta.
  - **Exportar:** um `.css` único para outro projeto com Tailwind 4.
- **Fundamentos** (`/fundamentos`): todos os tokens do tema atual em amostras.
- **Página de cada componente:**
  - a barra de filtros continua à esquerda (só nos Fundamentos ela some): mexer num filtro ou buscar leva para o catálogo já filtrado. No topo, o caminho clicável (`Botões → Botão Flutuante`) leva ao catálogo do tipo;
  - preview num iframe, com as variações em abas, tamanhos de tela (celular, tablet, notebook, desktop: os breakpoints respondem de verdade) e fundo pontilhado;
  - playground para mexer nas props ao vivo;
  - tabela de props gerada dos tipos TypeScript;
  - o código e o que copiar junto para usar em outro projeto.

## Estrutura

```
src/
  library/<slug>/        um componente por pasta
    <Nome>.tsx           o componente em si (pode ter mais arquivos)
    stories.tsx          variações e playground (vira o preview e a miniatura)
    meta.ts              metadados: nome, tipo, temas, projeto de origem...
  themes/
    tokens.ts            lista de tokens e geração do CSS do tema
    presets.ts           os temas prontos
    tokens.css           ponte entre os tokens e as classes do Tailwind
    fonts.ts, color.ts, json.ts   fontes, cores/contraste e o JSON do tema
  registry/
    index.ts             lista de metadados (gerado: npm run registro)
    all-stories.tsx      mapa slug -> stories (gerado: npm run registro)
    stories.tsx          formato das variações (defineStories)
    props.ts             leitura das props pelos tipos TypeScript
    categories.ts        tipos disponíveis e a ordem das seções
  showcase/              UI da vitrine (catálogo, preview, playground, tema)
  app/
    (vitrine)/           catálogo, /components/[slug] e /fundamentos
    preview/[slug]/      a página que vai dentro do iframe de preview
scripts/
  gerar-registro.mjs     monta o registro a partir das pastas de src/library
```

## O que entra na biblioteca

Só componentes **genéricos**, que servem em qualquer projeto:

- Tudo chega por props: textos, dados, cores e formatação. Nada de tipos, cálculos ou textos do domínio do projeto de origem (ao trazer um componente de um projeto, tire essa parte e troque por props).
- Valores para exibir chegam já formatados (`valor: "R$ 48 mil"`), ou o componente aceita uma função de formatação (`formatarValor`, `formatar`).
- Nenhum import de fora da biblioteca, além de React. Um componente pode usar outros da biblioteca (`@/library/<slug>/<Arquivo>`).
- Estilo só por classes comuns do Tailwind e pelos tokens de cor do tema (`bg-page`, `text-ink`, `border-rule`, `var(--series-1)`...). Nada de valores fixos como `text-[13px]` ou `#hex`: o tema controla tamanhos de texto, espaçamento e raios redefinindo as variáveis que o Tailwind usa (`--text-*`, `--spacing`, `--radius-*`). Para sombras flutuantes, use `shadow-flutuante`.
- Comente as props com `/** */`: o comentário vira a descrição na tabela de props.
- Sem dependências de animação: CSS, IntersectionObserver e rolagem nativa. Use `src/library/revelar/Movimento.tsx`: `useSemMovimento()` (respeita "reduzir movimento" do sistema e o `ProvedorDeMovimento`), `useEmTela()` e `CURVA_SUAVE`. Com movimento desligado, o componente aparece direto no estado final (as miniaturas do catálogo usam isso).
- Ícones em SVG inline; quando o ícone é escolha de quem usa, vira prop `ReactNode`.

## Adicionando um componente

1. Crie `src/library/<slug>/` com o componente, um `stories.tsx` e um `meta.ts` (use `src/library/aviso/` como modelo). O `slug` do meta tem que ser igual ao nome da pasta.
2. O registro é automático: `npm run dev` e `npm run build` rodam `npm run registro` antes, que regenera `src/registry/index.ts` e `all-stories.tsx` a partir das pastas. Com o servidor já rodando, rode `npm run registro` à mão.
3. Se o componente precisar de pacotes npm, instale-os e liste em `dependencies` no meta.

### Variações (`stories.tsx`)

```tsx
export default defineStories({
  args: { tipo: "info", texto: "Os dados são atualizados todo dia." }, // valores do playground
  controls: { tipo: { type: "select", options: ["info", "erro"] }, texto: { type: "text" } },
  render: (a) => <Aviso tipo={a.tipo as TipoDeAviso}>{a.texto}</Aviso>,
  stories: [
    { name: "Info" },                                    // usa os args padrão
    { name: "Erro", args: { tipo: "erro" } },            // muda alguns args
    { name: "Todos os tipos", render: () => <>...</> },  // composição fixa, sem playground
  ],
});
```

Controles: `text`, `number` (`min`, `max`, `step`), `boolean`, `select` (`options`) e `color`. Não use hooks direto no `render`: crie um componente de exemplo no próprio arquivo (como em `seletor-multiplo/stories.tsx`).

**A primeira variação é a miniatura do catálogo e o que abre na página do componente:** ela mostra **uma instância só**, no estado padrão, de preferência usando os `args` (assim o playground já aparece). Composições como "todos os tipos", "tamanhos" ou "vários lado a lado" vêm depois, como variações próprias. Quando a pasta exporta mais de um componente (Etiqueta, Chip e Contador, por exemplo), o `render` mostra um por vez, escolhido por um controle `mostrar`.

### Campos do `meta.ts`

| Campo            | Uso                                                                  |
| ---------------- | -------------------------------------------------------------------- |
| `category`       | Tipo (filtro "Tipo" e seção do catálogo). Valores em `categories.ts` |
| `tags`           | Temas livres (filtro "Tema"): `dropdown`, `kpi`, `tooltip`...        |
| `source`         | Projeto de origem (filtro "Projeto de origem")                       |
| `dependencies`   | Pacotes npm exibidos na página do componente                         |
| `thumbnailWidth` | Largura (px) da miniatura no catálogo, para seções e páginas         |
| `thumbnailZoom`  | Zoom da miniatura de componentes pequenos (padrão 0.75)              |
| `previewHeight`  | Altura fixa (px) do iframe de preview, que rola por dentro: para componentes que reagem à rolagem |

## Temas

Um tema é um conjunto de valores (`ThemeValues` em `src/themes/tokens.ts`): as cores de cada token nos modos claro e escuro, as fontes, o tamanho do texto, a escala dos títulos, o arredondamento, a densidade e a sombra. `themeCss()` transforma isso nas variáveis CSS que os componentes leem dentro de `[data-theme="vault"]`.

- **Tema novo pronto:** acrescente em `src/themes/presets.ts`. Se usar uma fonte que não está em `src/themes/fonts.ts`, ela é carregada do Google Fonts na hora; para carregar junto com a página, adicione no `src/app/layout.tsx` e em `LOCAL_FONTS`.
- **Tema para outro projeto:** monte no editor e use "Baixar .css". O arquivo tem a ponte com o Tailwind e os tokens em `:root`; importe depois de `@import "tailwindcss"`.
- A escolha de tema fica no `localStorage` do navegador e é aplicada antes da página aparecer (sem piscar). Os iframes de preview recebem as mudanças na hora.

### Formato do JSON

```json
{
  "name": "Meu tema",
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

Uma cor só (`"page": "#ffffff"`) vale para os dois modos. Campos que faltarem continuam como no tema atual. Os tokens de cor e as faixas de cada número estão no prompt do botão "Copiar prompt para IA".

## Origem dos componentes

| Projeto      | Origem                                      | Componentes |
| ------------ | ------------------------------------------- | ----------- |
| `acktalabs`  | `AcktaLabs1/acktalabstask/frontend` (app)    | 20          |
| `nexco`      | `SiteNexcoBioform/site_nexcobioformula` (site) | 16        |
| `climatempo` | `webscreaping-climatempo/dashboard`         | 15          |
| `component-vault` | criado aqui (a barra de filtros do catálogo) | 1      |
| `heroui`     | documentação do Button do HeroUI v3 (recriado, sem a dependência) | 1 |
| `shadcn`     | documentação do Button do shadcn/ui (recriado, sem a dependência) | 1 |

Os componentes vieram genéricos: o que era do domínio (textos, rotas, APIs, stores) virou props, as cores viraram tokens do tema, e as dependências dos projetos (GSAP, lucide-react, recharts, sonner, dnd-kit, react-hook-form, react-imask) foram trocadas por código próprio. O Campo de Formulário junta o melhor dos dois projetos.
