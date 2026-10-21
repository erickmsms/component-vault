"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, Suspense, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { BarraDeFiltros } from "@/library/barra-de-filtros/BarraDeFiltros";
import type { OpcaoDoSeletor } from "@/library/seletor-multiplo/SeletorMultiplo";
import { registry } from "@/registry";
import { categories, categoryIds, type CategoryId } from "@/registry/categories";
import { THEME_ATTR } from "@/themes/tokens";

const usedCategories = categoryIds.filter((id) => registry.some((c) => c.category === id));

/** Opções de um seletor com quantos componentes têm cada valor, em ordem alfabética. */
function opcoesComContagem(valores: string[]): OpcaoDoSeletor[] {
  const contagem = new Map<string, number>();
  for (const v of valores) contagem.set(v, (contagem.get(v) ?? 0) + 1);
  return [...contagem.keys()]
    .sort((a, b) => a.localeCompare(b, "pt-BR"))
    .map((valor) => ({ valor, rotulo: valor, detalhe: contagem.get(valor) }));
}

const opcoesDeTema = opcoesComContagem(registry.flatMap((c) => c.tags));
const opcoesDeProjeto = opcoesComContagem(registry.flatMap((c) => (c.source ? [c.source] : [])));

/** "a,b" na URL -> ["a", "b"] */
const lista = (valor: string | null) => valor?.split(",").filter(Boolean) ?? [];

// A busca por texto não vai para a URL: fica aqui, no layout, e por isso continua
// preenchida ao ir do catálogo para a página de um componente e voltar.
const BuscaContext = createContext<{ query: string; setQuery: (valor: string) => void } | null>(null);

export function FiltrosProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  return <BuscaContext value={{ query, setQuery }}>{children}</BuscaContext>;
}

export function useBusca() {
  const contexto = useContext(BuscaContext);
  if (!contexto) throw new Error("useBusca precisa estar dentro de <FiltrosProvider>");
  return contexto;
}

/**
 * Os filtros do catálogo, guardados na URL para dar pra compartilhar:
 * /?tipo=forms&tema=dropdown,kpi&projeto=nexco. Mudar um filtro fora do catálogo
 * (na página de um componente) leva para o catálogo já filtrado.
 */
export function useFiltrosDaUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setQuery } = useBusca();

  const tipo = searchParams.get("tipo");
  const category = tipo && tipo in categories ? (tipo as CategoryId) : null;
  const tags = lista(searchParams.get("tema"));
  const sources = lista(searchParams.get("projeto"));

  function setParams(changes: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const qs = params.toString();
    const destino = qs ? `/?${qs}` : "/";
    // No catálogo só troca a URL; vindo de outra página, é uma navegação de verdade
    if (pathname === "/") router.replace(destino, { scroll: false });
    else router.push(destino);
  }

  function clearFilters() {
    setQuery("");
    router.replace("/", { scroll: false });
  }

  return { category, tags, sources, setParams, clearFilters };
}

/**
 * Onde a linha da barra lateral e do conteúdo começa na página (distância do topo do documento).
 * É a distância em que a barra para ao rolar: se fosse outra, ela daria um pulo ao começar a
 * grudar. Acompanha mudanças no cabeçalho (tema, fontes, largura da janela).
 */
function useTopoDaLinha(ativo: boolean) {
  const linhaRef = useRef<HTMLDivElement>(null);
  const [topo, setTopo] = useState(120);

  useEffect(() => {
    const linha = linhaRef.current;
    if (!ativo || !linha) return;
    const medir = () => setTopo(Math.round(linha.getBoundingClientRect().top + window.scrollY));
    const observador = new ResizeObserver(medir);
    // O cabeçalho empurra a linha para baixo; o corpo muda de tamanho junto com o conteúdo
    observador.observe(document.body);
    const cabecalho = document.querySelector("body header");
    if (cabecalho) observador.observe(cabecalho);
    return () => observador.disconnect();
  }, [ativo]);

  return { linhaRef, topo };
}

/** A Barra de Filtros da própria biblioteca, ligada à URL e à busca do catálogo. */
function BarraDoCatalogo({ topo }: { topo: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const { query, setQuery } = useBusca();
  const { category, tags, sources, setParams } = useFiltrosDaUrl();
  const noCatalogo = pathname === "/";

  return (
    // Usa o tema escolhido no cabeçalho; "contents" não cria caixa nova, então o sticky
    // da barra continua valendo em relação à linha inteira.
    <div data-theme={THEME_ATTR} className="contents">
      <BarraDeFiltros
        fixa
        topo={topo}
        rotulo="Filtros do catálogo"
        // Em telas estreitas a barra só aparece no catálogo: na página de um componente ela
        // empurraria o preview para baixo da dobra
        className={`lg:w-64 lg:shrink-0 ${noCatalogo ? "" : "hidden lg:block"}`}
        busca={{
          valor: query,
          aoMudar: (valor) => {
            setQuery(valor);
            // Buscar a partir da página de um componente leva para o catálogo
            if (!noCatalogo && valor.trim()) router.push("/");
          },
          placeholder: "Buscar por nome, tema, projeto...",
        }}
        grupos={[
          {
            tipo: "multiplo",
            titulo: "Tema",
            rotulo: "Temas",
            opcoes: opcoesDeTema,
            selecionados: tags,
            aoMudar: (v) => setParams({ tema: v.join(",") || null }),
            comBusca: true,
            rotuloDaBusca: "Buscar tema...",
            textoSemResultados: "Nenhum tema com esse nome.",
          },
          {
            tipo: "multiplo",
            titulo: "Projeto de origem",
            rotulo: "Projetos",
            opcoes: opcoesDeProjeto,
            selecionados: sources,
            aoMudar: (v) => setParams({ projeto: v.join(",") || null }),
          },
          {
            tipo: "lista",
            titulo: "Tipo",
            opcoes: usedCategories.map((id) => ({
              valor: id,
              rotulo: categories[id],
              quantidade: registry.filter((c) => c.category === id).length,
            })),
            selecionado: category,
            aoEscolher: (v) => setParams({ tipo: v }),
            quantidadeTotal: registry.length,
          },
        ]}
      />
    </div>
  );
}

/**
 * Moldura da vitrine: a barra de filtros à esquerda e a página (catálogo ou componente)
 * à direita. Só os Fundamentos ficam sem a barra.
 */
export function VitrineShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const comBarra = !pathname.startsWith("/fundamentos");
  const { linhaRef, topo } = useTopoDaLinha(comBarra);

  if (!comBarra) return <>{children}</>;

  return (
    <div ref={linhaRef} className="flex flex-col gap-8 lg:flex-row">
      {/* A barra lê a URL (useSearchParams), então precisa de Suspense; o resto da página não espera por ela */}
      <Suspense fallback={<div className="hidden lg:block lg:w-64 lg:shrink-0" />}>
        <BarraDoCatalogo topo={topo} />
      </Suspense>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
