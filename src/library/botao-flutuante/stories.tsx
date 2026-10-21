import { defineStories } from "@/registry/stories";
import { BotaoFlutuante, type IconeDoBotao, type TomDoBotao } from "./BotaoFlutuante";

const ICONES: IconeDoBotao[] = ["whatsapp", "mensagem", "telefone", "topo"];
const TONS: TomDoBotao[] = ["destaque", "sucesso", "contraste", "superficie"];
const ROTULOS: Record<IconeDoBotao, string> = {
  whatsapp: "Falar no WhatsApp",
  mensagem: "Abrir o chat",
  telefone: "Ligar para a central",
  topo: "Voltar ao topo",
};

function PaginaDeExemplo({ texto }: { texto: string }) {
  return (
    <div className="flex min-h-80 w-full max-w-xl flex-col gap-3 rounded-2xl border border-rule p-6">
      <p className="font-display text-xl font-bold">Página de exemplo</p>
      <p className="text-sm text-ink-2">{texto}</p>
    </div>
  );
}

export default defineStories({
  args: { rotulo: "Falar no WhatsApp", icone: "whatsapp", tom: "destaque", posicao: "inferior-direita", fixo: false },
  controls: {
    rotulo: { type: "text", label: "rotulo (aria-label)" },
    icone: { type: "select", options: ICONES },
    tom: { type: "select", options: TONS },
    posicao: { type: "select", options: ["inferior-direita", "inferior-esquerda"] },
    fixo: { type: "boolean" },
  },
  render: (a) => (
    <BotaoFlutuante
      rotulo={a.rotulo}
      href="#whatsapp"
      icone={a.icone as IconeDoBotao}
      tom={a.tom as TomDoBotao}
      posicao={a.posicao as "inferior-direita" | "inferior-esquerda"}
      fixo={a.fixo}
    />
  ),
  stories: [
    { name: "WhatsApp" },
    {
      name: "Ícones e tons",
      render: () => (
        <div className="flex flex-wrap items-center justify-center gap-4 p-4">
          {ICONES.map((icone, i) => (
            <BotaoFlutuante
              key={icone}
              rotulo={ROTULOS[icone]}
              icone={icone}
              tom={TONS[i]}
              fixo={false}
              aoClicar={() => {}}
            />
          ))}
        </div>
      ),
    },
    {
      name: "Fixo no canto",
      render: () => (
        <>
          <PaginaDeExemplo texto="O botão fica preso no canto inferior direito do preview, por cima do conteúdo." />
          <BotaoFlutuante rotulo="Falar no WhatsApp" href="#whatsapp" tom="sucesso" />
        </>
      ),
    },
    {
      name: "Voltar ao topo",
      render: () => (
        <>
          <PaginaDeExemplo texto="Botão (não link) no canto inferior esquerdo que leva de volta ao topo." />
          <BotaoFlutuante
            rotulo="Voltar ao topo"
            icone="topo"
            tom="superficie"
            posicao="inferior-esquerda"
            aoClicar={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          />
        </>
      ),
    },
  ],
});
