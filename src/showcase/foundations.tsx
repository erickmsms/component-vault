"use client";

import type { ReactNode } from "react";
import { COLOR_GROUPS, SHADOWS, TEXT_STEP_NAMES, textSize, THEME_ATTR } from "@/themes/tokens";
import { themeName, useThemeSettings } from "./theme/store";

// Classes escritas por extenso para o Tailwind gerá-las
const TAMANHOS: Record<string, string> = {
  "7xl": "text-7xl",
  "6xl": "text-6xl",
  "5xl": "text-5xl",
  "4xl": "text-4xl",
  "3xl": "text-3xl",
  "2xl": "text-2xl",
  xl: "text-xl",
  lg: "text-lg",
  base: "text-base",
  sm: "text-sm",
  xs: "text-xs",
};

const RAIOS = ["rounded-sm", "rounded-md", "rounded-lg", "rounded-xl", "rounded-2xl", "rounded-full"];
const ESPACOS = [
  { classe: "w-1", n: 1 },
  { classe: "w-2", n: 2 },
  { classe: "w-4", n: 4 },
  { classe: "w-6", n: 6 },
  { classe: "w-8", n: 8 },
  { classe: "w-12", n: 12 },
  { classe: "w-16", n: 16 },
  { classe: "w-24", n: 24 },
];

function Bloco({ titulo, descricao, children }: { titulo: string; descricao: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{titulo}</h2>
        <p className="text-sm text-zinc-500">{descricao}</p>
      </div>
      {children}
    </section>
  );
}

/** Os tokens do tema atual, em amostras. Muda junto com o cabeçalho e o editor de tema. */
export function Foundations() {
  const settings = useThemeSettings();
  const { values } = settings;

  return (
    <div className="space-y-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Fundamentos do tema</h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Tema <strong>{themeName(settings)}</strong>. Os componentes da biblioteca usam só estes tokens: troque o tema
          ou use “Editar tema” no cabeçalho para ver tudo mudar.
        </p>
      </header>

      <Bloco titulo="Cores" descricao="Cada token tem uma versão para o modo claro e outra para o escuro.">
        <div className="space-y-6">
          {COLOR_GROUPS.map((grupo) => (
            <div key={grupo.title} className="space-y-2">
              <h3 className="text-sm font-medium">{grupo.title}</h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-3">
                {grupo.tokens.map(({ token, label }) => (
                  <div key={token} className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <div className="flex h-14">
                      <span className="flex-1" style={{ background: values.colors[token].light }} />
                      <span className="flex-1" style={{ background: values.colors[token].dark }} />
                    </div>
                    <div className="space-y-0.5 p-2 text-xs">
                      <p className="font-medium">{label}</p>
                      <p className="font-mono text-zinc-500">--{token}</p>
                      <p className="font-mono text-zinc-500">
                        {values.colors[token].light} · {values.colors[token].dark}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Bloco>

      <Bloco
        titulo="Tipografia"
        descricao={`${values.fontDisplay} nos títulos e ${values.fontBody} no texto. Escala modular de razão ${values.textScale} a partir de ${values.textBase} px.`}
      >
        <div data-theme={THEME_ATTR} className="space-y-4 rounded-xl border border-rule bg-page p-6">
          {TEXT_STEP_NAMES.slice()
            .reverse()
            .map((passo) => {
              const titulo = ["7xl", "6xl", "5xl", "4xl", "3xl", "2xl", "xl"].includes(passo);
              return (
                <div key={passo} className="flex items-baseline gap-4 border-b border-rule pb-3 last:border-b-0">
                  <span className="w-28 shrink-0 font-mono text-xs text-muted">
                    text-{passo} · {Math.round(textSize(values, passo) * 16)}px
                  </span>
                  <span
                    className={`${TAMANHOS[passo]} min-w-0 truncate ${titulo ? "font-display font-bold tracking-tight" : ""}`}
                  >
                    {titulo ? "Vendas cresceram 12%" : "O crescimento veio quase todo da loja online."}
                  </span>
                </div>
              );
            })}
        </div>
      </Bloco>

      <Bloco titulo="Arredondamento" descricao={`Base de ${values.radius} px; os outros raios crescem na mesma proporção.`}>
        <div data-theme={THEME_ATTR} className="flex flex-wrap gap-4 rounded-xl border border-rule bg-page p-6">
          {RAIOS.map((r) => (
            <div key={r} className="space-y-2 text-center">
              <div className={`size-20 border-2 border-rule-strong bg-surface ${r}`} />
              <p className="font-mono text-xs text-muted">{r}</p>
            </div>
          ))}
        </div>
      </Bloco>

      <Bloco
        titulo="Espaçamento"
        descricao={`Unidade de ${(0.25 * values.density * 16).toFixed(1).replace(".", ",")} px (densidade ${values.density}). Padding, gap e margens são múltiplos dela.`}
      >
        <div data-theme={THEME_ATTR} className="space-y-2 rounded-xl border border-rule bg-page p-6">
          {ESPACOS.map((e) => (
            <div key={e.n} className="flex items-center gap-4">
              <span className="w-16 font-mono text-xs text-muted">{e.n}</span>
              <span className={`h-3 rounded-sm bg-accent ${e.classe}`} />
            </div>
          ))}
        </div>
      </Bloco>

      <Bloco titulo="Sombra" descricao={`Sombra dos menus, balões e dicas: ${SHADOWS[values.shadow].label.toLowerCase()}.`}>
        <div data-theme={THEME_ATTR} className="rounded-xl border border-rule bg-surface p-10">
          <div className="max-w-xs rounded-xl border border-rule bg-page p-5 shadow-flutuante">
            <p className="font-display text-lg font-bold">Painel flutuante</p>
            <p className="text-sm text-ink-2">É assim que menus suspensos e balões aparecem neste tema.</p>
          </div>
        </div>
      </Bloco>
    </div>
  );
}
