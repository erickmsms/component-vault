"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useSemMovimento } from "@/library/revelar/Movimento";

export type ItemDaLista = { id: string; texto: string; feito: boolean };

/** Textos da lista; troque para o contexto ("Novo passo...", "Nenhum passo ainda"). */
export type TextosDaLista = {
  progresso: string;
  /** Recebe feitos e total: "3 de 5". */
  contagem: (feitos: number, total: number) => string;
  novoItem: string;
  adicionar: string;
  vazio: string;
  editar: string;
  subir: string;
  descer: string;
  remover: string;
};

const TEXTOS_PADRAO: TextosDaLista = {
  progresso: "Progresso",
  contagem: (feitos, total) => `${feitos} de ${total}`,
  novoItem: "Nova tarefa...",
  adicionar: "Adicionar tarefa",
  vazio: "Nenhuma tarefa ainda. Use o campo acima para adicionar a primeira.",
  editar: "Editar",
  subir: "Mover para cima",
  descer: "Mover para baixo",
  remover: "Remover",
};

function novoId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

const svg = (children: ReactNode) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const BOTAO_BASE =
  "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted outline-accent focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";
const BOTAO_ICONE = `${BOTAO_BASE} hover:bg-surface hover:text-ink`;

/** Foco a restaurar depois que a lista renderiza de novo (o item mudou de lugar ou saiu). */
type FocoPendente = { id: string; alvo: "caixa" | "subir" | "descer" | "editar" } | { id: null; alvo: "novo" };

/**
 * Checklist controlado: barra de progresso com "x de y", campo para adicionar,
 * marcar como feito, edição no lugar (duplo clique no texto ou botão de editar;
 * Enter salva, Esc cancela), remover e, opcionalmente, reordenar com botões.
 */
export function ListaDeTarefas({
  itens,
  aoMudar,
  rotulo = "Lista de tarefas",
  reordenavel = true,
  editavel = true,
  textos: textosParciais,
}: {
  itens: ItemDaLista[];
  /** Recebe a lista inteira já alterada. */
  aoMudar: (itens: ItemDaLista[]) => void;
  /** Nome da lista para leitores de tela. */
  rotulo?: string;
  /** Mostra os botões de subir e descer. */
  reordenavel?: boolean;
  /** Permite adicionar, editar e remover (desligado, só marca e desmarca). */
  editavel?: boolean;
  textos?: Partial<TextosDaLista>;
}) {
  const textos = { ...TEXTOS_PADRAO, ...textosParciais };
  const semMovimento = useSemMovimento();
  const idLista = useId();
  const [novo, setNovo] = useState("");
  const [editando, setEditando] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState("");
  const raiz = useRef<HTMLDivElement>(null);
  const campoNovo = useRef<HTMLInputElement>(null);
  const focoPendente = useRef<FocoPendente | null>(null);
  const edicaoAtiva = useRef<string | null>(null);

  const feitos = itens.filter((i) => i.feito).length;
  const total = itens.length;
  const pct = total === 0 ? 0 : Math.round((feitos / total) * 100);

  // Depois de mover ou remover, o React recria ou desloca a linha e o foco se perde: devolve ao lugar certo.
  useEffect(() => {
    const pendente = focoPendente.current;
    if (!pendente) return;
    focoPendente.current = null;
    if (pendente.alvo === "novo") {
      campoNovo.current?.focus();
      return;
    }
    const linha = raiz.current?.querySelector<HTMLElement>(`[data-item="${CSS.escape(pendente.id)}"]`);
    let el = linha?.querySelector<HTMLElement>(`[data-foco="${pendente.alvo}"]`);
    // Chegou na ponta: o botão ficou desabilitado, então o foco vai para o do sentido oposto.
    if (el instanceof HTMLButtonElement && el.disabled) {
      el = linha?.querySelector<HTMLElement>(`[data-foco="${pendente.alvo === "subir" ? "descer" : "subir"}"]`);
    }
    el?.focus();
  });

  function adicionar() {
    const texto = novo.trim();
    if (!texto) return;
    aoMudar([...itens, { id: novoId(), texto, feito: false }]);
    setNovo("");
  }

  function alternar(id: string) {
    aoMudar(itens.map((i) => (i.id === id ? { ...i, feito: !i.feito } : i)));
  }

  function comecarEdicao(item: ItemDaLista) {
    if (!editavel) return;
    edicaoAtiva.current = item.id;
    setEditando(item.id);
    setRascunho(item.texto);
  }

  /**
   * Fecha a edição (salvando ou não). O campo some ao fechar e o navegador ainda
   * dispara o blur dele: a ref impede que esse blur salve o que o Esc cancelou.
   * O foco só volta ao botão de editar quando a edição termina pelo teclado.
   */
  function terminarEdicao(item: ItemDaLista, salvar: boolean, devolverFoco: boolean) {
    if (edicaoAtiva.current !== item.id) return;
    edicaoAtiva.current = null;
    setEditando(null);
    if (devolverFoco) focoPendente.current = { id: item.id, alvo: "editar" };
    const texto = rascunho.trim();
    // Texto vazio não apaga o item: só cancela a edição.
    if (salvar && texto && texto !== item.texto) aoMudar(itens.map((i) => (i.id === item.id ? { ...i, texto } : i)));
  }

  function mover(indice: number, passo: -1 | 1) {
    const destino = indice + passo;
    if (destino < 0 || destino >= itens.length) return;
    const nova = [...itens];
    [nova[indice], nova[destino]] = [nova[destino], nova[indice]];
    focoPendente.current = { id: itens[indice].id, alvo: passo === -1 ? "subir" : "descer" };
    aoMudar(nova);
  }

  function remover(indice: number) {
    const vizinho = itens[indice + 1] ?? itens[indice - 1];
    focoPendente.current = vizinho ? { id: vizinho.id, alvo: "caixa" } : { id: null, alvo: "novo" };
    aoMudar(itens.filter((_, i) => i !== indice));
  }

  return (
    <div ref={raiz} role="group" aria-label={rotulo} className="flex flex-col gap-4">
      <div className="rounded-xl border border-rule bg-surface p-4">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span className="font-medium text-ink-2">{textos.progresso}</span>
          <span aria-live="polite" className="text-muted tabular-nums">
            {total === 0 ? "—" : `${textos.contagem(feitos, total)} (${pct}%)`}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label={textos.progresso}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          className="h-2 overflow-hidden rounded-full bg-track"
        >
          <div
            className={`h-full rounded-full ${pct === 100 ? "bg-success" : "bg-accent"} ${semMovimento ? "" : "transition-[width] duration-300 ease-out"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {editavel && (
        <div className="flex items-stretch gap-2">
          <input
            ref={campoNovo}
            value={novo}
            onChange={(e) => setNovo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                adicionar();
              }
            }}
            placeholder={textos.novoItem}
            aria-label={textos.novoItem}
            className="h-11 min-w-0 flex-1 rounded-lg border border-rule bg-page px-3 text-sm text-ink outline-accent placeholder:text-muted focus-visible:outline-2 focus-visible:-outline-offset-1"
          />
          <button
            type="button"
            onClick={adicionar}
            disabled={!novo.trim()}
            aria-label={textos.adicionar}
            title={textos.adicionar}
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-accent text-page outline-accent hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {svg(<path d="M12 5v14M5 12h14" />)}
          </button>
        </div>
      )}

      {itens.length === 0 ? (
        <p className="rounded-xl border border-dashed border-rule px-4 py-6 text-center text-sm text-muted">{textos.vazio}</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {itens.map((item, i) => {
            const idTexto = `${idLista}-${i}`; // pelo índice: o id de quem usa pode ter espaços
            const emEdicao = editando === item.id;
            return (
              <li
                key={item.id}
                data-item={item.id}
                className={`group flex min-h-12 items-center gap-3 rounded-lg border px-3 py-1.5 ${
                  item.feito ? "border-success/30 bg-success/5" : "border-rule bg-page hover:bg-surface"
                }`}
              >
                <span className="relative flex shrink-0">
                  <input
                    type="checkbox"
                    data-foco="caixa"
                    checked={item.feito}
                    onChange={() => alternar(item.id)}
                    aria-labelledby={idTexto}
                    className="peer size-5 cursor-pointer appearance-none rounded-md border border-rule-strong bg-page outline-accent checked:border-success checked:bg-success focus-visible:outline-2 focus-visible:outline-offset-2"
                  />
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="pointer-events-none absolute inset-0 m-auto hidden size-3.5 text-page peer-checked:block"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  </svg>
                </span>

                {emEdicao ? (
                  <input
                    ref={(el) => el?.focus()}
                    id={idTexto}
                    value={rascunho}
                    aria-label={textos.editar}
                    onChange={(e) => setRascunho(e.target.value)}
                    onBlur={() => terminarEdicao(item, true, false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        terminarEdicao(item, true, true);
                      } else if (e.key === "Escape") {
                        e.preventDefault();
                        terminarEdicao(item, false, true);
                      }
                    }}
                    className="h-9 min-w-0 flex-1 rounded-md border border-accent bg-page px-2 text-sm text-ink outline-none"
                  />
                ) : (
                  <span
                    id={idTexto}
                    onDoubleClick={() => comecarEdicao(item)}
                    className={`min-w-0 flex-1 text-sm break-words ${item.feito ? "text-muted line-through" : "text-ink"} ${editavel ? "cursor-text" : ""}`}
                  >
                    {item.texto}
                  </span>
                )}

                {/* Com mouse, as ações aparecem no hover/foco; em telas de toque ficam sempre visíveis. */}
                {!emEdicao && (editavel || reordenavel) && (
                  <div className="flex shrink-0 items-center gap-0.5 pointer-fine:opacity-0 pointer-fine:group-focus-within:opacity-100 pointer-fine:group-hover:opacity-100">
                    {editavel && (
                      <button type="button" data-foco="editar" onClick={() => comecarEdicao(item)} aria-label={`${textos.editar}: ${item.texto}`} title={textos.editar} className={BOTAO_ICONE}>
                        {svg(<path d="M4 20h4L19 9l-4-4L4 16v4z" />)}
                      </button>
                    )}
                    {reordenavel && (
                      <>
                        <button type="button" data-foco="subir" onClick={() => mover(i, -1)} disabled={i === 0} aria-label={`${textos.subir}: ${item.texto}`} title={textos.subir} className={BOTAO_ICONE}>
                          {svg(<path d="M12 19V5m-6 6 6-6 6 6" />)}
                        </button>
                        <button
                          type="button"
                          data-foco="descer"
                          onClick={() => mover(i, 1)}
                          disabled={i === itens.length - 1}
                          aria-label={`${textos.descer}: ${item.texto}`}
                          title={textos.descer}
                          className={BOTAO_ICONE}
                        >
                          {svg(<path d="M12 5v14m-6-6 6 6 6-6" />)}
                        </button>
                      </>
                    )}
                    {editavel && (
                      <button
                        type="button"
                        onClick={() => remover(i)}
                        aria-label={`${textos.remover}: ${item.texto}`}
                        title={textos.remover}
                        className={`${BOTAO_BASE} hover:bg-critical/10 hover:text-critical`}
                      >
                        {svg(<path d="M6 6l12 12M18 6 6 18" />)}
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
