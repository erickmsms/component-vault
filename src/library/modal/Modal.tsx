"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { CURVA_SUAVE, useSemMovimento } from "@/library/revelar/Movimento";

const DURACAO_SAIDA = 220;

const FOCAVEIS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Largura máxima de cada tamanho. Mapa de classes inteiras de propósito: o
 * Tailwind só gera as classes que aparecem escritas no código, então
 * `max-w-${tamanho}` montado na hora não existiria.
 */
const LARGURAS = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-xl",
  xl: "max-w-3xl",
} as const;

export type TamanhoDoModal = keyof typeof LARGURAS;

const semAssinatura = () => () => {};

/** Focáveis visíveis do painel: o que está escondido fica fora do ciclo do Tab. */
function focaveis(painel: HTMLElement) {
  return [...painel.querySelectorAll<HTMLElement>(FOCAVEIS)].filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  );
}

/**
 * Janela modal acessível, num portal no <body>: prende o foco dentro dela (Tab
 * circula), fecha com Esc, com clique fora e com o ×, trava a rolagem da página
 * e devolve o foco a quem abriu. Cabeçalho e rodapé ficam fixos e só o corpo
 * rola quando o conteúdo é mais alto que a tela. A saída é animada antes de
 * desmontar. Com `estatico`, mostra só o painel no lugar (para documentação).
 */
export function Modal({
  aberto,
  aoFechar,
  titulo,
  chapeu,
  descricao,
  icone,
  children,
  rodape,
  tamanho = "md",
  largura,
  fecharAoClicarFora = true,
  fecharDesativado = false,
  mostrarFechar = true,
  focoInicial,
  alerta = false,
  estatico = false,
  rotuloFechar = "Fechar",
}: {
  aberto: boolean;
  /** Chamado pelo Esc, pelo clique fora e pelo ×. */
  aoFechar: () => void;
  /** Título visível; também dá nome ao diálogo para leitores de tela. */
  titulo: ReactNode;
  /** Linha curta acima do título, com um ponto na cor de destaque: contexto, etapa, categoria. */
  chapeu?: ReactNode;
  /** Texto de apoio abaixo do título; é lido junto com o título ao abrir. */
  descricao?: ReactNode;
  /** Elemento à esquerda do título (um ícone de alerta numa confirmação, por exemplo). */
  icone?: ReactNode;
  /** Corpo do modal: a única parte que rola quando falta altura. */
  children?: ReactNode;
  /** Ações no fim da janela (botões de cancelar e confirmar, por exemplo). Sempre visíveis. */
  rodape?: ReactNode;
  /** Largura máxima do painel. */
  tamanho?: TamanhoDoModal;
  /** Classe de largura máxima no lugar de `tamanho` (ex.: "max-w-5xl"). */
  largura?: string;
  fecharAoClicarFora?: boolean;
  /**
   * Bloqueia todas as saídas de uma vez (Esc, clique fora e ×) enquanto algo
   * está em andamento, como salvar. Um prop só, para nenhuma saída ser esquecida.
   */
  fecharDesativado?: boolean;
  /** Mostra o × no canto. Desligue quando fechar exige uma decisão (uma confirmação). */
  mostrarFechar?: boolean;
  /** Elemento que recebe o foco ao abrir. Padrão: o primeiro campo do corpo ou, sem campos, o painel. */
  focoInicial?: RefObject<HTMLElement | null>;
  /** Anuncia como `alertdialog`: para confirmações que interrompem e pedem uma decisão. */
  alerta?: boolean;
  /**
   * Mostra só o painel, parado no lugar e sempre visível: sem portal, fundo
   * escurecido, trava de rolagem nem captura do foco. Para documentação e miniaturas.
   */
  estatico?: boolean;
  /** Texto do botão × para leitores de tela. */
  rotuloFechar?: string;
}) {
  const semMovimento = useSemMovimento();
  // createPortal precisa do document: só depois da hidratação
  const noCliente = useSyncExternalStore(semAssinatura, () => true, () => false);
  const idTitulo = useId();
  const idDescricao = useId();
  const painel = useRef<HTMLDivElement>(null);
  // Montado enquanto aberto ou saindo; `mostrar` controla a transição
  const [montado, setMontado] = useState(aberto);
  const [mostrar, setMostrar] = useState(false);
  const [tema, setTema] = useState<string>();

  if (aberto && !montado) setMontado(true);

  // O tema pode estar num contêiner com data-theme (e não no :root): o portal,
  // que sai desse contêiner, leva o mesmo atributo para herdar as variáveis
  const marcador = useCallback((el: HTMLSpanElement | null) => {
    if (el) setTema(el.closest("[data-theme]")?.getAttribute("data-theme") ?? undefined);
  }, []);

  useEffect(() => {
    if (estatico) return;
    if (aberto) {
      // Um quadro no estado inicial antes de animar para o final
      const t = window.setTimeout(() => setMostrar(true), 10);
      return () => window.clearTimeout(t);
    }
    // Desmonte cronometrado: em aba oculta o transitionend pode não chegar
    const t = window.setTimeout(
      () => {
        setMontado(false);
        setMostrar(false);
      },
      semMovimento ? 0 : DURACAO_SAIDA,
    );
    return () => window.clearTimeout(t);
  }, [aberto, semMovimento, estatico]);

  // Trava a rolagem do fundo, compensando a largura da barra de rolagem para
  // a página não pular para o lado (no Windows a barra ocupa espaço)
  useEffect(() => {
    if (!montado || estatico) return;
    const { body, documentElement } = document;
    const barra = window.innerWidth - documentElement.clientWidth;
    const anterior = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    body.style.overflow = "hidden";
    if (barra > 0) body.style.paddingRight = `calc(${getComputedStyle(body).paddingRight} + ${barra}px)`;
    return () => {
      body.style.overflow = anterior.overflow;
      body.style.paddingRight = anterior.paddingRight;
    };
  }, [montado, estatico]);

  // Foco inicial ao abrir e devolução a quem abriu ao fechar
  useEffect(() => {
    if (!aberto || estatico || !noCliente) return;
    const anterior = document.activeElement as HTMLElement | null;
    // O painel continua montado durante a saída animada: é o mesmo nó na limpeza
    const el = painel.current;
    const quadro = requestAnimationFrame(() => {
      if (!el) return;
      if (focoInicial?.current) {
        focoInicial.current.focus();
        return;
      }
      // Respeita um autoFocus que o próprio conteúdo já tenha usado
      if (el.contains(document.activeElement)) return;
      const campo = el.querySelector<HTMLElement>(
        "input:not([disabled]), select:not([disabled]), textarea:not([disabled])",
      );
      (campo ?? el).focus();
    });
    return () => {
      cancelAnimationFrame(quadro);
      // Só devolve o foco se ele ficou no modal ou sem lugar: não rouba de quem já o moveu
      const foco = document.activeElement;
      if (!foco || foco === document.body || el?.contains(foco)) anterior?.focus?.();
    };
  }, [aberto, estatico, focoInicial, noCliente]);

  // Esc fecha; Tab circula dentro do painel
  useEffect(() => {
    if (!aberto || estatico) return;
    const aoTeclar = (e: KeyboardEvent) => {
      const el = painel.current;
      if (!el) return;
      // Com outro modal aberto por cima (uma confirmação, por exemplo), o teclado é dele
      const modais = document.querySelectorAll('[aria-modal="true"]');
      if (modais[modais.length - 1] !== el) return;

      if (e.key === "Escape") {
        // Um controle interno já usou o Esc (limpar uma busca, fechar um menu)
        if (e.defaultPrevented) return;
        e.preventDefault();
        if (!fecharDesativado) aoFechar();
        return;
      }
      if (e.key !== "Tab") return;
      const lista = focaveis(el);
      if (lista.length === 0) {
        e.preventDefault();
        el.focus();
        return;
      }
      const primeiro = lista[0];
      const ultimo = lista[lista.length - 1];
      const foco = document.activeElement;
      if (!el.contains(foco)) {
        e.preventDefault();
        primeiro.focus();
      } else if (e.shiftKey && (foco === primeiro || foco === el)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && foco === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aberto, estatico, fecharDesativado, aoFechar]);

  const visivel = estatico || (aberto && mostrar);
  const transicao =
    semMovimento || estatico ? undefined : `opacity 300ms ${CURVA_SUAVE}, transform 400ms ${CURVA_SUAVE}`;
  const temCorpo = children !== undefined && children !== null && children !== false;
  const lateral = "pl-7 sm:pl-8";
  const direita = "pr-7 sm:pr-8";

  const conteudo = (
    <div
      ref={painel}
      role={alerta ? "alertdialog" : "dialog"}
      aria-modal={!estatico && aberto ? true : undefined}
      aria-labelledby={idTitulo}
      aria-describedby={descricao ? idDescricao : undefined}
      tabIndex={-1}
      className={`relative flex w-full flex-col overflow-hidden rounded-3xl border border-rule bg-page text-ink shadow-flutuante outline-none ${
        estatico ? "" : "my-auto max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)]"
      } ${largura ?? LARGURAS[tamanho]}`}
      style={{
        opacity: visivel ? 1 : 0,
        transform: visivel ? "none" : "translateY(16px) scale(0.97)",
        transition: transicao,
      }}
    >
      {mostrarFechar && (
        <button
          type="button"
          onClick={aoFechar}
          disabled={fecharDesativado}
          aria-label={rotuloFechar}
          title={rotuloFechar}
          className="absolute top-5 right-5 z-10 grid size-9 cursor-pointer place-items-center rounded-full text-muted outline-accent transition-colors hover:bg-surface hover:text-ink focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Cabeçalho fixo */}
      <div
        className={`flex shrink-0 gap-4 pt-7 sm:pt-8 ${lateral} ${mostrarFechar ? "pr-16" : direita} ${
          temCorpo || rodape ? "" : "pb-7 sm:pb-8"
        }`}
      >
        {icone && <div className="shrink-0">{icone}</div>}
        <div className="min-w-0 flex-1">
          {chapeu && (
            <p className="mb-3 flex items-center gap-2 text-xs font-medium tracking-[0.12em] text-muted uppercase">
              <span aria-hidden className="size-2 shrink-0 rounded-full bg-accent" />
              {chapeu}
            </p>
          )}
          <h2 id={idTitulo} className="font-display text-2xl leading-tight font-bold sm:text-3xl">
            {titulo}
          </h2>
          {descricao && (
            <p id={idDescricao} className="mt-2 text-sm leading-relaxed text-ink-2">
              {descricao}
            </p>
          )}
        </div>
      </div>

      {/* Corpo: o único lugar que rola. min-h-0 deixa o filho do flex encolher abaixo do conteúdo */}
      {temCorpo && (
        <div className={`min-h-0 flex-1 overflow-y-auto pt-6 ${lateral} ${direita} ${rodape ? "pb-6" : "pb-7 sm:pb-8"}`}>
          {children}
        </div>
      )}

      {/* Rodapé fixo: as ações nunca saem da tela */}
      {rodape && (
        <div
          className={`flex shrink-0 flex-col-reverse gap-3 pb-7 sm:flex-row sm:justify-end sm:pb-8 ${lateral} ${direita} ${
            temCorpo ? "border-t border-rule pt-5" : "pt-7"
          }`}
        >
          {rodape}
        </div>
      )}
    </div>
  );

  if (estatico) return conteudo;
  if (!montado || !noCliente) return null;

  return (
    <>
      <span hidden ref={marcador} />
      {createPortal(
        // items-start + my-auto: centraliza quando cabe e rola sem cortar o topo quando não
        <div data-theme={tema} className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6">
          <div
            aria-hidden
            onClick={fecharAoClicarFora && !fecharDesativado ? aoFechar : undefined}
            className="fixed inset-0 bg-ink/50 backdrop-blur-[3px]"
            style={{ opacity: visivel ? 1 : 0, transition: transicao }}
          />
          {conteudo}
        </div>,
        document.body,
      )}
    </>
  );
}
