"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Botao, type BotaoProps } from "@/library/botao/Botao";
import { CURVA_SUAVE, useSemMovimento } from "@/library/revelar/Movimento";

const STATUS = {
  info: { cor: "bg-accent/10 text-accent", icone: "info" },
  sucesso: { cor: "bg-success/10 text-success", icone: "ok" },
  alerta: { cor: "bg-warning/10 text-warning", icone: "triangulo" },
  perigo: { cor: "bg-critical/10 text-critical", icone: "triangulo" },
} as const;

const TAMANHOS = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-xl",
  xl: "sm:max-w-3xl",
} as const;

const FUNDOS = {
  escuro: "bg-ink/50",
  desfoque: "bg-ink/25 backdrop-blur-sm",
  transparente: "bg-transparent",
} as const;

// "auto": encosta embaixo no celular (como uma folha) e centraliza a partir do sm
const POSICOES = {
  auto: "items-end sm:items-center",
  centro: "items-center",
  topo: "items-start",
  base: "items-end",
} as const;

export type StatusDoDialogo = keyof typeof STATUS;
export type TamanhoDoDialogo = keyof typeof TAMANHOS;
export type FundoDoDialogo = keyof typeof FUNDOS;
export type PosicaoDoDialogo = keyof typeof POSICOES;

/**
 * Arredondamento concêntrico, de dentro para fora: o raio dos botões é o do tema (`--radius-lg`),
 * limitado à metade da altura deles (h-10), e o painel é esse raio mais a folga de 3 unidades até a
 * borda. Calculado ao contrário (painel fixo menos a folga), um tema bem arredondado pedia um raio
 * maior que o botão comporta, e o canto dele escapava da curva do painel.
 */
const RAIOS =
  "[--raio-do-botao:min(var(--radius-lg),var(--spacing)*5)] rounded-[calc(min(var(--radius-lg),var(--spacing)*5)_+_var(--spacing)*3)]";
const DURACAO = 220;

type Contexto = { fechar: () => void };
const ContextoDoDialogo = createContext<Contexto>({ fechar: () => {} });

/** Fecha o diálogo de dentro dele (útil depois de uma ação assíncrona). */
export function useDialogo() {
  return useContext(ContextoDoDialogo);
}

export type BotaoDoDialogoProps = BotaoProps & {
  /** Fecha o diálogo depois do clique (cancelar, confirmar sem espera). */
  fecha?: boolean;
};

/**
 * O `Botao` da biblioteca com `fecha`, que fecha o diálogo depois do clique, e largura total no
 * celular. O raio concêntrico vem do painel, então um `Botao` comum dentro dele também acerta.
 */
export function BotaoDoDialogo({ fecha = false, onClick, className = "", ...resto }: BotaoDoDialogoProps) {
  const { fechar } = useDialogo();
  return (
    <Botao
      {...resto}
      className={`w-full sm:w-auto ${className}`}
      onClick={(e) => {
        onClick?.(e);
        if (fecha && !e.defaultPrevented) fechar();
      }}
    />
  );
}

function IconeDeStatus({ status }: { status: StatusDoDialogo }) {
  const icone = STATUS[status].icone;
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {icone === "triangulo" && (
        <>
          <path d="M12 3 2.5 20h19L12 3z" />
          <path d="M12 10v4" />
          <path d="M12 17.5h.01" />
        </>
      )}
      {icone === "info" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5" />
          <path d="M12 7.5h.01" />
        </>
      )}
      {icone === "ok" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12.5 2.5 2.5L16 9.5" />
        </>
      )}
    </svg>
  );
}

export type DialogoProps = {
  /** Título, sempre visível no topo. */
  titulo: ReactNode;
  /** Linha de apoio abaixo do título, também fixa. */
  descricao?: ReactNode;
  /** Conteúdo do meio: é a única parte que rola quando o diálogo fica comprido. */
  children?: ReactNode;
  /** Botões do rodapé, sempre visíveis (use `BotaoDoDialogo`). Ficam em linha à direita no desktop e empilhados no celular, com o último (a ação principal) em cima. */
  acoes?: ReactNode;
  /** Mostra um ícone de status ao lado do título. */
  status?: StatusDoDialogo;
  /** Ícone próprio no lugar do ícone de status (mantém a cor do status). */
  icone?: ReactNode;
  /** Elemento que abre o diálogo (um botão). Também aceita uma função que recebe `abrir`. */
  gatilho?: ReactNode | ((abrir: () => void) => ReactNode);
  /** Estado controlado. Use junto com `aoMudar`. */
  aberto?: boolean;
  /** Estado inicial quando não é controlado. */
  abertoNoInicio?: boolean;
  aoMudar?: (aberto: boolean) => void;
  tamanho?: TamanhoDoDialogo;
  posicao?: PosicaoDoDialogo;
  fundo?: FundoDoDialogo;
  /**
   * Confirmação que exige uma escolha explícita (`role="alertdialog"`): por padrão não fecha
   * clicando fora nem com Esc, e o foco começa no último botão do rodapé.
   */
  alerta?: boolean;
  /** Fecha ao clicar no fundo. Padrão: verdadeiro, ou falso com `alerta`. */
  fecharAoClicarFora?: boolean;
  /** Fecha com Esc. Padrão: verdadeiro, ou falso com `alerta`. */
  fecharComEsc?: boolean;
  /** Mostra o X no canto. */
  botaoFechar?: boolean;
  /** Rótulo do X para leitores de tela. */
  rotuloFechar?: string;
  /** Mostra o painel no lugar, sem fundo nem sobreposição (para documentação e miniaturas). */
  incorporado?: boolean;
};

/**
 * Diálogo modal sobre `<dialog>` nativo: prende o foco, deixa o resto da página inerte e devolve
 * o foco ao gatilho. Título e ações ficam fixos; só o meio rola, com uma linha que aparece
 * quando há conteúdo escondido acima ou abaixo. Com `alerta`, vira confirmação obrigatória.
 */
export function Dialogo({
  titulo,
  descricao,
  children,
  acoes,
  status,
  icone,
  gatilho,
  aberto: abertoControlado,
  abertoNoInicio = false,
  aoMudar,
  tamanho = "md",
  posicao = "auto",
  fundo = "escuro",
  alerta = false,
  fecharAoClicarFora = !alerta,
  fecharComEsc = !alerta,
  botaoFechar = !alerta,
  rotuloFechar = "Fechar",
  incorporado = false,
}: DialogoProps) {
  const semMovimento = useSemMovimento();
  const [abertoInterno, setAbertoInterno] = useState(abertoNoInicio);
  const aberto = abertoControlado ?? abertoInterno;
  const dialogo = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();
  const idDescricao = useId();

  const mudar = useCallback(
    (valor: boolean) => {
      if (abertoControlado === undefined) setAbertoInterno(valor);
      aoMudar?.(valor);
    },
    [abertoControlado, aoMudar],
  );
  const abrir = useCallback(() => mudar(true), [mudar]);
  const fechar = useCallback(() => mudar(false), [mudar]);

  useLayoutEffect(() => {
    const el = dialogo.current;
    if (incorporado || !el) return;
    if (aberto && !el.open) {
      el.showModal();
      if (alerta) el.querySelector<HTMLElement>("[data-acoes] button:last-of-type")?.focus();
      // data-visivel controla a animação; o <dialog> só fecha de verdade quando ela termina
      if (semMovimento) el.dataset.visivel = "true";
      else requestAnimationFrame(() => requestAnimationFrame(() => (el.dataset.visivel = "true")));
    } else if (!aberto && el.open) {
      el.dataset.visivel = "false";
      const t = setTimeout(() => el.close(), semMovimento ? 0 : DURACAO);
      return () => clearTimeout(t);
    }
  }, [aberto, alerta, incorporado, semMovimento]);

  // Trava a rolagem da página enquanto está aberto
  useEffect(() => {
    if (incorporado || !aberto) return;
    const raiz = document.documentElement;
    const antes = raiz.style.overflow;
    raiz.style.overflow = "hidden";
    return () => {
      raiz.style.overflow = antes;
    };
  }, [aberto, incorporado]);

  const painel = (
    <Painel
      titulo={titulo}
      descricao={descricao}
      acoes={acoes}
      status={status}
      icone={icone}
      tamanho={tamanho}
      botaoFechar={botaoFechar}
      rotuloFechar={rotuloFechar}
      idTitulo={idTitulo}
      idDescricao={idDescricao}
      incorporado={incorporado}
      role={alerta ? "alertdialog" : undefined}
    >
      {children}
    </Painel>
  );

  const disparador =
    typeof gatilho === "function" ? (
      gatilho(abrir)
    ) : gatilho ? (
      // O clique (ou Enter/Espaço) no botão de dentro sobe até aqui
      <span className="contents" onClick={abrir}>
        {gatilho}
      </span>
    ) : null;

  if (incorporado) {
    return (
      <ContextoDoDialogo.Provider value={{ fechar: () => {} }}>
        <div className="flex w-full justify-center">{painel}</div>
      </ContextoDoDialogo.Provider>
    );
  }

  return (
    <ContextoDoDialogo.Provider value={{ fechar }}>
      {disparador}
      <dialog
        ref={dialogo}
        role={alerta ? "alertdialog" : undefined}
        aria-labelledby={idTitulo}
        aria-describedby={descricao ? idDescricao : undefined}
        aria-modal="true"
        onCancel={(e) => {
          // Esc: o próprio componente decide se fecha, para animar a saída
          e.preventDefault();
          if (fecharComEsc) fechar();
        }}
        className={`fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 text-ink outline-none backdrop:bg-transparent open:flex group ${POSICOES[posicao]} justify-center`}
      >
        <div
          aria-hidden="true"
          onClick={fecharAoClicarFora ? fechar : undefined}
          className={`absolute inset-0 transition-opacity ${FUNDOS[fundo]} opacity-0 group-data-[visivel=true]:opacity-100`}
          style={{ transitionDuration: `${DURACAO}ms` }}
        />
        <div
          className={`relative flex max-h-full w-full justify-center p-3 transition-[opacity,translate,scale] sm:p-6 translate-y-4 scale-[0.97] opacity-0 group-data-[visivel=true]:translate-y-0 group-data-[visivel=true]:scale-100 group-data-[visivel=true]:opacity-100`}
          style={{ transitionDuration: `${DURACAO}ms`, transitionTimingFunction: CURVA_SUAVE }}
        >
          {painel}
        </div>
      </dialog>
    </ContextoDoDialogo.Provider>
  );
}

function Painel({
  titulo,
  descricao,
  acoes,
  status,
  icone,
  tamanho,
  botaoFechar,
  rotuloFechar,
  idTitulo,
  idDescricao,
  incorporado,
  role,
  children,
}: Pick<DialogoProps, "titulo" | "descricao" | "acoes" | "status" | "icone" | "botaoFechar" | "rotuloFechar" | "children"> & {
  tamanho: TamanhoDoDialogo;
  idTitulo: string;
  idDescricao: string;
  incorporado: boolean;
  role?: string;
}) {
  const { fechar } = useDialogo();
  const corpo = useRef<HTMLDivElement>(null);
  // Linhas de divisão só quando há conteúdo escondido daquele lado
  const [sombra, setSombra] = useState({ topo: false, base: false });

  const medir = useCallback(() => {
    const el = corpo.current;
    if (!el) return;
    const topo = el.scrollTop > 1;
    const base = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
    setSombra((s) => (s.topo === topo && s.base === base ? s : { topo, base }));
  }, []);

  useEffect(() => {
    const el = corpo.current;
    if (!el) return;
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    if (el.firstElementChild) observador.observe(el.firstElementChild);
    return () => observador.disconnect();
  }, [medir]);

  const temIcone = Boolean(status || icone);

  return (
    <section
      role={incorporado ? role : undefined}
      aria-labelledby={incorporado ? idTitulo : undefined}
      className={`relative flex max-h-full w-full flex-col overflow-hidden border border-rule bg-page text-ink shadow-flutuante ${RAIOS} ${TAMANHOS[tamanho]}`}
    >
      <header
        className={`flex shrink-0 items-start gap-3 border-b px-5 pt-5 pb-4 transition-colors sm:px-6 sm:pt-6 ${
          sombra.topo ? "border-rule" : "border-transparent"
        } ${botaoFechar ? "pr-14 sm:pr-14" : ""}`}
      >
        {temIcone && (
          <span
            className={`grid size-10 shrink-0 place-items-center rounded-[max(var(--radius-sm),calc(var(--radius-lg)_-_var(--spacing)*2))] [&_svg]:size-5 ${
              STATUS[status ?? "info"].cor
            }`}
          >
            {icone ?? (status && <IconeDeStatus status={status} />)}
          </span>
        )}
        <div className={`min-w-0 flex-1 ${temIcone ? "pt-1.5" : ""}`}>
          <h2 id={idTitulo} className="font-display text-lg leading-snug font-semibold text-balance">
            {titulo}
          </h2>
          {descricao && (
            <p id={idDescricao} className="mt-1 text-sm text-pretty text-ink-2">
              {descricao}
            </p>
          )}
        </div>
      </header>

      {botaoFechar && (
        <Botao variante="fantasma" tamanho="sm" soIcone aria-label={rotuloFechar} onClick={fechar} className="absolute top-3 right-3">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </Botao>
      )}

      {children !== undefined && (
        <div
          ref={corpo}
          onScroll={medir}
          // Focável para rolar pelo teclado quando o conteúdo passa da altura
          tabIndex={sombra.topo || sombra.base ? 0 : undefined}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 text-sm leading-relaxed text-ink-2 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset sm:px-6"
        >
          <div className="pb-2">{children}</div>
        </div>
      )}

      {acoes && (
        <footer
          data-acoes
          className={`flex shrink-0 flex-col-reverse gap-2 border-t p-3 transition-colors sm:flex-row sm:justify-end ${
            sombra.base ? "border-rule bg-surface" : "border-transparent"
          }`}
        >
          {acoes}
        </footer>
      )}
      {!acoes && <div className="h-3 shrink-0" />}
    </section>
  );
}
