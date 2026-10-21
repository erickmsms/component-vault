"use client";

import { MenuSuspenso } from "@/library/menu-suspenso/MenuSuspenso";

export type OpcaoDoSeletor = { valor: string; rotulo: string; cor?: string };

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

const BOTAO_DE_ACAO =
  "cursor-pointer rounded px-1 text-sm font-medium text-accent underline-offset-2 outline-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-default disabled:text-muted disabled:no-underline";

/**
 * Caixa de seleção múltipla: um botão com o resumo da escolha que abre uma lista
 * de caixas de marcar, com atalhos para marcar tudo e limpar.
 */
export function SeletorMultiplo({
  rotulo,
  opcoes,
  selecionados,
  aoMudar,
  textos: textosParciais,
}: {
  rotulo: string;
  opcoes: OpcaoDoSeletor[];
  selecionados: string[];
  aoMudar: (selecionados: string[]) => void;
  textos?: Partial<TextosDoSeletor>;
}) {
  const textos = { ...TEXTOS_PADRAO, ...textosParciais };
  const alternar = (valor: string) =>
    aoMudar(
      selecionados.includes(valor)
        ? selecionados.filter((v) => v !== valor)
        : opcoes.map((o) => o.valor).filter((v) => v === valor || selecionados.includes(v)),
    );

  const todasMarcadas = selecionados.length === opcoes.length;

  return (
    <MenuSuspenso rotulo={rotulo} resumo={resumir(opcoes, selecionados, textos)}>
      {() => (
        <>
          <div className="flex items-center justify-between border-b border-rule px-3 py-2">
            <button type="button" className={BOTAO_DE_ACAO} disabled={todasMarcadas} onClick={() => aoMudar(opcoes.map((o) => o.valor))}>
              {textos.marcarTodos}
            </button>
            <button type="button" className={BOTAO_DE_ACAO} disabled={selecionados.length === 0} onClick={() => aoMudar([])}>
              {textos.limpar}
            </button>
          </div>
          <ul className="max-h-72 overflow-y-auto py-1">
            {opcoes.map((o) => (
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
                </label>
              </li>
            ))}
          </ul>
        </>
      )}
    </MenuSuspenso>
  );
}
