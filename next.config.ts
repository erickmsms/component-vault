import type { NextConfig } from "next";

const emDesenvolvimento = process.env.NODE_ENV === "development";

// Política de conteúdo sem nonces (o site é estático): o 'unsafe-inline' cobre os scripts e estilos
// que o Next e o tema injetam no HTML. O resto fica fechado ao próprio site: nada de fontes, imagens,
// scripts ou conexões de terceiros. O iframe de preview só pode ser embutido pelo próprio site.
const politicaDeConteudo = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${emDesenvolvimento ? " 'unsafe-eval' https://va.vercel-scripts.com" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self' blob:",
  `connect-src 'self'${emDesenvolvimento ? " ws: wss: https://va.vercel-scripts.com" : ""}`,
  "frame-src 'self'",
  "frame-ancestors 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // Em desenvolvimento o servidor local é http: forçar https quebraria os arquivos
  ...(emDesenvolvimento ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const cabecalhosDeSeguranca = [
  { key: "Content-Security-Policy", value: politicaDeConteudo },
  // Reforço para navegadores antigos que não entendem o frame-ancestors
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Não anuncia o framework em cada resposta (X-Powered-By)
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: cabecalhosDeSeguranca }];
  },
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
