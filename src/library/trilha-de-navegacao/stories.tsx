import { defineStories } from "@/registry/stories";
import { TrilhaDeNavegacao } from "./TrilhaDeNavegacao";

const CAMINHOS = {
  curto: [
    { rotulo: "Botões", href: "#botoes" },
    { rotulo: "Botão", href: "#botao" },
  ],
  longo: [
    { rotulo: "Início", href: "#inicio" },
    { rotulo: "Projetos", href: "#projetos" },
    { rotulo: "Site novo", href: "#site-novo" },
    { rotulo: "Configurações", href: "#configuracoes" },
  ],
};

export default defineStories({
  args: { caminho: "curto", separador: "→" },
  controls: {
    caminho: { type: "select", options: ["curto", "longo"] },
    separador: { type: "text" },
  },
  render: (a) => (
    <TrilhaDeNavegacao itens={CAMINHOS[a.caminho as keyof typeof CAMINHOS]} separador={a.separador} />
  ),
  stories: [
    { name: "Trilha" },
    { name: "Caminho longo", args: { caminho: "longo", separador: "/" } },
    {
      name: "Último item sem link",
      render: () => (
        <TrilhaDeNavegacao
          separador="›"
          itens={[{ rotulo: "Catálogo", href: "#catalogo" }, { rotulo: "Comparar" }]}
        />
      ),
    },
    {
      name: "Quebra em telas estreitas",
      render: () => (
        <div className="w-60">
          <TrilhaDeNavegacao itens={CAMINHOS.longo} />
        </div>
      ),
    },
  ],
});
