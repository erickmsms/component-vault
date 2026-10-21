"use client";

import { useState } from "react";

/**
 * Iniciais de um nome: primeira e última palavra ("Ana Paula Souza" → "AS"); com
 * uma palavra só, as duas primeiras letras ("Marketing" → "MA").
 */
export function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

/** Uma das 8 cores de série do tema, sempre a mesma para o mesmo nome. */
export function corDoNome(nome: string) {
  let hash = 0;
  for (const letra of nome.trim().toLowerCase()) hash = (hash * 31 + letra.charCodeAt(0)) | 0;
  return `var(--series-${(Math.abs(hash) % 8) + 1})`;
}

const TAMANHOS = {
  xs: { caixa: "size-6 text-xs", ponto: "size-2", sobrepor: "-ml-1.5" },
  sm: { caixa: "size-8 text-xs", ponto: "size-2.5", sobrepor: "-ml-2" },
  md: { caixa: "size-10 text-sm", ponto: "size-3", sobrepor: "-ml-2.5" },
  lg: { caixa: "size-14 text-lg", ponto: "size-3.5", sobrepor: "-ml-3.5" },
  xl: { caixa: "size-20 text-2xl", ponto: "size-4", sobrepor: "-ml-5" },
} as const;

const STATUS = {
  online: { cor: "bg-success", rotulo: "online" },
  ausente: { cor: "bg-warning", rotulo: "ausente" },
  ocupado: { cor: "bg-critical", rotulo: "ocupado" },
  offline: { cor: "bg-muted", rotulo: "offline" },
} as const;

export type TamanhoDeAvatar = keyof typeof TAMANHOS;
export type StatusDoAvatar = keyof typeof STATUS;

/**
 * Foto de uma pessoa ou, sem foto (ou se ela não carregar), as iniciais sobre uma
 * cor tirada do nome, para a mesma pessoa ter sempre a mesma cor. Ponto de status
 * opcional no canto.
 */
export function Avatar({
  nome,
  imagem,
  tamanho = "md",
  status,
  rotuloDoStatus,
  cor,
  decorativo = false,
  className = "",
}: {
  /** Nome da pessoa: vira as iniciais, a cor e o nome para leitores de tela. */
  nome: string;
  /** Endereço da foto. */
  imagem?: string;
  tamanho?: TamanhoDeAvatar;
  /** Ponto de status no canto inferior direito. */
  status?: StatusDoAvatar;
  /** Texto do status para leitores de tela (padrão: "online", "ausente", "ocupado", "offline"). */
  rotuloDoStatus?: string;
  /** Cor de fundo das iniciais, no lugar da tirada do nome (`var(--series-2)`, `var(--accent)`). */
  cor?: string;
  /** Esconde dos leitores de tela, quando o nome já aparece escrito ao lado. */
  decorativo?: boolean;
  className?: string;
}) {
  // Guarda QUAL endereço falhou: se a foto mudar, tenta de novo sem precisar de efeito.
  const [falhou, setFalhou] = useState<string | null>(null);
  const t = TAMANHOS[tamanho];
  const comFoto = imagem && falhou !== imagem;
  const textoDoStatus = status ? (rotuloDoStatus ?? STATUS[status].rotulo) : null;
  const nomeAcessivel = textoDoStatus ? `${nome} (${textoDoStatus})` : nome;

  return (
    <span
      role={decorativo ? undefined : "img"}
      aria-label={decorativo ? undefined : nomeAcessivel}
      aria-hidden={decorativo || undefined}
      title={nome}
      className={`relative inline-flex shrink-0 rounded-full ${t.caixa} ${className}`}
    >
      {comFoto ? (
        // <img> comum para funcionar em qualquer projeto React (sem next/image).
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imagem}
          alt=""
          onError={() => setFalhou(imagem)}
          className="size-full rounded-full bg-surface object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          style={{ backgroundColor: cor ?? corDoNome(nome) }}
          className="flex size-full items-center justify-center rounded-full leading-none font-semibold tracking-wide text-page select-none"
        >
          {iniciais(nome)}
        </span>
      )}
      {status && (
        <span
          aria-hidden="true"
          className={`absolute right-0 bottom-0 rounded-full ring-2 ring-page ${t.ponto} ${STATUS[status].cor}`}
        />
      )}
    </span>
  );
}

/**
 * Avatares sobrepostos (os responsáveis de uma tarefa, quem está online): mostra
 * até `maximo` e resume o resto em "+N", com os nomes que sobraram ao passar o mouse.
 */
export function GrupoDeAvatares({
  pessoas,
  maximo = 4,
  tamanho = "sm",
  rotulo,
  rotuloDoExcedente = (n) => `e mais ${n}`,
}: {
  pessoas: ReadonlyArray<{ nome: string; imagem?: string }>;
  /** Quantos avatares aparecem antes do "+N". */
  maximo?: number;
  tamanho?: TamanhoDeAvatar;
  /** Nome do grupo para leitores de tela ("Responsáveis"). */
  rotulo?: string;
  /** Texto do "+N" para leitores de tela. */
  rotuloDoExcedente?: (quantidade: number) => string;
}) {
  // Com um só a mais, cabe o avatar dele no lugar do "+1".
  const visiveis = pessoas.length <= maximo + 1 ? pessoas : pessoas.slice(0, maximo);
  const resto = pessoas.slice(visiveis.length);
  const t = TAMANHOS[tamanho];

  return (
    <div role="group" aria-label={rotulo} className="flex items-center">
      {visiveis.map((p, i) => (
        <Avatar
          key={`${p.nome}-${i}`}
          nome={p.nome}
          imagem={p.imagem}
          tamanho={tamanho}
          className={`ring-2 ring-page ${i > 0 ? t.sobrepor : ""}`}
        />
      ))}
      {resto.length > 0 && (
        <span
          role="img"
          aria-label={rotuloDoExcedente(resto.length)}
          title={resto.map((p) => p.nome).join(", ")}
          className={`${t.sobrepor} inline-flex shrink-0 items-center justify-center rounded-full bg-surface font-medium text-ink-2 ring-2 ring-page ${t.caixa}`}
        >
          <span aria-hidden="true">+{resto.length}</span>
        </span>
      )}
    </div>
  );
}
