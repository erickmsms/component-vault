"use client";

import { useState } from "react";
import { getComponent } from "@/registry";
import { demos } from "@/registry/demos";
import type { PreviewBackground } from "@/registry/types";

// `mode` vira data-mode no container: temas de projeto usam para trocar os tokens claro/escuro
export const backgrounds: Record<
  PreviewBackground,
  { label: string; className: string; mode: "light" | "dark" }
> = {
  light: { label: "Claro", className: "bg-white text-zinc-900", mode: "light" },
  dark: { label: "Escuro", className: "bg-zinc-950 text-zinc-100", mode: "dark" },
  dots: { label: "Pontilhado", className: "preview-dots text-zinc-900", mode: "light" },
};

export function Demo({ slug }: { slug: string }) {
  const Component = demos[slug];
  if (!Component) {
    return <p className="text-sm opacity-60">Sem demo registrada para “{slug}”.</p>;
  }

  const theme = getComponent(slug)?.theme;
  if (!theme) return <Component />;
  return (
    <div data-theme={theme} className="contents">
      <Component />
    </div>
  );
}

export function DemoPreview({
  slug,
  initialBackground = "light",
}: {
  slug: string;
  initialBackground?: PreviewBackground;
}) {
  const [background, setBackground] = useState(initialBackground);

  // Sem overflow-hidden: dropdowns e tooltips dos componentes podem passar da borda do preview
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between gap-4 border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Preview</span>
        <div className="flex gap-1" role="group" aria-label="Fundo do preview">
          {(Object.keys(backgrounds) as PreviewBackground[]).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={background === key}
              onClick={() => setBackground(key)}
              className="rounded-md px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 aria-pressed:bg-zinc-900 aria-pressed:text-white dark:text-zinc-400 dark:hover:bg-zinc-800 dark:aria-pressed:bg-zinc-100 dark:aria-pressed:text-zinc-900"
            >
              {backgrounds[key].label}
            </button>
          ))}
        </div>
      </div>
      <div
        data-mode={backgrounds[background].mode}
        className={`flex min-h-64 items-center justify-center-safe rounded-b-xl p-6 sm:p-10 ${backgrounds[background].className}`}
      >
        <Demo slug={slug} />
      </div>
    </div>
  );
}
