"use client";

import { useState } from "react";
import { MenuSuspenso } from "@/library/menu-suspenso/MenuSuspenso";
import { PRESET_IDS, PRESETS, presetValues, type PresetId } from "@/themes/presets";
import { FontField } from "./font-field";
import { isEdited, updateSettings, useThemeSettings } from "./store";
import { ThemeEditor } from "./theme-editor";

const MODOS = [
  { valor: "light", rotulo: "Claro" },
  { valor: "dark", rotulo: "Escuro" },
  { valor: "system", rotulo: "Sistema" },
] as const;

const BOTAO =
  "flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-axis/50 bg-page px-4 text-sm text-ink outline-accent hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2";

/** Controles do tema no cabeçalho da vitrine: tema, modo, fontes e o editor. Valem para todos os previews. */
export function ThemeControls() {
  const settings = useThemeSettings();
  const [editorAberto, setEditorAberto] = useState(false);
  const editado = isEdited(settings);

  function escolherTema(preset: PresetId) {
    if (preset === settings.preset && !editado && !settings.importado) return;
    if (editado && !window.confirm("Trocar de tema descarta as edições feitas neste. Continuar?")) return;
    updateSettings((s) => ({ ...s, importado: undefined, preset, values: presetValues(preset) }));
  }

  const mudarFonte = (campo: "fontDisplay" | "fontBody") => (familia: string) =>
    updateSettings((s) => ({ ...s, values: { ...s.values, [campo]: familia } }));

  const nomeDoTema = settings.importado ? "Personalizado" : PRESETS[settings.preset].label;

  return (
    <>
      <MenuSuspenso rotulo="Aparência" resumo={editado ? `${nomeDoTema} (editado)` : nomeDoTema} larguraDoPainel="w-80">
        {(fechar) => (
          <div className="flex flex-col gap-5 p-4">
            <fieldset className="space-y-1">
              <legend className="mb-1 text-xs font-medium tracking-wide text-muted uppercase">Tema</legend>
              {settings.importado && (
                <p className="px-1 pb-1 text-sm text-ink-2">Personalizado (JSON colado)</p>
              )}
              {PRESET_IDS.map((id) => (
                <label key={id} className="flex min-h-9 cursor-pointer items-center gap-3 rounded-md px-1 text-sm hover:bg-surface">
                  <input
                    type="radio"
                    name="aparencia-tema"
                    checked={!settings.importado && settings.preset === id}
                    onChange={() => escolherTema(id)}
                    className="size-4 shrink-0 cursor-pointer accent-accent"
                  />
                  {PRESETS[id].label}
                </label>
              ))}
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">Modo</legend>
              <div className="flex gap-1 rounded-lg border border-rule p-1">
                {MODOS.map((m) => (
                  <button
                    key={m.valor}
                    type="button"
                    aria-pressed={settings.mode === m.valor}
                    onClick={() => updateSettings((s) => ({ ...s, mode: m.valor }))}
                    className="min-h-9 flex-1 cursor-pointer rounded-md text-sm text-ink-2 outline-accent hover:text-ink focus-visible:outline-2 aria-pressed:bg-ink aria-pressed:text-page"
                  >
                    {m.rotulo}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="space-y-3">
              <h3 className="text-xs font-medium tracking-wide text-muted uppercase">Fontes</h3>
              <FontField
                key={`t-${settings.values.fontDisplay}`}
                label="Títulos"
                value={settings.values.fontDisplay}
                onChange={mudarFonte("fontDisplay")}
                className="border-rule bg-page text-ink focus:border-ink"
              />
              <FontField
                key={`c-${settings.values.fontBody}`}
                label="Texto"
                value={settings.values.fontBody}
                onChange={mudarFonte("fontBody")}
                className="border-rule bg-page text-ink focus:border-ink"
              />
              <p className="text-xs leading-snug text-muted">
                Escolha uma fonte da lista (digite para filtrar) e aperte Enter.
              </p>
            </div>

            <button
              type="button"
              className={BOTAO}
              onClick={() => {
                setEditorAberto(true);
                fechar();
              }}
            >
              Editar tema…
            </button>
          </div>
        )}
      </MenuSuspenso>
      {editorAberto && <ThemeEditor aoFechar={() => setEditorAberto(false)} />}
    </>
  );
}
