// Tipos de componente. A ordem aqui é a ordem das seções no catálogo.
export const categories = {
  buttons: "Botões",
  forms: "Formulários",
  feedback: "Feedback",
  "data-display": "Exibição de dados",
  charts: "Gráficos",
  navigation: "Navegação",
  layout: "Layout",
  sections: "Seções",
  overlay: "Overlays",
  animation: "Animações",
  media: "Mídia",
  pages: "Páginas",
  other: "Outros",
} as const;

export type CategoryId = keyof typeof categories;

export const categoryIds = Object.keys(categories) as CategoryId[];
