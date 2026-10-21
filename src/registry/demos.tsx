import type { ComponentType } from "react";
import AlertDemo from "@/library/alert/demo";
import BadgeDemo from "@/library/badge/demo";
import ButtonDemo from "@/library/button/demo";
import StatCardDemo from "@/library/stat-card/demo";

// Demos ficam separadas dos metadados porque só são renderizadas no cliente
// (src/showcase/demo-preview.tsx), então podem usar hooks livremente.
export const demos: Record<string, ComponentType> = {
  alert: AlertDemo,
  badge: BadgeDemo,
  button: ButtonDemo,
  "stat-card": StatCardDemo,
};
