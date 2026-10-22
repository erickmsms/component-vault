import type { MetadataRoute } from "next";
import { SITE_URL } from "@/showcase/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // O preview vai dentro de um iframe na página do componente: só a página conta para o Google
    rules: { userAgent: "*", allow: "/", disallow: ["/preview/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
