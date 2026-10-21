"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

/** Uma ação do menu. */
export type AcaoDoMenu = {
  tipo?: "item";
  rotulo: string;
  aoEscolher: () => void;
  /** Ícone à esquerda (SVG de 16 px, por exemplo). */
  icone?: ReactNode;
  /** Ação destrutiva (excluir, sair): texto na cor de erro. */
  perigo?: boolean;
  desativado?: boolean;
  /** Atalho de teclado mostrado à direita, só como lembrete ("Ctrl+D"). */
  atalho?: string;
  /** Mostra ✓. No modo "acoes", vira caixa de marcar (menuitemcheckbox); no modo "escolha", a opção escolhida. */
  marcado?: boolean;
};

/** Item do menu: uma ação, uma linha separadora ou o título de um grupo (vale até o próximo separador ou grupo). */
export type ItemDoMenu = AcaoDoMenu | { tipo: "separador" } | { tipo: "grupo"; titulo: string };

/** Props para espalhar no gatilho próprio (um `<button>`), incluindo a ref. */
export type PropsDoGatilho = {
  ref: (elemento: HTMLElement | null) => void;
  id: string;
  type: "button";
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  "aria-controls": string | undefined;
  onClick: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
};

type Foco = "primeiro" | "ultimo" | "marcado";
type Secao = { titulo?: string; separada: boolean; acoes: AcaoDoMenu[] };

/** Junta os itens em seções: um separador ou um título de grupo começa uma nova. */
function emSecoes(itens: ItemDoMenu[]): Secao[] {
  const secoes: Secao[] = [];
  for (const item of itens) {
    if (item.tipo === "separador") {
      // A linha só aparece entre seções, nunca no topo
      secoes.push({ separada: secoes.length > 0, acoes: [] });
    } else if (item.tipo === "grupo") {
      const atual = secoes[secoes.length - 1];
      // Grupo logo depois de um separador aproveita a seção vazia que ele abriu
      if (atual && atual.acoes.length === 0 && !atual.titulo) atual.titulo = item.titulo;
      else secoes.push({ titulo: item.titulo, separada: false, acoes: [] });
    } else {
      if (secoes.length === 0) secoes.push({ separada: false, acoes: [] });
      secoes[secoes.length - 1].acoes.push(item);
    }
  }
  return secoes.filter((s) => s.acoes.length > 0 || s.titulo);
}

const semAcentos = (texto: string) =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");

/** Itens que recebem foco pelo teclado (os desativados ficam de fora). */
const itensFocaveis = (menu: HTMLElement | null) =>
  Array.from(menu?.querySelectorAll<HTMLElement>("[data-item-do-menu]:not([aria-disabled='true'])") ?? []);

/** Distância (px) entre o gatilho e o painel, e margem mínima até a borda da janela. */
const DISTANCIA = 6;
const MARGEM = 8;

/** Desenha o gatilho de quem usa o menu, com as props de acessibilidade, a ref e os eventos. */
function GatilhoProprio({
  desenhar,
  props,
  aberto,
}: {
  desenhar: (props: PropsDoGatilho, aberto: boolean) => ReactNode;
  props: PropsDoGatilho;
  aberto: boolean;
}) {
  return desenhar(props, aberto);
}

function Visto({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`size-4 shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

/**
 * Menu suspenso de ações (ou de escolha única, com ✓) preso a qualquer gatilho.
 * Abre num portal logo abaixo do gatilho, sobe quando falta espaço e não passa da
 * borda da janela. Fecha ao escolher, ao clicar fora, ao rolar a página e com Esc
 * (que não chega a um modal por trás). Teclado: setas, Home/End, Enter/Espaço e
 * busca pela primeira letra.
 */
export function MenuDeAcoes({
  itens,
  gatilho,
  modo = "acoes",
  alinhamento = "inicio",
  larguraDoPainel = "w-60",
  cabecalho,
  desativado = false,
}: {
  itens: ItemDoMenu[];
  /**
   * Texto/conteúdo do botão padrão, ou uma função que desenha o gatilho próprio
   * espalhando as props recebidas num `<button>`: `(props, aberto) => <button {...props}>…</button>`.
   */
  gatilho: ReactNode | ((props: PropsDoGatilho, aberto: boolean) => ReactNode);
  /** "escolha": as ações viram opções de escolha única (menuitemradio) e o foco abre na marcada. */
  modo?: "acoes" | "escolha";
  /** Alinha o painel pela borda esquerda ("inicio") ou direita ("fim") do gatilho. */
  alinhamento?: "inicio" | "fim";
  /** Classe de largura do painel (nunca fica mais estreito que o gatilho). */
  larguraDoPainel?: string;
  /** Bloco fixo no topo do painel, fora da lista (ex.: nome e e-mail da conta). */
  cabecalho?: ReactNode;
  /** Desativa o botão padrão. */
  desativado?: boolean;
}) {
  const id = useId();
  const idGatilho = `${id}-gatilho`;
  const idMenu = `${id}-menu`;
  // null = fechado; aberto guarda onde montar o portal e que item focar
  const [aberto, setAberto] = useState<{ alvo: HTMLElement; foco: Foco } | null>(null);
  const gatilhoEl = useRef<HTMLElement | null>(null);
  const painel = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const busca = useRef({ texto: "", quando: 0 });

  const refDoGatilho = useCallback((elemento: HTMLElement | null) => {
    gatilhoEl.current = elemento;
  }, []);

  function abrir(foco: Foco) {
    const elemento = gatilhoEl.current;
    if (!elemento) return;
    // O portal vai para o ancestral com data-theme (onde moram as variáveis do tema) ou para o <body>
    const tema = elemento.closest<HTMLElement>("[data-theme]");
    setAberto({ alvo: tema && tema !== document.documentElement ? tema : document.body, foco });
  }

  function fecharEVoltar() {
    setAberto(null);
    gatilhoEl.current?.focus();
  }

  const posicionar = useCallback(() => {
    const g = gatilhoEl.current;
    const p = painel.current;
    if (!g || !p) return;
    const caixa = g.getBoundingClientRect();
    p.style.maxHeight = "";
    p.style.minWidth = `${Math.min(caixa.width, window.innerWidth - 2 * MARGEM)}px`;
    const largura = p.offsetWidth;
    const altura = p.offsetHeight;
    const desejado = alinhamento === "fim" ? caixa.right - largura : caixa.left;
    const left = Math.min(Math.max(desejado, MARGEM), window.innerWidth - largura - MARGEM);
    const abaixo = window.innerHeight - caixa.bottom - DISTANCIA - MARGEM;
    const acima = caixa.top - DISTANCIA - MARGEM;
    // Sobe só quando não cabe embaixo e em cima há mais espaço
    const sobe = altura > abaixo && acima > abaixo;
    p.style.left = `${Math.max(left, MARGEM)}px`;
    p.style.top = `${sobe ? Math.max(MARGEM, caixa.top - DISTANCIA - altura) : caixa.bottom + DISTANCIA}px`;
    p.style.maxHeight = `${Math.max(sobe ? acima : abaixo, 120)}px`;
  }, [alinhamento]);

  // Antes de pintar: posiciona e leva o foco ao item certo
  useLayoutEffect(() => {
    if (!aberto) return;
    posicionar();
    const lista = itensFocaveis(menu.current);
    const alvo =
      aberto.foco === "ultimo"
        ? lista[lista.length - 1]
        : aberto.foco === "marcado"
          ? (lista.find((el) => el.getAttribute("aria-checked") === "true") ?? lista[0])
          : lista[0];
    (alvo ?? menu.current)?.focus({ preventScroll: true });
  }, [aberto, posicionar]);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      const t = e.target as Node;
      if (painel.current?.contains(t) || gatilhoEl.current?.contains(t)) return;
      setAberto(null);
    };
    // Na captura da janela: o Esc fecha só o menu e não chega a um modal aberto por trás
    const esc = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      setAberto(null);
      gatilhoEl.current?.focus();
    };
    const rolagem = (e: Event) => {
      if (e.target instanceof Node && painel.current?.contains(e.target)) return;
      setAberto(null);
    };
    document.addEventListener("pointerdown", fora);
    window.addEventListener("keydown", esc, true);
    window.addEventListener("scroll", rolagem, true);
    window.addEventListener("resize", posicionar);
    return () => {
      document.removeEventListener("pointerdown", fora);
      window.removeEventListener("keydown", esc, true);
      window.removeEventListener("scroll", rolagem, true);
      window.removeEventListener("resize", posicionar);
    };
  }, [aberto, posicionar]);

  function escolher(acao: AcaoDoMenu) {
    if (acao.desativado) return;
    // Foco de volta ao gatilho antes da ação: se ela abrir um modal, o modal fica com o foco
    fecharEVoltar();
    acao.aoEscolher();
  }

  function focar(elemento: HTMLElement | undefined) {
    elemento?.focus({ preventScroll: true });
  }

  function aoTeclarNoMenu(e: KeyboardEvent<HTMLDivElement>) {
    const lista = itensFocaveis(menu.current);
    if (lista.length === 0) return;
    const atual = lista.indexOf(document.activeElement as HTMLElement);
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focar(lista[atual < 0 ? 0 : (atual + 1) % lista.length]);
        return;
      case "ArrowUp":
        e.preventDefault();
        focar(lista[atual <= 0 ? lista.length - 1 : atual - 1]);
        return;
      case "Home":
      case "PageUp":
        e.preventDefault();
        focar(lista[0]);
        return;
      case "End":
      case "PageDown":
        e.preventDefault();
        focar(lista[lista.length - 1]);
        return;
      case "Tab":
        // Fecha e devolve o foco ao gatilho; o Tab segue dali para o próximo elemento da página
        setAberto(null);
        gatilhoEl.current?.focus();
        return;
    }
    // Busca pela primeira letra (ou pelo começo do rótulo, digitando rápido)
    if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    const memoria = busca.current;
    if (e.key === " " && e.timeStamp - memoria.quando > 500) return; // Espaço sozinho ativa o item
    memoria.texto = e.timeStamp - memoria.quando < 500 ? memoria.texto + e.key : e.key;
    memoria.quando = e.timeStamp;
    const repetida = [...memoria.texto].every((c) => c === memoria.texto[0]);
    const termo = semAcentos(repetida ? memoria.texto[0] : memoria.texto);
    const inicio = repetida ? atual + 1 : Math.max(atual, 0);
    for (let k = 0; k < lista.length; k++) {
      const el = lista[(inicio + k) % lista.length];
      if (semAcentos(el.dataset.rotulo ?? "").startsWith(termo)) {
        e.preventDefault();
        focar(el);
        return;
      }
    }
  }

  const propsDoGatilho: PropsDoGatilho = {
    ref: refDoGatilho,
    id: idGatilho,
    type: "button",
    "aria-haspopup": "menu",
    "aria-expanded": aberto !== null,
    "aria-controls": aberto ? idMenu : undefined,
    onClick: () => (aberto ? setAberto(null) : abrir(modo === "escolha" ? "marcado" : "primeiro")),
    onKeyDown: (e) => {
      if (aberto) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        abrir(modo === "escolha" ? "marcado" : "primeiro");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        abrir("ultimo");
      }
    },
  };

  const secoes = emSecoes(itens);

  const desenharAcao = (acao: AcaoDoMenu, chave: string) => {
    const papel = modo === "escolha" ? "menuitemradio" : acao.marcado !== undefined ? "menuitemcheckbox" : "menuitem";
    const escolhida = modo === "escolha" && acao.marcado;
    return (
      <button
        key={chave}
        type="button"
        role={papel}
        aria-checked={papel === "menuitem" ? undefined : !!acao.marcado}
        aria-disabled={acao.desativado || undefined}
        tabIndex={-1}
        data-item-do-menu=""
        data-rotulo={acao.rotulo}
        onClick={() => escolher(acao)}
        onPointerMove={(e) => {
          if (!acao.desativado && document.activeElement !== e.currentTarget) e.currentTarget.focus({ preventScroll: true });
        }}
        className={`flex min-h-10 w-full cursor-pointer items-center gap-3 px-3 py-2 text-left text-sm outline-accent focus:outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 ${
          acao.perigo ? "text-critical focus:bg-critical/10" : `${escolhida ? "font-medium text-accent" : "text-ink"} focus:bg-surface`
        }`}
      >
        {acao.icone && (
          <span aria-hidden="true" className={`flex size-4 shrink-0 items-center justify-center ${acao.perigo ? "" : "text-muted"}`}>
            {acao.icone}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate">{acao.rotulo}</span>
        {acao.atalho && <kbd className="shrink-0 font-sans text-xs text-muted">{acao.atalho}</kbd>}
        {acao.marcado && <Visto />}
      </button>
    );
  };

  return (
    <>
      {typeof gatilho === "function" ? (
        <GatilhoProprio desenhar={gatilho} props={propsDoGatilho} aberto={aberto !== null} />
      ) : (
        <button
          {...propsDoGatilho}
          disabled={desativado}
          className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-rule bg-page px-3 text-sm font-medium text-ink outline-accent hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-expanded:bg-surface"
        >
          {gatilho}
          <svg
            aria-hidden="true"
            viewBox="0 0 12 12"
            className={`size-3 shrink-0 text-muted transition-transform ${aberto ? "rotate-180" : ""}`}
          >
            <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {aberto &&
        createPortal(
          <div
            ref={painel}
            className={`fixed z-50 flex max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-xl border border-rule bg-page text-ink shadow-flutuante ${larguraDoPainel}`}
          >
            {cabecalho && <div className="shrink-0 border-b border-rule px-4 py-3 text-sm">{cabecalho}</div>}
            <div
              ref={menu}
              id={idMenu}
              role="menu"
              aria-labelledby={idGatilho}
              tabIndex={-1}
              onKeyDown={aoTeclarNoMenu}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1 outline-none"
            >
              {secoes.map((secao, i) => (
                <Fragment key={i}>
                  {secao.separada && <div role="separator" className="my-1 h-px bg-rule" />}
                  {secao.titulo ? (
                    <div role="group" aria-labelledby={`${id}-grupo-${i}`}>
                      <div id={`${id}-grupo-${i}`} className="px-3 pt-2 pb-1 text-xs font-semibold text-muted">
                        {secao.titulo}
                      </div>
                      {secao.acoes.map((acao, j) => desenharAcao(acao, `${i}-${j}`))}
                    </div>
                  ) : (
                    secao.acoes.map((acao, j) => desenharAcao(acao, `${i}-${j}`))
                  )}
                </Fragment>
              ))}
            </div>
          </div>,
          aberto.alvo,
        )}
    </>
  );
}
