"use client";

import { CodeBlock } from "@/showcase/code-block";
import { exportThemeCss } from "@/themes/tokens";
import { themeName, useThemeSettings } from "./store";

/** O CSS do tema escolhido na vitrine, pronto para outro projeto (o mesmo do "Exportar" do editor). */
export function CurrentThemeCss() {
  const settings = useThemeSettings();
  const nome = themeName(settings);
  return <CodeBlock title={`tema-${settings.importado ? "personalizado" : settings.preset}.css · ${nome}`} code={exportThemeCss(settings.values, nome)} />;
}
