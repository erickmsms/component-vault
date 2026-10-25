import type { MetadataRoute } from "next";
import { registry } from "@/registry";
import { SITE_URL } from "@/showcase/site";

// Landing, catálogo e a página de cada componente (o registro já traz os novos sozinho)
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/componentes`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/privacidade`, changeFrequency: "yearly", priority: 0.3 },
    ...registry.map(({ slug }) => ({
      url: `${SITE_URL}/components/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
