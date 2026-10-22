import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import {
  Archivo,
  Fraunces,
  Geist,
  Geist_Mono,
  IBM_Plex_Sans,
  Inter,
  Nunito,
  Space_Grotesk,
} from "next/font/google";
import { SITE_DESCRICAO, SITE_NOME, SITE_TITULO, SITE_URL } from "@/showcase/site";
import { THEME_HEAD_SCRIPT } from "@/showcase/theme/head-script";
import { ThemeSync } from "@/showcase/theme/theme-sync";
import { DEFAULT_PRESET, presetValues } from "@/themes/presets";
import { themeCss } from "@/themes/tokens";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Fontes dos temas (src/themes/fonts.ts). Só as do tema padrão são pré-carregadas.
const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  preload: false,
});
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], preload: false });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"], preload: false });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"], preload: false });

const fontes = [geistSans, geistMono, archivo, inter, plex, fraunces, nunito, spaceGrotesk]
  .map((f) => f.variable)
  .join(" ");

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
    <html lang="pt-BR" className={`${fontes} h-full antialiased`} suppressHydrationWarning>
      <head>
        <style id="vault-tema" dangerouslySetInnerHTML={{ __html: themeCss(presetValues(DEFAULT_PRESET), "vault") }} />
        <script dangerouslySetInnerHTML={{ __html: THEME_HEAD_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeSync />
        {children}
        {/* Vercel Web Analytics: visitas e páginas mais vistas, sem cookies */}
        <Analytics />
      </body>
    </html>
  );
}
