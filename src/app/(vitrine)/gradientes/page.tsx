import type { Metadata } from "next";
import { GeradorDeGradientes } from "./gerador";

// Rota sem link na vitrine por enquanto: acessível só pela URL /gradientes
export const metadata: Metadata = { title: "Gradientes", robots: { index: false } };

export default function GradientesPage() {
  return <GeradorDeGradientes />;
}
