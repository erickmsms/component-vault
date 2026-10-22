# Contribuindo

**Português** · [English](CONTRIBUTING.en.md)

Contribuições são bem-vindas! Tudo entra por **pull request**: ninguém faz push direto na `main`.

Ao participar, siga o [código de conduta](CODE_OF_CONDUCT.md).

## Como contribuir

1. Faça um fork do repositório e crie uma branch a partir da `main`.
2. Instale e rode a vitrine:

   ```bash
   npm install
   npm run dev
   ```

3. Faça sua mudança. Para um componente novo, siga ["Adicionando um componente"](README.md#adicionando-um-componente) no README e as regras das miniaturas em [`docs/previews.md`](docs/previews.md).
4. Antes de abrir o PR, rode:

   ```bash
   npm run lint
   npm run check:previews
   npm run build
   ```

5. Abra o pull request para a `main` e preencha o checklist do template.

O CI roda essas mesmas checagens em todo PR, e o Vercel gera uma prévia do site para revisão.

## O que entra

Só componentes **genéricos**, que servem em qualquer projeto: tudo chega por props, sem textos ou regras do projeto de origem, e o estilo vem das classes do Tailwind e dos tokens do tema. Os detalhes estão em ["O que entra na biblioteca"](README.md#o-que-entra-na-biblioteca).

Correções, melhorias na vitrine e novos temas também são bem-vindos. Para mudanças grandes, abra uma issue antes para a gente conversar.

## Licença

Ao contribuir, você concorda que sua contribuição seja distribuída sob a [licença MIT](LICENSE) do projeto.
