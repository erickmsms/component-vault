"use client";

import type { ReactNode } from "react";
import { enderecoSeguro } from "@/library/botao/enderecoSeguro";

// Ícones prontos. O do WhatsApp é preenchido (vem do original); os outros, de traço.
const ICONES = {
  whatsapp: (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-7" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.71-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.6c.12.17 1.77 2.71 4.3 3.8.6.26 1.07.42 1.44.53.6.2 1.15.17 1.58.1.48-.07 1.47-.6 1.68-1.19.21-.58.21-1.08.15-1.18-.06-.11-.23-.17-.47-.29Z" />
    </svg>
  ),
  mensagem: (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12Z" />
      <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" />
    </svg>
  ),
  telefone: (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </svg>
  ),
  topo: (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  ),
};

export type IconeDoBotao = keyof typeof ICONES;

const TONS = {
  destaque: "bg-accent text-page",
  sucesso: "bg-success text-page",
  contraste: "bg-ink text-page",
  superficie: "border border-rule bg-surface text-ink",
} as const;

export type TomDoBotao = keyof typeof TONS;

const POSICOES = {
  "inferior-direita": "fixed right-6 bottom-6 z-40",
  "inferior-esquerda": "fixed bottom-6 left-6 z-40",
} as const;

const ehIconePronto = (icone: unknown): icone is IconeDoBotao =>
  typeof icone === "string" && Object.hasOwn(ICONES, icone);

/**
 * Botão redondo flutuante, preso a um canto da tela: atalho para o WhatsApp,
 * um chat, uma ligação ou voltar ao topo. Vira <a> com `href` e <button> com
 * `aoClicar`. Só ícone, então o `rotulo` é obrigatório (é o nome acessível).
 */
export function BotaoFlutuante({
  rotulo,
  href,
  aoClicar,
  novaAba,
  icone = "whatsapp",
  tom = "destaque",
  posicao = "inferior-direita",
  fixo = true,
}: {
  /** Nome acessível do botão (aria-label) e dica ao passar o mouse. */
  rotulo: string;
  /** Destino do link. Sem ele, o componente vira um <button>. */
  href?: string;
  aoClicar?: () => void;
  /** Abre o link em nova aba. Padrão: sim para links http(s) externos. */
  novaAba?: boolean;
  /** Ícone pronto ("whatsapp", "mensagem", "telefone", "topo") ou um ícone próprio (ReactNode). */
  icone?: IconeDoBotao | ReactNode;
  /** Cor do botão: "destaque", "sucesso" (verde, bom para WhatsApp), "contraste" ou "superficie". */
  tom?: TomDoBotao;
  /** Canto da tela em que o botão fica (com `fixo`). */
  posicao?: keyof typeof POSICOES;
  /** Preso ao canto da tela. Com `false`, fica no fluxo normal da página. */
  fixo?: boolean;
}) {
  const classes = `grid size-14 shrink-0 cursor-pointer place-items-center rounded-full shadow-flutuante outline-accent transition-transform focus-visible:outline-2 focus-visible:outline-offset-4 motion-safe:hover:scale-105 ${
    TONS[tom]
  } ${fixo ? POSICOES[posicao] : "relative"}`;
  const conteudo = ehIconePronto(icone) ? ICONES[icone] : icone;

  if (href) {
    const abrirEmNovaAba = novaAba ?? /^https?:\/\//.test(href);
    return (
      <a
        href={enderecoSeguro(href)}
        onClick={aoClicar}
        aria-label={rotulo}
        title={rotulo}
        className={classes}
        {...(abrirEmNovaAba ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {conteudo}
      </a>
    );
  }

  return (
    <button type="button" onClick={aoClicar} aria-label={rotulo} title={rotulo} className={classes}>
      {conteudo}
    </button>
  );
}
