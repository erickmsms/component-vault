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
  title: { default: "Component Vault", template: "%s · Component Vault" },
  description: "Biblioteca pessoal de componentes React, organizados por tipo, tema e projeto de origem.",
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
      </body>
    </html>
  );
}
