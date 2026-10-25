import type { Metadata } from "next";
import Link from "next/link";
import { REPO_URL, SITE_NOME } from "@/showcase/site";
import { THEME_ATTR } from "@/themes/tokens";

export const metadata: Metadata = {
  title: "Privacidade",
  description: `O que o ${SITE_NOME} coleta de quem visita (quase nada) e o que fica só no seu navegador.`,
  alternates: { canonical: "/privacidade" },
};

const SECAO = "mt-10 font-display text-xl font-bold tracking-tight";
const LISTA = "mt-3 list-disc space-y-2 pl-5";

export default function PrivacidadePage() {
  return (
    <main data-theme={THEME_ATTR} className="min-h-dvh bg-page px-6 py-12 text-ink">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
          ← Voltar
        </Link>
        <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight">Privacidade</h1>
        <p className="mt-4 text-ink-2">
          O {SITE_NOME} é um catálogo aberto de componentes: não tem login, cadastro, formulário nem anúncio. Esta página
          conta, sem rodeio, o que passa por aqui.
        </p>

        <h2 className={SECAO}>O que é medido</h2>
        <ul className={LISTA}>
          <li>
            <strong>Estatísticas de visita:</strong> usamos o Vercel Web Analytics para saber quais páginas são mais vistas.
            Ele não usa cookies nem guarda um identificador seu: registra a página vista e dados gerais, como país, navegador e sistema.
          </li>
          <li>
            Não contamos visitas se o seu navegador enviar o aviso <em>Do Not Track</em> ou o <em>Global Privacy Control</em>,
            nem as miniaturas e os previews de dentro das páginas. O endereço enviado nunca leva a parte depois do “?”.
          </li>
          <li>
            A hospedagem (Vercel) mantém registros técnicos dos acessos, como qualquer servidor, para operar e proteger o site.
          </li>
        </ul>

        <h2 className={SECAO}>O que fica só no seu navegador</h2>
        <ul className={LISTA}>
          <li>
            O tema escolhido (cores, fontes, modo claro ou escuro) fica no <code>localStorage</code> e nunca é enviado a
            ninguém. Limpar os dados do site apaga isso.
          </li>
          <li>O JSON de tema que você cola no editor é lido aqui mesmo, no navegador.</li>
        </ul>

        <h2 className={SECAO}>O que não acontece</h2>
        <ul className={LISTA}>
          <li>
            As fontes e as imagens dos exemplos são servidas pelo próprio site: seu navegador não consulta o Google Fonts nem
            bancos de imagens ao navegar.
          </li>
          <li>Não vendemos nem compartilhamos dados, e não há rastreadores de publicidade.</li>
        </ul>

        <h2 className={SECAO}>Links para fora</h2>
        <p className="mt-3">
          Ao clicar em um link para o GitHub, você passa a seguir a política de privacidade deles. O código deste site é
          público em{" "}
          <a href={REPO_URL} className="underline underline-offset-4 hover:text-accent">
            {REPO_URL.replace("https://", "")}
          </a>
          , então tudo o que está descrito aqui pode ser conferido.
        </p>

        <h2 className={SECAO}>Dúvidas e falhas de segurança</h2>
        <p className="mt-3">
          Para dúvidas sobre privacidade, abra uma issue no repositório. Para relatar uma falha de segurança, siga o{" "}
          <a href={`${REPO_URL}/security/policy`} className="underline underline-offset-4 hover:text-accent">
            SECURITY.md
          </a>
          .
        </p>
      </div>
    </main>
  );
}
