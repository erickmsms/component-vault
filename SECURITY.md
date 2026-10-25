# Política de segurança

## Como relatar uma vulnerabilidade

**Não abra uma issue pública** para falhas de segurança. Use o relato privado do GitHub:

1. Abra a aba [Security](https://github.com/erickmsms/component-vault/security) do repositório.
2. Clique em **Report a vulnerability** e descreva o problema: onde está, como reproduzir e o impacto que você imagina.

Se o botão **Report a vulnerability** não aparecer, abra uma [issue](https://github.com/erickmsms/component-vault/issues/new/choose) só dizendo que quer relatar um problema de segurança, **sem detalhes técnicos**, e combinamos um canal privado.

Respondemos em até 7 dias. Se o relato se confirmar, corrigimos, publicamos a correção e damos o crédito a quem encontrou (se quiser).

## O que vale a pena relatar

- Execução de script ou injeção de CSS/HTML no site, inclusive pelo editor de tema e pelo "Colar JSON".
- Vazamento de dados de quem visita o site.
- Falhas nos componentes da biblioteca que abram brechas em quem os copia (por exemplo, links que aceitem esquemas perigosos).
- Dependências com vulnerabilidade conhecida que o `npm audit` não pegue.

O site é estático, sem login, banco de dados nem API própria. O que ele guarda no navegador está descrito em [/privacidade](https://vault-components.vercel.app/privacidade).

## Versões com suporte

Só a versão em `main` (a que está no ar) recebe correções.

---

# Security policy

## Reporting a vulnerability

**Please don't open a public issue** for security problems. Use GitHub's private reporting:

1. Open the [Security](https://github.com/erickmsms/component-vault/security) tab of the repository.
2. Click **Report a vulnerability** and describe it: where it is, how to reproduce it and the impact you expect.

If the **Report a vulnerability** button isn't shown, open an [issue](https://github.com/erickmsms/component-vault/issues/new/choose) saying only that you want to report a security problem, **with no technical details**, and we'll agree on a private channel.

We reply within 7 days. If the report is confirmed we fix it, publish the fix and credit the reporter (if you want).

## What is worth reporting

- Script execution or CSS/HTML injection on the site, including through the theme editor and "Colar JSON".
- Leaks of visitor data.
- Flaws in the library components that expose whoever copies them (for example, links that accept dangerous schemes).
- Dependencies with a known vulnerability that `npm audit` doesn't catch.

The site is static: no login, database or API of its own. What it stores in the browser is described in [/privacidade](https://vault-components.vercel.app/privacidade).

## Supported versions

Only `main` (what is live) receives fixes.
