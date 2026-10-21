import type { Metadata } from "next";
import Link from "next/link";
import { Foundations } from "@/showcase/foundations";

export const metadata: Metadata = { title: "Fundamentos" };

export default function FundamentosPage() {
  return (
    <div className="space-y-8">
      <Link href="/" className="inline-block text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
        ← Voltar ao catálogo
      </Link>
      <Foundations />
    </div>
  );
}
