import type { Metadata } from "next";
import { Archivo, Geist, Geist_Mono, Inter } from "next/font/google";
import Link from "next/link";
import { Cabecalho } from "@/library/cabecalho/Cabecalho";
import { registry } from "@/registry";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fontes dos temas dos componentes (src/themes/*.css)
const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Component Vault", template: "%s · Component Vault" },
  description: "Biblioteca pessoal de componentes React, organizados por tipo, tema e projeto de origem.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* O próprio Cabeçalho da biblioteca (src/library/cabecalho). "contents" passa os tokens
            do tema sem criar uma caixa, para o sticky continuar valendo na página inteira. */}
        <div data-theme="editorial" className="contents">
          <Cabecalho titulo={<Link href="/">Component Vault</Link>} larguraMaxima="max-w-none">
            <span className="text-sm text-muted">{registry.length} componentes</span>
          </Cabecalho>
        </div>
        <main className="w-full flex-1 px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
