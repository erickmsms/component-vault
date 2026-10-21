import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getComponent, registry } from "@/registry";
import { PreviewFrame } from "@/showcase/preview/preview-frame";

// Página que vai dentro do iframe de preview: só o componente, sem a vitrine em volta.

export function generateStaticParams() {
  return registry.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/preview/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Preview: ${getComponent(slug)?.name ?? slug}`, robots: { index: false } };
}

type Params = PageProps<"/preview/[slug]">["params"];

export default function PreviewPage({ params }: PageProps<"/preview/[slug]">) {
  return (
    <Suspense fallback={null}>
      <Conteudo params={params} />
    </Suspense>
  );
}

async function Conteudo({ params }: { params: Params }) {
  const { slug } = await params;
  if (!getComponent(slug)) notFound();
  return <PreviewFrame slug={slug} />;
}
