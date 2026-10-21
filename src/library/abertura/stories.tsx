import { defineStories } from "@/registry/stories";
import { Abertura } from "./Abertura";

export default defineStories({
  args: {
    chapeu: "Out 2026 · Relatório mensal",
    titulo: "As vendas cresceram 12% em outubro.",
    linhaFina: "O crescimento veio quase todo da loja online, puxado pela campanha de frete grátis.",
  },
  controls: {
    chapeu: { type: "text", label: "chapeu (vazio = sem chapéu)" },
    titulo: { type: "text" },
    linhaFina: { type: "text", label: "linhaFina (vazio = sem)" },
  },
  render: (a) => (
    <div className="w-full">
      <Abertura chapeu={a.chapeu || undefined} titulo={a.titulo} linhaFina={a.linhaFina || undefined} />
    </div>
  ),
  stories: [
    { name: "Relatório" },
    { name: "Só a manchete", args: { chapeu: "", linhaFina: "" } },
    {
      name: "Manchete longa",
      args: {
        titulo: "Pela primeira vez no ano, a loja física vendeu mais do que a online em um fim de semana.",
        chapeu: "Especial · Black Friday",
      },
    },
  ],
});
