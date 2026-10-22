"use client";

import { Botao } from "@/library/botao/Botao";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { useSemMovimento } from "@/library/revelar/Movimento";

export type TipoDeNotificacao = "sucesso" | "erro" | "aviso" | "info";

export type OpcoesDeNotificacao = {
  /** Cor, ícone e prioridade do anúncio (padrão: "info"). Erros são anunciados na hora (aria-live assertive). */
  tipo?: TipoDeNotificacao;
  titulo: string;
  descricao?: string;
  /** Tempo (ms) até sumir sozinha; 0 deixa fixa até alguém fechar. Padrão: 5000. */
  duracao?: number;
  /** Botão dentro da notificação ("Desfazer", "Ver"); fecha a notificação depois de rodar. */
  acao?: { rotulo: string; aoClicar: () => void };
  /** Repetir um id substitui a notificação que já está na tela (ex.: "Salvando..." vira "Salvo"). */
  id?: string;
};

type NotificacaoAtiva = OpcoesDeNotificacao & {
  id: string;
  tipo: TipoDeNotificacao;
  duracao: number;
  saindo: boolean;
};

const DURACAO_PADRAO = 5000;
/** Tempo da transição de saída antes de a notificação sair da lista. */
const DURACAO_SAIDA = 200;

// ─── Emissor no nível do módulo ────────────────────────────────────────────────
// `notificar()` pode ser chamado de qualquer lugar (inclusive fora de componentes);
// o HospedeiroDeNotificacoes assina a lista. Os prazos também ficam aqui, para as
// notificações sumirem mesmo sem nenhum hospedeiro montado.

let lista: NotificacaoAtiva[] = [];
const VAZIA: NotificacaoAtiva[] = [];
const ouvintes = new Set<() => void>();
const prazos = new Map<string, { espera?: number; restante: number; inicio: number }>();
let pausas = 0;
let proximoId = 1;

function publicar(nova: NotificacaoAtiva[]) {
  lista = nova;
  for (const ouvinte of ouvintes) ouvinte();
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

const lerLista = () => lista;
const lerVazia = () => VAZIA;

function cancelarPrazo(id: string) {
  const prazo = prazos.get(id);
  if (prazo?.espera !== undefined) window.clearTimeout(prazo.espera);
  prazos.delete(id);
}

function agendar(id: string, ms: number) {
  prazos.set(id, {
    restante: ms,
    inicio: Date.now(),
    espera: pausas > 0 ? undefined : window.setTimeout(() => fecharNotificacao(id), ms),
  });
}

/** Congela os prazos (mouse ou foco sobre as notificações). Cada chamada pede um `retomar`. */
function pausar() {
  pausas += 1;
  if (pausas > 1) return;
  for (const prazo of prazos.values()) {
    if (prazo.espera === undefined) continue;
    window.clearTimeout(prazo.espera);
    prazo.espera = undefined;
    prazo.restante -= Date.now() - prazo.inicio;
  }
}

function retomar() {
  pausas = Math.max(0, pausas - 1);
  if (pausas > 0) return;
  for (const [id, prazo] of prazos) {
    prazo.inicio = Date.now();
    prazo.espera = window.setTimeout(() => fecharNotificacao(id), Math.max(prazo.restante, 0));
  }
}

/**
 * Mostra uma notificação em todo HospedeiroDeNotificacoes montado e devolve o id
 * dela (para fechar ou substituir depois). Atalhos: `notificar.sucesso`, `.erro`,
 * `.aviso` e `.info`, que recebem o título e as demais opções.
 */
export function notificar(opcoes: OpcoesDeNotificacao): string {
  const id = opcoes.id ?? `notificacao-${proximoId++}`;
  const nova: NotificacaoAtiva = {
    ...opcoes,
    id,
    tipo: opcoes.tipo ?? "info",
    duracao: opcoes.duracao ?? DURACAO_PADRAO,
    saindo: false,
  };
  cancelarPrazo(id);
  const existe = lista.some((n) => n.id === id);
  publicar(existe ? lista.map((n) => (n.id === id ? nova : n)) : [...lista, nova]);
  if (nova.duracao > 0) agendar(id, nova.duracao);
  return id;
}

type Atalho = (titulo: string, opcoes?: Omit<OpcoesDeNotificacao, "tipo" | "titulo">) => string;
const atalho =
  (tipo: TipoDeNotificacao): Atalho =>
  (titulo, opcoes) =>
    notificar({ ...opcoes, titulo, tipo });

notificar.sucesso = atalho("sucesso");
notificar.erro = atalho("erro");
notificar.aviso = atalho("aviso");
notificar.info = atalho("info");

/** Fecha a notificação com esse id, ou todas quando chamada sem id. */
export function fecharNotificacao(id?: string) {
  const alvos = new Set(lista.filter((n) => !n.saindo && (id === undefined || n.id === id)).map((n) => n.id));
  if (alvos.size === 0) return;
  for (const alvo of alvos) cancelarPrazo(alvo);
  publicar(lista.map((n) => (alvos.has(n.id) ? { ...n, saindo: true } : n)));
  // Sai da lista depois da transição; se o mesmo id foi notificado de novo nesse meio-tempo, a nova fica
  window.setTimeout(() => publicar(lista.filter((n) => !(alvos.has(n.id) && n.saindo))), DURACAO_SAIDA);
}

// ─── Visual ────────────────────────────────────────────────────────────────────

const ESTILO = {
  sucesso: { cor: "text-success", borda: "border-l-success" },
  erro: { cor: "text-critical", borda: "border-l-critical" },
  aviso: { cor: "text-warning", borda: "border-l-warning" },
  info: { cor: "text-accent", borda: "border-l-accent" },
} as const;

function Icone({ tipo, className }: { tipo: TipoDeNotificacao; className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {tipo === "aviso" ? (
        <>
          <path d="M12 3 2.5 20h19L12 3z" />
          <path d="M12 10v4" />
          <path d="M12 17.5h.01" />
        </>
      ) : (
        <circle cx="12" cy="12" r="9" />
      )}
      {tipo === "sucesso" && <path d="m8 12.5 2.5 2.5L16 9.5" />}
      {tipo === "erro" && <path d="m9 9 6 6m0-6-6 6" />}
      {tipo === "info" && (
        <>
          <path d="M12 11v5" />
          <path d="M12 7.5h.01" />
        </>
      )}
    </svg>
  );
}

/**
 * Uma notificação, só o visual: ícone e borda na cor do tipo, título, descrição,
 * ação e botão de fechar. O HospedeiroDeNotificacoes usa este cartão; use-o direto
 * para mostrar exemplos parados.
 */
export function Notificacao({
  tipo = "info",
  titulo,
  descricao,
  acao,
  aoFechar,
  rotuloFechar = "Fechar notificação",
}: {
  tipo?: TipoDeNotificacao;
  titulo: string;
  descricao?: string;
  acao?: { rotulo: string; aoClicar: () => void };
  /** Sem esta função, o botão de fechar não aparece. */
  aoFechar?: () => void;
  /** Nome do botão × para leitores de tela. */
  rotuloFechar?: string;
}) {
  const estilo = ESTILO[tipo];
  return (
    <div
      className={`flex w-full items-start gap-3 rounded-lg border border-l-4 border-rule ${estilo.borda} bg-page p-3.5 [--raio-do-botao:max(var(--radius-sm),calc(var(--radius-lg)_-_var(--spacing)*3.5))] text-sm text-ink shadow-flutuante`}
    >
      <Icone tipo={tipo} className={`mt-px size-5 shrink-0 ${estilo.cor}`} />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{titulo}</p>
        {descricao && <p className="mt-0.5 text-xs text-ink-2">{descricao}</p>}
        {acao && (
          <Botao tamanho="sm" onClick={acao.aoClicar} className="mt-2.5">
            {acao.rotulo}
          </Botao>
        )}
      </div>
      {aoFechar && (
        <Botao variante="discreto" tamanho="xs" soIcone onClick={aoFechar} aria-label={rotuloFechar} className="-mt-0.5 -mr-0.5">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </Botao>
      )}
    </div>
  );
}

// ─── Hospedeiro ────────────────────────────────────────────────────────────────

export type PosicaoDasNotificacoes =
  | "superior-esquerda"
  | "superior-centro"
  | "superior-direita"
  | "inferior-esquerda"
  | "inferior-centro"
  | "inferior-direita";

const POSICOES: Record<PosicaoDasNotificacoes, string> = {
  "superior-esquerda": "top-0 left-0 items-start",
  "superior-centro": "top-0 left-1/2 -translate-x-1/2 items-center",
  "superior-direita": "top-0 right-0 items-end",
  "inferior-esquerda": "bottom-0 left-0 items-start",
  "inferior-centro": "bottom-0 left-1/2 -translate-x-1/2 items-center",
  "inferior-direita": "bottom-0 right-0 items-end",
};

/**
 * Onde as notificações de `notificar()` aparecem: renderize uma vez (no layout).
 * Empilha as mais recentes junto à borda, pausa os prazos com o mouse ou o foco
 * em cima, anuncia erros na hora e as demais com educação (aria-live). Com
 * "reduzir movimento", entram e saem sem transição.
 */
export function HospedeiroDeNotificacoes({
  posicao = "inferior-direita",
  contido = false,
  maximo = 4,
  rotulo = "Notificações",
  rotuloFechar = "Fechar notificação",
}: {
  posicao?: PosicaoDasNotificacoes;
  /** Posição absoluta dentro do ancestral com `relative`, em vez de fixa na janela. */
  contido?: boolean;
  /** Quantas ficam visíveis ao mesmo tempo; as mais antigas esperam escondidas. */
  maximo?: number;
  /** Nome da região para leitores de tela. */
  rotulo?: string;
  rotuloFechar?: string;
}) {
  const notificacoes = useSyncExternalStore(assinar, lerLista, lerVazia);
  const semMovimento = useSemMovimento();
  const noTopo = posicao.startsWith("superior");

  // Sem transição, quem está saindo some na hora
  const visiveis = (semMovimento ? notificacoes.filter((n) => !n.saindo) : notificacoes).slice(-maximo);
  // A mais recente fica junto à borda: embaixo nas posições inferiores, em cima nas superiores
  const emOrdem = noTopo ? [...visiveis].reverse() : visiveis;

  // Mouse e foco pausam os prazos por motivos independentes; ao desmontar, devolve o que segurava
  const segurando = useRef({ mouse: false, foco: false });
  const segurar = (motivo: "mouse" | "foco", sim: boolean) => {
    const estado = segurando.current;
    if (estado[motivo] === sim) return;
    estado[motivo] = sim;
    if (sim) pausar();
    else retomar();
  };
  useEffect(() => {
    const estado = segurando.current;
    return () => {
      if (estado.mouse) retomar();
      if (estado.foco) retomar();
      estado.mouse = false;
      estado.foco = false;
    };
  }, []);

  const deslocamento = noTopo ? "-translate-y-3" : "translate-y-3";
  const transicao = semMovimento
    ? ""
    : `transition-[opacity,translate] duration-200 ease-out starting:opacity-0 ${noTopo ? "starting:-translate-y-3" : "starting:translate-y-3"}`;

  return (
    <section
      aria-label={rotulo}
      aria-live="polite"
      aria-relevant="additions text"
      className={`${contido ? "absolute" : "fixed"} pointer-events-none z-50 flex w-full max-w-sm flex-col p-4 ${POSICOES[posicao]}`}
    >
      {/* A lista recebe o mouse (os vãos entre as notificações não retomam o prazo); a região em volta não */}
      <ol
        className="pointer-events-auto flex w-full flex-col gap-2"
        onMouseEnter={() => segurar("mouse", true)}
        onMouseLeave={() => segurar("mouse", false)}
        onFocus={() => segurar("foco", true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) segurar("foco", false);
        }}
      >
        {emOrdem.map((n) => (
          <li
            key={n.id}
            role={n.tipo === "erro" ? "alert" : "status"}
            aria-live={n.tipo === "erro" ? "assertive" : "polite"}
            aria-atomic="true"
            className={`${transicao} ${n.saindo ? `opacity-0 ${deslocamento}` : ""}`}
          >
            <Notificacao
              tipo={n.tipo}
              titulo={n.titulo}
              descricao={n.descricao}
              rotuloFechar={rotuloFechar}
              aoFechar={() => fecharNotificacao(n.id)}
              acao={
                n.acao && {
                  rotulo: n.acao.rotulo,
                  aoClicar: () => {
                    n.acao?.aoClicar();
                    fecharNotificacao(n.id);
                  },
                }
              }
            />
          </li>
        ))}
      </ol>
    </section>
  );
}
