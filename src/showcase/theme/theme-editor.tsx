"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { contrastRatio, isHex, paletteFromBrand } from "@/themes/color";
import { parseThemeJson, themePromptForAi, themeToJson, type ImportResult } from "@/themes/json";
import { PRESETS } from "@/themes/presets";
import {
  COLOR_GROUPS,
  exportThemeCss,
  SHADOWS,
  type ColorPair,
  type ColorToken,
  type Mode,
  type Shadow,
  type ThemeValues,
} from "@/themes/tokens";
import { FontField } from "./font-field";
import { baseValues, isEdited, themeName, updateSettings, useThemeSettings } from "./store";

const ESCALAS = [
  { valor: 1.125, rotulo: "1,125 · Segunda maior (contida)" },
  { valor: 1.2, rotulo: "1,2 · Terça menor" },
  { valor: 1.25, rotulo: "1,25 · Terça maior" },
  { valor: 1.333, rotulo: "1,333 · Quarta justa (dramática)" },
];

const DENSIDADES = [
  { valor: 0.85, rotulo: "Compacta" },
  { valor: 1, rotulo: "Confortável" },
  { valor: 1.15, rotulo: "Espaçosa" },
];

/** Pares de texto e fundo que os componentes usam; o contraste mínimo para texto é 4,5. */
const PARES_DE_CONTRASTE: Array<[ColorToken, ColorToken, string]> = [
  ["ink", "page", "Texto na página"],
  ["ink-2", "page", "Texto secundário na página"],
  ["muted", "page", "Texto apagado na página"],
  ["accent", "page", "Destaque na página"],
  ["ink", "surface", "Texto na superfície"],
  ["ink-2", "surface", "Texto secundário na superfície"],
  ["muted", "surface", "Texto apagado na superfície"],
  ["accent", "surface", "Destaque na superfície"],
];

const CAMPO =
  "rounded-md border border-zinc-300 bg-white px-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-300";

function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="space-y-3 border-b border-zinc-200 px-5 py-5 dark:border-zinc-800">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{titulo}</h3>
      {children}
    </section>
  );
}

function Segmentos<T extends string | number>({
  opcoes,
  valor,
  aoEscolher,
}: {
  opcoes: Array<{ valor: T; rotulo: string }>;
  valor: T;
  aoEscolher: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900">
      {opcoes.map((o) => (
        <button
          key={o.valor}
          type="button"
          aria-pressed={o.valor === valor}
          onClick={() => aoEscolher(o.valor)}
          className="flex-1 rounded-md px-2 py-1.5 text-xs text-zinc-600 aria-pressed:bg-white aria-pressed:font-medium aria-pressed:text-zinc-900 aria-pressed:shadow-sm dark:text-zinc-400 dark:aria-pressed:bg-zinc-700 dark:aria-pressed:text-zinc-50"
        >
          {o.rotulo}
        </button>
      ))}
    </div>
  );
}

/** Campo hexadecimal que só aplica quando o valor fica válido. Use `key={valor}`. */
function CampoHex({ valor, aoMudar }: { valor: string; aoMudar: (hex: string) => void }) {
  const [texto, setTexto] = useState(valor);
  return (
    <input
      value={texto}
      spellCheck={false}
      aria-label="Cor em hexadecimal"
      onChange={(e) => {
        setTexto(e.target.value);
        if (isHex(e.target.value)) aoMudar(e.target.value.toLowerCase());
      }}
      className={`${CAMPO} h-8 w-24 font-mono text-xs`}
    />
  );
}

function SeloDeContraste({ razao }: { razao: number }) {
  const [rotulo, cor] =
    razao >= 7
      ? ["AAA", "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"]
      : razao >= 4.5
        ? ["AA", "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"]
        : razao >= 3
          ? ["Só texto grande", "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"]
          : ["Falha", "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"];
  return <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${cor}`}>{rotulo}</span>;
}

function baixar(nome: string, conteudo: string) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: "text/css" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = nome;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Editor do tema, num painel lateral que não cobre os previews: tudo o que muda
 * aqui aparece na hora em todos os componentes (e nos iframes de preview).
 */
export function ThemeEditor({ aoFechar }: { aoFechar: () => void }) {
  const settings = useThemeSettings();
  const { values } = settings;
  const [marca, setMarca] = useState(values.colors.accent.light);
  const [tingir, setTingir] = useState(true);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [jsonColado, setJsonColado] = useState("");
  const [importacao, setImportacao] = useState<ImportResult | null>(null);

  // O editor mexe nas cores do modo que está na tela; "Sistema" vira o modo atual
  const modo: Mode =
    settings.mode === "system"
      ? document.documentElement.dataset.mode === "dark"
        ? "dark"
        : "light"
      : settings.mode;

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") aoFechar();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aoFechar]);

  const mudar = (patch: Partial<ThemeValues>) => updateSettings((s) => ({ ...s, values: { ...s.values, ...patch } }));

  const mudarCor = (token: ColorToken, hex: string) =>
    updateSettings((s) => ({
      ...s,
      values: { ...s.values, colors: { ...s.values.colors, [token]: { ...s.values.colors[token], [modo]: hex } } },
    }));

  function aplicarMarca() {
    if (!isHex(marca)) return;
    const geradas = Object.entries(paletteFromBrand(marca, tingir)) as Array<[ColorToken, ColorPair]>;
    updateSettings((s) => ({
      ...s,
      values: { ...s.values, colors: { ...s.values.colors, ...Object.fromEntries(geradas) } },
    }));
  }

  function aplicarJson() {
    const resultado = parseThemeJson(jsonColado, values);
    setImportacao(resultado);
    if (resultado.ok) updateSettings((s) => ({ ...s, values: resultado.values, importado: resultado.values }));
  }

  const nome = themeName(settings);
  const css = exportThemeCss(values, nome);

  async function copiar(rotulo: string, texto: string) {
    await navigator.clipboard.writeText(texto);
    setCopiado(rotulo);
    setTimeout(() => setCopiado(null), 1500);
  }

  return createPortal(
    <aside
      role="dialog"
      aria-label="Editor de tema"
      className="fixed inset-y-0 right-0 z-50 flex w-[24rem] max-w-full flex-col border-l border-zinc-200 bg-white font-sans text-zinc-900 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
    >
      <header className="flex items-start justify-between gap-3 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <div>
          <h2 className="font-semibold">Editar tema</h2>
          <p className="text-sm text-zinc-500">
            {settings.importado ? "Base: JSON colado" : `Base: ${PRESETS[settings.preset].label}`}
            {isEdited(settings) && " · editado"}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            disabled={!isEdited(settings)}
            onClick={() => updateSettings((s) => ({ ...s, values: baseValues(s) }))}
            className="rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            Restaurar
          </button>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar o editor"
            className="rounded-md px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            ✕
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <Grupo titulo="JSON do tema">
          <p className="text-sm text-zinc-500">
            O tema inteiro (cores dos dois modos, fontes, escala, raio, densidade e sombra) num JSON. Copie para
            guardar ou cole um gerado por você ou por uma IA.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copiar("json", themeToJson(values, nome))}
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {copiado === "json" ? "Copiado!" : "Copiar JSON"}
            </button>
            <button
              type="button"
              onClick={() => copiar("prompt", themePromptForAi(values, nome))}
              title="Explica o formato e leva o tema atual como exemplo; acrescente a sua ideia no fim"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              {copiado === "prompt" ? "Copiado!" : "Copiar prompt para IA"}
            </button>
          </div>
          <label className="block space-y-1">
            <span className="text-sm">Colar JSON</span>
            <textarea
              value={jsonColado}
              onChange={(e) => {
                setJsonColado(e.target.value);
                setImportacao(null);
              }}
              rows={5}
              spellCheck={false}
              placeholder='{ "name": "Meu tema", "colors": { "accent": { "light": "#1a56db", "dark": "#7aa2f7" } }, "radius": 12 }'
              className="w-full rounded-md border border-zinc-300 bg-white p-2 font-mono text-xs outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-300"
            />
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={aplicarJson}
              disabled={!jsonColado.trim()}
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
            >
              Aplicar JSON
            </button>
            <span className="text-xs text-zinc-500">Campos que faltarem continuam como estão.</span>
          </div>
          {importacao && (
            <div
              role="status"
              className={`space-y-1 rounded-md p-3 text-sm ${
                importacao.ok
                  ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                  : "bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-200"
              }`}
            >
              <p className="font-medium">
                {importacao.ok
                  ? `${importacao.nome ? `Tema “${importacao.nome}” aplicado` : "Tema aplicado"} (${importacao.aplicados} valores).`
                  : importacao.erro}
              </p>
              {importacao.ok && importacao.avisos.length > 0 && (
                <ul className="list-disc space-y-0.5 pl-4 text-xs text-amber-800 dark:text-amber-300">
                  {importacao.avisos.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </Grupo>

        <Grupo titulo="Cor da marca">
          <p className="text-sm text-zinc-500">
            Gera o destaque nas versões clara e escura com contraste adequado e, se quiser, tinge os neutros com o
            mesmo tom.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={isHex(marca) ? marca : "#000000"}
              onChange={(e) => setMarca(e.target.value)}
              aria-label="Cor da marca"
              className="h-9 w-12 cursor-pointer rounded border border-zinc-300 dark:border-zinc-700"
            />
            <input
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              aria-label="Cor da marca em hexadecimal"
              className={`${CAMPO} h-9 w-28 font-mono text-xs`}
            />
            <button
              type="button"
              onClick={aplicarMarca}
              disabled={!isHex(marca)}
              className="ml-auto rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
            >
              Aplicar
            </button>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={tingir} onChange={(e) => setTingir(e.target.checked)} />
            Tingir fundos, textos e linhas com o tom da marca
          </label>
        </Grupo>

        <Grupo titulo="Cores">
          <div className="space-y-2">
            <p className="text-sm text-zinc-500">Editando as cores do modo:</p>
            <Segmentos<Mode>
              opcoes={[
                { valor: "light", rotulo: "Claro" },
                { valor: "dark", rotulo: "Escuro" },
              ]}
              valor={modo}
              aoEscolher={(mode) => updateSettings((s) => ({ ...s, mode }))}
            />
          </div>
          {COLOR_GROUPS.map((grupo) => (
            <div key={grupo.title} className="space-y-1.5 pt-2">
              <h4 className="text-sm font-medium">{grupo.title}</h4>
              {grupo.tokens.map(({ token, label }) => {
                const hex = values.colors[token][modo];
                return (
                  <div key={token} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={hex}
                      onChange={(e) => mudarCor(token, e.target.value)}
                      aria-label={label}
                      className="h-8 w-10 cursor-pointer rounded border border-zinc-300 dark:border-zinc-700"
                    />
                    <span className="flex-1 text-sm">
                      {label}
                      <span className="ml-1.5 font-mono text-[11px] text-zinc-400">--{token}</span>
                    </span>
                    <CampoHex key={hex} valor={hex} aoMudar={(novo) => mudarCor(token, novo)} />
                  </div>
                );
              })}
            </div>
          ))}
        </Grupo>

        <Grupo titulo={`Contraste (modo ${modo === "dark" ? "escuro" : "claro"})`}>
          <ul className="space-y-1.5">
            {PARES_DE_CONTRASTE.map(([texto, fundo, rotulo]) => {
              const razao = contrastRatio(values.colors[texto][modo], values.colors[fundo][modo]);
              return (
                <li key={`${texto}-${fundo}`} className="flex items-center gap-2 text-sm">
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-9 items-center justify-center rounded border border-zinc-200 text-xs font-bold dark:border-zinc-800"
                    style={{ background: values.colors[fundo][modo], color: values.colors[texto][modo] }}
                  >
                    Aa
                  </span>
                  <span className="flex-1">{rotulo}</span>
                  <span className="font-mono text-xs tabular-nums">{razao.toFixed(1).replace(".", ",")}:1</span>
                  <SeloDeContraste razao={razao} />
                </li>
              );
            })}
          </ul>
        </Grupo>

        <Grupo titulo="Tipografia">
          <FontField
            key={`t-${values.fontDisplay}`}
            label="Fonte dos títulos"
            value={values.fontDisplay}
            onChange={(fontDisplay) => mudar({ fontDisplay })}
            className="border-zinc-300 bg-white focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-300"
          />
          <FontField
            key={`c-${values.fontBody}`}
            label="Fonte do texto"
            value={values.fontBody}
            onChange={(fontBody) => mudar({ fontBody })}
            className="border-zinc-300 bg-white focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-300"
          />
          <label className="block space-y-1">
            <span className="flex justify-between text-sm">
              Tamanho do texto <span className="tabular-nums text-zinc-500">{values.textBase} px</span>
            </span>
            <input
              type="range"
              min={14}
              max={18}
              step={0.5}
              value={values.textBase}
              onChange={(e) => mudar({ textBase: Number(e.target.value) })}
              className="w-full"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm">Escala dos títulos</span>
            <select
              value={values.textScale}
              onChange={(e) => mudar({ textScale: Number(e.target.value) })}
              className={`${CAMPO} h-9 w-full`}
            >
              {ESCALAS.map((e) => (
                <option key={e.valor} value={e.valor}>
                  {e.rotulo}
                </option>
              ))}
            </select>
          </label>
        </Grupo>

        <Grupo titulo="Forma e espaço">
          <label className="block space-y-1">
            <span className="flex justify-between text-sm">
              Arredondamento <span className="tabular-nums text-zinc-500">{values.radius} px</span>
            </span>
            <input
              type="range"
              min={0}
              max={24}
              step={1}
              value={values.radius}
              onChange={(e) => mudar({ radius: Number(e.target.value) })}
              className="w-full"
            />
          </label>
          <div className="space-y-1">
            <span className="text-sm">Densidade</span>
            <Segmentos opcoes={DENSIDADES} valor={values.density} aoEscolher={(density) => mudar({ density })} />
          </div>
          <div className="space-y-1">
            <span className="text-sm">Sombra dos elementos flutuantes</span>
            <Segmentos<Shadow>
              opcoes={(Object.keys(SHADOWS) as Shadow[]).map((s) => ({ valor: s, rotulo: SHADOWS[s].label }))}
              valor={values.shadow}
              aoEscolher={(shadow) => mudar({ shadow })}
            />
          </div>
        </Grupo>

        <Grupo titulo="Exportar">
          <p className="text-sm text-zinc-500">
            Um arquivo CSS para outro projeto com Tailwind 4: importe depois de{" "}
            <code className="font-mono text-xs">@import &quot;tailwindcss&quot;</code> e os componentes da
            biblioteca ficam com este tema.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => baixar(`tema-${settings.importado ? "personalizado" : settings.preset}.css`, css)}
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
            >
              Baixar .css
            </button>
            <button
              type="button"
              onClick={() => copiar("css", css)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              {copiado === "css" ? "Copiado!" : "Copiar CSS"}
            </button>
          </div>
          <details>
            <summary className="cursor-pointer text-sm text-zinc-600 dark:text-zinc-400">Ver o CSS</summary>
            <pre className="mt-2 max-h-80 overflow-auto rounded-md bg-zinc-950 p-3 font-mono text-[11px] leading-relaxed text-zinc-100">
              {css}
            </pre>
          </details>
        </Grupo>
      </div>
    </aside>,
    document.body,
  );
}
