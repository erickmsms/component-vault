"use client";

import { Botao } from "@/library/botao/Botao";
import { useState } from "react";
import { MenuSuspenso } from "@/library/menu-suspenso/MenuSuspenso";

export type OpcaoDoSeletor = {
  valor: string;
  rotulo: string;
  cor?: string;
  /** Texto curto à direita da opção, como uma contagem ("12"). */
  detalhe?: string | number;
};

/** Textos do seletor; troque para concordar com o que é escolhido ("Todas", "Nenhuma"...). */
export type TextosDoSeletor = { todos: string; nenhum: string; marcarTodos: string; limpar: string };

const TEXTOS_PADRAO: TextosDoSeletor = {
  todos: "Todos",
  nenhum: "Nenhum",
  marcarTodos: "Marcar todos",
  limpar: "Limpar",
};

/** "Todos", "Recife", "Recife, Olinda" ou "3 de 8": cabe no botão sem quebrar a barra. */
function resumir(opcoes: OpcaoDoSeletor[], selecionados: string[], textos: TextosDoSeletor): string {
  if (selecionados.length === 0) return textos.nenhum;
  if (selecionados.length === opcoes.length) return textos.todos;
  if (selecionados.length <= 2) {
    return opcoes
      .filter((o) => selecionados.includes(o.valor))
      .map((o) => o.rotulo)
      .join(", ");
  }
  return `${selecionados.length} de ${opcoes.length}`;
}

/** Para buscar sem diferenciar maiúsculas nem acentos ("ceara" acha "Ceará"). */
const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();

/**
 * Caixa de seleção múltipla: um botão com o resumo da escolha que abre uma lista
 * de caixas de marcar, com atalhos para marcar tudo e limpar e, opcionalmente, uma
 * busca no topo do painel.
 */
export function SeletorMultiplo({
  rotulo,
  opcoes,
  selecionados,
  aoMudar,
  textos: textosParciais,
  comBusca = false,
  rotuloDaBusca = "Buscar...",
  textoSemResultados = "Nenhum resultado.",
  alinhamento,
  bloco,
}: {
  rotulo: string;
  opcoes: OpcaoDoSeletor[];
  selecionados: string[];
  aoMudar: (selecionados: string[]) => void;
  textos?: Partial<TextosDoSeletor>;
  /** Lado em que o painel se alinha ao botão (veja o Menu Suspenso). */
  alinhamento?: "inicio" | "fim";
  /** Botão com a largura toda do contêiner. */
  bloco?: boolean;
  /** Campo de busca no topo do painel (sem diferenciar maiúsculas e acentos). Com busca, marcar todos e limpar valem para as opções encontradas. */
  comBusca?: boolean;
  /** Texto de exemplo e nome do campo de busca. */
  rotuloDaBusca?: string;
  /** Mensagem quando a busca não encontra nenhuma opção. */
  textoSemResultados?: string;
}) {
  const textos = { ...TEXTOS_PADRAO, ...textosParciais };
  // O painel só existe aberto: a busca recomeça vazia a cada abertura
  return (
    <MenuSuspenso rotulo={rotulo} resumo={resumir(opcoes, selecionados, textos)} alinhamento={alinhamento} bloco={bloco}>
      {() => (
        <PainelDoSeletor
          opcoes={opcoes}
          selecionados={selecionados}
          aoMudar={aoMudar}
          textos={textos}
          comBusca={comBusca}
          rotuloDaBusca={rotuloDaBusca}
          textoSemResultados={textoSemResultados}
        />
      )}
    </MenuSuspenso>
  );
}

function PainelDoSeletor({
  opcoes,
  selecionados,
  aoMudar,
  textos,
  comBusca,
  rotuloDaBusca,
  textoSemResultados,
}: {
  opcoes: OpcaoDoSeletor[];
  selecionados: string[];
  aoMudar: (selecionados: string[]) => void;
  textos: TextosDoSeletor;
  comBusca: boolean;
  rotuloDaBusca: string;
  textoSemResultados: string;
}) {
  const [busca, setBusca] = useState("");
  const termo = comBusca ? normalizar(busca) : "";
  const visiveis = termo ? opcoes.filter((o) => normalizar(o.rotulo).includes(termo)) : opcoes;

  // Mantém a ordem das opções no resultado
  const emOrdem = (valores: Set<string>) => opcoes.map((o) => o.valor).filter((v) => valores.has(v));
  const alternar = (valor: string) =>
    aoMudar(
      selecionados.includes(valor)
        ? selecionados.filter((v) => v !== valor)
        : emOrdem(new Set([...selecionados, valor])),
    );
  // Sem busca, valem para todas as opções; com busca, só para as encontradas
  const marcarTodos = () =>
    aoMudar(termo ? emOrdem(new Set([...selecionados, ...visiveis.map((o) => o.valor)])) : opcoes.map((o) => o.valor));
  const limpar = () => {
    const encontradas = new Set(visiveis.map((o) => o.valor));
    aoMudar(termo ? selecionados.filter((v) => !encontradas.has(v)) : []);
  };
  const todasMarcadas = termo
    ? visiveis.every((o) => selecionados.includes(o.valor))
    : selecionados.length === opcoes.length;
  const nenhumaMarcada = termo ? !visiveis.some((o) => selecionados.includes(o.valor)) : selecionados.length === 0;

  return (
    <>
      {comBusca && (
        <div className="border-b border-rule p-2">
          <label className="flex min-h-10 items-center gap-2 rounded-[max(var(--radius-sm),calc(var(--radius-xl)_-_var(--spacing)*2))] border border-rule bg-surface px-3 text-sm outline-accent focus-within:border-accent focus-within:outline-2 focus-within:outline-offset-1">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4 4" />
            </svg>
            <input
              // Abre já pronto para digitar
              autoFocus
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={(e) => {
                // Não envia o formulário em volta
                if (e.key === "Enter") e.preventDefault();
              }}
              placeholder={rotuloDaBusca}
              aria-label={rotuloDaBusca}
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent py-2 text-ink outline-none placeholder:text-muted"
            />
          </label>
        </div>
      )}
      <div className="flex items-center justify-between border-b border-rule px-3 py-2">
        <Botao variante="link" disabled={visiveis.length === 0 || todasMarcadas} onClick={marcarTodos}>
          {textos.marcarTodos}
        </Botao>
        <Botao variante="link" disabled={visiveis.length === 0 || nenhumaMarcada} onClick={limpar}>
          {textos.limpar}
        </Botao>
      </div>
      {visiveis.length === 0 ? (
        <p role="status" className="px-3 py-4 text-sm text-muted">
          {textoSemResultados}
        </p>
      ) : (
        <ul className="max-h-72 overflow-y-auto py-1">
          {visiveis.map((o) => (
            <li key={o.valor}>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 px-3 text-sm hover:bg-surface">
                <input
                  type="checkbox"
                  checked={selecionados.includes(o.valor)}
                  onChange={() => alternar(o.valor)}
                  className="size-4 shrink-0 cursor-pointer accent-accent"
                />
                {o.cor && <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ background: o.cor }} />}
                <span className="min-w-0 truncate">{o.rotulo}</span>
                {o.detalhe !== undefined && (
                  <span className="ml-auto shrink-0 text-xs text-muted tabular-nums">{o.detalhe}</span>
                )}
              </label>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
