import type { Metadata } from "next";
import { AnalyticsComPrivacidade } from "@/showcase/analytics";
import { SITE_DESCRICAO, SITE_NOME, SITE_TITULO, SITE_URL } from "@/showcase/site";
import { THEME_HEAD_SCRIPT } from "@/showcase/theme/head-script";
import { ThemeSync } from "@/showcase/theme/theme-sync";
import { DEFAULT_PRESET, presetValues } from "@/themes/presets";
import { themeCss } from "@/themes/tokens";
import { CLASSES_DAS_FONTES } from "./fontes";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITULO, template: `%s · ${SITE_NOME}` },
  description: SITE_DESCRICAO,
  applicationName: SITE_NOME,
  keywords: [
    "biblioteca de componentes",
    "componentes React",
    "component library",
    "React",
    "Next.js",
    "Tailwind CSS",
    "open source",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: SITE_NOME,
    title: SITE_TITULO,
    description: SITE_DESCRICAO,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: SITE_TITULO, description: SITE_DESCRICAO },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: o script do <head> põe data-mode no <html> antes do React
    <html lang="pt-BR" className={`${CLASSES_DAS_FONTES} h-full antialiased`} suppressHydrationWarning>
      <head>
        <style id="vault-tema" dangerouslySetInnerHTML={{ __html: themeCss(presetValues(DEFAULT_PRESET), "vault") }} />
        <script dangerouslySetInnerHTML={{ __html: THEME_HEAD_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeSync />
        {children}
        {/* Vercel Web Analytics: visitas e páginas mais vistas, sem cookies (respeita Do Not Track) */}
        <AnalyticsComPrivacidade />
      </body>
    </html>
  );
}
