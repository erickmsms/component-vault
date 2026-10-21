"use client";

import Link from "next/link";
import { useState } from "react";
import { MenuSuspenso } from "@/library/menu-suspenso/MenuSuspenso";
import { SeletorUnico } from "@/library/seletor-unico/SeletorUnico";
import { PRESET_IDS, PRESETS, presetValues, type PresetId } from "@/themes/presets";
import { FontField } from "./font-field";
import { isEdited, updateSettings, useThemeSettings, type ModePreference } from "./store";
import { ThemeEditor } from "./theme-editor";

const MODOS = [
  { valor: "light", rotulo: "Claro" },
  { valor: "dark", rotulo: "Escuro" },
  { valor: "system", rotulo: "Sistema" },
] as const;

const BOTAO =
  "flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-axis/50 bg-page px-4 text-sm text-ink outline-accent hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2";

/** Controles do tema no cabeçalho da vitrine: tema, modo, fontes e o editor. Valem para todos os previews. */
export function ThemeControls() {
  const settings = useThemeSettings();
  const [editorAberto, setEditorAberto] = useState(false);
  const editado = isEdited(settings);

  function escolherTema(preset: PresetId) {
    if (preset === settings.preset && !editado) return;
    if (editado && !window.confirm("Trocar de tema descarta as edições feitas neste. Continuar?")) return;
    updateSettings((s) => ({ ...s, preset, values: presetValues(preset) }));
  }

  const mudarFonte = (campo: "fontDisplay" | "fontBody") => (familia: string) =>
    updateSettings((s) => ({ ...s, values: { ...s.values, [campo]: familia } }));

  return (
    <>
      <Link href="/fundamentos" className="px-2 text-sm text-ink-2 underline-offset-4 hover:text-ink hover:underline">
        Fundamentos
      </Link>
      <SeletorUnico
        rotulo={editado ? "Tema (editado)" : "Tema"}
        opcoes={PRESET_IDS.map((id) => ({ valor: id, rotulo: PRESETS[id].label }))}
        valor={settings.preset}
        aoEscolher={escolherTema}
      />
      <SeletorUnico<ModePreference>
        rotulo="Modo"
        opcoes={MODOS}
        valor={settings.mode}
        aoEscolher={(mode) => updateSettings((s) => ({ ...s, mode }))}
      />
      <MenuSuspenso rotulo="Fontes" resumo={`${settings.values.fontDisplay} · ${settings.values.fontBody}`}>
        {() => (
          <div className="flex flex-col gap-4 p-4">
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
              Escolha uma sugestão ou digite qualquer família do Google Fonts e aperte Enter.
            </p>
          </div>
        )}
      </MenuSuspenso>
      <button type="button" className={BOTAO} aria-expanded={editorAberto} onClick={() => setEditorAberto((a) => !a)}>
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="8" cy="8" r="6.25" />
          <path d="M8 1.75a6.25 6.25 0 0 0 0 12.5z" fill="currentColor" stroke="none" />
        </svg>
        Editar tema
      </button>
      {editorAberto && <ThemeEditor aoFechar={() => setEditorAberto(false)} />}
    </>
  );
}
