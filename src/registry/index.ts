import { meta as alert } from "@/library/alert/meta";
import { meta as badge } from "@/library/badge/meta";
import { meta as button } from "@/library/button/meta";
import { meta as statCard } from "@/library/stat-card/meta";
import type { ComponentMeta } from "./types";

// Metadados de todos os componentes. Ao adicionar um componente, registre-o
// aqui e em ./demos.tsx.
export const registry: ComponentMeta[] = [alert, badge, button, statCard].sort(
  (a, b) => a.name.localeCompare(b.name, "pt-BR"),
);

export function getComponent(slug: string) {
  return registry.find((component) => component.slug === slug);
}
