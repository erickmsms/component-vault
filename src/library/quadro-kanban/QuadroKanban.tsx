"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type DragEvent, type KeyboardEvent, type ReactNode } from "react";

export type PessoaDoCartao = { nome: string; imagem?: string };
export type EtiquetaDoCartao = { texto: string; cor?: string };

export type CartaoDoQuadro = {
  id: string;
  titulo: string;
  descricao?: string;
  /** Cor da faixa no topo do cartão (prioridade, tipo...). */
  cor?: string;
  /** Já formatado: "24 out", "amanhã". */
  prazo?: string;
  /** Pinta o prazo de vermelho. */
  prazoVencido?: boolean;
  etiquetas?: EtiquetaDoCartao[];
  responsaveis?: PessoaDoCartao[];
};

export type ColunaDoQuadro<C extends CartaoDoQuadro = CartaoDoQuadro> = {
  id: string;
  titulo: string;
  /** Cor do ponto ao lado do título. */
  cor?: string;
  cartoes: C[];
};

/** `indice` é a posição final na coluna de destino (contando sem o próprio cartão). */
export type MovimentoDeCartao = { cartaoId: string; deColuna: string; paraColuna: string; indice: number };

/** Aplica um movimento e devolve as colunas novas (sem mexer nas originais). Use dentro de `aoMover`. */
export function moverCartao<C extends CartaoDoQuadro>(colunas: ColunaDoQuadro<C>[], m: MovimentoDeCartao): ColunaDoQuadro<C>[] {
  const cartao = colunas.find((c) => c.id === m.deColuna)?.cartoes.find((k) => k.id === m.cartaoId);
  if (!cartao) return colunas;
  return colunas
    .map((c) => (c.id === m.deColuna ? { ...c, cartoes: c.cartoes.filter((k) => k.id !== m.cartaoId) } : c))
    .map((c) => {
      if (c.id !== m.paraColuna) return c;
      const cartoes = [...c.cartoes];
      cartoes.splice(Math.max(0, Math.min(m.indice, cartoes.length)), 0, cartao);
      return { ...c, cartoes };
    });
}

export type TextosDoQuadro = {
  vazio: string;
  mover: string;
  paraCima: string;
  paraBaixo: string;
  paraColuna: (coluna: string) => string;
  contagem: (quantidade: number) => string;
  prazo: string;
  responsaveis: string;
  /** Aviso para leitores de tela depois de mover. */
  anuncio: (cartao: string, coluna: string, posicao: number, total: number) => string;
};

const TEXTOS_PADRAO: TextosDoQuadro = {
  vazio: "Solte um cartão aqui",
  mover: "Mover",
  paraCima: "Mover para cima",
  paraBaixo: "Mover para baixo",
  paraColuna: (coluna) => `Mover para ${coluna}`,
  contagem: (n) => (n === 1 ? "1 cartão" : `${n} cartões`),
  prazo: "Prazo",
  responsaveis: "Responsáveis",
  anuncio: (cartao, coluna, posicao, total) => `${cartao} movido para ${coluna}, posição ${posicao} de ${total}.`,
};

// ─── Peças do cartão padrão ──────────────────────────────────────────────────

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

/** Cor estável por nome, entre as cores de série do tema. */
function corDoNome(nome: string) {
  let soma = 0;
  for (const letra of nome) soma = (soma * 31 + letra.charCodeAt(0)) >>> 0;
  return `var(--series-${(soma % 8) + 1})`;
}

function Avatar({ pessoa }: { pessoa: PessoaDoCartao }) {
  const base = "size-6 shrink-0 rounded-full ring-2 ring-page";
  if (pessoa.imagem) {
    // eslint-disable-next-line @next/next/no-img-element -- a biblioteca não depende do next/image
    return <img src={pessoa.imagem} alt="" title={pessoa.nome} className={`${base} object-cover`} />;
  }
  return (
    <span
      title={pessoa.nome}
      className={`${base} flex items-center justify-center text-xs leading-none font-semibold text-ink`}
      style={{ background: `color-mix(in oklab, ${corDoNome(pessoa.nome)} 30%, var(--page))` }}
    >
      {iniciais(pessoa.nome)}
    </span>
  );
}

const MAXIMO_DE_AVATARES = 3;

function CartaoPadrao({ cartao, textos, aoAbrir }: { cartao: CartaoDoQuadro; textos: TextosDoQuadro; aoAbrir?: () => void }) {
  const pessoas = cartao.responsaveis ?? [];
  const temMeta = cartao.prazo || (cartao.etiquetas?.length ?? 0) > 0;
  return (
    <>
      <h4 className="pr-7 text-sm leading-snug font-semibold text-ink">
        {aoAbrir ? (
          // Botão para o teclado; com o mouse, o cartão inteiro já abre.
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              aoAbrir();
            }}
            className="cursor-pointer rounded-sm text-left outline-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {cartao.titulo}
          </button>
        ) : (
          cartao.titulo
        )}
      </h4>
      {cartao.descricao && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-2">{cartao.descricao}</p>}

      {temMeta && (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-rule pt-2 text-xs text-ink-2">
          {cartao.prazo && (
            <span className={`inline-flex items-center gap-1 ${cartao.prazoVencido ? "font-semibold text-critical" : ""}`}>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="5" width="16" height="15" rx="2" />
                <path d="M4 10h16M9 3v4M15 3v4" />
              </svg>
              <span className="sr-only">{textos.prazo}: </span>
              {cartao.prazo}
            </span>
          )}
          {cartao.etiquetas?.map((et) => (
            <span key={et.texto} className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full" style={{ background: et.cor ?? "var(--accent)" }} />
              {et.texto}
            </span>
          ))}
        </div>
      )}

      {pessoas.length > 0 && (
        <div className="mt-2.5 flex items-center">
          <p className="sr-only">
            {textos.responsaveis}: {pessoas.map((p) => p.nome).join(", ")}
          </p>
          <span aria-hidden="true" className="flex -space-x-1.5">
            {pessoas.slice(0, MAXIMO_DE_AVATARES).map((p) => (
              <Avatar key={p.nome} pessoa={p} />
            ))}
            {pessoas.length > MAXIMO_DE_AVATARES && (
              <span className="flex size-6 items-center justify-center rounded-full bg-surface text-xs text-ink-2 ring-2 ring-page">
                +{pessoas.length - MAXIMO_DE_AVATARES}
              </span>
            )}
          </span>
        </div>
      )}
    </>
  );
}

// ─── Quadro ──────────────────────────────────────────────────────────────────

type Alvo = { coluna: string; indice: number; cartaoId: string };
type Menu = { cartaoId: string; colunaId: string; estilo: CSSProperties };

/** Posição de soltura: quantos cartões (sem o arrastado) têm o meio acima do ponteiro. */
function indiceNaPosicao(coluna: HTMLElement, y: number, arrastadoId: string) {
  let indice = 0;
  for (const el of coluna.querySelectorAll<HTMLElement>("[data-cartao-id]")) {
    if (el.dataset.cartaoId === arrastadoId) continue;
    const r = el.getBoundingClientRect();
    if (y > r.top + r.height / 2) indice++;
    else break;
  }
  return indice;
}

const LARGURA_DO_MENU = 224;

/**
 * Quadro kanban controlado: colunas (ponto de cor, título, contagem, corpo com
 * rolagem e dica quando vazia) e cartões (faixa de cor, título, prazo,
 * etiquetas e responsáveis). Arraste e solte entre colunas e dentro delas (HTML5
 * nativo, com linha indicando onde o cartão vai cair) ou use o botão "Mover" de
 * cada cartão, que funciona com teclado e toque e avisa leitores de tela.
 *
 * O quadro não muda nada sozinho: chama `aoMover` e espera as colunas novas
 * (use `moverCartao` para aplicar o movimento). Ocupa a altura do contêiner.
 */
export function QuadroKanban<C extends CartaoDoQuadro = CartaoDoQuadro>({
  colunas,
  aoMover,
  aoAbrirCartao,
  renderizarCartao,
  larguraDaColuna = "w-72",
  rotulo = "Quadro",
  textos: textosParciais,
}: {
  colunas: ColunaDoQuadro<C>[];
  aoMover: (movimento: MovimentoDeCartao) => void;
  /** Clique no cartão (ou no título, pelo teclado). */
  aoAbrirCartao?: (cartao: C, coluna: ColunaDoQuadro<C>) => void;
  /** Conteúdo próprio do cartão. A moldura, o arrastar e o botão de mover continuam por conta do quadro. */
  renderizarCartao?: (cartao: C, coluna: ColunaDoQuadro<C>) => ReactNode;
  /** Classe de largura de cada coluna. */
  larguraDaColuna?: string;
  /** Nome do quadro para leitores de tela. */
  rotulo?: string;
  textos?: Partial<TextosDoQuadro>;
}) {
  const textos = { ...TEXTOS_PADRAO, ...textosParciais };
  const idBase = useId();
  const raiz = useRef<HTMLDivElement>(null);
  const painelDoMenu = useRef<HTMLDivElement>(null);
  const botaoDoMenu = useRef<HTMLButtonElement | null>(null);
  const arrasto = useRef<{ cartaoId: string; deColuna: string } | null>(null);
  const focoPendente = useRef<string | null>(null);
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [alvo, setAlvo] = useState<Alvo | null>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [anuncio, setAnuncio] = useState("");

  // Depois de mover pelo menu, o cartão renasce em outra coluna: o foco volta ao botão "Mover" dele.
  useEffect(() => {
    const id = focoPendente.current;
    if (!id) return;
    focoPendente.current = null;
    raiz.current?.querySelector<HTMLElement>(`[data-cartao-id="${CSS.escape(id)}"] [data-mover]`)?.focus();
  });

  // Menu aberto: foca o primeiro item; fecha com clique fora, rolagem ou mudança de tamanho.
  useEffect(() => {
    if (!menu) return;
    painelDoMenu.current?.querySelector<HTMLElement>('[role="menuitem"]:not(:disabled)')?.focus();
    const fechar = () => setMenu(null);
    const fora = (e: PointerEvent) => {
      if (!painelDoMenu.current?.contains(e.target as Node) && !botaoDoMenu.current?.contains(e.target as Node)) fechar();
    };
    document.addEventListener("pointerdown", fora);
    window.addEventListener("scroll", fechar, true);
    window.addEventListener("resize", fechar);
    return () => {
      document.removeEventListener("pointerdown", fora);
      window.removeEventListener("scroll", fechar, true);
      window.removeEventListener("resize", fechar);
    };
  }, [menu]);

  function mover(m: MovimentoDeCartao) {
    const origem = colunas.find((c) => c.id === m.deColuna);
    const destino = colunas.find((c) => c.id === m.paraColuna);
    const cartao = origem?.cartoes.find((k) => k.id === m.cartaoId);
    if (!origem || !destino || !cartao) return;
    if (m.deColuna === m.paraColuna && origem.cartoes.indexOf(cartao) === m.indice) return;
    aoMover(m);
    const total = destino.cartoes.length + (m.deColuna === m.paraColuna ? 0 : 1);
    setAnuncio(textos.anuncio(cartao.titulo, destino.titulo, m.indice + 1, total));
  }

  // ── Arrastar e soltar ──
  function aoIniciarArrasto(e: DragEvent, cartaoId: string, deColuna: string) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", cartaoId);
    arrasto.current = { cartaoId, deColuna };
    setMenu(null);
    // Num quadro depois: mudar o estilo já no dragstart sairia na "foto" que o navegador arrasta.
    requestAnimationFrame(() => {
      if (arrasto.current?.cartaoId === cartaoId) setArrastando(cartaoId);
    });
  }

  function aoTerminarArrasto() {
    arrasto.current = null;
    setArrastando(null);
    setAlvo(null);
  }

  function aoPassarSobre(e: DragEvent<HTMLElement>, colunaId: string) {
    const a = arrasto.current;
    if (!a) return; // arrasto de fora do quadro (arquivo, texto): não aceita
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const indice = indiceNaPosicao(e.currentTarget, e.clientY, a.cartaoId);
    if (alvo?.coluna !== colunaId || alvo.indice !== indice) setAlvo({ coluna: colunaId, indice, cartaoId: a.cartaoId });
  }

  function aoSoltar(e: DragEvent<HTMLElement>, colunaId: string) {
    const a = arrasto.current;
    if (!a) return;
    e.preventDefault();
    mover({ ...a, paraColuna: colunaId, indice: indiceNaPosicao(e.currentTarget, e.clientY, a.cartaoId) });
    aoTerminarArrasto();
  }

  // ── Menu "Mover" ──
  function abrirMenu(botao: HTMLButtonElement, cartaoId: string, colunaId: string) {
    if (menu?.cartaoId === cartaoId) {
      setMenu(null);
      return;
    }
    const r = botao.getBoundingClientRect();
    const left = Math.max(8, Math.min(r.right - LARGURA_DO_MENU, window.innerWidth - LARGURA_DO_MENU - 8));
    const cabeEmbaixo = window.innerHeight - r.bottom > 280;
    botaoDoMenu.current = botao;
    setMenu({
      cartaoId,
      colunaId,
      estilo: cabeEmbaixo ? { left, top: r.bottom + 4, width: LARGURA_DO_MENU } : { left, bottom: window.innerHeight - r.top + 4, width: LARGURA_DO_MENU },
    });
  }

  function fecharMenu(devolverFoco: boolean) {
    setMenu(null);
    if (devolverFoco) botaoDoMenu.current?.focus();
  }

  function escolher(m: MovimentoDeCartao) {
    setMenu(null);
    focoPendente.current = m.cartaoId;
    mover(m);
  }

  function aoTeclarNoMenu(e: KeyboardEvent<HTMLDivElement>) {
    const itens = [...e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)')];
    const atual = itens.indexOf(document.activeElement as HTMLElement);
    let proximo: number | null = null;
    if (e.key === "ArrowDown") proximo = (atual + 1) % itens.length;
    else if (e.key === "ArrowUp") proximo = (atual - 1 + itens.length) % itens.length;
    else if (e.key === "Home") proximo = 0;
    else if (e.key === "End") proximo = itens.length - 1;
    else if (e.key === "Escape") {
      e.preventDefault();
      fecharMenu(true);
      return;
    } else if (e.key === "Tab") {
      fecharMenu(false);
      return;
    }
    if (proximo !== null) {
      e.preventDefault();
      itens[proximo]?.focus();
    }
  }

  const colunaDoMenu = menu ? colunas.find((c) => c.id === menu.colunaId) : undefined;
  const indiceNoMenu = menu && colunaDoMenu ? colunaDoMenu.cartoes.findIndex((k) => k.id === menu.cartaoId) : -1;
  const ITEM_DO_MENU =
    "flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-[max(var(--radius-sm),calc(var(--radius-xl)_-_var(--spacing)*1.5))] px-3 text-left text-sm text-ink outline-none hover:bg-surface focus-visible:bg-surface disabled:cursor-not-allowed disabled:text-muted disabled:hover:bg-transparent";

  return (
    <div ref={raiz} role="region" aria-label={rotulo} className="flex h-full min-h-0 gap-4 overflow-x-auto pb-2">
      {colunas.map((coluna, indiceDaColuna) => {
        // Pelo índice, não pelo id: o id de quem usa pode ter espaços, que quebram o aria-labelledby.
        const idTitulo = `${idBase}-coluna-${indiceDaColuna}`;
        const sobre = alvo?.coluna === coluna.id;
        const naoArrastados = coluna.cartoes.filter((k) => k.id !== alvo?.cartaoId);
        return (
          <section
            key={coluna.id}
            aria-labelledby={idTitulo}
            onDragOver={(e) => aoPassarSobre(e, coluna.id)}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setAlvo((a) => (a?.coluna === coluna.id ? null : a));
            }}
            onDrop={(e) => aoSoltar(e, coluna.id)}
            className={`flex max-h-full shrink-0 flex-col rounded-xl border border-rule bg-surface p-3 ${larguraDaColuna}`}
          >
            <header className="mb-3 flex items-center justify-between gap-2 px-1">
              <div className="flex min-w-0 items-center gap-2">
                <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ background: coluna.cor ?? "var(--muted)" }} />
                <h3 id={idTitulo} className="truncate text-sm font-semibold text-ink">
                  {coluna.titulo}
                </h3>
              </div>
              <span className="shrink-0 rounded-full bg-page px-2 py-0.5 text-xs text-ink-2 tabular-nums">
                <span aria-hidden="true">{coluna.cartoes.length}</span>
                <span className="sr-only">{textos.contagem(coluna.cartoes.length)}</span>
              </span>
            </header>

            <ol
              className={`flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto rounded-[max(var(--radius-sm),calc(var(--radius-xl)_-_var(--spacing)*3))] border border-dashed p-1.5 ${
                sobre ? "border-accent bg-accent/5" : coluna.cartoes.length === 0 ? "border-rule" : "border-transparent"
              }`}
            >
              {coluna.cartoes.map((cartao) => {
                const posicao = naoArrastados.indexOf(cartao);
                const linhaAntes = sobre && posicao !== -1 && posicao === alvo.indice;
                const linhaDepois = sobre && posicao !== -1 && posicao === naoArrastados.length - 1 && alvo.indice === naoArrastados.length;
                const menuAberto = menu?.cartaoId === cartao.id;
                const abrir = aoAbrirCartao ? () => aoAbrirCartao(cartao, coluna) : undefined;
                return (
                  <li
                    key={cartao.id}
                    data-cartao-id={cartao.id}
                    draggable
                    onDragStart={(e) => aoIniciarArrasto(e, cartao.id, coluna.id)}
                    onDragEnd={aoTerminarArrasto}
                    className="relative shrink-0"
                  >
                    {linhaAntes && <span aria-hidden="true" className="pointer-events-none absolute inset-x-1 top-[-5px] h-0.5 rounded-full bg-accent" />}
                    <article
                      onClick={abrir}
                      className={`group relative cursor-grab overflow-hidden rounded-[max(var(--radius-sm),calc(var(--radius-xl)_-_var(--spacing)*4.5))] border border-rule bg-page p-3 pt-3.5 transition-colors active:cursor-grabbing ${
                        abrir ? "hover:border-accent" : ""
                      } ${arrastando === cartao.id ? "opacity-40" : ""}`}
                    >
                      {cartao.cor && <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{ background: cartao.cor }} />}
                      {renderizarCartao ? renderizarCartao(cartao, coluna) : <CartaoPadrao cartao={cartao} textos={textos} aoAbrir={abrir} />}
                      <button
                        type="button"
                        data-mover
                        aria-haspopup="menu"
                        aria-expanded={menuAberto}
                        aria-controls={menuAberto ? `${idBase}-menu` : undefined}
                        aria-label={`${textos.mover}: ${cartao.titulo}`}
                        title={textos.mover}
                        onClick={(e) => {
                          e.stopPropagation();
                          abrirMenu(e.currentTarget, cartao.id, coluna.id);
                        }}
                        className={`absolute top-2 right-2 flex size-7 cursor-pointer items-center justify-center rounded-[max(var(--radius-sm),calc(var(--radius-xl)_-_var(--spacing)*6.5))] outline-accent hover:bg-surface hover:text-ink focus-visible:outline-2 ${
                          // Com mouse, aparece no hover ou com foco dentro do cartão; no toque fica sempre visível.
                          menuAberto
                            ? "bg-surface text-ink"
                            : "text-muted pointer-fine:opacity-0 pointer-fine:group-focus-within:opacity-100 pointer-fine:group-hover:opacity-100"
                        }`}
                      >
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 3v18M3 12h18M12 3l-3 3m3-3 3 3M12 21l-3-3m3 3 3-3M3 12l3-3m-3 3 3 3M21 12l-3-3m3 3-3 3" />
                        </svg>
                      </button>
                    </article>
                    {linhaDepois && <span aria-hidden="true" className="pointer-events-none absolute inset-x-1 bottom-[-5px] h-0.5 rounded-full bg-accent" />}
                  </li>
                );
              })}
              {coluna.cartoes.length === 0 && <li className="flex flex-1 items-center justify-center py-6 text-center text-xs text-muted">{textos.vazio}</li>}
            </ol>
          </section>
        );
      })}

      {menu && colunaDoMenu && indiceNoMenu !== -1 && (
        <div
          ref={painelDoMenu}
          id={`${idBase}-menu`}
          role="menu"
          aria-label={textos.mover}
          onKeyDown={aoTeclarNoMenu}
          style={menu.estilo}
          className="fixed z-50 flex flex-col gap-0.5 rounded-xl border border-rule bg-page p-1.5 shadow-flutuante"
        >
          <button
            type="button"
            role="menuitem"
            disabled={indiceNoMenu === 0}
            onClick={() => escolher({ cartaoId: menu.cartaoId, deColuna: menu.colunaId, paraColuna: menu.colunaId, indice: indiceNoMenu - 1 })}
            className={ITEM_DO_MENU}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5m-6 6 6-6 6 6" />
            </svg>
            {textos.paraCima}
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={indiceNoMenu === colunaDoMenu.cartoes.length - 1}
            onClick={() => escolher({ cartaoId: menu.cartaoId, deColuna: menu.colunaId, paraColuna: menu.colunaId, indice: indiceNoMenu + 1 })}
            className={ITEM_DO_MENU}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14m-6-6 6 6 6-6" />
            </svg>
            {textos.paraBaixo}
          </button>
          {colunas.length > 1 && <div role="separator" className="mx-2 my-1 h-px bg-rule" />}
          {colunas
            .filter((c) => c.id !== menu.colunaId)
            .map((c) => (
              <button
                key={c.id}
                type="button"
                role="menuitem"
                onClick={() =>
                  escolher({ cartaoId: menu.cartaoId, deColuna: menu.colunaId, paraColuna: c.id, indice: c.cartoes.length })
                }
                className={ITEM_DO_MENU}
              >
                <span aria-hidden="true" className="ml-1 size-2 shrink-0 rounded-full" style={{ background: c.cor ?? "var(--muted)" }} />
                <span className="min-w-0 truncate">{textos.paraColuna(c.titulo)}</span>
              </button>
            ))}
        </div>
      )}

      <p aria-live="polite" className="sr-only">
        {anuncio}
      </p>
    </div>
  );
}
