# Previews do catálogo

Cada card do catálogo mostra a primeira variação do `stories.tsx` do componente. Regras para a miniatura ficar boa.

## Como a miniatura funciona

`FitThumbnail` ([src/showcase/scaled-thumbnail.tsx](../src/showcase/scaled-thumbnail.tsx)) ajusta sozinha:

- **Centraliza** o exemplo na horizontal e na vertical.
- **Mostra inteiro**, sem cortes: reduz a escala até caber no card.
- Testa algumas larguras de layout (200 a 800 px) e fica com a que dá a maior escala, então listas e cartões altos abrem em vez de encolherem à toa.
- Amplia componentes pequenos até 1,25×, nunca mais que isso.

Não existe zoom manual: o campo `thumbnailZoom` foi removido.

## `thumbnailWidth` no `meta.ts`

Só para blocos de tela, que dependem de breakpoints da janela (e não do card): renderiza nessa largura, como numa tela larga, e reduz para caber.

- Vale para os tipos `sections`, `pages`, `layout`, `navigation`, `charts` e `data-display`.
- Valor entre 600 e 1400.
- Em botões, campos, avisos, overlays e afins, **não use**: o ajuste automático já resolve.

## Exemplos altos demais

Se a escala fica abaixo de uns 30%, o texto some. A solução é **encurtar o primeiro exemplo** do `stories.tsx` (menos itens, menos linhas), não mexer na miniatura. Hoje passam disso: Lojas virtuais, Consultoria, Hero com Mídia, Rodapé em Colunas, Barra Lateral, Área de Upload e outros.

## Verificação automática

O pre-commit (Husky, `.husky/pre-commit`) roda `npm run check:previews` ([scripts/verificar-previews.mjs](../scripts/verificar-previews.mjs)) e barra o commit se um `meta.ts`:

- tiver `thumbnailZoom`;
- tiver `thumbnailWidth` num tipo que não está na lista acima;
- tiver `thumbnailWidth` fora de 600–1400.

O hook roda local, depois do `npm install` (o script `prepare` o ativa), e pode ser pulado com `--no-verify`. A checagem só lê os `meta.ts`: corte, centralização e escala mínima dependem do layout real e ainda não têm teste automático (seria um teste no navegador).
