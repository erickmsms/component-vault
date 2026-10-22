"use client";

import { Botao } from "@/library/botao/Botao";
import { useId, type ReactNode } from "react";
import { BarraDeBusca } from "@/library/barra-de-busca/BarraDeBusca";
import { SeletorMultiplo, type OpcaoDoSeletor, type TextosDoSeletor } from "@/library/seletor-multiplo/SeletorMultiplo";

/** Grupo com um Seletor Múltiplo: bom para listas longas (temas, marcas, autores). */
export type GrupoMultiplo = {
  tipo: "multiplo";
  titulo: string;
  /** Texto dentro do botão ("Temas"). */
  rotulo: string;
  opcoes: OpcaoDoSeletor[];
  selecionados: string[];
  aoMudar: (selecionados: string[]) => void;
  /** Busca no painel; vale a pena a partir de umas 10 opções. */
  comBusca?: boolean;
  rotuloDaBusca?: string;
  textoSemResultados?: string;
  textos?: Partial<TextosDoSeletor>;
};

export type OpcaoDaLista = { valor: string; rotulo: string; quantidade?: number };

/** Grupo em lista sempre visível, com uma escolha por vez: bom para poucas opções (tipo, status). */
export type GrupoLista = {
  tipo: "lista";
  titulo: string;
  opcoes: OpcaoDaLista[];
  /** Valor escolhido; `null` é "todos" (sem filtro). */
  selecionado: string | null;
  aoEscolher: (valor: string | null) => void;
  /** Primeira linha, que tira o filtro (padrão "Todos"); `null` esconde a linha. */
  rotuloTodos?: string | null;
  /** Número mostrado na linha "Todos". */
  quantidadeTotal?: number;
};

export type GrupoDeFiltro = GrupoMultiplo | GrupoLista;

// Num filtro, nada marcado quer dizer "sem restrição": os dois casos aparecem como "Todos"
const TEXTOS_DO_FILTRO: Partial<TextosDoSeletor> = { todos: "Todos", nenhum: "Todos" };

function ItemDaLista({
  ativo,
  aoClicar,
  quantidade,
  children,
}: {
  ativo: boolean;
  aoClicar: () => void;
  quantidade?: number;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={aoClicar}
      className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-ink-2 outline-accent transition-colors hover:bg-surface hover:text-ink focus-visible:outline-2 aria-pressed:bg-ink aria-pressed:text-page"
    >
      <span className="truncate">{children}</span>
      {quantidade !== undefined && <span className="text-xs tabular-nums opacity-60">{quantidade}</span>}
    </button>
  );
}

function Grupo({ grupo }: { grupo: GrupoDeFiltro }) {
  const idTitulo = useId();
  return (
    <div role="group" aria-labelledby={idTitulo} className="space-y-2">
      <h3 id={idTitulo} className="text-xs font-medium tracking-wide text-muted uppercase">
        {grupo.titulo}
      </h3>
      {grupo.tipo === "multiplo" ? (
        <SeletorMultiplo
          rotulo={grupo.rotulo}
          opcoes={grupo.opcoes}
          selecionados={grupo.selecionados}
          aoMudar={grupo.aoMudar}
          textos={{ ...TEXTOS_DO_FILTRO, ...grupo.textos }}
          comBusca={grupo.comBusca}
          rotuloDaBusca={grupo.rotuloDaBusca}
          textoSemResultados={grupo.textoSemResultados}
          alinhamento="inicio"
          bloco
        />
      ) : (
        // Em telas estreitas a lista vira duas ou três colunas para não ficar comprida
        <ul className="grid grid-cols-2 gap-0.5 sm:grid-cols-3 lg:grid-cols-1">
          {grupo.rotuloTodos !== null && (
            <li>
              <ItemDaLista
                ativo={grupo.selecionado === null}
                aoClicar={() => grupo.aoEscolher(null)}
                quantidade={grupo.quantidadeTotal}
              >
                {grupo.rotuloTodos ?? "Todos"}
              </ItemDaLista>
            </li>
          )}
          {grupo.opcoes.map((o) => (
            <li key={o.valor}>
              <ItemDaLista
                ativo={grupo.selecionado === o.valor}
                aoClicar={() => grupo.aoEscolher(grupo.selecionado === o.valor ? null : o.valor)}
                quantidade={o.quantidade}
              >
                {o.rotulo}
              </ItemDaLista>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Barra lateral de filtros para catálogos e listagens: busca, grupos de seleção
 * múltipla (listas longas, com busca e contagem) e grupos em lista (poucas opções).
 * Com `fixa`, a partir de telas largas ela fica parada enquanto a página rola.
 */
export function BarraDeFiltros({
  busca,
  grupos,
  fixa = false,
  topo = 0,
  rotulo = "Filtros",
  className = "",
}: {
  busca?: { valor: string; aoMudar: (valor: string) => void; placeholder?: string };
  grupos: GrupoDeFiltro[];
  /** Fica parada ao rolar a página (position: sticky), a partir de telas largas (lg). */
  fixa?: boolean;
  /**
   * Distância do topo da tela em que ela para (px ou valor CSS). Para não se mexer
   * nada ao rolar, use a posição em que ela já começa: altura do cabeçalho fixo da
   * página mais o espaço acima da barra.
   */
  topo?: number | string;
  /** Nome da região para leitores de tela. */
  rotulo?: string;
  className?: string;
}) {
  return (
    <aside
      aria-label={rotulo}
      // z-10: os painéis dos seletores passam por cima do conteúdo ao lado
      className={`space-y-6 ${fixa ? "lg:sticky lg:z-10 lg:self-start" : ""} ${className}`}
      style={fixa ? { top: topo } : undefined}
    >
      {busca && (
        <BarraDeBusca
          value={busca.valor}
          onChange={busca.aoMudar}
          placeholder={busca.placeholder ?? "Buscar..."}
          aria-label={busca.placeholder ?? "Buscar"}
          tamanho="sm"
        />
      )}
      {grupos.map((grupo) => (
        <Grupo key={grupo.titulo} grupo={grupo} />
      ))}
    </aside>
  );
}

export type FiltroAtivo = { chave: string; rotulo: string; aoRemover: () => void };

/**
 * Os filtros em uso, em pílulas que removem um por vez, mais "Limpar tudo". Fica
 * acima dos resultados, para limpar sem precisar voltar à barra de filtros.
 */
export function FiltrosAtivos({
  filtros,
  aoLimparTudo,
  resumo,
  rotuloLimpar = "Limpar tudo",
  minimoParaLimpar = 2,
}: {
  filtros: FiltroAtivo[];
  aoLimparTudo?: () => void;
  /** Texto antes das pílulas, como "12 de 59 resultados" (anunciado ao mudar). */
  resumo?: ReactNode;
  rotuloLimpar?: string;
  /** A partir de quantos filtros "Limpar tudo" aparece (com um só, o × da pílula basta). */
  minimoParaLimpar?: number;
}) {
  return (
    <div className="flex min-h-8 flex-wrap items-center gap-2">
      {resumo && (
        <p className="mr-2 text-sm text-muted" aria-live="polite">
          {resumo}
        </p>
      )}
      {filtros.map((filtro) => (
        <button
          key={filtro.chave}
          type="button"
          onClick={filtro.aoRemover}
          aria-label={`Remover filtro ${filtro.rotulo}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-rule py-1 pr-2 pl-3 text-xs text-ink-2 outline-accent transition-colors hover:border-axis hover:bg-surface hover:text-ink focus-visible:outline-2"
        >
          {filtro.rotulo}
          <span aria-hidden="true" className="text-sm leading-none opacity-60">
            ×
          </span>
        </button>
      ))}
      {aoLimparTudo && filtros.length >= minimoParaLimpar && (
        <Botao variante="link" tamanho="xs" onClick={aoLimparTudo}>
          {rotuloLimpar}
        </Botao>
      )}
    </div>
  );
}
