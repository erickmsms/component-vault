import { redirect } from "next/navigation";
import { Landing } from "@/showcase/landing";

export default async function Home({ searchParams }: PageProps<"/">) {
  // Links antigos do catálogo com filtros (/?tipo=...) seguem para /componentes
  const params = new URLSearchParams(
    Object.entries(await searchParams).flatMap(([k, v]) => (v === undefined ? [] : [[k, String(v)]])),
  );
  if (params.size) redirect(`/componentes?${params}`);

  return <Landing />;
}
