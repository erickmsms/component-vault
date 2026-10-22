import { Botao } from "@/library/botao/Botao";
import { defineStories } from "@/registry/stories";
import { ChamadaFinal, type TomDaChamada } from "./ChamadaFinal";

export default defineStories({
  args: {
    titulo: "Pronto para acompanhar as vendas em tempo real?",
    texto: "Fale com a nossa equipe e veja como montar o painel da sua empresa em uma tarde.",
    tom: "destaque",
    primaria: "Agendar uma demonstração",
    secundaria: "Falar no chat",
  },
  controls: {
    titulo: { type: "text" },
    texto: { type: "text", label: "texto (vazio = sem)" },
    tom: { type: "select", options: ["destaque", "escuro", "superficie"] },
    primaria: { type: "text", label: "1ª ação (vazio = sem)" },
    secundaria: { type: "text", label: "2ª ação (vazio = sem)" },
  },
  render: (a) => (
    <div className="w-full">
      <ChamadaFinal
        titulo={a.titulo}
        texto={a.texto || undefined}
        tom={a.tom as TomDaChamada}
        acoes={[
          ...(a.primaria ? [{ rotulo: a.primaria, href: "#demonstracao" }] : []),
          ...(a.secundaria ? [{ rotulo: a.secundaria, aoClicar: () => {}, variante: "secundaria" as const }] : []),
        ]}
      />
    </div>
  ),
  stories: [
    { name: "Destaque" },
    { name: "Escuro", args: { tom: "escuro" } },
    { name: "Superfície", args: { tom: "superficie" } },
    { name: "Um botão só", args: { secundaria: "", texto: "" } },
    {
      name: "Ação própria",
      render: () => (
        <div className="w-full">
          <ChamadaFinal
            tom="superficie"
            titulo="Receba o resumo semanal das vendas"
            texto="Um e-mail por semana, com os números que mudaram e o porquê."
            acoes={
              <form className="flex w-full max-w-md flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
                <label className="sr-only" htmlFor="email-chamada">
                  E-mail
                </label>
                <input
                  id="email-chamada"
                  type="email"
                  placeholder="voce@empresa.com"
                  className="h-12 min-w-0 flex-1 rounded-2xl border border-rule-strong bg-page px-4 text-ink outline-accent placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2"
                />
                {/* Mesmo raio do campo ao lado */}
                <Botao type="submit" tamanho="lg" className="[--raio-do-botao:var(--radius-2xl)]">
                  Assinar
                </Botao>
              </form>
            }
          />
        </div>
      ),
    },
  ],
});
