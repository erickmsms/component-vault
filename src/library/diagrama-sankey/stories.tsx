import { defineStories } from "@/registry/stories";
import { DiagramaSankey } from "./DiagramaSankey";

const ORCAMENTO = {
  nos: [
    { id: "receita", rotulo: "Receita" },
    { id: "pessoal", rotulo: "Pessoal" },
    { id: "infra", rotulo: "Infraestrutura" },
    { id: "marketing", rotulo: "Marketing" },
    { id: "nuvem", rotulo: "Nuvem" },
    { id: "escritorio", rotulo: "Escritório" },
  ],
  ligacoes: [
    { de: "receita", para: "pessoal", valor: 420 },
    { de: "receita", para: "infra", valor: 260 },
    { de: "receita", para: "marketing", valor: 140 },
    { de: "infra", para: "nuvem", valor: 180 },
    { de: "infra", para: "escritorio", valor: 80 },
  ],
};

const TRAFEGO = {
  nos: [
    { id: "busca", rotulo: "Busca" },
    { id: "social", rotulo: "Redes sociais" },
    { id: "direto", rotulo: "Direto" },
    { id: "home", rotulo: "Página inicial" },
    { id: "produto", rotulo: "Produto" },
    { id: "carrinho", rotulo: "Carrinho" },
    { id: "saiu", rotulo: "Saiu", cor: "var(--muted)" },
    { id: "compra", rotulo: "Compra" },
  ],
  ligacoes: [
    { de: "busca", para: "home", valor: 3200 },
    { de: "busca", para: "produto", valor: 2100 },
    { de: "social", para: "home", valor: 1800 },
    { de: "direto", para: "home", valor: 1400 },
    { de: "home", para: "produto", valor: 3900 },
    { de: "home", para: "saiu", valor: 2500 },
    { de: "produto", para: "carrinho", valor: 2600 },
    { de: "produto", para: "saiu", valor: 3400 },
    { de: "carrinho", para: "compra", valor: 1700 },
    { de: "carrinho", para: "saiu", valor: 900 },
  ],
};

const milhares = (n: number) => n.toLocaleString("pt-BR");

export default defineStories({
  args: { altura: 300, larguraDoNo: 14, espacoEntreNos: 16, mostrarValores: true },
  controls: {
    altura: { type: "number", min: 160, max: 600, step: 20 },
    larguraDoNo: { type: "number", min: 4, max: 32 },
    espacoEntreNos: { type: "number", min: 4, max: 40 },
    mostrarValores: { type: "boolean" },
  },
  render: (a) => (
    <div className="w-full max-w-2xl">
      <DiagramaSankey
        {...ORCAMENTO}
        rotulo="Para onde vai a receita (R$ mil)"
        formatar={(n) => `R$ ${n} mil`}
        altura={a.altura as number}
        larguraDoNo={a.larguraDoNo as number}
        espacoEntreNos={a.espacoEntreNos as number}
        mostrarValores={a.mostrarValores as boolean}
      />
    </div>
  ),
  stories: [
    { name: "Orçamento" },
    {
      name: "Funil de visitas",
      render: () => (
        <div className="w-full max-w-3xl">
          <DiagramaSankey {...TRAFEGO} rotulo="Caminho das visitas até a compra" formatar={milhares} altura={380} />
        </div>
      ),
    },
  ],
});
