import { defineStories } from "@/registry/stories";
import { Rodape } from "./Rodape";

const LINKS = [
  { rotulo: "Documentação", href: "#documentacao" },
  { rotulo: "Código no GitHub", href: "#github" },
  { rotulo: "Contato", href: "#contato" },
];

export default defineStories({
  args: { texto: "Dados atualizados diariamente · 1 – 31 out 2026", links: 2 },
  controls: {
    texto: { type: "text", label: "children" },
    links: { type: "number", label: "links (quantidade)", min: 0, max: 3 },
  },
  render: (a) => (
    <div className="w-full">
      <Rodape links={LINKS.slice(0, a.links)}>{a.texto}</Rodape>
    </div>
  ),
  stories: [{ name: "Com links" }, { name: "Só o texto", args: { links: 0 } }],
});
