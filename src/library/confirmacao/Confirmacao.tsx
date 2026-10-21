"use client";

import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Modal } from "@/library/modal/Modal";

export type TomDaConfirmacao = "padrao" | "perigo";

export type OpcoesDeConfirmacao = {
  titulo: string;
  /** Explicação abaixo do título: o que acontece se confirmar. */
  mensagem?: ReactNode;
  /** Texto do botão de confirmar. Padrão: o do HospedeiroDeConfirmacao ("Confirmar"). */
  rotuloConfirmar?: string;
  /** Texto do botão de cancelar. Padrão: o do HospedeiroDeConfirmacao ("Cancelar"). */
  rotuloCancelar?: string;
  /** "perigo" para ações destrutivas: botão na cor crítica e foco começando em Cancelar. */
  tom?: TomDaConfirmacao;
};

type Pedido = OpcoesDeConfirmacao & { id: number; resolver: (ok: boolean) => void };

// Emissor no módulo: confirmar() pode ser chamado de qualquer lugar (um handler,
// uma função assíncrona) e o hospedeiro montado na árvore mostra o pedido
let proximoId = 1;
let atual: Pedido | null = null;
const ouvintes = new Set<() => void>();

function emitir(pedido: Pedido | null) {
  atual = pedido;
  for (const ouvinte of ouvintes) ouvinte();
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

function responder(id: number, ok: boolean) {
  if (!atual || atual.id !== id) return;
  atual.resolver(ok);
  emitir(null);
}

/**
 * Pede uma confirmação e espera a resposta: `true` se a pessoa confirmou,
 * `false` se cancelou (botão, Esc ou clique fora). Precisa de um
 * HospedeiroDeConfirmacao montado. Um pedido novo cancela o que estava aberto.
 *
 * ```ts
 * if (!(await confirmar({ titulo: "Excluir tarefa?", tom: "perigo" }))) return;
 * ```
 */
export function confirmar(opcoes: OpcoesDeConfirmacao): Promise<boolean> {
  return new Promise<boolean>((resolver) => {
    if (ouvintes.size === 0) {
      console.warn("confirmar(): nenhum HospedeiroDeConfirmacao montado; o pedido espera até um ser montado.");
    }
    // Sem fila de diálogos empilhados: o pedido anterior conta como cancelado
    atual?.resolver(false);
    emitir({ ...opcoes, id: proximoId++, resolver });
  });
}

const BOTAO =
  "inline-flex h-11 cursor-pointer items-center justify-center rounded-full px-6 text-sm font-medium outline-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

/**
 * A caixa de confirmação em si, controlada por estado: título, mensagem e os
 * botões Cancelar e Confirmar. É o que o HospedeiroDeConfirmacao mostra; use
 * direto quando preferir estado a `confirmar()`. Fechar é uma decisão, então
 * não há ×: Esc e clique fora contam como Cancelar.
 */
export function CaixaDeConfirmacao({
  aberto,
  aoResponder,
  titulo,
  mensagem,
  rotuloConfirmar = "Confirmar",
  rotuloCancelar = "Cancelar",
  tom = "padrao",
  estatico = false,
}: OpcoesDeConfirmacao & {
  aberto: boolean;
  /** Recebe `true` ao confirmar e `false` ao cancelar. */
  aoResponder: (ok: boolean) => void;
  /** Só o painel, parado no lugar (para documentação e miniaturas). */
  estatico?: boolean;
}) {
  const botaoConfirmar = useRef<HTMLButtonElement>(null);
  const botaoCancelar = useRef<HTMLButtonElement>(null);
  const perigo = tom === "perigo";

  return (
    <Modal
      aberto={aberto}
      aoFechar={() => aoResponder(false)}
      estatico={estatico}
      alerta
      mostrarFechar={false}
      // Em ação destrutiva o foco vai para Cancelar: um Enter por reflexo não apaga nada.
      // Nas comuns vai para Confirmar, e o Enter confirma.
      focoInicial={perigo ? botaoCancelar : botaoConfirmar}
      titulo={titulo}
      descricao={mensagem}
      icone={
        perigo ? (
          <span className="grid size-10 place-items-center rounded-full bg-critical/10 text-critical">
            <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 2.5 20h19L12 3z" />
              <path d="M12 10v4" />
              <path d="M12 17.5h.01" />
            </svg>
          </span>
        ) : undefined
      }
      rodape={
        <>
          <button
            ref={botaoCancelar}
            type="button"
            onClick={() => aoResponder(false)}
            className={`${BOTAO} border border-rule-strong text-ink hover:bg-surface`}
          >
            {rotuloCancelar}
          </button>
          <button
            ref={botaoConfirmar}
            type="button"
            onClick={() => aoResponder(true)}
            className={`${BOTAO} text-page ${perigo ? "bg-critical hover:bg-critical/90" : "bg-accent hover:bg-accent/90"}`}
          >
            {rotuloConfirmar}
          </button>
        </>
      }
    />
  );
}

/**
 * Mostra os pedidos de `confirmar()`. Monte um só, perto da raiz do app; os
 * textos padrão dos botões ficam aqui e cada pedido pode trocá-los.
 */
export function HospedeiroDeConfirmacao({
  rotuloConfirmar = "Confirmar",
  rotuloCancelar = "Cancelar",
}: {
  /** Texto padrão do botão de confirmar. */
  rotuloConfirmar?: string;
  /** Texto padrão do botão de cancelar. */
  rotuloCancelar?: string;
}) {
  const pedido = useSyncExternalStore(
    assinar,
    () => atual,
    () => null,
  );
  // Guarda o último pedido para o texto não sumir durante a animação de saída
  const [ultimo, setUltimo] = useState(pedido);
  if (pedido && pedido !== ultimo) setUltimo(pedido);

  if (!ultimo) return null;

  return (
    <CaixaDeConfirmacao
      key={ultimo.id}
      aberto={pedido !== null}
      aoResponder={(ok) => responder(ultimo.id, ok)}
      titulo={ultimo.titulo}
      mensagem={ultimo.mensagem}
      rotuloConfirmar={ultimo.rotuloConfirmar ?? rotuloConfirmar}
      rotuloCancelar={ultimo.rotuloCancelar ?? rotuloCancelar}
      tom={ultimo.tom}
    />
  );
}
