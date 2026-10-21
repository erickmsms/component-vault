import { defineStories } from "@/registry/stories";
import { Secao } from "./Secao";

export default defineStories({
  args: {
    titulo: "Vendas por região",
    dica: "Soma dos pedidos pagos, sem cancelamentos e devoluções.",
  },
  controls: {
    titulo: { type: "text" },
    dica: { type: "text", label: "dica (vazio = sem ícone)" },
  },
  render: (a) => (
    <div className="w-full max-w-2xl">
      <Secao titulo={a.titulo} dica={a.dica || undefined}>
        <p className="text-ink-2">O conteúdo da seção vem aqui: tabela, gráfico, texto...</p>
      </Secao>
    </div>
  ),
  stories: [{ name: "Com dica" }, { name: "Sem dica", args: { dica: "" } }],
});
