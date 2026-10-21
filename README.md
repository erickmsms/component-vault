# Component Vault

Biblioteca pessoal de componentes React reaproveitados de outros projetos, com uma vitrine em Next.js para navegar por **tipo**, **tema** e **projeto de origem**, com busca e preview de cada componente.

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
    <nome>.tsx           o componente em si (pode ter mais arquivos)
    demo.tsx             export default com exemplos de uso (vira o preview)
    meta.ts              metadados: nome, tipo, temas, projeto de origem...
  registry/
    index.ts             lista de metadados (registre o meta.ts aqui)
    demos.tsx            mapa slug -> demo (registre o demo.tsx aqui)
    categories.ts        tipos disponíveis e a ordem das seções
    types.ts             formato do meta.ts
  showcase/              UI da vitrine (catálogo, cards, preview, código)
  app/                   rotas: / (catálogo) e /components/[slug] (detalhe)
```

## Adicionando um componente

1. Crie `src/library/<slug>/` com o componente, um `demo.tsx` e um `meta.ts` (use `src/library/button/` como modelo). O `slug` do meta tem que ser igual ao nome da pasta.
2. Importe o `meta` em `src/registry/index.ts` e a demo em `src/registry/demos.tsx`.
3. Se o componente precisar de pacotes npm, instale-os e liste em `dependencies` no meta.

A página de detalhe mostra automaticamente todos os arquivos da pasta (menos o `meta.ts`).

### Campos do `meta.ts`

| Campo          | Uso                                                                 |
| -------------- | ------------------------------------------------------------------- |
| `category`     | Tipo (filtro "Tipo" e seção do catálogo). Valores em `categories.ts` |
| `tags`         | Temas livres (filtro "Tema"): `dark`, `dashboard`, `animação`...    |
| `source`       | Projeto de origem (filtro "Projeto de origem")                      |
| `dependencies` | Pacotes npm exibidos na página do componente                        |
| `background`   | Fundo padrão do preview: `light`, `dark` ou `dots`                  |

## Filtros pela URL

Os filtros ficam na URL, então dá pra salvar ou compartilhar uma visão:

- `/?tipo=buttons`
- `/?tema=dark,dashboard` (combina temas)
- `/?projeto=meu-projeto`

## Componentes de exemplo

`alert`, `badge`, `button` e `stat-card` (projeto `exemplo`) existem só para demonstrar a vitrine. Remova as pastas e os registros quando os componentes reais chegarem.
