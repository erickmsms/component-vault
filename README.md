# Component Vault

**Português** · [English](README.en.md)

Biblioteca open source de componentes React **genéricos**, com uma vitrine em Next.js para navegar por **tipo**, **tema** e **projeto de origem**, testar cada componente com temas, fontes e tamanhos de tela diferentes e mexer nas props ao vivo. Sem login: abre e usa.

No ar em **https://vault-components.vercel.app**. Contribuições são bem-vindas por pull request: veja o [CONTRIBUTING.md](CONTRIBUTING.md).

## Rodando

```bash
npm install
npm run dev
```

Abre em http://localhost:3000.

## O que a vitrine faz

- **Landing** (`/`): a primeira tela, com a marca do site (cores e fonte fixas, não seguem o tema). "Ver componentes" ou um clique no bloco vermelho descem para o catálogo com uma transição. Links antigos com filtros (`/?tipo=...`) são redirecionados para `/componentes`.
- **Catálogo** (`/componentes`) com busca e filtros na lateral, que fica parada ao rolar a página (é o componente **Barra de Filtros** da própria biblioteca, com **Filtros Ativos** acima dos resultados): tema e projeto de origem no próprio Seletor Múltiplo da biblioteca (com busca e contagem; vários marcados combinam por "qualquer um") e tipo numa lista com contagem. Os filtros ativos aparecem em pílulas removíveis acima dos resultados, com "Limpar tudo", e ficam na URL para compartilhar: `/componentes?tipo=forms&tema=dropdown,kpi&projeto=nexco,acktalabs`.
- **Tema global no cabeçalho** (menu "Aparência"): cinco temas prontos (Editorial, Minimalista, Corporativo, Acolhedor, Brutalista), modo Claro / Escuro / Sistema e troca das fontes de títulos e texto (qualquer família do Google Fonts). Vale para o catálogo, os previews e o próprio cabeçalho.
- **Editor de tema** ("Editar tema…" no menu Aparência, num card flutuante): cores de cada token nos dois modos, cor da marca que gera o destaque e tinge os neutros, contraste WCAG dos pares de texto e fundo, fontes, tamanho do texto, escala dos títulos, arredondamento, densidade e sombra.
  - **JSON do tema:** "Copiar JSON" copia o tema inteiro; "Colar JSON" aplica um tema colado (aceita parcial e o bloco ```` ```json ```` das IAs, e avisa o que foi ignorado); "Copiar prompt para IA" copia um pedido que explica o formato, para gerar temas no ChatGPT e colar de volta.
  - **Exportar:** "Baixar .css" gera um arquivo único para outro projeto com Tailwind 4.
- **Comparar** (`/comparar?a=botao&b=botao-flutuante`): no catálogo, **Ctrl (ou Cmd) + clique** em dois cards (ou o botão `+` no canto de cada um) abre uma barra no pé da tela com o botão "Comparar". A página mostra os dois lado a lado, cada um com suas variações, tamanhos de tela e playground. Marcar um terceiro tira o mais antigo.
- **Gradientes** (`/gradientes`, pelo atalho redondo no cabeçalho): gerador de gradientes com manchas de cor sobre um fundo, presets e cópia do CSS.
- **Página de cada componente:**
  - a barra de filtros continua à esquerda: mexer num filtro ou buscar leva para o catálogo já filtrado. No topo, o caminho clicável (`Botões → Botão Flutuante`) leva ao catálogo do tipo;
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
  showcase/              UI da vitrine (landing, catálogo, preview, playground, tema)
  app/
    page.tsx             a landing (/)
    (vitrine)/           /componentes, /components/[slug], /comparar e /gradientes
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
- Botões de ação usam o `Botao` da biblioteca (`@/library/botao/Botao`), não um `<button>` próprio. Para o raio ficar concêntrico ao contêiner, defina `--raio-do-botao` nele, como em `[--raio-do-botao:max(var(--radius-sm),calc(var(--radius-xl)_-_var(--spacing)*4))]` (raio de fora menos a distância até a borda); sem isso, vale `--radius-lg`.
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
| `previewHeight`  | Altura fixa (px) do iframe de preview, que rola por dentro: para componentes que reagem à rolagem |

Regras das miniaturas do catálogo (e o pre-commit que as confere): [docs/previews.md](docs/previews.md).

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

## Licença

[MIT](LICENSE).
