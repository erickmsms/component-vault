import { useState } from "react";
import { defineStories } from "@/registry/stories";
import { BarraDeFiltros, FiltrosAtivos, type FiltroAtivo, type GrupoDeFiltro } from "./BarraDeFiltros";

type Produto = { nome: string; categoria: string; marca: string; etiquetas: string[] };

const PRODUTOS: Produto[] = [
  { nome: "Camiseta básica", categoria: "Roupas", marca: "Aurora", etiquetas: ["algodão", "lançamento"] },
  { nome: "Jaqueta corta-vento", categoria: "Roupas", marca: "Brisa", etiquetas: ["impermeável"] },
  { nome: "Tênis de corrida", categoria: "Calçados", marca: "Brisa", etiquetas: ["promoção", "esporte"] },
  { nome: "Sandália de couro", categoria: "Calçados", marca: "Cedro", etiquetas: ["couro"] },
  { nome: "Mochila 20 L", categoria: "Acessórios", marca: "Duna", etiquetas: ["impermeável", "lançamento"] },
  { nome: "Boné de linho", categoria: "Acessórios", marca: "Aurora", etiquetas: ["promoção"] },
  { nome: "Caneca esmaltada", categoria: "Casa", marca: "Cedro", etiquetas: ["presente"] },
  { nome: "Manta de tricô", categoria: "Casa", marca: "Duna", etiquetas: ["algodão", "presente"] },
  { nome: "Meia de cano alto", categoria: "Roupas", marca: "Aurora", etiquetas: ["algodão", "promoção", "esporte"] },
];

function contar(valores: string[]) {
  const contagem = new Map<string, number>();
  for (const v of valores) contagem.set(v, (contagem.get(v) ?? 0) + 1);
  return [...contagem.entries()].sort(([a], [b]) => a.localeCompare(b, "pt-BR"));
}

const CATEGORIAS = contar(PRODUTOS.map((p) => p.categoria)).map(([valor, n]) => ({ valor, rotulo: valor, quantidade: n }));
const MARCAS = contar(PRODUTOS.map((p) => p.marca)).map(([valor, n]) => ({ valor, rotulo: valor, detalhe: n }));
const ETIQUETAS = contar(PRODUTOS.flatMap((p) => p.etiquetas)).map(([valor, n]) => ({ valor, rotulo: valor, detalhe: n }));

type Opcoes = { comBusca: boolean; comLista: boolean; comEtiquetas: boolean; buscaNasEtiquetas: boolean };

/** Estado dos filtros e os grupos montados a partir dele (usado pelas duas variações). */
function useFiltros({ comBusca, comLista, comEtiquetas, buscaNasEtiquetas }: Opcoes) {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [etiquetas, setEtiquetas] = useState<string[]>(["promoção"]);

  const grupos: GrupoDeFiltro[] = [
    ...(comEtiquetas
      ? [
          {
            tipo: "multiplo" as const,
            titulo: "Etiquetas",
            rotulo: "Etiquetas",
            opcoes: ETIQUETAS,
            selecionados: etiquetas,
            aoMudar: setEtiquetas,
            comBusca: buscaNasEtiquetas,
            rotuloDaBusca: "Buscar etiqueta...",
          },
        ]
      : []),
    { tipo: "multiplo", titulo: "Marca", rotulo: "Marcas", opcoes: MARCAS, selecionados: marcas, aoMudar: setMarcas },
    ...(comLista
      ? [
          {
            tipo: "lista" as const,
            titulo: "Categoria",
            opcoes: CATEGORIAS,
            selecionado: categoria,
            aoEscolher: setCategoria,
            quantidadeTotal: PRODUTOS.length,
          },
        ]
      : []),
  ];

  const resultados = PRODUTOS.filter(
    (p) =>
      (!categoria || p.categoria === categoria) &&
      (marcas.length === 0 || marcas.includes(p.marca)) &&
      (etiquetas.length === 0 || etiquetas.some((e) => p.etiquetas.includes(e))) &&
      p.nome.toLowerCase().includes(busca.trim().toLowerCase()),
  );

  const ativos: FiltroAtivo[] = [
    ...(busca.trim() ? [{ chave: "busca", rotulo: `Busca: “${busca.trim()}”`, aoRemover: () => setBusca("") }] : []),
    ...(categoria ? [{ chave: "categoria", rotulo: `Categoria: ${categoria}`, aoRemover: () => setCategoria(null) }] : []),
    ...marcas.map((m) => ({ chave: `m-${m}`, rotulo: `Marca: ${m}`, aoRemover: () => setMarcas(marcas.filter((x) => x !== m)) })),
    ...etiquetas.map((e) => ({
      chave: `e-${e}`,
      rotulo: `Etiqueta: ${e}`,
      aoRemover: () => setEtiquetas(etiquetas.filter((x) => x !== e)),
    })),
  ];

  const limparTudo = () => {
    setBusca("");
    setCategoria(null);
    setMarcas([]);
    setEtiquetas([]);
  };

  return { busca: comBusca ? { valor: busca, aoMudar: setBusca, placeholder: "Buscar produto..." } : undefined, grupos, resultados, ativos, limparTudo };
}

function SoABarra(opcoes: Opcoes) {
  const { busca, grupos } = useFiltros(opcoes);
  // Espaço abaixo para os painéis dos seletores abrirem dentro do preview
  return (
    <div className="min-h-[34rem] w-64">
      <BarraDeFiltros busca={busca} grupos={grupos} />
    </div>
  );
}

function ComResultados() {
  const { busca, grupos, resultados, ativos, limparTudo } = useFiltros({
    comBusca: true,
    comLista: true,
    comEtiquetas: true,
    buscaNasEtiquetas: true,
  });
  return (
    <div className="flex min-h-[34rem] w-full max-w-5xl flex-col gap-6 lg:flex-row">
      <BarraDeFiltros busca={busca} grupos={grupos} className="lg:w-60 lg:shrink-0" />
      <div className="min-w-0 flex-1 space-y-4">
        <FiltrosAtivos
          filtros={ativos}
          aoLimparTudo={limparTudo}
          resumo={`${resultados.length} de ${PRODUTOS.length} produtos`}
        />
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-3">
          {resultados.map((p) => (
            <li key={p.nome} className="rounded-xl border border-rule bg-surface p-4">
              <p className="font-medium">{p.nome}</p>
              <p className="mt-1 text-xs text-muted">
                {p.categoria} · {p.marca}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default defineStories({
  args: { comBusca: true, comLista: true, comEtiquetas: true, buscaNasEtiquetas: true },
  controls: {
    comBusca: { type: "boolean", label: "busca" },
    comLista: { type: "boolean", label: "grupo em lista (Categoria)" },
    comEtiquetas: { type: "boolean", label: "grupo múltiplo longo (Etiquetas)" },
    buscaNasEtiquetas: { type: "boolean", label: "comBusca no grupo de etiquetas" },
  },
  render: (a) => <SoABarra {...a} />,
  stories: [
    { name: "Barra de filtros" },
    { name: "Com resultados e filtros ativos", render: () => <ComResultados /> },
    {
      name: "Filtros ativos",
      render: () => (
        <FiltrosAtivos
          resumo="3 de 9 produtos"
          filtros={[
            { chave: "a", rotulo: "Marca: Aurora", aoRemover: () => {} },
            { chave: "b", rotulo: "Etiqueta: promoção", aoRemover: () => {} },
          ]}
          aoLimparTudo={() => {}}
        />
      ),
    },
  ],
});
