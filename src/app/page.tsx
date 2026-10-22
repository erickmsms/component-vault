import type { Metadata } from "next";
import { Landing } from "@/showcase/landing";
import { REPO_URL, SITE_DESCRICAO, SITE_NOME, SITE_URL } from "@/showcase/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

// Diz ao Google que o site é um projeto de software open source, com o repositório
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  name: SITE_NOME,
  description: SITE_DESCRICAO,
  url: SITE_URL,
  codeRepository: REPO_URL,
  programmingLanguage: ["TypeScript", "React"],
  license: "https://opensource.org/licenses/MIT",
  inLanguage: "pt-BR",
  isAccessibleForFree: true,
  author: { "@type": "Person", name: "erickmsms", url: "https://github.com/erickmsms" },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // "\\u003c" escapado para o JSON não fechar a tag script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Landing />
    </>
  );
}
