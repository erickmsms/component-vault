import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Links antigos do catálogo com filtros (/?tipo=...) seguem para /componentes, com a query junto
  async redirects() {
    return ["tipo", "tema", "projeto"].map((key) => ({
      source: "/",
      has: [{ type: "query" as const, key }],
      destination: "/componentes",
      permanent: true,
    }));
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
