"use client";

import { CodeBlock } from "@/showcase/code-block";
import { PRESETS } from "@/themes/presets";
import { exportThemeCss } from "@/themes/tokens";
import { isEdited, useThemeSettings } from "./store";

/** O CSS do tema escolhido na vitrine, pronto para outro projeto (o mesmo do "Exportar" do editor). */
export function CurrentThemeCss() {
  const settings = useThemeSettings();
  const nome = `${PRESETS[settings.preset].label}${isEdited(settings) ? " (editado)" : ""}`;
  return <CodeBlock title={`tema-${settings.preset}.css · ${nome}`} code={exportThemeCss(settings.values, nome)} />;
}
