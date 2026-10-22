import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { registry } from "@/registry";
import { SITE_TITULO } from "@/showcase/site";

// Imagem de compartilhamento (WhatsApp, LinkedIn, X, Google), com a cara da landing
export const alt = SITE_TITULO;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TITULO = ["Componentes", "prontos.", "Código aberto."];
const ROTULO = "componentes open source";

/** Inter Tight 800 do Google Fonts, só com as letras usadas; sem rede, cai na fonte padrão. */
async function interTight(texto: string) {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Inter+Tight:wght@800&text=${encodeURIComponent(texto)}`,
    ).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format/)?.[1];
    return url ? await fetch(url).then((r) => r.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/assets/logo/png/cv-horizontal-dark-1024.png"));
  const fonte = await interTight(TITULO.join("") + ROTULO + registry.length);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0A0A0A", padding: 64 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse só aceita <img> */}
          <img src={`data:image/png;base64,${logo.toString("base64")}`} width={360} height={45} alt="" />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontFamily: fonte ? "Inter Tight" : undefined,
              fontSize: 88,
              fontWeight: 800,
              lineHeight: 0.92,
              letterSpacing: "-0.05em",
              color: "#F5F5F4",
            }}
          >
            {TITULO.map((linha) => (
              <span key={linha}>{linha}</span>
            ))}
          </div>
        </div>
        <div
          style={{
            width: 380,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            padding: 24,
            color: "#FFFFFF",
            fontFamily: fonte ? "Inter Tight" : undefined,
            fontSize: 20,
            background: "radial-gradient(120% 120% at 100% 100%, #3B0A2A 0%, #E5231B 55%, #FF5A36 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 12, height: 12, background: "#FFFFFF" }} />
            {`${registry.length} componentes`}
          </div>
          <span>open source</span>
        </div>
      </div>
    ),
    { ...size, fonts: fonte ? [{ name: "Inter Tight", data: fonte, weight: 800, style: "normal" }] : [] },
  );
}
